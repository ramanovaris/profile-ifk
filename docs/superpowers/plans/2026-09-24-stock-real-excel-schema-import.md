# Implementation Plan: Penyesuaian Skema Database & Impor Data Real Stok Excel (Issue #68)

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Menyesuaikan model basis data stok obat dengan metrik logistik riil (MOS, rata-rata pemakaian, kedaluwarsa, nomenklatur terapi), menyuntikkan 87 data riil obat resmi Kabupaten Kotabaru periode Juni 2026, serta mengimplementasikan parser impor otomatis berkas Excel (.xlsx) di panel admin dan indikator kecukupan bulan di web publik.

**Architecture:** Memperluas skema `MedicineStock` Prisma ORM, memperbarui seeder dan fallback dummy data dengan data riil kedua file Excel, menambahkan Server Action `importStockFileAction` berbasis `xlsx` (SheetJS) di Node.js server, serta mempercantik tabel publik dan admin dengan badge *Tingkat Ketersediaan* (MOS).

**Tech Stack:** Next.js App Router (Turbopack), Prisma ORM, PostgreSQL, `xlsx` (SheetJS), Tailwind CSS, Lucide React, Server Actions.

## Global Constraints
- Mematuhi memori VPS: **Jangan jalankan `next build` atau `tsc` di VPS (RAM 2GB)**; verifikasi fungsionalitas via script tsx terisolasi dan respons HTTP runtime.
- Server dev berjalan di port 3003 (`http://localhost:3003/profile-ifk/`).
- Desain Admin: Tema *Dark Ethereal* (`bg-zinc-950/60`, border `border-white/10`, teks `text-zinc-100`).
- Desain Publik: Tema *Clean Light* dengan kontras tinggi (`text-zinc-700`, WCAG AA).
- Kompatibilitas mundur: Seluruh kolom baru bersifat opsional (`?`) agar tidak merusak data eksisting.

---

### Task 1: Instalasi Parser Excel, Skema Prisma & Sinkronisasi Basis Data

**Files:**
- Modify: `package.json`
- Modify: `prisma/schema.prisma:100-120`

**Interfaces:**
- Menambahkan kolom baru pada model `MedicineStock`:
  - `avgUsage Float? @default(0)`
  - `mos Float?`
  - `expiryDate String?`
  - `nomenklatur String?`
  - `source String? @default("MANUAL")`

- [ ] **Step 1: Install dependency `xlsx`** — `npm install xlsx`.
- [ ] **Step 2: Modifikasi schema.prisma** — patch model `MedicineStock` dengan 5 kolom baru dan index `source`.
- [ ] **Step 3: Sinkronisasi database & Prisma client** — `npx prisma db push && npx prisma generate`.
- [ ] **Step 4: Verifikasi skema di basis data** — jalankan script verifikasi ringan.
- [ ] **Step 5: Commit** — `git commit -m "feat(db): tambah kolom logistik mos ed dan nomenklatur pada medicine_stocks (#68)"`.

---

### Task 2: Pembaruan Tipe Data, Helper MOS, dan Seeder Data Real Kotabaru

**Files:**
- Modify: `src/lib/dummy-data.ts`
- Modify: `prisma/seed.ts`
- Script: `scripts/seed-real-stocks.ts` (opsional helper ekstrak)

**Interfaces:**
- Memperluas tipe `MedicineStockItem` di `src/lib/dummy-data.ts`.
- Menambahkan helper `getMosBadgeInfo(quantity: number, mos?: number | null)`.
- Mengisi `initialMedicineStock` dan `prisma/seed.ts` dengan 87 data riil Kabupaten Kotabaru hasil gabungan file Indikator & Program:
  - 40 Obat Indikator -> Kategori "Obat Generik", source "INDIKATOR".
  - 47+ Obat Program -> Kategori "Obat Program", source "PROGRAM".
  - Field `avgUsage`, `mos`, `expiryDate`, `nomenklatur`.

- [ ] **Step 1: Update interface MedicineStockItem & buat getMosBadgeInfo() di `src/lib/dummy-data.ts`**.
- [ ] **Step 2: Susun data 87 obat riil dan masukkan ke `prisma/seed.ts` dan `initialMedicineStock`**.
- [ ] **Step 3: Jalankan seeder database** — `npx tsx prisma/seed.ts`.
- [ ] **Step 4: Verifikasi jumlah item di basis data** — pastikan 87 item tersimpan dengan status dan MOS presisi.
- [ ] **Step 5: Commit** — `git commit -m "feat(stok): suntikkan 87 data riil obat kotabaru dan helper mos (#68)"`.

---

### Task 3: Server Actions — Impor File Excel (.xlsx/.csv) & CRUD Dinamis

**Files:**
- Modify: `src/actions/stock.ts`
- Test Script: `scripts/verify-stock-excel-import.ts`

