# Ekspor Rekap Ketersediaan Stok Obat ke Excel Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Menyediakan fitur ekspor data ketersediaan stok obat dan BMHP ke format spreadsheet Excel (`.xlsx`) secara instan di sisi klien sesuai filter dan periode aktif pada halaman publik (`/stok`) dan panel admin (`/admin/stok`).

**Architecture:** Modul utilitas terisolasi `src/lib/stock-exporter.ts` memetakan data obat (`MedicineStockItem[]`) menjadi lembar kerja Excel berformat standar resmi UPTD IFK Kotabaru menggunakan library `xlsx` (SheetJS) dan memicu pengunduhan instan di browser. Komponen UI publik dan admin mengonsumsi utilitas ini dengan menyertakan metadata ringkasan filter aktif.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, SheetJS (`xlsx`), Tailwind CSS v4, Lucide React.

## Global Constraints
- Menggunakan pustaka `xlsx` yang sudah terpasang di dependencies proyek (tanpa menambah dependensi baru).
- Ekspor berjalan di sisi peramban (*client-side*) untuk menghemat CPU dan RAM VPS 2GB.
- Format file rapi dengan header resmi instansi, nomor urut, auto-width kolom, dan tipe angka numerik murni agar kompatibel dengan rumus Excel/WPS.
- Branch kerja: `feat/110-stock-excel-export` berbasis `develop`.

---

### Task 1: Modul Utilitas Ekspor Data Stok (`src/lib/stock-exporter.ts`)

**Files:**
- Create: `src/lib/stock-exporter.ts`
- Create: `scripts/test-stock-exporter.ts`

**Interfaces:**
- Consumes: `MedicineStockItem`, `formatStockCutoffDate`, `formatStockPeriodLabel`, `getItemEffectiveStatus` from `@/lib/dummy-data`
- Produces: 
  - `buildStockExcelWorkbook(items: MedicineStockItem[], period: string, options?: StockExportOptions): XLSX.WorkBook`
  - `exportStockToExcel(items: MedicineStockItem[], period: string, options?: StockExportOptions): void`

- [ ] **Step 1: Tulis skrip pengujian verifikasi workbook** — `write_file('scripts/test-stock-exporter.ts', ...)`
- [ ] **Step 2: Jalankan skrip pengujian (harus gagal karena fungsi belum diimplementasikan)** — `terminal('npx tsx scripts/test-stock-exporter.ts')` → expect FAIL
- [ ] **Step 3: Implementasi logika pembentukan workbook dan trigger download** — `write_file('src/lib/stock-exporter.ts', ...)`
- [ ] **Step 4: Jalankan kembali skrip pengujian (harus lolos 100%)** — `terminal('npx tsx scripts/test-stock-exporter.ts')` → expect PASS
- [ ] **Step 5: Commit perubahan modul utilitas** — `terminal('git add src/lib/stock-exporter.ts scripts/test-stock-exporter.ts && git commit -m "feat(stok): implementasi modul utilitas ekspor data stok ke excel (#110)"')`

---

### Task 2: Integrasi Tombol Unduh Excel di Halaman Publik (`/stok`)

**Files:**
- Modify: `src/components/public/public-stock-client-view.tsx`

**Interfaces:**
- Consumes: `exportStockToExcel` from `@/lib/stock-exporter`, `FileSpreadsheet` from `lucide-react`
- Produces: Tombol "Unduh Excel" responsif di samping pemilih periode pada info bar cut-off

- [ ] **Step 1: Tambahkan tombol "Unduh Excel" dan handler ekspor filter aktif pada info bar**
- [ ] **Step 2: Verifikasi tata letak dan fungsionalitas di tampilan desktop dan mobile**
- [ ] **Step 3: Commit perubahan antarmuka publik** — `terminal('git add src/components/public/public-stock-client-view.tsx && git commit -m "feat(publik): tambah tombol unduh excel rekap stok per periode (#110)"')`

---

### Task 3: Integrasi Tombol Ekspor Excel di Panel Admin (`/admin/stok`)

**Files:**
- Modify: `src/app/(admin)/admin/stok/stock-table.tsx`

**Interfaces:**
- Consumes: `exportStockToExcel` from `@/lib/stock-exporter`, `FileSpreadsheet` from `lucide-react`
- Produces: Tombol "Ekspor Excel" bertema Dark Ethereal pada header aksi tabel admin

- [ ] **Step 1: Tambahkan tombol "Ekspor Excel" di samping tombol "Unduh Template" pada header aksi**
- [ ] **Step 2: Sambungkan dengan data `filteredItems`, `selectedPeriod`, dan ringkasan filter aktif**
- [ ] **Step 3: Commit perubahan antarmuka admin** — `terminal('git add src/app/(admin)/admin/stok/stock-table.tsx && git commit -m "feat(admin): tambah tombol ekspor excel rekap stok di panel admin (#110)"')`

---

### Task 4: Validasi Kompilasi, Uji Coba Unduhan, dan Pembuatan PR

**Files:**
- Review: `src/lib/stock-exporter.ts`, `src/components/public/public-stock-client-view.tsx`, `src/app/(admin)/admin/stok/stock-table.tsx`

- [ ] **Step 1: Jalankan typecheck TypeScript tanpa emit** — `terminal('npx tsc --noEmit')` → expect 0 errors
- [ ] **Step 2: Bersihkan skrip pengujian sementara** — `terminal('rm scripts/test-stock-exporter.ts && git rm --cached scripts/test-stock-exporter.ts 2>/dev/null || true')`
- [ ] **Step 3: Push branch `feat/110-stock-excel-export` ke remote origin**
- [ ] **Step 4: Buat Pull Request (PR) ke branch `develop` dan tautkan ke Issue #110 serta GitHub Project**
- [ ] **Step 5: Verifikasi status CI GitHub Actions**
