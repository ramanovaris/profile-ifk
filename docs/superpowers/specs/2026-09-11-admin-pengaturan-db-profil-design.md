# Spesifikasi Teknis: Integrasi Database PostgreSQL Konten Profil UPTD (Tab 2: Pengaturan)

## 1. Konteks & Latar Belakang
Pada PR #52 (Issue #51), integrasi database PostgreSQL untuk Tab 1 (Identitas & Kontak Lembaga) telah selesai dan berhasil dikonsumsi secara dinamis oleh seluruh halaman publik instansi.
Issue #53 berfokus pada **Tab 2: Konten Profil UPTD**, yang saat ini masih berupa *mock client state* pada form admin (`settings-form.tsx`) dan teks statis pada halaman publik `/profil`.

Tujuan dari modul ini adalah:
1. Menyimpan data pimpinan UPTD (nama, jabatan, foto pimpinan, dan naskah sambutan resmi) ke tabel `site_settings` di basis data PostgreSQL.
2. Menyimpan haluan instansi: Visi, butir-butir Misi, dan Tugas Pokok & Fungsi (Tupoksi) ke tabel `site_settings`.
3. Mendukung pengunggahan berkas foto pimpinan lokal ke direktori `public/uploads/profile/` dengan validasi tipe/ukuran berkas (maks. 5MB) dan pembersihan foto lama.
4. Menyediakan Server Action yang aman (`updateSiteProfileAction`) dengan proteksi hak akses `SUPER_ADMIN` dan revalidasi cache instan (`revalidatePath`).
5. Menyajikan data tersebut secara dinamis pada halaman publik profil instansi (`src/app/(public)/profil/page.tsx`).

---

## 2. Perubahan Skema Basis Data (Prisma ORM)

Perluasan model `SiteSetting` pada `prisma/schema.prisma`:
```prisma
model SiteSetting {
  id                  String   @id @default("default")
  // Tab 1: Identitas & Kontak (Sudah ada)
  name                String
  shortName           String
  address             String
  phone               String
  email               String
  whatsappLink        String
  googleMapsEmbedUrl  String   @db.Text
  operationalHours    String   @db.Text
  sp4nLaporUrl        String
  motto               String
  tagline             String

  // Tab 2: Konten Profil UPTD (Baru)
  headName            String   @default("apt. H. Muhammad Yusuf, S.Farm")
  headRole            String   @default("Kepala UPTD Instalasi Farmasi Kab. Kotabaru")
  headPhoto           String?
  orgStructurePhoto   String?
  greeting            String   @default("Assalamualaikum Warahmatullahi Wabarakatuh.\n\nPuji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga UPTD Instalasi Farmasi Kabupaten Kotabaru dapat terus memberikan pelayanan terbaik di bidang kefarmasian bagi masyarakat Kabupaten Kotabaru.\n\nKami berkomitmen untuk terus meningkatkan kualitas distribusi obat dan farmasi, menjaga mutu pelayanan, serta memastikan ketersediaan obat yang aman, berkhasiat, dan berkualitas di seluruh fasilitas kesehatan binaan.\n\nSemoga website ini dapat menjadi sarana informasi yang bermanfaat bagi seluruh masyarakat.\n\nWassalamualaikum Warahmatullahi Wabarakatuh.") @db.Text
  vision              String   @default("Terwujudnya Pelayanan Kefarmasian yang Bermutu, Merata, dan Terjangkau Menuju Masyarakat Kabupaten Kotabaru yang Sehat dan Mandiri.") @db.Text
  mission             String   @default("1. Menjamin ketersediaan, pemerataan, dan keterjangkauan obat dan perbekalan kesehatan di seluruh fasilitas kesehatan binaan.\n2. Meningkatkan mutu pengelolaan dan pengawasan obat secara transparan dan akuntabel.\n3. Mengembangkan kapasitas sumber daya manusia dan pemanfaatan teknologi informasi dalam pengelolaan kefarmasian.\n4. Mendorong pemberdayaan masyarakat dalam penggunaan obat yang rasional dan bijak.") @db.Text
  tupoksi             String   @default("UPTD Instalasi Farmasi mempunyai tugas melaksanakan kegiatan teknis operasional dinas dalam pengelolaan obat, alat kesehatan, dan perbekalan kesehatan lainnya yang meliputi perencanaan kebutuhan, penerimaan, penyimpanan, pemeliharaan, pendistribusian, pemantauan, serta evaluasi.") @db.Text

  updatedAt           DateTime @updatedAt

  @@map("site_settings")
}
```

