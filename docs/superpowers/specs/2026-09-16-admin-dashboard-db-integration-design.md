# Spesifikasi Teknis: Integrasi Database PostgreSQL Metrik Statistik & Ringkasan Aktivitas Dashboard Admin (Issue #65)

## 1. Konteks & Latar Belakang

Pada portal informasi UPTD Instalasi Farmasi Kabupaten Kotabaru (`profile-ifk`), halaman dashboard administrator (`/admin/dashboard`) merupakan gerbang utama bagi pengelola instansi (Super Admin maupun Staf) untuk memantau performa publikasi, status operasional, dan ketersediaan perbekalan farmasi secara sekilas.

Sebelumnya, halaman `src/app/(admin)/admin/dashboard/page.tsx` masih mengandalkan data tiruan statis (`dummyStats`, `dummyArticles`, dan `dummyUsers` dari `@/lib/dummy-data`). Hal ini mengakibatkan:
1. Metrik statistik artikel, publikasi, dan pengguna tidak mencerminkan data riil yang ada pada basis data PostgreSQL.
2. Penambahan, pengeditan, atau penghapusan artikel dan perbekalan obat pada modul admin tidak memengaruhi angka pada kartu KPI dashboard.
3. Tabel 5 artikel terakhir dan daftar pengguna aktif tidak terhubung dengan rekaman data riil instansi.
4. Belum ada pemisahan pengalaman antarmuka berdasarkan peran pengguna (Role-Based Access Control - RBAC) antara Super Admin dan Staf operasional.

**Issue #65** mengintegrasikan basis data relasional PostgreSQL melalui Prisma ORM secara menyeluruh ke dalam dashboard admin:
- Mengubah `page.tsx` menjadi Server Component dinamis (`force-dynamic`).
- Menghitung metrik KPI dinamis secara waktu nyata (*real-time*): Total Artikel, Artikel Terbit, Artikel Draf, Total Stok Obat/BMHP, dan Total Pengguna Aktif.
- Menyajikan 5 artikel sistem terbaru riil lengkap dengan kategori dan nama staf penulis.
- Menerapkan pembagian tampilan hak akses RBAC:
  - **Super Admin**: Melihat 5 kartu KPI (termasuk total pengguna aktif) dan blok daftar pengelola akun aktif beserta jumlah kontribusi artikel naskah.
  - **Staf**: Melihat 4 kartu KPI operasional dan blok terfokus "Artikel Saya" yang menampilkan artikel miliknya serta tautan pengeditan cepat.
- Membersihkan dependensi data tiruan statis pada modul dashboard.

### Naskah Laporan Capaian e-Kinerja PNS (SKP):
> *"Mengembangkan integrasi basis data relasional PostgreSQL pada dashboard administrator website profil UPTD IFK Kotabaru guna menyajikan metrik statistik publikasi, inventaris obat, dan ringkasan aktivitas sistem secara waktu nyata (real-time)."*

---

## 2. Arsitektur Data & Kueri Server

Halaman dashboard diimplementasikan sebagai Server Component murni pada `src/app/(admin)/admin/dashboard/page.tsx` dengan konfigurasi:

```typescript
export const dynamic = "force-dynamic";
```

### A. Otentikasi Sesi & Pemeriksaan Peran
Sesi pengguna diverifikasi di awal pemrosesan halaman:
```typescript
const session = await getCurrentSession();
if (!session) {
  redirect("/admin/login");
}
const isSuperAdmin = session.user.role === "SUPER_ADMIN";
const currentUserId = session.user.id;
```

### B. Kueri Paralel Efisien (`Promise.all`)
Seluruh pembacaan data dieksekusi secara konkuren dalam satu blok `Promise.all` untuk meminimalkan beban latensi basis data:

