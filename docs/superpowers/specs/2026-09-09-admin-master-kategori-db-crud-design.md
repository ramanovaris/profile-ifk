# Spesifikasi Desain: Integrasi Basis Data PostgreSQL & Server Actions Master Kategori

## 1. Ringkasan Eksekutif
* **Modul:** Panel Admin - Kelola Master Kategori (`/admin/kategori`)
* **Tujuan:** Memigrasikan manajemen kategori berita dari state lokal memory (*dummy data*) ke basis data relasional PostgreSQL menggunakan Prisma ORM dan Next.js Server Actions.
* **Pendekatan Arsitektur:** Pola idiomatik Next.js App Router: *Server Component* untuk data fetching awal (`page.tsx`) + *Client Component* untuk interaktivitas UI (`category-table.tsx`) + *Server Actions* untuk mutasi data (`src/actions/category.ts`).
* **Target Bukti e-Kinerja PNS:** 1 GitHub Issue dan 1 Pull Request terfokus ke branch `develop`.

---

## 2. Latar Belakang & Status Saat Ini
1. **Model Prisma Eksis:** Tabel `categories` pada PostgreSQL telah dibuat via migrasi Prisma:
   ```prisma
   model Category {
     id        String         @id @default(cuid())
     name      String         @unique
     slug      String         @unique
     status    CategoryStatus @default(ACTIVE)
     createdAt DateTime       @default(now())
     updatedAt DateTime       @updatedAt
     articles  Article[]
     @@map("categories")
   }
   ```
2. **Kondisi Eksisting UI:** Halaman `src/app/(admin)/admin/kategori/page.tsx` telah memiliki desain Dark Ethereal yang matang, pencarian, pagination, modal tambah/edit, toggle status switch, dan modal konfirmasi hapus, namun masih terikat pada `useState<Category[]>(initialCategories)`.
3. **Kebutuhan:** Menghubungkan mutasi dan query data ke PostgreSQL tanpa mengubah estetika visual dan pengalaman pengguna yang sudah ada.

---

## 3. Rencana Arsitektur & Struktur File

### 3.1. File `src/actions/category.ts` (Server Actions Baru)
Modul mutasi data yang berjalan di sisi server:
* `createCategoryAction(formData: { name: string; status?: "ACTIVE" | "INACTIVE" })`
  * Validasi nama (wajib diisi, trim, maksimal 50 karakter).
  * Auto-generate slug unik berbasis nama.
  * Cek keberadaan nama/slug di database.
  * Buat record via `db.category.create()`.
  * Panggil `revalidatePath('/admin/kategori')`.
  * Return `{ success: true, data }` atau `{ success: false, error: string }`.
* `updateCategoryAction(id: string, formData: { name: string; status: "ACTIVE" | "INACTIVE" })`
  * Validasi id kategori dan keberadaan record di DB.
  * Validasi keunikan nama/slug (kecuali id kategori itu sendiri).
  * Update record via `db.category.update()`.
  * Panggil `revalidatePath('/admin/kategori')`.
  * Return status keberhasilan.
* `toggleCategoryStatusAction(id: string)`
  * Ambil data status saat ini.
  * Balik nilai status (`ACTIVE` <-> `INACTIVE`).
  * Update record di DB dan `revalidatePath('/admin/kategori')`.
* `deleteCategoryAction(id: string)`
  * Periksa relasi artikel terhubung (`_count: { select: { articles: true } }`).
  * Jika jumlah artikel > 0, tolak penghapusan dengan error: `"Kategori tidak dapat dihapus karena masih digunakan oleh artikel."`
  * Jika 0 artikel, eksekusi `db.category.delete({ where: { id } })`.
  * Panggil `revalidatePath('/admin/kategori')`.

### 3.2. File `src/app/(admin)/admin/kategori/page.tsx` (Server Component)
* Mengubah halaman utama menjadi Server Component (`async function AdminKategoriPage()`).
* Mengambil data kategori langsung dari database via singleton Prisma:
  ```ts
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  ```
* Me-render layout `AdminShell` dan meneruskan data `categories` ke Client Component `CategoryTable`.

### 3.3. File `src/app/(admin)/admin/kategori/category-table.tsx` (Client Component)
* Memisahkan logika presentasi tabel dan modal dari `page.tsx`.
* Menerima properti `categories: CategoryWithCount[]`.
* Menangani filter pencarian lokal dan navigasi paginasi.
* Memanggil Server Actions dengan `useTransition` untuk feedback visual non-blocking.
* Menampilkan notifikasi Toast untuk feedback sukses atau gagal.

---

## 4. Keamanan & Integritas Relasional
1. **Otorisasi Sesi:** Seluruh Server Actions memeriksa cookie sesi aktif via `getCurrentSession()` untuk memastikan hanya staf/admin terotentikasi yang dapat melakukan mutasi data.
2. **Penanganan Constraint Unik:** Menangani kode error Prisma `P2002` (Unique constraint failed) dengan pesan ramah pengguna: `"Nama kategori sudah digunakan. Silakan gunakan nama lain."`
3. **Perlindungan Integritas Referensial (Foreign Key):** Menggunakan pengecekan relasi sebelum delete untuk menjamin tidak ada *orphan records* pada tabel `articles`.

---

## 5. Rencana Pengujian & Verifikasi
1. **Unit/Integration Test Script (`scripts/verify-category-db.ts`):**
   * Menguji pemanggilan Server Actions `createCategoryAction`.
   * Menguji validasi duplikasi nama kategori.
   * Menguji mutasi status via `toggleCategoryStatusAction`.
   * Menguji pembaruan data via `updateCategoryAction`.
   * Menguji proteksi relasi artikel saat penghapusan.
   * Menguji penghapusan kategori tak berelasi via `deleteCategoryAction`.
2. **Pengujian Fungsional Antarmuka (Browser):**
   * Membuka `/admin/kategori` dan memastikan data dari seed PostgreSQL muncul.
   * Menambahkan kategori baru via modal dan memverifikasi data tersimpan di PostgreSQL.
   * Mengklik toggle status badge dan memverifikasi status berubah di DB.
   * Mengedit nama kategori dan memastikan slug terbarui.
   * Menghapus kategori uji coba dan memverifikasi data terhapus.
3. **CI / CD Validation:**
   * Memastikan GitHub Actions CI melewati `npx next build` tanpa error TypeScript / React 19 linting.
