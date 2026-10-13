# Spesifikasi Teknis: Fitur Alih Kepemilikan Penulis Artikel Berita (Issue #50)

## 1. Konteks & Latar Belakang
Pada sistem publikasi portal berita UPTD Instalasi Farmasi Kabupaten Kotabaru, setiap artikel berita terikat dengan relasi foreign key `authorId` ke tabel `users`. Dalam operasional kedinasan PNS, rotasi tugas, mutasi staf, atau pergantian pengelola portal informasi secara berkala terjadi. 

Saat seorang staf purna tugas atau berpindah unit kerja, akun lama staf yang bersangkutan perlu dihapus atau dinonaktifkan demi tata kelola keamanan akun. Namun, penghapusan akun staf yang telah menulis artikel berita selama ini diblokir total oleh sistem (`hasArticles = true`) guna menjaga integritas relasional basis data PostgreSQL dan mencegah hilangnya arsip publikasi instansi.

Selain itu, jika terjadi kesalahan atribusi nama penulis saat input berita, belum tersedia mekanisme bagi Super Admin untuk mengoreksi kepemilikan penulis artikel tanpa harus memodifikasi database secara manual.

**Issue #50** mengimplementasikan solusi alih kepemilikan penulis (*author reassignment*) yang fleksibel, aman, dan mematuhi tata kelola relasi data PostgreSQL:
1. **Author Selector pada Form Artikel**: Memberikan hak akses khusus Super Admin untuk memilih atau mengubah penulis artikel berita (baik saat naskah dibuat maupun diedit).
2. **Alih Kepemilikan Interaktif saat Hapus Akun**: Memberikan pilihan pada dialog konfirmasi hapus pengguna untuk mengalihkan seluruh artikel milik akun target ke staf/admin aktif pilihan sebelum akun lama dihapus dari sistem.
3. **Transaksi Basis Data Atomik**: Menjamin operasi pemindahan artikel dan penghapusan akun dieksekusi dalam satu transaksi atomik (`db.$transaction`), sehingga tidak pernah terjadi naskah tanpa penulis (*orphan record*).

---

## 2. Alur Pengalaman Pengguna (UI/UX Flow)

### A. Form Artikel Berita (`src/components/admin/article-form.tsx`)
Bilah sisi kanan (*sidebar*) formulir artikel menyajikan panel metadata artikel. Di bawah kartu pilihan Kategori, ditambahkan blok panel **"Penulis Naskah"**:

1. **Tampilan untuk Peran `SUPER_ADMIN`**:
   - Menampilkan pemilih dropdown interaktif (*Combobox / Select*) dengan gaya *Dark Ethereal*.
   - Setiap item pilihan menampilkan:
     - Avatar inisial dengan cincin halus.
     - Nama lengkap pengguna.
     - Username (@username) dan lencana peran (`SUPER_ADMIN` / `STAFF`).
   - Pada halaman tambah berita baru (`/admin/berita/baru`):
     - *Default value*: Otomatis terpilih akun pengguna yang sedang login.
     - Super Admin dapat mengubahnya ke staf aktif mana pun yang terdaftar.
   - Pada halaman edit artikel (`/admin/berita/[id]/edit`):
     - *Default value*: Penulis naskah saat ini.
     - Super Admin dapat mengalihkan naskah tersebut ke staf aktif lain.
   - Dilengkapi fungsi pencarian nama staf di dalam dropdown jika jumlah pengguna banyak.

2. **Tampilan untuk Peran `STAFF`**:
   - Staf biasa tidak diizinkan mengubah atribusi penulis artikel.
   - Bidang penulis disajikan sebagai kartu informasi *read-only* yang rapi:
     - Menampilkan avatar inisial, nama lengkap staf, dan `@username`.
     - Terdapat indikator informasi berikon gembok halus (`Lock`):
       *"Penulis naskah hanya dapat dialihkan oleh Super Admin."*

### B. Dialog Hapus Pengguna (`src/app/(admin)/admin/pengguna/user-table.tsx`)
Ketika Super Admin menekan tombol ikon tempat sampah (*Delete*) pada baris tabel pengguna:

