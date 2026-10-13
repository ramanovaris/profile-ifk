# Pencarian Nama Obat Cerdas Berbasis Normalisasi Fonetik & Alias Sinonim Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengoptimalkan fitur pencarian nama obat pada portal ketersediaan obat publik dan panel admin dengan normalisasi fonetik farmasi (EN/ID) dan kamus alias sinonim ringan tanpa dependensi eksternal.

**Architecture:** Mengimplementasikan modul utilitas kanonikal `src/lib/medicine-search.ts` yang menggabungkan pencocokan substring cepat, kamus alias akronim apotek dua arah, dan normalisasi fonetik digraf farmasi (`ph`->`f`, `th`->`t`, `x`->`ks`, `ch`->`k`, `y`->`i`, reduksi konsonan dobel). Modul ini diintegrasikan ke hook penyaringan tabel publik (`public-stock-client-view.tsx`), tabel admin (`stock-table.tsx`), dan server action riwayat obat (`stock.ts`).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Prisma ORM, tsx.

## Global Constraints

- **Hemat RAM VPS:** DILARANG menjalankan `next build` atau `npx tsc` manual di VPS (2GB RAM). Verifikasi menggunakan skrip mandiri `scripts/verify-medicine-search.ts` dan pengujian respons HTTP pada server dev Turbopack (port 3003).
- **Zero External Dependencies:** Tidak menginstal library NLP/soundex eksternal; murni algoritma string deterministik TypeScript bawaan.
- **GitFlow & Review HP:** Kerjakan pada branch `feat/137-smart-medicine-search`, buka PR ke `develop` yang ditautkan ke Issue #137 dan Project #1 PNS. DILARANG auto-merge tanpa persetujuan eksplisit pengguna.

---

### Task 1: Pembuatan Modul Utilitas `src/lib/medicine-search.ts` dan Skrip Verifikasi Mandiri

**Files:**
- Create: `src/lib/medicine-search.ts`
- Create: `scripts/verify-medicine-search.ts`

**Interfaces:**
- Produces:
  - `MEDICINE_SYNONYMS: Record<string, string[]>`
  - `normalizeMedicinePhonetic(text: string): string`
  - `matchMedicineSearch(item: StockSearchableItem, rawQuery: string): boolean`
  - Skrip pengujian CLI `scripts/verify-medicine-search.ts`

- [ ] **Step 1: Tulis skrip pengujian mandiri `scripts/verify-medicine-search.ts` (RED test)**
  - Menguji kasus uji ejaan Inggris: `amoxicillin` -> `Amoksisilin 500 mg`, `paracetamol` -> `Parasetamol 500 mg`, `thiamine` -> `Tiamin HCl`.
  - Menguji variasi populer: `amoksilin` -> `Amoksisilin 500 mg`.
  - Menguji akronim apotek: `pct` -> `Parasetamol 500 mg`, `ctm` -> `Klorfeniramin Maleat 4 mg`, `gg` -> `Gliseril Guaiakolat 100 mg`, `inh` -> `Isoniazid`.
  - Menguji kode obat & kategori: `OBT-001`, `Antibiotik`.
  - Jalankan via `npx tsx scripts/verify-medicine-search.ts` dan pastikan gagal karena modul belum dibuat.

- [ ] **Step 2: Implementasi modul `src/lib/medicine-search.ts` (GREEN implementation)**
  - Definisikan tipe antarmuka `StockSearchableItem` (`name: string; code?: string; category?: string; nomenklatur?: string | null`).
  - Definisikan kamus alias statis `MEDICINE_SYNONYMS`.
  - Implementasikan `normalizeMedicinePhonetic(text: string): string`.
  - Implementasikan `matchMedicineSearch(item: StockSearchableItem, rawQuery: string): boolean`.

- [ ] **Step 3: Jalankan verifikasi mandiri dan pastikan 100% PASS**
  - Command: `npx tsx scripts/verify-medicine-search.ts`

- [ ] **Step 4: Commit**
  - Command: `git add src/lib/medicine-search.ts scripts/verify-medicine-search.ts && git commit -m "feat(stok): utilitas pencarian cerdas fonetik dan sinonim farmasi (#137)"`

---

### Task 2: Integrasi Pencocokan Cerdas pada Tabel Ketersediaan Obat Publik

