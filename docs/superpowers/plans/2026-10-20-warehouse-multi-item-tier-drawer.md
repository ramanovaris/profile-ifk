# Implementasi Dukungan Multi-Item per Ambalan pada Drawer Denah Interaktif Gudang (Issue #191)

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Menampilkan dukungan multi-item per ambalan pada drawer denah interaktif gudang melalui indikator jumlah obat di `RackTierVisualizer` dan tampilan daftar accordion per ambalan di `WarehouseBottomDrawer`.

**Architecture:** Pemetaan data relasi penempatan (`placements`) di rak dikelompokkan ke dalam struktur `itemsByLevel` (`Record<string, TierItemPlacement[]>`) dan `countsByLevel` (`Record<string, number>`) menggunakan utilitas helper `src/lib/warehouse-multi-item.ts`. Komponen `RackTierVisualizer` menampilkan badge jumlah item per tingkat, dan `WarehouseBottomDrawer` menyajikan daftar lipat accordion per ambalan (T5 s/d T1) yang dapat memilih item aktif secara instan.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, tsx test runner.

## Global Constraints
- Jangan jalankan `npx next build` atau `npx tsc` di VPS (RAM 2GB terbatas); verifikasi fungsionalitas menggunakan skrip eksekusi mandiri `npx tsx scripts/...` dan uji respons dev server via curl.
- Pertahankan performa rendering dan responsivitas mobile-first (maksimal tinggi drawer 65vh dengan scrolling internal halus).

---

### Task 1: Utilitas Transformasi Data Penempatan Multi-Item (`warehouse-multi-item.ts`)

**Files:**
- Create: `src/lib/warehouse-multi-item.ts`
- Test: `scripts/verify-warehouse-multi-item-drawer.ts`

**Interfaces:**
- Produces:
  - `TierItemPlacement`: tipe data penempatan obat pada ambalan fisik.
  - `GroupedRackPlacements`: struktur hasil pengelompokan penempatan rak.
  - `groupRackPlacementsByLevel(placements, totalLevels, options)`: fungsi deterministik untuk mengelompokkan penempatan ke tiap tingkat ambalan dan menghitung jumlah item.

- [ ] **Step 1: Write the failing test** — buat skrip uji mandiri `scripts/verify-warehouse-multi-item-drawer.ts` yang menguji:
  1. Pengelompokan 5 placement ke ambalan T1, T2, T3 pada rak 5 tingkat.
  2. Perhitungan akurat `countsByLevel` (contoh: T2 = 3 item, T1 = 2 item, T3/T4/T5 = 0).
  3. Penandaan `isTarget: true` untuk obat yang dicari berdasarkan ID atau nama.
  4. Penentuan `activeLevel` default (prioritas: param level -> level target -> level terisi pertama -> T1).
- [ ] **Step 2: Run test to verify it fails** — `npx tsx scripts/verify-warehouse-multi-item-drawer.ts` (harus gagal karena utilitas belum dibuat).
- [ ] **Step 3: Implement minimal code** — buat `src/lib/warehouse-multi-item.ts` yang mengimplementasikan antarmuka dan fungsi `groupRackPlacementsByLevel`.
- [ ] **Step 4: Run test to verify it passes** — `npx tsx scripts/verify-warehouse-multi-item-drawer.ts` (harus 100% PASS).
- [ ] **Step 5: Commit** — `git add src/lib/warehouse-multi-item.ts scripts/verify-warehouse-multi-item-drawer.ts && git commit -m "feat(gudang): utilitas grouping penempatan multi-item per ambalan (#191)"`

---

### Task 2: Pembaruan Komponen `RackTierVisualizer`

**Files:**
- Modify: `src/components/warehouse/rack-tier-visualizer.tsx`

**Interfaces:**
- Consumes:
  - Prop `itemCountsByLevel?: Record<string, number>`
  - Prop `activeLevel?: string | null`
  - Prop `onSelectLevel?: (level: string) => void`

- [ ] **Step 1: Update component interface & rendering** — tambahkan prop `itemCountsByLevel` ke `RackTierVisualizerProps`.
- [ ] **Step 2: Render badges on each tier** —
  - Jika `count > 0`, tampilkan badge solid: `{count} Obat`.
  - Jika `count === 0`, tampilkan badge muted: `Kosong`.
  - Jika ambalan adalah `activeLevel`, tampilkan highlight amber dan penanda aktif.
