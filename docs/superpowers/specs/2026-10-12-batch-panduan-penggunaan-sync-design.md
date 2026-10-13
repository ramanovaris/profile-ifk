# Spesifikasi Desain: Sinkronisasi Komprehensif Buku Panduan Penggunaan Aplikasi (Batch 8 Isu)

## Informasi Dokumen
- **Tanggal:** 2026-10-12
- **Nomor Isu Terkait:** #138, #140, #141, #143, #144, #145, #146, #147
- **Target Berkas:** `docs/PANDUAN_PENGGUNAAN.md`
- **Tujuan:** Menyelaraskan seluruh bab panduan operasional pengguna publik dan administrator dengan implementasi sistem informasi terkini IFK Kotabaru, standar kefarmasian Kemenkes (MoS), serta menghilangkan jargon teknis antarmuka.

---

## 1. Analisis Kebutuhan Berdasarkan Isu

### 1.1 Isu #138 — Metodologi Perhitungan Status Ketersediaan Obat (MoS)
- **Bab 2.2 (Panduan Publik):**
  - Jelaskan formula standar logistik Kemenkes: $\text{MoS} = \frac{\text{Sisa Stok Fisik Akhir}}{\text{Rata-rata Pemakaian Bulanan (RPB)}}$.
  - Definisikan ambang batas status:
    - *Kosong* (EMPTY): Sisa stok fisik $\le 0$.
    - *Menipis* (LOW / Perlu Pengadaan): MoS $< 3.0$ bulan (di bawah batas *buffer stock* dan *lead time* distribusi).
    - *Aman* (AVAILABLE): MoS $\ge 3.0$ bulan (mencukupi kebutuhan rutin faskes dan cadangan penyangga).
  - Kasus khusus (Edge Cases): Obat baru atau belum memiliki data RPB (RPB = 0 / kosong) berstatus *Tersedia* dengan validasi petugas.
  - Klasifikasi analitik lanjutan pada panel indikator: Kritis ($< 1$ bulan), Menipis ($1 - 3$ bulan), Aman ($3 - 18$ bulan), dan Melimpah ($> 18$ bulan).
- **Bab 3.4 (Panduan Admin):**
  - Selaraskan rumus kalkulasi MoS, batas aman 3.0 bulan, dan kebijakan pengisian data RPB.

### 1.2 Isu #140 — Penyelarasan Saluran Komunikasi & Hapus Referensi Form Pesan
- **Bab 2.1 & Bab 2.4:**
  - Hapus referensi formulir kirim pesan interaktif.
  - Dokumentasikan saluran komunikasi langsung riil: WhatsApp resmi, Email resmi dinas, Peta Lokasi & Alamat fisik, dan Jadwal Jam Pelayanan.

### 1.3 Isu #141 — Sinkronisasi Sidebar Admin & Penambahan Panduan Modul Pengguna dan Profil
- **Bab 3.2 (Mengenal Dashboard Administrator):**
  - Dokumentasikan 7 menu navigasi samping riil:
    1. Dashboard (`/admin/dashboard`)
    2. Manajemen Berita (`/admin/berita`)
    3. Kategori Berita (`/admin/kategori`)
    4. Stok Obat (`/admin/stok`)
    5. Manajemen Pengguna (`/admin/pengguna` — Khusus Super Admin)
    6. Profil Pengguna (`/admin/profil` — Profil akun operator aktif)
    7. Pengaturan Website (`/admin/pengaturan` — Konfigurasi instansi dan kontak)
- **Bab 3.6 (Baru): Manajemen Pengguna Sistem (Hak Akses Super Admin):**
  - Penambahan pengguna baru (username, nama lengkap, email, peran).
  - Penjelasan peran `ADMIN` (operator berita & stok) dan `SUPER_ADMIN` (pengelola penuh termasuk akun).
  - Prosedur reset kata sandi akun operator oleh Super Admin.
  - Prosedur nonaktifkan / hapus akun.
- **Bab 3.7 (Baru): Pengelolaan Profil Pribadi Operator:**
  - Pembaruan nama tampilan dan alamat email mandiri.
  - Perubahan kata sandi mandiri akun aktif (kata sandi lama, kata sandi baru, konfirmasi kata sandi).

