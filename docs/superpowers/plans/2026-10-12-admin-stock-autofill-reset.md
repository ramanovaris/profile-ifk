# Reset Otomatis Nilai Autofill & Banner Peringatan Modal Tambah Obat Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Memperbaiki bug validasi pada modal Tambah Data Obat Baru di modul admin stok (`/admin/stok`) agar secara otomatis menghapus banner peringatan usang dan mereset nilai autofill (kode barang, RPB, nomenklatur) saat nama atau kode obat diganti oleh pengguna (#161).

**Architecture:** Menambahkan state pelacak `autofilledSource` pada komponen `StockTable` di `src/app/(admin)/admin/stok/stock-table.tsx`. Saat event `onChange` pada input nama atau kode obat mendeteksi perbedaan dari nilai asal autofill, sistem secara reaktif menghapus `historyHint`, mengosongkan nilai yang terikat dengan data autofill sebelumnya, dan membuka kunci pemeriksaan pada `onBlur`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Lucide Icons, tsx.

## Global Constraints

- **Hemat RAM VPS:** DILARANG menjalankan `next build` atau `npx tsc` manual di VPS (2GB RAM). Verifikasi menggunakan skrip mandiri `scripts/verify-stock-autofill-reset.ts` dan pengujian respons HTTP pada server dev Turbopack (port 3003).
- **Zero External Dependencies:** Tidak menambah dependensi baru.
- **GitFlow & Review HP:** Kerjakan pada branch `fix/161-admin-stock-autofill-reset`, buka PR ke `develop` yang ditautkan ke Issue #161 dan Project #1 PNS. DILARANG auto-merge tanpa persetujuan eksplisit pengguna.

---

### Task 1: Pembuatan Skrip Pengujian Mandiri Logika Reset Autofill

**Files:**
- Create: `scripts/verify-stock-autofill-reset.ts`

**Interfaces:**
- Menguji fungsi transisi state formulir penambahan obat:
  1. Kondisi awal formulir kosong (`historyHint = null`, `autofilledSource = null`).
  2. Pemicuan autofill dari riwayat obat ("Obat Kuat" / `OBT-091`): mengisi kode, RPB, satuan, kategori, dan memunculkan `historyHint` warning/match.
  3. Pengguna mengganti nama menjadi obat baru ("dmfdf"):
     - `historyHint` harus menjadi `null`.
     - `code` yang sebelumnya berasal dari autofill harus kembali kosong.
     - `avgUsage` dan `mos` harus kembali kosong.
     - `autofilledSource` harus menjadi `null`.
  4. Pengguna melakukan blur pada nama baru: harus memicu status `new` ("🆕 Obat baru").
  5. Pengguna mengetik nama obat yang cocok lagi: memicu autofill baru dengan benar.

- [ ] **Step 1: Tulis skrip `scripts/verify-stock-autofill-reset.ts`**
- [ ] **Step 2: Jalankan via `npx tsx scripts/verify-stock-autofill-reset.ts`**

---

### Task 2: Implementasi Pelacak Autofill & Reset Otomatis di `stock-table.tsx`

**Files:**
- Modify: `src/app/(admin)/admin/stok/stock-table.tsx`

- [ ] **Step 1: Tambahkan state `autofilledSource` dan perbarui `handleOpenAdd`**
  - Set `autofilledSource` ke `null` saat membuka modal.
- [ ] **Step 2: Catat sumber autofill pada `handleSelectSuggestion` dan `handleFieldBlur`**
  - Simpan objek asal: `{ code, name, category, unit, nomenklatur, avgUsage }`.
- [ ] **Step 3: Tangani pembersihan reaktif pada `onChange` `add-name` dan `add-code`**
  - Jika nama berubah menjauhi data autofill, bersihkan `historyHint`, kosongkan `code` turunan, kosongkan `avgUsage`, dan reset `autofilledSource`.
  - Jika kode berubah menjauhi data autofill, bersihkan `historyHint`, kosongkan `name` turunan, kosongkan `avgUsage`, dan reset `autofilledSource`.
- [ ] **Step 4: Sempurnakan logika `handleFieldBlur`**
  - Hapus penguncian kaku `if (addForm.avgUsage === "" || !historyHint)`.
  - Berikan toleransi query baru dan set label `new` ("🆕 Obat baru") jika tidak ada kecocokan di database.

---

### Task 3: Verifikasi Mandiri, Uji Server Dev, & Pembuatan Pull Request

**Files:**
- Verify: `scripts/verify-stock-autofill-reset.ts`
- Verify: Dev server port 3003 (HTTP 200)

- [ ] **Step 1: Jalankan skrip verifikasi**
  - Command: `npx tsx scripts/verify-stock-autofill-reset.ts`
- [ ] **Step 2: Tes dev server port 3003**
  - Command: `curl -I -s http://localhost:3003/profile-ifk/admin/stok`
- [ ] **Step 3: Commit perubahan**
  - Command: `git add . && git commit -m "fix(admin-stok): reset otomatis nilai autofill dan banner peringatan saat input nama obat diubah (#161)"`
- [ ] **Step 4: Push branch dan buka PR ke `develop`**
  - Command: `git push -u origin fix/161-admin-stock-autofill-reset && gh pr create --base develop --head fix/161-admin-stock-autofill-reset ...`
