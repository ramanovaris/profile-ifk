# Integrasi Database PostgreSQL Metrik Statistik & Ringkasan Aktivitas Dashboard Admin Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengintegrasikan basis data PostgreSQL via Prisma ORM ke halaman dashboard administrator (`/admin/dashboard`) guna menyajikan metrik statistik publikasi, stok obat, 5 artikel terbaru, dan ringkasan aktivitas pengguna berbasis peran (RBAC) secara waktu nyata.

**Architecture:** Mengonversi `src/app/(admin)/admin/dashboard/page.tsx` menjadi Server Component Next.js dinamis (`force-dynamic`). Seluruh kueri agregasi metrik, rekaman artikel, dan data pengguna dijalankan secara konkuren via `Promise.all` langsung ke Prisma `db`. Antarmuka menyesuaikan peran (Super Admin: 5 KPI + daftar pengelola akun aktif; Staf: 4 KPI + ringkasan artikel saya).

**Tech Stack:** Next.js 16 (App Router, Server Components), Prisma ORM, PostgreSQL, Tailwind CSS v4, Lucide React, TypeScript.

## Global Constraints

- Sesuai standar proyek: tidak menjalankan `next build` atau `tsc` berat di VPS Tencent Cloud (2GB RAM); pengujian menggunakan skrip verifikasi mandiri berbasis `tsx` dan verifikasi lint/typecheck diserahkan ke GitHub Actions CI.
- Dilarang mematikan proses port 20128 (`9router`).
- Seluruh teks antarmuka dan notifikasi dilarang menggunakan istilah teknis backend (*PostgreSQL, database, Prisma, SQL*).
- Komponen visual mengikuti tema *Dark Ethereal UI*.

---

### Task 1: Pembuatan Skrip Verifikasi Mandiri Basis Data (`scripts/verify-dashboard-db.ts`)

**Files:**
- Create: `scripts/verify-dashboard-db.ts`

**Interfaces:**
- Consumes: `@/lib/db`, Prisma models (`article`, `medicineStock`, `user`, `category`)
- Produces: Runnable verification script exiting with code 0 on success

- [ ] **Step 1: Tulis skrip verifikasi mandiri**
  Membuat berkas `scripts/verify-dashboard-db.ts` yang menguji:
  1. Kueri agregasi metrik: `totalArticles`, `publishedArticles`, `draftArticles`, `totalStock`, dan `activeUsersCount`.
  2. Kueri 5 artikel terbaru menyertakan relasi `category` dan `author`.
  3. Kueri data peran Super Admin (`activeUsers` dengan `_count.articles`).
  4. Kueri data peran Staf (`myArticles` dengan filter `authorId`).
  5. Inspeksi statis berkas `page.tsx` untuk memastikan tidak ada lagi impor data tiruan (`dummyStats`, `dummyArticles`, `dummyUsers`).
- [ ] **Step 2: Jalankan skrip verifikasi untuk mendeteksi kegagalan awal (*expected fail*)**
  Jalankan `npx tsx scripts/verify-dashboard-db.ts`. Skrip diharapkan gagal pada pemeriksaan berkas `page.tsx` karena dummy data masih terpasang.
- [ ] **Step 3: Commit skrip pengujian**
  `git add scripts/verify-dashboard-db.ts && git commit -m "test(dashboard): skrip verifikasi mandiri integrasi database dashboard admin (#65)"`

---

### Task 2: Refaktor Halaman Dashboard Menjadi Server Component Dinamis (`src/app/(admin)/admin/dashboard/page.tsx`)

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

**Interfaces:**
- Consumes: `@/lib/db`, `@/lib/auth` (`getCurrentSession`), `lucide-react`, `@/components/admin/admin-shell`
- Produces: Full Server Component with dynamic database queries and RBAC views

- [ ] **Step 1: Modifikasi `src/app/(admin)/admin/dashboard/page.tsx`**
  1. Hapus seluruh impor dummy data (`dummyArticles`, `dummyUsers`, `dummyStats`).
  2. Tambahkan `export const dynamic = "force-dynamic";`.
  3. Tambahkan proteksi sesi: jika `!session`, panggil `redirect("/admin/login")`.
  4. Siapkan kueri paralel konkuren via `Promise.all`:
     - Metrik KPI: `totalArticles`, `publishedArticles`, `draftArticles`, `totalStock`, dan jika `isSuperAdmin`, `activeUsersCount`.
     - Artikel terbaru: 5 artikel terbaru dari `db.article` dengan `category` dan `author`.
     - RBAC data: jika `isSuperAdmin`, kueri `users` aktif dengan `_count.articles`; jika Staf, kueri artikel milik `session.user.id`.
  5. Render 5 Kartu KPI untuk Super Admin (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`) dan 4 Kartu KPI untuk Staf (`grid gap-4 sm:grid-cols-2 lg:grid-cols-4`).
  6. Render tabel 5 Artikel Terakhir dengan kolom Judul, Kategori, Penulis, Status (Terbit/Draf), Tanggal Lokal, dan Tombol Edit, serta *empty state*.
  7. Render bagian bawah berbasis peran:
     - Super Admin: Blok "Pengelola Akun Aktif" dengan avatar inisial, nama, lencana peran, kontribusi artikel, dan tombol cepat "Kelola Pengguna".
     - Staf: Blok "Artikel Saya" dengan daftar ringkas artikel yang ditulis, status, tanggal pembaruan, tombol lanjutkan edit, dan *empty state* ramah.
- [ ] **Step 2: Jalankan skrip verifikasi mandiri untuk memverifikasi kelulusan (*expected pass*)**
  Jalankan `npx tsx scripts/verify-dashboard-db.ts`. Seluruh pengujian (metrik, relasi kueri, RBAC, dan ketiadaan dummy data) harus berstatus PASS 100%.
- [ ] **Step 3: Commit perubahan implementasi dashboard**
  `git add src/app/(admin)/admin/dashboard/page.tsx && git commit -m "feat(dashboard): integrasi database postgresql dan pemisahan tampilan rbac (#65)"`

---

### Task 3: Verifikasi Kualitas Akhir & Pembersihan

**Files:**
- Modify/Review: `scripts/verify-dashboard-db.ts`, `src/app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 1: Validasi kebersihan kode dan git diff**
  Periksa `git status` dan `git diff` untuk memastikan tidak ada perubahan tidak disengaja.
- [ ] **Step 2: Jalankan skrip verifikasi ulang**
  Pastikan `npx tsx scripts/verify-dashboard-db.ts` berjalan mulus tanpa error.

---

### Task 4: Push ke Remote Repository, Buat Pull Request & Update Project Board

- [ ] **Step 1: Push branch fitur ke GitHub**
  `git push -u origin feat/65-dashboard-db-integration`
- [ ] **Step 2: Buat Pull Request resmi di GitHub**
  Buat PR dengan judul: `feat(dashboard): integrasi database postgresql metrik statistik dan ringkasan aktivitas dashboard admin (#65)`
  Isi deskripsi memuat laporan capaian e-Kinerja PNS (SKP), ringkasan perubahan teknis, dan checklist verifikasi.
- [ ] **Step 3: Hubungkan PR ke GitHub Project #1 ("PNS")**
  Tambahkan PR ke Project #1 dan set status ke *In Progress* / *Review*.
