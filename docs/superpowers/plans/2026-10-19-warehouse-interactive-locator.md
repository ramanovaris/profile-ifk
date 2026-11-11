# Modul Denah Interaktif 2D & Pencari Lokasi Obat Gudang IFK Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Membangun fitur Interactive Warehouse Locator & Map (Pencari Lokasi Obat Gudang IFK) berbasis denah 2D SVG, proteksi CDOB internal staf, master fisik mandiri terpisah dari rekap stok bulanan, dan navigasi ergonomis mobile-first satu tangan dengan gesture pan/zoom native.

**Architecture:** Menerapkan 4 tabel database relasional di Prisma (`Warehouse`, `WarehouseRack`, `WarehouseItem`, `WarehousePlacement`) untuk master alamat fisik permanen. Komponen denah menggunakan SVG modular per gedung (Saijaan `SJ`, Todak `TD`, Kantor `KT`) yang dikontrol oleh custom hook native Pointer Events `useSvgPanZoom` (zero external dependencies). Pencarian instan terintegrasi dengan normalisasi ejaan farmasi `matchMedicineSearch`. Rute diproteksi autentikasi staf (`/admin/gudang` & `/admin/gudang/kelola`).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM (PostgreSQL), Lucide Icons, tsx.

## Global Constraints

- **Hemat RAM VPS (2GB):** DILARANG menjalankan `next build` atau `npx tsc` manual di VPS. Verifikasi fungsionalitas menggunakan skrip mandiri `npx tsx scripts/verify-warehouse-locator.ts` dan verifikasi HTTP status code melalui curl ke dev server Turbopack port 3003.
- **Zero External Dependencies:** TIDAK menginstal library gestur pihak ketiga seperti `react-zoom-pan-pinch`; menggunakan native Pointer Events hook (`use-svg-pan-zoom.ts`).
- **Kepatuhan CDOB & Keamanan:** Akses denah gudang dan koordinat rak diproteksi session internal staf/admin melalui `getCurrentSession()`.
- **GitFlow & Review:** Kerjakan pada branch `feat/188-warehouse-interactive-locator`, tautkan ke Issue #188 dan Project #1 PNS.

---

### Task 1: Skema Database Prisma & Seeding Master Gudang IFK

**Files:**
- Modify: `prisma/schema.prisma:180-186`
- Modify: `prisma/seed.ts` (atau create `scripts/seed-warehouse.ts`)
- Create: `scripts/verify-warehouse-schema.ts`

**Interfaces:**
- Produces:
  - Model `Warehouse`, `WarehouseRack`, `WarehouseItem`, `WarehousePlacement`
  - Seeding 3 Gedung IFK (`SJ`, `TD`, `KT`) dan baris rak fisik lengkap
  - Skrip pengujian CLI `scripts/verify-warehouse-schema.ts`

- [ ] **Step 1: Tulis skrip uji mandiri skema database `scripts/verify-warehouse-schema.ts` (RED test)**
  - Menguji query tabel `warehouse`, `warehouseRack`, `warehouseItem`, `warehousePlacement`.
  - Jalankan via `npx tsx scripts/verify-warehouse-schema.ts` dan pastikan gagal karena model belum ada.
- [ ] **Step 2: Tambahkan 4 model gudang pada `prisma/schema.prisma`**
  - Definisikan `Warehouse`, `WarehouseRack`, `WarehouseItem`, `WarehousePlacement` sesuai spesifikasi.
  - Jalankan `npx prisma db push` untuk sinkronisasi skema ke database PostgreSQL.
- [ ] **Step 3: Buat skrip seeding preset gedung & rak IFK `scripts/seed-warehouse.ts`**
  - Seed Gedung Saijaan (`SJ`), Todak (`TD`), Kantor (`KT`).
  - Seed rak `SJ-R01` s.d. `SJ-R12` (5 ambalan), `TD-R01` s.d. `TD-R08` (4 ambalan), `KT-R01` s.d. `KT-R04` (4 ambalan).
  - Seed sampel barang fisik awal (Amoxicillin, Paracetamol, Infus RL, dll.) beserta posisinya.
  - Jalankan `npx tsx scripts/seed-warehouse.ts`.
- [ ] **Step 4: Jalankan verifikasi skema dan pastikan 100% PASS**
  - Command: `npx tsx scripts/verify-warehouse-schema.ts`
