# Design Spec: Dinamisasi Konten Halaman Publik (Tautan Dokumen, Metrik Wilayah, Statistik SDM & Jam Layanan)

- **Tanggal:** 2026-09-24
- **Isu Referensi:** [#104 (feat(publik): perbaikan konten halaman publik dari data statis menjadi data dinamis)](https://github.com/ramanovaris/profile-ifk/issues/104)
- **Status:** Approved (Pilihan 1 - Dinamisasi Terarah & Aman)
- **Branch Target:** `feat/104-public-content-dynamic-links-and-metrics` -> `develop`

---

## 1. Latar Belakang & Tujuan
Saat ini, sejumlah informasi operasional penting pada halaman publik (`/`, `/profil`, `/layanan`) masih ter-*hardcode* di dalam berkas komponen JSX. Kondisi ini menyulitkan staf pengelola UPTD Instalasi Farmasi Kabupaten Kotabaru ketika terjadi:
1. Pembaruan tautan resmi Google Sheets/Drive formulir (LPLPO dan Permintaan Sewaktu).
2. Perubahan komposisi ketenagaan SDM kefarmasian (jumlah Apoteker, TTK, pendukung).
3. Pembaruan indikator data wilayah (jumlah Faskes binaan, pulau terlayani, estimasi masyarakat).
4. Penyesuaian jam operasional loket farmasi.

Tujuan dari spesifikasi ini adalah mendinamisasi data operasional tersebut ke dalam tabel `SiteSetting` PostgreSQL dan menyediakan formulir pengelola terpadu di menu Admin (`/admin/pengaturan`), tanpa merusak tata letak visual editorial dan responsivitas seluler (*mobile-friendly*).

---

## 2. Ruang Lingkup (Scope)

### A. Termasuk dalam Fase 1:
1. **Tautan Unduhan Layanan (`/layanan`):**
   - Tautan formulir LPLPO berkala (Google Sheets/Drive).
   - Tautan formulir Permintaan Sewaktu / insidental (Google Sheets/Drive).
2. **Indikator Statistik Beranda (`/`):**
   - Angka dan label faskes binaan (contoh: "30 Faskes", "28 Puskesmas & 2 RSUD").
   - Angka dan label jangkauan kepulauan (contoh: "45 Pulau", "Jangkauan Kepulauan").
   - Angka dan label masyarakat terlayani (contoh: "334 Ribu+", "Masyarakat Terlayani").
3. **Statistik Ketenagaan SDM & Fasilitas Profil (`/profil`):**
   - Total personel SDM ("24 Orang").
   - Rincian jumlah Tenaga Apoteker ("5 Orang").
   - Rincian jumlah Tenaga Teknis Kefarmasian/TTK ("7 Orang").
   - Rincian jumlah Tenaga Pendukung ("11 Orang").
   - Luas fisik gudang farmasi ("690 m²").
4. **Sinkronisasi Jam Pelayanan (`/layanan`):**
   - Mengambil data jam operasional langsung dari `SiteSetting.operationalHours` yang sudah ada di database, menggantikan teks hardcode pada tabel loket.
5. **Antarmuka Pengelola Admin (`/admin/pengaturan`):**
   - Penambahan tab/kontrol manajemen Dokumen Layanan dan Statistik & SDM pada form pengaturan website (*Dark Ethereal theme*).
   - Server Actions dengan otentikasi ketat `SUPER_ADMIN` dan auto-revalidasi cache rute publik.

### B. Tidak Termasuk dalam Fase 1 (Tetap Terstruktur di Kode):
- Narasi regulasi baku nasional (Siklus Pengelolaan 4 Pilar, Metodologi Perencanaan RKO, Kebijakan Satu Pintu & Relokasi Aktif, Ketentuan SMILE, Standar Mutu CDOB, dan BAST Pemusnahan Obat Rusak) tetap dipertahankan pada kode komponen untuk menjaga kerapian tipografi editorial dan standar baku Kemenkes RI.

---

## 3. Desain Skema Basis Data (`prisma/schema.prisma`)

Menambahkan kolom-kolom berikut pada model `SiteSetting` dengan nilai *default* identik dengan data riil yang ada:

```prisma
model SiteSetting {
  id                  String   @id @default("default")
  // ... field identitas, kontak, dan profil yang sudah ada ...

  // Tautan Dokumen Layanan Publik (/layanan)
  lplpoUrl            String   @default("https://docs.google.com/spreadsheets/d/1ypgpgMjzoZiWWisXV5G_8lPwp6r4PXDI/edit?usp=drive_link&ouid=115052879703335488719&rtpof=true&sd=true")
  permintaanSewaktuUrl String   @default("https://docs.google.com/spreadsheets/d/19Eilxy1uqE6JM45kY5b7ZMj0OlKP-I6H/edit?usp=sharing&ouid=115052879703335488719&rtpof=true&sd=true")

  // Indikator Wilayah & Pelayanan Beranda (/)
  statsFaskesCount    String   @default("30 Faskes")
  statsFaskesLabel    String   @default("28 Puskesmas & 2 RSUD")
  statsPulauCount     String   @default("45 Pulau")
  statsPulauLabel     String   @default("Jangkauan Kepulauan")
  statsMasyarakatCount String  @default("334 Ribu+")
  statsMasyarakatLabel String  @default("Masyarakat Terlayani")

  // Statistik Ketenagaan SDM & Fasilitas Profil (/profil)
  sdmTotalCount       String   @default("24 Orang")
  sdmApotekerCount    String   @default("5 Orang")
  sdmTtkCount         String   @default("7 Orang")
  sdmPendukungCount   String   @default("11 Orang")
  saranaGudangLuas    String   @default("690 m²")

  updatedAt           DateTime @updatedAt

  @@map("site_settings")
}
```

---

## 4. Desain Server Actions & Backend (`src/actions/setting.ts`)

1. **Pembaruan `getSiteSettings()`:**
   - Menyertakan fallback lengkap untuk seluruh properti baru di atas jika query database belum terisi atau tabel dalam proses transisi.
2. **Server Action Baru `updateSitePublicContentAction`:**
   - Menerima payload:
     - `lplpoUrl`, `permintaanSewaktuUrl`
     - `statsFaskesCount`, `statsFaskesLabel`, `statsPulauCount`, `statsPulauLabel`, `statsMasyarakatCount`, `statsMasyarakatLabel`
     - `sdmTotalCount`, `sdmApotekerCount`, `sdmTtkCount`, `sdmPendukungCount`, `saranaGudangLuas`
   - Memvalidasi otentikasi sesi aktif dan memastikan peran `SUPER_ADMIN`.
   - Melakukan `upsert` pada `id: "default"`.
   - Menjalankan `revalidatePath` untuk:
     - `"/"` (Home)
     - `"/profil"` (Profil)
     - `"/layanan"` (Layanan)
     - `"/admin/pengaturan"` (Admin Settings)

---

## 5. Desain Antarmuka Pengelola (`/admin/pengaturan`)

Di `src/app/(admin)/admin/pengaturan/settings-form.tsx`:
1. Menambahkan dua tab baru:
   - **Tab Dokumen:** Mengelola link Google Sheets LPLPO & Permintaan Sewaktu, dilengkapi tombol pengujian link eksternal (`ExternalLink`).
   - **Tab Statistik & SDM:** Form grid responsif untuk mengubah indikator faskes/wilayah dan rincian personel SDM.
2. Styling mengikuti desain sistem *Dark Ethereal* yang konsisten dengan tab Profil dan Identitas yang sudah ada.

---

## 6. Desain Integrasi Halaman Publik

1. **`src/app/(public)/layanan/page.tsx`:**
   - Mengambil konfigurasi situs via `await getSiteSettings()`.
   - Menggantikan array statis `downloadTemplates` dengan URL dari `settings.lplpoUrl` dan `settings.permintaanSewaktuUrl`.
   - Menghubungkan seksi Jam Pelayanan loket dengan parsing baris dari `settings.operationalHours` dengan fallback ke format default jika kosong.
2. **`src/app/(public)/page.tsx`:**
   - Mengganti array statis `stats` dengan nilai dinamis `settings.statsFaskesCount`, `settings.statsPulauCount`, dll.
3. **`src/app/(public)/profil/page.tsx`:**
   - Mengambil `await getSiteSettings()`.
   - Mengganti angka "24 Personel", "5 Apoteker", "7 Tenaga Teknis (TTK)", "11 Tenaga Fungsional & Pendukung" pada header seksi dan grid SDM dengan nilai dinamis dari database.
   - Mengganti teks "Gudang Farmasi 690 m²" dengan `settings.saranaGudangLuas`.

---

## 7. Penanganan Kendala & Fallback (*Resilience*)

- Seluruh pemanggilan Server Component menggunakan *graceful fallback* berbasis konstanta bawaan. Jika database mengembalikan string kosong atau null, tampilan publik tetap menyajikan data valid tanpa merusak rendering layout.
- Perubahan tidak memerlukan instalasi library baru (zero external dependencies).
- Migrasi Prisma menggunakan `npx prisma db push` yang aman dan non-destruktif terhadap data pengguna dan artikel yang sudah ada.

---

## 8. Verifikasi & Pengujian
1. Verifikasi tipe data via `npx tsc --noEmit` (atau build lokal aman).
2. Pengujian fungsi form simpan di panel `/admin/pengaturan`.
3. Verifikasi live di peramban seluler (staging Nginx):
   - Tautan unduhan LPLPO & Permintaan Sewaktu terbuka dengan benar.
   - Indikator beranda dan SDM profil terbarui secara real-time setelah disimpan dari admin.
   - Jam pelayanan di `/layanan` sinkron dengan konfigurasi di admin.
