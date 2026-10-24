# Spesifikasi Desain: Modul Denah Interaktif & Pencari Lokasi Obat Gudang IFK (Interactive Warehouse Locator & Map)

- **Tanggal Dokumen:** 2026-10-19
- **Referensi Dokumen:** PRD Interactive Warehouse Locator & Map Draft v1.0
- **Status:** Draf Disetujui Pengguna (Siap Masuk Perencanaan Implementasi)
- **Target Platform:** Mobile-First Web App (Internal Staf & Super Admin UPTD Instalasi Farmasi Kesehatan Kotabaru)

---

## 1. Latar Belakang & Prinsip Utama

### A. Latar Belakang & Permasalahan
1. Pengelolaan keluar-masuk obat dan perbekalan kesehatan di gudang farmasi membutuhkan ketepatan dan kecepatan saat proses penataan (*put-away*) maupun penyiapan barang (*picking*).
2. Tampilan spreadsheet (Google Sheets) di layar smartphone kurang ergonomis di lorong gudang: mengharuskan *pinch-to-zoom* berulang, terpotong saat keyboard virtual aktif, dan kode teks lokasi (seperti `SJ-R05-T1` atau `TD-R01-T5`) menuntut hafalan posisi lorong fisik oleh petugas.
3. Kepatuhan Standar CDOB (Cara Distribusi Obat yang Baik) BPOM: Informasi layout rak dan penempatan obat di gudang farmasi merupakan data internal terbatas yang **tidak boleh dibuka ke publik** demi keamanan aset farmasi, vaksin, dan obat berisiko tinggi.

### B. Prinsip Desain
1. **Internal-Only (Auth-Guarded):** Wajib login sebagai Staf atau Super Admin IFK. Publik dan bot mesin pencari tidak memiliki akses ke denah lokasi fisik obat.
2. **Master Fisik Mandiri:** Data barang fisik di denah berdiri sendiri (`WarehouseItem` & `WarehousePlacement`), terpisah dari tabel `MedicineStock` (rekap 150 obat indikator bulanan). Barang baru bisa langsung dipetakan ke rak fisik tanpa mencemari rekap stok bulanan.
3. **Murni Lokasi Spasial:** Menampilkan alamat fisik spesifik (Gedung, Baris Rak, Tingkat Ambalan) secara visual dan intuitif.
4. **Zero External Dependency:** Interaktivitas geser (*pan*) dan cubit (*zoom*) denah 2D SVG dibangun dengan React touch/pointer events native tanpa pustaka tambahan eksternal untuk menjaga efisiensi RAM server VPS 2GB dan kecepatan render HP.
5. **Ergonomi Satu Tangan di HP:** Antarmuka viewport dinamis (`100dvh`), bilah pencarian responsif instan dengan autocomplete, denah otomatis bergeser (*auto-pan*) dan fokus (*auto-zoom*) ke rak tujuan, serta kartu detail ambalan meluncur dari bawah (*bottom drawer*).

---

## 2. Arsitektur Data & Model Database (Prisma)

Data lokasi gudang dirancang menggunakan 4 entitas relasional di PostgreSQL melalui Prisma ORM:

```prisma
// Gedung / Zona Penyimpanan Fisik (Kantor, Saijaan, Todak)
model Warehouse {
  id          String          @id // "KT", "SJ", "TD"
  name        String          // "Gedung Kantor", "Gedung Saijaan", "Gedung Todak"
  description String?         @db.Text
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  racks       WarehouseRack[]

  @@map("warehouses")
}

// Baris Rak Fisik di dalam Gedung
model WarehouseRack {
  id           String               @id // "SJ-R01", "TD-R05"
  warehouseId  String
  rackCode     String               // "R01", "R05"
  name         String               // "Rak 01 - Tablet Generik"
  svgElementId String               // ID elemen pada denah SVG: "rect-sj-r01"
  totalLevels  Int                  @default(5) // Jumlah ambalan tingkat (1 s.d. 5)
  notes        String?              @db.Text
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  warehouse    Warehouse            @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  placements   WarehousePlacement[]

  @@index([warehouseId])
  @@map("warehouse_racks")
}

// Master Barang Fisik Denah (Obat, Alkes, PKRT, Vaksin, Perban)
model WarehouseItem {
  id          String               @id @default(cuid())
  code        String               @unique // Kode barang unik / barcode
  name        String               // Nama barang lengkap
  unit        String               // "Tablet", "Botol", "Box", "Pcs"
  category    String?              // "Obat Generik", "Alkes", "Vaksin", dll
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  placements  WarehousePlacement[]

  @@index([name])
  @@index([category])
  @@map("warehouse_items")
}

// Pemetaan Alamat Ambalan Barang pada Rak Fisik (Multi-item per ambalan didukung)
model WarehousePlacement {
  id           String        @id @default(cuid())
  itemId       String
  rackId       String
  levelCode    String        // "T1", "T2", "T3", "T4", "T5" (T1 = ambalan paling bawah)
  locationCode String        // "SJ-R05-T2"
  notes        String?       // Catatan khusus box/wadah atau posisi sisi kiri/kanan
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  item         WarehouseItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  rack         WarehouseRack @relation(fields: [rackId], references: [id], onDelete: Cascade)

  @@unique([itemId, rackId, levelCode])
  @@index([itemId])
  @@index([rackId])
  @@index([locationCode])
  @@map("warehouse_placements")
}
```

