# Panduan Deployment Server Produksi (VPS) — UPTD IFK Kotabaru

Panduan resmi untuk melakukan instalasi dan pemeliharaan Website Profil & Logistik Farmasi UPTD Instalasi Farmasi Kabupaten Kotabaru pada server VPS Linux (Ubuntu 22.04 / 24.04 LTS).

---

## 1. Persyaratan Minimum VPS

- **Sistem Operasi:** Ubuntu 22.04 LTS atau 24.04 LTS (Fresh install).
- **Spesifikasi:** 1 vCPU, RAM minimum 1 GB (Rekomendasi: 2 GB untuk build cepat), Ruang Disk 15 GB SSD.
- **Akses:** Akses SSH sebagai `root` atau pengguna dengan hak `sudo`.
- **Domain:** DNS A-Record domain (misal: `ifk.kotabarukab.go.id`) sudah diarahkan ke alamat IP publik VPS.

---

## 2. Instalasi 1-Klik di VPS Baru

Hubungkan terminal ke server VPS via SSH, lalu jalankan rangkaian perintah berikut:

```bash
# 1. Clone repositori cabang produksi (main)
git clone -b main https://github.com/ramanovaris/profile-ifk.git

# 2. Masuk ke direktori proyek
cd profile-ifk

# 3. Jalankan skrip otomatisasi setup
bash deploy/setup-vps.sh
```

### Opsi Non-Interaktif (Headless)

Jika ingin menjalankan tanpa dialog interaktif terminal (misal via skrip cloud-init):

```bash
DOMAIN_NAME="ifk.kotabarukab.go.id" \
DB_NAME="profile_ifk" \
DB_USER="ifk_user" \
DB_PASSWORD="kata_sandi_rahasia_anda" \
APP_PORT=3000 \
SETUP_SSL="true" \
RUN_SEED="true" \
bash deploy/setup-vps.sh
```

---

## 3. Komponen yang Dikonfigurasi Otomatis

Skrip `deploy/setup-vps.sh` secara otomatis menangani:
1. **Node.js 20 LTS** & utilitas global **PM2**.
2. **PostgreSQL** (Inisialisasi database `profile_ifk` dan otentikasi user).
3. **Next.js Standalone Build** (Kompilasi hemat memori <120MB RAM).
4. **PM2 Daemon** (`deploy/ecosystem.config.cjs`) lengkap dengan auto-start saat reboot server.
5. **Nginx Reverse Proxy** (`deploy/nginx-profile-ifk.conf`) dengan kompresi Gzip, caching aset statis, dan header keamanan.
6. **Firewall UFW** (Membuka port 22/SSH, 80/HTTP, 443/HTTPS).
7. **Sertifikat SSL Let's Encrypt** (HTTPS otomatis via Certbot jika domain terhubung).
8. **Jadwal Backup Database** (Otomatis dieksekusi setiap pukul 02.00 WITA ke folder `backups/`).

---

## 4. Prosedur Pembaharuan Rilis (Deploy Versi Baru)

Kapan pun terdapat pembaruan kode baru di branch `main`, jalankan prosedur pembaruan berikut pada VPS:

```bash
cd ~/profile-ifk

# 1. Ambil kode terbaru dari GitHub
git pull origin main

# 2. Perbarui dependensi dan skema database jika ada perubahan
npm install --prefer-offline
npx prisma generate
npx prisma db push --skip-generate

# 3. Build ulang Next.js mode standalone
npm run build

# 4. Sinkronkan folder aset statis standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 5. Muat ulang proses PM2 tanpa downtime (Zero-Downtime Reload)
pm2 reload profile-ifk
```

---

## 5. Perintah Pemeliharaan & Troubleshooting

### Memeriksa Status Aplikasi
```bash
# Cek status proses PM2
pm2 status

# Cek log aplikasi Next.js secara live
pm2 logs profile-ifk

# Restart aplikasi
pm2 restart profile-ifk
```

### Memeriksa Web Server Nginx
```bash
# Uji validitas sintaks konfigurasi Nginx
sudo nginx -t

# Muat ulang konfigurasi Nginx
sudo systemctl reload nginx

# Pantau log error Nginx
sudo tail -f /var/log/nginx/error.log
```

### Manajemen Basis Data & Backup
```bash
# Melakukan backup database manual seketika
npm run db:backup

# Memulihkan data dari file cadangan
npm run db:restore

# Akses console database PostgreSQL
sudo -u postgres psql -d profile_ifk
```
