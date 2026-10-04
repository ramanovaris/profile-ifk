# Rencana Implementasi: Tambah Periode Baru Manual Stok Obat

> **For agentic workers:** Gunakan `delegate_task()` dengan tujuan dan konteks lengkap per tugas.

**Goal:** Membangun fitur penambahan periode stok obat baru secara manual dari antarmuka admin `/admin/stok` dengan pilihan fleksibel (Salin Master Obat atau Lembar Kosong).

**Architecture:** Server Action `createStockPeriodAction` di `src/actions/stock.ts` dengan penanganan transaksi efisien `createMany` ke PostgreSQL via Prisma. Pemicu aksi `createAction` diintegrasikan pada dropdown filter periode `StockMultiSelectFilter`, dan modal interaktif "Buka Periode Stok Baru" pada `stock-table.tsx` bertema *Dark Ethereal*.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS, Prisma 6, PostgreSQL, Lucide React.

## Global Constraints
- Jangan jalankan `next build` / `tsc` penuh di VPS untuk menghemat RAM (VPS 2GB).
- Verifikasi logika server via skrip Node/TS TDD `scripts/verify-stock-period-create.ts`.
- Desain *Dark Ethereal* selaras dengan palet admin.
- Seluruh teks antarmuka dan pesan *toast* dalam Bahasa Indonesia yang informatif.

---

### Task 1: TDD Backend Server Action `createStockPeriodAction`

**Files:**
- Create: `scripts/verify-stock-period-create.ts`
- Modify: `src/actions/stock.ts`

**Interfaces:**
- Consumes: `db.medicineStock`
- Produces: `createStockPeriodAction(input: CreateStockPeriodInput)`

- [ ] **Step 1: Tulis skrip uji gagal (Failing Test)**
  Buat `scripts/verify-stock-period-create.ts` yang menguji:
  1. Validasi penolakan format periode tidak valid.
  2. Validasi penolakan pembuatan jika target periode sudah ada di basis data.
  3. Pembuatan periode baru mode `COPY`: menyalin master obat dari periode `2026-06` ke `2026-99`, memverifikasi kuantitas fisik = 0, status = `EMPTY`, dan jumlah item sesuai.
  4. Pembersihan data uji (`2026-99`).

- [ ] **Step 2: Jalankan skrip uji untuk memastikan gagal**
  Jalankan `npx tsx scripts/verify-stock-period-create.ts` → pastikan gagal karena `createStockPeriodAction` belum ada.

- [ ] **Step 3: Implementasikan `createStockPeriodAction` di `src/actions/stock.ts`**
  Tambahkan fungsi `createStockPeriodAction` dengan dukungan:
  - Validasi otentikasi sesi (atau `_testUserId` saat pengujian).
  - Validasi keunikan target periode.
  - Mode `COPY`: mengambil data dari `sourcePeriod` dan menjalankan `createMany` dengan `quantity: 0`, `status: 'EMPTY'`, `source: 'MANUAL'`.
  - Revalidasi path `/admin/stok` dan `/stok`.

- [ ] **Step 4: Jalankan kembali skrip uji untuk verifikasi berhasil**
  Jalankan `npx tsx scripts/verify-stock-period-create.ts` → pastikan **PASS 100%**.

- [ ] **Step 5: Commit perubahan Task 1**
  `git add src/actions/stock.ts scripts/verify-stock-period-create.ts && git commit -m "feat(admin-stok): server action pembuatan periode stok baru"`

---

### Task 2: Peningkatan Dropdown `StockMultiSelectFilter` dengan `createAction`

**Files:**
- Modify: `src/components/admin/stock-multi-select-filter.tsx`

**Interfaces:**
- Produces: Properti `createAction?: FilterHeaderAction` pada `StockMultiSelectFilterProps`

- [ ] **Step 1: Tambahkan tipe `FilterHeaderAction`**
  ```ts
  export interface FilterHeaderAction {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }
  ```

