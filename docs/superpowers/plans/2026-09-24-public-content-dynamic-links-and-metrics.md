# Implementation Plan: Dinamisasi Konten Halaman Publik (Tautan Dokumen & Metrik Utama)

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mendinamisasi tautan unduhan formulir layanan, indikator beranda, statistik SDM profil, dan jam pelayanan ke PostgreSQL melalui menu Admin Pengaturan Website sehingga staf dinas dapat memperbaruinya tanpa ubah kode program.

**Architecture:** Memperluas skema model `SiteSetting` di Prisma dengan field-field operasional baru lengkap dengan *default values* riil, menambahkan Server Actions `updateSitePublicContentAction` berproteksi Super Admin dengan *auto-revalidate*, menambahkan tab Dokumen & Statistik pada `/admin/pengaturan`, serta menghubungkan *Server Component* publik (`/`, `/profil`, `/layanan`) ke `getSiteSettings()`.

**Tech Stack:** Next.js App Router (Turbopack), Prisma ORM, PostgreSQL, Tailwind CSS, Lucide React, Server Actions.

## Global Constraints
- Mematuhi memori VPS: **Jangan jalankan `next build` atau `tsc` di VPS (RAM 2GB)**; verifikasi sintaks via `node_modules` atau runtime curl, serahkan pengujian tipe menyeluruh ke GitHub Actions CI.
- Server dev berjalan di port 3003 (`http://localhost:3003/profile-ifk/`).
- Desain Admin: Tema *Dark Ethereal* (`bg-zinc-950/60`, border `border-white/10`, teks `text-zinc-100`).
- Desain Publik: Tema *Clean Light* dengan hierarki keterbacaan tajam (`text-zinc-700`, WCAG AA).

---

### Task 1: Skema Prisma & Sinkronisasi Basis Data

**Files:**
- Modify: `prisma/schema.prisma:113-147`

**Interfaces:**
- Menambahkan field baru pada model `SiteSetting`:
  - `lplpoUrl` String @default(...)
  - `permintaanSewaktuUrl` String @default(...)
  - `statsFaskesCount` String @default("30 Faskes")
  - `statsFaskesLabel` String @default("28 Puskesmas & 2 RSUD")
  - `statsPulauCount` String @default("45 Pulau")
  - `statsPulauLabel` String @default("Jangkauan Kepulauan")
  - `statsMasyarakatCount` String @default("334 Ribu+")
  - `statsMasyarakatLabel` String @default("Masyarakat Terlayani")
  - `sdmTotalCount` String @default("24 Orang")
  - `sdmApotekerCount` String @default("5 Orang")
  - `sdmTtkCount` String @default("7 Orang")
  - `sdmPendukungCount` String @default("11 Orang")
  - `saranaGudangLuas` String @default("690 m²")

- [ ] **Step 1: Modifikasi schema.prisma** — patch model `SiteSetting`.
- [ ] **Step 2: Jalankan prisma db push & generate** — `npx prisma db push && npx prisma generate`.
- [ ] **Step 3: Verifikasi skema di basis data** — pastikan kolom baru terbentuk tanpa menghapus data yang ada.
- [ ] **Step 4: Commit** — `git commit -m "feat(db): tambah kolom tautan dokumen dan metrik publik pada sitesetting (#104)"`.

---

### Task 2: Server Actions & Fallback Configuration

**Files:**
- Modify: `src/actions/setting.ts`

**Interfaces:**
- Mengembangkan `getSiteSettings()` dengan properti baru dan nilai bawaan *fallback*.
- Membuat `export interface UpdatePublicContentInput`
- Membuat Server Action `updateSitePublicContentAction(data: UpdatePublicContentInput): Promise<SettingActionResult>`
  - Autentikasi sesi & otorisasi `SUPER_ADMIN`.
  - Upsert ke `db.siteSetting` dengan `id: "default"`.
  - Revalidate cache: `"/"`, `"/profil"`, `"/layanan"`, `"/admin/pengaturan"`.

- [ ] **Step 1: Tambahkan interface & fallback di getSiteSettings()**.
- [ ] **Step 2: Implementasi updateSitePublicContentAction()**.
- [ ] **Step 3: Uji panggil action via script / unit test ringan**.
- [ ] **Step 4: Commit** — `git commit -m "feat(actions): tambah updateSitePublicContentAction dan fallback setting (#104)"`.

