# Integrasi Database Pengaturan Identitas Instansi & Konsumsi Halaman Publik Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Membangun integrasi basis data PostgreSQL untuk modul Pengaturan Website (Tab 1: Identitas & Kontak Lembaga) dan menghubungkan konsumsi data dinamis ke seluruh halaman publik instansi (Navbar, Footer, Beranda, Kontak, dan Halaman Login).

**Architecture:** Menerapkan Server Component async dengan Server Actions didukung deduplikasi kueri `React.cache()`, fallback otomatis ke `siteConfig` untuk ketahanan sistem, serta revalidasi layout instan `revalidatePath("/", "layout")`.

**Tech Stack:** Next.js 16 (App Router), Prisma ORM, PostgreSQL, Tailwind CSS v4, Lucide React, TypeScript.

## Global Constraints

- Standar Lazy Senior Developer: Native first, shortest diff, zero unnecessary dependencies.
- Jangan jalankan build/lint/tsc di VPS (hemat CPU/RAM); serahkan ke GitHub Actions CI.
- Fail-safe fallback: Semua pembacaan pengaturan wajib memiliki fallback ke data bawaan `siteConfig` agar tidak pernah terjadi error 500 bila database mengalami keterlambatan koneksi.
- Proteksi mutasi: Perubahan pengaturan instansi hanya diizinkan untuk sesi aktif dengan peran `SUPER_ADMIN`.

---

### Task 1: Server Actions Layer (`src/actions/setting.ts`) & Skrip Verifikasi DB (`scripts/verify-settings-db.ts`)

**Files:**
- Create: `src/actions/setting.ts`
- Create: `scripts/verify-settings-db.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `getCurrentSession` from `@/lib/auth`, `siteConfig` from `@/lib/dummy-data`, `SiteSetting` from `@prisma/client`.
- Produces: `getSiteSettings(): Promise<SiteSetting>`, `updateSiteIdentityAction(data: UpdateIdentityInput): Promise<SettingActionResult>`.

- [ ] **Step 1: Buat skrip verifikasi DB `scripts/verify-settings-db.ts`**
  Menguji alur pembacaan data awal `SiteSetting`, proteksi sesi Server Action tanpa login, mutasi data langsung ke basis data, dan rollback data ke kondisi semula.

- [ ] **Step 2: Buat modul `src/actions/setting.ts`**
  Implementasikan `getSiteSettings()` dengan `cache()` dari `react`, serta `updateSiteIdentityAction` dengan validasi input, proteksi `SUPER_ADMIN`, `prisma.siteSetting.upsert`, dan `revalidatePath`.

- [ ] **Step 3: Jalankan verifikasi via `npx tsx scripts/verify-settings-db.ts`**
  Pastikan seluruh uji coba (pembacaan, proteksi sesi, pembaruan data, dan rollback) 100% PASS.

- [ ] **Step 4: Commit task 1**
  `git add src/actions/setting.ts scripts/verify-settings-db.ts && git commit -m "feat(setting): implementasi server actions pengaturan identitas dan verifikasi db (#51)"`

---

### Task 2: Komponen Form Admin Pengaturan (`settings-form.tsx`) & Refaktor Halaman (`page.tsx`)

**Files:**
- Create: `src/app/(admin)/admin/pengaturan/settings-form.tsx`
- Modify: `src/app/(admin)/admin/pengaturan/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings` & `updateSiteIdentityAction` from `@/actions/setting`, `SiteSetting` type.
- Produces: Komponen Server Component async di `page.tsx` dan form interaktif di `settings-form.tsx`.

- [ ] **Step 1: Buat `src/app/(admin)/admin/pengaturan/settings-form.tsx`**
  Ekstrak logika tab dari `page.tsx`. Hubungkan form Tab 1 (Identitas & Kontak) ke `updateSiteIdentityAction` menggunakan `useTransition` dan `toast`. Pertahankan Tab 2 (Profil) dan Tab 3 (Tautan) dengan transisi mulus. Tambahkan tombol "Reset" yang mengembalikan nilai ke `initialSettings`.

- [ ] **Step 2: Refaktor `src/app/(admin)/admin/pengaturan/page.tsx`**
  Ubah menjadi Server Component async yang memanggil `await getSiteSettings()` lalu merender `<SettingsForm initialSettings={settings} />`.

- [ ] **Step 3: Uji endpoint admin via curl**
  `curl -sI http://localhost:3003/profile-ifk/admin/pengaturan | head -n 5` pastikan HTTP 200 / 307.

- [ ] **Step 4: Commit task 2**
  `git add src/app/\(admin\)/admin/pengaturan/ && git commit -m "feat(admin): refaktor halaman pengaturan ke server component dan client settings-form (#51)"`

---

### Task 3: Integrasi Konsumsi Halaman & Komponen Publik

**Files:**
- Modify: `src/app/(public)/layout.tsx`
- Modify: `src/components/public/navbar.tsx`
- Modify: `src/components/public/footer.tsx`
- Modify: `src/app/(public)/kontak/page.tsx`
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings` from `@/actions/setting`, `SiteSetting` type.
- Produces: Seluruh elemen publik (brand navbar, identitas footer, info kontak, tagline beranda) mengonsumsi data langsung dari PostgreSQL.

- [ ] **Step 1: Perbarui `src/components/public/navbar.tsx` & `footer.tsx`**
  Tambahkan prop optional `settings?: SiteSetting` pada `Navbar` dan `Footer` dengan fallback aman ke `siteConfig`.

- [ ] **Step 2: Perbarui `src/app/(public)/layout.tsx`**
  Jadikan `PublicLayout` async, ambil data `const settings = await getSiteSettings()`, dan teruskan ke `<Navbar settings={settings} />` dan `<Footer settings={settings} />`.

- [ ] **Step 3: Perbarui `src/app/(public)/kontak/page.tsx`**
  Panggil `await getSiteSettings()`, ganti referensi statis `siteConfig` dengan data dinamis basis data (alamat, jam kerja, WhatsApp, email, link SP4N, iframe Google Maps).

- [ ] **Step 4: Perbarui `src/app/(public)/page.tsx`**
  Panggil `await getSiteSettings()`, ganti referensi `siteConfig.tagline` dengan data dari basis data.

- [ ] **Step 5: Uji responsivitas rute publik via curl**
  Lakukan curl ke `http://localhost:3003/profile-ifk/`, `http://localhost:3003/profile-ifk/kontak`, `http://localhost:3003/profile-ifk/profil` dan pastikan status HTTP 200 OK.

- [ ] **Step 6: Commit task 3**
  `git add src/app/\(public\)/ src/components/public/ && git commit -m "feat(public): konsumsi data identitas instansi dinamis dari basis data (#51)"`

---

### Task 4: Pengujian Menyeluruh & Pembukaan PR

**Files:**
- None (Verifikasi & QA)

- [ ] **Step 1: Jalankan skrip verifikasi DB**
  `npx tsx scripts/verify-settings-db.ts` dan pastikan 100% PASS.

- [ ] **Step 2: Uji alur live browser / HTTP**
  Pastikan service Next.js dan Nginx menyajikan perubahan dengan benar.

- [ ] **Step 3: Push branch dan buka Pull Request #51**
  `git push -u origin feat/51-admin-pengaturan-db-identitas` dan buat PR ke `develop` dengan link Issue #51.
