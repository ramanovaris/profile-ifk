# Spesifikasi Teknis: Konsumsi Basis Data PostgreSQL pada Daftar Berita Publik dan Beranda (Issue #58)

## 1. Konteks & Latar Belakang
Pada tahap sebelumnya (Issue #45 / PR #57), halaman rincian berita publik (`/berita/[slug]`) telah berhasil dihubungkan langsung ke basis data relasional PostgreSQL melalui Prisma ORM dengan proteksi draf yang aman. Namun saat ini:
1. Halaman indeks daftar berita publik (`/berita/`) masih beroperasi secara penuh di sisi klien (`"use client"`) menggunakan data tiruan statis (`dummyArticles` dan `ARTICLE_CATEGORIES` dari `src/lib/dummy-data.ts`).
2. Halaman beranda utama instansi (`/`) masih menampilkan 3 cuplikan artikel dari `dummyArticles`.
3. Filter kategori pada antarmuka publik belum mencerminkan master kategori dinamis yang dikelola oleh administrator di panel admin.

Issue #58 berfokus pada **modernisasi dan integrasi menyeluruh antarmuka berita publik dan beranda ke basis data PostgreSQL**, menggunakan arsitektur **Hybrid Server-Side Rendering (SSR) dengan Paginasi Asinkron "Muat Berita Lainnya" (*Load More*)**. Pendekatan ini menjamin kecepatan akses awal yang optimal, ramah mesin pencari (SEO), hemat konsumsi memori gawai pengunjung, serta mampu berskala secara andal seiring bertambahnya volume publikasi artikel.

---

## 2. Arsitektur & Alur Data

### A. Halaman Berita Publik (`src/app/(public)/berita/page.tsx`)
1. **Server Component (SSR):**
   - Halaman utama `/berita` diubah menjadi Server Component asinkron (`async function BeritaPage()`).
   - Melakukan query awal ke PostgreSQL melalui Prisma Client:
     * Mengambil **12 artikel terbit pertama** (`isPublished: true`, diurutkan berdasarkan `publishedAt: 'desc'`) beserta relasi nama kategori dan penulisnya.
     * Mengambil seluruh daftar kategori berstatus aktif (`status: 'ACTIVE'`, diurutkan alfabetis).
     * Menghitung total jumlah artikel terbit (`totalArticles`) untuk menentukan nilai `hasMore` (`totalArticles > 12`).
   - Menerapkan mekanisme *graceful fallback*: jika tabel artikel di basis data kosong, sistem secara aman menggunakan `dummyArticles` sebagai data percontohan agar tata letak antarmuka tetap terjaga.
   - Meneruskan data awal (`initialArticles`, `categories`, `initialTotal`, `initialHasMore`) ke komponen interaktif klien `BeritaClientView`.

### B. Server Action Publik (`getPublicArticlesAction`)
1. Ditempatkan pada `src/actions/article.ts` sebagai fungsi Server Action yang dapat dipanggil baik di server maupun oleh komponen klien secara asinkron.
2. Parameter masukan:
   ```ts
   export type GetPublicArticlesParams = {
     page?: number;         // Halaman (1-indexed, default: 1)
     limit?: number;        // Jumlah per halaman (default: 12)
     categorySlug?: string; // Filter slug kategori (opsional)
     search?: string;       // Kata kunci pencarian judul/konten (opsional)
   };
   ```
3. Logika Query:
   - Filter wajib: `isPublished: true`.
   - Filter kategori: jika `categorySlug` disediakan dan bukan `"semua"`, cocokkan dengan `category: { slug: categorySlug, status: 'ACTIVE' }`.
   - Filter pencarian: jika `search` disediakan, gunakan pencarian case-insensitive (`mode: 'insensitive'`) pada bidang `title` atau `content`.
   - Pengurutan: `publishedAt: 'desc'`.
   - Kalkulasi pagination: `skip = (page - 1) * limit`, `take = limit`.
4. Mengembalikan struktur data terstandarisasi:
   ```ts
   export type GetPublicArticlesResult = {
     articles: Array<{
       id: string;
       title: string;
       slug: string;
       coverImage: string | null;
       categoryName: string;
       categorySlug: string;
       publishedAt: string; // ISO string untuk serialisasi aman
     }>;
     total: number;
     hasMore: boolean;
   };
   ```

### C. Komponen Klien Interaktif (`src/components/public/berita-client-view.tsx`)
1. Komponen interaktif (`"use client"`) yang merender bilah pencarian, filter kategori pil, grid kartu artikel, dan tombol paginasi.
2. **State Management:**
   - `articles`: Daftar artikel yang saat ini ditampilkan di layar.
   - `search`: Nilai masukan kotak pencarian teks dengan debounce 300 milidetik.
   - `activeCategory`: Kategori yang sedang aktif dipilih (default: `"Semua"`).
   - `page`: Nomor halaman saat ini (dimulai dari `1`).
   - `hasMore`: Status ketersediaan artikel lanjutan.
   - `isLoading`: Indikator pemuatan saat filter/pencarian berubah.
   - `isLoadingMore`: Indikator pemuatan saat tombol "Muat Berita Lainnya" ditekan.
3. **Mekanisme Interaksi:**
   - Saat pengguna mengetik pencarian atau berpindah kategori:
     * Reset `page` ke 1.
     * Panggil `getPublicArticlesAction` dengan parameter filter baru.
     * Perbarui `articles` dengan hasil baru secara instan.
   - Saat pengguna mengeklik tombol **"Muat Berita Lainnya"**:
     * Naikkan `page` menjadi `page + 1`.
     * Panggil `getPublicArticlesAction` untuk halaman berikutnya.
     * Gabungkan (*append*) artikel baru ke akhir state `articles`.
     * Perbarui `hasMore` sesuai sisa data di database.

### D. Integrasi Halaman Beranda Publik (`src/app/(public)/page.tsx`)
1. Halaman Beranda membaca data PostgreSQL secara server-side:
   ```ts
   const dbArticles = await db.article.findMany({
     where: { isPublished: true },
     include: {
       category: { select: { name: true, slug: true } },
     },
     orderBy: { publishedAt: "desc" },
     take: 3,
   });
   ```
2. Logika Distribusi Konten:
   - Artikel indeks ke-0 dijadikan **Berita Unggulan (*Featured Card*)** dengan tampilan gambar bezel aspek rasio 16:9.
   - Artikel indeks ke-1 dan ke-2 ditampilkan pada **Daftar Berita Samping (*Sidebar List*)** dengan tanggal ringkas dan badge kategori.
   - Jika basis data belum memiliki artikel terbit, otomatis beralih ke `dummyArticles` sebagai fallback anggun.

---

## 3. Rincian Antarmuka & Interaksi (UI/UX)

### A. Desain Filter & Grid Berita
- **Bilah Pencarian (*Search Input*):**
  * Mempertahankan desain minimalis elegan dengan ikon `Search` di sisi kiri, border halus, dan fokus warna brand (`focus:border-brand-600`).
- **Pills Filter Kategori Dinamis:**
  * Tombol pil melengkung (`rounded-full`) dengan transisi halus (`transition-all duration-500 ease-luxe`).
  * Kategori aktif ditandai latar gelap pekat (`bg-zinc-950 text-white`), sementara kategori tidak aktif menggunakan latar lembut (`bg-surface-alt text-muted hover:bg-zinc-200`).
- **Kartu Berita (Grid 2 Kolom di Desktop / 1 Kolom di Mobile):**
  * Pembungkus bezel presisi (`bezel` + `bezel-inner relative aspect-[16/10]`).
  * Efek pembesaran gambar halus saat kartu disentuh/diarahkan kursor (`group-hover:scale-[1.03]`).
  * Badge kategori mengambang di sudut kiri atas gambar dengan latar putih semi-transparan (`bg-white/90 text-brand-700`).
  * Tanggal rilis diformat dalam standar penanggalan Indonesia (contoh: *"15 Januari 2025"*).

### B. Tombol "Muat Berita Lainnya" (*Load More Button*)
- Ditempatkan terpusat di bawah grid artikel.
- Tampil hanya ketika `hasMore === true`.
- Desain tombol:
  * Tombol berbentuk pil dengan garis tepi lembut (`rounded-full border border-border bg-white px-8 py-3 text-sm font-medium text-heading shadow-xs hover:border-brand-300 hover:bg-zinc-50`).
  * Saat `isLoadingMore` aktif: tombol menampilkan ikon putar `Loader2` animasi spin dengan teks *"Memuat Berita..."* dan status dinonaktifkan (`disabled`).
- Keadaan Kosong (*Empty State*):
  * Jika pencarian atau filter kategori tidak menghasilkan satu pun artikel terbit, tampilkan teks informatif:
    > *"Tidak ada berita yang cocok dengan pencarian atau kategori yang Anda pilih."*

---

## 4. Pengamanan Hak Akses & Integritas Data
1. **Isolasi Total Draf:**
   Seluruh query publik (`getPublicArticlesAction`, query `page.tsx` Berita, dan query `page.tsx` Beranda) menerapkan klausa permanen `where: { isPublished: true }`. Artikel berstatus draf tidak akan pernah bocor ke publik tanpa autentikasi admin.
2. **Pembersihan Parameter (*Sanitization*):**
   Input pencarian dibersihkan dari whitespace berlebih dan dibatasi panjangnya maksimal 100 karakter untuk mencegah query database yang berlebihan.
3. **Invalidasi Cache Otomatis:**
   Fungsi Server Action pengelolaan artikel di admin (`createArticleAction`, `updateArticleAction`, `toggleArticlePublishAction`, `deleteArticleAction`) telah memanggil `revalidatePath("/berita")` dan `revalidatePath("/")`, memastikan pembaruan data terbit seketika tercermin pada tampilan publik.

---

## 5. Rencana Pengujian Otomatis
Dibuat skrip verifikasi otomatis `scripts/verify-public-articles.ts` untuk menguji:
1. **Verifikasi Server Action:**
   - Memastikan `getPublicArticlesAction` mengembalikan hanya artikel terbit.
   - Memastikan filter kategori menghasilkan artikel dengan kategori yang sesuai.
   - Memastikan filter pencarian kata kunci menyaring judul/konten dengan tepat.
   - Memastikan artikel berstatus draf (`isPublished: false`) tidak pernah muncul dalam hasil query publik.
2. **Verifikasi Respon HTTP Publik:**
   - Memastikan rute `/profile-ifk/berita` merespon dengan status HTTP 200 OK.
   - Memastikan rute `/profile-ifk` (Beranda) merespon dengan status HTTP 200 OK dan menyajikan berita terbaru dari PostgreSQL.

---

## 6. Redaksi e-Kinerja PNS
> *"Mengembangkan dan mengintegrasikan konsumsi basis data relasional PostgreSQL secara hibrida pada antarmuka publik portal website instansi, mencakup penyajian daftar artikel berita terkini, filter kategori dinamis, dan mekanisme paginasi asinkron berbasis tombol muat data lanjutan (load more) guna mengoptimalkan performa akses masyarakat, skalabilitas penyimpanan informasi, dan transparansi publikasi kefarmasian."*
