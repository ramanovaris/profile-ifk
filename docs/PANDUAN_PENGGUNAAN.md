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
    - [Metodologi Perhitungan Status Ketersediaan (Months of Supply / MoS)](#metodologi-perhitungan-status-ketersediaan-months-of-supply--mos)
    - [Pencarian Cepat Nama Obat](#pencarian-cepat-nama-obat)
    - [Penyaringan Berdasarkan Kategori dan Status](#penyaringan-berdasarkan-kategori-dan-status)
    - [Membaca Tabel Rincian Stok dan Periode Pembaruan](#membaca-tabel-rincian-stok-dan-periode-pembaruan)
  - [2.3 Portal Berita dan Edukasi Kefarmasian (`/berita`)](#23-portal-berita-dan-edukasi-kefarmasian-berita)
    - [Membaca Artikel dan Informasi](#membaca-artikel-dan-informasi)
    - [Membagikan Artikel ke Media Sosial](#membagikan-artikel-ke-media-sosial)
  - [2.4 Halaman Kontak dan Layanan Komunikasi](#24-halaman-kontak-dan-layanan-komunikasi)
- [Bab III: Petunjuk Operasional Administrator IFK](#bab-iii-petunjuk-operasional-administrator-ifk)
  - [3.1 Akses Masuk Akun (`/admin/login`) dan Keamanan Sesi](#31-akses-masuk-akun-adminlogin-dan-keamanan-sesi)
  - [3.2 Mengenal Dashboard Administrator](#32-mengenal-dashboard-administrator)
  - [3.3 Manajemen Publikasi Berita dan Artikel](#33-manajemen-publikasi-berita-dan-artikel)
    - [Menambah Berita Baru](#menambah-berita-baru)
    - [Penjelasan Field Status Publikasi](#penjelasan-field-status-publikasi)
    - [Memanfaatkan Fitur Pratinjau Langsung (Live Preview)](#memanfaatkan-fitur-pratinjau-langsung-live-preview)
    - [Menyimpan Draf vs Menerbitkan Artikel](#menyimpan-draf-vs-menerbitkan-artikel)
    - [Mengubah dan Menghapus Berita](#mengubah-dan-menghapus-berita)
  - [3.4 Manajemen Persediaan Obat (Modul Inti)](#34-manajemen-persediaan-obat-modul-inti)
    - [Siklus Periode Cut-Off Bulanan](#siklus-periode-cut-off-bulanan)
    - [Membuka Periode Baru Secara Mandiri](#membuka-periode-baru-secara-mandiri)
    - [Mengunggah Berkas Laporan Ketersediaan Obat Bulanan (Impor Data)](#mengunggah-berkas-laporan-ketersediaan-obat-bulanan-impor-data)
    - [Input dan Perubahan Data Obat Manual](#input-dan-perubahan-data-obat-manual)
    - [Kalkulasi Otomatis Rata-rata Pemakaian dan Tingkat Ketersediaan (MoS)](#kalkulasi-otomatis-rata-rata-pemakaian-dan-tingkat-ketersediaan-mos)
    - [Mengunduh Rekapitulasi Data Stok (Ekspor Excel)](#mengunduh-rekapitulasi-data-stok-ekspor-excel)
    - [Prosedur Menghapus atau Mereset Periode Stok](#prosedur-menghapus-atau-mereset-periode-stok)
  - [3.5 Manajemen Pengaturan Website (Multi-Tab)](#35-manajemen-pengaturan-website-multi-tab)
    - [Tab 1: Identitas & Kontak](#tab-1-identitas--kontak)
    - [Tab 2: Konten Profil UPTD](#tab-2-konten-profil-uptd)
    - [Tab 3: Tautan & Layanan](#tab-3-tautan--layanan)
    - [Tab 4: Dokumen Layanan](#tab-4-dokumen-layanan)
    - [Tab 5: Statistik & SDM](#tab-5-statistik--sdm)
    - [Mekanisme Penyimpanan dan Reset Mandiri Per Tab](#mekanisme-penyimpanan-dan-reset-mandiri-per-tab)
  - [3.6 Manajemen Akun Pengguna (Hak Akses Super Admin)](#36-manajemen-akun-pengguna-hak-akses-super-admin)
    - [Menambah Akun Operator Baru](#menambah-akun-operator-baru)
    - [Tingkatan Peran Pengguna (Admin vs Super Admin)](#tingkatan-peran-pengguna-admin-vs-super-admin)
    - [Mengubah Peran dan Reset Kata Sandi Akun](#mengubah-peran-dan-reset-kata-sandi-akun)
    - [Menghapus atau Menonaktifkan Akun](#menghapus-atau-menonaktifkan-akun)
  - [3.7 Pengelolaan Profil Pribadi Operator](#37-pengelolaan-profil-pribadi-operator)
    - [Memperbarui Nama Tampilan dan Identitas Mandiri](#memperbarui-nama-tampilan-dan-identitas-mandiri)
    - [Mengubah Kata Sandi Akun Mandiri](#mengubah-kata-sandi-akun-mandiri)
- [Bab IV: Tanya Jawab Umum dan Solusi Kendala (FAQ)](#bab-iv-tanya-jawab-umum-dan-solusi-kendala-faq)
  - [Pertanyaan Seputar Portal Publik](#pertanyaan-seputar-portal-publik)
  - [Pertanyaan Seputar Panel Administrator](#pertanyaan-seputar-panel-administrator)
  - [Kontak Bantuan Pengelola Sistem](#kontak-bantuan-pengelola-sistem)

---

## Bab I: Pengenalan Aplikasi

### 1.1 Tentang Aplikasi Web IFK Kotabaru
Aplikasi Web Profil dan Sistem Informasi Ketersediaan Obat IFK Kotabaru adalah gerbang informasi resmi terintegrasi yang dikelola oleh Instalasi Farmasi Kabupaten Kotabaru, Dinas Kesehatan Kabupaten Kotabaru. 

Aplikasi ini bertujuan untuk:
1. **Transparansi Ketersediaan Obat:** Menyajikan data stok obat dan perbekalan kesehatan secara berkala kepada Puskesmas, fasilitas pelayanan kesehatan, dan masyarakat luas berbasis metodologi logistik standar Kementerian Kesehatan.
2. **Edukasi dan Informasi Kefarmasian:** Menyampaikan berita resmi, pedoman kefarmasian, dan penyuluhan obat yang valid.
3. **Kemudahan Komunikasi Layanan:** Membuka saluran kontak resmi, alamat kantor, jadwal operasional, dan tautan konsultasi langsung yang terpercaya.

### 1.2 Akses dan Kompatibilitas Perangkat
Aplikasi ini berbasis peramban web modern (*web-based*) sehingga dapat dibuka langsung tanpa perlu menginstal aplikasi tambahan.

- **Dukungan Peramban:** Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, dan peramban ponsel bawaan.
- **Dukungan Perangkat:** 
  - **Ponsel Pintar (Smartphone):** Tampilan mobile yang ringkas, menu samping geser (*drawer*), dan kartu informasi yang nyaman dioperasikan satu tangan.
  - **Komputer / Laptop (Desktop):** Tampilan layar lebar dengan tata letak optimal, bilah navigasi penuh, serta formulir pengisian data yang nyaman dan efisien dioperasikan.

### 1.3 Pembagian Peran Pengguna
Sistem membagi pengguna ke dalam kelompok hak akses:

1. **Pengguna Publik (Masyarakat & Faskes):** Akses terbuka tanpa login. Dapat melihat profil instansi, jenis layanan, membaca berita, membagikan artikel, melihat kontak resmi, serta memantau dan mencari ketersediaan obat bulanan.
2. **Operator Administrator (`ADMIN`):** Bertugas mengelola publikasi berita, kategori artikel, serta mengelola data persediaan obat bulanan (impor laporan, perbaikan stok, ekspor data).
3. **Super Administrator (`SUPER_ADMIN`):** Memiliki seluruh kewenangan Administrator ditambah wewenang mengelola akun pengguna (menambah, mengubah peran, mereset sandi, menghapus akun) dan mengelola konfigurasi kelembagaan pada modul Pengaturan Website.

---

## Bab II: Panduan Pengguna Publik dan Fasilitas Kesehatan

Pengguna publik, petugas Puskesmas, maupun tenaga medis di faskes dapat memanfaatkan fitur-fitur berikut secara mandiri:

### 2.1 Navigasi Menu Utama
Di bagian atas halaman web (header), tersedia menu navigasi:
- **Beranda:** Menampilkan ringkasan profil, sambutan kepala UPTD, layanan unggulan, berita terbaru, dan tautan cepat ke portal stok obat.
- **Profil:** Mengenal sejarah, visi-misi, tugas pokok dan fungsi (tupoksi), pimpinan, serta struktur organisasi IFK Kotabaru.
- **Layanan:** Informasi jenis-jenis pelayanan kefarmasian yang disediakan (distribusi obat Puskesmas, pengelolaan rantai dingin/cold chain, dsb).
- **Stok Obat:** Portal pemantauan ketersediaan obat bulanan secara terbuka.
- **Berita:** Kumpulan artikel edukasi kesehatan dan informasi kegiatan kedinasan.
- **Kontak:** Alamat fisik kantor, peta lokasi, jam operasional pelayanan, nomor WhatsApp resmi, dan email dinas.

> 💡 **Tips Pengguna Ponsel:** Di layar HP, ketuk ikon menu tiga garis (menu burger) di sudut kanan atas untuk membuka bilah navigasi.

---

### 2.2 Portal Ketersediaan Obat Bulanan (`/stok`)
Halaman ini adalah pusat transparansi ketersediaan perbekalan farmasi daerah.

#### Membaca Kartu Ringkasan Ketersediaan
Di bagian atas halaman, terdapat 4 kartu ringkasan interaktif:
1. **Total Perbekalan:** Menampilkan jumlah keseluruhan item obat yang terdaftar pada periode aktif.
2. **Stok Aman (Hijau):** Menunjukkan jumlah obat dengan tingkat kecukupan yang memadai untuk pelayanan rutin.
3. **Stok Menipis (Kuning):** Menunjukkan jumlah obat yang berada di bawah batas aman persediaan (dalam prioritas pemantauan dan pengadaan).
4. **Stok Kosong (Merah):** Menunjukkan jumlah obat yang persediaannya sedang kosong di gudang farmasi.

> 💡 **Pintasan Cepat:** Ketuk salah satu kartu (misal kartu **Stok Menipis**) untuk langsung menyaring daftar tabel di bawahnya agar hanya menampilkan obat dengan status tersebut. Ketuk kembali kartu yang sama atau kartu **Total Perbekalan** untuk menampilkan semua obat.

#### Metodologi Perhitungan Status Ketersediaan (Months of Supply / MoS)
Status ketersediaan obat pada aplikasi tidak sekadar ditentukan dari kuantitas fisik mutlak semata, melainkan dihitung secara ilmiah menggunakan rasio kecukupan logistik farmasi standar Kementerian Kesehatan RI, yaitu **Months of Supply (MoS)** atau **Tingkat Kecukupan Stok (bulan)**:

$$\text{MoS} = \frac{\text{Sisa Stok Fisik Akhir}}{\text{Rata-rata Pemakaian Bulanan (RPB)}}$$

**Kriteria Ambang Batas Status:**
- 🔴 **Kosong (EMPTY):** Sisa stok fisik $\le 0$. Persediaan obat habis total di gudang IFK (sedang dalam proses perencanaan atau distribusi pengadaan).
- 🟡 **Menipis (LOW / Perlu Pengadaan):** Nilai MoS $< 3.0$ bulan. Sisa persediaan berada di bawah batas aman akumulasi cadangan penyangga (*buffer stock*) dan waktu tunggu pengadaan (*lead time*), sehingga memerlukan pemantauan ketat serta usulan pengadaan perbekalan.
- 🟢 **Aman (AVAILABLE):** Nilai MoS $\ge 3.0$ bulan. Persediaan mencukupi kebutuhan pelayanan rutin fasilitas kesehatan beserta cadangan penyangga daerah.

**Penanganan Kasus Khusus (Edge Cases):**
- **Item Obat Baru / Data RPB Belum Tercatat:** Jika data rata-rata pemakaian bulanan belum tersedia (RPB = 0 atau kosong), status persediaan ditampilkan sebagai **Tersedia** berdasarkan ketersediaan fisik siap salur, dengan verifikasi berkala oleh petugas pengelola farmasi.

**Klasifikasi Visual Lanjutan pada Panel Indikator:**
Pada bagian bawah tabel stok, disediakan panduan indikator analitik:
- **Melimpah (Biru Langit):** Stok melebihi estimasi pemakaian 18 bulan ($> 18$ bulan).
- **Aman (Hijau Emerald):** Rentang ideal ketersediaan logistik farmasi ($3 - 18$ bulan).
- **Menipis (Kuning Amber):** Perbekalan terbatas, dalam prioritas pemantauan ($1 - 3$ bulan).
- **Kritis (Merah Rose):** Stok sangat minim di bawah 1 bulan pemakaian ($< 1$ bulan).
- **Kosong (Merah Gelap):** Sisa stok fisik di gudang 0.
- **Tersedia (Hijau):** Stok siap salur dengan riwayat pemakaian bulanan yang belum tercatat.

#### Pencarian Cepat Nama Obat
1. Cari kotak isian bertuliskan *"Cari nama obat atau sediaan..."*.
2. Ketikkan kata kunci nama obat (contoh: *Paracetamol*, *Amoxicillin*, *Salep*, *Injeksi*).
3. Sistem dilengkapi pencocokan cerdas yang mengenali sinonim farmasi dan variasi ejaan umum secara seketika (*real-time*).

#### Penyaringan Berdasarkan Kategori dan Status
Selain pencarian teks, pengguna dapat menggunakan tombol penyaring:
- **Filter Status:** Memilih khusus *Semua Status*, *Aman*, *Menipis*, atau *Kosong*.
- **Filter Kategori:** Memilih kelompok obat tertentu seperti Obat Esensial, Antibiotik, Vaksin, BMHP (Bahan Medis Habis Pakai), dsb.

#### Membaca Tabel Rincian Stok dan Periode Pembaruan
Setiap baris data obat pada tabel memuat informasi:
- **Nama Obat & Sediaan:** Nama lengkap item obat beserta bentuk sediaan dan kekuatannya.
- **Satuan:** Satuan terkecil pengeluaran (misal: Tablet, Botol, Vial, Ampul, Tube, Strip).
- **Status Ketersediaan:** Lencana warna penanda visual (Aman, Menipis, Kosong).
- **Sisa Stok:** Jumlah fisik persediaan yang tercatat pada penutupan buku (*cut-off*).
- **Keterangan Periode:** Di bagian atas tabel tertera informasi cut-off data (contoh: *Periode: Oktober 2026*). Ini menandakan data merupakan posisi stok resmi pada penutupan bulan bersangkutan.

---

### 2.3 Portal Berita dan Edukasi Kefarmasian (`/berita`)

#### Membaca Artikel dan Informasi
1. Masuk ke menu **Berita**.
2. Pilih artikel yang diminati dengan mengetuk judul atau kartu gambar artikel.
3. Halaman artikel akan menampilkan naskah lengkap, tanggal terbit, nama redaksi, serta estimasi waktu membaca.

#### Membagikan Artikel ke Media Sosial
Pada setiap artikel, terdapat bilah tombol berbagi (*Social Share Bar*):
- **WhatsApp:** Membuka aplikasi WhatsApp dan membuat pesan siap kirim berisi judul serta tautan artikel.
- **Telegram:** Mengirimkan tautan artikel langsung ke kontak atau grup Telegram.
- **Facebook:** Membuka jendela dialog berbagi Facebook.
- **Instagram:** Menyalin tautan artikel ke papan klip (*clipboard*) secara otomatis dan membuka aplikasi/portal Instagram untuk dibagikan ke Story atau Direct Message.
- **X (Twitter):** Membuka dialog penyusunan tweet dengan judul dan tautan artikel.
- **Salin Tautan:** Menyalin alamat web artikel ke papan klip (*clipboard*). Setelah disalin, akan muncul tanda centang sebagai konfirmasi.

---

### 2.4 Halaman Kontak dan Layanan Komunikasi
Masyarakat dan faskes dapat berkomunikasi langsung dengan pihak IFK Kotabaru melalui kanal resmi di halaman **Kontak**:
- **Peta Lokasi & Alamat Fisik:** Mengetahui lokasi persis kantor dan gudang farmasi IFK Kotabaru lengkap dengan integrasi peta Google Maps.
- **Jadwal Pelayanan Operasional:** Mengetahui hari dan jam kerja resmi penerimaan tamu, konsultasi, serta distribusi perbekalan farmasi.
- **Konsultasi WhatsApp Resmi:** Tautan komunikasi langsung ke nomor WhatsApp pengelola layanan untuk koordinasi cepat antar-petugas faskes.
- **Surat Elektronik (Email Dinas):** Alamat surat elektronik resmi untuk pengiriman dokumen kedinasan, surat permohonan, atau koordinasi formal.

---

## Bab III: Petunjuk Operasional Administrator IFK

Panduan ini ditujukan bagi petugas pengelola yang memiliki wewenang mengelola konten dan data aplikasi di panel administrator.

### 3.1 Akses Masuk Akun (`/admin/login`) dan Keamanan Sesi
1. Buka peramban dan akses alamat: `https://[alamat-web]/admin/login`.
2. Masukkan **Username** dan **Password** yang telah didaftarkan.
3. Klik tombol **Masuk**.
4. Apabila kredensial valid, sistem akan mengarahkan petugas langsung ke Dashboard Administrator.

> ⚠️ **Catatan Penting Keamanan:**
> - Jangan pernah memberitahukan kata sandi akun administrator kepada pihak lain.
> - Setelah selesai bertugas, selalu klik tombol **Keluar (Logout)** di bilah atas untuk mengakhiri sesi kerja, terutama saat menggunakan komputer bersama di kantor.

---

### 3.2 Mengenal Dashboard Administrator
Dashboard menampilkan ringkasan performa sistem secara seketika:
- **Statistik Konten:** Jumlah artikel yang terbit, jumlah draf berita, dan jumlah kategori artikel aktif.
- **Ringkasan Stok Terkini:** Periode aktif yang sedang tampil ke publik beserta jumlah obat berstatus Aman, Menipis, dan Kosong.
- **Menu Navigasi Samping (Sidebar):**
  1. **Dashboard:** Halaman ikhtisar utama indikator sistem (`/admin/dashboard`).
  2. **Berita:** Pengelolaan publikasi naskah artikel, pengumuman, dan materi edukasi (`/admin/berita`).
  3. **Kategori:** Pengelolaan kelompok dan topik artikel berita (`/admin/kategori`).
  4. **Stok Obat:** Pengelolaan inventaris stok obat bulanan, impor berkas ketersediaan, dan pembukaan periode (`/admin/stok`).
  5. **Pengguna:** Tata kelola akun operator, hak akses, dan reset sandi (khusus Super Admin) (`/admin/pengguna`).
  6. **Profil:** Pembaruan data diri nama tampilan dan kata sandi mandiri operator yang sedang aktif (`/admin/profil`).
  7. **Pengaturan:** Konfigurasi identitas kelembagaan, konten profil pimpinan, dokumen layanan, dan banner publik (`/admin/pengaturan`).

---

### 3.3 Manajemen Publikasi Berita dan Artikel

#### Menambah Berita Baru
1. Di bilah menu samping, klik **Berita** lalu pilih tombol **Tambah Berita Baru**.
2. Isi formulir pembuatan berita:
   - **Judul Berita:** Ketikkan judul artikel yang jelas dan informatif.
   - **Kategori:** Pilih kategori artikel yang sesuai (misal: *Edukasi Obat*, *Kegiatan Dinas*, *Pengumuman*).
   - **Gambar Sampul:** Unggah foto utama artikel (format PNG, JPG, atau WEBP, ukuran maksimum 5MB).
   - **Isi Berita:** Tulis naskah berita menggunakan editor teks kaya (*Rich Text Editor*) yang disediakan.
   - **Status Publikasi:** Tentukan status rilis artikel saat disimpan.

#### Penjelasan Field Status Publikasi
Pada formulir pembuatan dan penyuntingan berita, terdapat tombol alih (*toggle*) **Status Publikasi** dengan dua opsi:
- **Langsung Terbitkan:** Artikel akan langsung tayang pada portal publik `/berita` seketika setelah tombol simpan diklik. Pilihan ini digunakan untuk informasi yang sudah final dan siap dibaca publik.
- **Simpan Sebagai Draft:** Artikel akan disimpan ke dalam basis data internal sebagai draf tanpa ditayangkan ke portal publik. Pilihan ini digunakan apabila naskah masih dalam tahap penyusunan atau membutuhkan penelaahan pimpinan terlebih dahulu.

#### Memanfaatkan Fitur Pratinjau Langsung (Live Preview)
Sebelum mempublikasikan artikel, klik tombol **Pratinjau (Preview)**. Sistem akan menampilkan jendela simulasi persis seperti tampilan yang akan dibaca masyarakat di portal publik. Periksa kembali kerapian tata letak paragraf, subjudul, dan keterbacaan gambar pendukung.

#### Menyimpan Draf vs Menerbitkan Artikel
- **Simpan sebagai Draf:** Simpan naskah yang belum final. Draf dapat diakses dan disunting kembali kapan saja melalui tab *Draft* pada tabel manajemen berita.
- **Terbitkan Sekarang:** Publikasikan artikel yang telah disetujui. Artikel dapat dialihkan kembali menjadi draf kapan saja jika sewaktu-waktu perlu ditarik dari penayangan publik.

#### Mengubah dan Menghapus Berita
- **Mengubah Berita:** Klik tombol **Edit** pada baris artikel yang ingin diperbarui, sesuaikan naskah atau gambar, lalu klik simpan perubahan.
- **Menghapus Berita:** Klik tombol **Hapus** jika berita sudah tidak relevan. Konfirmasikan dialog persetujuan penghapusan.

---

### 3.4 Manajemen Persediaan Obat (Modul Inti)

Modul ini berada di menu **Stok Obat** (`/admin/stok`) dan merupakan fitur utama untuk menjaga kebaruan informasi perbekalan farmasi daerah.

#### Siklus Periode Cut-Off Bulanan
Data persediaan obat di IFK dikelola per **Periode Bulanan** (misal: *Oktober 2026*). 
- Hanya ada **1 (satu) periode aktif** yang ditayangkan ke publik pada satu waktu.
- Data periode bulan-bulan sebelumnya tetap tersimpan utuh di sistem sebagai arsip historis yang dapat dilihat kembali sewaktu-waktu.

#### Membuka Periode Baru Secara Mandiri
Saat pergantian bulan pelaporan (*cut-off*):
1. Buka halaman **Stok Obat** di panel admin.
2. Klik tombol **Buat Periode Baru**.
3. Pilih bulan dan tahun pelaporan (contoh: *November 2026*).
4. Klik **Simpan Periode**. Periode baru akan dibuat dan siap diisi data persediaan.

#### Mengunggah Berkas Laporan Ketersediaan Obat Bulanan (Impor Data)
Petugas dapat memasukkan ratusan data obat sekaligus dalam hitungan detik menggunakan berkas spreadsheet:

> 📌 **Catatan Nomenklatur Dokumen:**
> Berkas yang diunggah ke sistem adalah **Laporan Ketersediaan Obat Bulanan** (bukan formulir LPLPO). Dokumen LPLPO (*Lembar Pemakaian dan Lembar Permintaan Obat*) adalah formulir distribusi rutin yang diajukan oleh fasilitas kesehatan (Puskesmas) ke gudang farmasi, sedangkan berkas yang diimpor ke sistem ini merupakan laporan inventaris persediaan induk gudang IFK Kotabaru pada saat penutupan buku bulanan.

**Langkah Impor Berkas:**
1. Pastikan periode bulanan yang dituju telah aktif dipilih.
2. Klik tombol dropdown **Aksi Impor & Ekspor**, lalu pilih **Import CSV / Excel**.
3. Dialog **Import Data Stok Bulanan** akan terbuka.
4. Pilih berkas spreadsheet dari komputer (format `.xlsx`, `.xls`, atau `.csv`). Sistem secara otomatis mendukung 3 format baku:
   - **Format Kemenkes Obat Indikator:** Format resmi pelaporan indikator ketersediaan perbekalan farmasi nasional.
   - **Format Obat Program (dengan Detil Stok):** Format pelaporan obat program khusus dengan rincian penerimaan dan pengeluaran.
   - **Format Standar Excel / CSV:** Format spreadsheet sederhana dengan kolom nama obat, satuan, kategori, sisa stok, dan rata-rata pemakaian.
5. Klik tombol **Mulai Impor**. Sistem akan memvalidasi baris data dan menampilkan laporan rekapitulasi jumlah item obat yang berhasil diproses.

#### Input dan Perubahan Data Obat Manual
Jika ingin menambah obat satuan atau menyesuaikan data per item:
1. Klik tombol **Tambah Obat** di atas tabel atau klik tombol **Edit** pada baris obat bersangkutan.
2. Dialog formulir data obat akan terbuka:
   - **Bagian Data Master Obat:**
     - Nama Obat & Bentuk Sediaan
     - Kategori Obat
     - Satuan (Tablet, Botol, Ampul, Vial, dll)
     - Sisa Stok Fisik Akhir
   - **Bagian Analisis Logistik:**
     - Rata-rata Pemakaian per Bulan (RPB)
     - Estimasi Tingkat Ketersediaan (MoS)
     - Status Ketersediaan (Aman, Menipis, Kosong)
3. Tombol **Batal** dan **Simpan Data** berada di bagian bawah formulir untuk kemudahan konfirmasi data.

#### Kalkulasi Otomatis Rata-rata Pemakaian dan Tingkat Ketersediaan (MoS)
Saat petugas memasukkan atau memperbarui angka sisa stok dan rata-rata pemakaian:
- Sistem secara otomatis menghitung nilai **Months of Supply (MoS)**:
  $$\text{MoS} = \frac{\text{Sisa Stok Fisik Akhir}}{\text{Rata-rata Pemakaian per Bulan}}$$
- **Rekomendasi Status Logistik:**
  - Jika Sisa Stok $\le 0$ $\rightarrow$ Status otomatis **Kosong** (Merah).
  - Jika MoS $< 3.0$ bulan $\rightarrow$ Status otomatis **Menipis** (Kuning).
  - Jika MoS $\ge 3.0$ bulan $\rightarrow$ Status otomatis **Aman** (Hijau).
- Jika data rata-rata pemakaian belum terisi (kosong/0), sistem menetapkan status cadangan aman atau menghormati penyesuaian manual petugas berdasarkan pertimbangan teknis farmasi.

#### Mengunduh Rekapitulasi Data Stok (Ekspor Excel)
Petugas dapat mengunduh seluruh data obat periode aktif untuk keperluan arsip laporan dinas:
1. Pada menu dropdown **Aksi Impor & Ekspor**, pilih **Ekspor Excel**.
2. Peramban akan otomatis mengunduh berkas spreadsheet `.xlsx` berisi daftar obat, sisa stok, rata-rata pemakaian, status ketersediaan, dan kategori.

#### Prosedur Menghapus atau Mereset Periode Stok
Jika terjadi kesalahan fatal dalam unggahan data (misal salah memilih berkas bulan lain):
1. Pilih periode yang ingin dibersihkan.
2. Klik tombol **Hapus Periode / Reset Data**.
3. Sistem akan memunculkan dialog konfirmasi keamanan bertingkat.
4. Konfirmasikan persetujuan. Seluruh item obat pada periode tersebut akan dibersihkan dan siap diimpor kembali.

---

### 3.5 Manajemen Pengaturan Website (Multi-Tab)

Modul ini diakses melalui menu **Pengaturan** (`/admin/pengaturan`) dan berfungsi untuk mengelola seluruh informasi kelembagaan, profil pimpinan, dokumen unduhan publik, dan banner pengumuman penting. Halaman ini menggunakan antarmuka *multi-tab* terstruktur:

#### Tab 1: Identitas & Kontak
Mengatur informasi dasar instansi yang ditampilkan pada bilah navigasi atas, footer, dan halaman kontak:
- **Nama Instansi & Singkatan Resmi:** Misal: *Instalasi Farmasi Kabupaten Kotabaru* dan *IFK Kotabaru*.
- **Tagline & Motto Pelayanan:** Semboyan resmi pelayanan kefarmasian.
- **Alamat Kantor & Gudang:** Alamat fisik lengkap kantor dan gudang penyimpanan obat.
- **Jam Pelayanan Operasional:** Waktu operasional penerimaan tamu dan koordinasi faskes (misal: *Senin - Kamis: 08.00 - 16.00 WITA, Jumat: 08.00 - 11.30 WITA*).
- **Nomor Telepon & WhatsApp Pelayanan:** Saluran kontak resmi bagi masyarakat dan faskes.
- **Alamat Email Dinas:** Email surat-menyurat resmi.
- **Peta Google Maps Embed:** Tautan sematan peta lokasi kantor untuk kemudahan navigasi publik.

#### Tab 2: Konten Profil UPTD
Mengatur informasi kelembagaan yang tampil pada halaman `/profil`:
- **Data Pimpinan UPTD:** Nama lengkap pimpinan, gelar, dan jabatan kedinasan.
- **Foto Pimpinan:** Foto resmi kepala instansi (format PNG/JPG/WebP, maksimal 5MB).
- **Sambutan Kepala UPTD:** Pesan sambutan resmi pimpinan bagi pengunjung web.
- **Visi & Misi:** Visi dan butir-butir misi pelayanan farmasi daerah.
- **Tugas Pokok & Fungsi (Tupoksi):** Penjabaran tugas kedinasan sesuai regulasi daerah.
- **Struktur Organisasi:** Bagan susunan organisasi instansi (gambar PNG/JPG/WebP, maksimal 5MB).

#### Tab 3: Tautan & Layanan
Mengatur integrasi portal eksternal dan pemberitahuan penting:
- **Tautan Instansi Terkait:** Tautan web resmi Dinas Kesehatan Kabupaten Kotabaru dan Kementerian Kesehatan RI.
- **Media Sosial Resmi:** Tautan akun Instagram, Facebook, dan kanal YouTube dinas.
- **Banner Pengumuman Darurat/Penting:** Banner peringatan atau pemberitahuan khusus yang tayang di bagian teratas beranda publik (dapat diaktifkan atau dinonaktifkan sesuai kebutuhan darurat).

#### Tab 4: Dokumen Layanan
Mengonfigurasi berkas pedoman dan formulir yang dapat diunduh publik pada halaman `/layanan`:
- **Format Formulir Permintaan LPLPO:** Tautan berkas format blanko pemesanan obat rutin Puskesmas.
- **Format Permintaan Khusus / Darurat:** Formulir permohonan obat di luar jadwal rutin distribusi.
- **SOP Pelayanan Distribusi:** Dokumen standar operasional prosedur penerimaan dan pengeluaran obat.

#### Tab 5: Statistik & SDM
Mengatur indikator capaian dan kapasitas sumber daya yang tampil di beranda:
- **Statistik Pelayanan:** Jumlah fasilitas kesehatan terlayani, jangkauan kepulauan binaan, dan estimasi populasi masyarakat.
- **Komposisi Ketenagaan SDM:** Jumlah tenaga apoteker, tenaga teknis kefarmasian (TTK), tenaga administrasi, dan staf pendukung.
- **Kapasitas Sarana Gudang:** Luas gudang penyimpanan dan kapasitas fasilitas rantai dingin (*cold room*).

#### Mekanisme Penyimpanan dan Reset Mandiri Per Tab
- Setiap tab memiliki tombol **Simpan Perubahan** dan **Reset Form** yang bekerja secara mandiri.
- Perubahan pada satu tab dapat disimpan tanpa memengaruhi data pada tab lainnya.
- Fitur *Reset Form* mengembalikan isian ke kondisi data terakhir yang tersimpan di basis data apabila operator membatalkan pengeditan.

---

### 3.6 Manajemen Akun Pengguna (Hak Akses Super Admin)

Modul ini diakses melalui menu **Pengguna** (`/admin/pengguna`) dan hanya dapat dibuka oleh akun dengan peran **Super Admin** (`SUPER_ADMIN`).

#### Menambah Akun Operator Baru
1. Pada menu Pengguna, klik tombol **Tambah Pengguna**.
2. Isi data akun operator:
   - **Username:** Nama login unik tanpa spasi (huruf kecil dan angka).
   - **Nama Lengkap:** Nama lengkap petugas pengelola.
   - **Email:** Alamat surat elektronik dinas aktif.
   - **Peran (Role):** Pilih tingkatan hak akses (`ADMIN` atau `SUPER_ADMIN`).
   - **Kata Sandi Awal:** Masukkan kata sandi sementara yang aman (minimal 6 karakter).
3. Klik **Simpan Pengguna**. Akun baru langsung aktif dan dapat digunakan untuk login.

#### Tingkatan Peran Pengguna (Admin vs Super Admin)
- **Admin (`ADMIN`):** Peran operasional harian. Memiliki hak akses penuh untuk mengelola artikel berita, kategori informasi, dan data stok obat bulanan. Tidak dapat mengakses menu Pengguna atau konfigurasi sistem sensitif.
- **Super Admin (`SUPER_ADMIN`):** Peran penanggung jawab teknis. Memiliki seluruh hak akses Admin ditambah wewenang mengelola akun pengguna, mereset kata sandi operator lain, dan mengonfigurasi pengaturan kelembagaan.

#### Mengubah Peran dan Reset Kata Sandi Akun
- **Mengubah Profil / Peran:** Klik tombol **Edit** pada akun bersangkutan untuk mengubah nama, email, atau tingkat peran.
- **Reset Kata Sandi Operator:** Jika ada petugas operator yang lupa kata sandi, Super Admin dapat mengklik tombol **Reset Sandi** pada baris akun bersangkutan, memasukkan kata sandi baru sementara, dan menyampaikannya kepada petugas yang bersangkutan.

#### Menghapus atau Menonaktifkan Akun
Jika petugas sudah mutasi atau tidak lagi bertugas:
1. Klik tombol **Hapus** pada baris pengguna yang dituju.
2. Dialog konfirmasi keamanan akan meminta penegasan penghapusan.
3. Konfirmasikan persetujuan untuk menghapus akun dari sistem.

---

### 3.7 Pengelolaan Profil Pribadi Operator

Setiap petugas yang sedang masuk (*login*) dapat mengelola data akun pribadinya secara mandiri melalui menu **Profil** (`/admin/profil`).

#### Memperbarui Nama Tampilan dan Identitas Mandiri
1. Buka menu **Profil** di bilah navigasi samping.
2. Perbarui **Nama Lengkap** atau **Alamat Email**.
3. Klik tombol **Simpan Profil**.

#### Mengubah Kata Sandi Akun Mandiri
Untuk menjaga keamanan berkala:
1. Pada halaman Profil, akses bagian **Ubah Kata Sandi**.
2. Masukkan **Kata Sandi Lama** untuk verifikasi kepemilikan akun.
3. Masukkan **Kata Sandi Baru** (minimal 6 karakter) dan ulangi pada kolom **Konfirmasi Kata Sandi Baru**.
4. Klik tombol **Ubah Kata Sandi**. Sistem akan memverifikasi dan memperbarui kunci akses akun Anda seketika.

---

## Bab IV: Tanya Jawab Umum dan Solusi Kendala (FAQ)

### Pertanyaan Seputar Portal Publik

**Q: Mengapa nama obat yang saya cari tidak muncul di pencarian?**  
*Jawab:* Pastikan ejaan nama obat sudah benar. Fitur pencarian cerdas telah dilengkapi pengenalan sinonim farmasi (misal: mencari *PCT* akan memunculkan *Paracetamol*). Jika tetap tidak ditemukan, periksa apakah obat tersebut terdaftar pada periode aktif atau masuk dalam kelompok sediaan perbekalan lain.

**Q: Kapan data stok di halaman web diperbarui?**  
*Jawab:* Data stok diperbarui secara berkala setiap awal bulan mengikuti penutupan buku (*cut-off*) pelaporan ketersediaan obat oleh Instalasi Farmasi Kabupaten Kotabaru. Anda dapat melihat tanggal/periode cut-off resmi di bagian keterangan atas tabel stok.

**Q: Apakah masyarakat umum bisa memesan atau meminta obat langsung melalui web ini?**  
*Jawab:* Tidak. Aplikasi web ini berfungsi sebagai sarana transparansi informasi dan pemantauan ketersediaan logistik daerah. Distribusi obat fisik tetap mengikuti prosedur resmi dinas kesehatan melalui Puskesmas dan fasilitas pelayanan kesehatan binaan.

---

### Pertanyaan Seputar Panel Administrator

**Q: Mengapa berkas Laporan Ketersediaan Obat Bulanan gagal saat diimpor?**  
*Jawab:* Periksa hal-hal berikut:
1. Pastikan ekstensi berkas spreadsheet adalah `.xlsx`, `.xls`, atau `.csv`.
2. Pastikan baris judul kolom (*header*) berada pada posisi yang sesuai dan tidak terdapat sel yang digabungkan (*merged cells*) pada baris judul data.
3. Pastikan kolom angka persediaan hanya berisi angka numerik, bukan teks seperti *"nihil"*, *"strip"*, atau tanda strip `"-"`. Ganti dengan angka `0`.
4. Pastikan format berkas sesuai dengan salah satu dari 3 format yang didukung (Format Kemenkes Obat Indikator, Format Obat Program dengan Detil Stok, atau Format Standar).

**Q: Bagaimana jika saya lupa kata sandi akun administrator?**  
*Jawab:* Demi keamanan, pemulihan kata sandi dilakukan secara internal oleh tim pengelola teknis IT IFK atau Super Admin instansi. Hubungi koordinator teknis sistem IFK untuk mereset kata sandi akun Anda.

**Q: Apakah data periode bulan lalu akan hilang jika kita membuat periode baru?**  
*Jawab:* Tidak. Semua data periode lama tetap tersimpan utuh di sistem sebagai arsip historis. Petugas selalu dapat memilih dan melihat kembali rekapitulasi data bulan-bulan sebelumnya melalui menu pilihan periode di panel admin.

---

### Kontak Bantuan Pengelola Sistem

Jika menemukan kendala teknis atau membutuhkan pendampingan operasional lebih lanjut, silakan menghubungi:
- **Instansi:** Instalasi Farmasi Kabupaten Kotabaru, Dinas Kesehatan Kab. Kotabaru
- **Unit Pengelola:** Tim Pengelola Data & Sistem Informasi Farmasi (IT IFK)
- **Alamat Kantor:** Kabupaten Kotabaru, Kalimantan Selatan
- **Kanal Aduan Resmi:** Menu Kontak pada Aplikasi Web Profile IFK Kotabaru
