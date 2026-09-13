# Spesifikasi Teknis: Fitur Pratinjau (Preview) Artikel Berita (Issue #45)

## 1. Konteks & Latar Belakang
Modul Berita admin UPTD IFK Kotabaru telah terintegrasi dengan basis data relasional PostgreSQL dan mendukung pembuatan artikel berstatus Terbit (*Published*) maupun Draf (*Draft*). Namun saat ini:
1. Halaman detail berita publik (`/berita/[slug]`) masih membaca data statis `dummyArticles` dan belum terintegrasi langsung dengan database PostgreSQL `db.article`.
2. Pengelola berita di panel admin (`/admin/berita`) belum memiliki tombol aksi cepat untuk memeriksa tampilan artikel yang sudah tersimpan.
3. Saat menyusun artikel baru atau menyunting artikel di editor formulir (`article-form.tsx`), staf pengelola tidak dapat melihat pratinjau tata letak visual (*live preview*) sebelum menekan tombol simpan/terbitkan.

Issue #45 berfokus pada penyediaan **Fitur Pratinjau (Preview) Artikel** dengan pendekatan kombinasi dua moda:
1. **Moda Tab Baru (Halaman Publik Asli):** Disediakan pada tabel daftar berita (`article-table.tsx`) untuk artikel yang sudah tersimpan di database, dengan perlindungan hak akses ketat (artikel berstatus `DRAFT` hanya dapat dibuka oleh admin yang sedang login dan diberi banner indikator pratinjau).
2. **Moda Modal Dialog Interaktif (Live Form Preview):** Disediakan pada formulir editor (`article-form.tsx`) untuk melihat pratinjau instan dari teks, gambar unggahan lokal, dan kategori yang sedang diketik tanpa harus menyimpan ke database terlebih dahulu.

---

## 2. Arsitektur & Alur Data

### A. Integrasi Database & Proteksi Hak Akses Halaman Publik (`/berita/[slug]`)
1. Halaman Server Component `src/app/(public)/berita/[slug]/page.tsx` akan membaca artikel dari basis data:
   ```ts
   const article = await db.article.findUnique({
     where: { slug },
     include: {
       category: { select: { id: true, name: true, slug: true } },
       author: { select: { id: true, name: true } },
     },
   });
   ```
   Jika tidak ditemukan di database, dilakukan pengecekan fallback ke `dummyArticles` untuk kompatibilitas tautan lama. Jika tetap tidak ditemukan, panggil `notFound()`.
2. **Proteksi Kerahasiaan Draf:**
   - Jika `article.isPublished === true`: Artikel terbuka untuk publik luas tanpa memerlukan autentikasi.
   - Jika `article.isPublished === false` (Draf):
     * Periksa sesi login menggunakan `getCurrentSession()`.
     * **Sesi Valid (Admin):** Halaman dirender dengan menyisipkan komponen peringatan `ArticlePreviewBanner` di atas artikel.
     * **Tanpa Sesi (Publik/Anonim):** Langsung diputus dengan melempar `notFound()` (HTTP 404). Hal ini mencegah kebocoran URL atau terindeksnya draf internal instansi oleh mesin pencari.
3. **Rekomendasi Berita Terkait (`otherArticles`):**
   - Menampilkan artikel terbit lainnya (`isPublished: true`) dari database PostgreSQL (`db.article.findMany`), mengecualikan artikel yang sedang dibuka.

### B. Tombol Aksi Tabel Admin (`article-table.tsx`)
1. Pada kolom **Aksi** di tabel berita, tambahkan tombol ikon mata (`Eye`) sebelum tombol Edit (`Pencil`) dan Hapus (`Trash2`).
2. Tombol ini berupa tautan `<Link>` dengan atribut `target="_blank"` dan `rel="noopener noreferrer"` mengarah ke `/berita/${article.slug}`.
3. Tombol dilengkapi *tooltip* "Pratinjau Artikel di Tab Baru".

### C. Modal Dialog Pratinjau Formulir Editor (`article-form.tsx`)
1. Pada bagian bawah form (di samping tombol "Publikasikan/Simpan" dan "Batal"), tambahkan tombol **"Pratinjau"** dengan ikon `Eye`.
2. Tombol ini memicu pembukaan komponen `ArticlePreviewModal` berbasis `createPortal` ke `document.body`.
3. Komponen modal menerima state form terkini:
   - `title`: Judul artikel yang sedang diketik (fallback: *"Judul Artikel Belum Diisi"*).
   - `categoryName`: Nama kategori berdasarkan `categoryId` yang sedang dipilih dari daftar kategori.
   - `content`: Konten HTML dari editor rich text.
   - `coverPreviewUrl`: URL gambar sampul. Jika ada file berkas baru yang dipilih, buat object URL lokal menggunakan `URL.createObjectURL(file)` dan lepaskan memori via `URL.revokeObjectURL` saat modal ditutup atau berkas berganti. Jika menggunakan gambar lama, gunakan URL string yang ada.
   - `authorName`: Nama staf admin yang sedang login.
