# Rencana Implementasi: Optimasi OpenGraph Metadata & Pratinjau Media Sosial

> **Untuk Agentic Workers:** Ikuti setiap task secara berurutan. Buat branch fitur dari `develop` sebelum implementasi kode.

**Terkait Issue:** [#112](https://github.com/ramanovaris/profile-ifk/issues/112)  
**Terkait Spesifikasi:** `docs/superpowers/specs/2026-10-04-opengraph-social-preview-design.md`  
**Goal:** Melengkapi seluruh halaman publik website Profile IFK dengan metadata OpenGraph (`og:*`), Twitter Card (`summary_large_image`), URL kanonikal, dan pratinjau berita dinamis berbasis cover image serta ringkasan cuplikan artikel.  
**Architecture:** Memanfaatkan native Next.js 16 App Router Metadata API (`metadataBase`, `Metadata`, `generateMetadata`) secara deklaratif dan statis/dinamis tanpa membebani memori CPU/RAM server.  
**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Prisma 6, Node.js.

---

## Batasan Global & Konvensi
1. **Hemat RAM VPS:** Dilarang menjalankan `npx next build` atau `npx tsc` di lingkungan VPS lokal. Verifikasi dilakukan dengan skrip verifikasi HTTP ringan terhadap dev server aktif di port 3003 dan pengecekan sintaksis file.
2. **GitFlow:** Base branch adalah `develop`. Buat feature branch `feat/112-opengraph-social-previews` sebelum menyentuh kode.
3. **Atomic Commits:** Setiap task diselesaikan dengan verifikasi dan commit tersendiri berformat Conventional Commits.
4. **URL Kanonikal & Gambar Absolut:** Seluruh URL gambar dan kanonikal terselesaikan menjadi URL absolut melalui `metadataBase`.

---

## Daftar Berkas yang Dibuat / Dimodifikasi
| Berkas | Aksi | Tanggung Jawab |
|---|---|---|
| `src/lib/string.ts` | Buat | Helper `stripHtmlAndTruncate` untuk mengekstrak cuplikan 160 karakter teks bersih dari HTML/Markdown |
| `scripts/test-og-excerpt.ts` | Buat | Unit test logika pembersih HTML & pembatas karakter cuplikan teks |
| `src/app/layout.tsx` | Modifikasi | Menambahkan `metadataBase`, pola `title.template`, Twitter card `summary_large_image`, dan OpenGraph bawaan |
| `src/app/(public)/page.tsx` | Modifikasi | Menambahkan metadata statis halaman Beranda & URL kanonikal |
| `src/app/(public)/profil/page.tsx` | Modifikasi | Menambahkan metadata statis halaman Profil & URL kanonikal |
| `src/app/(public)/layanan/page.tsx` | Modifikasi | Menambahkan metadata statis halaman Layanan (gambar Cold Room) & URL kanonikal |
| `src/app/(public)/stok/page.tsx` | Modifikasi | Memperkaya metadata statis halaman Stok Obat & URL kanonikal |
| `src/app/(public)/berita/page.tsx` | Modifikasi | Memperkaya metadata statis halaman Indeks Berita & URL kanonikal |
| `src/app/(public)/kontak/page.tsx` | Modifikasi | Menambahkan metadata statis halaman Kontak & URL kanonikal |
| `src/app/(public)/berita/[slug]/page.tsx` | Modifikasi | Mengoptimalkan `generateMetadata` dinamis dengan ringkasan cuplikan, cover image riil, author, tanggal terbit, dan kanonikal |
| `scripts/verify-opengraph-metadata.ts` | Buat | Skrip pengujian otomatis HTTP untuk memvalidasi tag OpenGraph, Twitter Card, dan kanonikal di seluruh 7 rute publik |

---

## Rincian Task

### Task 1: Helper Pembersih Cuplikan Teks & Unit Test Logika
**Files:**
- Create: `src/lib/string.ts`
- Create: `scripts/test-og-excerpt.ts`

**Interfaces:**
- Produces: `stripHtmlAndTruncate(content: string, maxLength?: number): string`

- [ ] **Step 1: Tulis skrip unit test logika pembersih teks** — `write_file('scripts/test-og-excerpt.ts', ...)`
- [ ] **Step 2: Jalankan skrip test untuk memastikan gagal sebelum implementasi** — `npx tsx scripts/test-og-excerpt.ts` (harus FAIL karena `src/lib/string.ts` belum ada)
- [ ] **Step 3: Buat implementasi minimal di `src/lib/string.ts`** — membersihkan tag HTML, baris baru ganda, decode entity dasar, dan memotong hingga batas maksimal dengan tanda elipsis `...`
- [ ] **Step 4: Jalankan unit test kembali hingga berhasil** — `npx tsx scripts/test-og-excerpt.ts` (harus PASS 100%)
- [ ] **Step 5: Commit** — `git add src/lib/string.ts scripts/test-og-excerpt.ts && git commit -m "feat(seo): helper ekstraksi cuplikan teks untuk metadata deskripsi #112"`

---

### Task 2: Pondasi Global `metadataBase` & Kartu Sosial Default
**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `process.env.NEXT_PUBLIC_SITE_URL` atau fallback `"http://43.129.57.214/profile-ifk"`
- Produces: Global `metadataBase`, `title.template`, default `openGraph`, default `twitter:card`

- [ ] **Step 1: Patch `src/app/layout.tsx`** dengan konfigurasi `metadataBase`, openGraph siteName, locale, default images lanskap kantor IFK, dan twitter card `summary_large_image`.
- [ ] **Step 2: Verifikasi respons dev server** — `curl -s http://localhost:3003/profile-ifk/ | grep -i "og:site_name"`
- [ ] **Step 3: Commit** — `git add src/app/layout.tsx && git commit -m "feat(seo): konfigurasi metadataBase dan default opengraph di root layout #112"`

---

### Task 3: Penambahan Metadata Statis 6 Halaman Publik
**Files:**
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/(public)/profil/page.tsx`
- Modify: `src/app/(public)/layanan/page.tsx`
- Modify: `src/app/(public)/stok/page.tsx`
- Modify: `src/app/(public)/berita/page.tsx`
- Modify: `src/app/(public)/kontak/page.tsx`

- [ ] **Step 1: Patch `page.tsx` Beranda** — export `metadata: Metadata` dengan title `"Beranda"`, deskripsi, alternates canonical `/`, openGraph.
- [ ] **Step 2: Patch `profil/page.tsx`** — export `metadata: Metadata` dengan title `"Profil & Struktur Organisasi"`, deskripsi, alternates canonical `/profil`.
- [ ] **Step 3: Patch `layanan/page.tsx`** — export `metadata: Metadata` dengan title `"Standar Pelayanan & Distribusi"`, deskripsi, alternates canonical `/layanan`, gambar Cold Room `/images/cold-room-ifk.webp`.
- [ ] **Step 4: Patch `stok/page.tsx`** — perbarui `metadata` dengan alternates canonical `/stok` dan openGraph.
- [ ] **Step 5: Patch `berita/page.tsx`** — perbarui `metadata` dengan alternates canonical `/berita` dan openGraph.
- [ ] **Step 6: Patch `kontak/page.tsx`** — export `metadata: Metadata` dengan title `"Kontak & Layanan Pengaduan"`, deskripsi, alternates canonical `/kontak`.
- [ ] **Step 7: Verifikasi respons HTML halaman statis** — request curl ke masing-masing halaman untuk memastikan tag og:title dan canonical muncul.
- [ ] **Step 8: Commit** — `git add src/app/(public) && git commit -m "feat(seo): metadata opengraph dan url kanonikal untuk 6 halaman publik #112"`

---

### Task 4: Metadata Dinamis Detail Berita (`/berita/[slug]`)
**Files:**
- Modify: `src/app/(public)/berita/[slug]/page.tsx`

- [ ] **Step 1: Patch fungsi `generateMetadata`** pada `src/app/(public)/berita/[slug]/page.tsx`:
  - Ambil `title`, `content`, `coverImage`, `publishedAt`, `isPublished`, dan `author.name`.
  - Jika dari database tidak ditemukan, cek `dummyArticles`.
  - Gunakan `stripHtmlAndTruncate` untuk membuat `description`.
  - Tetapkan `openGraph`: type `"article"`, `publishedTime`, `authors`, `images` (dari coverImage atau fallback ke `/images/kantor-ifk.webp`).
  - Tetapkan `twitter`: card `"summary_large_image"`, title, description, images.
  - Tetapkan `alternates`: canonical `/berita/${slug}`.
- [ ] **Step 2: Verifikasi endpoint detail berita** — `curl -s http://localhost:3003/profile-ifk/berita/sosialisasi-sistem-informasi-kefarmasian | grep -i "og:image"`
- [ ] **Step 3: Commit** — `git add src/app/(public)/berita/[slug]/page.tsx && git commit -m "feat(seo): metadata dinamis artikel warta dengan cover image dan ringkasan #112"`

---

### Task 5: Skrip Verifikasi Otomatis & Pembuatan Pull Request
**Files:**
- Create: `scripts/verify-opengraph-metadata.ts`

- [ ] **Step 1: Tulis skrip verifikasi komprehensif** `scripts/verify-opengraph-metadata.ts` yang menguji status 200 OK serta keberadaan tag `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, dan `canonical` pada seluruh 7 halaman publik.
- [ ] **Step 2: Jalankan skrip verifikasi** — `npx tsx scripts/verify-opengraph-metadata.ts` (harus lulus 100%).
- [ ] **Step 3: Push branch fitur dan buat Pull Request** — `git push -u origin feat/112-opengraph-social-previews` dan `gh pr create`.
- [ ] **Step 4: Pantau CI GitHub Actions** — `gh pr checks` untuk memastikan build/lint CI remote hijau.
- [ ] **Step 5: Laporkan hasil pengujian kepada user untuk peninjauan akhir**.
