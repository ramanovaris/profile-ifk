# Implementasi Fitur Pengurutan Data (Sorting) Interaktif pada Tabel Berita Admin (Issue #60)

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengembangkan fitur pengurutan data (*sorting*) multi-kolom yang responsif dan interaktif pada tabel kelola artikel berita di panel admin (`/admin/berita`), mencakup pengurutan judul, kategori, status publikasi, dan tanggal terbit, terintegrasi dengan URL query parameters (`?sort=...&order=...`).

**Architecture:** Menggunakan logika pengurutan *in-memory* di sisi klien untuk respon instan 0ms tanpa membebani server VPS 2GB, dipadukan dengan sinkronisasi halus ke URL query params via `useSearchParams()` dan `router.replace(..., { scroll: false })` agar posisi pengurutan tetap persisten saat halaman di-*refresh* atau tautan dibagikan.

**Tech Stack:** Next.js (App Router, Client Component hooks), React 19, Tailwind CSS, Lucide React Icons (`ArrowUpDown`, `ArrowUp`, `ArrowDown`), TypeScript.

## Global Constraints
- Jangan menjalankan `next build` atau `npx tsc` di VPS (hemat CPU/RAM 2GB; serahkan ke GitHub Actions CI).
- Tetap patuhi aturan React 19 / ESLint (tidak mendefinisikan komponen di dalam komponen, hindari `setState` cascading di `useEffect`).
- Posisi layar tidak boleh meloncat saat sorting berubah (`{ scroll: false }`).
- Paginasi otomatis reset ke halaman 1 saat sorting atau arah urutan diubah.
- Gunakan bahasa Indonesia untuk komunikasi, commit, dan teks UI.

---

### Task 1: Logika Komparator Pengurutan & Skrip Verifikasi Otomatis

**Files:**
- Create: `src/lib/article-sorting.ts`
- Create: `scripts/verify-admin-articles-sorting.ts`

**Interfaces:**
- Input: `articles: ArticleItem[]`, `sortKey: SortKey`, `sortOrder: SortOrder`
- Output: `ArticleItem[]` (array terurut tanpa memutasi array asli)
- Type definitions:
  * `type SortKey = 'title' | 'category' | 'isPublished' | 'publishedAt';`
  * `type SortOrder = 'asc' | 'desc';`

- [ ] **Step 1: Tulis skrip verifikasi otomatis** — Buat `scripts/verify-admin-articles-sorting.ts` untuk memvalidasi:
  1. Pengurutan judul alfabetis Indonesia (A–Z dan Z–A).
  2. Pengurutan nama kategori alfabetis (A–Z dan Z–A).
  3. Pengurutan status publikasi (Terbit dahulu vs Draft dahulu).
  4. Pengurutan tanggal terbit kronologis (terbaru vs terlama) dengan tie-breaker `createdAt`.
  5. Konsistensi imutabilitas (tidak memutasi array masukan asli).
- [ ] **Step 2: Implementasikan fungsi `sortArticles`** — Tulis fungsi murni pada `src/lib/article-sorting.ts` dengan penanganan komparator `localeCompare` dan perbandingan numerik tanggal.
- [ ] **Step 3: Jalankan verifikasi pengujian** — Eksekusi `npx tsx scripts/verify-admin-articles-sorting.ts` dan pastikan seluruh skenario lulus (PASS).
- [ ] **Step 4: Commit** — `git add src/lib/article-sorting.ts scripts/verify-admin-articles-sorting.ts && git commit -m "feat(berita): buat fungsi modular komparator sorting artikel dan skrip pengujian (#60)"`

---

### Task 2: Integrasi Sinkronisasi URL Query Param & State Sorting pada `ArticleTable`

**Files:**
- Modify: `src/app/(admin)/admin/berita/article-table.tsx`

**Interfaces:**
- Membaca `sort` dan `order` dari `useSearchParams()`.
- Menggunakan `useRouter` dan `usePathname` untuk memperbarui URL query params secara halus via `router.replace(url, { scroll: false })`.
- Menerapkan `sortArticles` di antara pipeline filter dan paginasi:
  `optimisticArticles` $\rightarrow$ filter $\rightarrow$ `sortedArticles` $\rightarrow$ paginasi.
