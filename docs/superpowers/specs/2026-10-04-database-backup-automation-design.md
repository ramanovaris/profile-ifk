# Spesifikasi Desain: Otomatisasi Pencadangan dan Prosedur Pemulihan Basis Data Terjadwal

- **Tanggal Dokumen:** 2026-10-04
- **Terkait Issue:** [#115](https://github.com/ramanovaris/profile-ifk/issues/115)
- **Status:** Approved by User (Ready for Plan & Implementation)
- **Target Rilis:** Branch `feat/115-database-backup-automation` -> `develop`

---

## 1. Latar Belakang & Tujuan

Basis data operasional sistem informasi kefarmasian menyimpan seluruh data esensial layanan publik dan tata kelola internal (katalog stok obat, histori penerimaan/pengeluaran, artikel edukasi publik, profil instansi, kontak, serta bagan struktur organisasi).

Untuk mencegah kehilangan data akibat kendala sistem, galat manusia, atau kegagalan perangkat keras, sistem memerlukan mekanisme pencadangan mandiri yang andal, ringan, dan hemat ruang disk VPS.

Tujuan implementasi ini adalah:
1. Menyediakan skrip pencadangan mandiri (`scripts/backup-db.sh`) yang mengekspor salinan basis data terkompresi (`.sql.gz`) secara cepat dan hemat sumber daya RAM/CPU.
2. Menerapkan mekanisme rotasi otomatis berbasis batas hari retensi (default 7 hari) guna mencegah kepenuhan kapasitas penyimpanan server VPS (kapasitas disk tersisa ~5.6 GB).
3. Menyediakan skrip pemulihan interaktif (`scripts/restore-db.sh`) yang memandu pemulihan data darurat dengan perlindungan konfirmasi eksplisit (*fail-safe verification*).
4. Menyediakan perintah terpadu di `package.json` (`npm run db:backup` dan `npm run db:restore`) agar mudah dijalankan langsung di lingkungan proyek.
5. Menyediakan dokumentasi panduan operasional lengkap di `docs/ops/database-backup-restore.md` yang memuat jadwal otomatis (*crontab*), prosedur pemulihan darurat, dan mitigasi risiko.
6. Menjaga keamanan data dengan mendaftarkan direktori cadangan dan berkas dump ke dalam `.gitignore` sehingga tidak pernah terunggah ke repositori publik.

---

## 2. Arsitektur Teknis & Struktur Berkas

### A. Struktur Berkas Baru & Disesuaikan

```
projects/profile-ifk/
├── .gitignore                                 # Penambahan ignorir direktori backups/ & *.sql.gz
├── docs/
│   └── ops/
│       └── database-backup-restore.md         # Dokumentasi panduan operasional & pemulihan
├── package.json                               # Penambahan script "db:backup" dan "db:restore"
└── scripts/
    ├── backup-db.sh                           # Skrip eksekusi pencadangan & rotasi retensi
    ├── restore-db.sh                          # Skrip pemandu pemulihan interaktif & aman
    └── verify-database-backup.sh              # Skrip uji integritas pencadangan & rotasi
```

---

## 3. Spesifikasi Rinci Komponen

### A. Skrip Pencadangan & Rotasi (`scripts/backup-db.sh`)
1. **Ekstraksi Konfigurasi Lingkungan:**
   - Membaca berkas `.env` dari direktori root proyek `profile-ifk`.
   - Mengambil variabel `DATABASE_URL`.
   - Memangkas parameter query khusus Prisma (misal `?schema=public`) agar URI koneksi valid dan kompatibel 100% dengan utilitas `pg_dump`.
2. **Penyimpanan Terkompresi:**
   - Menentukan direktori target cadangan melalui variabel `BACKUP_DIR` (default: `<project-root>/backups`).
   - Membuat direktori jika belum tersedia (`mkdir -p "$BACKUP_DIR"`).
   - Format penamaan berkas terstandarisasi berbasis stempel waktu:
     `profile_ifk_backup_YYYYMMDD_HHMMSS.sql.gz`
   - Mengalirkan hasil `pg_dump` langsung melalui kompresi `gzip` (`pg_dump ... | gzip -c > ...`).
3. **Pembersihan / Rotasi Otomatis:**
   - Menggunakan variabel retensi `RETENTION_DAYS` (default: 7 hari).
   - Menghapus arsip pencadangan lama yang melampaui masa retensi:
     `find "$BACKUP_DIR" -name "profile_ifk_backup_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete`
4. **Pencatatan Log & Kode Status (Exit Codes):**
   - Menampilkan informasi ringkas: nama berkas yang dihasilkan, ukuran berkas akhir, jumlah arsip tersimpan, dan status keberhasilan.
   - Mengembalikan exit code `0` bila sukses dan `1` bila terjadi kegagalan koneksi/ekstraksi.

### B. Skrip Pemandu Pemulihan Interaktif (`scripts/restore-db.sh`)
1. **Pemeriksaan Berkas Cadangan:**
   - Memeriksa ketersediaan berkas di direktori `BACKUP_DIR`.
   - Menampilkan daftar berkas cadangan terkompresi yang tersedia beserta ukuran dan tanggal pembuatannya.
2. **Mode Pemilihan:**
   - Pengguna dapat memasukkan nama/indeks berkas yang ingin dipulihkan, atau meneruskan path berkas spesifik sebagai argumen pertama (`./scripts/restore-db.sh path/to/backup.sql.gz`).
3. **Perlindungan Keamanan (*Fail-Safe Safeguard*):**
   - Menampilkan peringatan tegas bahwa pemulihan akan menimpa data yang sedang berjalan.
   - Mewajibkan pengetikan konfirmasi eksplisit (`YES`) sebelum eksekusi dimulai. Jika dibatalkan atau salah ketik, proses langsung dihentikan dengan aman.
4. **Eksekusi Pemulihan:**
   - Mengekstrak data terkompresi dan meneruskannya ke utilitas `psql` menggunakan koneksi basis data aktif.
   - Menampilkan konfirmasi keberhasilan pemulihan.

### C. Alur Perintah di `package.json`
- `"db:backup": "bash scripts/backup-db.sh"` ➔ Pencadangan mandiri satu langkah.
- `"db:restore": "bash scripts/restore-db.sh"` ➔ Pemulihan interaktif berpemandu.

### D. Panduan Operasional (`docs/ops/database-backup-restore.md`)
1. **Konfigurasi Otomatisasi Terjadwal (*Cron*):**
   - Panduan entri crontab untuk pengguna server (misal eksekusi harian pukul 02.00 WITA / 18.00 UTC):
     `0 18 * * * cd /home/ubuntu/projects/profile-ifk && bash scripts/backup-db.sh >> /home/ubuntu/projects/profile-ifk/backups/backup.log 2>&1`
2. **Prosedur Pemulihan Cepat & Darurat:**
   - Langkah demi langkah restorasi data via skrip dan alternatif perintah manual.
3. **Pemeriksaan & Pemantauan Kapasitas Disk:**
   - Petunjuk pemeriksaan ukuran direktori dan status rotasi berkas.

### E. Skrip Pengujian Mandiri (`scripts/verify-database-backup.sh`)
1. Menguji eksekusi `backup-db.sh` ke folder pengujian sementara (`backups_test/`).
2. Menguji validitas integritas kompresi berkas `.sql.gz` menggunakan perintah `gzip -t`.
3. Menguji logika rotasi (membuat berkas dummy berumur > 7 hari dan memastikan berkas tersebut terhapus dengan tepat).
4. Membersihkan folder pengujian sementara setelah pengujian selesai.

---

## 4. Kriteria Penerimaan & Verifikasi (Acceptance Criteria)

- [ ] Skrip `scripts/backup-db.sh` berhasil membuat berkas cadangan `.sql.gz` yang valid dari basis data aktif.
- [ ] Logika pembersihan otomatis menghapus berkas arsip yang melampaui batas hari retensi.
- [ ] Skrip `scripts/restore-db.sh` memiliki mekanisme konfirmasi keamanan wajib sebelum menimpa data.
- [ ] Perintah `npm run db:backup` dan `npm run db:restore` terdaftar di `package.json` dan dapat dieksekusi.
- [ ] Dokumen panduan operasional `docs/ops/database-backup-restore.md` lengkap dan mudah dipahami.
- [ ] Direktori `backups/` dan berkas `.sql.gz` masuk dalam `.gitignore` sehingga aman dari kebocoran ke Git.
- [ ] Pengujian mandiri `scripts/verify-database-backup.sh` berjalan sukses tanpa galat.

---

## 5. Draf Redaksi SKP e-Kinerja PNS

> *"Membangun sistem otomatisasi pencadangan dan pemulihan data aplikasi secara berkala guna menjamin keamanan, keutuhan, dan keberlanjutan layanan informasi kefarmasian publik."*