1. **Pengguna Tanpa Riwayat Artikel (`articleCount === 0`)**:
   - Dialog konfirmasi sederhana seperti eksisting: menampilkan nama akun dan tombol konfirmasi "Hapus Akun".

2. **Pengguna Memiliki Riwayat Artikel (`articleCount > 0`)**:
   - Dialog **tidak lagi memblokir** aksi dengan pesan pasif, melainkan menyajikan alur pemindahan kepemilikan yang terpadu:
   - **Kartu Informasi Khusus**:
     - Ikon peringatan transfer (`AlertCircle` / `ArrowRightLeft`).
     - Teks penjelasan: *"Pengguna ini memiliki **[N] artikel berita** yang telah terbit. Sebelum akun dihapus, seluruh artikel wajib dialihkan ke staf/admin aktif lain agar arsip publikasi instansi tetap terjaga."*
   - **Dropdown Pemilih Akun Penerima**:
     - Menampilkan daftar semua pengguna berstatus aktif (`ACTIVE`), **kecuali** akun yang sedang dihapus.
     - Menampilkan nama, username, dan peran calon penerima.
     - Wajib dipilih sebelum tombol konfirmasi aktif.
   - **Tombol Konfirmasi Aksi**:
     - Label: *"Alihkan [N] Artikel & Hapus Akun"*.
     - Berwarna *danger gradient* dengan animasi *loading indicator* saat proses transaksi berlangsung.

---

## 3. Arsitektur Data & Server Actions

### A. Ekstensi Server Actions Artikel (`src/actions/article.ts`)
1. **Penambahan Field `authorId` pada Tipe Input**:
   ```typescript
   export type ArticleInput = {
     title: string;
     categoryId: string;
     content: string;
     isPublished?: boolean;
     coverImage?: File | string | null;
     authorId?: string; // Baru: Opsional untuk Super Admin
     _testUserId?: string;
   };
   ```

2. **Logika Keamanan Peran (RBAC Guard) pada `createArticleAction` & `updateArticleAction`**:
   - Sistem memverifikasi sesi aktif via `getCurrentSession()`.
   - Jika peran pengguna adalah `SUPER_ADMIN` dan `payload.authorId` dikirimkan:
     - Sistem memvalidasi apakah `authorId` tersebut valid dan berstatus aktif di database.
     - Jika valid, artikel disimpan dengan `authorId` terpilih.
   - Jika peran pengguna adalah `STAFF`:
     - Setiap nilai `authorId` yang dikirimkan oleh klien diabaikan secara tegas; sistem selalu mematok `authorId = auth.user.id`.

3. **Server Action Baru: `bulkReassignArticlesAction`**:
   ```typescript
   export async function bulkReassignArticlesAction(
     sourceUserId: string,
     targetUserId: string
   ): Promise<ArticleActionResult<{ count: number }>>
   ```
   - Digunakan untuk memindahkan seluruh artikel dari `sourceUserId` ke `targetUserId` sewaktu-waktu.
   - Hanya dapat dijalankan oleh peran `SUPER_ADMIN`.
   - Mengembalikan jumlah total artikel yang berhasil dialihkan.

### B. Penyempurnaan Server Action Pengguna (`src/actions/user.ts`)
1. **Penyempurnaan `deleteUserAction` dengan Transaksi Atomik**:
   ```typescript
   export async function deleteUserAction(
     id: string,
     reassignToUserId?: string
   ): Promise<UserActionResult<null>>
   ```
   - **Validasi Keamanan**:
     - Wajib `SUPER_ADMIN`.
     - Tidak dapat menghapus akun `admin` (akun root terlindungi).
     - Tidak dapat menghapus akun sendiri yang sedang aktif login.
     - Jika pengguna target memiliki artikel (`articlesCount > 0`):
       - `reassignToUserId` wajib diisi.
       - `reassignToUserId` tidak boleh sama dengan `id`.
       - `targetUser` penerima wajib ada di database dan berstatus `ACTIVE`.
   - **Eksekusi Transaksi Atomik (`db.$transaction`)**:
     ```typescript
     await db.$transaction(async (tx) => {
       if (reassignToUserId) {
         await tx.article.updateMany({
           where: { authorId: id },
           data: { authorId: reassignToUserId },
         });
       }
       await tx.session.deleteMany({
         where: { userId: id },
       });
       await tx.user.delete({
         where: { id },
       });
     });
     ```
   - **Revalidasi Jalur**:
     - `revalidatePath("/admin/pengguna")`
     - `revalidatePath("/admin/berita")`
     - `revalidatePath("/berita")`

