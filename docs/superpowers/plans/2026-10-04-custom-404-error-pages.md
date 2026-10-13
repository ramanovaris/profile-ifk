# Implementasi Halaman 404 Kustom & Penanganan Error Ramah Pengguna

> **Untuk agen pekerja:** Jalankan setiap langkah secara terurut dan terverifikasi.

**Goal:** Mengimplementasikan halaman 404 (*Not Found*) global bertema *Clean Light* resmi IFK Kotabaru serta *Error Boundary* terpisah untuk area publik dan panel admin (*Dark Ethereal*) sesuai Issue #113.

**Architecture:** Memanfaatkan konvensi Next.js App Router (`not-found.tsx` dan `error.tsx`) dengan pendekatan *Dual-Layout*: area publik berpenampilan bersih dan terintegrasi dengan Navbar/Footer resmi, sedangkan area admin mempertahankan estetika *Dark Ethereal* berlatar gelap dengan aksi pemulihan sesi (*reset action*).

**Tech Stack:** Next.js 16.3 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Base UI, tsx.

## Global Constraints

- Sesuai memori VPS: Tidak menjalankan `npm run build` atau `npx tsc` di VPS lokal untuk menghemat RAM (proses build diserahkan ke GitHub Actions CI).
- Seluruh verifikasi dilakukan secara presisi menggunakan skrip `npx tsx scripts/...` dan pengujian respons HTTP pada dev server lokal (port 3003).
- Tidak membocorkan detail teknis sensitif (*database error/credentials*) ke publik.

---

### Task 1: Halaman Global 404 Not Found (`src/app/not-found.tsx`)

**Files:**
- Create: `src/app/not-found.tsx`
- Test: `scripts/verify-custom-404.ts`

**Interfaces:**
- Consumes: `@/components/public/navbar`, `@/components/public/footer`, `@/actions/setting`, `lucide-react`, `@/components/ui/button`.
- Produces: Default export `NotFound()` React Server Component untuk rute tidak ditemukan.

- [ ] **Step 1: Tulis skrip verifikasi gagal awal** — Buat `scripts/verify-custom-404.ts` yang menguji HTTP GET ke URL tidak ada di dev server port 3003 dan memeriksa elemen 404 kustom IFK.
- [ ] **Step 2: Implementasi `src/app/not-found.tsx`** — Buat komponen 404 kustom bertema *Clean Light* dengan header/navbar IFK, badge 404, pesan ramah pengguna, tombol "Kembali ke Beranda" (`/`) dan "Cek Ketersediaan Obat" (`/stok`), serta footer resmi.
- [ ] **Step 3: Jalankan verifikasi** — `npx tsx scripts/verify-custom-404.ts` dan pastikan status HTTP 404 mengembalikan antarmuka kustom IFK.
- [ ] **Step 4: Commit** — `git add src/app/not-found.tsx scripts/verify-custom-404.ts && git commit -m "feat(ui): implementasi halaman 404 kustom bertema resmi IFK (#113)"`

---

### Task 2: Error Boundary Area Publik (`src/app/(public)/error.tsx`)

**Files:**
- Create: `src/app/(public)/error.tsx`
- Test: `scripts/verify-public-error-boundary.ts`

**Interfaces:**
- Consumes: `lucide-react`, `@/components/ui/button`, Next.js error boundary props `{ error: Error & { digest?: string }, reset: () => void }`.
- Produces: Default export `PublicError({ error, reset })` Client Component (`"use client"`).

- [ ] **Step 1: Tulis skrip verifikasi** — Buat `scripts/verify-public-error-boundary.ts` untuk memverifikasi ekspor komponen, proteksi sanitasi error, dan penanganan fungsi `reset()`.
- [ ] **Step 2: Implementasi `src/app/(public)/error.tsx`** — Buat komponen Client Component ramah pengguna bertema *Clean Light* dengan ikon `AlertTriangle`, penjelasan simpatik, tombol "Coba Lagi" (`reset()`), dan tautan "Kembali ke Beranda".
- [ ] **Step 3: Jalankan verifikasi** — `npx tsx scripts/verify-public-error-boundary.ts` dan pastikan lulus.
- [ ] **Step 4: Commit** — `git add src/app/(public)/error.tsx scripts/verify-public-error-boundary.ts && git commit -m "feat(ui): implementasi error boundary ramah pengguna untuk area publik (#113)"`

---

### Task 3: Error Boundary Panel Admin (`src/app/(admin)/admin/error.tsx`)

**Files:**
- Create: `src/app/(admin)/admin/error.tsx`
- Test: `scripts/verify-admin-error-boundary.ts`

**Interfaces:**
- Consumes: `lucide-react`, `@/components/ui/button`, Next.js error boundary props `{ error: Error & { digest?: string }, reset: () => void }`.
- Produces: Default export `AdminError({ error, reset })` Client Component (`"use client"`).

- [ ] **Step 1: Tulis skrip verifikasi** — Buat `scripts/verify-admin-error-boundary.ts` untuk memverifikasi ekspor komponen dan gaya tema *Dark Ethereal*.
- [ ] **Step 2: Implementasi `src/app/(admin)/admin/error.tsx`** — Buat antarmuka bertema *Dark Ethereal* (`bg-zinc-950`, border `zinc-800`, aksen zamrud/emerald), pesan status operasional, tombol "Coba Muat Ulang" (`reset()`), dan tombol "Kembali ke Dashboard" (`/admin/dashboard`).
- [ ] **Step 3: Jalankan verifikasi** — `npx tsx scripts/verify-admin-error-boundary.ts` dan pastikan lulus.
- [ ] **Step 4: Commit** — `git add src/app/(admin)/admin/error.tsx scripts/verify-admin-error-boundary.ts && git commit -m "feat(admin): implementasi error boundary bertema dark ethereal untuk panel admin (#113)"`

---

### Task 4: Verifikasi Integrasi End-to-End & Pembersihan

**Files:**
- Test: `scripts/verify-all-error-pages.ts`

- [ ] **Step 1: Tulis skrip verifikasi integrasi E2E** — Uji respons URL publik sembarang, URL artikel berita fiktif (`/profile-ifk/berita/slug-fiktif-12345`), dan endpoint terkait.
- [ ] **Step 2: Jalankan skrip verifikasi** — `npx tsx scripts/verify-all-error-pages.ts`.
- [ ] **Step 3: Final Commit & Push** — Siapkan PR ke branch `develop`.
