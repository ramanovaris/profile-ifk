# Spesifikasi Teknis: Redesign Layout Halaman Detail Berita Publik (Issue #62)

## 1. Konteks & Latar Belakang
Halaman detail berita publik (`/berita/[slug]`) merupakan etalase informasi utama UPTD Instalasi Farmasi Kabupaten Kotabaru bagi masyarakat luas dan aparatur sipil. Pada struktur tata letak sebelumnya, foto sampul diletakkan di puncak halaman (`aspect-[21/9]` menempel di bawah navbar), sedangkan judul artikel dan metadata baru muncul setelah foto sampul di dalam kontainer konten.

Tata letak tersebut memiliki keterbatasan pengalaman pengguna (UX):
1. **Penurunan Hirarki Visual**: Pengunjung yang membuka tautan berita di layar desktop atau peramban ponsel (khususnya mode *Desktop site* Chrome Android) harus menggulir ke bawah terlebih dahulu untuk membaca judul berita dan konteks publikasi.
2. **Keterbacaan & Konteks Editorial**: Standar media editorial modern (Substack, Medium, Vercel Blog) menempatkan judul berita sebagai penarik perhatian utama (*anchor visual*), diikuti informasi identitas penulis dan tanggal rilis, lalu dipertegas oleh foto sampul beresolusi tinggi sebelum masuk ke tubuh naskah.

