# Implementasi Seeder Berbasis Snapshot Data Operasional Aktual

> **Untuk agen pekerja:** Jalankan setiap langkah secara terurut dan terverifikasi.

**Goal:** Menyediakan utilitas penangkap snapshot data operasional riil dari basis data dan memperbarui seeder (`prisma/seed.ts`) agar idempoten serta bersumber dari snapshot aktual sesuai Issue #124.

**Architecture:** Membangun generator snapshot terisolasi (`scripts/generate-seed-snapshot.ts`) yang mengekstraksi data bersih dari tabel `site_settings`, `users`, `categories`, `articles`, `stock_periods`, dan `medicine_stocks` ke dalam format JSON di `prisma/data/`. Mengadopsi seeder idempoten (`prisma/seed.ts`) dengan strategi sinkronisasi penuh (`upsert`) berdasarkan pengenal unik entitas.

**Tech Stack:** Prisma ORM, PostgreSQL, TypeScript, tsx, Node.js `fs/promises`.

## Global Constraints

- Sesuai aturan VPS: Tidak menjalankan `npm run build` atau `npx tsc` di VPS lokal untuk menghemat RAM (proses build diserahkan ke CI GitHub Actions).
- Seluruh verifikasi dilakukan secara presisi menggunakan skrip `npx tsx scripts/...`.
- Aman & Idempoten: Seeding tidak boleh menghasilkan duplikasi data atau kegagalan saat dijalankan berulang kali.
- Keamanan: Data runtime sementara seperti `Session` tidak diekspor.

---

### Task 1: Utilitas Ekstraksi Snapshot (`scripts/generate-seed-snapshot.ts`) & Script `package.json`

**Files:**
- Create: `scripts/generate-seed-snapshot.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `@prisma/client`, `fs/promises`, `path`.
- Produces: Berkas JSON di `prisma/data/` (`site-settings.json`, `users.json`, `categories.json`, `articles.json`, `stock-periods.json`, `medicine-stocks.json`).

- [ ] **Step 1: Tulis skrip generator snapshot** — Buat `scripts/generate-seed-snapshot.ts` yang membaca tabel-tabel utama secara aman dan menuliskan berkas JSON ke direktori `prisma/data/`.
- [ ] **Step 2: Tambahkan perintah di `package.json`** — Daftarkan script `"seed:snapshot": "tsx scripts/generate-seed-snapshot.ts"`.
- [ ] **Step 3: Uji eksekusi ekstraksi** — Jalankan `npm run seed:snapshot` dan verifikasi seluruh berkas JSON terisi dengan benar (termasuk 269 obat, pengaturan profil, dsb).
- [ ] **Step 4: Commit** — `git add scripts/generate-seed-snapshot.ts package.json prisma/data/*.json && git commit -m "feat(seed): tambah utilitas ekstraksi snapshot data operasional (#124)"`

---

### Task 2: Seeder Idempoten Berbasis Snapshot (`prisma/seed.ts`)

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: `@prisma/client`, `prisma/data/*.json`.
- Produces: Sinkronisasi penuh basis data melalui metode `upsert` pada seluruh model.

- [ ] **Step 1: Rombak `prisma/seed.ts`** — Baca data dari `prisma/data/*.json` dan lakukan upsert idempoten untuk `SiteSetting`, `User`, `Category`, `Article`, `StockPeriod`, dan `MedicineStock`.
- [ ] **Step 2: Jalankan seeder** — Eksekusi `npm run prisma:seed` dan pastikan proses berhasil tanpa galat.
- [ ] **Step 3: Commit** — `git add prisma/seed.ts && git commit -m "feat(seed): perbarui prisma seed berbasis snapshot idempoten (#124)"`

---

### Task 3: Skrip Pengujian Idempotensi & Integritas Seeder

**Files:**
- Create: `scripts/verify-seed-idempotency.ts`

**Interfaces:**
- Consumes: `@prisma/client`, child_process atau eksekusi seeder langsung.
- Produces: Verifikasi bahwa menjalankan seeder 2x berturut-turut menghasilkan jumlah data yang identik tanpa duplikasi atau galat kendala unik.

- [ ] **Step 1: Tulis skrip verifikasi** — Buat `scripts/verify-seed-idempotency.ts` yang menghitung baris tabel sebelum dan sesudah 2 kali eksekusi seeder.
- [ ] **Step 2: Jalankan verifikasi** — Jalankan `npx tsx scripts/verify-seed-idempotency.ts` dan pastikan seluruh asersi bernilai PASS.
- [ ] **Step 3: Commit** — `git add scripts/verify-seed-idempotency.ts && git commit -m "test(seed): skrip verifikasi idempotensi dan integritas seeder (#124)"`

---

### Task 4: Pembukaan Pull Request & Sinkronisasi GitHub Projects

- [ ] **Step 1: Push branch fitur ke GitHub** — `git push -u origin feat/124-operational-data-seed-snapshot`.
- [ ] **Step 2: Buat Pull Request ke `develop`** — Gunakan `gh pr create` dengan deskripsi terstruktur, referensi `Closes #124`, dan draf SKP e-Kinerja.
- [ ] **Step 3: Verifikasi CI di GitHub Actions** — Pantau pipeline CI hingga berstatus sukses (hijau).