---

## 3. Server Actions & Logika Mutasi (`src/actions/setting.ts`)

1. **`getSiteSettings()`**:
   - Membaca record `default` dari PostgreSQL via `React.cache()`.
   - Menambahkan nilai fallback default untuk field baru jika record belum ada di DB.
2. **`updateSiteProfileAction(formData: FormData)`**:
   - Mengambil data dari `FormData`:
     - `headName` (wajib diisi, min 3 karakter)
     - `headRole` (opsional / default jabatan)
     - `greeting` (teks naskah sambutan)
     - `vision` (teks visi)
     - `mission` (teks butir misi)
     - `tupoksi` (teks tupoksi)
     - `photoFile` (opsional: File gambar, validasi format `.png`, `.jpg`, `.jpeg`, `.webp`, max 5MB).
   - Simpan berkas gambar ke `public/uploads/profile/head-photo-[timestamp].[ext]`.
   - Hapus berkas gambar pimpinan lama jika sebelumnya berupa file upload lokal.
   - Update tabel `site_settings` pada record `id = "default"`.
   - Eksekusi revalidasi:
     - `revalidatePath("/", "layout")`
     - `revalidatePath("/profil")`
     - `revalidatePath("/admin/pengaturan")`

---

## 4. Antarmuka Admin (`settings-form.tsx`)

- Mengikat nilai awal form Tab 2 ke `initialSettings.headName`, `initialSettings.headRole`, `initialSettings.headPhoto`, `initialSettings.greeting`, `initialSettings.vision`, `initialSettings.mission`, dan `initialSettings.tupoksi`.
- Preview foto pimpinan interaktif:
  - Jika belum ada foto yang diunggah / null, gunakan placeholder default `placeholderImage(300, 400, "Kepala IFK", "Profil")`.
  - Jika ada URL foto, gunakan `getAssetUrl(profileForm.headPhoto)`.
  - Input file untuk ganti foto dengan preview instan via `URL.createObjectURL(file)`.
- Menggantikan mock submit dengan Server Action `updateSiteProfileAction(formData)` dalam `useTransition`.
- Feedback notifikasi toast native (`toast.success` / `toast.error`).
- Tombol Reset Form mengembalikan nilai ke state database awal.

---

## 5. Konsumsi Halaman Publik Profil (`src/app/(public)/profil/page.tsx`)

- Mengubah `ProfilPage` untuk memanggil `await getSiteSettings()`.
- Mengganti teks statis dengan nilai dinamis:
  - **Sambutan Pimpinan**:
    - Foto: `settings.headPhoto ? getAssetUrl(settings.headPhoto) : placeholderImage(300, 400, "Kepala IFK", "Profil")`
    - Nama & Gelar: `settings.headName`
    - Jabatan: `settings.headRole`
    - Naskah Sambutan: dipisah per paragraf (`\n\n` atau `\n`) sehingga tetap tersusun rapi dalam tag `<p>`.
  - **Visi & Misi**:
    - Visi: `settings.vision`
    - Misi: dipisah per baris (`\n`), memangkas nomor di awal jika ada, dan merender grid kartu butir misi bernomor cantik.
  - **Tupoksi**:
    - Menguraikan teks `settings.tupoksi` pada bagian deskripsi tugas pokok dan fungsi instansi.

---

## 6. Kriteria Keberhasilan & Verifikasi
1. `npx prisma db push` berhasil menambahkan kolom tanpa data loss.
2. Skrip pengujian runnable `scripts/verify-profile-db.ts` memverifikasi pembacaan, otorisasi `SUPER_ADMIN`, dan mutasi profil.
3. Form Tab 2 di `/admin/pengaturan` berhasil menyimpan teks & foto pimpinan dengan feedback toast.
4. Halaman publik `/profil` menyajikan data profil dinamis yang sama persis dengan yang disimpan di admin.
5. GitHub Actions CI Pipeline lolos 100% (linting, build, type check).
