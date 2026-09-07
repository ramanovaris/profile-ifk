# Implementasi Redesain Halaman Profil Pengguna Admin (Dark Ethereal)

> **For agentic workers:** Gunakan `delegate_task()` atau eksekusi sekuensial terstruktur sesuai aturan VPS Profile IFK.

**Goal:** Meng-upgrade halaman profil admin (`src/app/(admin)/admin/profil/page.tsx`) dengan tema Dark Ethereal, arsitektur layout Grid 2-kolom responsif, kartu identitas & metadata akun sticky di sisi kiri, serta form informasi pribadi dan keamanan kata sandi interaktif dengan toggle intip sandi dan banner feedback in-page.

**Architecture:** Next.js Client Component di `src/app/(admin)/admin/profil/page.tsx` dengan reactive local state untuk informasi profil dan form sandi, integrasi token Dark Ethereal (`bg-zinc-950`, `bg-zinc-900/60 backdrop-blur-xl border-white/5`), sticky left rail pada viewport desktop (`lg:sticky lg:top-6`), toggle show/hide password dengan ikon `Eye`/`EyeOff`, dan notifikasi alert elegan pengganti popup browser.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Shadcn UI (`Button`, `Input`, `Label`, `Avatar`).

---

## Global Constraints
- **DILARANG** menjalankan `npm run build`, `npm run lint`, dan `npx tsc --noEmit` di VPS lokal. Seluruh pengujian build dan typecheck didelegasikan ke runner GitHub Actions melalui commit & push.
- Gunakan aturan `@media(hover: hover)` pada semua hover tombol/interaksi untuk mencegah sticky hover di browser touchscreen mobile.
- Token focus ring form standar: `border-brand-500/60 ring-2 ring-brand-500/40`.
- Hindari `leading-none` pada teks status/badge agar tidak terpotong pada layar berdensitas piksel pecahan. Gunakan `text-xs font-medium` (line-height 16px).
- Jangan mendefinisikan React component di dalam component lain (mencegah unmount/remount dan hilangnya fokus keyboard).

---

## Tasks

### Task 1: Setup Branch & Rancang Struktur Grid 2-Kolom Serta Kartu Profil Kiri

**Files:**
- Create/Branch: `feat/admin-profil-dark-ethereal` dari `develop`
- Modify: `src/app/(admin)/admin/profil/page.tsx`

**Interfaces:**
- Kontainer utama: `grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`.
- Kolom Kiri (`lg:col-span-4 lg:sticky lg:top-6`):
  - Kartu Dark Ethereal dengan ambient top glow radial.
  - Avatar inisial `AD` (`h-20 w-20 sm:h-24 sm:w-24`) dengan ring brand dan tombol kamera interaktif.
  - Teks nama tampilan reaktif (`displayName`), handle `@admin`, badge pill `Super Admin`.
  - Metadata akun: Status Akun (Aktif dengan pulsing green dot), Hak Akses (Full Access), dan Terdaftar Sejak (15 Januari 2024).

**Langkah-langkah:**
- [ ] **Step 1: Checkout branch baru dari `develop`**
  ```bash
  git checkout -b feat/admin-profil-dark-ethereal
  ```
- [ ] **Step 2: Buat struktur layout dasar dan kartu identitas kiri di `page.tsx`**
  - Pasang header halaman "Profil Pengguna" dan deskripsi.
  - Susun kartu profil sisi kiri dengan token `bg-zinc-900/60 backdrop-blur-xl border-white/5`.
  - Tambahkan list metadata akun di bawah profil.
- [ ] **Step 3: Verifikasi respons dev server**
  ```bash
  curl -I http://localhost:3003/profile-ifk/admin/profil
  ```
- [ ] **Step 4: Commit perubahan Task 1**
  ```bash
  git add src/app/\(admin\)/admin/profil/page.tsx
  git commit -m "feat(admin): bangun layout grid 2-kolom dan kartu identitas profil tema dark ethereal"
  ```

---

### Task 2: Implementasi Form Informasi Pribadi (Kartu 1) & Feedback Banner

**Files:**
- Modify: `src/app/(admin)/admin/profil/page.tsx`

**Interfaces:**
- Kolom Kanan (`lg:col-span-8`): Kartu 1 "Informasi Pribadi".
- State: `displayName`, `email`, `infoSuccessMessage`, `infoErrorMessage`.
- Field:
  - Nama Lengkap (editable, icon `<User />`).
  - Username Sistem (read-only dengan background disabled, icon `<Lock />`, dan keterangan keamanan).
  - Alamat Email (editable, icon `<Mail />`).
