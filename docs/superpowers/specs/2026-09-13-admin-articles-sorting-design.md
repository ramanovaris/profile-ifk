# Spesifikasi Teknis: Fitur Pengurutan Data (Sorting) Interaktif pada Tabel Artikel Berita Admin (Issue #60)

## 1. Konteks & Latar Belakang
Pada panel administrator kelola berita (`/admin/berita`), pengelola instansi saat ini telah dapat melakukan pencarian teks (`searchQuery`), penyaringan multi-kategori (`selectedCategories`), dan paginasi data (`itemsPerPage`). Namun, urutan baris artikel pada tabel masih bersifat statis dan terpaku pada urutan bawaan saat data dimuat dari basis data (`createdAt: desc`).

Ketika jumlah publikasi berita, pengumuman, dan artikel kefarmasian terus bertambah, administrator memerlukan fleksibilitas untuk:
1. Menemukan artikel berdasarkan urutan abjad judul (A–Z / Z–A).
2. Mengelompokkan artikel berdasarkan nama kategori secara berurutan.
3. Memilah artikel berdasarkan status publikasi (memprioritaskan artikel Draf yang butuh peninjauan segera atau artikel Terbit).
4. Mengurutkan artikel berdasarkan tanggal rilis/terbit (kronologis terlama hingga terbaru atau sebaliknya).

Issue #60 berfokus pada **implementasi fitur pengurutan data (*sorting*) interaktif multi-kolom yang terintegrasi dengan URL query parameter**. Pendekatan ini menjamin respon instan 0ms di sisi klien tanpa membebani memori server VPS 2GB, sekaligus mempertahankan kondisi pengurutan saat halaman diperbarui (*refresh*) maupun ketika tautan dibagikan antar pengelola.

---

## 2. Arsitektur & Logika Pengurutan Data

### A. State Management & Sinkronisasi URL
1. **Parameter URL:**
   - Parameter `sort`: menentukan kolom aktif yang diurutkan (`title` | `category` | `isPublished` | `publishedAt`).
   - Parameter `order`: menentukan arah pengurutan (`asc` | `desc`).
   - Contoh URL: `/admin/berita?sort=publishedAt&order=desc` atau `/admin/berita?sort=title&order=asc`.
2. **Inisialisasi Awal:**
   - Saat komponen `ArticleTable` dimuat, nilai awal `sortKey` dan `sortOrder` dibaca dari `useSearchParams()`.
   - Jika parameter URL belum ada, sistem menggunakan nilai baku (*default*):
     * `sortKey`: `"publishedAt"`
     * `sortOrder`: `"desc"` (artikel terbit terbaru berada di baris teratas).
3. **Pembaruan URL Halus (*Shallow URL Update*):**
   - Setiap kali administrator mengeklik header kolom untuk mengubah pengurutan, URL diperbarui secara asinkron menggunakan `router.replace(newUrl, { scroll: false })`.
   - Menggunakan `{ scroll: false }` memastikan posisi gulir layar (*scroll position*) tidak meloncat ke atas saat pengurutan berubah.

### B. Urutan Eksekusi Data (*Pipeline Data*)
Urutan pemrosesan data artikel di dalam komponen klien mengikuti alur terstruktur:
```
optimisticArticles (Basis Data / State Klien)
  ↓
1. Filter Pencarian Teks (Judul & Kategori)
  ↓
2. Filter Multi-Kategori (Checkbox Kategori Terpilih)
  ↓
3. Sorting Multi-Kolom (In-Memory Komparasi sesuai sortKey & sortOrder)
  ↓
4. Paginasi (Potong array berdasarkan currentPage & itemsPerPage)
  ↓
Render Baris Tabel
```

### C. Aturan Komparasi (*Comparator Rules*)
Logika pengurutan menangani setiap tipe data secara spesifik:
1. **Judul Artikel (`title`):**
   - Komparasi string berbasis lokal Indonesia: `a.title.localeCompare(b.title, 'id', { sensitivity: 'base' })`.
2. **Nama Kategori (`category`):**
   - Komparasi nama kategori: `a.category.name.localeCompare(b.category.name, 'id', { sensitivity: 'base' })`.
3. **Status Publikasi (`isPublished`):**
   - Membandingkan nilai boolean: `(a.isPublished === b.isPublished ? 0 : a.isPublished ? -1 : 1)`.
   - Pada arah `asc`: status **Terbit** tampil lebih dahulu daripada **Draft**.
   - Pada arah `desc`: status **Draft** tampil lebih dahulu.
