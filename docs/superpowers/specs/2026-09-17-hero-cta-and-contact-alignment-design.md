# Spesifikasi Teknis: Penyesuaian Elemen Call-to-Action Hero dan Redaksi Kontak Selaras Identitas Instansi Pelayanan Publik (Issue #72)

## 1. Konteks & Latar Belakang

Berdasarkan evaluasi langsung dari Kepala UPTD Instalasi Farmasi Kabupaten Kotabaru, antarmuka beranda publik (`/`) khususnya pada bagian Hero Section dinilai masih memiliki nuansa komersial/perusahaan swasta (*corporate/commercial SaaS feel*). Elemen tombol Call-to-Action (CTA) sekunder yang bertuliskan *"Hubungi Kami"* dengan tautan ke `/kontak` serta bentuk *pill button* (`rounded-full`) sangat identik dengan format situs penjualan/layanan swasta (*sales inquiry*).

Sebagai unit pelaksana teknis daerah (UPTD) di bawah Dinas Kesehatan yang bertugas dalam tata kelola dan distribusi logistik kefarmasian, portal publik harus merefleksikan identitas instansi pemerintah:
1. **Berwibawa, Akuntabel, dan Melayani:** Mengedepankan keterbukaan informasi publik dan akuntabilitas tata kelola obat.
2. **Prioritas Pelayanan Daerah:** Mengarahkan masyarakat dan fasilitas pelayanan kesehatan (Puskesmas/Pustu/Poskesdes) ke layanan prioritas transparansi publik, yakni **Cek Ketersediaan Obat** (`/stok`).
3. **Penyelarasan Saluran Komunikasi:** Memperbarui redaksi pada halaman kontak (`/kontak`) agar mencerminkan saluran resmi konsultasi, informasi, dan pengaduan masyarakat (SP4N-LAPOR).

### Naskah Laporan Capaian e-Kinerja PNS (SKP):
> *"Melakukan penyesuaian elemen tombol aksi utama dan standardisasi redaksi saluran komunikasi publik pada portal resmi instansi agar selaras dengan tata kelola pelayanan publik dan menonjolkan keterbukaan informasi ketersediaan obat bagi masyarakat."*

---

## 2. Analisis Perbandingan Antarmuka

| Komponen / Bagian | Kondisi Saat Ini (Lama) | Kondisi Baru yang Disesuaikan | Alasan / Nilai Tata Kelola |
|---|---|---|---|
| **CTA Utama Hero** (`page.tsx`) | `Lihat Layanan` (`/layanan`), bentuk *pill* `rounded-full` | `Lihat Layanan` (`/layanan`), bentuk formal `rounded-xl` | Mempertahankan gerbang eksplorasi tugas dan fungsi instansi dengan bentuk tombol yang lebih kokoh dan formal. |
| **CTA Sekunder Hero** (`page.tsx`) | `Hubungi Kami` (`/kontak`), bentuk *pill* `rounded-full` | `Ketersediaan Obat` (`/stok`), bentuk `rounded-xl` + Ikon `Pill` | Mengedepankan fungsi transparansi ketersediaan obat daerah sebagai aksi publik prioritas. |
| **Bentuk Tombol (Radius)** | `rounded-full` (khas produk SaaS komersial) | `rounded-xl` (khas portal instansi modern & berwibawa) | Menghilangkan kesan komersial dan menyelaraskan dengan bahasa desain kartu dan modal sistem. |
| **Eyebrow Kontak** (`kontak/page.tsx`) | `Hubungi` | `Pelayanan Publik` | Menekankan fungsi instansi sebagai pelayan masyarakat dan faskes. |
| **Judul Kontak** (`kontak/page.tsx`) | `Kontak Kami` | `Layanan Kontak & Informasi` | Standar nomenklatur unit informasi & dokumentasi instansi pemerintah. |
| **Keterangan Kontak** (`kontak/page.tsx`) | *"Hubungi kami untuk informasi lebih lanjut seputar layanan kefarmasian."* | *"Saluran resmi komunikasi, konsultasi kefarmasian, dan layanan pengaduan terpadu UPTD Instalasi Farmasi Kabupaten Kotabaru."* | Memberikan kepastian legalitas saluran komunikasi dan pengaduan resmi. |

