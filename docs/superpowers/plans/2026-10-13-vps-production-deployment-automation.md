# Rencana Implementasi: Otomatisasi Setup VPS dan Template Deployment Produksi

- **Tanggal Dokumen:** 2026-10-13
- **Terkait Dokumen Desain:** [Spesifikasi Desain Deployment VPS](docs/superpowers/specs/2026-10-13-vps-production-deployment-automation-design.md)
- **Terkait Issue:** [#166](https://github.com/ramanovaris/profile-ifk/issues/166)
- **Branch Kerja:** `feat/166-setup-vps-production`

---

## 1. Ikhtisar Tugas

Membangun rangkaian artefak otomatisasi deployment server VPS Ubuntu untuk Website Profil & Logistik Farmasi UPTD IFK Kotabaru agar peluncuran ke lingkungan produksi dapat dilakukan secara cepat, konsisten, dan minim intervensi manual.

---

## 2. Rincian Tahapan Pekerjaan

### Tahap 1: Konfigurasi PM2 Standalone (`deploy/ecosystem.config.cjs`)
- Buat berkas `deploy/ecosystem.config.cjs`.
- Targetkan eksekusi pada `.next/standalone/server.js`.
- Atur parameter lingkungan `PORT`, `NODE_ENV`, batasan alokasi memori `max_memory_restart: '400M'`, dan penanganan restart cerdas.

### Tahap 2: Template Konfigurasi Nginx (`deploy/nginx-profile-ifk.conf`)
- Buat berkas template virtual host `deploy/nginx-profile-ifk.conf`.
- Tentukan placeholder `{{DOMAIN_NAME}}`, `{{APP_DIR}}`, dan `{{APP_PORT}}`.
- Konfigurasi caching aset `_next/static/`, limit ukuran upload 15MB, kompresi Gzip, dan header keamanan.

### Tahap 3: Skrip Bash Otomasi Provisioning (`deploy/setup-vps.sh`)
- Buat berkas `deploy/setup-vps.sh` dengan izin eksekusi (`chmod +x`).
- Implementasikan langkah provisioning:
  1. Validasi OS & akses sudo.
  2. Update repositori sistem.
  3. Instalasi Node.js 20 LTS & PM2.
  4. Instalasi & konfigurasi PostgreSQL (user, db, password acak jika kosong).
  5. Penyusunan konfigurasi `.env`.
  6. Eksekusi `npm ci`, prisma migration, seeder, dan `npm run build`.
  7. Penyalinan aset statis standalone (`public` dan `.next/static`).
  8. Pendaftaran service PM2 & auto-restart saat reboot.
  9. Konfigurasi Nginx & firewall UFW.
  10. Pemasangan sertifikat SSL Certbot (opsional).
  11. Registrasi cronjob backup database berkala (`scripts/backup-db.sh`).

### Tahap 4: Panduan Operasional Deployment (`deploy/README.md`)
- Buat berkas `deploy/README.md`.
- Jelaskan perintah *one-liner* untuk VPS baru.
- Jelaskan prosedur pembaharuan kode versi baru (*rolling update/deploy*).
- Jelaskan panduan troubleshooting (cek log PM2, Nginx, dan Postgres).

### Tahap 5: Skrip Uji Mandiri (`scripts/verify-setup-vps.ts`) & Verifikasi
- Buat skrip verifikasi `scripts/verify-setup-vps.ts`.
- Validasi keberadaan seluruh berkas target.
- Validasi sintaksis bash via `bash -n deploy/setup-vps.sh`.
- Validasi sintaksis PM2 dan integritas template Nginx.
- Jalankan verifikasi mandiri dan pastikan 100% PASS.

### Tahap 6: Pembuatan PR dan Integrasi ke `develop`
- Commit seluruh perubahan dengan pesan terstandar.
- Dorong branch ke remote dan buat Pull Request.
- Verifikasi build CI GitHub Actions lulus.
