# Spesifikasi Desain: Implementasi Halaman 404 Kustom & Penanganan Error Ramah Pengguna

- **Tanggal Dokumen:** 2026-10-04
- **Terkait Issue:** [#113](https://github.com/ramanovaris/profile-ifk/issues/113)
- **Status:** Approved by User (Ready for Implementation)
- **Target Rilis:** Branch `feat/113-custom-404-error-pages` -> `develop`

---

## 1. Latar Belakang & Tujuan

Saat pengunjung atau staf mengakses URL yang tidak terdaftar, artikel warta yang telah dihapus, atau mengalami galat tak terduga (*runtime exception*), tampilan bawaan (*default*) Next.js menampilkan pesan teknis sederhana berbahasa Inggris yang kaku. Hal ini mengurangi kredibilitas situs resmi instansi pemerintah dan membingungkan masyarakat umum.

Tujuan implementasi ini adalah:
1. Menyediakan halaman **404 (Not Found)** global bertema resmi UPTD Instalasi Farmasi Kab. Kotabaru (*Clean Light*) yang informatif dan ramah pengguna.
2. Menyediakan halaman **Error Boundary** untuk area publik (`(public)/error.tsx`) dengan opsi pemulihan (*recovery action*) seperti tombol "Coba Lagi" dan "Kembali ke Beranda".
3. Menyediakan halaman **Error Boundary** khusus area admin (`admin/error.tsx`) bertema *Dark Ethereal* yang selaras dengan tema panel admin operasional, tanpa membocorkan rincian sensitif sistem.
4. Memastikan seluruh tampilan responsif sempurna pada layar ponsel maupun desktop.

---

## 2. Arsitektur Teknis & Struktur Berkas

Mengadopsi pola **Dual-Layout** yang disetujui pengguna:

### A. Struktur Berkas yang Dibuat / Disesuaikan

```
src/
├── app/
│   ├── not-found.tsx               # Global 404 Not Found (Clean Light, branding resmi IFK)
│   ├── (public)/
│   │   └── error.tsx               # Error Boundary publik ("use client", Clean Light)
│   └── (admin)/
│       └── admin/
│           └── error.tsx           # Error Boundary admin ("use client", Dark Ethereal)
```

---

## 3. Spesifikasi Rinci Antarmuka & UX

### A. Halaman Global 404 Not Found (`src/app/not-found.tsx`)
- **Tipe Komponen:** Server / Static Component (kompatibel penuh dengan App Router global root).
- **Nuansa & Tema:** *Clean Light* (latar belakang bersih dengan sentuhan emerald/teal khas IFK Kotabaru, selaras dengan layout publik).
- **Elemen Antarmuka:**
  1. **Header Identitas:** Logo resmi dan nama UPTD Instalasi Farmasi Kabupaten Kotabaru.
  2. **Indikator Visual:** Angka status besar "404" dengan badge "Halaman Tidak Ditemukan", disertai ikon simbolik `FileQuestion` / `SearchX`.
  3. **Pesan Ramah Pengguna:** Penjelasan singkat bahwa tautan yang dituju mungkin salah ketik, telah dipindahkan, atau artikel tidak lagi tersedia.
  4. **Aksi Navigasi Cepat:**
     - Tombol Utama: **"Kembali ke Beranda"** (menuju `/`, tombol emerald berkilau dengan ikon `Home`).
     - Tombol Sekunder: **"Cek Ketersediaan Obat"** (menuju `/stok`, tombol outline dengan ikon `Pill`).
     - Tautan Bantuan: Tautan menuju halaman `/kontak` jika pengguna membutuhkan informasi lebih lanjut.
  5. **Responsivitas:** Optimal di layar ponsel (`px-4 py-8`) dengan ukuran font terukur agar tidak terjadi overflow teks pada layar sempit.

---

### B. Error Boundary Publik (`src/app/(public)/error.tsx`)
- **Tipe Komponen:** Client Component (`"use client"` wajib untuk Next.js Error Boundary).
- **Props:** `{ error: Error & { digest?: string }, reset: () => void }`.
- **Nuansa & Tema:** *Clean Light* (senada dengan warna tema publik).
- **Elemen Antarmuka:**
  1. **Indikator Visual:** Ikon `AlertTriangle` beraksen amber/merah halus dengan wadah melingkar lembut.
  2. **Pesan Status:** Judul *"Terjadi Kendala Memuat Halaman"* dan pesan penenang bagi masyarakat bahwa tim teknis sedang menangani kendala.
  3. **Aksi Pemulihan:**
     - Tombol Primer: **"Coba Lagi"** (menjalankan fungsi `reset()` untuk memicu re-render rute tanpa reload total).
     - Tombol Sekunder: **"Kembali ke Beranda"** (menuju `/`).
  4. **Keamanan Data:** Rincian teks error teknis mentah disembunyikan dari pengunjung publik; hanya kode referensi `digest` (jika ada) yang ditampilkan samar untuk mempermudah pelaporan.

---

### C. Error Boundary Panel Admin (`src/app/(admin)/admin/error.tsx`)
- **Tipe Komponen:** Client Component (`"use client"`).
- **Props:** `{ error: Error & { digest?: string }, reset: () => void }`.
- **Nuansa & Tema:** *Dark Ethereal* (latar belakang `bg-slate-950`, kartu `bg-slate-900/80 border-slate-800`, teks primer `text-slate-100`, aksen emerald).
- **Elemen Antarmuka:**
  1. **Header Admin:** Identitas panel operasional IFK.
  2. **Indikator Visual:** Ikon `ShieldAlert` atau `AlertCircle` bernuansa gelap elegan.
  3. **Pesan Status:** *"Terjadi Kesalahan pada Panel Administrasi"*.
  4. **Aksi Pemulihan Staf:**
     - Tombol Primer: **"Coba Muat Ulang"** (`reset()`).
     - Tombol Sekunder: **"Kembali ke Dashboard"** (`/admin/dashboard`).
  5. **Kode Digest:** Menampilkan ringkasan singkat `digest` galat untuk mempermudah investigasi admin/pengembang tanpa mengekspos credential basis data.

---

## 4. Strategi Pengujian & Verifikasi

1. **Pengujian Halaman 404 URL Sembarang:**
   - Mengakses rute yang tidak ada via HTTP GET (misal: `/profile-ifk/halaman-acak-404`).
   - Memastikan respons HTTP berstatus 404 dan antarmuka memuat komponen kustom IFK (bukan default Next.js).
2. **Pengujian 404 Rute Dinamis Berita:**
   - Mengakses artikel fiktif (misal: `/profile-ifk/berita/artikel-pasti-tidak-ada-999`).
   - Memastikan fungsi `notFound()` memicu render halaman 404 kustom.
3. **Pengujian Tampilan & Tombol Responsif:**
   - Menguji keterbacaan di layar ponsel dan fungsionalitas tombol navigasi menuju `/` dan `/stok`.
4. **Pemberlakuan Hemat Memori VPS:**
   - Tidak menjalankan `next build` atau `tsc` di VPS lokal. Pengujian dilakukan melalui verifikasi respons HTTP via skrip ringan `tsx` dan review langsung pada dev server port 3003.
