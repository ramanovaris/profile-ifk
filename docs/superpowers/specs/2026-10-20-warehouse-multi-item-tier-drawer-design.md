# Spesifikasi Desain: Dukungan Multi-Item per Ambalan pada Drawer Denah Interaktif Gudang (Issue #191)

## 1. Ringkasan & Latar Belakang
Pada gudang fisik Instalasi Farmasi Kabupaten (IFK) Kotabaru, dalam satu tingkatan ambalan rak (misal: Tingkat 2 / T2) kerap ditempati oleh lebih dari 1 jenis sediaan obat atau alat kesehatan (multi-item per ambalan). 

Sebelumnya, drawer bawah (`WarehouseBottomDrawer`) dan visualisator ambalan (`RackTierVisualizer`) hanya menampilkan satu obat target tunggal dan daftar barang lain di rak disajikan secara tercampur tanpa pengelompokan tingkat fisik yang jelas.

Fitur ini memperbarui panel drawer denah interaktif agar:
1. Menampilkan indikator jumlah obat pada tiap tingkatan ambalan di `RackTierVisualizer` (contoh: "3 Obat" atau "Kosong").
2. Menyajikan daftar obat dalam bentuk **Accordion / Baris Lipat per Ambalan (T5 s/d T1)** di dalam drawer.
3. Tingkat ambalan yang aktif/menjadi target otomatis terbuka dan obat yang dicari mendapatkan penanda khusus (*Target Obat*).
4. Petugas dapat memilih obat lain di ambalan yang sama atau ambalan lain secara langsung tanpa meninggalkan denah.

---

## 2. Arsitektur Komponen & Data

### A. Tipe Data Baru (`DrawerDetailData`)
Struktur data drawer diperbarui dengan dukungan pengelompokan penempatan barang per tingkat ambalan:

```typescript
export interface TierItemPlacement {
  id: string;             // Placement ID
  itemId: string;
  itemCode: string;
  itemName: string;
  itemUnit: string;
  itemCategory: string | null;
  locationCode: string;   // e.g. "SJ-R01-T2"
  levelCode: string;      // e.g. "T2"
  notes: string | null;
  isTarget?: boolean;     // Penanda apakah item ini yang dicari dari katalog/URL
}

export interface DrawerDetailData {
  // Informasi Rak & Lokasi Utama
  buildingName: string;
  rackId: string;
  rackName: string;
  corridor: string;
  totalLevels: number;
  
  // Ambalan Aktif yang Sedang Terpilih
  activeLevelCode: string; // e.g. "T2"
  
  // Item Aktif yang Sedang Ditampilkan di Header Compact Drawer
  activeItem?: TierItemPlacement;
  
  // Pengelompokan Seluruh Barang di Rak Berdasarkan Level Ambalan
  itemsByLevel: Record<string, TierItemPlacement[]>; // Key: "T1", "T2", dst.
  
  // Total kuantitas barang di seluruh rak
  totalItemsCount: number;
}
```

### B. `RackTierVisualizer`
Menerima prop baru:
* `itemCountsByLevel?: Record<string, number>`: pemetaan jumlah item per tingkatan (misal: `{ T1: 2, T2: 3, T3: 0, T4: 1, T5: 0 }`).
* Tiap baris tombol ambalan menampilkan:
  - Nomor tingkatan ambalan.
  - Badge jumlah: jika ada obat tampil badge solid lembut (misal: `3 Obat`), jika kosong tampil teks muted `Kosong`.
  - Jika tingkatan tersebut sedang aktif, diberi highlight amber dengan badge status aktif.

### C. `WarehouseBottomDrawer`
Menyediakan 2 mode tampilan:
1. **Compact Bar (1 baris ~44px):**
   - Menampilkan badge kode lokasi aktif (misal: `SJ-R01-T2`).
   - Menampilkan nama obat aktif (atau nama rak jika tidak ada obat terpilih).
   - Menampilkan badge jumlah total obat di ambalan aktif (misal: `3 jenis obat`).
   - Tombol toggle `Detail` (expand) dan tombol tutup `X`.

2. **Expanded Content (Maksimal 60vh, scroll halus di HP):**
   - **Kolom Kiri:** `RackTierVisualizer` (menampilkan visualisasi vertikal ambalan fisik rak).
   - **Kolom Kanan / Bawah:** **Daftar Accordion per Tingkat Ambalan (T5 s/d T1)**.
     - Header accordion ambalan memuat: Label Ambalan (misal `Tingkat 2 (T2)`), badge jumlah item, dan ikon chevron ekspansi.
     - Ambalan aktif terbuka secara default (`expandedLevel = activeLevelCode`).
     - Mengklik tombol ambalan di `RackTierVisualizer` otomatis membuka accordion tingkat terkait dan melakukan scroll fokus halus.
     - Di dalam ambalan terbuka:
       * Kartu mini untuk setiap item obat.
       * Badge "Target" hijau/amber untuk obat yang sedang dicari.
       * Info kode obat, satuan sediaan, dan kategori.
       * Tombol/aksi pilih item untuk menjadikan obat tersebut fokus utama di header compact drawer.

---

## 3. Logika Integrasi pada `MapClientView` (`map-client-view.tsx`)

1. **Pengelompokan Data Placement:**
   Saat rak dipilih (baik via klik denah, pencarian, atau auto-select URL):
   - Seluruh placement di rak tersebut dikelompokkan ke dalam kamus `itemsByLevel` (`T1` hingga `T{totalLevels}`).
   - Level ambalan target ditentukan berdasarkan parameter URL `level` atau level dari item target. Jika tidak ada, fallback ke level terisi pertama atau `T1`.
   - Item target ditandai `isTarget: true`.
   
2. **Interaksi Pengguna:**
   - **Ganti Ambalan:** Memilih tingkat di visualizer atau accordion memperbarui `activeLevelCode`, menyinkronkan expand accordion, dan memperbarui ringkasan level di compact header.
   - **Ganti Obat Terpilih:** Mengklik salah satu kartu obat di accordion memperbarui `activeItem` di drawer tanpa menutup modal atau reload peta SVG.

---

## 4. Aksesibilitas, Responsivitas & Mode Gelap
- **Keyboard & Touch:** Semua header accordion dan tombol kartu obat menggunakan elemen `<button type="button">` native dengan `aria-expanded` yang valid.
- **Warna & Kontras:**
  - Ambalan aktif: Kuning/Amber (`bg-amber-500` teks putih pada light & dark).
  - Badge item: Slate/Zinc neutral (`bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300`).
  - Badge target obat: Emerald solid (`bg-emerald-600 text-white`).
- **Layar HP:** Kontainer drawer dibatasi `max-h-[65vh]` dengan `overflow-y-auto` agar tidak menutupi seluruh denah gudang dan tidak mengganggu gesture zoom denah.

---

## 5. Rencana Pengujian Mandiri
1. **Uji Skrip TypeScript (`scripts/verify-warehouse-multi-item-drawer.ts`):**
   - Memvalidasi pembentukan struktur `itemsByLevel` dari data placement acak.
   - Memvalidasi konsistensi perhitungan `itemCountsByLevel`.
   - Memvalidasi penandaan `isTarget` pada item yang cocok.
2. **Uji UI Interaktif di Browser/Dev Server:**
   - Verifikasi rak dengan ambalan multi-item (misal: 3 obat di T2).
   - Verifikasi accordion membuka dan menutup dengan mulus.
   - Verifikasi klik tombol ambalan di `RackTierVisualizer` membuka ambalan terkait di accordion.
   - Verifikasi pergantian fokus obat di header drawer.
