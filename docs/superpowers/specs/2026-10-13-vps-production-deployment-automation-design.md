# Spesifikasi Desain: Otomatisasi Setup VPS dan Template Deployment Produksi

- **Tanggal Dokumen:** 2026-10-13
- **Terkait Issue:** [#166](https://github.com/ramanovaris/profile-ifk/issues/166)
- **Status:** Approved by User (Ready for Plan & Implementation)
- **Target Rilis:** Branch `feat/166-setup-vps-production` -> `develop`

---

## 1. Latar Belakang & Tujuan

Aplikasi Website Profil & Logistik Farmasi UPTD IFK Kotabaru telah mencapai rilis stabil v1.0.0. Untuk menempatkan aplikasi pada server produksi (VPS publik seperti DigitalOcean, Linode, Biznet Gio, IDCloudHost, atau Tencent Cloud), diperlukan standarisasi lingkungan (*environment provisioning*) yang dapat dieksekusi secara instan, aman, dan tanpa konfigurasi manual yang rawan kesalahan (*human error*).

Tujuan implementasi ini:
1. Menyediakan skrip instalasi dan provisioning mandiri (`deploy/setup-vps.sh`) yang mengonfigurasi seluruh dependensi server Ubuntu (Node.js 20 LTS, PostgreSQL, Nginx, PM2, UFW, dan Certbot SSL) dalam satu kali eksekusi (*one-click automation*).
2. Menyediakan berkas konfigurasi proses PM2 (`deploy/ecosystem.config.cjs`) yang dioptimalkan untuk mode Next.js `standalone` (konsumsi memori rendah <120MB RAM, *graceful reload*, dan auto-restart).
3. Menyediakan template virtual host Nginx (`deploy/nginx-profile-ifk.conf`) lengkap dengan reverse proxy, kompresi Gzip, caching aset statis (`/_next/static/`), batasan unggahan berkas (15MB), dan header keamanan HTTP.
4. Menyediakan panduan operasional langkah demi langkah (`deploy/README.md`) untuk deployment awal di VPS baru serta prosedur pembaharuan rilis (*rolling update*).
5. Mengintegrasikan skrip pencadangan berkala (`scripts/backup-db.sh`) ke dalam cron server produksi secara otomatis saat provisioning.
6. Menyediakan skrip verifikasi mandiri (`scripts/verify-setup-vps.ts`) guna memastikan seluruh berkas konfigurasi, sintaks skrip bash, dan variabel lingkungan valid sebelum dijalankan.

---

## 2. Arsitektur Teknis & Struktur Berkas

### A. Struktur Berkas Baru

```
projects/profile-ifk/
├── deploy/
│   ├── ecosystem.config.cjs       # Konfigurasi proses runtime PM2 standalone Next.js
│   ├── nginx-profile-ifk.conf     # Template reverse proxy Nginx untuk domain produksi
│   ├── setup-vps.sh               # Skrip bash otomatisasi instalasi & konfigurasi VPS Ubuntu
│   └── README.md                  # Panduan operasional deployment VPS & update aplikasi
├── docs/superpowers/
│   ├── specs/2026-10-13-vps-production-deployment-automation-design.md
│   └── plans/2026-10-13-vps-production-deployment-automation.md
└── scripts/
    └── verify-setup-vps.ts        # Skrip uji integritas dan sintaksis artefak deploy
```

---

## 3. Rincian Komponen & Alur Eksekusi

### 3.1 Skrip Otomasi Provisioning (`deploy/setup-vps.sh`)

Skrip didesain idempoten (dapat dijalankan ulang dengan aman) dan mendukung eksekusi interaktif (meminta input nama domain/opsi) maupun non-interaktif via *environment variables*:
- `DOMAIN_NAME`: Nama domain produksi (mis. `ifk.kotabarukab.go.id` atau alamat IP).
- `DB_NAME`: Nama database PostgreSQL (default: `profile_ifk`).
- `DB_USER`: Pengguna database PostgreSQL (default: `ifk_user`).
- `DB_PASSWORD`: Kata sandi pengguna database (dibuat acak 32 karakter jika tidak diisi).
- `APP_PORT`: Port internal aplikasi Next.js (default: `3000`).
- `SETUP_SSL`: Flag instalasi sertifikat SSL Let's Encrypt (`true`/`false`).
- `RUN_SEED`: Flag inisialisasi data master awal dan seeder snapshot (`true`/`false`).

**Tahapan Eksekusi Otomatis:**
1. **Validasi Hak Akses & OS:** Memastikan sistem operasi Ubuntu/Debian dan pengguna memiliki hak `sudo`/`root`.
2. **Pembaruan Paket Sistem:** `apt-get update -y` dan instalasi utilitas dasar (`curl`, `git`, `ufw`, `openssl`).
3. **Penyediaan Node.js 20 LTS & PM2:** Memasang repository NodeSource LTS Node.js v20, npm, dan paket global PM2.
4. **Instalasi & Konfigurasi Basis Data:** Memasang PostgreSQL, membuat user `DB_USER`, basis data `DB_NAME`, dan menerapkan hak akses skema publik.
5. **Konfigurasi Berkas Lingkungan (`.env`):** Menghasilkan berkas `.env` produksi dengan `DATABASE_URL` yang aman dan `NEXT_PUBLIC_BASE_PATH=""`.
6. **Build Aplikasi Next.js Standalone:** Menjalankan `npm ci`, `npx prisma db push`, seeder (opsional), dan `npm run build`, kemudian menyalin folder `public` dan `.next/static` ke dalam `.next/standalone/`.
7. **Registrasi PM2 Service:** Mendaftarkan aplikasi ke PM2 berbasis `deploy/ecosystem.config.cjs`, mengaktifkan *systemd service* agar otomatis jalan saat server reboot.
8. **Konfigurasi Nginx & Firewall UFW:** Merender template Nginx dengan domain aktual, mengaktifkan symlink `sites-enabled`, menguji sintaks `nginx -t`, memuat ulang Nginx, serta membuka port SSH (22), HTTP (80), dan HTTPS (443) pada UFW.
9. **Pemasangan SSL Certbot (Opsional):** Menjalankan Certbot Nginx otomatis jika domain bukan IP/localhost.
10. **Penjadwalan Backup Cron:** Mendaftarkan cron job harian pada jam 02.00 WITA untuk menjalankan `scripts/backup-db.sh`.

### 3.2 Konfigurasi PM2 (`deploy/ecosystem.config.cjs`)

Menggunakan format CommonJS `.cjs` agar kompatibel dengan proyek ES Modules (`"type": "module"`):
- `name`: `profile-ifk`
- `script`: `.next/standalone/server.js`
- `instances`: 1 (atau disesuaikan dengan kapasitas RAM VPS; mode `fork` hemat memori)
- `env`: `PORT=3000`, `NODE_ENV=production`, `HOSTNAME=127.0.0.1`
- `max_memory_restart`: `400M`
- `exp_backoff_restart_delay`: `100`

### 3.3 Konfigurasi Reverse Proxy Nginx (`deploy/nginx-profile-ifk.conf`)

- Proxy ke upstream `127.0.0.1:3000`.
- Dukungan WebSocket upgrade untuk koneksi real-time.
- Caching langsung pada direktori disk `/_next/static/` dengan header `Cache-Control: public, max-age=31536000, immutable`.
- Dukungan upload berkas hingga `client_max_body_size 15M`.
- Header proteksi keamanan: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, dan `Referrer-Policy`.

---

## 4. Kriteria Pengujian & Keberterimaan

1. Sintaks bash `deploy/setup-vps.sh` lolos `bash -n`.
2. Format `deploy/ecosystem.config.cjs` valid secara sintaks Node.js.
3. Template Nginx memiliki placeholder terdefinisi dan sintaks valid.
4. Skrip uji mandiri `scripts/verify-setup-vps.ts` berhasil memverifikasi seluruh komponen dengan status 100% PASS.
5. Panduan `deploy/README.md` memuat alur setup instan dan alur rilis/pembaruan kode.
