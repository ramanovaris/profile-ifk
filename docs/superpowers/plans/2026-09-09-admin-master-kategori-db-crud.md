# Rencana Implementasi: Integrasi Basis Data PostgreSQL & Server Actions Master Kategori

> **For agentic workers:** Gunakan instruksi terinci per task dan patuhi batasan VPS (hemat RAM/CPU: jangan jalankan `next build`/`tsc` penuh di VPS, serahkan ke GitHub Actions CI).

**Goal:** Menghubungkan manajemen master kategori artikel panel admin (`/admin/kategori`) ke database PostgreSQL secara penuh menggunakan Prisma ORM dan Server Actions.

**Architecture:** Server Component (`page.tsx`) melakukan initial fetch data kategori beserta agregasi jumlah artikel dari PostgreSQL via singleton `db` Prisma, lalu meneruskannya ke Client Component (`category-table.tsx`) yang mengelola interaktivitas antarmuka dan mutasi via Server Actions (`src/actions/category.ts`) dengan `useTransition` dan Toast feedback.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, PostgreSQL, Prisma ORM, Tailwind CSS, Lucide React.

---

## Global Constraints & Preferences
- **VPS Memory Guard:** Tidak menjalankan `npx next build` atau `tsc` di VPS (RAM 2GB). Verifikasi fungsional backend dilakukan dengan script tes mandiri `scripts/verify-category-db.ts` via `tsx`, dan verifikasi build diserahkan ke GitHub Actions CI.
- **Relational Integrity:** Kategori tidak boleh dihapus jika masih memiliki relasi artikel (`_count.articles > 0`).
- **Idempotency & Clean State:** Data pengujian wajib dibersihkan kembali (*cleanup*) setelah script pengujian dijalankan.
- **e-Kinerja Alignment:** Terhubung ke GitHub Issue dan Project Board "PNS" dengan deskripsi formal berbahasa Indonesia.

---

### Task 1: Pembuatan GitHub Issue & Registrasi ke Papan Project PNS

**Files:**
- None (GitHub CLI operations)

**Interfaces / Scope:**
- Membuat issue baru untuk butir kegiatan e-Kinerja.
- Mendaftarkan issue ke Project PNS (`https://github.com/users/ramanovaris/projects/1/views/1`) dengan status `In progress`.
- Membuat branch `feat/backend-kategori-db-crud` dari `develop`.

- [ ] **Step 1:** Buat GitHub Issue:
  ```bash
  gh issue create --title "feat(kategori): implementasi server actions dan integrasi database postgresql master kategori" --body "## Deskripsi Kegiatan e-Kinerja PNS
Implementasi modul Server Actions dan migrasi manajemen master kategori artikel dari memori lokal ke basis data relasional PostgreSQL menggunakan Prisma ORM.

### Rincian Pekerjaan:
1. Pembuatan Server Actions CRUD Kategori (create, update, toggle status, delete dengan relational guard).
2. Refaktor halaman admin kategori menjadi Server Component dan Client Table.
3. Validasi keunikan nama/slug dan penanganan error basis data.
4. Verifikasi pengujian integrasi database." --label "enhancement"
  ```
- [ ] **Step 2:** Dapatkan nomor issue yang terbentuk, daftarkan ke project PNS dan set status ke `In progress`.
- [ ] **Step 3:** Buat branch fitur lokal:
  ```bash
  git checkout -b feat/backend-kategori-db-crud
  ```

---

### Task 2: Implementasi Server Actions Master Kategori (`src/actions/category.ts`)

**Files:**
- Create: `src/actions/category.ts`

**Interfaces:**
- Produces:
  - `createCategoryAction(data: { name: string; status?: "ACTIVE" | "INACTIVE" }): Promise<{ success: boolean; data?: any; error?: string }>`
  - `updateCategoryAction(id: string, data: { name: string; status: "ACTIVE" | "INACTIVE" }): Promise<{ success: boolean; error?: string }>`
  - `toggleCategoryStatusAction(id: string): Promise<{ success: boolean; status?: "ACTIVE" | "INACTIVE"; error?: string }>`
  - `deleteCategoryAction(id: string): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1:** Implementasikan `src/actions/category.ts` dengan logika:
  - Validasi otentikasi sesi via `getCurrentSession()`.
  - Pembersihan string dan otomatisasi slug (`slugify`).
  - Penanganan Prisma unique constraint code `P2002`.
  - Pengecekan hitung artikel sebelum menghapus (`_count: { select: { articles: true } }`).
  - Pemanggilan `revalidatePath('/admin/kategori')` setelah mutasi data.

---

### Task 3: Script Verifikasi Mandiri Integrasi Basis Data (`scripts/verify-category-db.ts`)

**Files:**
- Create: `scripts/verify-category-db.ts`

**Interfaces:**
- Menguji seluruh fungsi Server Actions secara langsung ke database PostgreSQL VPS:
  1. Tes tambah kategori baru.
  2. Tes cegah duplikasi nama (case-insensitive).
  3. Tes toggle status `ACTIVE` -> `INACTIVE` -> `ACTIVE`.
  4. Tes update nama dan status.
  5. Tes proteksi delete pada kategori berelasi artikel (jika ada).
  6. Tes hapus kategori testing dan verifikasi pembersihan database.

- [ ] **Step 1:** Tulis script `scripts/verify-category-db.ts`.
- [ ] **Step 2:** Jalankan `npx tsx scripts/verify-category-db.ts` dan pastikan semua assertion berstatus PASS.
- [ ] **Step 3:** Hapus atau simpan script verifikasi di branch fitur.

---

### Task 4: Refaktor Komponen Halaman Admin Kategori

**Files:**
- Create: `src/app/(admin)/admin/kategori/category-table.tsx`
- Modify: `src/app/(admin)/admin/kategori/page.tsx`

**Interfaces:**
- `page.tsx` (Server Component): Mengambil data dari `db.category.findMany` dengan include `_count: { select: { articles: true } }`.
- `category-table.tsx` (Client Component): Menerima `initialCategories: CategoryWithCount[]` dan menangani:
  - State lokal pencarian (`searchQuery`) dan paginasi (`currentPage`, `itemsPerPage`).
  - Pemanggilan Server Actions melalui hook `useTransition` (`isPending`).
  - Tampilan modal tambah/edit dan modal konfirmasi hapus.
  - Tampilan toast umpan balik (sukses/gagal/info).

- [ ] **Step 1:** Ekstraksi UI tabel dan modal ke `category-table.tsx`.
- [ ] **Step 2:** Refaktor `page.tsx` menjadi Server Component asinkron.
- [ ] **Step 3:** Hapus ketergantungan import `initialCategories` dari `dummy-data.ts`.

---

### Task 5: Pengujian Antarmuka, Commit, Pull Request, dan Sinkronisasi Project PNS

**Files:**
- Git & GitHub CLI

- [ ] **Step 1:** Pastikan dev server port 3003 merespons HTTP 200 untuk rute `/admin/kategori`.
- [ ] **Step 2:** Commit seluruh perubahan dengan pesan terstruktur.
- [ ] **Step 3:** Push branch `feat/backend-kategori-db-crud` ke GitHub.
- [ ] **Step 4:** Buat Pull Request ke branch `develop` dengan referensi penutupan issue `#<issue_number>`.
- [ ] **Step 5:** Pantau CI GitHub Actions hingga status PASS (hijau).
- [ ] **Step 6:** Laporkan kesiapan review kepada Mas Rama.
