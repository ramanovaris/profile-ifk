# Implementasi Otomatisasi Pencadangan dan Prosedur Pemulihan Basis Data Terjadwal

> **For agentic workers:** Implement tasks sequentially. Follow TDD/verification steps per task.

**Goal:** Menyediakan skrip utilitas mandiri untuk pencadangan terkompresi (`.sql.gz`), rotasi retensi arsip lama, skrip pemulihan interaktif yang aman, serta dokumentasi panduan operasional server lengkap di repositori `profile-ifk`.

**Architecture:** Menggunakan utilitas native sistem operasi (`pg_dump`, `gzip`, `psql`, `find`) yang dibungkus dalam skrip shell POSIX/Bash mandiri (`scripts/backup-db.sh` dan `scripts/restore-db.sh`). Skrip membaca konfigurasi koneksi secara dinamis dari `.env` proyek dan membersihkan parameter query khusus agar 100% kompatibel dengan perkakas PostgreSQL.

**Tech Stack:** Bash shell scripts, PostgreSQL Client (`pg_dump`, `psql`), Gzip, npm scripts, Markdown documentation.

## Global Constraints

- **Efisiensi RAM:** Skrip berbasis shell ringan (konsumsi RAM < 5 MB) tanpa membebani server VPS 2GB.
- **Portabilitas:** Path direktori bersifat dinamis berbasis letak skrip (`$(cd "$(dirname "$0")/.." && pwd)`), sehingga dapat langsung berjalan di VPS Dev maupun VPS Prod tanpa perubahan kode.
- **Keamanan Data:** Berkas arsip `.sql.gz` dan direktori `backups/` wajib diabaikan oleh Git (`.gitignore`). Skrip restore wajib meminta konfirmasi eksplisit (`YES`) sebelum menimpa data.
- **Hemat RAM VPS:** Tidak menjalankan `next build` / `tsc` penuh di VPS; pengujian logika dilakukan lewat skrip verifikasi mandiri dan diserahkan ke GitHub Actions CI.

---

