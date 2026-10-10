# Buku Pedoman dan Petunjuk Penggunaan Aplikasi Web
## Sistem Informasi Profil & Ketersediaan Obat Instalasi Farmasi Kabupaten Kotabaru

Selamat datang di Buku Pedoman dan Petunjuk Penggunaan Resmi Aplikasi Web **Instalasi Farmasi Kabupaten (IFK) Kotabaru**. Dokumen ini disusun sebagai panduan praktis operasional bagi seluruh pemangku kepentingan—baik masyarakat umum, fasilitas pelayanan kesehatan (Puskesmas dan Klinik), maupun petugas pengelola/administrator IFK Kotabaru.

---

## Daftar Isi

- [Bab I: Pengenalan Aplikasi](#bab-i-pengenalan-aplikasi)
  - [1.1 Tentang Aplikasi Web IFK Kotabaru](#11-tentang-aplikasi-web-ifk-kotabaru)
  - [1.2 Akses dan Kompatibilitas Perangkat](#12-akses-dan-kompatibilitas-perangkat)
  - [1.3 Pembagian Peran Pengguna](#13-pembagian-peran-pengguna)
- [Bab II: Panduan Pengguna Publik dan Fasilitas Kesehatan](#bab-ii-panduan-pengguna-publik-dan-fasilitas-kesehatan)
  - [2.1 Navigasi Menu Utama](#21-navigasi-menu-utama)
  - [2.2 Portal Ketersediaan Obat Bulanan (`/stok`)](#22-portal-ketersediaan-obat-bulanan-stok)
    - [Membaca Kartu Ringkasan Ketersediaan](#membaca-kartu-ringkasan-ketersediaan)
    - [Pencarian Cepat Nama Obat](#pencarian-cepat-nama-obat)
    - [Penyaringan Berdasarkan Kategori dan Status](#penyaringan-berdasarkan-kategori-dan-status)
    - [Membaca Tabel Rincian Stok dan Periode Pembaruan](#membaca-tabel-rincian-stok-dan-periode-pembaruan)
  - [2.3 Portal Berita dan Edukasi Kefarmasian (`/berita`)](#23-portal-berita-dan-edukasi-kefarmasian-berita)
    - [Membaca Artikel dan Informasi](#membaca-artikel-dan-informasi)
    - [Membagikan Artikel ke Media Sosial](#membagikan-artikel-ke-media-sosial)
  - [2.4 Halaman Kontak dan Pengaduan Layanan](#24-halaman-kontak-dan-pengaduan-layanan)
- [Bab III: Petunjuk Operasional Administrator IFK](#bab-iii-petunjuk-operasional-administrator-ifk)
  - [3.1 Akses Masuk Akun (`/admin/login`) dan Keamanan Sesi](#31-akses-masuk-akun-adminlogin-dan-keamanan-sesi)
  - [3.2 Mengenal Dashboard Administrator](#32-mengenal-dashboard-administrator)
  - [3.3 Manajemen Publikasi Berita dan Artikel](#33-manajemen-publikasi-berita-dan-artikel)
    - [Menambah Berita Baru](#menambah-berita-baru)
    - [Memanfaatkan Fitur Pratinjau Langsung (Live Preview)](#memanfaatkan-fitur-pratinjau-langsung-live-preview)
    - [Menyimpan Draf vs Menerbitkan Artikel](#menyimpan-draf-vs-menerbitkan-artikel)
    - [Mengubah dan Menghapus Berita](#mengubah-dan-menghapus-berita)
  - [3.4 Manajemen Persediaan Obat (Modul Inti)](#34-manajemen-persediaan-obat-modul-inti)
    - [Siklus Periode Cut-Off Bulanan](#siklus-periode-cut-off-bulanan)
    - [Membuka Periode Baru Secara Mandiri](#membuka-periode-baru-secara-mandiri)
    - [Mengunggah Berkas Excel LPLPO (Impor Data)](#mengunggah-berkas-excel-lplpo-impor-data)
    - [Input dan Perubahan Data Obat Manual (Modal Form Responsif 50/50)](#input-dan-perubahan-data-obat-manual-modal-form-responsif-5050)
    - [Kalkulasi Otomatis Rata-rata Pemakaian dan Tingkat Ketersediaan (MoS)](#kalkulasi-otomatis-rata-rata-pemakaian-dan-tingkat-ketersediaan-mos)
    - [Mengunduh Rekapitulasi Data Stok (Ekspor Excel)](#mengunduh-rekapitulasi-data-stok-ekspor-excel)
    - [Prosedur Menghapus atau Mereset Periode Stok](#prosedur-menghapus-atau-mereset-periode-stok)
  - [3.5 Pengaturan Profil dan Kontak Instansi](#35-pengaturan-profil-dan-kontak-instansi)
- [Bab IV: Tanya Jawab Umum dan Solusi Kendala (FAQ)](#bab-iv-tanya-jawab-umum-dan-solusi-kendala-faq)
  - [Pertanyaan Seputar Portal Publik](#pertanyaan-seputar-portal-publik)
  - [Pertanyaan Seputar Panel Administrator](#pertanyaan-seputar-panel-administrator)
  - [Kontak Bantuan Pengelola Sistem](#kontak-bantuan-pengelola-sistem)

---

## Bab I: Pengenalan Aplikasi

### 1.1 Tentang Aplikasi Web IFK Kotabaru
Aplikasi Web Profil dan Sistem Informasi Ketersediaan Obat IFK Kotabaru adalah gerbang informasi resmi terintegrasi yang dikelola oleh Instalasi Farmasi Kabupaten Kotabaru, Dinas Kesehatan Kabupaten Kotabaru. 

Aplikasi ini bertujuan untuk:
1. **Transparansi Ketersediaan Obat:** Menyajikan data stok obat dan perbekalan kesehatan secara berkala kepada Puskesmas, fasilitas pelayanan kesehatan, dan masyarakat luas.
2. **Edukasi dan Informasi Kefarmasian:** Menyampaikan berita resmi, pedoman kefarmasian, dan penyuluhan obat yang valid.
3. **Kemudahan Komunikasi Layanan:** Membuka saluran kontak, alamat kantor, dan jam pelayanan resmi yang jelas dan terpercaya.

### 1.2 Akses dan Kompatibilitas Perangkat
Aplikasi ini berbasis peramban web modern (*web-based*) sehingga dapat dibuka langsung tanpa perlu menginstal aplikasi tambahan.

- **Dukungan Peramban:** Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, dan peramban ponsel bawaan.
- **Dukungan Perangkat:** 
  - **Ponsel Pintar (Smartphone):** Tampilan mobile yang ringkas, menu samping geser (*drawer*), dan kartu informasi yang nyaman dioperasikan satu tangan.
  - **Komputer / Laptop (Desktop):** Tampilan layar lebar dengan tata letak optimal, bilah navigasi penuh, dan modal formulir dua kolom (50/50).

### 1.3 Pembagian Peran Pengguna
Sistem membagi pengguna ke dalam dua kelompok hak akses:

1. **Pengguna Publik (Masyarakat & Faskes):** Akses terbuka tanpa login. Dapat melihat profil, layanan, membaca berita, membagikan artikel, melihat kontak, serta memantau dan mencari ketersediaan obat bulanan.
2. **Administrator (Petugas Pengelola IFK):** Akses terbatas menggunakan akun dan kata sandi di portal `/admin/login`. Bertugas mengelola berita publik, mengimpor berkas Excel LPLPO, mengedit stok, mengelola periode, dan memperbarui identitas instansi.

---

## Bab II: Panduan Pengguna Publik dan Fasilitas Kesehatan

Pengguna publik, petugas Puskesmas, maupun tenaga medis di faskes dapat memanfaatkan fitur-fitur berikut secara mandiri:

### 2.1 Navigasi Menu Utama
Di bagian atas halaman web (header), tersedia menu navigasi:
- **Beranda:** Menampilkan ringkasan profil, sambutan, layanan unggulan, berita terbaru, dan tautan cepat ke stok obat.
- **Profil:** Mengenal sejarah, visi-misi, tugas pokok dan fungsi, serta struktur organisasi IFK Kotabaru.
- **Layanan:** Informasi jenis-jenis pelayanan kefarmasian yang disediakan (distribusi obat puskesmas, cold chain, dll).
- **Stok Obat:** Portal pemantauan ketersediaan obat bulanan secara terbuka.
- **Berita:** Kumpulan artikel edukasi kesehatan dan informasi kegiatan kedinasan.
- **Kontak:** Alamat fisik kantor, peta lokasi, jam kerja, nomor telepon/WhatsApp, dan formulir pengiriman pesan.

> 💡 **Tips Pengguna Ponsel:** Di layar HP, ketuk ikon menu tiga garis (garis menu burger) di sudut kanan atas untuk membuka bilah menu navigasi.

---

### 2.2 Portal Ketersediaan Obat Bulanan (`/stok`)
Halaman ini adalah pusat transparansi ketersediaan perbekalan farmasi daerah.

#### Membaca Kartu Ringkasan Ketersediaan
Di bagian atas halaman, terdapat 4 kartu ringkasan interaktif:
1. **Total Perbekalan:** Menampilkan jumlah keseluruhan item obat yang terdaftar pada periode aktif.
2. **Stok Aman (Hijau):** Menunjukkan jumlah obat dengan tingkat kecukupan yang memadai.
3. **Stok Menipis (Kuning):** Menunjukkan jumlah obat yang mendekati batas minimum persediaan (perlu perencanaan pengadaan/pemantauan ketat).
4. **Stok Kosong (Merah):** Menunjukkan jumlah obat yang persediaannya sedang kosong di gudang farmasi.

> 💡 **Pintasan Cepat:** Ketuk salah satu kartu (misal kartu **Stok Menipis**) untuk langsung menyaring daftar tabel di bawahnya agar hanya menampilkan obat dengan status tersebut. Ketuk kembali kartu yang sama atau kartu **Total Perbekalan** untuk menampilkan semua obat.

#### Pencarian Cepat Nama Obat
1. Cari kotak isian bertuliskan *"Cari nama obat atau sediaan..."*.
2. Ketikkan kata kunci nama obat (contoh: *Paracetamol*, *Amoxicillin*, *Salep*, *Injeksi*).
3. Daftar tabel akan langsung menyaring hasil secara seketika (*real-time*) tanpa perlu memuat ulang halaman.

#### Penyaringan Berdasarkan Kategori dan Status
Selain pencarian teks, pengguna dapat menggunakan tombol penyaring:
- **Filter Status:** Memilih khusus *Semua Status*, *Aman*, *Menipis*, atau *Kosong*.
- **Filter Kategori:** Memilih kelompok obat tertentu seperti Obat Esensial, Antibiotik, Vaksin, BMHP (Bahan Medis Habis Pakai), dll.

#### Membaca Tabel Rincian Stok dan Periode Pembaruan
Setiap baris data obat pada tabel memuat informasi:
- **Nama Obat & Sediaan:** Nama lengkap item obat beserta bentuk sediaan dan kekuatannya.
- **Satuan:** Satuan terkecil pengeluaran (misal: Tablet, Botol, Vial, Ampul, Tube, Strip).
- **Status Ketersediaan:** Lencana warna penanda visual:
  - 🟢 **Aman:** Stok mencukupi kebutuhan pelayanan.
  - 🟡 **Menipis:** Sisa stok terbatas.
  - 🔴 **Kosong:** Persediaan sedang habis.
- **Sisa Stok:** Jumlah fisik persediaan yang tercatat pada penutupan buku (*cut-off*).
- **Keterangan Periode:** Di bagian atas tabel tertera informasi cut-off data (contoh: *Periode: September 2026*). Ini menandakan data merupakan posisi stok resmi pada akhir bulan bersangkutan.

---

### 2.3 Portal Berita dan Edukasi Kefarmasian (`/berita`)

#### Membaca Artikel dan Informasi
1. Masuk ke menu **Berita**.
2. Pilih artikel yang diminati dengan mengetuk judul atau kartu gambar artikel.
3. Halaman artikel akan menampilkan naskah lengkap, tanggal terbit, nama penulis/redaksi, serta estimasi waktu membaca.

#### Membagikan Artikel ke Media Sosial
Pada setiap artikel, terdapat bilah tombol berbagi (*Social Share Bar*):
- **WhatsApp:** Membuka aplikasi WhatsApp dan membuat pesan siap kirim berisi judul serta tautan artikel.
- **Telegram:** Mengirimkan tautan artikel langsung ke kontak atau grup Telegram.
- **Facebook:** Membuka jendela dialog berbagi Facebook.
- **Salin Tautan:** Menyalin alamat web artikel ke papan klip (*clipboard*). Setelah disalin, akan muncul tanda centang sebagai konfirmasi dan tautan dapat ditempelkan di media apa pun.

---

### 2.4 Halaman Kontak dan Pengaduan Layanan
Masyarakat dan faskes dapat berkomunikasi dengan pihak IFK Kotabaru melalui halaman **Kontak**:
- **Peta Lokasi & Alamat:** Mengetahui letak gudang farmasi IFK Kotabaru.
- **Jam Pelayanan:** Informasi hari dan jam buka operasional penerimaan tamu serta distribusi perbekalan.
- **Kirim Pesan:** Mengisi nama, email/nomor kontak, dan pesan pertanyaan/aduan untuk diteruskan kepada petugas pengelola.

---

## Bab III: Petunjuk Operasional Administrator IFK

Panduan ini ditujukan khusus bagi petugas pengelola yang memiliki wewenang mengelola konten dan data aplikasi di panel administrator.

### 3.1 Akses Masuk Akun (`/admin/login`) dan Keamanan Sesi
1. Buka peramban dan akses alamat: `https://[alamat-web]/admin/login`.
2. Masukkan **Username** dan **Password** yang telah didaftarkan.
3. Klik tombol **Masuk**.
4. Apabila kredensial benar, sistem akan mengarahkan petugas langsung ke Dashboard Administrator.

> ⚠️ **Catatan Penting Keamanan:**
> - Jangan pernah memberikan kata sandi administrator kepada pihak yang tidak berwenang.
> - Jika selesai bertugas, selalu klik tombol **Keluar (Logout)** di pojok kanan atas untuk mengakhiri sesi kerja, terutama saat menggunakan komputer bersama di kantor.

---

### 3.2 Mengenal Dashboard Administrator
Dashboard menampilkan ringkasan performa sistem secara seketika:
- **Statistik Konten:** Jumlah artikel yang terbit, jumlah draf berita, dan jumlah kategori artikel aktif.
- **Ringkasan Stok Terkini:** Periode aktif yang sedang tampil ke publik beserta jumlah obat berstatus Aman, Menipis, dan Kosong.
- **Menu Navigasi Samping (Sidebar):**
  - **Dashboard:** Halaman ikhtisar utama.
  - **Manajemen Berita:** Pengelolaan artikel informasi dan edukasi.
  - **Kategori Berita:** Pengelompokan topik artikel.
  - **Stok Obat:** Pengelolaan data persediaan obat bulanan.
  - **Pengaturan Profil:** Pembaruan informasi kontak dan identitas instansi.

---

### 3.3 Manajemen Publikasi Berita dan Artikel

#### Menambah Berita Baru
1. Di bilah menu samping, klik **Berita** lalu pilih tombol **Tambah Berita Baru**.
2. Isi formulir pembuatan berita:
   - **Judul Berita:** Ketikkan judul artikel yang jelas dan menarik.
   - **Kategori:** Pilih kategori yang sesuai (misal: *Edukasi Obat*, *Kegiatan Dinas*, *Pengumuman*).
   - **Gambar Sampul:** Unggah foto utama artikel (format PNG, JPG, atau WEBP).
   - **Isi Berita:** Tulis naskah berita menggunakan editor teks yang disediakan.

#### Memanfaatkan Fitur Pratinjau Langsung (Live Preview)
Sebelum mempublikasikan artikel, klik tombol **Pratinjau (Preview)**. Sistem akan menampilkan tampilan simulasi persis seperti yang akan dibaca oleh masyarakat di halaman publik. Periksa kembali kerapian paragraf dan gambar pendukung.

#### Menyimpan Draf vs Menerbitkan Artikel
- **Simpan sebagai Draf:** Klik opsi ini jika naskah berita masih dalam proses penulisan atau menunggu persetujuan pimpinan. Artikel draf **tidak akan terlihat** oleh publik.
- **Terbitkan Sekarang (Publish):** Klik tombol ini jika artikel sudah final. Artikel akan langsung tayang pada portal publik `/berita`.

#### Mengubah dan Menghapus Berita
- **Mengubah Berita:** Klik ikon pensil (**Edit**) pada baris artikel yang ingin diperbarui, lakukan perbaikan teks, lalu simpan perubahan.
- **Menghapus Berita:** Klik ikon tempat sampah (**Hapus**) jika berita sudah tidak relevan. Konfirmasikan dialog penghapusan.

---

### 3.4 Manajemen Persediaan Obat (Modul Inti)

Modul ini berada di menu **Stok Obat** (`/admin/stok`) dan merupakan fitur utama untuk menjaga kebaruan informasi perbekalan farmasi daerah.

#### Siklus Periode Cut-Off Bulanan
Data persediaan obat di IFK dikelola per **Periode Bulanan** (misal: *Januari 2026*, *Februari 2026*). 
- Hanya ada **1 (satu) periode aktif** yang ditayangkan ke publik pada waktu yang sama.
- Data periode sebelumnya tetap tersimpan rapi sebagai arsip histori.

#### Membuka Periode Baru Secara Mandiri
Saat pergantian bulan pelaporan (cut-off):
1. Buka halaman **Manajemen Stok Obat** di panel admin.
2. Klik tombol **Buat Periode Baru**.
3. Pilih bulan dan tahun pelaporan (contoh: *Oktober 2026*).
4. Klik **Simpan Periode**. Periode baru akan dibuat dan siap diisi data persediaan.

#### Mengunggah Berkas Excel LPLPO (Impor Data)
Petugas dapat memasukkan ratusan data obat sekaligus dalam hitungan detik menggunakan berkas Excel LPLPO:
1. Pastikan periode yang dituju sudah dipilih.
2. Klik tombol **Impor Excel / Unggah LPLPO**.
3. Pilih berkas Excel spreadsheet (`.xlsx` atau `.xls`) dari komputer.
4. Sistem akan membaca kolom-kolom utama:
   - Nama Obat / Sediaan
   - Satuan
   - Kategori
   - Stok Awal / Penerimaan / Pemakaian / Sisa Stok
5. Klik **Mulai Impor**. Sistem akan memvalidasi keutuhan data dan menampilkan laporan jumlah obat yang berhasil dimasukkan.

> ⚠️ **Catatan Penting Format Excel:**
> - Pastikan baris judul kolom (*header*) berada di baris pertama lembar kerja (*sheet*).
> - Pastikan tidak ada kolom angka yang bercampur dengan simbol aneh atau baris kosong di tengah data.

#### Input dan Perubahan Data Obat Manual (Modal Form Responsif 50/50)
Jika ingin menambah obat satuan atau memperbaiki angka stok per item:
1. Klik tombol **Tambah Obat** atau klik tombol **Edit** pada baris obat yang bersangkutan.
2. Dialog formulir responsif **dua kolom (50/50 di layar desktop)** akan terbuka:
   - **Kolom Kiri (Data Master):**
     - Nama Obat & Bentuk Sediaan
     - Kategori Obat
     - Satuan (Tablet, Botol, Ampul, dll)
     - Sisa Stok Fisik Akhir
   - **Kolom Kanan (Analisis Logistik):**
     - Rata-rata Pemakaian per Bulan
     - Estimasi Tingkat Ketersediaan (MoS)
     - Status Ketersediaan (Aman, Menipis, Kosong)
3. Tombol **Batal** dan **Simpan Data** berada di bagian bawah formulir dan selalu terlihat tanpa perlu menggulir halaman terlalu jauh.

#### Kalkulasi Otomatis Rata-rata Pemakaian dan Tingkat Ketersediaan (MoS)
Saat petugas mengisi atau mengubah nilai pada formulir obat:
- Sistem secara otomatis menghitung **Tingkat Ketersediaan (*Months of Supply* / MoS)** dengan rumus logistik standar:
  $$\text{Tingkat Ketersediaan (MoS)} = \frac{\text{Sisa Stok Fisik}}{\text{Rata-rata Pemakaian per Bulan}}$$
- **Rekomendasi Status Otomatis:**
  - Jika Sisa Stok = `0` ➔ Status otomatis **Kosong** (Merah).
  - Jika MoS < 3 bulan ➔ Status otomatis **Menipis** (Kuning).
  - Jika MoS ≥ 3 bulan ➔ Status otomatis **Aman** (Hijau).
- Petugas tetap memiliki kendali untuk menyesuaikan status secara manual jika terdapat kebijakan kedaruratan khusus.

#### Mengunduh Rekapitulasi Data Stok (Ekspor Excel)
Petugas dapat mengunduh seluruh data stok periode aktif untuk kebutuhan arsip dinas atau laporan fisik:
1. Pada halaman stok admin, klik tombol **Ekspor ke Excel**.
2. Peramban akan otomatis mengunduh berkas spreadsheet `.xlsx` berisi daftar obat, satuan, sisa stok, status ketersediaan, dan riwayat perhitungan.

#### Prosedur Menghapus atau Mereset Periode Stok
Jika terjadi kesalahan fatal dalam unggahan data (misal salah mengunggah berkas Excel bulan lain):
1. Pilih periode yang keliru.
2. Klik tombol **Hapus Periode / Reset Data**.
3. Sistem akan memunculkan dialog peringatan keamanan ganda untuk memastikan tindakan disengaja.
4. Konfirmasikan persetujuan. Seluruh item obat pada periode tersebut akan dibersihkan dan petugas dapat mengimpor ulang berkas yang benar.

---

### 3.5 Pengaturan Profil dan Kontak Instansi
Untuk memperbarui informasi kantor yang tampil di halaman publik:
1. Buka menu **Pengaturan Profil** di bilah samping.
2. Ubah data yang diperlukan:
   - Nama Instansi dan Deskripsi Singkat.
   - Jam Pelayanan Operasional (contoh: *Senin - Kamis: 08.00 - 16.00 WITA*).
   - Nomor Telepon Kantor dan Nomor WhatsApp Pelayanan.
   - Alamat Email Resmi Dinas.
   - Tautan Akun Media Sosial (Instagram, Facebook, YouTube).
3. Klik tombol **Simpan Pengaturan**. Perubahan akan langsung tampil di seluruh halaman publik seketika.

---

## Bab IV: Tanya Jawab Umum dan Solusi Kendala (FAQ)

### Pertanyaan Seputar Portal Publik

**Q: Mengapa nama obat yang saya cari tidak muncul di pencarian?**  
*Jawab:* Pastikan ejaan nama obat sudah benar. Cobalah mencari dengan kata dasar (contoh: ketik *Paracet* bukan *Paracetamol 500mg*). Jika masih tidak muncul, kemungkinan obat tersebut masuk dalam sediaan perbekalan kesehatan lain atau persediaannya sedang belum didaftarkan pada periode aktif.

**Q: Kapan data stok di halaman web diperbarui?**  
*Jawab:* Data stok diperbarui secara berkala setiap awal bulan mengikuti penutupan buku (*cut-off*) pelaporan LPLPO oleh pengelola Instalasi Farmasi Kabupaten Kotabaru. Anda dapat melihat tanggal/periode cut-off resmi di bagian keterangan tabel stok.

**Q: Apakah masyarakat umum bisa memesan atau meminta obat langsung melalui web ini?**  
*Jawab:* Tidak. Aplikasi web ini berfungsi sebagai sarana transparansi informasi dan pemantauan ketersediaan logistik daerah. Distribusi obat fisik tetap mengikuti prosedur resmi dinas kesehatan melalui Puskesmas dan fasilitas pelayanan kesehatan binaan.

---

### Pertanyaan Seputar Panel Administrator

**Q: Mengapa berkas Excel LPLPO gagal saat diimpor?**  
*Jawab:* Periksa hal-hal berikut:
1. Pastikan ekstensi berkas adalah `.xlsx` atau `.xls`.
2. Pastikan tidak ada *merged cell* (penggabungan sel) pada baris nama kolom.
3. Pastikan kolom angka persediaan hanya berisi angka, bukan huruf atau teks seperti *"nihil"*, *"strip"*, atau `"-"`. Ganti dengan angka `0`.

**Q: Bagaimana jika saya lupa kata sandi akun administrator?**  
*Jawab:* Demi keamanan, pemulihan kata sandi dilakukan secara internal oleh tim pengelola teknis IT dinas. Hubungi koordinator teknis sistem untuk mereset kata sandi Anda.

**Q: Apakah data periode bulan lalu akan hilang jika kita membuat periode baru?**  
*Jawab:* Tidak. Semua data periode lama tetap tersimpan utuh di sistem sebagai arsip historis. Anda selalu dapat memilih dan melihat kembali rekapitulasi data bulan-bulan sebelumnya melalui menu pilihan periode di panel admin.

---

### Kontak Bantuan Pengelola Sistem

Jika menemukan kendala teknis atau membutuhkan pendampingan operasional lebih lanjut, silakan menghubungi:
- **Instansi:** Instalasi Farmasi Kabupaten Kotabaru, Dinas Kesehatan Kab. Kotabaru
- **Unit Pengelola:** Tim Pengelola Data & Sistem Informasi Farmasi
- **Alamat Kantor:** Kabupaten Kotabaru, Kalimantan Selatan
- **Kanal Aduan Resmi:** Menu Kontak pada Aplikasi Web Profile IFK Kotabaru
