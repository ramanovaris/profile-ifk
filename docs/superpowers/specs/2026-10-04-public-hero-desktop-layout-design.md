# Spesifikasi Desain: Optimalisasi Hero Halaman Publik di Layar Desktop (Issue #122)

**Tanggal:** 2026-10-04  
**Status:** Draf Terpilih (Disetujui Pengguna)  
**Referensi:** GitHub Issue #122, PR terkait, branch `feat/122-public-hero-desktop-layout`

---

## 1. Latar Belakang & Masalah
Pada halaman publik non-beranda (`/layanan`, `/profil`, `/stok`, `/berita`, dan `/kontak`), bagian kepala (*PageHero*) mengalami ketidakseimbangan visual (*empty space*) yang sangat mencolok saat dibuka di layar lebar (komputer/desktop $\ge$ 1024px / breakpoint `lg`).

Penyebab utama:
1. **Kolom Kiri Terkunci Lebar Maksimal:** Konten judul dan pengantar dibatasi pada `max-w-2xl` (~672px) di sisi kiri.
2. **Garis Pemisah Tengah Tanpa Pendamping:** Elemen visual garis halus vertikal di `left-1/2` membagi layar menjadi dua zona, namun zona kanan kosong melompong tanpa konten apapun.
3. **Peluang UX yang Terlewat:** Layar desktop sebenarnya memiliki ruang lega yang ideal untuk menyajikan informasi ringkas atau navigasi cepat penting tanpa memaksa pengunjung *scrolling* lebih jauh.

---

## 2. Tujuan Desain
1. Mewujudkan tata letak 2 kolom yang proporsional, padat, dan estetis di layar desktop.
2. Mengisi zona kanan dengan **Kartu Kaca Kontekstual (*Contextual Glass Card*)** yang relevan dengan spesialisasi tiap halaman.
3. Menjaga responsivitas sempurna di layar seluler (`< lg`) agar kartu tambahan tidak menggeser atau memperpanjang guliran konten utama.
4. Memastikan kompatibilitas mundur (*backward compatibility*): jika prop konten kanan tidak diberikan, `PageHero` tetap dapat berfungsi sebagai hero kolom tunggal tanpa cela.

---

## 3. Arsitektur Komponen

### 3.1 Peningkatan `PageHero` (`src/components/public/page-hero.tsx`)
Komponen `PageHero` ditambahkan prop baru:
```tsx
interface PageHeroProps {
  breadcrumb: { label: string; href?: string }[];
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  className?: string;
  rightContent?: React.ReactNode; // Slot konten sisi kanan di desktop
}
```

Struktur DOM yang disempurnakan:
* **Kontainer Luar:** Mempertahankan efek latar belakang `hero-grid`, mesh orbs, dan palet warna *Dark Ethereal*.
* **Garis Pemisah Vertikal:** Garis halus `left-1/2` di desktop tetap hadir sebagai aksen pemisah zona yang natural ketika `rightContent` aktif.
* **Grid Konten:**
  * Bila `rightContent` terisi: menggunakan `grid gap-12 lg:grid-cols-2 lg:items-center`.
  * Kolom kiri: Menampung `Breadcrumb`, `eyebrow badge`, `h1`, dan `subtitle`.
  * Kolom kanan: Menampung elemen `rightContent` dalam wadah `hidden lg:block` (atau disesuaikan jika ingin adaptif).

---

## 4. Rincian Kartu Ringkasan Kontekstual per Halaman

### 4.1 Halaman `/layanan`
* **Komponen:** Kartu Pelayanan Operasional & Akses Faskes
* **Elemen:**
  * Header kartu: Ikon jam dinding (*Clock*), judul "Jam Pelayanan Distribusi", dan status badge berdenyut (*pulse*) hijau "Buka Hari Kerja".
  * Detail jadwal:
    * Senin – Kamis: `08.00 – 16.00 WITA`
    * Jumat: `08.00 – 11.30 WITA`
  * Informasi penting: "Melayani penerimaan LPLPO rutin serta distribusi darurat obat/BMHP untuk 28 fasilitas kesehatan jejaring se-Kabupaten Kotabaru."

