# Spesifikasi Desain: Buku Pedoman dan Petunjuk Penggunaan Aplikasi untuk End User

- **Tanggal Dokumen:** 2026-10-04
- **Kategori:** Dokumentasi & User Enablement (`docs`)
- **Status:** Approved by User (Ready for Plan & Implementation)
- **Target Rilis:** Branch `docs/user-manual-guide` -> `develop`

---

## 1. Latar Belakang & Tujuan

Aplikasi Web Profil & Sistem Informasi Ketersediaan Obat Instalasi Farmasi Kabupaten (IFK) Kotabaru telah memiliki seluruh modul inti yang beroperasi penuh, meliputi:
- Halaman informasi publik (Profil, Layanan, Kontak, Berita & Artikel Edukasi dengan fitur berbagi media sosial).
- Portal Ketersediaan Obat Publik (`/stok`) dengan filter interaktif, kartu ringkasan ketersediaan, dan pencarian cepat.
- Panel Administrator (`/admin`) untuk manajemen artikel berita, kategori, profil instansi, serta tata kelola data stok obat (impor Excel LPLPO, kalkulasi otomatis pemakaian bulanan/MoS, modal dialog responsif 50/50, ekspor Excel, dan manajemen periode cut-off).

Saat ini, repositori belum memiliki dokumentasi operasional pengguna akhir (*user guide/manual*). Dokumentasi yang tersedia saat ini terfokus pada spesifikasi teknis pengembang (`docs/superpowers/`) dan pemeliharaan server (`docs/ops/database-backup-restore.md`).

Tujuan penyusunan dokumen ini adalah:
1. Menyusun **Buku Pedoman dan Petunjuk Penggunaan Aplikasi** yang komprehensif, terstruktur, dan mudah dipahami oleh pengguna non-teknis dalam satu berkas terpusat (`docs/PANDUAN_PENGGUNAAN.md`).
2. Menghadirkan panduan praktis dua arah:
   - **Bagi Pengguna Publik & Faskes (Puskesmas/Klinik):** Memudahkan pemantauan ketersediaan obat bulanan dan pemanfaatan kanal informasi resmi.
   - **Bagi Administrator & Petugas Pengelola IFK:** Menjadi Standar Operasional Prosedur (SOP) digital dalam mengelola artikel berita dan memperbarui data persediaan obat setiap periode cut-off.
3. Memperbarui `README.md` repositori agar menautkan langsung buku panduan ini sehingga mudah ditemukan oleh stakeholder manapun.
4. Menjadi dokumen fisik/digital resmi yang dapat digunakan sebagai eviden pendukung kinerja (SKP PNS / e-Kinerja).

---

## 2. Prinsip Penulisan & Format Dokumen

1. **Format Komprehensif Tunggal:**
   - Disimpan pada berkas `docs/PANDUAN_PENGGUNAAN.md`.
   - Dilengkapi Daftar Isi (*Table of Contents*) interaktif dengan anchor link markdown agar pembaca dapat melompat ke bagian yang dibutuhkan secara instan.
2. **Bahasa Ramah Pengguna (*User-Friendly Tone*):**
   - Menggunakan Bahasa Indonesia formal, komunikatif, dan lugas.
   - Menghindari istilah teknis internal/backend (seperti database, SQL, Prisma, Next.js, migration, hydration). Seluruh fitur dijelaskan berdasarkan perilaku antarmuka yang terlihat pada layar.
3. **Format Instruksional Bertahap (1-2-3):**
   - Setiap panduan fitur dituliskan dalam langkah terurut yang jelas.
   - Menggunakan elemen pembeda visual:
     - `💡 Tips:` Kiat praktis untuk mempercepat penggunaan fitur.
     - `⚠️ Catatan Penting:` Hal yang wajib diperhatikan guna mencegah kekeliruan (misal: format kolom Excel, konfirmasi hapus periode).
4. **Perangkat yang Dicakup:**
   - Panduan mencakup cara penggunaan baik di layar komputer (*desktop*) maupun layar ponsel (*smartphone/mobile*).

---

## 3. Struktur & Kerangka Bab Rinci

Dokumen `docs/PANDUAN_PENGGUNAAN.md` akan disusun dengan struktur bab sebagai berikut:

### Bab I: Pengenalan Aplikasi
- **1.1 Tentang Sistem Informasi IFK Kotabaru:** Gambaran umum fungsi aplikasi sebagai sarana transparansi informasi publik dan keterbukaan ketersediaan obat.
- **1.2 Akses & Kompatibilitas:** Alamat situs resmi, rekomendasi peramban web modern (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge), dan dukungan responsif di HP/Desktop.
- **1.3 Peran Pengguna (Hak Akses):** Penjelasan perbedaan peran antara Pengguna Publik (akses terbuka) dan Petugas Administrator (memerlukan akun terdaftar).

