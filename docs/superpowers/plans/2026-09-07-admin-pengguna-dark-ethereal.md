# Implementasi Redesain Halaman Kelola Pengguna (Dark Ethereal)

> **For agentic workers:** Gunakan `delegate_task()` atau eksekusi sekuensial terstruktur sesuai aturan VPS Profile IFK.

**Goal:** Meng-upgrade halaman kelola pengguna admin (`/admin/pengguna`) dan penanganan rute (`/admin/pengguna/baru`) dengan tema Dark Ethereal, modal dialog in-place (Tambah/Edit, Reset Sandi, Hapus), search & filter toolbar, serta paginasi terpadu.

**Architecture:** Next.js Client Component di `src/app/(admin)/admin/pengguna/page.tsx` dengan local state reactivity (`dummyUsers`), modal dialog in-place Shadcn Radix UI, dan token visual Dark Ethereal yang konsisten dengan halaman Berita dan Kategori. Rute `/admin/pengguna/baru` diarahkan otomatis ke `/admin/pengguna`.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Shadcn Radix UI (`Dialog`, `Button`, `Input`, `Label`, `Badge`).

---

## Global Constraints
- **DILARANG** menjalankan `npm run build`, `npm run lint`, dan `npx tsc --noEmit` di VPS lokal. Seluruh pengujian build dan typecheck didelegasikan ke runner GitHub Actions melalui commit & push.
- Gunakan aturan `@media(hover: hover)` pada semua hover tombol/interaksi untuk mencegah sticky hover di browser touchscreen mobile.
- Token focus ring form standar: `border-brand-500/60 ring-2 ring-brand-500/40`.
- Hindari `leading-none` pada teks status/badge agar tidak terpotong pada layar berdensitas piksel pecahan. Gunakan `text-xs font-medium` (line-height 16px).
- Jangan mendefinisikan React component di dalam component lain (mencegah unmount/remount dan hilangnya fokus keyboard).

---

## Tasks

### Task 1: Branch Setup & Redirect Halaman `/admin/pengguna/baru`

**Files:**
- Create/Branch: `feat/admin-pengguna-dark-ethereal` dari `develop`
- Modify: `src/app/(admin)/admin/pengguna/baru/page.tsx`

**Interfaces:**
- Mengarahkan siapa pun yang mengakses URL lama `/admin/pengguna/baru` langsung ke `/admin/pengguna`.

**Langkah-langkah:**
- [ ] **Step 1: Checkout branch baru**
  ```bash
  git checkout -b feat/admin-pengguna-dark-ethereal
  ```
- [ ] **Step 2: Perbarui `src/app/(admin)/admin/pengguna/baru/page.tsx`**
  Tambahkan efek redirect otomatis menggunakan `next/navigation` (`useRouter` & `useEffect`) dengan fallback UI Dark Ethereal saat proses pengalihan berlangsung.
- [ ] **Step 3: Verifikasi respons dev server**
  ```bash
  curl -I http://localhost:3003/profile-ifk/admin/pengguna/baru
  ```
- [ ] **Step 4: Commit perubahan Task 1**
  ```bash
  git add src/app/\(admin\)/admin/pengguna/baru/page.tsx
  git commit -m "refactor(admin): alihkan rute pengguna baru ke halaman utama pengguna"
  ```

---

### Task 2: Implementasi Halaman Utama `/admin/pengguna/page.tsx` dengan Tema Dark Ethereal

**Files:**
- Modify: `src/app/(admin)/admin/pengguna/page.tsx`

**Interfaces:**
- Menampilkan daftar pengguna dari `dummyUsers` dalam kartu tabel Dark Ethereal.
- State: `searchQuery`, `roleFilter` (`ALL` | `SUPER_ADMIN` | `STAFF`), `currentPage`, `itemsPerPage`.
- Paginasi: Selector baris (5, 10, 20), info rentang data, navigasi prev/next.