- [ ] **Step 2: Render `createAction` di atas daftar opsi**
  Tampilkan tombol di bagian atas popover (di bawah input search bila ada) dengan pemisah border halus, warna aksen emerald bertema *Dark Ethereal*.

- [ ] **Step 3: Jalankan verifikasi tipe data**
  `npx tsc --noEmit` → pastikan 0 error.

- [ ] **Step 4: Commit perubahan Task 2**
  `git add src/components/admin/stock-multi-select-filter.tsx && git commit -m "feat(ui): dukungan createAction pada filter dropdown periode"`

---

### Task 3: Modal Dialog "Buka Periode Stok Baru" di `stock-table.tsx`

**Files:**
- Modify: `src/app/(admin)/admin/stok/stock-table.tsx`

**Interfaces:**
- Consumes: `createStockPeriodAction`, `StockMultiSelectFilter`
- Produces: State `isCreatePeriodOpen`, form bulan/tahun, radio card mode inisialisasi

- [ ] **Step 1: Siapkan State Modal Periode Baru**
  - `isCreatePeriodOpen`: boolean
  - `createPeriodMonth`: string (default bulan berikutnya)
  - `createPeriodYear`: string (default tahun berjalan)
  - `createPeriodMode`: `"COPY" | "BLANK"`
  - `createPeriodSource`: string (default `selectedPeriod` atau periode terbaru)

- [ ] **Step 2: Pasang `createAction` pada `StockMultiSelectFilter` Periode**
  ```tsx
  createAction={{
    label: "+ Buka Periode Baru",
    onClick: () => handleOpenCreatePeriod(),
  }}
  ```

- [ ] **Step 3: Bangun Dialog Modal "Buka Periode Stok Baru"**
  - Pilihan Bulan (Januari-Desember) & Tahun.
  - Lencana pratinjau `[Bulan] [Tahun] (YYYY-MM)`.
  - Radio card: "Salin Master Obat dari Periode [X]" vs "Lembar Kosong Murni".
  - Indikator peringatan jika periode sudah ada di `periodsList`.
  - Tombol Batal & Buka Periode Baru.

- [ ] **Step 4: Hubungkan Handler Pembuatan Periode**
  - Panggil `createStockPeriodAction`.
  - Tambahkan periode baru ke `periodsList`.
  - Alihkan URL ke `?periode=YYYY-MM`.
  - Tampilkan toast sukses.

- [ ] **Step 5: Verifikasi kompilasi TypeScript**
  `npx tsc --noEmit` → pastikan 0 error.

- [ ] **Step 6: Commit perubahan Task 3**
  `git add src/app/(admin)/admin/stok/stock-table.tsx && git commit -m "feat(admin-stok): modal buka periode stok baru manual"`

---

### Task 4: Pengujian & Verifikasi End-to-End Visual

**Files:**
- Test via Playwright / Small script

- [ ] **Step 1: Uji pembuatan periode mode COPY**
  Buka modal, pilih periode baru (misal `2026-08`), pilih mode COPY dari `2026-07`. Verifikasi seluruh master obat tersalin dengan stok 0.

- [ ] **Step 2: Uji pembuatan periode mode BLANK**
  Verifikasi periode kosong terbuka dengan tampilan 0 obat dan instruksi tambah obat yang rapi.

- [ ] **Step 3: Uji proteksi duplikasi**
  Verifikasi tombol dinonaktifkan dengan peringatan jika memilih periode yang sudah ada (`2026-06` atau `2026-07`).

---

### Task 5: Commit Final, Push & Siapkan PR

- [ ] **Step 1: Cek status git dan diff**
- [ ] **Step 2: Push ke remote `origin feat/118-stock-auto-calc-usage-mos`**
- [ ] **Step 3: Perbarui deskripsi PR #125 atau buat PR terpisah sesuai persetujuan pengguna**