---

## 3. Detail Rincian Perubahan Kode

### A. Hero Section Beranda (`src/app/(public)/page.tsx`)

1. **Import Ikon `Pill`:**
   Menambahkan `Pill` dari pustaka `lucide-react`.
   ```tsx
   import { ArrowRight, Pill, ... } from "lucide-react";
   ```

2. **Perubahan Markup Tombol Aksi (Garis 114–130):**
   ```tsx
   <div className="mt-5 flex flex-wrap items-center gap-3 lg:mt-10">
     <Link
       href="/layanan"
       className="group inline-flex items-center gap-3 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-luxe hover:bg-brand-500 active:scale-[0.98] shadow-sm shadow-brand-950/20"
     >
       Lihat Layanan
       <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 ease-luxe group-hover:translate-x-0.5">
         <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
       </span>
     </Link>
     <Link
       href="/stok"
       className="group inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all duration-300 ease-luxe hover:bg-white/10 hover:border-white/25 hover:text-white active:scale-[0.98]"
     >
       <Pill className="h-4 w-4 text-brand-400 transition-transform duration-300 ease-luxe group-hover:scale-110" strokeWidth={1.75} />
       Ketersediaan Obat
     </Link>
   </div>
   ```

### B. Halaman Kontak & Informasi (`src/app/(public)/kontak/page.tsx`)

1. **Pembaruan Parameter `PageHero` (Garis 52–57):**
   ```tsx
   <PageHero
     breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
     eyebrow="Pelayanan Publik"
     title="Layanan Kontak & Informasi"
     subtitle="Saluran resmi komunikasi, konsultasi kefarmasian, dan layanan pengaduan terpadu UPTD Instalasi Farmasi Kabupaten Kotabaru."
   />
   ```

---

## 4. Evaluasi Aksesibilitas & Responsivitas Layar

1. **Target Sentuh Minimum (Touch Targets):**
   - Kedua tombol aksi memiliki tinggi efektif minimal `44px` (`py-3` dengan teks `14px` + ikon), memenuhi standar WCAG 2.5.5 untuk kemudahan navigasi pengguna ponsel cerdas.
2. **Kontras Warna & Keterbacaan:**
   - Tombol utama (`bg-brand-600` dengan teks putih) memiliki rasio kontras > 4.5:1 terhadap latar belakang gelap hero.
   - Tombol sekunder (`text-zinc-200` di atas `border-white/15 bg-white/5`) memastikan keterbacaan tajam tanpa silau.
3. **Viewport Mobile (Ponsel Android Chrome):**
   - Pada layar sempit, tata letak menggunakan `flex-wrap gap-3` sehingga jika ruang horizontal terbatas, tombol akan turun rapi secara wajar tanpa overflow horizontal (*no horizontal scrollbar*).

---

## 5. Rencana Pengujian

1. **Pengujian Lokal / Dev Server (:3003):**
   - Verifikasi tampilan Beranda (`/`) pada viewport Desktop dan Mobile (lebar 360px - 390px).
   - Verifikasi klik tombol `Lihat Layanan` berhasil mengarah ke `/layanan`.
   - Verifikasi klik tombol `Ketersediaan Obat` berhasil mengarah ke `/stok`.
   - Verifikasi halaman `/kontak` menampilkan judul dan subjudul baru dengan rapi.
2. **CI Pipeline Validation:**
   - Lulus Type Check TypeScript (`tsc --noEmit`).
   - Lulus ESLint (`next lint`).
   - Lulus Build Next.js (`next build`).
