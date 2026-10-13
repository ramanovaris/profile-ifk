# Rencana Implementasi: Modul Kelola Berita Admin Terintegrasi Database PostgreSQL

> **Untuk Pekerja Otomatis / Agent:** Gunakan `delegate_task()` dengan target dan konteks per tugas.

**Tujuan:** Mengintegrasikan panel admin Kelola Berita (`/admin/berita`) ke basis data PostgreSQL VPS via Prisma ORM, Server Actions, penyimpanan gambar sampul lokal, dan seeder idempoten untuk 1 PR e-Kinerja PNS.

**Arsitektur:** Pemisahan Server Component untuk pengambilan data awal (`prisma.article` berelasi `category` dan `author`) dan Client Component (`article-table.tsx`, `article-form.tsx`) untuk interaktivitas responsif (`useOptimistic`, modal konfirmasi, toast feedback). Mutasi data dilakukan melalui Next.js Server Actions dengan penanganan file upload lokal di `public/uploads/articles/`.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, PostgreSQL, Prisma ORM, Node.js `fs/promises`, Lucide React, Tailwind CSS.

## Batasan & Prinsip Utama
- **Filosofi Lazy Senior Developer:** Native platform first, zero external dependency, shortest diff.
- **Resource VPS 2GB:** Pengujian integrasi logika backend dan database dijalankan via skrip mandiri `tsx` (<0.5 detik, RAM <50MB). Proses berat (`next build`, `tsc`) diserahkan ke GitHub Actions CI.
- **Isolasi Tugas e-Kinerja:** 1 PR terfokus untuk modul Admin Berita CRUD; halaman publik (`/berita`) akan diproses pada batch terpisah.
- **Keamanan Berkas:** Validasi tipe MIME (`image/jpeg`, `image/png`, `image/webp`), ukuran maks 2MB, penamaan unik acak, dan penghapusan otomatis file fisik saat artikel dihapus.

---

### Task 1: Inisialisasi Direktori Upload & Pembaruan Seeder Idempoten Berita

**Files:**
- Create: `public/uploads/articles/.gitkeep`
- Modify: `prisma/seed.ts`
- Test: `prisma/seed.ts` via `terminal`

**Interfaces:**
- Consumes: Akun `admin` dari tabel `users` dan kategori master `Kegiatan`, `Informasi` dari tabel `categories`.
- Produces: 4 record artikel awal di tabel `articles` PostgreSQL.

- [ ] **Step 1: Pastikan direktori `public/uploads/articles` tersedia** — buat folder dan `.gitkeep`
- [ ] **Step 2: Perbarui `prisma/seed.ts`** — tambahkan inisialisasi 4 artikel dummy awal dengan upsert berbasis `slug`
- [ ] **Step 3: Eksekusi seeder di PostgreSQL VPS** — jalankan `npx tsx prisma/seed.ts` dan verifikasi 4 row tersimpan
- [ ] **Step 4: Commit** — `git add public/uploads prisma/seed.ts && git commit -m "feat(seed): tambahkan data awal artikel berita pada seeder idempoten"`

---

### Task 2: Implementasi Server Actions Berita & Pengujian Integrasi Database

**Files:**
- Create: `src/actions/article.ts`
- Create: `scripts/verify-article-db.ts`
- Modify: `src/lib/utils.ts` (jika diperlukan penyesuaian helper slug)

