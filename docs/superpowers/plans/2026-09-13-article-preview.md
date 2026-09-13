# Fitur Pratinjau (Preview) Artikel Berita Implementation Plan

> **Goal:** Menyediakan fitur pratinjau (preview) artikel berita untuk pengelola admin UPTD IFK Kotabaru, baik melalui tab baru halaman publik ber-banner proteksi draf maupun modal dialog responsif (*live preview*) di form editor.

**Architecture:** 
- Sisi publik (`/berita/[slug]`): Server component membaca dari database PostgreSQL `db.article`, memproteksi draf (`isPublished: false`) hanya untuk sesi admin aktif via `getCurrentSession()` dengan banner indikator draf `ArticlePreviewBanner` (non-admin melempar `notFound()`).
- Sisi tabel admin (`article-table.tsx`): Menambahkan tombol ikon `Eye` yang membuka tab baru ke halaman publik artikel.
- Sisi formulir editor (`article-form.tsx`): Menambahkan tombol `Pratinjau` yang membuka modal dialog interaktif (`ArticlePreviewModal`) berbasis `createPortal` dengan toggle simulasi tampilan Desktop vs Mobile (375px) tanpa harus menyimpan draf ke database terlebih dahulu.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma ORM, Lucide React, PostgreSQL.

## Global Constraints
- Sesuai panduan lingkungan VPS: Jangan jalankan build/lint/tsc berat di server VPS; gunakan verifikasi skrip terfokus (`tsx scripts/...`) dan serahkan kompilasi penuh ke GitHub Actions CI.
- Server dev aktif pada port 3003 (`http://localhost:3003/profile-ifk/`).
- Aksesibilitas keyboard dan dialog modal menggunakan `createPortal` ke `document.body` dengan penanganan tombol `Escape`.
- Tidak ada memory leak: URL object dari input file dibersihkan dengan `URL.revokeObjectURL`.

---

### Task 1: Komponen Banner Indikator Pratinjau Publik

**Files:**
- Create: `src/components/public/article-preview-banner.tsx`

**Interfaces:**
- Produces: `<ArticlePreviewBanner />` component

- [ ] **Step 1: Buat komponen `ArticlePreviewBanner`**
  Komponen UI peringatan bahwa artikel sedang dibuka dalam mode pratinjau draf oleh staf admin.
- [ ] **Step 2: Commit**
  `git add src/components/public/article-preview-banner.tsx && git commit -m "feat(berita): buat komponen banner indikator pratinjau artikel draf"`

---

### Task 2: Integrasi Basis Data PostgreSQL dan Proteksi Draf pada Halaman Publik

**Files:**
- Modify: `src/app/(public)/berita/[slug]/page.tsx`

**Interfaces:**
- Consumes: `db.article`, `getCurrentSession()`, `<ArticlePreviewBanner />`

- [ ] **Step 1: Refaktor `BeritaDetailPage` untuk membaca dari basis data PostgreSQL**
  - Mengambil data dari `db.article.findUnique` berdasarkan `slug`, mencakup relasi `category` dan `author`.
  - Fallback ke `dummyArticles` jika tidak ditemukan di database.
  - Memeriksa `article.isPublished`: jika `false`, periksa `await getCurrentSession()`. Jika tidak ada sesi admin, lempar `notFound()`. Jika ada sesi admin, tandai flag `isPreview = true`.
  - Render banner `ArticlePreviewBanner` tepat di atas judul jika `isPreview` bernilai `true`.
  - Ambil rekomendasi berita terkait dari artikel yang sudah terbit (`db.article.findMany`).
- [ ] **Step 2: Commit**
  `git add src/app/(public)/berita/[slug]/page.tsx && git commit -m "feat(berita): integrasi database dan proteksi hak akses draf pada detail berita publik"`

---

### Task 3: Tombol Aksi Pratinjau Tab Baru di Tabel Berita Admin

**Files:**
- Modify: `src/app/(admin)/admin/berita/article-table.tsx`

**Interfaces:**
- Consumes: `Eye` icon dari `lucide-react`, URL `/berita/${article.slug}`