- [ ] **Step 5: Commit**
  - Command: `git add prisma/schema.prisma scripts/seed-warehouse.ts scripts/verify-warehouse-schema.ts && git commit -m "feat(gudang): skema prisma dan seeding master rak gudang IFK (#188)"`

---

### Task 2: Modul Layout Koordinat Denah SVG & Hook Sentuh Native Pan-Zoom

**Files:**
- Create: `src/lib/warehouse-map-data.ts`
- Create: `src/lib/use-svg-pan-zoom.ts`
- Create: `scripts/verify-pan-zoom-logic.ts`

**Interfaces:**
- Produces:
  - `BUILDING_LAYOUTS`: Konfigurasi viewBox, ukuran lorong, dan koordinat bounding box setiap rak pada SVG.
  - `useSvgPanZoom`: Custom hook React untuk touch pan, pinch-zoom, boundary clamping, dan `panTo(x, y, scale)`.
  - Skrip pengujian matematika koordinat `scripts/verify-pan-zoom-logic.ts`.

- [ ] **Step 1: Tulis skrip uji mandiri logika pan/zoom `scripts/verify-pan-zoom-logic.ts` (RED test)**
  - Uji perhitungan zoom in/out, clamping batas koordinat, dan fungsi kalkulasi center rak target.
  - Jalankan `npx tsx scripts/verify-pan-zoom-logic.ts` dan pastikan gagal.
- [ ] **Step 2: Implementasikan `src/lib/warehouse-map-data.ts`**
  - Definisikan dimensi denah kanvas SVG 3 gedung (Saijaan 1000x600, Todak 900x550, Kantor 800x500).
  - Petakan koordinat x, y, width, height, label lorong untuk setiap rak fisik.
- [ ] **Step 3: Implementasikan custom hook `src/lib/use-svg-pan-zoom.ts`**
  - Tangani pointer events native (`onPointerDown`, `onPointerMove`, `onPointerUp`).
  - Sediakan state `transform: { x, y, scale }`, fungsi `zoomIn()`, `zoomOut()`, `reset()`, dan `focusOnTarget(centerX, centerY, targetScale)`.
- [ ] **Step 4: Jalankan verifikasi logika dan pastikan 100% PASS**
  - Command: `npx tsx scripts/verify-pan-zoom-logic.ts`
- [ ] **Step 5: Commit**
  - Command: `git add src/lib/warehouse-map-data.ts src/lib/use-svg-pan-zoom.ts scripts/verify-pan-zoom-logic.ts && git commit -m "feat(gudang): modul layout spasial dan hook native pan-zoom denah (#188)"`

---

### Task 3: Server Actions Denah & Manajemen Fisik Gudang

**Files:**
- Create: `src/actions/warehouse.ts`
- Create: `scripts/verify-warehouse-actions.ts`

**Interfaces:**
- Produces:
  - `getWarehouseBuildingsAction()`: Ambil daftar gedung dan jumlah rak.
  - `getWarehouseMapDataAction(buildingId: string)`: Ambil rak, ambalan, dan daftar penempatan barang pada gedung.
  - `searchWarehouseItemsAction(query: string)`: Cari barang instan dengan normalisasi fonetik/alias `matchMedicineSearch`.
  - `upsertWarehouseItemAction(data: ...)`: Tambah/edit barang fisik master denah.
  - `placeWarehouseItemAction(data: ...)`: Atur penempatan barang ke ambalan rak.
  - `importWarehouseSpreadsheetAction(formData: FormData)`: Impor data Excel/CSV pemetaan lokasi massal.

- [ ] **Step 1: Tulis skrip verifikasi server action `scripts/verify-warehouse-actions.ts` (RED test)**
  - Uji pengambilan data denah, pencarian barang via server action, dan validasi duplikasi.
  - Jalankan `npx tsx scripts/verify-warehouse-actions.ts` dan pastikan gagal.
- [ ] **Step 2: Implementasikan `src/actions/warehouse.ts`**
  - Proteksi seluruh mutasi dengan pengecekan session `getCurrentSession()`.
  - Integrasikan pencarian dengan fungsi normalisasi `matchMedicineSearch` dari `src/lib/medicine-search.ts`.
  - Implementasikan fungsi baca/tulis Prisma dengan penanganan error terstruktur.
