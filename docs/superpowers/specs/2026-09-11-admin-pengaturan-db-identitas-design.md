# Spesifikasi Desain: Integrasi Database Pengaturan Identitas Instansi & Konsumsi Halaman Publik

**Issue Terkait**: [#51](https://github.com/ramanovaris/profile-ifk/issues/51)  
**Target Branch**: `feat/51-admin-pengaturan-db-identitas`  
**Basis Branch**: `develop`  
**Tanggal**: 11 September 2026  

---

## 1. Konteks & Latar Belakang

Aplikasi web profil UPTD Instalasi Farmasi Kabupaten Kotabaru (`profile-ifk`) telah memiliki halaman Pengaturan Website (`/admin/pengaturan`) berbasis tema Dark Ethereal dan model database `SiteSetting` pada Prisma ORM (`prisma/schema.prisma`). Namun, data pengaturan identitas lembaga saat ini masih diinisialisasi secara statis dari `siteConfig` (`src/lib/dummy-data.ts`) dan halaman publik (Navbar, Footer, Kontak, Beranda) belum membaca data secara dinamis dari basis data PostgreSQL.

Sesuai strategi pengembangan bertahap (*small batches* terfokus untuk input harian e-Kinerja PNS), fase ini berfokus pada:
1. **Tab 1: Identitas & Kontak Lembaga** di panel admin pengaturan.
2. Integrasi penuh Server Actions untuk mutasi data identitas instansi ke tabel `site_settings` di PostgreSQL.
3. Menghubungkan seluruh halaman dan komponen publik agar membaca konfigurasi identitas instansi dari basis data.

---

## 2. Model Basis Data (`SiteSetting`)

Skema tabel `site_settings` telah didefinisikan di `prisma/schema.prisma` dan diinisialisasi melalui seeder `id: "default"`:

```prisma
model SiteSetting {
  id                  String   @id @default("default")
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
  updatedAt           DateTime @updatedAt

  @@map("site_settings")
}
```

Semua field pada model ini selaras 100% dengan input yang dikelola pada **Tab 1: Identitas & Kontak Lembaga**.

---

## 3. Arsitektur Komponen & Alur Data

### A. Server Actions Layer (`src/actions/setting.ts`)

1. **`getSiteSettings()`**:
   - Dibungkus dengan `React.cache()` dari React Server Components guna memastikan kueri basis data dideduplikasi otomatis dalam satu siklus render (*single query per render pass*).
   - Mengambil data dari `prisma.siteSetting.findUnique({ where: { id: "default" } })`.
   - **Fail-safe fallback**: Jika basis data kosong atau koneksi gagal, otomatis mengembalikan fallback aman dari `siteConfig` (`@/lib/dummy-data`) sehingga halaman publik dan admin tidak mengalami error 500.

2. **`updateSiteIdentityAction(data: UpdateIdentityInput)`**:
   - **Guard Autentikasi**: Memverifikasi sesi aktif via `getSessionUser()`. Jika sesi tidak valid, lemparkan error Unauthorized.
   - **Validasi**:
     - `name` & `shortName`: Wajib diisi (string tidak kosong).
     - `email`: Wajib berupa format email valid.
     - `phone`, `whatsappLink`, `address`, `operationalHours`, `googleMapsEmbedUrl`, `motto`, `tagline`: Sanitasi string (trim).
   - **Penyimpanan DB**: Menggunakan `prisma.siteSetting.upsert({ where: { id: "default" }, update: { ... }, create: { id: "default", ... } })`.
   - **Revalidasi Cache**:
     - `revalidatePath("/", "layout")` (memperbarui seluruh halaman publik, Navbar, Footer).
     - `revalidatePath("/admin/pengaturan")` (memperbarui halaman admin).
   - **Return**: `{ success: boolean, message: string, errors?: Record<string, string[]> }`.

---

### B. Admin Pengaturan Layer (`src/app/(admin)/admin/pengaturan/`)

1. **`page.tsx` (Server Component)**:
   - Berjalan secara `async` di sisi server.
   - Memanggil `const settings = await getSiteSettings()`.
   - Merender `<SettingsForm initialSettings={settings} />`.

2. **`settings-form.tsx` (Client Component)**:
   - Komponen interaktif yang mengelola 3 tab:
     - `identitas`: Form identitas & kontak lembaga terhubung ke `updateSiteIdentityAction` via `useTransition`.
     - `profil`: Konten profil UPTD (dipertahankan dari kode sebelumnya).
     - `tautan`: Tautan & layanan publik (dipertahankan dari kode sebelumnya).
   - Fitur UX:
     - Tombol "Simpan Perubahan": Animasi spinner & disable state saat `isPending`.
     - Tombol "Reset": Mengembalikan input ke nilai awal dari basis data.
     - Notifikasi feedback: Menggunakan `toast.success()` dan `toast.error()`.

---

### C. Konsumsi Halaman & Komponen Publik

1. **`src/app/(public)/layout.tsx`**:
   - Mengambil data: `const settings = await getSiteSettings()`.
   - Meneruskan props ke `<Navbar settings={settings} />` dan `<Footer settings={settings} />`.

2. **`src/components/public/navbar.tsx`**:
   - Menerima props optional `settings?: SiteSetting`.
   - Menampilkan `settings?.shortName ?? siteConfig.shortName` pada logo brand header.

3. **`src/components/public/footer.tsx`**:
   - Menerima props optional `settings?: SiteSetting`.
   - Menampilkan `shortName`, `name`, `address`, `motto`, `email`, dan `phone` dari basis data.

4. **`src/app/(public)/kontak/page.tsx`**:
   - Server Component `async`: memanggil `const settings = await getSiteSettings()`.
   - Merender alamat, jam operasional, link WhatsApp, email, tautan SP4N-LAPOR, serta iframe Google Maps secara dinamis dari database.

5. **`src/app/(public)/page.tsx` (Beranda)**:
   - Memanggil `const settings = await getSiteSettings()`.
   - Menampilkan `settings.tagline`, `settings.motto`, dan nama lembaga dari basis data.

---

## 4. Keamanan & Ketahanan Sistem (Resiliency)

1. **Proteksi Autentikasi**: Mutasi data identitas instansi hanya dapat dilakukan oleh pengguna yang memiliki sesi aktif terverifikasi.
2. **Graceful Fallback**: Semua komponen publik memiliki fallback ke data default `siteConfig` sehingga sistem tahan terhadap kegagalan jaringan atau kondisi database cold start.
3. **No Downtime & Instan**: Pemanggilan `revalidatePath("/", "layout")` memastikan konten publik terbarukan seketika tanpa perlu restart proses server.

---

## 5. Rencana Pengujian & Verifikasi

1. **Skrip Verifikasi Basis Data (`scripts/verify-settings-db.ts`)**:
   - Membaca konfigurasi `SiteSetting` awal.
   - Melakukan update nilai uji coba (misal: penambahan tanda asterik pada `tagline`).
   - Membaca kembali data dan memastikan nilai telah terupdate di PostgreSQL.
   - Mengembalikan data ke kondisi semula (*rollback*).
2. **Pengujian Dev Server**:
   - Membuka `http://localhost:3003/profile-ifk/admin/pengaturan`.
   - Mengubah salah satu data (misal `tagline` atau nomor telepon) dan klik "Simpan Perubahan".
   - Membuka halaman Beranda (`/profile-ifk/`), Kontak (`/profile-ifk/kontak`), dan Footer untuk memverifikasi perubahan langsung tampil.
3. **Validasi CI Pipeline**:
   - Memastikan lulus TypeScript type check, linting, dan build Next.js di GitHub Actions.
