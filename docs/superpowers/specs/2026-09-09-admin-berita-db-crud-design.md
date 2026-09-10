# Spesifikasi Desain: Modul Kelola Berita / Artikel Admin Terintegrasi Database PostgreSQL

- **Tanggal**: 2026-09-09
- **Penulis**: Rama Novaris & Hermes Agent
- **Target Target e-Kinerja**: 1 PR Terfokus untuk Butir Bukti Kegiatan Harian PNS
- **Repositori**: `ramanovaris/profile-ifk`
- **Scope**: Panel Admin Kelola Berita (List, Tambah, Edit, Hapus, Toggle Status Publikasi, Upload Sampul Lokal, dan Seeder Idempoten)

---

## 1. Latar Belakang & Tujuan
Portal UPTD Instalasi Farmasi Kabupaten Kotabaru sebelumnya menggunakan data mock artikel (`dummyArticles`) yang statis pada antarmuka admin. Setelah migrasi Master Kategori ke PostgreSQL pada PR #41, modul Berita siap untuk dihubungkan ke basis data riil (`articles`), berelasi dengan tabel `categories` dan tabel `users` (sebagai pembuat/penulis).

Tujuan:
1. Menyimpan dan mengelola artikel/berita publikasi secara persisten di PostgreSQL VPS.
2. Menyediakan fungsionalitas CRUD lengkap di panel admin (`/admin/berita`):
   - Menampilkan daftar artikel dengan pencarian judul, filter kategori dinamis, dan paginasi.
   - Menambah artikel baru lengkap dengan editor teks kaya (Rich Text) dan pemilihan kategori aktif.
   - Mengedit artikel yang sudah ada.
   - Mengubah status publikasi (Draft ↔ Publikasi) secara instan.
   - Menghapus artikel dengan aman beserta pembersihan berkas gambar fisiknya.
3. Menyediakan mekanisme upload gambar sampul lokal yang efisien dan aman tanpa ketergantungan cloud pihak ketiga.
4. Menyediakan seeder idempoten artikel awal agar pengujian dan demonstrasi sistem tetap mudah dipulihkan jika data terhapus.

---

## 2. Arsitektur & Relasi Database

### 2.1 Model Prisma (`prisma/schema.prisma`)
Tabel `articles` telah didefinisikan pada PR #35 dengan skema sebagai berikut:
```prisma
model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  coverImage  String?
  isPublished Boolean  @default(true)
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  @@index([slug])
  @@index([categoryId])
  @@map("articles")
}
```

### 2.2 Relasi & Hak Akses
- **Category:** Setiap artikel wajib terhubung ke 1 record `Category` yang valid.
- **Author:** Diambil otomatis dari sesi staf yang sedang login via `getCurrentSession()` di `src/lib/auth.ts`.
- **Integrity Rule:** Menghapus artikel tidak mempengaruhi data `User` ataupun `Category`. Menghapus kategori yang memiliki artikel telah diproteksi di Server Action kategori.

---

## 3. Penanganan Berkas Gambar Sampul (Local File Storage)

Mengikuti prinsip *lazy senior developer* (native platform first, zero cost, shortest diff):
1. **Lokasi Penyimpanan:** Disimpan langsung di direktori publik server Next.js: `public/uploads/articles/`.
2. **Validasi Berkas:**
   - Ekstensi / Tipe MIME diperbolehkan: `image/jpeg`, `image/png`, `image/webp`.
   - Ukuran maksimum: 2MB.
3. **Penamaan File Unik & Aman:** Menggunakan pola `art-[cuid].[ext]` untuk mencegah tabrakan nama dan serangan *path traversal*.
4. **Pembersihan Berkas (Garbage Collection):**
   - Saat artikel dihapus via `deleteArticleAction`, berkas fisik di `public/uploads/articles/` ikut dihapus secara asynchronous menggunakan native `fs/promises.unlink`. Berkas default/eksternal (misal: picsum atau placeholder bawaan) diabaikan dari penghapusan fisik.
   - Saat gambar sampul diperbarui via `updateArticleAction`, berkas lama yang ada di disk dibersihkan.

---

## 4. Server Actions (`src/actions/article.ts`)

Seluruh mutasi data dijalankan melalui Next.js Server Actions:

### 4.1 `createArticleAction(formData: FormData)`
- **Alur:**
  1. Validasi sesi via `getCurrentSession()`. Jika tidak valid / pengguna `INACTIVE`, lemparkan error otorisasi.
  2. Ekstrak data: `title`, `categoryId`, `content`, `isPublished` (boolean).
  3. Validasi kelengkapan teks (`title` minimal 3 karakter, `content` tidak boleh kosong).
  4. Generate `slug` ramah SEO via `slugify(title)`. Lakukan pengecekan duplikasi slug di tabel `articles`: jika sudah ada, tambahkan suffix unik (misal `-2`, `-3`).
  5. Proses `coverImage` jika ada berkas yang diunggah ke `public/uploads/articles/`.
  6. Eksekusi `prisma.article.create` dengan relasi `categoryId` dan `authorId`.
  7. Lakukan `revalidatePath('/admin/berita')`, `revalidatePath('/berita')`, dan `revalidatePath('/')`.
  8. Kembalikan `{ success: true, articleId: article.id }`.

