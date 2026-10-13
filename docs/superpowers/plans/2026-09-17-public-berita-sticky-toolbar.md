# Rencana Implementasi: Toolbar Pencarian & Filter Kategori Sticky pada Halaman Berita Publik (#74)

> **For agentic workers:** Gunakan `patch` atau `write_file` untuk modifikasi terarah pada `src/components/public/berita-client-view.tsx`. Hindari menjalankan `build`/`tsc` manual di VPS untuk menjaga RAM 2GB.

**Goal:** Menjadikan bilah pencarian dan filter kategori pada halaman Berita & Informasi publik (`/berita`) menempel (*sticky*) di bagian atas layar saat pengguna menggulir daftar artikel, tanpa terhalang floating navbar dan tanpa terganggu oleh containing block animasi `Reveal`.

**Architecture:** Native CSS Sticky positioning dengan pemisahan dari pembungkus `Reveal`, penyesuaian jarak offset vertikal terhadap floating glass navbar (`top-20` pada layar mobile, `top-24` pada layar desktop), penataan z-index bertingkat (`z-30` untuk toolbar, `z-50` untuk navbar & dropdown popover), serta peningkatan opasitas latar belakang kaca buram (*frosted glass*) untuk keterbacaan teks yang optimal.

**Tech Stack:** Next.js 15, Tailwind CSS, Lucide React, TypeScript.

## Global Constraints
- Jangan menjalankan `npm run build`, `lint`, atau `tsc` di VPS (RAM terbatas 2GB, serahkan verifikasi ke CI GitHub Actions).
- Dev server Next.js aktif di port 3003 (`http://43.129.57.214/profile-ifk/berita/`).
- Terapkan perubahan dalam batch kecil (1-2 penyesuaian visual/UX) agar mudah diuji pada perangkat mobile / Chrome Android Desktop site mode.
- Redaksi SKP e-Kinerja bebas istilah teknis backend database.

---

### Task 1: Penerapan Native Sticky pada Toolbar `BeritaClientView`

**Berkas:**
- Modifikasi: `src/components/public/berita-client-view.tsx:220-225`

**Tindakan:**
1. Hapus pembungkus `<Reveal className="relative z-30">` yang melingkupi bilah toolbar pencarian & filter kategori, serta penutup `</Reveal>`-nya.
2. Ganti kontainer bilah toolbar menjadi:
   ```tsx
   {/* ── Toolbar Pencarian & Filter Terpadu Sticky ──────────────── */}
   <div className="sticky top-20 sm:top-24 z-30 mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-surface/90 sm:bg-surface-alt/85 p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all">
   ```
3. Pastikan kisi daftar artikel (`Grid Daftar Artikel`) tetap mempertahankan `<Reveal delay={100}>` dan memiliki jarak vertikal yang rapi.

---

### Task 2: Verifikasi Dev Server & Review Antarmuka di Ponsel

**Tindakan:**
1. Verifikasi dev server di port 3003 merespons `200 OK` via `curl -I http://localhost:3003/profile-ifk/berita/`.
2. Uji langsung pada browser ponsel / desktop via `http://43.129.57.214/profile-ifk/berita/`:
   - [ ] Gulir ke bawah: toolbar tetap melayang di posisi `top-20` (mobile) / `top-24` (desktop).
   - [ ] Jarak aman: tidak bertabrakan dengan floating glass navbar (`h-14` di `top-4`).
   - [ ] Efek kaca buram (*frosted glass*): artikel di belakang toolbar ter-blur halus dan teks kolom input tetap kontras.
   - [ ] Popover filter kategori: dapat dibuka dan dipilih secara lancar saat posisi melayang.
   - [ ] Tombol clear 'X' dan pengetikan pencarian: berfungsi instan tanpa glitch posisi.

---

### Task 3: Git Commit, Push Branch, Pembukaan PR, & Pembaruan Project Board PNS

**Tindakan:**
1. Commit berkas plan dan perubahan kode:
   `git add docs/superpowers/plans/2026-09-17-public-berita-sticky-toolbar.md src/components/public/berita-client-view.tsx`
   `git commit -m "feat(berita): toolbar pencarian dan filter kategori sticky saat gulir (#74)"`
2. Push branch ke remote:
   `git push origin feat/74-berita-sticky-toolbar`
3. Buat Pull Request ke `develop` dengan deskripsi lengkap, tautan penutup `Closes #74`, dan redaksi SKP e-Kinerja.
4. Perbarui status Issue #74 dan PR baru di GitHub Project Board "PNS" ke status **In progress**.
