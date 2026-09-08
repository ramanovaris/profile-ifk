# UI Ketersediaan Stok Obat & BMHP IFK Kotabaru — Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Membangun UI publik dan admin untuk menampilkan serta mengelola data stok obat IFK (mock 200 item) dengan desain *Dark Ethereal*.

**Architecture:** 
1. Pola data state lokal menggunakan `useState` dan data awal (seed) di `dummy-data.ts`, memanfaatkan helper untuk kalkulasi metrik.
2. Publik (`/stok`) menggunakan komponen table & search/filter native dengan styling *clean minimalist luxury*.
3. Admin (`/admin/stok`) mengikuti pola standarisasi terpadu card glassmorphism yang sudah ada.

**Tech Stack:** React 19, Next.js 16, Lucide React Icons, Tailwind CSS.

## Global Constraints
1. Zero new library dependencies (`npm install` tidak ditambah).
2. Semua pengujian untuk komponen frontend (TDD logic, build verification) sesuai standar Hermes.
3. Visual harus tampil sempurna pada tampilan desktop (md+) dan mode HP "Desktop site" (viewport md).
4. Sistem atau komponen yang sudah ada tidak diubah fungsinya secara signifikan kecuali untuk integrasi yang dibutuhkan (router, layout, shell).

---

## File Structure

- **Create:** `src/app/(public)/stok/page.tsx`
- **Create:** `src/app/(admin)/admin/stok/page.tsx`
- **Create:** `src/app/(admin)/admin/stok/stock-form.tsx`
- **Modify:** `src/lib/dummy-data.ts` (Tambah tipe data `MedicineStockItem` & seed data 200 item)
- **Modify:** `src/components/public/navbar.tsx` (Tambah link "Ketersediaan Obat")
- **Modify:** `src/components/admin/admin-shell.tsx` (Tambah sidebar link "Stok Obat")

---

### Task 1: Fondasi Data & Mock Seed

**Files:**
- Modify: `src/lib/dummy-data.ts`

**Interfaces:**
- Consumes: Tidak ada (modul fundamental)
- Produces: Tipe `StockStatus`, `MedicineCategory`, `MedicineStockItem`, `StockSummary`. Fungsi helper `getStockSummary(items: MedicineStockItem[])`. Array `initialMedicineStock: MedicineStockItem[]` berisi ~200 item dummy.

- [ ] **Step 1: Update Data Source** — `write_file(path="src/lib/dummy-data.ts", content=...)`. Tambahkan tipe data dan helper sesuai spesifikasi. Buat array `initialMedicineStock` yang merepresentasikan data fisik obat nyata (Paracetamol, Amoxicillin, Infus, Spuit, dll) dengan status bervariasi (`AVAILABLE`, `LOW`, `EMPTY`).
- [ ] **Step 2: Build Verification** — `terminal(command='npx tsc --noEmit')`. Pastikan tidak ada error TypeScript.
- [ ] **Step 3: Commit** — `terminal(command='git add -A && git commit -m "feat(data): tambahkan tipe data, helper, dan mock seed 200 item stok obat"')`

---

### Task 2: Integrasi Link Navigasi

**Files:**
- Modify: `src/components/public/navbar.tsx:12-18`
- Modify: `src/components/admin/admin-shell.tsx:30-37`

**Interfaces:**
- Consumes: Tidak ada
- Produkses: Link navigation baru terlihat di tampilan publik dan sidebar admin.

- [ ] **Step 1: Update Navbar Publik** — `patch(path="src/components/public/navbar.tsx", old_string="{ href: \"/kontak\", label: \"Kontak\" },", new_string="{ href: \"/stok\", label: \"Ketersediaan Obat\" },\n  { href: \"/kontak\", label: \"Kontak\" },")`
- [ ] **Step 2: Update Sidebar Admin** — `patch(path="src/components/admin/admin-shell.tsx", old_string="import { LayoutDashboard, Newspaper, Users, UserCog, Settings, LogOut, Menu, Tags } from \"lucide-react\";", new_string="import { LayoutDashboard, Newspaper, Users, UserCog, Settings, LogOut, Menu, Tags, Package } from \"lucide-react\";")` lalu patch `sidebarLinks` array untuk menambahkan item baru.
- [ ] **Step 3: Build Verification** — `terminal(command='npx tsc --noEmit')`.
- [ ] **Step 4: Commit** — `terminal(command='git add -A && git commit -m "feat(navigation): tambahkan menu ketersediaan obat di navbar publik dan sidebar admin"')`