---

### Task 3: Antarmuka Admin Pengaturan Website

**Files:**
- Modify: `src/app/(admin)/admin/pengaturan/settings-form.tsx`

**Interfaces:**
- Tipe tab `TabKey = "identitas" | "profil" | "tautan" | "dokumen" | "statistik"`
- Form Tab "Dokumen Layanan": input URL LPLPO & Permintaan Sewaktu, tombol Uji Buka Link.
- Form Tab "Statistik & SDM": input metrik Faskes, Pulau, Penduduk, rincian SDM (Apoteker, TTK, Pendukung), luas gudang.

- [ ] **Step 1: Tambahkan state dan tab Dokumen & Statistik di settings-form.tsx**.
- [ ] **Step 2: Implementasi UI tab Dokumen Layanan**.
- [ ] **Step 3: Implementasi UI tab Statistik & SDM**.
- [ ] **Step 4: Sambungkan form submit ke updateSitePublicContentAction()**.
- [ ] **Step 5: Verifikasi tampilan admin via browser/curl**.
- [ ] **Step 6: Commit** — `git commit -m "feat(admin): tambah tab dokumen layanan dan statistik sdm di pengaturan (#104)"`.

---

### Task 4: Integrasi Halaman Publik Layanan (`/layanan`)

**Files:**
- Modify: `src/app/(public)/layanan/page.tsx`

**Interfaces:**
- Panggil `const settings = await getSiteSettings()` di `LayananPage()`.
- Ganti URL hardcoded LPLPO & Permintaan Sewaktu dengan `settings.lplpoUrl` dan `settings.permintaanSewaktuUrl`.
- Sambungkan tabel Jam Pelayanan loket agar mengambil jadwal dari `settings.operationalHours`.

- [ ] **Step 1: Patch LayananPage untuk memuat getSiteSettings()**.
- [ ] **Step 2: Hubungkan kartu unduhan dokumen ke URL dinamis**.
- [ ] **Step 3: Hubungkan tabel jam operasional ke settings.operationalHours**.
- [ ] **Step 4: Verifikasi render halaman layanan via curl / HTTP 200**.
- [ ] **Step 5: Commit** — `git commit -m "feat(layanan): integrasikan unduhan dokumen dan jam layanan dari database (#104)"`.

---

### Task 5: Integrasi Halaman Beranda (`/`) & Profil (`/profil`)

**Files:**
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/(public)/profil/page.tsx`

**Interfaces:**
- `src/app/(public)/page.tsx`: Gantikan array `stats` dengan data dari `settings.statsFaskesCount`, `settings.statsPulauCount`, dll.
- `src/app/(public)/profil/page.tsx`:
  - Panggil `await getSiteSettings()`.
  - Gantikan angka "24 Personel", "5 Apoteker", "7 Tenaga Teknis (TTK)", "11 Tenaga Fungsional & Pendukung" dengan `settings.sdmTotalCount`, dll.
  - Gantikan "Gudang Farmasi 690 m²" dengan `settings.saranaGudangLuas`.

- [ ] **Step 1: Patch page.tsx (Beranda) untuk metrik dinamis**.
- [ ] **Step 2: Patch profil/page.tsx untuk statistik SDM & fasilitas gudang**.
- [ ] **Step 3: Verifikasi render halaman beranda dan profil**.
- [ ] **Step 4: Commit** — `git commit -m "feat(publik): hubungkan metrik beranda dan statistik sdm profil ke database (#104)"`.

---

### Task 6: Verifikasi Akhir, Staging Review & PR

- [ ] **Step 1: Uji alur pembaruan dari Admin ke Halaman Publik (simulasi ganti data)**.
- [ ] **Step 2: Ambil tangkapan layar tampilan mobile via Playwright/Chromium headless**.
- [ ] **Step 3: Push branch fitur ke GitHub & buat Pull Request ke develop**.
- [ ] **Step 4: Pantau CI GitHub Actions hingga lolos pengujian**.
- [ ] **Step 5: Squash merge & perbarui papan proyek SKP PNS**.