- [ ] **Step 3: Verify syntax & import** — jalankan skrip verifikasi tsx untuk memastikan tidak ada kesalahan kompilasi.
- [ ] **Step 4: Commit** — `git add src/components/warehouse/rack-tier-visualizer.tsx && git commit -m "feat(gudang): indikator badge jumlah obat pada rack tier visualizer (#191)"`

---

### Task 3: Pembaruan `WarehouseBottomDrawer` dengan Tampilan Accordion

**Files:**
- Modify: `src/components/warehouse/warehouse-bottom-drawer.tsx`

**Interfaces:**
- Consumes:
  - `TierItemPlacement`, `DrawerDetailData` dari `src/lib/warehouse-multi-item.ts`
  - `onSelectLevel`: callback pemilihan tingkat
  - `onSelectItem`: callback pemilihan item aktif di dalam drawer

- [ ] **Step 1: Update `DrawerDetailData` interface** — ekspor tipe terintegrasi dari `warehouse-multi-item.ts`.
- [ ] **Step 2: Implement compact bar updates** — tampilkan nama item aktif (atau nama rak), lokasi aktif, dan badge jumlah obat di ambalan aktif.
- [ ] **Step 3: Implement expanded view accordion** —
  - State `expandedLevel` yang tersinkronisasi dengan `activeLevelCode`.
  - Render daftar lipat ambalan dari T{totalLevels} turun ke T1.
  - Header accordion menampilkan nomor ambalan, jumlah obat, dan tombol ekspansi.
  - Konten lipatan menampilkan kartu obat mini (nama, kode, unit, kategori, badge `Target Obat`, tombol `Pilih`).
  - Menghubungkan klik tombol ambalan di `RackTierVisualizer` untuk langsung membuka accordion ambalan tersebut.
- [ ] **Step 4: Commit** — `git add src/components/warehouse/warehouse-bottom-drawer.tsx && git commit -m "feat(gudang): accordion daftar multi-item per ambalan di bottom drawer (#191)"`

---

### Task 4: Integrasi pada `MapClientView` (`map-client-view.tsx`)

**Files:**
- Modify: `src/app/(admin)/admin/gudang/peta/map-client-view.tsx`

**Interfaces:**
- Consumes:
  - `groupRackPlacementsByLevel` dari `@/lib/warehouse-multi-item`
  - `WarehouseBottomDrawer` yang telah diperbarui

- [ ] **Step 1: Refactor drawer data builder** — gunakan `groupRackPlacementsByLevel` saat:
  1. Auto-select dari URL parameter (`paramRack`, `paramLevel`, `paramItem`).
  2. Pemilihan obat dari `WarehouseSearchBox` (`handleSelectItemFromSearch`).
  3. Pemilihan rak dari denah SVG (`handleSelectRackOnMap`).
- [ ] **Step 2: Connect level & item selection handlers** —
  - `onSelectLevel`: perbarui `activePlacementData.activeLevelCode` dan sesuaikan `activeItem` ke obat pertama di ambalan tersebut (jika ada).
  - `onSelectItem`: perbarui `activePlacementData.activeItem` dan `activePlacementData.activeLevelCode` ke item yang dipilih.
- [ ] **Step 3: Test local dev server response** — jalankan curl ke `http://localhost:3003/admin/gudang/peta` untuk memverifikasi HTTP 200.
- [ ] **Step 4: Commit** — `git add src/app/(admin)/admin/gudang/peta/map-client-view.tsx && git commit -m "feat(gudang): integrasi multi-item drawer pada peta interaktif (#191)"`

---

### Task 5: Verifikasi Menyeluruh, Skrip Uji & Penutupan Issue

**Files:**
- Test: `scripts/verify-warehouse-multi-item-drawer.ts`

- [ ] **Step 1: Execute verification script** — pastikan semua kasus uji TDD lulus 100%.
- [ ] **Step 2: Dev server health check** — verifikasi server dev port 3003 aktif dan responsif.
- [ ] **Step 3: Push branch & create PR** — dorong branch `feat/191-warehouse-multi-item-tier-drawer` dan buat pull request ke branch `develop`.