1. **Kueri Metrik Statistik Publikasi & Stok**:
   - `totalArticles`: `db.article.count()`
   - `publishedArticles`: `db.article.count({ where: { isPublished: true } })`
   - `draftArticles`: `db.article.count({ where: { isPublished: false } })`
   - `totalStock`: `db.medicineStock.count()`

2. **Kueri Daftar 5 Artikel Sistem Terbaru**:
   ```typescript
   db.article.findMany({
     take: 5,
     orderBy: { updatedAt: "desc" },
     include: {
       category: {
         select: { id: true, name: true, slug: true },
       },
       author: {
         select: { id: true, name: true, username: true },
       },
     },
   })
   ```

3. **Kueri Khusus Berdasarkan Peran Pengguna (RBAC)**:
   - **Jika Super Admin (`isSuperAdmin`)**:
     - `activeUsersCount`: `db.user.count({ where: { status: "ACTIVE" } })`
     - `activeUsersList`:
       ```typescript
       db.user.findMany({
         where: { status: "ACTIVE" },
         select: {
           id: true,
           name: true,
           username: true,
           role: true,
           _count: {
             select: { articles: true },
           },
         },
         orderBy: [
           { role: "asc" },
           { name: "asc" },
         ],
       })
       ```
   - **Jika Staf (`!isSuperAdmin`)**:
     - `myArticles`:
       ```typescript
       db.article.findMany({
         where: { authorId: currentUserId },
         take: 5,
         orderBy: { updatedAt: "desc" },
         include: {
           category: {
             select: { id: true, name: true, slug: true },
           },
         },
       })
       ```

---

## 3. Desain Antarmuka & Pengalaman Pengguna (UI/UX)

Mengikuti panduan desain *Dark Ethereal UI*: latar belakang gelap pekat `bg-zinc-900/60`, border tipis `border-white/5`, efek *backdrop blur*, dan gradien aksen khas IFK Kotabaru (`brand-500` hijau zamrud).

### A. Header Halaman & Aksi Cepat
- **Judul**: `Dashboard`
- **Subjudul**: *"Ringkasan status publikasi, inventaris obat, dan aktivitas portal IFK Kotabaru."*
- **Tombol Aksi**: *"Tulis Berita Baru"* mengarah ke `/admin/berita/baru/` dengan gradien hijau zamrud bersinar halus (*shadow-brand-500/20*).

### B. Kartu Metrik KPI Responsif
- **Super Admin (5 Kartu)**:
  1. **Total Artikel**: Ikon `FileText`, aksen hijau zamrud (`bg-brand-500/15 text-brand-400 border-brand-500/30`).
  2. **Artikel Terbit**: Ikon `CheckCircle`, aksen hijau emerald (`bg-emerald-500/15 text-emerald-400 border-emerald-500/30`).
  3. **Artikel Draf**: Ikon `FilePen`, aksen kuning amber (`bg-amber-500/15 text-amber-400 border-amber-500/30`).
  4. **Total Stok Obat**: Ikon `Package`, aksen biru langit/indigo (`bg-sky-500/15 text-sky-400 border-sky-500/30`).
  5. **Pengguna Aktif**: Ikon `Users`, aksen ungu violet (`bg-purple-500/15 text-purple-400 border-purple-500/30`).
  - *Grid Layout*: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`.

- **Staf (4 Kartu)**:
  - Menampilkan 4 kartu metrik operasional (Artikel, Terbit, Draf, Stok Obat). Kartu pengguna disembunyikan.
  - *Grid Layout*: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`.

### C. Tabel 5 Artikel Terakhir Sistem
- **Header Seksi**:
  - Judul: *"Artikel Terakhir"*
  - Keterangan: *"5 artikel yang baru saja diperbarui atau dipublikasikan"*
  - Tautan Navigasi: *"Semua Berita"* (`/admin/berita/`) dengan ikon `ArrowUpRight`.
