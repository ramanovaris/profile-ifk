# Design Spec: Modul Pengaturan Website Multi-Tab Admin (Dark Ethereal)

**Tanggal:** 2026-09-07  
**Penulis:** Tim Pengembang Profile IFK Kotabaru  
**Status:** In Review  
**Target:** 
- Navigasi Shell: `src/components/admin/admin-shell.tsx`
- Halaman Pengaturan: `src/app/(admin)/admin/pengaturan/page.tsx`

---

## 1. Problem Statement & Latar Belakang

1. **Konten Publik Masih 100% Hardcode**:
   - Seluruh data identitas instansi, nomor kontak, jam pelayanan, alamat, dan link peta saat ini tersimpan statis di `src/lib/dummy-data.ts` (`siteConfig`).
   - Konten profil instansi (Sambutan Kepala UPTD, Visi & Misi, Tupoksi) di `/profil` serta tautan layanan/pengaduan di `/kontak` dan footer ditulis langsung di dalam template JSX/TSX.
2. **Ketiadaan Modul Pengaturan di Panel Admin**:
   - Administrator belum memiliki antarmuka khusus untuk mengelola data identitas website, informasi profil lembaga, maupun tautan pengaduan eksternal.
   - Sidebar navigasi Admin Shell (`admin-shell.tsx`) belum menyediakan menu "Pengaturan".
3. **Kebutuhan Antarmuka Multi-Tab yang Terstruktur**:
   - Data pengaturan instansi cukup luas (identitas lembaga, kontak/lokasi, profil pimpinan, visi-misi, media sosial, hingga pengumuman darurat). Menggabungkan semuanya dalam satu halaman panjang akan membuat form terlalu padat dan membingungkan.
   - Diperlukan antarmuka **Multi-Tab** bertema **Dark Ethereal** yang modular, rapi, dan mudah dinavigasi baik di desktop maupun mobile.

---

## 2. Tujuan (Goals & Non-Goals)

### Goals
1. **Integrasi Navigasi Shell**:
   - Menambahkan menu navigasi "Pengaturan" pada sidebar desktop dan mobile drawer di `src/components/admin/admin-shell.tsx` dengan ikon `Settings` (`lucide-react`) mengarah ke `/admin/pengaturan`.
2. **Membangun Halaman `/admin/pengaturan` dengan Tema Dark Ethereal**:
   - Latar belakang ambient gelap `bg-zinc-950` yang menyatu dengan estetika admin IFK.
   - Kartu form berlatar `bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl`.
   - Standarisasi focus styling form: `border-brand-500/60 ring-2 ring-brand-500/40`.
3. **Arsitektur Horizontal Segmented Tab Bar**:
   - Navigasi tab horizontal bergaya kapsul segmented pill yang fleksibel dan dapat di-scroll horizontal pada layar sempit (`overflow-x-auto scrollbar-none`).
   - Indikator aktif dengan ambient brand glow (`border-brand-500/20 bg-brand-500/10 text-brand-400 shadow-sm shadow-brand-500/10`).
4. **Tiga Tab Pengaturan Terintegrasi**:
   - **Tab 1: Identitas & Kontak**: Nama instansi, inisial/singkatan, tagline, motto, alamat fisik, jam operasional, nomor telepon, WhatsApp, email dinas, dan embed Google Maps (disertai live iframe preview).
   - **Tab 2: Konten Profil UPTD**: Nama & jabatan Kepala UPTD, foto profil (mockup upload dengan preview rasio 3:4), naskah sambutan resmi, visi, butir-butir misi, dan ringkasan tupoksi.
   - **Tab 3: Tautan & Layanan**: URL portal SP4N LAPOR!, portal Dinkes Kotabaru, link media sosial (Instagram, Facebook, YouTube), serta kontrol Banner Pengumuman Darurat (toggle aktif & input teks pengumuman).
5. **Aksi Simpan & Feedback In-Page**:
   - Tombol "Simpan Perubahan" (`Save`) dan "Reset Form" (`RotateCcw`) pada setiap tab.
   - Banner notifikasi in-page sukses (`CheckCircle2`) bertema Dark Ethereal (tanpa `alert(...)` bawaan browser).
6. **Optimasi Responsif & Mobile Ergonomics**:
   - Perlindungan efek hover pada perangkat layar sentuh menggunakan `[@media(hover:hover)]` dan efek sentuh aktif `active:scale-[0.98]`.
   - Optimal pada review layar desktop maupun HP Android Chrome "Desktop site" mode (`md+` / `1024px+`).

### Non-Goals
- Menghubungkan penyimpanan permanen ke database SQL/PostgreSQL (menggunakan state React lokal yang diinisialisasi dari `siteConfig` & data dummy profil, menyiapkan fondasi skema data untuk backend API selanjutnya).
- Unggah file gambar fisik ke cloud storage (fitur upload foto kepala instansi menggunakan mock file selector dengan preview Object URL lokal).

---

## 3. Spesifikasi Arsitektur & Antarmuka

### 3.1. Navigasi Sidebar Admin (`admin-shell.tsx`)
Menambahkan item menu pada array `sidebarLinks`:
```ts
{ href: "/admin/pengaturan", label: "Pengaturan", icon: Settings }
```
Diletakkan setelah menu "Profil" sehingga urutan navigasi menjadi:
1. Dashboard
2. Berita
3. Kategori
4. Pengguna
5. Profil
6. **Pengaturan**

---

### 3.2. Header Halaman & Segmented Tab Bar
- **Breadcrumb**: `Dashboard` > `Pengaturan Website`.
- **Title Bar**:
  - Judul: "Pengaturan Website" (`text-xl sm:text-2xl font-bold tracking-tight text-white`).
  - Badge Ambient: `System Config` (`bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium`).
  - Deskripsi: "Kelola identitas instansi, konten profil publik, kontak, dan tautan layanan." (`text-xs sm:text-sm text-zinc-400 mt-1`).