### 4.2 Halaman `/profil`
* **Komponen:** Kartu Mandat & Jangkauan Logistik Wilayah
* **Elemen:**
  * Header kartu: Ikon perisai integritas (*ShieldCheck*), judul "Jangkauan Layanan Logistik".
  * Metrik utama (Grid 3 kolom / badge ringkas):
    * **28 Faskes** (Puskesmas & Jejaring Pelayanan)
    * **22 Kecamatan** (Daratan hingga Gugus Kepulauan)
    * **334+ Ribu Jiwa** (Penerima Manfaat Farmasi)
  * Kutipan Motto: *"Menjamin ketersediaan, pemerataan, dan keterjangkauan obat bermutu bagi seluruh masyarakat Kotabaru."*

### 4.3 Halaman `/stok` (via `public-stock-client-view.tsx`)
* **Komponen:** Kartu Transparansi & Tata Kelola Perbekalan
* **Elemen:**
  * Header kartu: Ikon paket/obat (*PackageCheck*), judul "Standar Data Stok Fisik".
  * Keterangan metodologi: "Data ketersediaan merupakan hasil opname fisik perbekalan farmasi gudang instalasi per akhir bulan (cut-off bulanan)."
  * Akses cepat: Panduan unduh berkas Excel resmi dan kategori perbekalan (Obat Program, Esensial, dan BMHP).

### 4.4 Halaman `/kontak`
* **Komponen:** Kartu Kanal Respon Cepat Pelayanan Publik
* **Elemen:**
  * Header kartu: Ikon obrolan/konsultasi (*MessageSquareText*), judul "Kanal Konsultasi & Pengaduan".
  * Tombol aksi cepat:
    * Tautan WhatsApp Petugas Pelayanan Farmasi (langsung terbuka ke chat).
    * Tautan Portal Pengaduan Resmi SP4N-LAPOR! Kotabaru.
  * Catatan respon: Petugas melayani konsultasi dan klarifikasi dokumen selama jam kerja operasional.

### 4.5 Halaman `/berita`
* **Komponen:** Kartu Keterbukaan Informasi & Pusat Warta
* **Elemen:**
  * Header kartu: Ikon surat kabar (*Newspaper*), judul "Pusat Informasi & Publikasi".
  * Sorotan topik warta:
    * Distribusi Logistik Wilayah Kepulauan
    * Program Pengendalian Penyakit & Obat Esensial
    * Informasi Mutu & Keamanan Sediaan Farmasi
  * Catatan: Pembaruan berkala kegiatan kedinasan UPTD Instalasi Farmasi Kotabaru.

---

## 5. Standar Visual & Bahasa Desain (Design Tokens)
* **Glassmorphism:** `rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl shadow-black/40`.
* **Tipografi:**
  * Judul kartu: `text-base font-semibold text-white`.
  * Deskripsi/Label: `text-xs text-zinc-300` atau `text-zinc-400`.
  * Angka Metrik: `text-2xl font-bold tracking-tight text-brand-300 font-mono`.
* **Aksen Warna:** Sesuai tema *Dark Ethereal* — `brand-400` (emerald) untuk aksen, indikator status, dan sorotan ikon.
* **Perilaku Responsif:** Kartu hanya ditampilkan pada layar desktop (`hidden lg:block`), sehingga di layar HP antarmuka tetap ringan dan efisien.

---

## 6. Rencana Verifikasi & Pengujian
1. **Pemeriksaan Tipe TypeScript:** Menjalankan verifikasi tipe melalui terminal (`npx tsc --noEmit`) untuk memastikan prop dan komponen bebas galat kompilasi.
2. **Uji Responsivitas Desktop & Mobile:** Memverifikasi tampilan pada viewport desktop (1440x900) dan mobile (390x844) untuk memastikan:
   * Kolom kanan ter-render sempurna di desktop tanpa overflow horizontal.
   * Tampilan di mobile tetap rapi, bersih, dan tidak terganggu elemen desktop.
3. **Pemeriksaan Seluruh Halaman Konsumen:** Memastikan kelima halaman (`/layanan`, `/profil`, `/stok`, `/kontak`, `/berita`) menampilkan kartu kontekstual masing-masing dengan data yang valid.

---

## 7. Narasi Capaian SKP e-Kinerja
> *"Mengembangkan tata letak responsif dua kolom dan panel informasi kontekstual pada bagian kepala (hero section) halaman publik website Profile IFK guna meningkatkan efisiensi penyampaian informasi dan keseimbangan visual bagi pengguna komputer/desktop."*