- [ ] **Step 1: Tambahkan tombol aksi pratinjau pada kolom tabel**
  - Sisipkan tombol tautan `<Link href={`/berita/${article.slug}`} target="_blank" rel="noopener noreferrer">` dengan ikon `Eye` di baris aksi setiap artikel.
  - Berikan tooltip `Pratinjau Artikel di Tab Baru` dan styling konsisten dengan tombol edit (`Pencil`) dan hapus (`Trash2`).
- [ ] **Step 2: Commit**
  `git add src/app/(admin)/admin/berita/article-table.tsx && git commit -m "feat(berita): tambahkan tombol aksi pratinjau tab baru pada tabel berita admin"`

---

### Task 4: Modal Pratinjau Interaktif Responsif (Desktop vs Mobile)

**Files:**
- Create: `src/components/admin/article-preview-modal.tsx`

**Interfaces:**
- Produces: `<ArticlePreviewModal isOpen={boolean} onClose={() => void} data={ArticlePreviewData} />`

- [ ] **Step 1: Buat komponen `ArticlePreviewModal`**
  - Menggunakan `createPortal` ke `document.body` saat `isOpen === true`.
  - Menangani tombol `Escape` untuk menutup modal dan mengunci scroll body (`overflow: hidden`).
  - Toolbar atas: Judul modal "Pratinjau Artikel", badge indikator status, tombol toggle switch `Monitor` (Desktop) vs `Smartphone` (Mobile 375px), dan tombol tutup `X`.
  - Area konten: Menampilkan rasio gambar sampul, breadcrumb simulasi, badge nama kategori, tanggal format Indonesia, nama penulis, judul besar, dan konten HTML `prose`.
- [ ] **Step 2: Commit**
  `git add src/components/admin/article-preview-modal.tsx && git commit -m "feat(berita): buat komponen modal pratinjau artikel responsif desktop dan mobile"`

---

### Task 5: Integrasi Tombol & State Pratinjau di Form Editor Berita

**Files:**
- Modify: `src/components/admin/article-form.tsx`

**Interfaces:**
- Consumes: `<ArticlePreviewModal />`, `Eye` icon dari `lucide-react`

- [ ] **Step 1: Tambahkan state dan tombol pratinjau di `article-form.tsx`**
  - Buat state `isPreviewOpen: boolean`.
  - Hitung data pratinjau secara dinamis:
    * `categoryName`: cari nama kategori dari `categories` berdasarkan `categoryId`.
    * `coverPreview`: jika `coverImage` berupa `File`, gunakan `URL.createObjectURL(coverImage)` dan bersihkan memori saat cleanup. Jika string atau null, gunakan apa adanya.
  - Tambahkan tombol `Pratinjau` dengan ikon `Eye` di bilah tombol aksi bawah.
  - Pasang komponen `<ArticlePreviewModal />`.
- [ ] **Step 2: Commit**
  `git add src/components/admin/article-form.tsx && git commit -m "feat(berita): integrasikan tombol dan modal pratinjau instan pada form editor artikel"`

---

### Task 6: Skrip Verifikasi Integrasi & Keamanan Hak Akses Draf

**Files:**
- Create: `scripts/verify-article-preview.ts`

**Interfaces:**
- Validasi logika keamanan:
  1. Artikel published dapat diakses publik.
  2. Artikel draft melempar notFound untuk non-admin.
  3. Artikel draft dapat diakses jika terdapat sesi admin yang valid.

- [ ] **Step 1: Buat dan jalankan skrip verifikasi otomatis**
  Jalankan via `npx tsx scripts/verify-article-preview.ts`.
- [ ] **Step 2: Commit skrip verifikasi**
  `git add scripts/verify-article-preview.ts && git commit -m "test(berita): tambahkan skrip verifikasi logika hak akses pratinjau draf"`

---

### Task 7: Verifikasi Endpoint & Push ke GitHub

- [ ] **Step 1: Verifikasi HTTP 200 di dev server port 3003**
- [ ] **Step 2: Push branch ke origin dan buat Pull Request #45**
