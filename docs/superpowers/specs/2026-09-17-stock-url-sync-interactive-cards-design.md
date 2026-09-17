# Spesifikasi Desain: Sinkronisasi Pencarian & Filter Parameter URL serta Kartu Ringkasan Interaktif Ketersediaan Obat

- **Issue Terkait:** [#77](https://github.com/ramanovaris/profile-ifk/issues/77)
- **Branch:** `feat/77-stock-url-sync-interactive-cards`
- **Tanggal:** 17 September 2026
- **Status:** Menunggu Persetujuan Pengguna

---

## 1. Latar Belakang & Tujuan

Halaman data ketersediaan fisik perbekalan farmasi instansi saat ini tersedia pada dua antarmuka:
1. **Portal Publik (`/stok`):** Akses transparansi bagi masyarakat dan fasilitas kesehatan mengenai ketersediaan obat dan alat kesehatan (tema *Clean Light*).
2. **Panel Pengelola (`/admin/stok`):** Manajemen dan pembaruan data stok berkala bagi petugas instalasi farmasi (tema *Dark Ethereal*).

### Masalah Saat Ini:
1. **Penyaringan Belum Tersimpan di Parameter Tautan (URL):**
   Pencarian kata kunci, pemilihan kategori, status stok, dan nomor halaman masih tersimpan murni pada memori sementara komponen peramban. Jika pengguna memuat ulang (*refresh*), menekan tombol kembali/maju peramban (*Back/Forward*), atau membagikan tautan kepada rekan kerja, seluruh filter kembali ke kondisi awal (reset).
2. **Kartu Ringkasan Masih Pasif:**
   Empat kartu ringkasan di bagian atas tabel (Total Perbekalan, Stok Aman, Stok Menipis, Stok Kosong) hanya menampilkan angka agregat secara statis dan belum dapat disentuh atau diklik untuk menyaring tabel secara cepat layaknya kartu metrik pada dasbor eksekutif.

### Tujuan Penyelesaian:
- Mewujudkan sinkronisasi dua arah antara status antarmuka pengguna dengan parameter URL (`?q=...&kategori=...&status=...&page=...`) sehingga tautan dapat dibagikan (*shareable link*) dan riwayat navigasi peramban berfungsi optimal.
- Mengubah kartu ringkasan menjadi komponen interaktif (*clickable stat cards*) dengan umpan balik visual yang jelas, mendukung aksi klik untuk menyaring status obat dan toggle klik-ulang untuk mereset filter.
- Mempertahankan konsistensi visual di kedua tema: *Clean Light* di publik dan *Dark Ethereal* di panel pengelola.

---

## 2. Skema Parameter Tautan (URL Query Parameters)

Parameter URL didesain ringkas, bersih, dan representatif:

| Parameter | Tipe | Nilai Default | Contoh Nilai | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `q` | `string` | Kosong (dihapus) | `paracetamol` | Kata kunci nama/kode obat (*debounced* 350ms). |
| `kategori` | `string` | Kosong (dihapus) | `Obat Generik,BMHP / Alkes` | Kategori terpilih, dipisahkan koma bila multi-select. |
| `status` | `string` | Kosong (dihapus) | `AVAILABLE` atau `AVAILABLE,LOW` | Status ketersediaan fisik terpilih. |
| `page` | `number` | `1` (dihapus) | `2`, `3` | Nomor halaman data aktif (hanya tampil jika > 1). |

### Aturan Kebersihan URL (*Clean URL*):
- Nilai kosong, spasi berlebih, atau nilai default (`page=1`, filter kosong) otomatis dihapus dari parameter URL agar tautan tetap rapi.
- Pembaruan URL menggunakan `router.replace(targetUrl, { scroll: false })` sehingga tidak menimbulkan lonjakan gulir (*jump scroll*) yang mengganggu kenyamanan membaca.

---

## 3. Desain Interaksi Kartu Ringkasan (Clickable Stat Cards)

Empat kartu ringkasan diubah dari kontainer pasif `<div>` menjadi elemen semantik `<button type="button">`:

### Perilaku Aksi & Status:
1. **Total Perbekalan / Total Item:**
   - **Kondisi Aktif:** Menyala aktif ketika tidak ada filter status yang dipilih (`status` kosong).
   - **Aksi Klik:** Mereset filter status ke kondisi awal (menampilkan seluruh obat), mereset nomor halaman ke `page=1`.
2. **Stok Aman (`AVAILABLE`):**
   - **Kondisi Aktif:** Menyala aktif jika `status` mengandung `AVAILABLE`.
   - **Aksi Klik:** Jika belum aktif, menetapkan filter status ke `AVAILABLE`. Jika sudah aktif, melakukan *toggle-off* (kembali menampilkan semua obat).
3. **Stok Menipis (`LOW`):**
   - **Kondisi Aktif:** Menyala aktif jika `status` mengandung `LOW`.
   - **Aksi Klik:** Menetapkan filter status ke `LOW` atau *toggle-off* jika diklik ulang.
4. **Stok Kosong (`EMPTY`):**
   - **Kondisi Aktif:** Menyala aktif jika `status` mengandung `EMPTY`.
   - **Aksi Klik:** Menetapkan filter status ke `EMPTY` atau *toggle-off* jika diklik ulang.

### Umpan Balik Visual & Gaya Antarmuka:
- **Tema Publik (`/stok` — Clean Light):**
  - Efek kursor: `cursor-pointer`.
  - Efek hover: sedikit terangkat halus (`hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`).
  - Efek tekan: sedikit mengecil saat ditekan (`active:scale-[0.98]`).
  - Efek kartu aktif:
    - Total Item: `ring-2 ring-brand-500/40 border-brand-500/50 bg-brand-50/50`.
    - Stok Aman: `ring-2 ring-emerald-500/40 border-emerald-500/60 bg-emerald-50/80`.
    - Stok Menipis: `ring-2 ring-amber-500/40 border-amber-500/60 bg-amber-50/80`.
    - Stok Kosong: `ring-2 ring-rose-500/40 border-rose-500/60 bg-rose-50/80`.
    - Dilengkapi lencana kecil (*badge*) atau indikator titik aktif sebagai penanda visual yang jelas.
- **Tema Admin (`/admin/stok` — Dark Ethereal):**
  - Efek kursor & elevasi: `cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/70 transition-all duration-200 active:scale-[0.98]`.
  - Efek kartu aktif:
    - Total Item: `ring-2 ring-brand-500/40 border-brand-500/60 bg-brand-950/20`.
    - Stok Aman: `ring-2 ring-emerald-500/40 border-emerald-500/60 bg-emerald-950/30`.
    - Stok Menipis: `ring-2 ring-amber-500/40 border-amber-500/60 bg-amber-950/30`.
    - Stok Kosong: `ring-2 ring-rose-500/40 border-rose-500/60 bg-rose-950/30`.

---

## 4. Sinkronisasi Dua Arah (Two-Way Synchronization)

1. **Input Pencarian & URL (`q`):**
   - State teks lokal diperbarui seketika saat diketik pengguna agar antarmuka responsif tanpa *lag*.
   - Timer *debounce* 350ms menunda penulisan ke parameter URL sampai pengguna selesai mengetik.
   - Jika URL berubah dari luar (misal tombol *Back* peramban), state input lokal otomatis menyesuaikan.
2. **Filter Kategori & URL (`kategori`):**
   - Dropdown multi-select kategori menyelaraskan nilai tercentang dengan parameter URL.
   - Pilihan kategori langsung tersimpan di URL secara instan tanpa perlu debounce teks.
3. **Filter Status & Kartu Stat (`status`):**
   - Kartu stat dan dropdown status terhubung ke parameter URL yang sama.
   - Ketika pengguna memilih opsi status di dropdown, kartu stat yang relevan otomatis menyala aktif.
   - Sebaliknya, ketika kartu stat diklik, pilihan pada dropdown status ikut tercentang sesuai status terkait.
4. **Paginasi & URL (`page`):**
   - Perpindahan halaman mencatat nomor halaman ke parameter URL.
   - Setiap perubahan kata kunci pencarian, kategori, atau status ketersediaan otomatis mereset halaman kembali ke `page=1` (menghapus parameter `page` dari URL).

---

## 5. Struktur Berkas & Pembungkusan Suspense

Untuk memastikan kepatuhan penuh terhadap arsitektur Next.js App Router:
1. `src/app/(public)/stok/page.tsx`:
   - Membungkus `<PublicStockClientView />` dengan `<Suspense fallback={...}>` untuk mencegah *de-opt* rendering sisi klien saat membaca `useSearchParams()`.
2. `src/app/(admin)/admin/stok/page.tsx`:
   - Membungkus `<StockTable />` dengan `<Suspense fallback={...}>`.
3. `src/components/public/public-stock-client-view.tsx`:
   - Mengintegrasikan hook `useRouter`, `useSearchParams`, `usePathname`.
   - Menghubungkan fungsi klik kartu stat dan pembaruan URL params.
4. `src/app/(admin)/admin/stok/stock-table.tsx`:
   - Mengintegrasikan hook `useRouter`, `useSearchParams`, `usePathname`.
   - Mengubah kartu ringkasan menjadi tombol interaktif dengan gaya *Dark Ethereal*.

---

## 6. Aksesibilitas & Kenyamanan Sentuhan (Mobile Friendly)

- Kartu ringkasan dilengkapi atribut semantik `role="button"`, `aria-pressed={isActive}`, dan `tabIndex={0}` serta dapat diakses penuh melalui papan ketik (tombol Enter dan Spasi).
- Area sentuh kartu memenuhi standar kenyamanan jari tangan di layar sentuh ponsel (minimal tinggi & lebar > 44px).
- Tidak ada istilah teknis komputasi atau basis data pada antarmuka, pesan pemuatan, maupun peringatan.

---

## 7. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Membuka tautan dengan parameter (misal `/stok?q=amox&status=AVAILABLE`) langsung menampilkan tabel dengan filter yang sesuai.
- [ ] Mengetik di kotak pencarian memperbarui URL setelah jeda 350ms tanpa membuat kursor input kehilangan fokus.
- [ ] Mengklik kartu "Stok Aman", "Stok Menipis", atau "Stok Kosong" langsung memfilter data tabel dan memperbarui parameter `status` di URL.
- [ ] Mengklik kartu yang sedang aktif atau mengklik kartu "Total Item" mengembalikan penyaringan ke semua perbekalan.
- [ ] Dropdown filter status dan kartu ringkasan tersinkronisasi 100% dua arah.
- [ ] Tombol peramban *Back/Forward* berfungsi mengembalikan kondisi filter data tanpa kendala.
- [ ] Tampilan antarmuka kartu pada perangkat seluler tetap tertata rapi, responsif, dan nyaman ditekan.
