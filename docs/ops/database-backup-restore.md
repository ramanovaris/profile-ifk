# Panduan Operasional: Pencadangan & Pemulihan Basis Data Terjadwal

Dokumentasi ini memuat prosedur operasional standar (*Standard Operating Procedure*) untuk pencadangan (*backup*), rotasi arsip, dan pemulihan (*restore*) basis data PostgreSQL pada sistem Profile IFK Kotabaru.

---

## 1. Ringkasan & Fitur Utama

Sistem pencadangan dibangun mandiri menggunakan utilitas bawaan sistem operasi Linux (`pg_dump`, `gzip`, dan `psql`) dengan keunggulan:
- **Ringan & Hemat RAM:** Berjalan langsung di level shell tanpa membebani runtime Node.js (konsumsi RAM < 5 MB), sangat ideal untuk VPS 2GB.
- **Kompresi Tinggi:** Seluruh data dikompresi langsung ke format `.sql.gz` sehingga ukuran berkas sangat ringkas (~20-50 KB untuk data awal).
- **Rotasi Otomatis:** Arsip cadangan lama yang melampaui batas retensi (default: 7 hari) otomatis dihapus agar ruang disk server tidak penuh.
- **Portabel & Mandiri:** Skrip secara dinamis membaca konfigurasi dari berkas `.env` aktif di direktori proyek, sehingga dapat digunakan langsung di lingkungan Development maupun Production tanpa perubahan kode.
- **Pemandu Pemulihan Interaktif:** Dilengkapi menu pemilihan berkas cadangan dan proteksi keamanan wajib (ketik `YES`) guna mencegah kehilangan atau penimpaan data yang tidak disengaja.

---

## 2. Perintah Cepat Proyek (*NPM Scripts*)

Di dalam direktori proyek `profile-ifk`, Anda dapat menjalankan perintah berikut:

### A. Melakukan Pencadangan Data (Manual Kapan Saja)
```bash
npm run db:backup
```
*Atau via bash:*
```bash
bash scripts/backup-db.sh
```

### B. Memulihkan Data (Pemandu Interaktif)
```bash
npm run db:restore
```
*Atau via bash:*
```bash
bash scripts/restore-db.sh
```

---

## 3. Pemasangan Jadwal Pencadangan Otomatis (*Crontab*)

Untuk memastikan data dicadangkan otomatis setiap malam tanpa perlu campur tangan manual, daftarkan tugas terjadwal ke dalam `crontab` server VPS.

### Langkah Pemasangan:
1. Buka konfigurasi crontab pengguna:
   ```bash
   crontab -e
   ```
2. Tambahkan baris jadwal berikut pada bagian paling bawah:
   ```cron
   # Pencadangan otomatis basis data Profile IFK setiap pukul 02:00 WITA (18:00 UTC)
   0 18 * * * cd /home/ubuntu/projects/profile-ifk && bash scripts/backup-db.sh >> /home/ubuntu/projects/profile-ifk/backups/backup.log 2>&1
   ```
3. Simpan dan keluar dari editor.
4. Verifikasi bahwa jadwal telah terpasang dengan:
   ```bash
   crontab -l
   ```

*Catatan:* Berkas log riwayat pencadangan otomatis akan tersimpan di `backups/backup.log`.

---

## 4. Prosedur Pemulihan Data Darurat (*Disaster Recovery*)

Jika terjadi kendala sistem atau kesalahan modifikasi data operasional, ikuti salah satu prosedur pemulihan berikut:

### Opsi A: Menggunakan Menu Pemandu Interaktif (Rekomendasi)
1. Jalankan perintah pemulihan:
   ```bash
   npm run db:restore
   ```
2. Skrip akan memindai folder `backups/` dan menampilkan daftar seluruh berkas cadangan terdaftar beserta tanggal pembuatannya:
   ```text
   [ 1] profile_ifk_backup_20261010_115349.sql.gz (24K | 2026-10-10 11:53:49)
   [ 2] profile_ifk_backup_20261009_020000.sql.gz (24K | 2026-10-09 02:00:00)
   ```
3. Ketik nomor berkas yang diinginkan (misal `1`), lalu tekan Enter.
4. Periksa ringkasan berkas, lalu ketik `YES` (huruf besar) saat diminta konfirmasi keamanan.
5. Basis data akan dipulihkan secara instan dalam beberapa detik.

### Opsi B: Memulihkan Berkas Tertentu Secara Langsung
Jika Anda sudah mengetahui nama atau lokasi berkas cadangan:
```bash
bash scripts/restore-db.sh backups/profile_ifk_backup_20261010_115349.sql.gz
```

### Opsi C: Pemulihan Manual via Terminal (Bila Diperlukan)
```bash
gunzip -c backups/profile_ifk_backup_20261010_115349.sql.gz | psql "postgresql://user:password@localhost:5432/profile_ifk"
```

---

## 5. Prosedur Migrasi Data Antar-Server (Dev ➔ Production)

Ketika sistem dideploy ke VPS Production, Anda dapat memindahkan seluruh data obat, berita, profil, dan bagan struktur organisasi dari VPS Development dengan langkah mudah:

1. **Buat cadangan data terbaru di VPS Development:**
   ```bash
   npm run db:backup
   ```
2. **Kirim berkas cadangan ke VPS Production via SCP:**
   ```bash
   scp backups/profile_ifk_backup_TERBARU.sql.gz user@ip-vps-prod:/home/user/projects/profile-ifk/backups/
   ```
3. **Login ke VPS Production dan jalankan restorasi:**
   ```bash
   npm run db:restore
   ```
   Pilih berkas yang baru saja disalin dan ketik `YES`. Seluruh data operasional kini telah sinkron 100% di server Production.

---

## 6. Konfigurasi Lanjutan & Variabel Lingkungan

Skrip mendukung variabel lingkungan opsional berikut:

| Variabel | Nilai Bawaan (*Default*) | Keterangan |
|---|---|---|
| `DATABASE_URL` | Diambil otomatis dari `.env` | URL koneksi ke basis data PostgreSQL |
| `BACKUP_DIR` | `<root-proyek>/backups` | Lokasi folder penyimpanan berkas arsip |
| `RETENTION_DAYS` | `7` | Batas hari penyimpanan arsip sebelum dihapus otomatis |

Contoh menjalankan pencadangan dengan retensi 14 hari ke folder kustom:
```bash
BACKUP_DIR=/var/backups/ifk RETENTION_DAYS=14 npm run db:backup
```

---

## 7. Keamanan & Kebersihan Repositori Git

- Direktori `backups/`, `backups_test/`, serta berkas ekstensi `*.sql` dan `*.sql.gz` telah didaftarkan ke dalam `.gitignore`.
- Berkas basis data yang dicadangkan **tidak akan pernah terunggah ke GitHub** demi menjamin kerahasiaan data instansi dan keamanan informasi publik.