- [ ] **Step 3: Jalankan verifikasi server action dan pastikan 100% PASS**
  - Command: `npx tsx scripts/verify-warehouse-actions.ts`
- [ ] **Step 4: Commit**
  - Command: `git add src/actions/warehouse.ts scripts/verify-warehouse-actions.ts && git commit -m "feat(gudang): server actions untuk peta denah dan manajemen lokasi (#188)"`

---

### Task 4: Komponen Visual Denah SVG, Mini Tier Visualizer, Search Box & Bottom Drawer

**Files:**
- Create: `src/components/warehouse/warehouse-svg-map.tsx`
- Create: `src/components/warehouse/rack-tier-visualizer.tsx`
- Create: `src/components/warehouse/warehouse-search-box.tsx`
- Create: `src/components/warehouse/warehouse-bottom-drawer.tsx`

**Interfaces:**
- Produces:
  - `WarehouseSvgMap`: Komponen render vektor denah interaktif dengan highlight amber pulse pada rak terpilih dan opasitas 40% pada rak lain.
  - `RackTierVisualizer`: Visualisasi ambalan rak bertingkat mini dengan ambalan aktif bersinar.
  - `WarehouseSearchBox`: Input autocomplete mobile-first dengan debouncing 150ms.
  - `WarehouseBottomDrawer`: Drawer kartu detail lokasi meluncur dari bawah.

- [ ] **Step 1: Implementasikan `src/components/warehouse/rack-tier-visualizer.tsx`**
  - Tampilkan tumpukan ambalan (misal 5 tingkat) secara visual dengan label T1..T5.
  - Ambalan aktif disorot dengan warna amber solid teks putih dan badge indikator.
- [ ] **Step 2: Implementasikan `src/components/warehouse/warehouse-search-box.tsx`**
  - Autocomplete dropdown yang merespons ketikan seketika.
  - Menampilkan nama barang, satuan, dan badge lokasi (`SJ-R05-T2`).
- [ ] **Step 3: Implementasikan `src/components/warehouse/warehouse-bottom-drawer.tsx`**
  - Panel geser meluncur dari bawah layar ponsel saat rak atau barang dipilih.
  - Menyajikan info barang, lokasi lengkap, catatan posisi wadah, dan `RackTierVisualizer`.
- [ ] **Step 4: Implementasikan `src/components/warehouse/warehouse-svg-map.tsx`**
  - Render elemen `<svg>` dengan layer dinding lorong, partisi, dan balok rak `<rect>` yang responsif.
  - Hubungkan dengan pointer events hook untuk interaktivitas geser dan cubit layar.
  - Floating controls: tombol zoom in, zoom out, dan reset view.
- [ ] **Step 5: Commit**
  - Command: `git add src/components/warehouse/ && git commit -m "feat(gudang): komponen visual denah svg, ambalan visualizer, dan drawer (#188)"`

---

### Task 5: Halaman Navigasi Denah Lapangan Mobile-First (`/admin/gudang`)

**Files:**
- Create: `src/app/(admin)/admin/gudang/page.tsx`
- Create: `src/app/(admin)/admin/gudang/locator-client-view.tsx`

**Interfaces:**
- Produces:
  - Halaman viewport penuh `100dvh` khusus pencarian cepat dan navigasi denah di lapangan.
  - Tab pilihan gedung dinamis (*Saijaan*, *Todak*, *Kantor*).
  - Alur auto-pan dan auto-focus kamera denah saat barang dipilih dari bilah pencarian.

- [ ] **Step 1: Implementasikan server page `src/app/(admin)/admin/gudang/page.tsx`**
  - Validasi sesi pengguna via `getCurrentSession()`, alihkan ke login jika belum terautentikasi.
  - Prefetch data gedung dan denah awal.
- [ ] **Step 2: Implementasikan container klien `src/app/(admin)/admin/gudang/locator-client-view.tsx`**
  - Atur layout mobile-first tinggi penuh `h-[100dvh] max-h-[100dvh] overflow-hidden`.
  - Pasang pemilih gedung di baris atas, kanvas denah di tengah, dan drawer detail di bawah.
  - Hubungkan pemilihan obat dari pencarian ke fungsi `focusOnTarget(rackX, rackY)` pada denah SVG.
