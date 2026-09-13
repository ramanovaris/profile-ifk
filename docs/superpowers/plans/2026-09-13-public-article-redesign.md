# Public Article Redesign (Issue #62) Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Merancang ulang (*redesign*) tata letak halaman detail berita publik (`/berita/[slug]`) dengan hierarki editorial modern di mana judul dan metadata diletakkan di bagian atas, diikuti oleh foto sampul beresolusi tinggi ekspansif (rasio 16:9 sinematik), naskah isi artikel terpusat (`max-w-3xl`), dan rekomendasi berita terkait berbingkai Dark Ethereal.

**Architecture:** Mengadaptasi struktur Server Component Next.js pada `src/app/(public)/berita/[slug]/page.tsx` untuk menyusun ulang hierarki vertikal elemen, menambahkan estimasi waktu baca (*reading time*) dinamis, menempatkan foto sampul di dalam kontainer ekspansif berbingkai `border-border/50` dengan rasio sinematik, serta memperkuat kontras teks isi artikel.

**Tech Stack:** Next.js App Router (React Server Component), Tailwind CSS, Lucide React Icons, Prisma / PostgreSQL.

## Global Constraints
- Tema Dark Ethereal: latar gelap `zinc-950`/`surface`, border `border/50`, aksen emerald (`brand-400`/`brand-500`).
- Optimalisasi Desktop: target breakpoint `md+` (≥768px), diuji untuk mode *Desktop site* peramban Android Chrome (viewport 1024–1280px).
- Jangan jalankan `next build` atau `tsc` di VPS (hemat CPU/RAM VPS 2GB); serahkan verifikasi build & typecheck penuh ke GitHub Actions CI.
- Pertahankan isolasi proteksi draf (status draft hanya dapat diakses admin dengan `ArticlePreviewBanner`).

---

### Task 1: Buat Skrip Pengujian Otomatis Layout Redesign

**Files:**
- Create: `scripts/verify-public-article-redesign.ts`

**Interfaces:**
- Consumes: Konten komponen `src/app/(public)/berita/[slug]/page.tsx` dan endpoint HTTP lokal `http://localhost:3003/profile-ifk/berita/`
- Produces: Skrip pengujian otomatis mandiri via `npx tsx` untuk memvalidasi urutan elemen (Judul -> Foto -> Konten), kelas responsif (`max-w-5xl`, `rounded-2xl` / `rounded-3xl`), dan ketersediaan HTTP response.

- [ ] **Step 1: Tulis skrip verifikasi otomatis** — `write_file('scripts/verify-public-article-redesign.ts', ...)`
- [ ] **Step 2: Jalankan skrip awal** — Harapkan deteksi struktur lama (FAIL untuk struktur baru)
- [ ] **Step 3: Commit skrip verifikasi** — `git add scripts/verify-public-article-redesign.ts && git commit -m "test: siapkan skrip verifikasi layout baru halaman berita publik"`

---

### Task 2: Redesign Tata Letak Halaman Detail Berita Publik

**Files:**
- Modify: `src/app/(public)/berita/[slug]/page.tsx`

**Interfaces:**
- Consumes: Data artikel dari PostgreSQL (`db.article`) / fallback dummy data, `ArticlePreviewBanner`, `Breadcrumb`, `Badge`.
- Produces: Layout baru sesuai spesifikasi dengan alur vertikal:
  1. `ArticlePreviewBanner` (jika mode draf admin)
  2. Header: Breadcrumb → Badge Kategori → Judul Utama (`h1`) → Baris Metadata (Penulis, Tanggal, Estimasi Waktu Baca)
  3. Foto Sampul Ekspansif: Kontainer `max-w-5xl mx-auto`, `rounded-2xl md:rounded-3xl`, rasio 16:9 sinematik, fallback monogram jika kosong
  4. Isi Naskah Artikel: `max-w-3xl mx-auto`, `prose prose-zinc prose-invert`
  5. Seksi Berita Terkait: `max-w-5xl mx-auto`, 2 kolom grid kartu

- [ ] **Step 1: Terapkan perubahan layout pada `src/app/(public)/berita/[slug]/page.tsx`**
- [ ] **Step 2: Jalankan skrip verifikasi otomatis `npx tsx scripts/verify-public-article-redesign.ts`** — Harapkan PASS
- [ ] **Step 3: Commit perubahan komponen** — `git add src/app/(public)/berita/[slug]/page.tsx && git commit -m "feat(berita): redesign layout halaman detail artikel berita publik"`

---

### Task 3: Verifikasi Endpoint Dev Server Lokal (Port 3003)

**Files:**
- Test endpoint: `http://localhost:3003/profile-ifk/berita/edukasi-vaksinasi-polio`

- [ ] **Step 1: Uji akses HTTP GET menggunakan curl ke dev server Next.js port 3003** — Harapkan status `200 OK`
- [ ] **Step 2: Verifikasi kemunculan elemen judul dan foto sampul pada output HTML**

---

### Task 4: Pembuatan Pull Request & Penyiapan Redaksi e-Kinerja

**Files:**
- Remote branch: `feat/62-redesign-berita-publik`

- [ ] **Step 1: Push branch ke GitHub `origin/feat/62-redesign-berita-publik`**
- [ ] **Step 2: Buat Pull Request menargetkan `develop` via `gh pr create`**
- [ ] **Step 3: Pantau GitHub Actions CI hingga 100% PASS (Green)**
- [ ] **Step 4: Sajikan panduan pengujian visual manual untuk Mas Rama di HP Android mode Desktop site**
