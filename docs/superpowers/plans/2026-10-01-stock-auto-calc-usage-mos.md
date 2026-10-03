# Otomasi Kalkulasi RPB & Ketersediaan Stok (MOS) Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task if needed.

**Goal:** Mengembangkan fitur kalkulasi otomatis rata-rata pemakaian bulanan (RPB) dari data historis periode sebelumnya (hingga 12 bulan) serta kalkulasi instan tingkat ketersediaan (MOS) dan penentuan status stok saat pengisian formulir obat di modul admin Profile IFK.

**Architecture:** Pustaka kalkulasi fungsional murni (`stock-calc.ts`), Server Action pencarian riwayat obat lintas periode (`searchMedicineHistoryAction`), dan integrasi formulir modal reaktif dengan *smart autocomplete*, *on-blur detection*, dan *Quick Insight Box* dinamis.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Prisma ORM (PostgreSQL), Tailwind CSS, Lucide Icons.

---

## Task List

### Task 1: Engine Kalkulasi Stok Terpadu (`src/lib/stock-calc.ts`)
**Files:**
- Create: `src/lib/stock-calc.ts`
- Test: `scripts/verify-stock-auto-calc.ts`

- [ ] **Step 1: Buat skrip verifikasi TDD `scripts/verify-stock-auto-calc.ts`** dengan berbagai skenario (pembagian nol, kuantitas nol, desimal presisi, agregasi riwayat 12 bulan).
- [ ] **Step 2: Implementasikan `src/lib/stock-calc.ts`** yang memuat:
  - `calculateMos(quantity, avgUsage)`
  - `determineStockStatus(quantity, mos, manualStatus)`
  - `aggregateHistoricalUsage(records)`
- [ ] **Step 3: Jalankan verifikasi TDD** via `npx tsx scripts/verify-stock-auto-calc.ts` hingga lolos 100%.

### Task 2: Server Action Pencarian Riwayat Obat (`src/actions/stock.ts`)
**Files:**
- Modify: `src/actions/stock.ts`

- [ ] **Step 1: Tambahkan fungsi `searchMedicineHistoryAction(query: string, currentPeriod?: string)`** yang mencari data obat unik dari periode-periode sebelum `currentPeriod`, mengagregasikan nilai RPB rata-ratanya, dan mengembalikan data master obat.
- [ ] **Step 2: Selaraskan `createStockAction` dan `updateStockAction`** menggunakan fungsi murni `calculateMos` dan `determineStockStatus`.
- [ ] **Step 3: Uji Server Action** dengan skrip pengujian basis data terintegrasi.

### Task 3: Integrasi Modal Formulir Admin & Quick Insight Box (`src/app/(admin)/admin/stok/stock-table.tsx`)
**Files:**
- Modify: `src/app/(admin)/admin/stok/stock-table.tsx`

- [ ] **Step 1: Implementasikan Smart Autocomplete Dropdown** pada input Nama Obat dan Kode Barang di modal Tambah Obat.
- [ ] **Step 2: Implementasikan Deteksi Otomatis Saat Ketik Manual (`onBlur`)** sehingga RPB otomatis terisi meskipun admin tidak mengeklik dropdown saran.
- [ ] **Step 3: Pasang kalkulasi instan reaktif** pada perubahan field Kuantitas Fisik dan RPB:
  - Menghitung MOS secara instan.
  - Memperbarui status ketersediaan secara otomatis.
- [ ] **Step 4: Perkaya Quick Insight Box** dengan lencana visual status (Hijau/Kuning/Merah) dan indikator sumber RPB (misal: riwayat periode sebelumnya).

### Task 4: Verifikasi Visual & Pengujian End-to-End
- [ ] **Step 1: Uji pengisian form di browser via Playwright** (skenario ketik manual, skenario pilih autocomplete, dan skenario perubahan kuantitas).
- [ ] **Step 2: Verifikasi tangkapan layar responsif** di desktop dan mobile.

### Task 5: Dokumentasi, Commit, & Pull Request
- [ ] **Step 1: Git commit & push** branch `feat/118-stock-auto-calc-usage-mos`.
- [ ] **Step 2: Buka Pull Request ke branch `develop`**.
- [ ] **Step 3: Siapkan draf redaksi e-Kinerja PNS (SKP)**.