- Mereset `currentPage` ke 1 saat `sortKey` atau `sortOrder` berubah.

- [ ] **Step 1: Tambahkan state dan sinkronisasi URL** — Inisialisasi `sortKey` dan `sortOrder` dari URL query params, pasang fungsi pembantu `handleSortChange(key: SortKey)` yang memperbarui state dan URL.
- [ ] **Step 2: Integrasikan urutan pipeline data** — Terapkan `sortArticles` pada hasil penyaringan `filteredArticles` sebelum dipotong oleh paginasi.
- [ ] **Step 3: Commit** — `git add src/app/(admin)/admin/berita/article-table.tsx && git commit -m "feat(berita): integrasikan state sorting dan sinkronisasi url query param pada article-table (#60)"`

---

### Task 3: Desain Header Tabel Interaktif dengan Ikon Lucide & Aksesibilitas (UI/UX)

**Files:**
- Modify: `src/app/(admin)/admin/berita/article-table.tsx`

**Interfaces:**
- Elemen header `<th>` untuk kolom `Artikel`, `Kategori`, `Status`, dan `Tanggal Terbit` memuat tombol interaktif.
- Ikon indikator pengurutan Lucide:
  * `ArrowUpDown`: kolom tidak aktif (redup).
  * `ArrowUp`: kolom aktif dengan arah ascending (menyala warna brand).
  * `ArrowDown`: kolom aktif dengan arah descending (menyala warna brand).
- Dukungan atribut WAI-ARIA (`aria-sort="ascending|descending|none"`), `aria-label`, dan navigasi keyboard (`Enter`/`Space`).
- Siklus arah klik:
  * Kolom belum aktif: `publishedAt` default `desc`, kolom lainnya default `asc`.
  * Kolom sedang aktif: membalikkan arah (`asc` $\leftrightarrow$ `desc`).

- [ ] **Step 1: Desain komponen header kolom interaktif** — Ganti teks statis `<th>` dengan tombol interaktif berikon indikator dan hover effect.
- [ ] **Step 2: Hubungkan event klik ke `handleSortChange`** — Pastikan siklus klik dan reset paginasi berfungsi mulus.
- [ ] **Step 3: Commit** — `git add src/app/(admin)/admin/berita/article-table.tsx && git commit -m "feat(berita): implementasi header tabel interaktif berikon dan ramah aksesibilitas (#60)"`

---

### Task 4: Pengujian Menyeluruh (End-to-End Verification & Server HTTP Check)

**Files:**
- Modify: `scripts/verify-admin-articles-sorting.ts`

- [ ] **Step 1: Perluas skrip pengujian HTTP** — Tambahkan uji request HTTP lokal ke dev server port 3003 (`http://localhost:3003/profile-ifk/admin/berita?sort=title&order=asc`, `?sort=publishedAt&order=desc`, dll) untuk memastikan status 200 OK.
- [ ] **Step 2: Jalankan skrip pengujian penuh** — Eksekusi `npx tsx scripts/verify-admin-articles-sorting.ts` dan pastikan seluruh pengujian 100% PASS.
- [ ] **Step 3: Commit** — `git add scripts/verify-admin-articles-sorting.ts && git commit -m "test(berita): verifikasi menyeluruh fungsi sorting dan respon http endpoint admin (#60)"`

---

### Task 5: Pembuatan Pull Request & Penyiapan Panduan Pengujian Manual

- [ ] **Step 1: Push branch feature ke GitHub remote** — `git push -u origin feat/60-admin-berita-sorting`
- [ ] **Step 2: Buat Pull Request di GitHub** — Gunakan `gh pr create` dengan judul formal, referensi Issue #60, dan redaksi e-Kinerja PNS.
- [ ] **Step 3: Susun skenario panduan pengujian di HP / desktop** — Sediakan langkah pengujian interaktif untuk Mas Rama.