### Task 1: Konfigurasi Keamanan Git & Shortcut NPM

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`

**Interfaces:**
- Menambahkan `backups/` dan pola berkas dump (`*.sql`, `*.sql.gz`) ke `.gitignore`.
- Mendaftarkan perintah `"db:backup"` dan `"db:restore"` ke bagian `"scripts"` di `package.json`.

- [ ] **Step 1: Perbarui `.gitignore`**
  Tambahkan entri untuk direktori cadangan dan berkas dump:
  ```gitignore
  # database backups
  /backups/
  backups_test/
  *.sql
  *.sql.gz
  ```
- [ ] **Step 2: Perbarui `package.json`**
  Tambahkan shortcut script:
  ```json
  "db:backup": "bash scripts/backup-db.sh",
  "db:restore": "bash scripts/restore-db.sh"
  ```
- [ ] **Step 3: Verifikasi sintaks JSON**
  Periksa kelayakan `package.json` agar valid.
- [ ] **Step 4: Commit perubahan**
  `git add .gitignore package.json && git commit -m "chore(ops): tambahkan aturan gitignore backup dan shortcut npm (#115)"`

---

### Task 2: Skrip Pencadangan & Pembersihan Otomatis (`scripts/backup-db.sh`)

**Files:**
- Create: `scripts/backup-db.sh`

**Interfaces:**
- Input: Membaca `DATABASE_URL` dari `.env` (atau variabel lingkungan aktif), opsi `BACKUP_DIR` (default: `<project_root>/backups`), opsi `RETENTION_DAYS` (default: 7).
- Output: Menghasilkan berkas terkompresi `profile_ifk_backup_YYYYMMDD_HHMMSS.sql.gz` di folder `BACKUP_DIR`.
- Exit Code: `0` jika sukses, `1` jika gagal.

- [ ] **Step 1: Tulis skrip `scripts/backup-db.sh`**
  - Menggunakan `set -euo pipefail`.
  - Resolusi direktori root proyek otomatis.
  - Pemuatan `.env` dengan pembersihan `?schema=public` pada URI koneksi.
  - Pemeriksaan dependensi (`pg_dump`, `gzip`).
  - Pembuatan direktori `BACKUP_DIR` jika belum ada.
  - Eksekusi `pg_dump "$CLEAN_DB_URL" | gzip -c > "$BACKUP_FILE"`.
  - Pembersihan otomatis berkas berumur lebih dari `$RETENTION_DAYS` hari.
  - Tampilkan ringkasan status berkas dan ukuran.
- [ ] **Step 2: Berikan izin eksekusi (`chmod +x scripts/backup-db.sh`)**
- [ ] **Step 3: Uji eksekusi langsung ke direktori uji sementara**
- [ ] **Step 4: Commit perubahan**
  `git add scripts/backup-db.sh && git commit -m "feat(ops): implementasikan skrip pencadangan dan rotasi database (#115)"`

---

### Task 3: Skrip Pemulihan Interaktif Berpemandu (`scripts/restore-db.sh`)

**Files:**
- Create: `scripts/restore-db.sh`

**Interfaces:**
- Input: Argumen opsional `$1` (path ke berkas `.sql.gz`) atau menu interaktif memilih dari `BACKUP_DIR`.
- Perlindungan: Memerlukan konfirmasi teks `YES` sebelum mengeksekusi restorasi ke database aktif.
- Output: Memulihkan struktur dan data via `gunzip -c ... | psql "$CLEAN_DB_URL"`.

- [ ] **Step 1: Tulis skrip `scripts/restore-db.sh`**
  - Menggunakan `set -euo pipefail`.
  - Pemuatan konfigurasi `.env` dan pembersihan URI untuk `psql`.
  - Pemeriksaan ketersediaan berkas cadangan di `BACKUP_DIR`.
  - Mode interaktif jika tanpa argumen: cetak daftar berkas cadangan berindeks.
  - Konfirmasi peringatan penimpaan data: minta ketik `YES`.
  - Eksekusi restorasi data secara atomik.
- [ ] **Step 2: Berikan izin eksekusi (`chmod +x scripts/restore-db.sh`)**
- [ ] **Step 3: Uji validasi konfirmasi gagal jika bukan YES (aborted safely)**
- [ ] **Step 4: Commit perubahan**
  `git add scripts/restore-db.sh && git commit -m "feat(ops): implementasikan skrip pemulihan interaktif database (#115)"`

---

### Task 4: Dokumentasi Panduan Operasional & Pemulihan Darurat

**Files:**
- Create: `docs/ops/database-backup-restore.md`

**Interfaces:**
- Dokumen panduan operasional bahasa Indonesia yang mudah dipahami bagi staf teknis / PNS.

- [ ] **Step 1: Tulis dokumen `docs/ops/database-backup-restore.md`**
  - Bagian 1: Ringkasan Fitur & Perintah Cepat (`npm run db:backup`, `npm run db:restore`).
  - Bagian 2: Panduan Pemasangan Jadwal Otomatis Server (*Crontab*) harian.
  - Bagian 3: Prosedur Pemulihan Darurat (Interaktif & Manual CLI).
  - Bagian 4: Prosedur Migrasi Data Antar-Server (Dev ke Production).
  - Bagian 5: Kebijakan Retensi & Pemantauan Kapasitas Disk VPS.
- [ ] **Step 2: Commit perubahan**
  `git add docs/ops/database-backup-restore.md && git commit -m "docs(ops): panduan operasional pencadangan dan pemulihan database (#115)"`

---

### Task 5: Skrip Uji Verifikasi Otomatis & Validasi Menyeluruh

**Files:**
- Create: `scripts/verify-database-backup.sh`

**Interfaces:**
- Skrip pengujian end-to-end yang memvalidasi siklus pencadangan, integritas berkas gzip, dan logika rotasi.

- [ ] **Step 1: Tulis `scripts/verify-database-backup.sh`**
  - Uji 1: Jalankan pencadangan ke direktori pengujian terisolasi (`BACKUP_DIR=backups_test`).
  - Uji 2: Validasi integritas berkas `.sql.gz` yang dihasilkan (`gzip -t`).
  - Uji 3: Uji simulasi rotasi: buat berkas dummy berstempel 10 hari lalu (`touch -d "10 days ago"`), jalankan pembersihan, pastikan berkas lama terhapus dan berkas baru tetap ada.
  - Uji 4: Bersihkan direktori pengujian sementara (`backups_test`).
  - Cetak hasil pengujian dengan status PASS/FAIL yang jelas.
- [ ] **Step 2: Berikan izin eksekusi dan jalankan skrip verifikasi**
  `bash scripts/verify-database-backup.sh`
- [ ] **Step 3: Commit perubahan**
  `git add scripts/verify-database-backup.sh && git commit -m "test(ops): tambahkan skrip verifikasi otomatis pencadangan dan rotasi (#115)"`
