# Spesifikasi Teknis: Toolbar Pencarian & Filter Kategori Sticky pada Halaman Berita Publik (Issue #74)

## 1. Konteks & Latar Belakang

Pada portal informasi publik UPTD Instalasi Farmasi Kabupaten Kotabaru (`profile-ifk`), halaman Berita & Informasi (`/berita`) menyajikan warta kesehatan, kegiatan instansi, dan pengumuman kefarmasian. Dengan adanya fitur *Muat Lebih Banyak* (*Load More*), daftar artikel dapat bertambah panjang ke bawah.

Sebelumnya, bilah antarmuka (*toolbar*) pencarian dan pemilihan kategori berada tepat di atas kisi artikel dan ikut tergulir hilang (*scroll out of view*) saat pengguna membaca artikel di bagian bawah. Pengunjung yang ingin mengganti kata kunci pencarian atau memilih kategori lain harus melakukan gulir balik (*scroll up*) ke puncak halaman.

**Issue #74** bertujuan mengoptimalkan kenyamanan eksplorasi informasi dengan membuat bilah pencarian dan filter kategori tetap menempel (*sticky*) di area atas layar secara dinamis selama pengguna menggulir daftar artikel.

### Naskah Laporan Capaian e-Kinerja PNS (SKP):
> *"Melakukan optimalisasi tata letak bilah penelusuran dan filter kategori pada portal informasi kesehatan agar tetap terjangkau saat masyarakat menggulir warta, guna meningkatkan kemudahan dan aksesibilitas penemuan informasi publik."*

---

## 2. Analisis Hambatan Teknis: `Reveal` & Stacking Context

Dalam implementasi sebelumnya pada `src/components/public/berita-client-view.tsx`, toolbar dibungkus oleh komponen animasi `<Reveal>`:

```tsx
<Reveal className="relative z-30">
  <div className="relative z-30 flex flex-col gap-3 sm:flex-row ...">
```

Komponen `<Reveal>` mengaplikasikan kelas CSS `.reveal` dan `.reveal.is-visible` (`src/app/globals.css`):
```css
.reveal {
  opacity: 0;
  transform: translateY(1.5rem);
  filter: blur(6px);
  will-change: opacity, transform;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}
```

### Jebakan Spesifikasi CSS:
Berdasarkan spesifikasi *CSS Positioned Layout*, elemen apa pun yang memiliki properti `transform`, `filter`, atau `perspective` (walaupun bernilai `translateY(0)` atau `blur(0)`) akan menciptakan *containing block* dan *stacking context* lokal baru. Akibatnya:
- Elemen anak dengan deklarasi `position: sticky` tidak akan menempel terhadap jendela browser (*viewport*), melainkan terkurung dalam batas elemen `<Reveal>` tersebut.
- Saat `<Reveal>` tergulir keluar layar, elemen sticky di dalamnya ikut terangkat dan gagal menempel.

### Solusi Desain:
1. Melepaskan pembungkus `<Reveal>` khusus pada kontainer bilah pencarian & filter di `BeritaClientView`.
2. Menjadikan kontainer bilah sebagai turunan langsung dari `section-container` dengan utilitas native Tailwind `sticky`.
3. Mempertahankan pembungkus `<Reveal delay={100}>` pada kisi kartu artikel (`Grid Daftar Artikel`) di bawahnya agar efek animasi masuk tetap aktif.

---

## 3. Tata Letak, Jarak Aman (*Top Offset*), & Stacking Order (*Z-Index*)

### A. Posisi Navbar Publik
Navbar publik (`src/components/public/navbar.tsx`) menggunakan model *floating glass pill*:
- Kelas: `fixed inset-x-0 z-50 top-4 px-4`
- Tinggi pill: `h-14` (56px)
- Batas bawah pill navbar berada pada koordinat vertikal: `16px + 56px = 72px` dari puncak layar.