**Files:**
- Modify: `src/components/public/public-stock-client-view.tsx:184-204`

**Interfaces:**
- Consumes: `matchMedicineSearch` dari `@/lib/medicine-search`
- Modifies: Logika filter pencarian obat publik

- [ ] **Step 1: Impor `matchMedicineSearch` pada `public-stock-client-view.tsx`**
- [ ] **Step 2: Perbarui penyaringan pada `useMemo` filter items**
  - Ganti pemeriksaan substring lama dengan `matchMedicineSearch(item, search)`.
- [ ] **Step 3: Verifikasi respons HTTP halaman publik**
  - Command: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/profile-ifk/stok` (ekspektasi 200).
- [ ] **Step 4: Commit**
  - Command: `git add src/components/public/public-stock-client-view.tsx && git commit -m "feat(publik-stok): integrasi pencarian cerdas fonetik dan alias obat (#137)"`

---

### Task 3: Integrasi Pencocokan Cerdas pada Tabel Inventaris Stok Admin

**Files:**
- Modify: `src/app/(admin)/admin/stok/stock-table.tsx:340-361`

**Interfaces:**
- Consumes: `matchMedicineSearch` dari `@/lib/medicine-search`
- Modifies: Logika filter pencarian obat admin

- [ ] **Step 1: Impor `matchMedicineSearch` pada `stock-table.tsx`**
- [ ] **Step 2: Perbarui penyaringan pada `useMemo` filter items admin**
  - Ganti pemeriksaan substring lama dengan `matchMedicineSearch(item, search)`.
- [ ] **Step 3: Verifikasi respons HTTP halaman admin stok**
  - Command: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/profile-ifk/admin/stok` (ekspektasi 200).
- [ ] **Step 4: Commit**
  - Command: `git add src/app/(admin)/admin/stok/stock-table.tsx && git commit -m "feat(admin-stok): integrasi pencarian cerdas fonetik dan alias obat (#137)"`

---

### Task 4: Ekstensi Pencarian Riwayat Master Obat pada Server Action

**Files:**
- Modify: `src/actions/stock.ts:661-715`

**Interfaces:**
- Consumes: `expandMedicineSearchQueries` dari `@/lib/medicine-search`
- Modifies: Klausa `whereClause.OR` pada Prisma query `searchMedicineHistoryAction`

- [ ] **Step 1: Tambahkan helper `expandMedicineSearchQueries(query: string): string[]` di `src/lib/medicine-search.ts`**
  - Menghasilkan daftar query yang diperluas dengan istilah sinonim jika query cocok dengan kamus alias.
- [ ] **Step 2: Perbarui `searchMedicineHistoryAction` di `src/actions/stock.ts`**
  - Menambahkan varian query sinonim ke dalam klausa Prisma `OR`.
- [ ] **Step 3: Uji fungsi server action melalui skrip verifikasi**
  - Perluas `scripts/verify-medicine-search.ts` untuk menguji perluasan query.
- [ ] **Step 4: Commit**
  - Command: `git add src/lib/medicine-search.ts src/actions/stock.ts scripts/verify-medicine-search.ts && git commit -m "feat(actions): perluas pencarian riwayat master obat dengan sinonim farmasi (#137)"`

---

### Task 5: Verifikasi Akhir, Buka Pull Request, dan Persiapan Review Pengguna

**Files:**
- N/A (Git CLI & GitHub CLI)

- [ ] **Step 1: Jalankan pengujian verifikasi mandiri penuh**
  - Command: `npx tsx scripts/verify-medicine-search.ts` (harus 100% PASS).
- [ ] **Step 2: Uji HTTP endpoint dev server port 3003**
  - Halaman publik `/stok`: HTTP 200.
  - Halaman admin `/admin/stok`: HTTP 200.
- [ ] **Step 3: Push branch ke GitHub dan buat PR ke `develop`**
  - Command: `git push -u origin feat/137-smart-medicine-search`
  - Command: `gh pr create --base develop --title "feat(stok): pencarian nama obat cerdas berbasis normalisasi fonetik dan alias sinonim (EN/ID)" --body "..."`
- [ ] **Step 4: Pantau CI GitHub Actions sampai hijau**
- [ ] **Step 5: Sajikan skenario uji coba mandiri via HP kepada pengguna**
