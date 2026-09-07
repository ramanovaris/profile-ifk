# Dark Ethereal Toast Notifications (Batch 1) Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Membangun sistem notifikasi toast native Dark Ethereal (zero-dependency) dan mengintegrasikannya ke modul Master Kategori dan Kelola Berita.

**Architecture:** Modul observer listener pattern di `src/components/ui/toast.tsx` yang mengekspos utilitas `toast` global dan komponen viewport `<Toaster />`. Komponen dipasang di root `AdminShell` sehingga aktif di seluruh halaman admin. Setiap aksi CRUD memicu toast dengan tipe (success, error, info, warning) dan auto-dismiss 3.5 detik.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons.

## Global Constraints
- Dilarang menambahkan dependensi eksternal baru (`package.json` tetap bersih).
- Dilarang menjalankan `npm run build`, `npm run lint`, dan `npx tsc --noEmit` di VPS lokal (validasi didelegasikan ke CI GitHub Actions).
- Mengikuti tema visual Dark Ethereal: `bg-zinc-900/95 backdrop-blur-xl border border-white/10` dengan aksen warna semantik.
- Responsif: Desktop (kanan bawah `bottom-6 right-6`), Mobile (bawah layar `bottom-4 inset-x-4`).

---

### Task 1: Buat Komponen Fondasi Toast (`src/components/ui/toast.tsx`)

**Files:**
- Create: `src/components/ui/toast.tsx`

**Interfaces:**
- Produces:
  - `toast.success(message: string, title?: string): string`
  - `toast.error(message: string, title?: string): string`
  - `toast.info(message: string, title?: string): string`
  - `toast.warning(message: string, title?: string): string`
  - `toast.dismiss(id: string): void`
  - Component `<Toaster />`

- [ ] **Step 1: Tulis implementasi `src/components/ui/toast.tsx`** dengan observer store, auto-dismiss timeout timer, container responsif, dan styling Dark Ethereal.
- [ ] **Step 2: Commit fondasi komponen toast** (`feat(admin): buat komponen toast native dark ethereal`).

---

### Task 2: Pasang `<Toaster />` di `AdminShell` (`src/components/admin/admin-shell.tsx`)

**Files:**
- Modify: `src/components/admin/admin-shell.tsx`

**Interfaces:**
- Consumes: `<Toaster />` dari `@/components/ui/toast`
- Produces: Viewport toast aktif di seluruh halaman admin yang dibungkus `AdminShell`

- [ ] **Step 1: Import `<Toaster />`** dan pasang tepat sebelum penutup tag container utama di `src/components/admin/admin-shell.tsx`.
- [ ] **Step 2: Commit integrasi shell** (`feat(admin): pasang toaster viewport di admin shell`).

---

### Task 3: Integrasi Toast di Modul Master Kategori (`/admin/kategori`)

**Files:**
- Modify: `src/app/(admin)/admin/kategori/page.tsx`

**Interfaces:**
- Consumes: `toast` dari `@/components/ui/toast`

- [ ] **Step 1: Import `toast`** di `src/app/(admin)/admin/kategori/page.tsx`.
- [ ] **Step 2: Pasang toast pada Tambah Kategori, Edit Kategori, Toggle Status, dan Hapus Kategori**.
- [ ] **Step 3: Commit integrasi kategori** (`feat(admin): integrasikan notifikasi toast di modul kategori`).

---

### Task 4: Integrasi Toast di Modul Kelola Berita (`/admin/berita` & `article-form.tsx`)

**Files:**
- Modify: `src/app/(admin)/admin/berita/page.tsx`
- Modify: `src/components/admin/article-form.tsx`

**Interfaces:**
- Consumes: `toast` dari `@/components/ui/toast`

- [ ] **Step 1: Ganti `alert(...)` di `src/app/(admin)/admin/berita/page.tsx`** dengan `toast.success("Artikel berhasil dihapus")`.
- [ ] **Step 2: Ganti `alert(...)` di `src/components/admin/article-form.tsx`** dengan `toast.error("Isi konten artikel wajib diisi")` dan `toast.success(...)`.
- [ ] **Step 3: Commit integrasi berita** (`feat(admin): integrasikan notifikasi toast di modul berita`).

---

### Task 5: Push ke GitHub, Buka PR, dan Verifikasi CI

- [ ] **Step 1: Push branch `feat/admin-toast-notifications` ke remote origin**.
- [ ] **Step 2: Buka Pull Request ke `develop`**.
- [ ] **Step 3: Pantau CI GitHub Actions hingga status PASS**.
- [ ] **Step 4: Minta review pengguna sebelum melanjutkan ke Batch 2**.