**Issue #62** merealisasikan tata letak editorial modern yang elegan:
```
┌──────────────────────────────────────────────────────────┐
│  Breadcrumb: Beranda / Berita / Nama Kategori            │
│  [Badge Kategori]                                        │
│  JUDUL UTAMA ARTIKEL                                     │
│  Penulis · Tanggal Terbit · Estimasi Waktu Baca          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              FOTO SAMPUL EKSPANSIF                       │
│          (Full-Width Container, 16:9 Sinematik)          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Isi Naskah Artikel (Prose Terpusat & Nyaman Dibaca)     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Berita Terkait (2 Kolom Kartu Rekomendasi)              │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Tata Letak & Hirarki Visual (Vertical Flow)

### A. Header Artikel (`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8`)
1. **Banner Mode Pratinjau Admin (`ArticlePreviewBanner`)**:
   - Jika artikel berstatus draf dan diakses administrator terotentikasi, banner penanda mode pratinjau tampil di paling atas header.
2. **Navigasi Breadcrumb**:
   - Menampilkan hierarki: `Beranda` → `Berita` → `[Kategori]`.
3. **Lencana Kategori (`Badge`)**:
   - Desain Dark Ethereal: `bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium px-3 py-1 rounded-full text-xs`.
4. **Judul Artikel (`h1`)**:
   - Tipografi berbobot ekspresif, tajam, dan kontras tinggi:
     `text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-heading tracking-tight leading-tight mt-4`.
5. **Baris Metadata Publikasi**:
   - Ditata rapi secara horizontal dengan pemisah titik halus (`·`):
     - **Penulis**: Disertai ikon pengguna atau avatar inisial (`text-zinc-300 font-medium text-sm sm:text-base`).
     - **Tanggal Terbit**: Format formal bahasa Indonesia, misal: `13 September 2026`.
     - **Waktu Baca**: Estimasi waktu baca dinamis (dihitung otomatis: ~200 kata/menit, misal: `3 menit baca`).

### B. Foto Sampul Ekspansif (`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-4 sm:my-8`)
1. **Dimensi & Rasio Visual**:
   - Memakai rasio sinematik `aspect-video` (16:9) atau `aspect-[21/9]` responsif dengan lebar ekspansif kontainer (`w-full`).
   - Memberikan sudut membulat modern (`rounded-2xl md:rounded-3xl`), pembungkus terpotong rapi (`overflow-hidden`), dan bingkai kaca tipis (`border border-border/50 shadow-2xl bg-zinc-900/60 backdrop-blur-sm`).
2. **Optimalisasi Gambar (`next/image`)**:
   - Dilengkapi atribut `priority` untuk LCP (*Largest Contentful Paint*) optimal.
   - Penanganan URL fleksibel (`unoptimized` otomatis untuk URL eksternal / CDN).
   - Penataan `object-cover` untuk menjaga proporsi foto tetap estetis di semua breakpoint.
3. **Fallback Visual Elegan**:
   - Jika artikel tidak memiliki `coverImage`, sistem menampilkan latar Dark Ethereal bermotif gradasi halus dengan monogram identitas instansi UPTD Instalasi Farmasi Kabupaten Kotabaru.

### C. Tubuh Naskah Artikel (`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4`)
1. **Tipografi & Jarak Baca**:
   - Menggunakan konfigurasi `prose prose-zinc prose-invert max-w-none`.
   - Ukuran huruf `text-base md:text-lg` dengan jarak antar-baris lapang (`leading-relaxed md:leading-8`).
   - Warna teks utama nyaman untuk mata: `text-zinc-300/95`.
   - Penataan elemen kaya teks: *heading 2/3*, kutipan (*blockquote* bergaris samping emerald), daftar berbutir (*bullet lists*), dan tautan dengan garis bawah lembut (`hover:text-brand-400 transition-colors`).

### D. Rekomendasi Berita Terkait (`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40`)
1. Menampilkan hingga 2 artikel terbit terbaru lainnya sebagai saran bacaan.
2. Kartu tautan interaktif dengan efek transisi hover berbingkai emerald halus (`hover:border-brand-500/40 transition-all duration-300`).

---

## 3. Redesign Toolbar Pencarian & Filter Kategori Berita Publik (Halaman `/berita`)

### A. Konsep & Desain Visual Toolbar Terpadu
Mengadopsi tata letak dan estetika toolbar dari halaman stok obat (`/stok`):
1. **Wadah Toolbar (`Reveal`):**
   - Menggunakan card melengkung elegan: `rounded-2xl border border-border bg-surface-alt/60 p-3.5 sm:p-4 backdrop-blur-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`.
2. **Kolom Pencarian (`Search` & Tombol `X`):**
   - Kolom pencarian melengkung penuh: `rounded-full border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-heading placeholder:text-muted outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20`.
   - Ikon pencarian `Search` di sebelah kiri (`left-3.5 text-muted`).
   - Tombol hapus instan `X` di sebelah kanan: hanya muncul saat kolom memiliki teks ketikan; mengeklik tombol akan mengosongkan input dan parameter URL `q` secara seketika (0ms).
3. **Dropdown Filter Kategori (`PublicCategoryFilter`):**
   - Tombol pemicu (*trigger button*) melengkung penuh: `rounded-full border px-4 h-10 text-xs font-medium` berikon `SlidersHorizontal` dan `ChevronDown`.
   - Popover panel melengkung dengan backdrop blur tinggi (`rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur-xl p-2.5`).
   - Menampilkan opsi "Semua Kategori" dan seluruh kategori aktif, lengkap dengan indikator aktif (`Check` icon) dan jumlah artikel per kategori.

### B. Sinkronisasi State & Parameter URL (`useSearchParams` + `router.replace`)
1. **Parameter `q` (Pencarian Teks):**
   - Menulis ke URL peramban dengan debounce 350ms agar input ketikan responsif dan URL browser tidak berkedip.
   - Jika teks kosong, parameter `q` dihapus dari URL.
2. **Parameter `kategori` (Penyaringan Kategori):**
   - Menulis slug kategori terpilih ke URL seketika (0ms).
   - Jika kategori adalah `"semua"` atau dikembalikan ke awal, parameter `kategori` dihapus dari URL.
3. **Pencegahan Lonjakan Gulir (*Zero-Jump Scroll*):**
   - Menggunakan `router.replace(url, { scroll: false })` sehingga URL dapat dibagikan atau disimpan (*bookmark*) tanpa memindahkan posisi gulir layar.
4. **Pembungkus Suspense:**
   - Komponen `BeritaClientView` dibungkus dalam `<Suspense fallback={null}>` di `src/app/(public)/berita/page.tsx` sesuai aturan Next.js App Router.

---

## 4. Kompatibilitas Perangkat & Mode Desktop HP (md+ ≥768px)

1. **Pengujian Responsif Khusus HP Android**:
   - Pengguna mereview antarmuka melalui peramban Google Chrome Android dengan mode *"Desktop site"* aktif (simulasi lebar layar `1024px` hingga `1280px`).
   - Semua kelas tata letak memanfaatkan utilitas desktop standar (`md:`, `lg:`) tanpa mengorbankan tampilan pada viewport murni perangkat bergerak (`<768px`).
2. **Ketinggian Sesi Atas Layar (*Above-the-Fold*)**:
   - Jarak bantalan atas (`padding-top`) dirancang presisi terhadap fixed navbar agar seluruh judul berita dan bagian atas foto sampul langsung terlihat begitu halaman selesai dimuat tanpa membutuhkan gulir awal.

---

## 4. Rencana Pengujian & Verifikasi

### A. Pengujian Otomatis (`scripts/verify-public-article-redesign.ts`)
1. **Urutan Struktur DOM**:
   - Memverifikasi bahwa elemen judul dan metadata hadir sebelum kontainer foto sampul.
   - Memverifikasi bahwa foto sampul berada sebelum badan naskah artikel.
2. **Dimensi & Rasio Kelas**:
   - Memastikan kontainer foto sampul memiliki kelas pembungkus ekspansif (`max-w-5xl`, `rounded-2xl` atau `rounded-3xl`).
3. **Render Server & Status HTTP**:
   - Menguji permintaan HTTP ke endpoint `/profile-ifk/berita/[slug]` pada server pengembang lokal (port 3003) menghasilkan respons `200 OK` dengan tata letak baru.

### B. Pengujian Visual Manual
1. Buka peramban di HP Android pada mode *"Desktop site"*.
2. Buka salah satu berita terbit (misal: `/profile-ifk/berita/...`).
3. Periksa keselarasan tipografi judul, metadata penulis/tanggal, kemegahan foto sampul 16:9, dan keterbacaan naskah di bawahnya.
