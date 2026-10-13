# Admin Berita & Form Redesign (Dark Ethereal) Implementation Plan

> **Goal:** Redesain halaman daftar berita (`/admin/berita`), form artikel (`ArticleForm`), serta halaman tambah (`baru`) dan edit ke tema Dark Ethereal.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS, Lucide React, Radix UI Dialog & Select.

---

### Task 1: Redesain Halaman Daftar Berita (`src/app/(admin)/admin/berita/page.tsx`)
**Files:**
- Modify: `src/app/(admin)/admin/berita/page.tsx`

**Key Updates:**
- Tambahkan state pencarian (`searchQuery`) dan filter kategori (`selectedCategory`).
- Filter data dummy secara interaktif berdasarkan input pencarian dan filter kategori.
- Header toolbar: Judul `Kelola Berita`, search bar dark input (`Search` icon), filter pills/dropdown, dan CTA button "Tambah Artikel".
- Tabel daftar berita: container dark glass `bg-zinc-900/60`, status badge glow, aksi Edit & Hapus yang elegan.
- Dark theme confirmation Dialog untuk hapus artikel.

---

### Task 2: Redesain Komponen Form Artikel (`src/components/admin/article-form.tsx`) & Halaman Wrapper (`baru/page.tsx` & `[id]/edit/page.tsx`)
**Files:**
- Modify: `src/components/admin/article-form.tsx`
- Modify: `src/app/(admin)/admin/berita/baru/page.tsx`
- Modify: `src/app/(admin)/admin/berita/[id]/edit/page.tsx`

**Key Updates:**
- Tombol navigasi / back link "Kembali ke Kelola Berita" di atas form.
- Form card glassmorphic `bg-zinc-900/60 border-white/5 backdrop-blur-xl p-6 rounded-2xl`.
- Dark styling untuk: Input judul + auto-slug badge, Select kategori, custom styled file input upload area dengan preview foto, Textarea isi konten, dan toggle checkbox Terbitkan.
- Tombol Simpan & Batal bergaya modern.

---

### Task 3: Verifikasi Build & Live Endpoint
- Jalankan `npx tsc --noEmit` & `npm run build`.
- Curl status 200 di port 3003 untuk rute `/admin/berita`, `/admin/berita/baru`, dan `/admin/berita/1/edit`.
- Push ke remote branch `feat/admin-berita-dark-ethereal` & buat PR.