- [ ] **Step 3: Verifikasi respons HTTP halaman via curl dev server**
  - Command: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/profile-ifk/admin/gudang` (ekspektasi 200 atau 307 redirect auth).
- [ ] **Step 4: Commit**
  - Command: `git add src/app/(admin)/admin/gudang/ && git commit -m "feat(gudang): halaman navigasi denah lapangan mobile-first (#188)"`

---

### Task 6: Meja Kerja Kelola Admin & Impor Spreadsheet (`/admin/gudang/kelola`)

**Files:**
- Create: `src/app/(admin)/admin/gudang/kelola/page.tsx`
- Create: `src/app/(admin)/admin/gudang/kelola/management-client-view.tsx`
- Create: `src/components/warehouse/warehouse-import-modal.tsx`

**Interfaces:**
- Produces:
  - Meja kerja admin untuk melihat daftar master rak per gedung dan jumlah ambalan.
  - Tabel master barang denah fisik dengan filter pencarian dan ambalan.
  - Modal impor spreadsheet Excel/CSV lengkap dengan download template contoh.

- [ ] **Step 1: Implementasikan modal impor `src/components/warehouse/warehouse-import-modal.tsx`**
  - Parsing file Excel/CSV penempatan barang lokasi gudang.
  - Tombol download template format standar: `Kode | Nama | Satuan | Kategori | Kode Rak | Tingkat | Catatan`.
- [ ] **Step 2: Implementasikan view manajemen `src/app/(admin)/admin/gudang/kelola/management-client-view.tsx`**
  - Daftar rak per gedung, status kapasitas terisi, tombol kelola ambalan.
  - Form modal tambah/edit barang fisik dan penempatan ambalan.
- [ ] **Step 3: Implementasikan page `src/app/(admin)/admin/gudang/kelola/page.tsx`**
  - Server page dengan pemeriksaan autentikasi dan prefetch data master.
- [ ] **Step 4: Commit**
  - Command: `git add src/app/(admin)/admin/gudang/kelola/ src/components/warehouse/warehouse-import-modal.tsx && git commit -m "feat(gudang): meja kelola admin dan impor spreadsheet pemetaan (#188)"`

---

### Task 7: Integrasi Navigasi Admin & Tautan Pintasan Header/Sidebar

**Files:**
- Modify: `src/components/admin/admin-shell.tsx:120-170`
- Modify: `docs/PANDUAN_PENGGUNAAN.md`

**Interfaces:**
- Produces:
  - Menu navigasi *"Denah Gudang"* pada sidebar dan drawer admin dengan ikon `MapPin` / `Warehouse`.
  - Sub-menu *"Peta Lapangan"* (`/admin/gudang`) dan *"Kelola Lokasi"* (`/admin/gudang/kelola`).
  - Pembaruan dokumentasi panduan penggunaan petugas IFK.

- [ ] **Step 1: Tambahkan item menu Denah Gudang pada `src/components/admin/admin-shell.tsx`**
  - Sisipkan menu di bawah menu *"Ketersediaan Obat"*.
- [ ] **Step 2: Perbarui dokumentasi `docs/PANDUAN_PENGGUNAAN.md`**
  - Jelaskan alur kerja petugas lapangan mencari posisi obat di lorong menggunakan denah interaktif.
- [ ] **Step 3: Commit**
  - Command: `git add src/components/admin/admin-shell.tsx docs/PANDUAN_PENGGUNAAN.md && git commit -m "feat(gudang): navigasi admin shell dan panduan denah gudang (#188)"`

---

### Task 8: Editor Denah Interaktif Drag & Drop Berbasis Konva Canvas (`/admin/gudang/editor`)

**Files:**
- Modify: `prisma/schema.prisma:204-221`
- Modify: `src/actions/warehouse.ts`
- Create: `src/components/warehouse/warehouse-canvas-editor.tsx`
- Create: `src/app/(admin)/admin/gudang/editor/page.tsx`
- Create: `src/app/(admin)/admin/gudang/editor/editor-client-view.tsx`
- Modify: `src/app/(admin)/admin/gudang/locator-client-view.tsx`
- Create: `scripts/verify-warehouse-editor.ts`

**Interfaces:**
- Produces:
  - Kolom koordinat dinamis `x, y, width, height, rotation, corridor` pada `WarehouseRack`.
  - Server Action `saveWarehouseRackLayoutAction(racks: Array<{ id: string, x: number, y: number, width: number, height: number, rotation: number, corridor?: string }>)`.
  - Komponen kanvas Konva interaktif dengan fitur: drag balok rak, snap to grid (10px), rotate 90°, ubah dimensi, dan simpan tata letak.
  - Halaman editor denah visual di `/admin/gudang/editor` yang terhubung ke tombol di navigasi `/admin/gudang`.
  - Sinkronisasi instan posisi denah dinamis pada tampilan HP.

- [ ] **Step 1: Tambahkan koordinat spasial pada `prisma/schema.prisma` & sinkronkan DB**
  - Kolom: `x Float @default(100)`, `y Float @default(100)`, `width Float @default(240)`, `height Float @default(60)`, `rotation Float @default(0)`, `corridor String? @default("Lorong Gudang")`.
  - Jalankan `npx prisma db push` dan update `scripts/seed-warehouse.ts`.
- [ ] **Step 2: Buat Server Action `saveWarehouseRackLayoutAction` di `src/actions/warehouse.ts`**
  - Simpan array koordinat rak hasil drag & drop secara batch transaction di Prisma.
- [ ] **Step 3: Implementasikan komponen kanvas editor `src/components/warehouse/warehouse-canvas-editor.tsx`**
  - Menggunakan Konva (`Stage`, `Layer`, `Rect`, `Text`, `Group`, `Transformer`).
  - Fitur snap-to-grid, drag limits, seleksi transformer untuk resize/rotate, dan status perubahan belum disimpan (*dirty state*).
- [ ] **Step 4: Implementasikan halaman `/admin/gudang/editor`**
  - Server component `page.tsx` + client component `editor-client-view.tsx`.
  - Toolbar: Pilihan gedung, tombol *+ Tambah Balok Rak*, *Putar 90°*, *Reset Posisi Bawaan*, dan *Simpan Tata Letak*.
- [ ] **Step 5: Hubungkan koordinat dinamis dari database ke tampilan peta lapangan `locator-client-view.tsx`**
  - Denah lapangan membaca posisi `x, y, width, height` langsung dari database sehingga hasil editan editor seketika aktif.
- [ ] **Step 6: Verifikasi mandiri editor dan commit**
  - Skrip uji `scripts/verify-warehouse-editor.ts`.
  - Command: `git add ... && git commit -m "feat(gudang): editor denah interaktif drag & drop dengan konva (#188)"`

---

### Task 9: Skrip Uji Mandiri Komprehensif, Dev Server Verification & Pembuatan PR

**Files:**
- Create: `scripts/verify-warehouse-locator.ts`

**Interfaces:**
- Produces:
  - Skrip uji end-to-end 100% PASS meliputi:
    1. Integritas database 4 model denah + koordinat spasial.
    2. Konsistensi koordinat dinamis Konva editor vs denah SVG mobile.
    3. Akurasi pencarian fonetik/alias `matchMedicineSearch`.
    4. Validasi server action mutasi & query layout.
    5. Ukuran bundle komponen denah SVG <150 KB.
  - Pull Request #188 siap diuji dan direview di HP.

- [ ] **Step 1: Implementasikan `scripts/verify-warehouse-locator.ts`**
  - Uji seluruh aspek fungsionalitas dan pastikan 100% PASS.
  - Command: `npx tsx scripts/verify-warehouse-locator.ts`
- [ ] **Step 2: Jalankan skrip regresi proyek**
  - Command: `npx tsx scripts/verify-admin-theme-toggle.ts`
  - Command: `npx tsx scripts/verify-medicine-search.ts`
- [ ] **Step 3: Verifikasi respons HTTP dev server port 3003**
  - Pastikan halaman `/profile-ifk/admin/gudang`, `/profile-ifk/admin/gudang/kelola`, dan `/profile-ifk/admin/gudang/editor` merespons HTTP 200/307.
- [ ] **Step 4: Push branch dan buat Pull Request ke `develop`**
  - Command: `git push -u origin feat/188-warehouse-interactive-locator`
  - Command: `gh pr create --base develop --title "feat(gudang): modul denah interaktif 2D dan pencari lokasi obat gudang IFK" --body "..."`
