# Design Spec: Master Kategori Artikel (Dark Ethereal)

## 1. Overview & Goals
Menambahkan halaman manajemen kategori artikel (`/admin/kategori`) ke dalam panel admin, memungkinkan admin menambah, mengedit, dan menghapus kategori secara dinamis.

Fitur ini merupakan pengembangan dari sentralisasi data kategori di `dummy-data.ts` menjadi entitas yang dikelola melalui UI admin.

### Fitur Utama:
1. **Halaman Daftar Kategori (`/admin/kategori`):**
   - Tabel responsif Dark Glass dengan kolom: Nama Kategori, Slug (otomatis), Jumlah Artikel Terpakai (diambil dari `dummyArticles`), Status (Aktif/Non-Aktif), dan Aksi (Edit/Hapus).
   - Tombol "Tambah Kategori" dengan aksen gradien brand/emerald.
   - Badge jumlah artikel yang terkait dengan kategori tersebut.
2. **Modal Tambah/Edit Kategori:**
   - Input nama kategori dengan auto-generate slug.
   - Toggle status Aktif/Non-Aktif.
   - Validasi duplikasi nama kategori (prevents duplicate names).
3. **Sidebar Admin:**
   - Tambahkan link "Kategori" di bawah menu "Berita" dengan icon `Tags`.

## 2. Data Management
- Untuk fase dummy/UI, data kategori akan dikelola menggunakan state lokal (`useState`) yang diinisialisasi dari `ARTICLE_CATEGORIES` di `dummy-data.ts`.
- Jumlah artikel per kategori dihitung secara dinamis dengan memfilter `dummyArticles`.

## 3. Verification Plan
- `npx tsc --noEmit` & `npm run build`
- Cek navigasi sidebar dan interaksi modal di browser.
