# Implementasi Konsumsi Basis Data PostgreSQL pada Daftar Berita Publik dan Beranda (Issue #58)

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengintegrasikan daftar artikel berita pada halaman publik (`/berita`) dan cuplikan berita beranda (`/`) dengan basis data PostgreSQL via Prisma ORM, dilengkapi filter kategori dinamis dan paginasi asinkron "Muat Berita Lainnya" (*Load More*).

**Architecture:** Halaman Server-Side Rendering (SSR) untuk SEO dan pemuatan awal 12 artikel terbit pertama serta kategori aktif, dipasangkan dengan komponen interaktif klien (`BeritaClientView`) dan Server Action publik (`getPublicArticlesAction`) untuk filter dinamis dan pemuatan bertahap. Halaman Beranda mengambil 3 artikel terbit terbaru secara server-side dengan isolasi draf ketat.

**Tech Stack:** Next.js (App Router, Server Components & Server Actions), Prisma ORM, PostgreSQL, Tailwind CSS, Lucide Icons, TypeScript.

## Global Constraints
- Jangan menjalankan `next build` atau `npx tsc` di VPS (ramah memori 2GB; serahkan pada GitHub Actions CI).
- Tetap patuhi aturan ESLint React 19 (`useSyncExternalStore` jika membutuhkan client mount, jangan cascading `setState`).
- Seluruh artikel draf (`isPublished: false`) terisolasi 100% dari publik.
- Gunakan bahasa Indonesia untuk komunikasi, commit, dan penamaan UI.

---

### Task 1: Buat Server Action Publik `getPublicArticlesAction`

**Files:**
- Modify: `src/actions/article.ts`
- Create: `scripts/verify-public-articles.ts`

**Interfaces:**
- Input: `{ page?: number; limit?: number; categorySlug?: string; search?: string }`
- Output: `{ articles: Array<{ id, title, slug, coverImage, categoryName, categorySlug, publishedAt }>, total: number, hasMore: boolean }`

- [ ] **Step 1: Tulis skrip verifikasi otomatis** — Buat `scripts/verify-public-articles.ts` yang memanggil fungsi Server Action dan memvalidasi isolasi draf, filter kategori, dan paginasi.
- [ ] **Step 2: Implementasi Server Action** — Tambahkan `getPublicArticlesAction` pada `src/actions/article.ts` dengan sanitasi masukan, filter `isPublished: true`, relasi `category`, dan limit/skip.
- [ ] **Step 3: Jalankan verifikasi pengujian** — Eksekusi `npx tsx scripts/verify-public-articles.ts` untuk memastikan query berhasil dan draf tidak bocor.
- [ ] **Step 4: Commit** — `git add src/actions/article.ts scripts/verify-public-articles.ts && git commit -m "feat(berita): buat server action publik getPublicArticlesAction dengan isolasi draf (#58)"`

---

### Task 2: Buat Komponen Klien Interaktif `BeritaClientView`

**Files:**
- Create: `src/components/public/berita-client-view.tsx`

**Interfaces:**
- Props:
  * `initialArticles`: Array artikel awal dari SSR
  * `categories`: Array master kategori aktif (`id`, `name`, `slug`)
  * `initialTotal`: Jumlah total artikel awal
  * `initialHasMore`: Boolean ketersediaan artikel lanjutan

- [ ] **Step 1: Implementasi antarmuka klien** — Buat `src/components/public/berita-client-view.tsx` dengan state pencarian, filter kategori pil dinamis, grid kartu artikel berbezel, indikator loading spinner, dan tombol "Muat Berita Lainnya".
- [ ] **Step 2: Integrasikan debounce dan Server Action** — Pasang debounce 300ms untuk input pencarian dan hubungkan tombol "Muat Berita Lainnya" ke `getPublicArticlesAction`.
- [ ] **Step 3: Commit** — `git add src/components/public/berita-client-view.tsx && git commit -m "feat(berita): buat komponen klien interaktif berita-client-view dengan filter dan load more (#58)"`

---

### Task 3: Refactor Halaman Daftar Berita Publik (`/berita`)

**Files:**
- Modify: `src/app/(public)/berita/page.tsx`

**Interfaces:**
- Server Component SSR yang mengambil 12 artikel terbit pertama dari Prisma ORM dan master kategori aktif dari `db.category`.

- [ ] **Step 1: Ubah `page.tsx` menjadi Server Component** — Hapus `"use client"` dari `src/app/(public)/berita/page.tsx`, fetch data dari `db.article` dan `db.category`, pasang fallback aman ke `dummyArticles` jika database kosong.
- [ ] **Step 2: Render PageHero dan `BeritaClientView`** — Teruskan data awal ke `BeritaClientView`.
- [ ] **Step 3: Commit** — `git add src/app/(public)/berita/page.tsx && git commit -m "feat(berita): integrasikan basis data postgresql pada halaman daftar berita publik (#58)"`

---

### Task 4: Integrasi Basis Data pada Halaman Beranda (`/`)

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Query 3 artikel terbit terbaru (`isPublished: true`, `orderBy: { publishedAt: 'desc' }`, `take: 3`) langsung dari `db.article`.

- [ ] **Step 1: Ganti `dummyArticles` dengan query `db.article`** — Ambil artikel terbit dari PostgreSQL via Prisma pada `HomePage`.
- [ ] **Step 2: Pasang fallback aman** — Gunakan fallback ke `dummyArticles` bila data di PostgreSQL kosong.
- [ ] **Step 3: Commit** — `git add src/app/(public)/page.tsx && git commit -m "feat(beranda): konsumsi 3 artikel terbit terbaru postgresql pada beranda publik (#58)"`

---

### Task 5: Pengujian Menyeluruh (End-to-End Verification)

**Files:**
- Modify: `scripts/verify-public-articles.ts`

- [ ] **Step 1: Perluas skrip pengujian HTTP** — Tambahkan uji request HTTP lokal ke endpoint `http://localhost:3003/profile-ifk/berita` dan `http://localhost:3003/profile-ifk/`.
- [ ] **Step 2: Jalankan skrip verifikasi** — Eksekusi pengujian dan pastikan seluruh skenario lulus (100% PASS).
- [ ] **Step 3: Commit** — `git add scripts/verify-public-articles.ts && git commit -m "test(berita): tambahkan verifikasi otomatis integrasi basis data berita publik dan beranda (#58)"`