### B. Penentuan Jarak Aman (*Top Offset*) Toolbar
Untuk menghindari tumpang-tindih (*overlap*) antara floating navbar dan toolbar pencarian yang melayang:
- **Layar Smartphone (`<640px`):** Menggunakan `top-20` (80px). Menyediakan jarak bersih 8px di bawah pill navbar sehingga tidak saling menimpa.
- **Layar Desktop (`sm+` / `>=640px`):** Menggunakan `top-24` (96px). Memberikan jarak bernapas (*breathing room*) sebesar 24px yang proporsional dan elegan.

### C. Hirarki Layer (*Z-Index*)
- **`z-50`**: Floating glass navbar publik & menu dropdown navigasi mobile.
- **`z-50`**: Popover menu dropdown kategori berita (berada di dalam toolbar, terbuka di atas elemen di sekitarnya).
- **`z-30`**: Kontainer bilah pencarian & filter yang berstatus `sticky`.
- **`z-10` / static**: Kisi kartu artikel berita dan elemen teks konten.

Dengan struktur ini, saat pengguna menggulir ke bawah:
1. Kartu artikel melintas mulus di balik bilah pencarian (`z-10` di bawah `z-30`).
2. Bilah pencarian melintas di balik pill floating navbar (`z-30` di bawah `z-50`).

---

## 4. Estetika Visual & Keterbacaan (*Backdrop Blur & Elevation*)

### Penyesuaian Material Kaca Buram:
Sebelumnya toolbar menggunakan latar belakang `bg-surface-alt/60 p-3.5 sm:p-4 backdrop-blur-md`. Pada kondisi melayang di atas kartu artikel:
- Opasitas 60% berisiko membuat gambar thumbnail dan judul artikel di baliknya tembus pandang, mengaburkan teks kolom pencarian.

### Desain Pembaruan:
- **Latar Belakang:** Menggunakan `bg-surface/90 sm:bg-surface-alt/85 backdrop-blur-xl border border-border/80`.
- **Bayangan Halus (*Shadow*):** Menambahkan `shadow-[0_4px_20px_rgba(0,0,0,0.05)]` untuk memberikan kedalaman visual yang membedakan bidang bilah dengan konten di baliknya saat melayang.
- **Transisi Halus:** Menambahkan transisi `transition-all duration-300` agar adaptasi visual berjalan natural.

---

## 5. Ruang Lingkup Menempel (*Sticky Scope*)

Kontainer bilah pencarian berada di dalam `section.border-t.border-border.bg-surface.py-24` (`src/app/(public)/berita/page.tsx`).
- Sifat native `position: sticky` membatasi pergerakan elemen hanya di dalam batas induk terdekatnya (`section`).
- Ketika pengguna menggulir hingga ke ujung bawah daftar berita dan memasuki area *Footer*, bilah toolbar secara alami akan ikut tergulir ke atas bersama `section` tanpa perlu logika JavaScript tambahan (bebas bug, hemat memori).

---

## 6. Rencana Pengujian & Kriteria Keberhasilan

1. **Uji Fungsionalitas Sticky:**
   - Gulir halaman ke bawah melewati hero hingga artikel ke-12. Bilah pencarian dan filter kategori harus tetap berada di posisi atas layar (`top-20` di mobile, `top-24` di desktop).
2. **Uji Bebas Konflik Stacking:**
   - Memastikan bilah pencarian tidak menutupi atau bertabrakan dengan floating navbar di atasnya.
   - Memastikan kartu artikel yang melintas di bawah bilah pencarian terlihat buram dan tidak mengganggu keterbacaan placeholder/input teks.
3. **Uji Interaktivitas Komponen:**
   - Pengetikan pencarian (debounce 350ms) dan pembersihan seketika (*clear button*) tetap berfungsi normal saat bilah dalam posisi melayang.
   - Popover dropdown filter kategori dapat dibuka, dipilih, dan ditutup secara sempurna tanpa terpotong (*overflow clipping*).
4. **Uji Responsivitas Perangkat:**
   - Tampilan diuji pada resolusi smartphone dan Chrome Android mode desktop.
