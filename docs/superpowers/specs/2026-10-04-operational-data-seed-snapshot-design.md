# Spesifikasi Desain: Pembuatan Seeder Berbasis Snapshot Data Operasional Aktual

- **Tanggal Dokumen:** 2026-10-04
- **Terkait Issue:** [#124](https://github.com/ramanovaris/profile-ifk/issues/124)
- **Status:** Approved by User (Ready for Plan & Implementation)
- **Target Rilis:** Branch `feat/124-operational-data-seed-snapshot` -> `develop`

---

## 1. Latar Belakang & Tujuan

Sebelumnya, seeder basis data (`prisma/seed.ts`) masih menggunakan data statis/dummy lama yang dibuat pada tahap awal pengembangan. Ketika sistem diinisialisasi pada lingkungan baru atau di-reset, data operasional aktual yang telah dimasukkan (seperti 269 master stok obat riil, konfigurasi profil instansi, kontak resmi, kategori, dan artikel berita) tidak termuat.

Tujuan implementasi ini adalah:
1. Menyediakan utilitas penangkap snapshot (`scripts/generate-seed-snapshot.ts`) yang dapat mengekstraksi data operasional aktual dari basis data ke dalam berkas snapshot terstruktur (`prisma/data/*.json`).
2. Memperbarui seeder (`prisma/seed.ts`) agar membaca berkas snapshot tersebut dan mengisinya ke basis data secara **idempoten** dengan **Mode Sinkronisasi Penuh** (`upsert`).
3. Memastikan bahwa setiap perubahan data riil di kemudian hari (misalnya pembaruan bagan struktur organisasi atau penambahan stok) dapat diperbarui ke berkas seeder secara instan melalui satu perintah (`npm run seed:snapshot`).
4. Menyediakan skrip verifikasi otomatis untuk memastikan proses seeding aman dijalankan berulang kali tanpa risiko duplikasi atau kegagalan kendala unik (*unique constraint error*).

---

## 2. Arsitektur Teknis & Struktur Berkas

### A. Struktur Berkas Baru & Disesuaikan

```
projects/profile-ifk/
├── prisma/
│   ├── seed.ts                                # Seeder idempoten terpadu berbasis snapshot
│   └── data/
│       ├── site-settings.json                 # Snapshot profil, kontak, tupoksi, bagan struktur
│       ├── users.json                         # Snapshot akun pengguna & staf operasional
│       ├── categories.json                    # Snapshot kategori artikel berita
│       ├── articles.json                      # Snapshot artikel berita aktual
│       ├── stock-periods.json                 # Snapshot daftar periode stok obat
│       └── medicine-stocks.json               # Snapshot 269 item stok obat aktual
├── scripts/
│   ├── generate-seed-snapshot.ts              # Utilitas ekstraksi DB -> prisma/data/*.json
│   └── verify-seed-idempotency.ts             # Skrip uji idempoten & integritas seeder
└── package.json                               # Penambahan script "seed:snapshot"
```

---

## 3. Spesifikasi Rinci Komponen

### A. Utilitas Ekstraksi Snapshot (`scripts/generate-seed-snapshot.ts`)
1. **Model yang Diekstraksi:**
   - `SiteSetting` (id: `"default"`)
   - `User` (seluruh akun operasional, menjaga integritas hash kata sandi)
   - `Category` (nama, slug, status)
   - `Article` (judul, slug, konten HTML, coverImage, status publikasi, tanggal, referensi slug kategori & username penulis)
   - `StockPeriod` (daftar periode stok terdaftar)
   - `MedicineStock` (seluruh item stok perbekalan farmasi lintas periode beserta metrik logistik riil: avgUsage, mos, expiryDate, nomenklatur, source)
2. **Penyaringan & Keamanan:**
   - Tabel sementara runtime seperti `Session` diabaikan sepenuhnya agar tidak mencemari berkas seeder.
3. **Format Penyimpanan:**
   - Data disimpan rapi berformat JSON berindentasi 2-spasi di dalam direktori `prisma/data/` agar terbaca jelas dan mudah dilacak perubahannya di Git.

### B. Seeder Idempoten Terpadu (`prisma/seed.ts`)
1. **Perilaku Sinkronisasi Penuh (*Full Synchronization via Upsert*):**
   - **`SiteSetting`:** Upsert pada `id: "default"`. Jika ada perubahan pada teks motto, kepala UPTD, bagan struktur, atau metrik wilayah, data akan diperbarui mengikuti snapshot.
   - **`User`:** Upsert berdasarkan `username`. Akun yang sudah ada diperbarui status, nama, dan rolenya; akun baru dibuat otomatis.
   - **`Category`:** Upsert berdasarkan `slug`.
   - **`Article`:** Upsert berdasarkan `slug`. Relasi `category` dan `author` dipetakan secara dinamis berdasarkan slug kategori dan username penulis.
   - **`StockPeriod`:** Upsert berdasarkan `period`.
   - **`MedicineStock`:** Upsert berdasarkan kunci komposit unik `[period, code]`. Nilai jumlah stok, status, pemakaian rata-rata, dan masa kedaluwarsa diselaraskan persis dengan snapshot.
2. **Fallback Cerdas:**
   - Jika berkas `prisma/data/*.json` belum tersedia pada lingkungan bersih, seeder memiliki data fallback minimal agar sistem tetap dapat berjalan.

### C. Alur Perintah `package.json`
- `"seed:snapshot": "tsx scripts/generate-seed-snapshot.ts"` ➔ Dipanggil saat admin/pengembang ingin menyegarkan snapshot data seeder dari basis data berjalan.
- `"prisma:seed": "prisma db seed"` ➔ Menjalankan seeder untuk mengisi atau menyinkronkan basis data.

---

## 4. Kriteria Penerimaan & Verifikasi (Acceptance Criteria)

- [ ] Utilitas `npm run seed:snapshot` berhasil mengekstrak seluruh data operasional riil ke `prisma/data/*.json`.
- [ ] Berkas `prisma/seed.ts` berhasil membaca data snapshot dan menyinkronkan seluruh entitas ke database.
- [ ] Pengujian idempotensi (`scripts/verify-seed-idempotency.ts`) membuktikan seeder dapat dijalankan 2x berturut-turut tanpa galat kendala unik (*unique constraint*) dan jumlah baris data tetap konsisten.
- [ ] Website dan dashboard admin berjalan lancar tanpa regresi fungsional.

---

## 5. Draf Redaksi SKP e-Kinerja PNS
> *"Membangun utilitas standarisasi dan pembaruan data awal sistem informasi kefarmasian berbasis data operasional riil guna menjamin konsistensi informasi dan efisiensi replikasi sistem pelayanan publik."*
