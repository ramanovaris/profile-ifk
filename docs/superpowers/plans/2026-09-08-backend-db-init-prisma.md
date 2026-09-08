# Rencana Implementasi: Konfigurasi Basis Data PostgreSQL & Prisma ORM (Issue #31)

> **Untuk Pekerja Agentic:** Fokus tunggal pada Issue #31 / PR 1 (Fondasi Data).

**Goal:** Menyiapkan basis data PostgreSQL lokal di server VPS, mengkonfigurasi Prisma ORM dengan skema relasional lengkap, membuat singleton database connection, dan menjalankan migrasi awal.

**Architecture:** PostgreSQL lokal di VPS sebagai engine data relasional, Prisma ORM sebagai layer akses data type-safe, dan singleton pattern di `src/lib/db.ts` untuk mencegah duplikasi koneksi database di Next.js development.

**Tech Stack:** PostgreSQL 16, Prisma 6.x / `@prisma/client`, Next.js 16, TypeScript 5.

## Global Constraints
- Sesuai prinsip Lazy Senior Developer & Small Batches: hanya mengerjakan ruang lingkup Issue #31.
- Jangan menjalankan build/lint/tsc berat di VPS; verifikasi dilakukan via Prisma validation dan GitHub Actions CI.
- Database lokal di VPS: nama `profile_ifk`, kredensial aman di file `.env`.
- Format komit & deskripsi PR selaras dengan kebutuhan bukti kegiatan harian aplikasi e-Kinerja.

---

### Task 1: Verifikasi & Pembuatan Database PostgreSQL Lokal

**Files:**
- Database: `profile_ifk` di PostgreSQL lokal VPS

**Interfaces:**
- Produces: Database siap menerima koneksi string `postgresql://...`

- [ ] **Step 1: Cek dan buat database `profile_ifk` di PostgreSQL lokal VPS**
  ```bash
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'profile_ifk'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE profile_ifk;"
  ```
- [ ] **Step 2: Buat role user khusus atau pastikan user lokal memiliki akses**
  ```bash
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE profile_ifk TO postgres;"
  ```

---

### Task 2: Instalasi Dependensi Prisma & Inisialisasi Berkas Lingkungan (.env)

**Files:**
- Modify: `package.json`
- Create / Modify: `.env`

**Interfaces:**
- Produces: Dependensi `@prisma/client`, `prisma` (devDependencies), dan variabel `DATABASE_URL`

- [ ] **Step 1: Install `@prisma/client` dan `prisma` (dev dependency)**
  ```bash
  npm install @prisma/client@^6.4.1
  npm install -D prisma@^6.4.1
  ```
- [ ] **Step 2: Konfigurasi `.env` untuk koneksi lokal**
  Pastikan `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/profile_ifk?schema=public"` terkonfigurasi di `.env` dan `.env.example` terbuat.

---

### Task 3: Pembuatan Skema Prisma & Generator Client

**Files:**
- Create: `prisma/schema.prisma`

**Interfaces:**
- Produces: Skema model User, Session, Category, Article, MedicineStock, SiteSetting
- Exports: Generated Prisma Client types

- [ ] **Step 1: Tulis `prisma/schema.prisma` sesuai spec desain**
  Model lengkap: `User`, `Session`, `Category`, `Article`, `MedicineStock`, `SiteSetting`.
- [ ] **Step 2: Validasi skema dan generate client**
  ```bash
  npx prisma validate
  npx prisma generate
  ```

---

### Task 4: Pembuatan Database Connection Singleton

**Files:**
- Create: `src/lib/db.ts`

**Interfaces:**
- Exports: `export const db = globalForPrisma.prisma ?? new PrismaClient();`

- [ ] **Step 1: Buat `src/lib/db.ts` dengan pattern singleton yang aman dari memory leak hot-reload**
- [ ] **Step 2: Buat uji coba koneksi sederhana via Node script atau Prisma db push**
  ```bash
  npx prisma db push
  ```

---

### Task 5: Pembuatan Pull Request #31 & Sinkronisasi Project PNS

**Files:**
- Git branch: `feat/backend-db-init-prisma`

- [ ] **Step 1: Buat branch `feat/backend-db-init-prisma`, commit, dan push ke GitHub**
- [ ] **Step 2: Buat PR ke `develop` dengan link `Closes #31`**
- [ ] **Step 3: Update status kartu Issue #31 di Project PNS menjadi `In progress`**
- [ ] **Step 4: Pastikan CI GitHub Actions PASS**
