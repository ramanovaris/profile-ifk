# Rencana Implementasi: Integrasi Sitemap XML & Robots.txt Dinamis

> **Untuk Agentic Workers:** Ikuti setiap langkah secara berurutan. Commit setiap task secara atomik.

**Terkait Issue:** [#114](https://github.com/ramanovaris/profile-ifk/issues/114)  
**Terkait Spesifikasi:** `docs/superpowers/specs/2026-10-04-sitemap-robots-seo-design.md`  
**Goal:** Mengintegrasikan berkas rute Next.js App Router `sitemap.ts` dan `robots.ts` agar seluruh halaman publik dan artikel berita terbit terindeks secara optimal oleh Google Search dengan pembatasan area admin dan dukungan subfolder (`basePath`).  
**Arsitektur:** Native Next.js 16 MetadataRoute API (`MetadataRoute.Sitemap`, `MetadataRoute.Robots`), database Prisma query terisolasi dengan fallback aman.  
**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Prisma 6, Node.js.

---

## Batasan Global & Konvensi
1. **Hemat RAM VPS:** Dilarang menjalankan `npx next build` atau `npx tsc` di lingkungan VPS lokal. Verifikasi dilakukan dengan unit test ringan (`npx tsx scripts/...`) dan skrip verifikasi HTTP terhadap dev server port 3003.
2. **GitFlow:** Base branch adalah `develop`. Branch kerja adalah `feat/114-sitemap-robots-seo`.
3. **Atomic Commits:** Setiap task diselesaikan dengan verifikasi dan commit berformat Conventional Commits.
4. **URL Bersih & Absolut:** Seluruh entri URL pada sitemap dan robots.txt berupa URL absolut yang valid.

---

## Daftar Berkas yang Dibuat / Dimodifikasi
| Berkas | Aksi | Tanggung Jawab |
|---|---|---|
| `docs/superpowers/specs/2026-10-04-sitemap-robots-seo-design.md` | Buat | Spesifikasi teknis arsitektur dan parameter sitemap & robots |
| `docs/superpowers/plans/2026-10-04-sitemap-robots-seo.md` | Buat | Rencana kerja terinci per task |
| `src/lib/seo.ts` | Buat | Helper pembentuk Base URL & URL absolut dengan dukungan `basePath` |
| `scripts/test-seo-url.ts` | Buat | Unit test logika pembentuk Base URL & URL absolut |
| `src/app/sitemap.ts` | Buat | Handler rute Next.js untuk XML Sitemap publik + artikel terbit |
| `src/app/robots.ts` | Buat | Handler rute Next.js untuk robots.txt dengan proteksi `/admin/` |
| `scripts/verify-sitemap-robots.ts` | Buat | Skrip pengujian otomatis HTTP untuk memvalidasi endpoint XML & TXT |

---

## Rincian Task

### Task 1: Spesifikasi & Rencana Implementasi
- [x] Step 1: Buat spesifikasi di `docs/superpowers/specs/2026-10-04-sitemap-robots-seo-design.md`
- [x] Step 2: Buat rencana kerja di `docs/superpowers/plans/2026-10-04-sitemap-robots-seo.md`
- [ ] Step 3: Commit dokumen perencanaan: `git add docs/superpowers/ && git commit -m "docs(seo): spesifikasi dan rencana implementasi sitemap dan robots #114"`

---

### Task 2: Helper URL SEO & Unit Test
**Files:**
- Create: `src/lib/seo.ts`
- Create: `scripts/test-seo-url.ts`

- [ ] Step 1: Tulis skrip unit test `scripts/test-seo-url.ts` yang menguji berbagai variasi kombinasi environment `NEXT_PUBLIC_SITE_URL` dan `NEXT_PUBLIC_BASE_PATH`.
- [ ] Step 2: Jalankan skrip test (harus FAIL sebelum `src/lib/seo.ts` dibuat).
- [ ] Step 3: Implementasikan `src/lib/seo.ts` dengan fungsi `getBaseUrl()` dan `getAbsoluteUrl()`.
- [ ] Step 4: Jalankan unit test kembali (harus PASS 100%).
- [ ] Step 5: Commit: `git add src/lib/seo.ts scripts/test-seo-url.ts && git commit -m "feat(seo): helper resolusi base url dan rute absolut dengan dukungan basepath #114"`

---

### Task 3: Handler Peta Situs Dinamis (`src/app/sitemap.ts`)
**Files:**
- Create: `src/app/sitemap.ts`

- [ ] Step 1: Buat `src/app/sitemap.ts` yang mendefinisikan 6 rute publik inti (`/`, `/profil`, `/layanan`, `/stok`, `/berita`, `/kontak`) beserta prioritas dan frekuensi perubahan.
- [ ] Step 2: Tambahkan kueri artikel berita terbit (`isPublished: true`) dari Prisma DB dengan mapping ke format sitemap.
- [ ] Step 3: Tambahkan blok `try-catch` pertahanan agar jika koneksi data terganggu, rute inti tetap dikembalikan tanpa galat 500.
- [ ] Step 4: Commit: `git add src/app/sitemap.ts && git commit -m "feat(seo): rute sitemap dinamis untuk rute publik dan artikel berita #114"`

---

### Task 4: Handler Instruksi Perayap (`src/app/robots.ts`)
**Files:**
- Create: `src/app/robots.ts`

- [ ] Step 1: Buat `src/app/robots.ts` yang mengizinkan perayapan halaman publik (`/`), melarang perayapan panel admin (`/admin/`, `/api/`), dan mengarahkan deklarasi sitemap ke URL absolut.
- [ ] Step 2: Commit: `git add src/app/robots.ts && git commit -m "feat(seo): rute robots txt dengan pembatasan area admin dan tautan sitemap #114"`

---

### Task 5: Skrip Verifikasi Mandiri HTTP & Pengujian Dev Server
**Files:**
- Create: `scripts/verify-sitemap-robots.ts`

- [ ] Step 1: Buat skrip `scripts/verify-sitemap-robots.ts` untuk memeriksa endpoint dev server `http://localhost:3003/profile-ifk/sitemap.xml` dan `http://localhost:3003/profile-ifk/robots.txt`.
- [ ] Step 2: Jalankan skrip verifikasi via `npx tsx scripts/verify-sitemap-robots.ts` dan pastikan seluruh assertion lolos (HTTP 200, format XML valid, URL artikel termuat, robots.txt memblokir `/admin/`).
- [ ] Step 3: Commit skrip verifikasi: `git add scripts/verify-sitemap-robots.ts && git commit -m "test(seo): skrip verifikasi http untuk endpoint sitemap xml dan robots txt #114"`

---

### Task 6: Push, Pembuatan PR & Sinkronisasi GitHub Projects
- [ ] Step 1: Push branch `feat/114-sitemap-robots-seo` ke remote origin.
- [ ] Step 2: Buat PR ke `develop` dengan deskripsi terstruktur, referensi `Closes #114`, dan redaksi SKP e-Kinerja.
- [ ] Step 3: Pantau GitHub Actions CI hingga berstatus hijau (PASS).
- [ ] Step 4: Lapor ke Mas Rama untuk peninjauan dan persetujuan penggabungan PR.