---

## 4. Penyesuaian Komponen & Integrasi Server Component

### A. `src/app/(admin)/admin/berita/baru/page.tsx` & `[id]/edit/page.tsx`
- Server Component mengambil daftar pengguna aktif (`db.user.findMany({ where: { status: 'ACTIVE' } })`) dan sesi pengguna saat ini (`getCurrentSession()`).
- Mengirimkan props ke `ArticleForm`:
  - `currentUserRole={session.user.role}`
  - `currentUserId={session.user.id}`
  - `authors={activeAuthors}`
  - `currentAuthorId={article?.authorId}`

### B. `src/components/admin/article-form.tsx`
- Menangani state `selectedAuthorId`.
- Merender UI Author Selector untuk Super Admin, atau tampilan kartu *read-only* untuk Staf.
- Memasukkan `authorId` ke dalam FormData / payload Server Action.

### C. `src/app/(admin)/admin/pengguna/user-table.tsx`
- Memperbarui modal dialog hapus pengguna:
  - State `reassignTargetUserId`.
  - Dropdown calon penerima artikel dari daftar `users` yang berstatus aktif (disaring agar tidak menampilkan user yang sedang dihapus).
  - Pengecekan sebelum submit: jika `hasArticles`, maka `reassignTargetUserId` wajib dipilih.

---

## 5. Penanganan Kasus Khusus & Error Handling (Edge Cases)

| Skenario | Penanganan Sistem |
| :--- | :--- |
| **Staf memalsukan request payload `authorId`** | Sistem backend (`actions/article.ts`) memverifikasi sesi login. Jika bukan Super Admin, `authorId` dipaksa kembali ke `session.user.id`. |
| **Menghapus user berartikel tanpa memilih penerima** | Validasi klien menonaktifkan tombol konfirmasi; validasi backend menolak dengan pesan error yang jelas. |
| **Penerima artikel ternyata sudah dinonaktifkan** | Backend memvalidasi `targetUser.status === 'ACTIVE'` sebelum eksekusi transaksi. |
| **Gagal di tengah proses transaksi database** | Prisma `$transaction` menjamin *all-or-nothing rollback*; integritas data artikel dan user tetap utuh. |
| **Akun root `admin` atau akun sendiri** | Tetap dilindungi secara mutlak di frontend dan backend. |

---

## 6. Rencana Pengujian & Verifikasi Otomatis

Skrip pengujian otomatis `scripts/verify-article-reassign.ts`:
1. **Uji Otorisasi RBAC**: Memastikan staf biasa tidak dapat menetapkan author lain pada pembuatan/edit artikel.
2. **Uji Pembuatan Artikel oleh Super Admin**: Memastikan Super Admin dapat membuat artikel atas nama staf lain.
3. **Uji Pembaruan Penulis Artikel**: Memastikan Super Admin dapat mengalihkan artikel yang sudah ada ke staf lain.
4. **Uji Alih Kepemilikan Massal (`bulkReassignArticlesAction`)**: Memverifikasi pemindahan seluruh artikel antar dua akun pengguna.
5. **Uji Hapus Akun dengan Alih Kepemilikan Atomik (`deleteUserAction`)**:
   - Membuat akun sementara dengan beberapa artikel uji coba.
   - Menghapus akun sementara dengan target alih kepemilikan.
   - Memastikan seluruh artikel berhasil berpindah ke akun target dan akun sementara terhapus bersih.
   - Memastikan tidak ada artikel yang *orphan* (foreign key valid).