- **Segmented Tab Bar**:
  - Container: `inline-flex p-1.5 rounded-xl bg-zinc-900/70 border border-white/5 backdrop-blur-xl gap-1.5 overflow-x-auto max-w-full`.
  - 3 Opsi Tab:
    1. `identitas`: Ikon `Building2`, Label "Identitas & Kontak".
    2. `profil`: Ikon `FileText`, Label "Konten Profil".
    3. `tautan`: Ikon `Link2`, Label "Tautan & Layanan".

---

### 3.3. Tab 1: Identitas & Kontak Instansi
Terbagi menjadi 2 kartu modular (`space-y-6`):
1. **Kartu Identitas Lembaga**:
   - `name`: Nama Resmi Instansi (contoh: *UPTD Instalasi Farmasi Kab. Kotabaru*).
   - `shortName`: Nama Pendek / Inisial (contoh: *IFK Kotabaru*).
   - `tagline`: Slogan Singkat (contoh: *Stok Valid, Team Solid*).
   - `motto`: Motto Pelayanan (contoh: *Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat*).
2. **Kartu Kontak & Lokasi**:
   - `address`: Alamat Lengkap (Textarea 3 baris).
   - `operationalHours`: Jam Pelayanan (Textarea 2 baris).
   - `phone` & `whatsappLink`: Nomor Telepon Kantor & Tautan WhatsApp Pelayanan.
   - `email`: Alamat Email Resmi Dinas.
   - `googleMapsEmbedUrl`: URL Iframe Embed Google Maps.
   - **Mini Map Preview**: Box rasio 16:9 dengan iframe pratinjau langsung, dilengkapi tombol validasi buka link peta di tab baru.

---

### 3.4. Tab 2: Konten Profil UPTD
Terbagi menjadi 2 kartu modular (`space-y-6`):
1. **Kartu Pimpinan & Sambutan Resmi**:
   - Layout 2 kolom (`grid gap-6 md:grid-cols-[200px_1fr]`):
     - Kolom Kiri: Foto Kepala UPTD rasio 3:4 berbingkai `rounded-xl border border-white/10 overflow-hidden relative aspect-[3/4] bg-zinc-950`. Dilengkapi tombol ganti foto mockup (`Upload` / `Camera`).
     - Kolom Kanan:
       - Nama Lengkap & Gelar Pimpinan (contoh: *apt. H. Muhammad Yusuf, S.Farm*).
       - Jabatan Resmi (contoh: *Kepala UPTD Instalasi Farmasi Kab. Kotabaru*).
       - Naskah Sambutan (Textarea multi-baris untuk salam pembuka, komitmen mutu, dan penutup).
2. **Kartu Visi, Misi & Tupoksi**:
   - Pernyataan Visi Lembaga (Textarea 2 baris).
   - Butir-Butir Misi (Textarea per baris atau list dinamis butir misi pelayanan).
   - Ringkasan Tugas Pokok & Fungsi (Tupoksi) Instansi.

---

### 3.5. Tab 3: Tautan & Layanan
Terbagi menjadi 2 kartu modular (`space-y-6`):
1. **Kartu Integrasi Portal & Media Sosial**:
   - URL SP4N LAPOR! (contoh: `https://www.lapor.go.id`).
   - URL Portal Dinas Kesehatan Kabupaten Kotabaru.
   - Media Sosial:
     - Akun Instagram (URL).
     - Akun Facebook (URL).
     - Channel YouTube (URL).
2. **Kartu Banner Pengumuman Darurat / Pengumuman Publik**:
   - Toggle Switch: Status Banner Pengumuman (*Aktif / Non-Aktif*).
   - Tipe Banner: Pilihan badge (*Informasi*, *Penting*, *Peringatan*).
   - Teks Pesan Pengumuman: Input teks pesan yang akan tampil di atas navbar halaman publik jika diaktifkan.

---

### 3.6. Aksi & Notifikasi Feedback
- Di setiap akhir kartu atau di bar bawah:
  - Tombol **"Simpan Perubahan"**: `bg-brand-500 hover:bg-brand-400 text-zinc-950 font-semibold shadow-lg shadow-brand-500/20` dengan ikon `Save`.
  - Tombol **"Reset Form"**: `border border-white/10 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300` dengan ikon `RotateCcw`.
- Banner Feedback Sukses:
  - Muncul di atas tab aktif saat tombol simpan ditekan:
  - Kotak hijau ambient `bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 flex items-center justify-between animate-in fade-in`.

---

## 4. Rencana Pengujian & Verifikasi

1. **Pengujian Responsif**:
   - Periksa navigasi tab di layar sempit mobile (<640px) memastikan scroll horizontal tab berjalan mulus tanpa terpotong.
   - Periksa form grid di mode Desktop site HP Android Chrome (`md+` / `1024px+`) memastikan tidak ada layout shift.
2. **Pengujian Interaksi State**:
   - Memastikan perpindahan tab berjalan instan dan mempertahankan data form yang sedang diedit.
   - Memastikan perubahan URL embed map langsung merefleksikan pratinjau peta.
   - Memastikan tombol simpan memicu in-page alert banner sukses dengan data terbarukan.
3. **Verifikasi Kualitas Kode & CI/CD**:
   - Mengikuti aturan ketat: Tidak menjalankan `npm run build` atau `lint` di VPS lokal.
   - Mendorong perubahan melalui branch feature baru (`feat/admin-settings-multi-tab`) dan membuat Pull Request ke `develop`.
   - Mengonfirmasi seluruh pengecekan di runner GitHub Actions (*Type Check*, *ESLint*, *Build*) berstatus PASS.
