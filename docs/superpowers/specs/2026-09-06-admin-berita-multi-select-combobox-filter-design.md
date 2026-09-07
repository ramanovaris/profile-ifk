# Design Spec: Multi-Select Combobox Filter Kategori Berita Admin

## 1. Overview & Goals
Meningkatkan fungsionalitas filter kategori pada halaman daftar berita admin (`/admin/berita`) dari tombol pills horizontal statis menjadi **Multi-Select Combobox** yang dinamis, hemat ruang (*compact*), responsif, dan siap menampung data master kategori dalam jumlah banyak (*future-proof*).

### Masalah Saat Ini:
1. Tombol filter kategori berbentuk pills horizontal memakan ruang toolbar pencarian.
2. Jika master kategori bertambah banyak (10–20+ kategori), layout terpotong horizontal dan menyulitkan navigasi.
3. Hanya mendukung pemilihan *single category* (satu kategori pada satu waktu).
4. Belum terhubung dinamis dengan data status master kategori (`ACTIVE`).

### Sasaran Perubahan:
1. Mengganti deretan pills horizontal dengan satu trigger button dropdown multi-select combobox di samping kolom search.
2. Menyediakan input pencarian cepat di dalam popover untuk menyaring daftar kategori.
3. Menyediakan tombol aksi cepat: *"Pilih Semua"* dan *"Reset Filter"*.
4. Menampilkan checkbox kustom bertema Dark Ethereal (`brand-500`) dan counter jumlah artikel per kategori.
5. Mendukung seleksi multi-kategori (logika OR: artikel ditampilkan jika masuk dalam salah satu kategori yang dipilih).
6. Aksesibilitas keyboard penuh (ArrowUp, ArrowDown, Space/Enter toggle, Escape tutup, dan Click-outside).

---

## 2. UI & Component Architecture

### A. Toolbar & Trigger Button
- **Posisi:** Berdampingan dengan input pencarian berita di toolbar (`src/app/(admin)/admin/berita/page.tsx`), responsif (`w-full sm:w-auto sm:min-w-[210px]`).
- **Tampilan Label Trigger:**
  - **Kondisi Kosong / Default:** Label *"Semua Kategori"* dengan icon `SlidersHorizontal` di kiri dan `ChevronDown` di kanan.
  - **1 Kategori Terpilih:** Label nama kategori (misal: *"Kegiatan"*) + badge counter `1`.
  - **>1 Kategori Terpilih:** Label *"N Kategori"* (misal: *"2 Kategori"*) + badge counter `N`.
- **Styling:**
  - Background `bg-zinc-950/60`, border `border-white/5` hover `border-white/10`.
  - Focus ring seragam: `border-brand-500/60 ring-2 ring-brand-500/40 outline-none`.

### B. Popover Dropdown Panel
- **Container:**
  - Lebar proporsional (`w-72`), floating popover dengan z-index tinggi (`z-30`), background `bg-zinc-900/95 border border-white/10 backdrop-blur-xl shadow-2xl rounded-xl`.
- **Elemen di Dalam Panel:**
  1. **Search Input Internal:**
     - Input pencarian kategori mini dengan placeholder *"Cari kategori..."* dan icon `Search`.
     - Input dibersihkan atau auto-focus saat dropdown dibuka.
  2. **Quick Action Bar:**
     - Tombol mini teks:
       - *"Pilih Semua"*: mencentang seluruh kategori aktif yang sedang difilter.
       - *"Reset Filter"*: menghapus seluruh centang (kembali ke kondisi default menampilkan semua artikel).
  3. **Scrollable Category List (`max-h-60 overflow-y-auto`):**
     - Mengambil kategori berstatus `ACTIVE` dari master kategori `initialCategories`.
     - Setiap baris item:
       - Custom checkbox dengan visual centang `brand-500`.
       - Nama kategori.
       - Badge jumlah artikel terkait (misal: `(5)`).
       - Hover state `hover:bg-white/[0.04]` dan active focus ring.
  4. **Empty State:**
     - Pesan informatif jika pencarian kategori tidak ditemukan: *"Kategori tidak ditemukan"*.

---

## 3. Data & Filtering Logic

1. **State Management:**
   - `selectedCategories: string[]` (array nama kategori terpilih, default: `[]` = semua kategori).
   - `searchQuery: string` (kata kunci judul artikel).
   - `categorySearchQuery: string` (kata kunci pencarian kategori di dalam popover).
2. **Filter Predicate:**
   - Pencarian artikel: cocok dengan judul artikel ATAU nama kategori.
   - Kategori artikel:
     - Jika `selectedCategories.length === 0`: lolos semua (menampilkan semua artikel).
     - Jika `selectedCategories.length > 0`: lolos jika `selectedCategories.includes(article.category)`.
3. **Reset Pagination:**
   - Setiap perubahan pada `selectedCategories` otomatis me-reset `currentPage` ke `1`.

---

## 4. Keyboard Navigation & Accessibility

- `Escape`: Menutup popover dropdown dan mengembalikan fokus ke tombol trigger.
- `ArrowDown` / `ArrowUp`: Bergerak melintasi item kategori yang dapat dipilih.
- `Space` / `Enter`: Melakukan toggle status checklist pada item yang sedang disorot.
- `Click Outside`: Otomatis menutup popover ketika pengguna mengklik di luar elemen dropdown.

---

## 5. Verification Plan

1. **Lint & Type Check:**
   - `npm run lint` bebas dari error/warning ESLint.
   - `npx tsc --noEmit` lulus kompilasi tanpa error tipe TypeScript.
2. **Fungsionalitas Interaksi:**
   - Buka dropdown filter, centang 1 kategori -> cek artikel terfilter dengan benar.
   - Centang 2 kategori -> cek artikel dari kedua kategori muncul (OR condition).
   - Klik "Reset Filter" -> kembali menampilkan semua artikel.
   - Klik "Pilih Semua" -> semua kategori tercentang.
   - Uji pencarian nama kategori di input mini dropdown.
3. **Responsiveness:**
   - Periksa tampilan pada desktop (`md+`) dan mobile breakpoint.
