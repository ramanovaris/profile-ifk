# Admin Master Kategori Implementation Plan

> **Goal:** Menambahkan halaman manajemen kategori artikel (`/admin/kategori`) dengan fitur CRUD dinamis dan status Aktif/Non-Aktif.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS, Lucide React, Radix UI Dialog.

---

### Task 1: Update Sidebar & Dummy Data
**Files:**
- Modify: `src/components/admin/admin-shell.tsx`
- Modify: `src/lib/dummy-data.ts`

**Key Updates:**
- Tambahkan link "Kategori" ke `sidebarLinks` di bawah "Berita" menggunakan icon `Tags`.
- Tambahkan `ARTICLE_CATEGORIES_DRAFT` (array status Aktif/Non-Aktif) untuk simulasi data master.
- Tambahkan fungsi `getArticleCountByCategory` ke `dummy-data.ts`.

---

### Task 2: Halaman Master Kategori (`/admin/kategori`)
**Files:**
- Create: `src/app/(admin)/admin/kategori/page.tsx`

**Key Updates:**
- Implementasi tabel kategori dengan status Aktif/Non-Aktif.
- Modal tambah/edit kategori.
- Implementasi delete dengan dialog konfirmasi.
- Tampilan jumlah artikel terkait secara real-time.

---

### Task 3: Verifikasi Build & Live Endpoint
- `npx tsc --noEmit` & `npm run build`.
- Cek `http://127.0.0.1:3003/profile-ifk/admin/kategori/` (HTTP 200).
- Push ke remote & buat PR.