### Bab II: Panduan Pengguna Publik & Fasilitas Kesehatan (Puskesmas / Klinik)
- **2.1 Navigasi Menu Utama:** Mengakses Beranda, Profil Instansi, Layanan Kefarmasian, Berita, Kontak, dan menu Stok Obat.
- **2.2 Portal Ketersediaan Obat Publik (`/stok`):**
  - **Membaca Kartu Ringkasan:** Memahami 4 indikator utama (Total Perbekalan, Stok Aman/Hijau, Stok Menipis/Kuning, Stok Kosong/Merah).
  - **Pencarian Cepat:** Mencari obat berdasarkan nama dagang atau nama generik.
  - **Penyaringan (Filter):** Memfilter obat berdasarkan status ketersediaan atau kategori obat.
  - **Membaca Tabel Ketersediaan:** Mengetahui nama obat, satuan, status lencana (*badge*), sisa stok, dan tanggal pembaruan data bulanan terakhir.
- **2.3 Portal Berita & Edukasi Kefarmasian (`/berita`):**
  - Membaca artikel informasi dan edukasi kesehatan terkini.
  - Fitur Berbagi Sosial: Membagikan artikel ke WhatsApp, Telegram, Facebook, atau menyalin tautan berita secara langsung.
- **2.4 Kontak Layanan & Pengaduan:** Cara melihat jam operasional, alamat kantor, mengirim pesan kontak, atau menghubungi layanan resmi IFK Kotabaru.

### Bab III: Petunjuk Operasional Administrator (Petugas Pengelola IFK)
- **3.1 Masuk Akun (*Login*) & Keamanan:**
  - Prosedur login di `/admin/login`.
  - Keamanan kata sandi dan sesi akun.
  - Prosedur keluar sistem (*logout*).
- **3.2 Mengenal Dashboard Administrator:** Membaca statistik ringkasan artikel, kategori aktif, dan status data obat.
- **3.3 Manajemen Artikel & Berita:**
  - Membuat artikel baru (judul, kategori, unggah foto sampul, isi berita).
  - Menggunakan fitur Pratinjau (*Live Preview*) sebelum penerbitan.
  - Status artikel (Draf vs Terbit/Publikasi).
  - Mengubah (*Edit*) dan Menghapus artikel lama.
- **3.4 Manajemen Ketersediaan Obat (Modul Inti):**
  - **Siklus Cut-Off Bulanan:** Memahami konsep data stok berbasis periode bulan/tahun.
  - **Membuka Periode Baru:** Langkah membuat periode baru (nama bulan dan tahun) secara mandiri.
  - **Impor Berkas Excel LPLPO:** Tata cara mengunggah dokumen Excel rekapitulasi obat bulanan, panduan format kolom standar yang dikenali sistem, dan validasi data otomatis.
  - **Input & Perubahan Manual Obat:** Menggunakan formulir dialog responsif 50/50 untuk memperbarui data stok awal, penerimaan, pemakaian, dan sisa stok.
  - **Kalkulasi Otomatis Sistem:** Cara sistem menghitung rata-rata pemakaian bulanan dan tingkat kecukupan stok (MoS / Months of Supply).
  - **Ekspor Laporan Excel:** Langkah mengunduh data stok periode berjalan ke dalam format spreadsheet Excel (`.xlsx`).
  - **Reset & Hapus Periode:** Prosedur aman menghapus/mengulang data periode apabila terjadi kesalahan unggah berkas.
- **3.5 Manajemen Profil & Pengaturan Instansi:**
  - Memperbarui identitas kantor, kontak telepon/WhatsApp resmi, alamat email, dan akun media sosial dinas.

### Bab IV: Tanya Jawab Umum & Pemecahan Masalah (*FAQ & Troubleshooting*)
- Mengapa data obat di halaman publik belum berubah setelah awal bulan? (Penjelasan alur pembaruan periode admin).
- Mengapa berkas Excel gagal diimpor? (Panduan pengecekan nama kolom dan ekstensi berkas).
- Lupa kata sandi admin atau akun terkunci.
- Nomor kontak bantuan pengelola teknis instansi.

---

## 4. Rencana Berkas yang Dibuat & Diubah

| Berkas | Aksi | Deskripsi |
|---|---|---|
| `docs/PANDUAN_PENGGUNAAN.md` | Dibuat | Berkas panduan operasional komprehensif lengkap. |
| `README.md` | Diperbarui | Menambahkan bagian tautan dokumentasi pengguna dan ringkasan fitur sistem. |

---

## 5. Kriteria Keberhasilan (*Acceptance Criteria*)

1. Dokumen `docs/PANDUAN_PENGGUNAAN.md` tersusun lengkap mencakup Bab I sampai Bab IV tanpa bagian tertunda (*placeholder/TBD*).
2. Teks bebas dari istilah teknis pemrograman/basis data tingkat rendah dan berfokus pada alur interaksi visual pengguna.
3. Berkas `README.md` terhubung rapi ke dokumen panduan operasional tersebut.
4. Berkas terkomit rapi pada branch `docs/user-manual-guide` dan siap diajukan ke Pull Request.