---

### Task 3: Komponen Publik & Tabel Stok

**Files:**
- Create: `src/app/(public)/stok/page.tsx`

**Interfaces:**
- Consumes: Tipe `MedicineStockItem`, Array `initialMedicineStock`, Fungsi `getStockSummary`, `cn` utility dari `@/lib/utils`.
- Produkses: Halaman `/stok` yang berfungsi penuh.

- [ ] **Step 1: Implementasi UI Halaman Publik** — `write_file(path="src/app/(public)/stok/page.tsx", content=...)`.
    - Penerapan komponen berstandar *clean minimalist* (latar putih bersih atau `bg-zinc-50`).
    - Header & deskripsi singkat.
    - Komponen metrik kartu (Total, Tersedia, Menipis, Kosong).
    - Toolbar pencarian dan filter kategori/status menggunakan pill button.
    - Tabel responsif `md+`: loop array `initialMedicineStock`. Kolom tabel: *No*, *Nama Obat*, *Kategori*, *Satuan*, *Jumlah Stok*, *Badge Status*.
    - Komponen *Badge Status* (`AVAILABLE`: emerald, `LOW`: amber, `EMPTY`: rose/zinc).
    - Pagination state sederhana (10 item per page).
- [ ] **Step 2: Build & Runtime Verification** — `terminal(command='npx next build && npx next start --port 3003 &')`. Jalankan curl ke `localhost:3003/stok` dan pastikan HTTP 200.
- [ ] **Step 3: Commit** — `terminal(command='git add -A && git commit -m "feat(publik): halaman ketersediaan obat dengan tabel dan filter"')`

---

### Task 4: Form Import Placeholder & Admin Page

**Files:**
- Create: `src/app/(admin)/admin/stok/page.tsx`
- Create: `src/app/(admin)/admin/stok/stock-form.tsx`

**Interfaces:**
- Consumes: Tipe `MedicineStockItem`, Array `initialMedicineStock`, Fungsi `getStockSummary`, `toast` dari `@/components/ui/toast`. Pola desain terpadu card glassmorphism dari `kategori/page.tsx` atau `pengguna/page.tsx`.
- Produkses: Halaman Admin `/admin/stok` berfungsi penuh.

- [ ] **Step 1: Implementasi Form Import Placeholder** — `write_file(path="src/app/(admin)/admin/stok/stock-form.tsx", content=...)`. Membuat komponen dialog/Sheet yang berisi area *Drag & Drop* file, tombol unduh template, dan tombol import (yang saat ini hanya memanggil `toast.info("Fitur parsing file akan segera hadir")`).
- [ ] **Step 2: Implementasi Halaman Admin** — `write_file(path="src/app/(admin)/admin/stok/page.tsx", content=...)`.
    - Bungkus dalam `<AdminShell>`.
    - Header & Tombol Aksi (Import Data Stok membuka `stock-form.tsx`).
    - Ringkasan Metrik (Card styles `bg-zinc-900/60` border `zinc-800`).
    - Toolbar Search & Filter (mengikuti pola terpadu `bg-zinc-900/40` backdrop blur).
    - Tabel Data Admin: Kolom (No, Kode/Nama, Kategori, Satuan, Jumlah Stok, Status, Aksi).
    - Tombol Aksi di setiap baris: Edit atau Hapus (hanya UI, jika diklik panggil `toast.info("Fitur edit/delete akan segera hadir")`).
    - Logika filter, search, dan pagination mirip publik namun dengan theme `Dark Ethereal`.
- [ ] **Step 3: Build & Runtime Verification** — Pastikan build sukses. Jalankan curl ke `localhost:3003/admin/stok` (otentikasi admin perlu di-bypass atau di-handle sesuai pola yang ada di page admin lainnya, umumnya `dummy-data.ts` simulasi login).
- [ ] **Step 4: Commit** — `terminal(command='git add -A && git commit -m "feat(admin): halaman kelola stok obat dengan metrik, tabel, dan form import placeholder"')`

---

### Task 5: Linting, Type Check & Akhir Sesi

**Files:**
- Tidak ada perubahan file kode baru.

- [ ] **Step 1: Full Verification** — `terminal(command='npx tsc --noEmit && npm run lint')`.
- [ ] **Step 2: Push Remote** — `terminal(command='git push origin feat/stok-obat-ui')`.
- [ ] **Step 3: Final Commit** — (Tidak perlu jika tidak ada perubahan, cukup push).