### Seeding Data Awal (Preset Bangunan IFK)
1. **Gedung Saijaan (`SJ`)**: Area penyimpanan obat sediaan padat/cair (Rak `SJ-R01` hingga `SJ-R12`, masing-masing 5 tingkat).
2. **Gedung Todak (`TD`)**: Area penyimpanan alat kesehatan, cairan infus, dan perbekalan bervolume besar (Rak `TD-R01` hingga `TD-R08`, masing-masing 4 tingkat).
3. **Gedung Kantor (`KT`)**: Ruang transit, penerimaan, dan ruang dingin vaksin (Rak `KT-R01` hingga `KT-R04`).

---

## 3. Alur Pengguna & Antarmuka Mobile-First

### A. Rute & Akses
* **Halaman Navigasi Denah Lapangan:** `/admin/gudang`
  * Otomatis responsif layar penuh (`100dvh`), menyembunyikan header/sidebar admin berlebih saat dibuka pada layar HP untuk memaksimalkan ruang denah.
  * Dilengkapi tombol pintas cepat *"Kembali ke Dashboard"* dan *"Kelola Data Rak/Barang"*.
* **Halaman Meja Kerja Admin:** `/admin/gudang/kelola`
  * CRUD master rak, jumlah ambalan, dan form penempatan obat.
  * Fitur impor dan ekspor spreadsheet lokasi fisik.

### B. Komponen Antarmuka Navigasi Denah
1. **Top Header & Selector Gedung:**
   * Tab pil gedung (*Gedung Saijaan*, *Gedung Todak*, *Gedung Kantor*).
   * Input pencarian barang dengan *instant auto-complete* memanfaatkan normalisasi cerdas `matchMedicineSearch` (yang telah mendukung fonetik & sinonim farmasi).
2. **Kanvas Denah Vektor 2D (Interactive SVG Canvas):**
   * Format aset denah SVG bersih dan semantik berukuran <100 KB.
   * Setiap balok rak diberi penanda kode (`R01`, `R02`, dst.) dan terikat atribut `data-rack-id`.
   * **Auto-Pan & Auto-Zoom:** Saat item dipilih dari saran pencarian, kanvas denah otomatis bergerak memposisikan rak target ke titik tengah layar dengan zoom optimal (skala 1.5x - 2.0x).
   * **Status Visual Rak:**
     * *Normal:* Warna netral bergaris tegas (`fill-slate-200 stroke-slate-400 dark:fill-zinc-800 dark:stroke-zinc-600`).
     * *Terpilih / Target:* Warna amber terang (`fill-amber-400 stroke-amber-600`) dengan efek denyut lembut (*pulse glow*).
     * *Non-Aktif (Dimmed):* Seluruh rak lain diturunkan opasitasnya menjadi 40% agar target langsung terlihat jelas.
   * **Kontrol Sentuh Native:**
     * Geser satu jari untuk *pan*.
     * Cubit dua jari untuk *pinch-to-zoom*.
     * Floating action buttons: `[+]` Zoom In, `[-]` Zoom Out, `[Recenter]` Reset Posisi Kamera.