**Interfaces:**
- Memperluas `StockItemInput` dengan field opsional baru.
- Memperbarui `createStockAction`, `updateStockAction`, dan `batchImportStockAction`.
- Mengembangkan Server Action baru: `importStockFileAction(formData: FormData): Promise<StockActionResult<{ inserted: number; updated: number }>>`:
  - Menerima `FormData` file (`.xlsx` atau `.csv`).
  - Mengurai workbook buffer dengan `xlsx`.
  - Logika pendeteksi pintar:
    - Jika sheet `Obat Indikator` / kolom `Nomenklatur` -> format Indikator.
    - Jika sheet `Laporan Obat Program` / `Detil Stok` -> format Program + tanggal ED.
    - Jika file CSV / kolom biasa -> format Standard.
  - Melakukan upsert ke PostgreSQL berdasarkan `code`.
  - Revalidate cache rute `/stok` dan `/admin/stok`.

- [ ] **Step 1: Update interface StockItemInput & aksi CRUD di `src/actions/stock.ts`**.
- [ ] **Step 2: Implementasi importStockFileAction() dengan multi-format parser**.
- [ ] **Step 3: Tulis dan jalankan test script `scripts/verify-stock-excel-import.ts`** dengan kedua file riil kantor.
- [ ] **Step 4: Commit** — `git commit -m "feat(actions): implementasi importStockFileAction multi-format excel dan csv (#68)"`.

---

### Task 4: Tampilan Publik Ketersediaan Stok (`/stok`)

**Files:**
- Modify: `src/components/public/public-stock-client-view.tsx`
- Modify: `src/app/(public)/stok/page.tsx`

**Interfaces:**
- Memastikan query `StokPublikPage` menyertakan kolom baru (`avgUsage`, `mos`, `expiryDate`, `nomenklatur`, `source`).
- Menambahkan kolom **Tingkat Ketersediaan** pada tabel desktop.
- Menampilkan badge MOS kontekstual:
  - Hijau: `Aman (X bln)`
  - Kuning: `Menipis (X bln)`
  - Merah muda: `Kritis (< 1 bln)`
  - Abu-abu/Merah: `Kosong`
- Menampilkan info nomenklatur terapi dan ED terdekat di bawah nama obat secara elegan.
- Memastikan responsivitas kartu metrik ringkasan dan tabel di layar HP tidak ada overflow.

- [ ] **Step 1: Update query di `src/app/(public)/stok/page.tsx`**.
- [ ] **Step 2: Modifikasi `public-stock-client-view.tsx` dengan kolom Tingkat Ketersediaan dan detail terapi**.
- [ ] **Step 3: Verifikasi respons HTTP 200 di port 3003 dan uji visual seluler**.
- [ ] **Step 4: Commit** — `git commit -m "feat(publik): tampilkan tingkat ketersediaan mos dan info ed pada tabel stok (#68)"`.

---

### Task 5: Antarmuka Admin Stok Obat (`/admin/stok`)

**Files:**
- Modify: `src/app/(admin)/admin/stok/page.tsx`
- Modify: `src/app/(admin)/admin/stok/stock-table.tsx`
- Modify: `src/app/(admin)/admin/stok/stock-form.tsx`

**Interfaces:**
- `stock-table.tsx`: Menambahkan kolom Tingkat Ketersediaan & info ED pada tabel admin bertema *Dark Ethereal*.
- `stock-form.tsx`:
  - Modal Impor: Mendukung unggah `.xlsx` dan `.csv`.
  - Mengirim `FormData` langsung ke `importStockFileAction`.
  - Modal Tambah/Edit: Menyediakan kolom opsional untuk Rata-rata Pemakaian, MOS, ED, dan Nomenklatur.

- [ ] **Step 1: Update `stock-table.tsx` untuk menampilkan kolom Tingkat Ketersediaan**.
- [ ] **Step 2: Update `stock-form.tsx` dengan upload handler `.xlsx` via `importStockFileAction`**.
- [ ] **Step 3: Verifikasi HTTP 200 pada `/admin/stok` dan uji alur unggah file real di staging**.
- [ ] **Step 4: Commit** — `git commit -m "feat(admin): integrasi impor excel dan kolom logistik pada admin stok (#68)"`.

---

### Task 6: Verifikasi Menyeluruh, PR, dan Dokumentasi SKP

**Files:**
- Seluruh berkas terkait Issue #68

- [ ] **Step 1: Buat PR ke `develop` menggunakan `gh pr create`**.
- [ ] **Step 2: Pantau CI GitHub Actions hingga lolos (green checklist)**.
- [ ] **Step 3: Sediakan redaksi SKP e-Kinerja PNS dan panduan skenario testing untuk Mas Rama**.
