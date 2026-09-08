# Spesifikasi Desain: UI Ketersediaan Stok Obat & BMHP IFK Kotabaru

## 1. Ringkasan Fitur
Fitur transparansi publik untuk menampilkan ketersediaan stok fisik obat dan BMHP (Bahan Medis Habis Pakai) milik UPTD Instalasi Farmasi Kabupaten (IFK) Kotabaru per periode akhir bulan (~200 item).

Sesuai arahan, pengembangan difokuskan pada **tahap implementasi UI terlebih dahulu** (*UI-first development*) dengan data simulasi (mock data) representatif 200 item sebelum parser import file diimplementasikan di fase berikutnya.

Ruang lingkup mencakup:
1. Struktur data & mock dataset 200 item di `src/lib/dummy-data.ts`.
2. Integrasi menu navigasi publik ("Ketersediaan Obat") di `src/components/public/navbar.tsx`.
3. Halaman publik ketersediaan obat di `src/app/(public)/stok/page.tsx`.
4. Integrasi menu sidebar admin ("Stok Obat") di `src/components/admin/admin-shell.tsx`.
5. Halaman kelola stok admin di `src/app/(admin)/admin/stok/page.tsx` dengan metrik, pencarian/filter terpadu, aksi cepat, dan modal placeholder import.

---

## 2. Struktur Data & Mock Dataset (`src/lib/dummy-data.ts`)

### 2.1 Tipe Data
```typescript
export type StockStatus = "AVAILABLE" | "LOW" | "EMPTY";

export type MedicineCategory =
  | "Obat Generik"
  | "Obat Program"
  | "Obat Emergensi"
  | "BMHP / Alkes"
  | "Vaksin & Serum";

export type MedicineStockItem = {
  id: string;
  code: string;
  name: string;
  category: MedicineCategory;
  unit: string;
  quantity: number;
  status: StockStatus;
  updatedAt: string; // ISO date string "2026-08-31"
};

export type StockSummary = {
  totalItems: number;
  availableItems: number;
  lowItems: number;
  emptyItems: number;
  lastUpdated: string;
};
```

### 2.2 Dataset Seed (200 Item)
- Dibuat secara terstruktur merepresentasikan item farmasi riil IFK Kotabaru (Antibiotik, Analgesik/Antipiretik, Antihipertensi, Antidiabetes, Obat Anak, Suplemen/Vitamin, BMHP/Spuit/Kasa/Infus set, Vaksin dasar).
- Distribusi status: Mayoritas `AVAILABLE` (Tersedia), sebagian `LOW` (Menipis, stok < 100 / batas kritis), dan beberapa `EMPTY` (Kosong).
- Periode default data: Per 31 Agustus 2026.

### 2.3 Helper Functions
- `getStockSummary(items: MedicineStockItem[]): StockSummary`
- Standarisasi label dan styling status:
  - `AVAILABLE`: Label "Tersedia", warna `emerald` dengan active dot indicator.
  - `LOW`: Label "Menipis", warna `amber` dengan alert dot indicator.
  - `EMPTY`: Label "Kosong", warna `rose` atau netral `zinc`.

---

## 3. Desain Tampilan Publik (`/stok`)

### 3.1 Navigasi Navbar Publik (`src/components/public/navbar.tsx`)
- Menambahkan item nav `{ href: "/stok", label: "Ketersediaan Obat" }`.
- Mendukung mode desktop (glass pill container) dan mobile drawer hamburger menu.

### 3.2 Halaman Publik (`src/app/(public)/stok/page.tsx`)
1. **Header & Waktu Pembaruan**:
   - Judul halaman: **Ketersediaan Obat & BMHP**
   - Subtitle: *"Informasi ketersediaan stok fisik perbekalan farmasi pada Instalasi Farmasi Kabupaten Kotabaru per akhir bulan"*
   - Pill Badge Tanggal Pembaruan: *"Pembaruan Terakhir: 31 Agustus 2026"*
2. **Kartu Ringkasan Metrik**:
   - Total Item (200)
   - Stok Tersedia
   - Stok Menipis
   - Stok Kosong
3. **Pencarian & Filter Interaktif**:
   - Input pencarian cepat nama obat / kode barang.
   - Filter pill kategori obat (Semua, Obat Generik, Program, Emergensi, BMHP, Vaksin).
   - Filter pill status (Semua, Tersedia, Menipis, Kosong).
4. **Tabel Data Publik (Desain Responsif Desktop md+ & Mobile)**:
   - Kolom: **No**, **Kode / Nama Obat**, **Kategori**, **Bentuk / Satuan**, **Jumlah Stok Fisik**, **Status**.
   - Tampilan bersih (*clean minimalist luxury*), baris zebra/hover halus, tipografi kontras tinggi.
   - Pagination interaktif (10, 25, 50 baris per halaman) dengan info jumlah halaman dan navigasi cepat.

---

## 4. Desain Tampilan Panel Admin (`/admin/stok`)

### 4.1 Menu Sidebar Admin (`src/components/admin/admin-shell.tsx`)
- Menambahkan link menu `{ href: "/admin/stok", label: "Stok Obat", icon: Package }` di daftar `sidebarLinks`.

### 4.2 Halaman Kelola Stok Admin (`src/app/(admin)/admin/stok/page.tsx`)
1. **Header & Action Bar**:
   - Judul: **Kelola Stok Obat**
   - Subtitle: *"Manajemen dan pembaruan data stok fisik IFK per akhir bulan"*
   - Tombol Aksi:
     - **Import Data Stok**: Membuka dialog upload/preview file import (UI-ready).
     - **Unduh Template**: Mengunduh format template kolom standar CSV/Excel.
2. **Statistik Metrik (Dark Ethereal Cards)**:
   - 4 Card metrik dengan background `zinc-900/60`, border `zinc-800`, teks angka mencolok dan icon pendukung.
3. **Toolbar Pencarian & Filter Terpadu**:
   - Mengikuti pola desain card kaca terpadu yang sudah distandarisasi di halaman Pengguna dan Kategori.
   - Search input `text-sm`, search icon, filter kategori & filter status.
4. **Tabel Stok Admin**:
   - Kolom: **No**, **Nama Obat / Kode**, **Kategori**, **Satuan**, **Stok Fisik**, **Status**, **Aksi**.
   - Aksi baris: Edit status/jumlah secara cepat, atau hapus item.
   - Tombol toggle status instan dengan notifikasi toast.
5. **Modal Import Placeholder**:
   - Area drag & drop file dengan instruksi format kolom (Nama Obat, Satuan, Kategori, Jumlah Stok).
   - Tombol preview data sebelum disimpan ke state lokal/localStorage.

---

## 5. Kriteria Keberhasilan (Verification Criteria)
1. **Zero New Dependency**: Tidak menambah library eksternal baru di `package.json` untuk tahap UI.
2. **Navigasi Konsisten**: Menu baru muncul rapi di Navbar Publik maupun Sidebar Admin.
3. **Visual Responsif**: Desain nyaman diuji di browser HP Android Chrome ("Desktop site" mode, viewport md+) serta mobile murni.
4. **Integrasi Toast**: Semua interaksi admin (update stok, simulasi import) memberikan feedback toast native.
5. **CI Quality Gate**: Lolos validasi linting, TypeScript compiler, dan build di GitHub Actions CI tanpa error.