4. **Tanggal Terbit (`publishedAt`):**
   - Mengonversi tanggal ke representasi milidetik: `new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()`.
   - Jika terdapat artikel dengan tanggal terbit yang sama, urutan cadangan (*tie-breaker*) menggunakan `new Date(a.createdAt).getTime()`.
5. **Reset Paginasi:**
   - Setiap kali pengurutan kolom atau arah urutan berubah, paginasi otomatis kembali ke halaman pertama (`setCurrentPage(1)`).

---

## 3. Desain Antarmuka Pengguna & Aksesibilitas (UI/UX)

### A. Tampilan Header Kolom Interaktif
1. Header tabel pada kolom `Artikel`, `Kategori`, `Status`, dan `Tanggal Terbit` diubah menjadi elemen tombol interaktif (`<button type="button">`).
2. Kolom `Aksi` di sisi paling kanan tetap bersifat statis (tidak memiliki tombol pengurutan).
3. **Efek Interaksi Visual:**
   - Kursor berubah menjadi penunjuk (`cursor-pointer`).
   - Efek sorotan halus saat diarahkan kursor (*hover*): `hover:text-white hover:bg-white/[0.04] transition-colors rounded-lg px-2 py-1 -mx-2`.
4. **Indikator Ikon Lucide:**
   - Kolom Tidak Aktif: menampilkan ikon `ArrowUpDown` dengan warna redup (`text-zinc-600 group-hover:text-zinc-400`).
   - Kolom Aktif Naik (*Ascending*): menampilkan ikon `ArrowUp` menyala dengan warna aksen brand (`text-brand-400 font-bold`).
   - Kolom Aktif Turun (*Descending*): menampilkan ikon `ArrowDown` menyala dengan warna aksen brand (`text-brand-400 font-bold`).

### B. Siklus Aksi Klik Header
- **Klik pada kolom yang belum aktif:**
  * Kolom tanggal terbit (`publishedAt`): langsung beralih ke arah `desc` (karena preferensi pengguna biasanya ingin melihat tanggal mutakhir).
  * Kolom teks (`title`, `category`) & status (`isPublished`): langsung beralih ke arah `asc` (A-Z atau Terbit duluan).
- **Klik pada kolom yang sedang aktif:**
  * Membalikkan arah pengurutan antara `asc` $\leftrightarrow$ `desc`.

### C. Aksesibilitas (a11y) & Responsivitas Mobile
1. Header tabel memiliki atribut `aria-sort="ascending" | "descending" | "none"` sesuai standar WAI-ARIA Data Table.
2. Tombol header dapat dioperasikan penuh menggunakan keyboard (tombol `Tab`, `Enter`, dan `Spasi`).
3. Dilengkapi `title` dan `aria-label` deskriptif (contoh: *"Klik untuk mengurutkan berdasarkan Judul Artikel secara Z-A"*).
4. Tampilan tetap rapi dan tidak meluap (*overflow*) pada mode desktop maupun mobile (Android Chrome "Desktop site" mode).

---

## 4. Rencana Pengujian & Verifikasi
Dibuat skrip pengujian otomatis `scripts/verify-admin-articles-sorting.ts` untuk memvalidasi:
1. **Pengurutan Judul (A–Z & Z–A):** Memastikan judul terurut alfabetis dengan benar.
2. **Pengurutan Kategori (A–Z & Z–A):** Memastikan kategori terurut alfabetis.
3. **Pengurutan Status (Terbit vs Draft):** Memastikan pemilahan status publikasi konsisten.
4. **Pengurutan Tanggal Terbit (Terbaru vs Terlama):** Memastikan urutan kronologis tepat berdasarkan waktu.
5. **Kombinasi Pencarian + Filter Kategori + Pengurutan:** Memastikan data yang disaring tetap terurut dengan presisi.
6. **Verifikasi Respon HTTP Panel Admin:** Memastikan rute `/admin/berita` merespon dengan status HTTP 200 OK beserta parameter query sorting.

---

## 5. Redaksi e-Kinerja PNS
> *"Mengembangkan fitur pengurutan data (sorting) multi-kolom yang responsif dan interaktif pada tabel kelola artikel berita di panel administrator instansi, mencakup pengurutan berdasarkan judul artikel, kategori, status publikasi, serta tanggal terbit guna meningkatkan efisiensi dan fleksibilitas tata kelola arsip informasi publik kefarmasian."*