4. **Fitur Pengalih Tampilan (Viewport Toggle):**
   - Modal menyediakan tombol pengalih tampilan di toolbar atas:
     * **Desktop Mode (Default):** Lebar tampilan kontainer maksimal `max-w-3xl` sesuai tata letak publik desktop.
     * **Mobile Mode:** Lebar kontainer dibatasi ke `max-w-sm` (375px–420px) dengan bingkai simulasi ponsel cerdas untuk memeriksa responsivitas judul, gambar, dan keterbacaan paragraf di layar kecil.

---

## 3. Rincian Antarmuka (UI/UX)

### A. Banner Indikator Pratinjau Publik (`ArticlePreviewBanner`)
- Posisi: Tepat di atas judul artikel pada halaman detail publik.
- Styling: *Dark Ethereal Amber/Warning* dengan border `border-amber-500/30`, latar `bg-amber-500/10 text-amber-300`, dan ikon `AlertTriangle`.
- Pesan:
  > **Mode Pratinjau Administrator**
  > Artikel ini berstatus **DRAFT** dan belum diterbitkan. Hanya akun administrator yang dapat melihat pratinjau ini.

### B. Modal Dialog Pratinjau Form Admin (`ArticlePreviewModal`)
- Latar Belakang: Backdrop gelap semi-transparan `bg-black/80 backdrop-blur-md` ber-z-index tinggi (`z-50`).
- Header Modal:
  - Judul: "Pratinjau Artikel" dengan badge penanda status draf.
  - Toolbar: Tombol toggle switch `Monitor` (Desktop) dan `Smartphone` (Mobile).
  - Tombol Tutup: Ikon `X` dengan pintasan tombol keyboard `Escape`.
- Body Modal:
  - Area scrollable vertikal dengan container latar bersih (`bg-surface` atau kontras tinggi) meniru persis komponen publik:
    1. Hero/Cover Image dengan rasio aspek `21/9` atau `16/9`.
    2. Badge kategori dan tanggal simulasi.
    3. Judul besar `text-2xl sm:text-3xl font-bold tracking-tight text-heading`.
    4. Nama penulis dan instansi UPTD IFK Kotabaru.
    5. Konten artikel dirender aman menggunakan `prose prose-zinc max-w-none text-sm leading-relaxed`.

---

## 4. Keamanan & Penanganan Kasus Tepi (Edge Cases)

1. **Pencegahan Kebocoran URL Draf:**
   Pengguna anonim yang menebak slug artikel berstatus draf akan menerima respon HTTP 404 tanpa indikasi apapun bahwa draf tersebut ada di database.
2. **Manajemen Memori Berkas Unggahan:**
   Penggunaan `URL.createObjectURL` untuk file upload lokal di browser dipastikan dibersihkan melalui `URL.revokeObjectURL` pada *cleanup effect* React untuk mencegah kebocoran memori browser.
3. **Validasi Slug Kosong / Baru:**
   Pada modal form editor, pratinjau bersifat murni *in-memory client state*, sehingga tidak membutuhkan artikel disimpan ke database atau memiliki ID/slug terlebih dahulu.
4. **Fallback Kategori & Penulis:**
   Jika pengguna belum memilih kategori atau gambar sampul saat menekan tombol pratinjau di form, modal menampilkan *placeholder visual* yang rapi (misal badge "Tanpa Kategori" dan banner pola default) alih-alih merusak tampilan antarmuka.

---

## 5. Rencana Pengujian & Verifikasi
1. **Pengujian Hak Akses Draf Publik:**
   - Buka URL artikel draf menggunakan browser/sesi anonim (tanpa cookie login) -> Verifikasi menghasilkan halaman 404 Not Found.
   - Buka URL artikel draf yang sama menggunakan sesi login admin -> Verifikasi artikel tampil utuh disertai banner `ArticlePreviewBanner`.
2. **Pengujian Tombol Aksi Tabel Admin:**
   - Klik ikon `Eye` pada baris artikel terbit -> tab baru terbuka menampilkan artikel publik.
   - Klik ikon `Eye` pada baris artikel draf -> tab baru terbuka menampilkan artikel draf ber-banner pratinjau.
3. **Pengujian Modal Editor Form:**
   - Buka halaman tambah berita baru (`/admin/berita/baru`), isi sebagian formulir, upload gambar sampel, klik "Pratinjau" -> modal terbuka menampilkan data terkini secara instan.
   - Uji tombol toggle Desktop vs Mobile pada modal -> layout berganti mulus.
   - Tekan tombol `Escape` atau ikon silang -> modal tertutup kembali ke formulir editor tanpa kehilangan data form.
4. **Uji Validasi CI:**
   - Pastikan tidak ada error TypeScript maupun linting pada build pipeline.