**Interfaces:**
- Consumes: `prisma` dari `@/lib/db`, `getCurrentSession` dari `@/lib/auth`, `slugify` dari `@/lib/utils`.
- Produces: 
  - `createArticleAction(formData: FormData): Promise<{ success: boolean; error?: string; articleId?: string }>`
  - `updateArticleAction(id: string, formData: FormData): Promise<{ success: boolean; error?: string }>`
  - `toggleArticlePublishAction(id: string): Promise<{ success: boolean; error?: string; isPublished?: boolean }>`
  - `deleteArticleAction(id: string): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Tulis skrip verifikasi integrasi database `scripts/verify-article-db.ts`** — menguji auth check, create dengan auto-slug & uniqueness, update, toggle publish, dan delete
- [ ] **Step 2: Jalankan skrip test** — pastikan gagal (FAIL) karena `src/actions/article.ts` belum ada
- [ ] **Step 3: Implementasikan `src/actions/article.ts`** — validasi sesi staf, sanitasi input, upload cover image lokal, CRUD Prisma, dan `revalidatePath`
- [ ] **Step 4: Jalankan skrip test kembali** — pastikan seluruh skenario lulus (PASS 100%)
- [ ] **Step 5: Commit** — `git add src/actions/article.ts scripts/verify-article-db.ts && git commit -m "feat(berita): implementasi server actions artikel dan verifikasi integrasi database"`

---

### Task 3: Pemisahan Server Component & Client Component Daftar Berita Admin

**Files:**
- Modify: `src/app/(admin)/admin/berita/page.tsx` (Server Component)
- Create: `src/app/(admin)/admin/berita/article-table.tsx` (Client Component)

**Interfaces:**
- Consumes: `prisma.article` dan `prisma.category` di Server Component, `toggleArticlePublishAction` & `deleteArticleAction` di Client Component.
- Produces: Antarmuka tabel daftar berita admin reaktif, filter kategori dinamis, search, paginasi, dan modal konfirmasi hapus.

- [ ] **Step 1: Buat `src/app/(admin)/admin/berita/article-table.tsx`** — ekstrak antarmuka tabel, state filter/search/pagination, modal hapus, integrasi toast, dan optimistic toggle publish
- [ ] **Step 2: Refaktor `src/app/(admin)/admin/berita/page.tsx`** — ubah menjadi Server Component asinkron yang mengambil data riil dari PostgreSQL via Prisma
- [ ] **Step 3: Verifikasi build & render** — verifikasi server lokal tanpa eror runtime
- [ ] **Step 4: Commit** — `git add src/app/(admin)/admin/berita/ && git commit -m "feat(berita): refaktor halaman daftar berita admin ke server component dan client table"`

---

### Task 4: Integrasi Form Tambah & Edit Berita dengan Server Actions

**Files:**
- Modify: `src/app/(admin)/admin/berita/baru/page.tsx` (Server Component)
- Modify: `src/app/(admin)/admin/berita/[id]/edit/page.tsx` (Server Component)
- Modify: `src/components/admin/article-form.tsx` (Client Component)

**Interfaces:**
- Consumes: Kategori aktif dari DB di `baru/page.tsx` & `[id]/edit/page.tsx`, `createArticleAction` & `updateArticleAction` di `article-form.tsx`.
- Produces: Form tambah/edit artikel yang terhubung ke Server Action dengan loading indicator, preview upload gambar, dan toast notifikasi.

- [ ] **Step 1: Perbarui `baru/page.tsx` & `[id]/edit/page.tsx`** — ambil kategori aktif dari Prisma DB dan teruskan ke `ArticleForm`
- [ ] **Step 2: Refaktor `src/components/admin/article-form.tsx`** — sambungkan submit ke `createArticleAction` / `updateArticleAction` via `useTransition`, tangani upload file sampul dan toast feedback
- [ ] **Step 3: Uji fungsionalitas pengiriman form** — pastikan artikel tersimpan di DB dan diarahkan kembali ke daftar berita
- [ ] **Step 4: Commit** — `git add src/app/(admin)/admin/berita/ src/components/admin/article-form.tsx && git commit -m "feat(berita): integrasi form tambah dan edit artikel dengan database"`

---

### Task 5: Validasi Pengujian Terpadu, Pembuatan Issue e-Kinerja, dan Pull Request

**Files:**
- Semua file terkait modul berita

- [ ] **Step 1: Buat Issue e-Kinerja di GitHub Repo & Daftarkan ke Project PNS** — `gh issue create` dan tambahkan ke board view
- [ ] **Step 2: Jalankan skrip verifikasi integrasi akhir** — `npx tsx scripts/verify-article-db.ts`
- [ ] **Step 3: Buka Pull Request ke branch `develop`** — `gh pr create` dengan deskripsi formal e-Kinerja
- [ ] **Step 4: Verifikasi status CI GitHub Actions** — pantau run hingga status PASS
