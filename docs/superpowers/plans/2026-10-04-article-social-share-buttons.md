# Fitur Berbagi Artikel ke Media Sosial dan Salin Tautan Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengembangkan fitur tombol berbagi artikel (WhatsApp, Telegram, Facebook, X, Salin Tautan, dan Web Share API) dengan skema *Dual Bar* (Compact Bar di atas dan Rich Callout Card di bawah) pada halaman publik baca berita (`/berita/[slug]`).

**Architecture:** Mempertahankan halaman `/berita/[slug]/page.tsx` sebagai Server Component murni. Mengisolasi seluruh interaksi, penanganan clipboard, dan Web Share API ke dalam Client Component mandiri `src/components/public/article-share-bar.tsx` dengan varian `compact` dan `card`.

**Tech Stack:** Next.js 16 (App Router, Server & Client Components), React 19, TypeScript 5, Tailwind CSS, Lucide React (ikon navigasi & fallback).

## Global Constraints

- Halaman publik mengikuti tema *Clean Light* (tanpa kelas `dark:`, latar belakang terang, aksen brand emerald/teal yang tenang).
- Target sentuhan pada perangkat seluler ramah jari (*min-height/width 36-40px*), berjejer rapi, dan tidak meluap (*no horizontal overflow*).
- Hindari menjalankan `next build` atau `tsc` menyeluruh di VPS (RAM 2 GB) guna mencegah OOM; verifikasi dilakukan via dev server lokal dan pengujian fungsional terarah.
- Ramah SSR: tidak mengakses objek `window` secara langsung saat pemuatan awal di server guna mencegah *hydration mismatch*.

---

### Task 1: Pembuatan Komponen Interaktif `ArticleShareBar`

**Files:**
- Create: `src/components/public/article-share-bar.tsx`
- Reference: `src/components/public/footer.tsx` (pola SVG ikon sosial)

**Interfaces:**
```typescript
export interface ArticleShareBarProps {
  title: string;
  slug: string;
  variant?: "compact" | "card";
  className?: string;
}
```

- [ ] **Step 1: Buat komponen `src/components/public/article-share-bar.tsx`**
  - Definisikan ikon SVG inline presisi untuk WhatsApp, Telegram, Facebook, X (Twitter), dan impor `Copy`, `Check`, `Share2` dari `lucide-react`.
  - Implementasikan logika deteksi URL aktif (`window.location.origin` dengan fallback `/berita/[slug]`).
  - Implementasikan fungsi salin ke papan klip (`navigator.clipboard.writeText` + fallback `document.execCommand("copy")`) dengan umpan balik visual 2 detik.
  - Implementasikan fungsi *Native Web Share API* jika `navigator.share` tersedia.
  - Sediakan tata letak `compact` (deretan tombol ikonik di samping label *"Bagikan:"*) dan `card` (kartu beraksen *Clean Light* dengan teks ajakan dan tombol *chip*).
- [ ] **Step 2: Jalankan pemeriksaan berkas mandiri**
  - Pastikan tidak ada kesalahan sintaks atau tipe impor.
- [ ] **Step 3: Komit perubahan Task 1**
  - `git add src/components/public/article-share-bar.tsx`
  - `git commit -m "feat(berita): buat komponen article-share-bar dengan varian compact dan card (#121)"`

---

### Task 2: Integrasi `ArticleShareBar` pada Halaman Detail Berita

**Files:**
- Modify: `src/app/(public)/berita/[slug]/page.tsx`

- [ ] **Step 1: Impor dan pasang `ArticleShareBar` varian `compact`**
  - Diletakkan di dalam `<header>` setelah blok metadata penulis, tanggal, dan estimasi waktu baca.
  - Diberi pembatas garis halus atas (`border-t border-border/60 pt-4 mt-5`).
- [ ] **Step 2: Impor dan pasang `ArticleShareBar` varian `card`**
  - Diletakkan di dalam `<section className="pb-16 sm:pb-24 pt-2 sm:pt-4">` tepat di bawah kontainer naskah artikel `prose`.
  - Diberi jarak atas (`mt-10 sm:mt-12`).
- [ ] **Step 3: Komit perubahan Task 2**
  - `git add src/app/(public)/berita/[slug]/page.tsx`
  - `git commit -m "feat(berita): pasang dual share bar pada halaman detail berita (#121)"`

---

### Task 3: Verifikasi Fungsionalitas dan Integrasi Dev Server

**Files:**
- Create: `scripts/verify-article-share.ts`

- [ ] **Step 1: Buat skrip verifikasi otomatis `scripts/verify-article-share.ts`**
  - Mengambil data artikel publik aktif dari basis data atau dummy data.
  - Memanggil rute HTTP lokal `http://localhost:3003/profile-ifk/berita/[slug]`.
  - Memeriksa kemunculan tombol berbagi WhatsApp, Telegram, Facebook, X, dan Salin Tautan pada dokumen HTML respons.
- [ ] **Step 2: Jalankan skrip verifikasi**
  - `npx tsx scripts/verify-article-share.ts`
- [ ] **Step 3: Uji fungsionalitas di browser / curl**
  - Pastikan respons HTTP berstatus 200 OK dan tidak ada hydration error di konsol.
- [ ] **Step 4: Bersihkan skrip verifikasi bila tidak diperlukan atau pertahankan sebagai artefak uji**
  - `git add scripts/verify-article-share.ts`
  - `git commit -m "test(berita): tambahkan verifikasi fungsionalitas tombol berbagi artikel (#121)"`