### 4.2 `updateArticleAction(id: string, formData: FormData)`
- **Alur:**
  1. Validasi sesi aktif.
  2. Cari artikel berdasarkan `id`. Jika tidak ditemukan, kembalikan error.
  3. Cek pembaruan judul: jika judul berubah, perbarui slug dengan proteksi benturan.
  4. Cek pembaruan gambar sampul: jika ada file baru, simpan file baru dan hapus file lama.
  5. Eksekusi `prisma.article.update`.
  6. Revalidasi path terkait.
  7. Kembalikan `{ success: true }`.

### 4.3 `toggleArticlePublishAction(id: string)`
- **Alur:**
  1. Validasi sesi aktif.
  2. Dapatkan artikel saat ini, balikkan nilai boolean `isPublished: !current.isPublished`.
  3. Eksekusi `prisma.article.update`.
  4. Revalidasi path.
  5. Kembalikan `{ success: true, isPublished: updated.isPublished }`.

### 4.4 `deleteArticleAction(id: string)`
- **Alur:**
  1. Validasi sesi aktif.
  2. Cari artikel untuk mengambil info `coverImage`.
  3. Hapus record dari database via `prisma.article.delete({ where: { id } })`.
  4. Jika `coverImage` tersimpan secara lokal di `/uploads/articles/`, hapus file fisik terkait.
  5. Revalidasi path.
  6. Kembalikan `{ success: true }`.

---

## 5. Pembaruan Seeder Idempoten (`prisma/seed.ts`)

Memperbarui skrip seeder database:
- Mengambil ID user Super Admin (`admin`) dan ID kategori master (`Kegiatan`, `Informasi`).
- Melakukan upsert 4 artikel dummy awal berdasarkan `slug`:
  1. `sosialisasi-sistem-informasi-kefarmasian` (Kategori: Kegiatan)
  2. `evaluasi-distribusi-obat-triwulan-iv-2024` (Kategori: Kegiatan)
  3. `pengumuman-jadwal-pelayanan-libur-nasional` (Kategori: Informasi)
  4. `daftar-obat-pembaruan-e-formularium` (Kategori: Informasi)
- Menjamin seeder dapat dijalankan berulang kali tanpa membuat data duplikat atau eror constraint.

---

## 6. Arsitektur Antarmuka (UI Components)

Pemisahan tanggung jawab Server Component dan Client Component untuk efisiensi render:

### 6.1 `src/app/(admin)/admin/berita/page.tsx` (Server Component)
- Mengambil data awal artikel langsung dari PostgreSQL dengan relasi `category: { select: { id: true, name: true } }` dan `author: { select: { id: true, name: true } }`.
- Mengambil daftar kategori dengan status `ACTIVE` untuk komponen filter dropdown toolbar.
- Merender layout `AdminShell` dan meneruskan data ke `ArticleTable`.

### 6.2 `src/app/(admin)/admin/berita/article-table.tsx` (Client Component)
- Mengelola state pencarian (*search*), multi-select filter kategori, paginasi klien, dan modal konfirmasi hapus.
- Mengimplementasikan `useOptimistic` untuk pergantian status publikasi instan.
- Menampilkan toast notifikasi hijau/merah untuk setiap aksi sukses/gagal.

### 6.3 `src/app/(admin)/admin/berita/baru/page.tsx` & `[id]/edit/page.tsx` (Server Components)
- Mengambil daftar kategori aktif dari database dan mengirimkannya sebagai props ke `ArticleForm`.
- Untuk halaman edit, mengambil artikel berdasarkan ID dari PostgreSQL; jika tidak ditemukan, menampilkan fallback *not found*.

### 6.4 `src/components/admin/article-form.tsx` (Client Component)
- Menerima daftar kategori riil dari database.
- Menangani submit via Server Action dengan `useTransition` / status `isSubmitting`.
- Menangani preview gambar sampul dan unggahan berkas.
- Mengarahkan kembali ke `/admin/berita` dengan toast sukses saat berhasil.

---

## 7. Rencana Pengujian & Verifikasi

1. **Integration Test Script VPS (`scripts/verify-article-db.ts`)**:
   - Skrip mandiri berbasis `tsx` untuk menguji operasi DB langsung:
     - Auth requirement check.
     - Auto slugification & slug uniqueness handling.
     - Relasi `category` dan `author`.
     - Update konten dan judul.
     - Toggle status `isPublished`.
     - Delete record dan verifikasi integritas data.
   - Resource: Selesai dalam <0.5 detik, penggunaan RAM <50MB (aman untuk VPS 2GB).
2. **Build & Typecheck Validation**:
   - Didelegasikan ke GitHub Actions CI gratisan untuk menjaga CPU VPS tetap tenang.
3. **Pengujian Manual Pengguna**:
   - Mas Rama dapat mencoba membuat artikel uji coba, mengubah draft/publish, mengedit, dan menghapusnya dari browser HP Android / Desktop.

---

## 8. Rollback & Keamanan
- Penghapusan artikel tidak memiliki efek domino (cascade delete) pada pengguna atau kategori.
- Jika artikel dummy bawaan terhapus saat testing, pemulihan data cukup dengan mengeksekusi `npx tsx prisma/seed.ts`.
- File upload divalidasi ketat (MIME type & byte length) untuk mencegah eksploitasi berkas sembarangan.
