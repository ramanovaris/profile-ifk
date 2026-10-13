# Rencana Implementasi: Sinkronisasi Pencarian & Filter Parameter URL serta Kartu Ringkasan Interaktif Ketersediaan Obat

> **Terkait Issue:** [#77](https://github.com/ramanovaris/profile-ifk/issues/77)  
> **Branch Kerja:** `feat/77-stock-url-sync-interactive-cards`  
> **Dokumen Desain:** `docs/superpowers/specs/2026-09-17-stock-url-sync-interactive-cards-design.md`

**Tujuan:** Mengintegrasikan sinkronisasi dua arah parameter tautan URL (`q`, `kategori`, `status`, `page`) pada halaman ketersediaan stok fisik perbekalan farmasi publik (`/stok`) dan panel pengelola (`/admin/stok`), serta mengubah 4 kartu ringkasan kondisi obat menjadi tombol interaktif (*clickable stat cards*) dengan dukungan aksi *toggle-off*.

**Arsitektur:** Menggunakan hook resmi Next.js App Router (`useSearchParams`, `useRouter`, `usePathname`) dengan navigasi non-scroll (`router.replace(targetUrl, { scroll: false })`), membungkus komponen tabel dengan `<Suspense fallback={...}>` pada level halaman server, dan menghubungkan state pemilihan status antara kartu ringkasan dan dropdown filter.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React icons, TypeScript.

## Batasan Khusus Proyek (Global Constraints)
- Menjaga stabilitas VPS 2GB RAM: **Dilarang menjalankan `next build`, `tsc`, atau `lint` lokal** di server; pengujian build diserahkan penuh ke CI GitHub Actions.
- Verifikasi lokal dilakukan melalui dev server aktif di port `3003` dan Nginx reverse proxy `http://43.129.57.214/profile-ifk/`.
- Perubahan visual/UX ditinjau bertahap (1-2 per batch) dan divalidasi pada layar ponsel.
- Dilarang memuat istilah teknis komputasi atau basis data pada antarmuka pengguna.

---

### Task 1: Halaman Publik (`/stok`) — Pembungkusan Suspense, Sinkronisasi URL Params, dan Kartu Stat Interaktif

**Berkas:**
- Modifikasi: `src/app/(public)/stok/page.tsx`
- Modifikasi: `src/components/public/public-stock-client-view.tsx`

**Langkah-langkah:**
1. **Bungkus dengan Suspense di Halaman Server:**
   - Buka `src/app/(public)/stok/page.tsx`, impor `Suspense` dari `react`.
   - Bungkus `<PublicStockClientView initialItems={items} />` dengan `<Suspense fallback={null}>`.
2. **Implementasi Dua Arah URL Params di Komponen Klien:**
   - Buka `src/components/public/public-stock-client-view.tsx`.
   - Impor `useRouter`, `usePathname`, `useSearchParams` dari `next/navigation`.
   - Baca parameter awal dari URL: `q`, `kategori`, `status`, `page`.
   - Inisialisasi state lokal pencarian `search` dari parameter `q` URL.
   - Buat helper `updateUrl` yang membersihkan parameter kosong / default (`page=1`) dan memanggil `router.replace(targetUrl, { scroll: false })`.
   - Tambahkan `useEffect` debounce 350ms untuk sinkronisasi teks pencarian `search` ke URL.
   - Sambungkan perubahan dropdown kategori dan dropdown status ke `updateUrl`.
   - Sambungkan tombol paginasi (*Sebelumnya*, *Selanjutnya*, dan pengubah baris per halaman) ke `updateUrl`.
3. **Ubah 4 Kartu Ringkasan Menjadi Elemen Interaktif (`<button type="button">`):**
   - Kartu 1 (Total Perbekalan): Klik mereset filter status ke `null` (menampilkan semua obat).
   - Kartu 2 (Stok Aman): Klik memfilter status ke `AVAILABLE` (atau toggle-off jika sudah aktif).
   - Kartu 3 (Stok Menipis): Klik memfilter status ke `LOW` (atau toggle-off jika sudah aktif).
   - Kartu 4 (Stok Kosong): Klik memfilter status ke `EMPTY` (atau toggle-off jika sudah aktif).
   - Tambahkan styling interaktif: `cursor-pointer`, transisi hover elevasi, efek tekan `active:scale-[0.98]`, dan indikator ring/border menyala saat status kartu aktif.
4. **Verifikasi:**
   - Jalankan verifikasi via `curl -I "http://127.0.0.1:3003/stok?q=amox&status=AVAILABLE"` & pastikan return HTTP `200 OK`.
   - Verifikasi fungsionalitas di browser: input pencarian ter-update ke URL, klik kartu menyaring data dan mengubah URL.
5. **Commit:**
   - `git add src/app/(public)/stok/page.tsx src/components/public/public-stock-client-view.tsx`
   - `git commit -m "feat(public-stok): sinkronisasi url params dan kartu metrik interaktif (#77)"`

---

### Task 2: Panel Pengelola (`/admin/stok`) — Pembungkusan Suspense, Sinkronisasi URL Params, dan Kartu Stat Interaktif Dark Ethereal

**Berkas:**
- Modifikasi: `src/app/(admin)/admin/stok/page.tsx`
- Modifikasi: `src/app/(admin)/admin/stok/stock-table.tsx`

**Langkah-langkah:**
1. **Bungkus dengan Suspense di Halaman Server:**
   - Buka `src/app/(admin)/admin/stok/page.tsx`, impor `Suspense` dari `react`.
   - Bungkus `<StockTable initialItems={initialItems} />` dengan `<Suspense fallback={null}>`.
2. **Implementasi Dua Arah URL Params di Komponen Klien:**
   - Buka `src/app/(admin)/admin/stok/stock-table.tsx`.
   - Impor `usePathname`, `useSearchParams` dari `next/navigation` (bersanding dengan `useRouter` yang sudah ada).
   - Baca parameter awal dari URL: `q`, `kategori`, `status`, `page`.
   - Inisialisasi state lokal pencarian `search` dari parameter `q` URL.
   - Buat helper `updateUrl` terpusat untuk membarui query URL tanpa lonjakan gulir.
   - Tambahkan timer *debounce* 350ms untuk input pencarian obat.
   - Hubungkan pemilihan dropdown multi-select kategori dan status ke `updateUrl`.
   - Hubungkan paginasi halaman ke `updateUrl`.
3. **Ubah 4 Kartu Ringkasan Menjadi Elemen Interaktif Tema Dark Ethereal:**
   - Kartu 1 (Total Item): Klik mereset filter status ke semua obat.
   - Kartu 2 (Stok Aman): Klik menyaring status ke `AVAILABLE` (atau toggle-off).
   - Kartu 3 (Menipis): Klik menyaring status ke `LOW` (atau toggle-off).
   - Kartu 4 (Kosong): Klik menyaring status ke `EMPTY` (atau toggle-off).
   - Terapkan gaya Dark Ethereal: `cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/70 active:scale-[0.98] transition-all`, serta ring aksen tematik (`ring-2 ring-brand-500/40`, `ring-emerald-500/40`, `ring-amber-500/40`, `ring-rose-500/40`) saat kartu aktif.
4. **Verifikasi:**
   - Jalankan verifikasi via `curl -I "http://127.0.0.1:3003/admin/stok?q=amox&status=LOW"` & pastikan HTTP `200 OK` (atau 307 redirect jika otentikasi aktif).
5. **Commit:**
   - `git add src/app/(admin)/admin/stok/page.tsx src/app/(admin)/admin/stok/stock-table.tsx`
   - `git commit -m "feat(admin-stok): sinkronisasi url params dan kartu metrik interaktif dark ethereal (#77)"`

---

### Task 3: Verifikasi Menyeluruh Antarmuka, Peninjauan di Ponsel, dan Pembuatan Pull Request

**Langkah-langkah:**
1. **Verifikasi Tautan Bersama (Shareable Links):**
   - Buka endpoint publik: `http://43.129.57.214/profile-ifk/stok?status=AVAILABLE`
   - Buka endpoint dengan kata kunci: `http://43.129.57.214/profile-ifk/stok?q=paracetamol`
   - Uji navigasi tombol *Back/Forward* di peramban.
2. **Review Tampilan Ponsel:**
   - Minta konfirmasi pengguna untuk meninjau interaksi sentuh dan tata letak kartu pada layar ponsel.
3. **Push & Buat Pull Request:**
   - Push branch `feat/77-stock-url-sync-interactive-cards` ke GitHub remote origin.
   - Buat PR ke `develop` dengan judul `feat(stok): sinkronisasi pencarian dan filter dengan url params serta kartu ringkasan interaktif (#77)` dan referensi `Closes #77`.
   - Pantau alur CI GitHub Actions sampai lulus 100%.