3. **Bottom Drawer (Kartu Rincian Lokasi Ambalan):**
   * Panel geser bawah yang otomatis terbuka saat rak atau obat terpilih.
   * Menampilkan nama barang, kemasan/satuan, dan kode lokasi lengkap (`SJ-R05-T2`).
   * **Mini Rack Tier Visualizer:** Representasi grafis miniatur rak bertingkat (misal tingkat 1 s.d. 5). Ambalan yang menjadi letak obat bersangkutan diberi sorotan warna terang kontras, memudahkan petugas melihat ketinggian ambalan rak secara instan.
   * Daftar obat lain yang berada di ambalan/rak yang sama.

---

## 4. Arsitektur Teknis & Modul Kode

### A. Struktur File
```
src/
├── actions/
│   └── warehouse.ts               # Server actions: query denah, search obat denah, CRUD rak & barang, import spreadsheet
├── app/
│   └── (admin)/
│       └── admin/
│           └── gudang/
│               ├── page.tsx       # Server component data prefetching & auth gate
│               ├── locator-view.tsx # Client component kanvas denah & drawer
│               └── kelola/
│                   └── page.tsx   # Meja kerja admin (tabel rak, import Excel)
├── components/
│   └── warehouse/
│       ├── warehouse-svg-map.tsx  # Komponen render denah SVG (Saijaan, Todak, Kantor)
│       ├── rack-tier-visualizer.tsx # Visualisasi ambalan rak bertingkat
│       └── warehouse-search-box.tsx # Input pencarian cerdas autocomplete
└── lib/
    ├── warehouse-map-data.ts      # Definisi koordinat SVG & layout gedung
    └── use-svg-pan-zoom.ts        # Custom hook pointer-events pan & pinch-zoom zero-dep
```

### B. Hook Gestur Sentuh Zero-Dep (`src/lib/use-svg-pan-zoom.ts`)
Menggunakan native HTML Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`) untuk menghitung:
* `transform: translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
* Pembatasan batas geser (*bounding boundaries*) agar denah tidak terlempar keluar layar.
* Dukungan animasi transisi CSS halus (*ease-out*) saat *auto-pan* ke rak tujuan.

---

## 5. Rencana Impor Spreadsheet (Excel/CSV)

Format template Excel disediakan langsung di antarmuka admin:
* Kolom A: `Kode Barang` (contoh: `OBT-001`)
* Kolom B: `Nama Barang` (contoh: `Paracetamol 500mg Tablet`)
* Kolom C: `Satuan` (contoh: `Tablet`)
* Kolom D: `Kategori` (contoh: `Obat Generik`)
* Kolom E: `Kode Rak` (contoh: `SJ-R05`)
* Kolom F: `Tingkat Ambalan` (contoh: `T2`)
* Kolom G: `Catatan Posisi` (contoh: `Kotak biru sisi kiri`)

Server action memproses validasi: memastikan kode rak terdaftar di gedung yang sesuai dan ambalan tidak melebihi `totalLevels` rak tersebut.

---

## 6. Skenario Pengujian & Uji Mandiri

Skrip verifikasi otomatis `scripts/verify-warehouse-locator.ts` akan menguji:
1. Skema database: Hubungan relasional `Warehouse` -> `WarehouseRack` -> `WarehousePlacement` -> `WarehouseItem`.
2. Validasi kode lokasi: Format kode lokasi konsisten (`{Gedung}-{Rak}-{Tingkat}`).
3. Algoritma pencarian: Pencarian barang di denah terintegrasi dengan normalisasi ejaan farmasi `matchMedicineSearch`.
4. Struktur SVG: Seluruh `svgElementId` pada data rak memiliki elemen padanan di komponen denah SVG.
5. Performa ukuran bundle: Komponen denah dan aset SVG dipastikan berada di bawah batas ambang 150 KB.

---

## 7. Batasan & Lingkup Rilis (Scope Boundary)

* **Termasuk dalam Rilis Ini (MVP Fase 1):**
  * Proteksi login internal staf/admin.
  * Denah visual 2D 3 gedung (Saijaan, Todak, Kantor).
  * Gestur pan/zoom native zero-dependency.
  * Pencarian cerdas obat & sorot rak target + animasi ambalan.
  * Manajemen rak, ambalan, dan penempatan barang via admin + impor Excel.
* **Di Luar Lingkup (Direncanakan pada Fase Lanjutan):**
  * Fitur panduan rute navigasi lorong terpendek (*indoor pathfinding*).
  * Integrasi sensor pemantauan suhu/kelembaban IoT rak.
  * Editor denah interaktif *drag-and-drop* tata letak dinding bangunan.