- **Kolom Tabel**:
  - `Judul Artikel`: Menampilkan teks judul tebal halus.
  - `Kategori`: Lencana kategori transparan (`bg-white/[0.03]`).
  - `Penulis`: Nama staf pembuat naskah (`article.author.name`).
  - `Status`: Lencana hijau *"Terbit"* atau kuning *"Draft"*.
  - `Tanggal Terbit`: Format tanggal bahasa Indonesia lokal (`id-ID`).
  - `Aksi`: Tombol tautan *"Edit"* ke `/admin/berita/${article.id}/edit/`.
- **Kondisi Kosong (*Empty State*)**:
  - Jika belum ada artikel, menampilkan pesan ramah: *"Belum ada rekaman artikel berita pada sistem."* dengan tombol cepat membuat berita.

### D. Bagian Bawah Berbasis Peran (RBAC)

#### 1. Tampilan Super Admin — "Pengelola Akun Aktif"
- **Header Seksi**:
  - Judul: *"Pengelola Akun Aktif"*
  - Keterangan: *"Daftar staf dan pengelola akun admin portal"*
  - Tautan Cepat: *"Kelola Pengguna"* (`/admin/pengguna/`).
- **Kartu Pengguna**:
  - Menampilkan lingkaran inisial nama berbingkai aksen `brand-500`.
  - Nama lengkap dan lencana peran (`SUPER_ADMIN` berwarna emerald, `STAFF` berwarna zinc).
  - Indikator jumlah kontribusi artikel: `[N] artikel ditulis`.

#### 2. Tampilan Staf — "Artikel Saya"
- **Header Seksi**:
  - Judul: *"Artikel Saya"*
  - Keterangan: *"Daftar artikel yang baru saja Anda kelola atau buat"*
  - Tautan Cepat: *"Tulis Berita"* (`/admin/berita/baru/`).
- **Daftar Ringkas**:
  - Menampilkan judul naskah, kategori, lencana status (Terbit / Draf), dan tombol cepat *"Lanjutkan Edit"*.
  - *Empty state*: *"Anda belum memiliki artikel naskah. Mulai publikasikan berita atau kegiatan kefarmasian sekarang!"*

---

## 4. Pembersihan Data Tiruan Statis

Menghapus impor berikut dari `src/app/(admin)/admin/dashboard/page.tsx`:
```typescript
// DIHAPUS:
import { dummyArticles, dummyUsers, dummyStats } from "@/lib/dummy-data";
```
Seluruh data yang ditampilkan dipastikan bersumber dari basis data `db` Prisma.

---

## 5. Kepatuhan Bebas Istilah Teknis

Seluruh teks antarmuka mematuhi standar kebersihan bahasa tanpa istilah teknis komputasi backend:
- Dilarang menggunakan istilah: *PostgreSQL, Prisma, database, query, SQL, table, server-side*.
- Digunakan redaksi natural: *sistem, basis data layanan, portal, informasi, rekaman data*.

---

## 6. Rencana Pengujian Mandiri & Verifikasi

Dibuat skrip verifikasi otomatis `scripts/verify-dashboard-db.ts`:
1. **Verifikasi Metrik Basis Data**: Mengambil dan memastikan jumlah total artikel, artikel terbit, draf, stok obat, dan pengguna bernilai angka riil valid (>= 0).
2. **Verifikasi Relasi Artikel**: Memastikan kueri artikel menyertakan data `category` dan `author` dengan benar.
3. **Verifikasi Simulasi RBAC**:
   - Mensimulasikan kueri untuk peran `SUPER_ADMIN` (mendapatkan daftar pengguna aktif dan jumlah kontribusi).
   - Mensimulasikan kueri untuk peran `STAFF` (mendapatkan artikel milik staf target).
4. **Verifikasi Dependensi**: Memastikan berkas `src/app/(admin)/admin/dashboard/page.tsx` tidak lagi mengandung referensi `dummyStats`, `dummyArticles`, maupun `dummyUsers`.
5. **Kepatuhan VPS**: Tidak menjalankan build/tsc berat di server VPS lokal.
