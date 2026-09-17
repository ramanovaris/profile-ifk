# Penyesuaian Elemen Call-to-Action Hero dan Redaksi Kontak Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Menyelaraskan tombol aksi (CTA) pada Hero Section beranda publik dan redaksi halaman kontak agar mencerminkan identitas instansi pemerintah daerah yang berorientasi pada pelayanan publik dan transparansi ketersediaan obat.

**Architecture:** Modifikasi langsung pada antarmuka publik Next.js App Router (`src/app/(public)/page.tsx` dan `src/app/(public)/kontak/page.tsx`) dengan memanfaatkan komponen native `Link`, ikon Lucide (`Pill`), dan token Tailwind CSS yang sudah ada tanpa menambah dependensi baru.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS, Lucide React, TypeScript.

## Global Constraints

- **Hemat RAM VPS:** Dilarang menjalankan `next build` atau `tsc` di VPS (serahkan verifikasi berat ke GitHub Actions CI). Verifikasi lokal melalui dev server port `3003` yang sedang berjalan (`curl -I` dan browser).
- **Standar Redaksi:** Bebas istilah korporat/SaaS komersial dan bebas istilah teknis database/backend.
- **Standar Aksesibilitas:** Touch target minimal 44px, kontras teks memadai, tidak ada overflow horizontal pada layar ponsel (Android Chrome).

---

### Task 1: Penyesuaian Tombol CTA Hero Beranda

**Files:**
- Modify: `src/app/(public)/page.tsx:1-35, 114-135`

**Detail Perubahan:**
1. Menambahkan import ikon `Pill` dari pustaka `lucide-react`.
2. Memperbarui markup tombol aksi:
   - Tombol utama: `Lihat Layanan` (`/layanan`) diubah dari `rounded-full` menjadi `rounded-xl`, padding dan shadow diselaraskan.
   - Tombol sekunder: Mengganti teks `Hubungi Kami` menjadi `Ketersediaan Obat` (`/stok`), menggunakan bentuk `rounded-xl`, border `border-white/15 bg-white/5`, serta menyematkan ikon `Pill`.

**Langkah Kerja:**
- [ ] **Step 1:** Modifikasi file `src/app/(public)/page.tsx` dengan patch terarah.
- [ ] **Step 2:** Verifikasi via `curl -s http://127.0.0.1:3003/ | grep -E "Ketersediaan Obat|Lihat Layanan"` untuk memastikan output HTML ter-render dengan benar.
- [ ] **Step 3:** Verifikasi visual responsif pada dev server port 3003.

---

### Task 2: Penyelarasan Header Halaman Kontak

**Files:**
- Modify: `src/app/(public)/kontak/page.tsx:50-60`

**Detail Perubahan:**
Memperbarui properti `PageHero`:
- `eyebrow="Pelayanan Publik"`
- `title="Layanan Kontak & Informasi"`
- `subtitle="Saluran resmi komunikasi, konsultasi kefarmasian, dan layanan pengaduan terpadu UPTD Instalasi Farmasi Kabupaten Kotabaru."`

**Langkah Kerja:**
- [ ] **Step 1:** Modifikasi file `src/app/(public)/kontak/page.tsx` dengan patch terarah.
- [ ] **Step 2:** Verifikasi via `curl -s http://127.0.0.1:3003/kontak | grep -E "Layanan Kontak & Informasi|Pelayanan Publik"` untuk memastikan output HTML ter-render dengan benar.
- [ ] **Step 3:** Minta ulasan dan verifikasi user pada perangkat HP/browser.

---

### Task 3: Commit, Push, Pull Request, dan Project Board Update

**Files:**
- Commit: `src/app/(public)/page.tsx`, `src/app/(public)/kontak/page.tsx`, `docs/superpowers/plans/2026-09-17-hero-cta-and-contact-alignment.md`

**Langkah Kerja:**
- [ ] **Step 1:** Commit perubahan implementasi dan berkas plan ke git.
- [ ] **Step 2:** Push branch `feat/72-hero-cta-contact-alignment` ke origin.
- [ ] **Step 3:** Buka Pull Request ke branch `develop` dengan deskripsi `Closes #72`.
- [ ] **Step 4:** Sinkronisasi status Issue #72 dan PR pada GitHub Project Board "PNS" ke status `In progress`.
- [ ] **Step 5:** Monitor GitHub Actions CI workflow hingga lulus 100%.