**Langkah-langkah:**
- [ ] **Step 1: Rancang Header & Toolbar Pencarian & Filter Peran**
  - Ambient header: Judul "Kelola Pengguna", deskripsi, dan tombol "+ Tambah Pengguna" (emerald glow).
  - Search bar dengan icon `<Search />` dan tombol reset.
  - Filter peran pills: *Semua*, *Super Admin*, *Staff*.
- [ ] **Step 2: Rancang Tabel Dark Ethereal Card**
  - Kolom Pengguna: Inisial Avatar bergradien + Nama Lengkap + `@username`.
  - Kolom Peran: Badge Dark Ethereal (`SUPER_ADMIN` emerald, `STAFF` sky).
  - Kolom Tanggal: Format tanggal lokal Indonesia.
  - Kolom Aksi: Tombol Edit, Reset Sandi, dan Hapus dengan hover guard `[@media(hover:hover)]`.
- [ ] **Step 3: Rancang Empty State & Pagination Bar**
  - Tampilan jika pencarian nihil dengan icon `<Users />`.
  - Footer paginasi lengkap.
- [ ] **Step 4: Commit perubahan Task 2**
  ```bash
  git add src/app/\(admin\)/admin/pengguna/page.tsx
  git commit -m "feat(admin): redesain tabel dan filter kelola pengguna tema dark ethereal"
  ```

---

### Task 3: Integrasi Modal In-Place (Tambah/Edit, Reset Sandi, dan Hapus)

**Files:**
- Modify: `src/app/(admin)/admin/pengguna/page.tsx`

**Interfaces:**
- State: `isUserModalOpen`, `editUser`, `isResetPasswordOpen`, `resetPasswordTarget`, `deleteId`.
- Validasi:
  - Form Pengguna: Nama lengkap & username wajib. Username unik. Password wajib saat Tambah, opsional saat Edit.
  - Reset Sandi: Password baru minimal 6 karakter dan konfirmasi harus cocok.
  - Hapus Pengguna: Guard proteksi akun `admin` (tidak bisa dihapus).

**Langkah-langkah:**
- [ ] **Step 1: Pasang Modal Tambah / Edit Pengguna**
  - Modal dengan icon badge `<UserPlus />` atau `<Pencil />`.
  - Input nama, username, password, dan selector peran (STAFF vs SUPER_ADMIN).
  - Focus ring standar form admin: `border-brand-500/60 ring-2 ring-brand-500/40`.
  - Tombol simpan beraksen emerald glow & batal terpusat.
- [ ] **Step 2: Pasang Modal Reset Sandi Pengguna**
  - Modal mandiri dengan icon badge `<KeyRound />` amber glow.
  - Input password baru dan konfirmasi password baru dengan pesan error inline jika tidak cocok.
- [ ] **Step 3: Pasang Dialog Konfirmasi Hapus Pengguna**
  - Dialog peringatan bahaya dengan icon badge `<AlertTriangle />` merah.
  - Info ringkas pengguna target.
  - Banner peringatan dan tombol hapus disabled jika akun adalah `admin`.
- [ ] **Step 4: Commit perubahan Task 3**
  ```bash
  git add src/app/\(admin\)/admin/pengguna/page.tsx
  git commit -m "feat(admin): integrasikan modal tambah edit, reset sandi, dan hapus pengguna"
  ```

---

### Task 4: Validasi, Push ke Remote, & Buka Pull Request

**Files:**
- Git repository & GitHub PR

**Langkah-langkah:**
- [ ] **Step 1: Uji aksesibilitas endpoint pada dev server**
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/profile-ifk/admin/pengguna
  ```
  Pastikan mengembalikan status `200`.
- [ ] **Step 2: Push branch ke GitHub**
  ```bash
  git push -u origin feat/admin-pengguna-dark-ethereal
  ```
- [ ] **Step 3: Buka Pull Request ke `develop`**
  ```bash
  gh pr create --base develop --head feat/admin-pengguna-dark-ethereal --title "feat(admin): redesain halaman kelola pengguna tema dark ethereal" --body "..."
  ```
- [ ] **Step 4: Pantau CI GitHub Actions**
  Pastikan workflow lint, typecheck, dan build di GitHub Actions selesai dengan status **PASS**.