- Feedback Banner: In-page notification bertema emerald glow saat data berhasil disimpan.

**Langkah-langkah:**
- [ ] **Step 1: Rancang Kartu Informasi Pribadi**
  - Pasang header kartu dengan icon `<User />` beraksen brand.
  - Tambahkan field input dengan standard focus ring `border-brand-500/60 ring-2 ring-brand-500/40`.
  - Berikan tombol "Simpan Perubahan" berikon `<Save />`.
- [ ] **Step 2: Pasang State & Handler `handleSaveInfo`**
  - Update `displayName` dan `email`.
  - Tampilkan banner feedback in-page menggantikan browser `alert(...)`.
- [ ] **Step 3: Commit perubahan Task 2**
  ```bash
  git add src/app/\(admin\)/admin/profil/page.tsx
  git commit -m "feat(admin): tambah form informasi pribadi dan feedback banner di halaman profil"
  ```

---

### Task 3: Implementasi Form Keamanan & Kata Sandi (Kartu 2) dengan Show/Hide Toggle

**Files:**
- Modify: `src/app/(admin)/admin/profil/page.tsx`

**Interfaces:**
- Kolom Kanan (`lg:col-span-8`): Kartu 2 "Keamanan & Kata Sandi".
- State: `oldPassword`, `newPassword`, `confirmPassword`, `showOldPassword`, `showNewPassword`, `showConfirmPassword`, `passwordSuccessMessage`, `passwordErrorMessage`.
- Field Password:
  - Kata Sandi Lama (toggle `Eye`/`EyeOff`).
  - Kata Sandi Baru (toggle `Eye`/`EyeOff`).
  - Konfirmasi Kata Sandi Baru (toggle `Eye`/`EyeOff`).
- Hint Keamanan: Kotak saran password kuat berikon `<ShieldCheck />`.
- Validasi:
  - Cek panjang kata sandi baru (minimal 8 karakter).
  - Cek kesesuaian kata sandi baru dan konfirmasi.

**Langkah-langkah:**
- [ ] **Step 1: Rancang Kartu Keamanan & Kata Sandi**
  - Header kartu dengan icon `<KeyRound />` beraksen emerald.
  - 3 input password dengan tombol toggle mata `Eye`/`EyeOff` di sisi kanan input.
  - Kotak hint keamanan minimal 8 karakter.
- [ ] **Step 2: Pasang State & Handler `handleChangePassword`**
  - Validasi error jika konfirmasi tidak cocok atau panjang kurang dari 8 karakter.
  - Tampilkan banner error / sukses in-page.
  - Bersihkan field input sandi saat berhasil disimpan.
- [ ] **Step 3: Commit perubahan Task 3**
  ```bash
  git add src/app/\(admin\)/admin/profil/page.tsx
  git commit -m "feat(admin): tambah form keamanan kata sandi dengan toggle intip dan validasi"
  ```

---

### Task 4: Polish Responsivitas, Buat Pull Request & Pantau CI

**Files:**
- Modify: `src/app/(admin)/admin/profil/page.tsx`
- Track: `docs/superpowers/specs/2026-09-07-admin-profil-dark-ethereal-design.md`, `docs/superpowers/plans/2026-09-07-admin-profil-dark-ethereal.md`

**Langkah-langkah:**
- [ ] **Step 1: Pastikan semua tombol terlindungi dengan `[@media(hover:hover)]` dan active scale**
- [ ] **Step 2: Commit dokumen spec dan plan serta final touch styling**
  ```bash
  git add docs/superpowers/
  git commit -m "docs: tambahkan spec dan plan redesain halaman profil admin dark ethereal"
  ```
- [ ] **Step 3: Push branch ke GitHub dan buat Pull Request**
  ```bash
  git push -u origin feat/admin-profil-dark-ethereal
  gh pr create --title "feat(admin): redesain halaman profil admin tema dark ethereal" --base develop
  ```
- [ ] **Step 4: Verifikasi status CI run GitHub Actions**
  ```bash
  gh pr checks
  ```
- [ ] **Step 5: Verifikasi dev server HTTP 200**
  ```bash
  curl -I http://localhost:3003/profile-ifk/admin/profil
  ```