### 1.4 Isu #143 — Penjelasan Field Status Publikasi pada Form Berita
- **Bab 3.3 (Menambah Berita Baru):**
  - Tambahkan butir penjelasan field **Status Publikasi** pada formulir berita.
  - Jelaskan opsi toggle: *Langsung Terbitkan* (tayang seketika ke publik) vs *Simpan Sebagai Draft* (disimpan internal tanpa tampil ke publik).

### 1.5 Isu #144 — Koreksi Nomenklatur Berkas Impor Stok (Laporan Ketersediaan Obat Bulanan)
- **Bab 3.4 & Bab IV (FAQ):**
  - Ganti istilah "berkas Excel LPLPO" menjadi "berkas Laporan Ketersediaan Obat Bulanan (Excel .xlsx/.xls atau CSV)".
  - Klarifikasi perbedaan LPLPO (lembar distribusi/permintaan faskes) dengan Laporan Ketersediaan Obat Bulanan (dokumen inventaris induk gudang).
  - Selaraskan alur UI riil: Tombol dropdown `Aksi Impor & Ekspor` $\rightarrow$ `Import CSV / Excel`, modal dialog `Import Data Stok Bulanan`.
  - Rinci 3 format berkas yang didukung parser: Format Kemenkes Obat Indikator, Format Obat Program (Detil Stok), dan Format Standar.

### 1.6 Isu #145 — Penghapusan Jargon Teknis Tata Letak 50/50
- **Bab 1.2 & Bab 3.4:**
  - Hapus frasa jargon desain seperti `(Modal Form Responsif 50/50)` dan `dua kolom (50/50 di layar desktop)`.
  - Ganti dengan bahasa operasional yang ramah pengguna akhir: `Input dan Perubahan Data Obat Manual` dan `Dialog formulir data obat akan terbuka`.

### 1.7 Isu #146 — Dokumentasi Lengkap Modul Pengaturan Website Multi-Tab
- **Bab 3.5 (Manajemen Pengaturan Website Multi-Tab):**
  - Rinci petunjuk operasional 5 tab antarmuka riil:
    1. *Identitas & Kontak*: Profil instansi, singkatan, tagline, kontak WhatsApp/telepon, email dinas, peta Google Maps embed.
    2. *Konten Profil UPTD*: Data pimpinan (nama, gelar, jabatan), unggah foto pimpinan, sambutan kepala, visi & misi, tupoksi, bagan struktur organisasi.
    3. *Tautan & Layanan*: Tautan eksternal (Dinkes, media sosial), konfigurasi banner pengumuman darurat/penting beranda.
    4. *Dokumen Layanan*: Tautan unduhan dokumen publik (blanko LPLPO rutin & permintaan khusus).
    5. *Statistik & SDM*: Indikator capaian beranda, komposisi tenaga kesehatan/SDM, luas sarana gudang.
  - Dokumentasikan mekanisme tombol Simpan dan Reset mandiri per tab.
  - Sertakan batasan unggah berkas gambar (PNG, JPG, WebP, maksimum 5MB).

### 1.8 Isu #147 — Penyesuaian Unit Pemulihan Kata Sandi FAQ
- **Bab IV (FAQ):**
  - Ubah penyebutan penanggung jawab pemulihan kata sandi admin dari `tim pengelola teknis IT dinas` menjadi `tim pengelola teknis IT IFK`.

---

## 2. Struktur Dokumen dan Penomoran Bab
Daftar Isi yang diselaraskan:
- Bab I: Pengenalan Aplikasi (1.1 - 1.3)
- Bab II: Panduan Pengguna Publik dan Fasilitas Kesehatan (2.1 - 2.4)
- Bab III: Petunjuk Operasional Administrator IFK
  - 3.1 Akses Masuk Akun (`/admin/login`) dan Keamanan Sesi
  - 3.2 Mengenal Dashboard Administrator
  - 3.3 Manajemen Publikasi Berita dan Artikel
  - 3.4 Manajemen Persediaan Obat (Modul Inti)
  - 3.5 Manajemen Pengaturan Website (Multi-Tab)
  - 3.6 Manajemen Akun Pengguna (Hak Akses Super Admin)
  - 3.7 Pengelolaan Profil Pribadi Operator
- Bab IV: Tanya Jawab Umum dan Solusi Kendala (FAQ)
