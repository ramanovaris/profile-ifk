# Profile IFK Kotabaru

> **Sistem Informasi Profil Instansi & Pemantauan Ketersediaan Obat**  
> Instalasi Farmasi Kabupaten (IFK) Kotabaru — Dinas Kesehatan Kabupaten Kotabaru

Aplikasi web resmi yang menyajikan transparansi ketersediaan obat bulanan, publikasi berita dan artikel edukasi kesehatan, serta pusat informasi layanan kefarmasian terpadu bagi fasilitas pelayanan kesehatan (Puskesmas/Klinik) dan masyarakat luas di Kabupaten Kotabaru.

---

## 📚 Dokumentasi & Petunjuk Penggunaan

- 📖 **[Buku Pedoman dan Petunjuk Penggunaan Aplikasi (User Manual)](docs/PANDUAN_PENGGUNAAN.md)** — Panduan lengkap operasional bagi pengguna publik, fasilitas kesehatan, dan administrator pengelola IFK.
- 🛠️ **[Panduan Operasional Pencadangan & Pemulihan Basis Data (Ops Guide)](docs/ops/database-backup-restore.md)** — Prosedur teknis backup terjadwal, rotasi arsip, dan disaster recovery.

---

## ✨ Fitur & Modul Utama

### 1. Portal Publik & Faskes
- **Profil & Layanan Instansi:** Menampilkan visi-misi, tugas pokok dan fungsi, tata kelola mutu, serta saluran kontak resmi.
- **Portal Ketersediaan Obat Bulanan (`/stok`):**
  - Kartu ringkasan interaktif (*Total Perbekalan, Stok Aman, Stok Menipis, Stok Kosong*).
  - Pencarian instan nama obat dan bentuk sediaan secara *real-time*.
  - Penyaringan berbasis status ketersediaan dan kelompok kategori obat.
  - Tabel rincian stok dengan indikator lencana visual dan penanda periode *cut-off*.
- **Portal Berita & Edukasi Kefarmasian (`/berita`):**
  - Artikel edukasi kesehatan dan rilis kegiatan dinas resmi.
  - Tombol berbagi ke media sosial (WhatsApp, Telegram, Facebook, dan Salin Tautan).
- **Desain Ramah Seluler & Aksesibilitas:** Antarmuka responsif optimal untuk layar ponsel pintar maupun peramban komputer desktop (*Clean Light UI*).

### 2. Panel Administrator (`/admin`)
- **Autentikasi & Keamanan Sesi:** Akses masuk terlindungi untuk petugas pengelola.
- **Dashboard Statistik:** Ringkasan jumlah artikel, draf berita, kategori aktif, dan status data logistik berjalan.
- **Manajemen Berita & Kategori:** Editor artikel terintegrasi, fitur pratinjau langsung (*Live Preview*), draf vs publikasi, serta unggah gambar sampul.
- **Manajemen Stok Obat (Modul Inti):**
  - Pembuatan periode *cut-off* bulanan baru secara mandiri.
  - Impor berkas Excel LPLPO (*bulk import*) dengan validasi format kolom otomatis.
  - Formulir input/edit data obat berbasis modal responsif dua kolom (50/50 di layar desktop).
  - Kalkulasi otomatis rata-rata pemakaian bulanan dan tingkat ketersediaan (*Months of Supply* / MoS).
  - Ekspor rekapitulasi data stok periode aktif ke berkas spreadsheet Excel (`.xlsx`).
  - Prosedur aman reset/hapus data periode.
- **Pengaturan Profil Instansi:** Pengelolaan identitas kantor, jam operasional, kontak telepon/WhatsApp, dan tautan sosial media resmi.

---

## 🚀 Memulai Pengembangan (Local Development)

### Prasyarat
- Node.js versi 18 ke atas
- npm / pnpm / yarn
- PostgreSQL Database

### Langkah Instalasi

1. **Klon Repositori:**
   ```bash
   git clone https://github.com/ramanovaris/profile-ifk.git
   cd profile-ifk
   ```

2. **Pasang Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Variabel Lingkungan:**
   Salin berkas lingkungan dan sesuaikan kredensial koneksi:
   ```bash
   cp .env.example .env
   ```

4. **Sinkronisasi Skema & Inisialisasi Data:**
   ```bash
   npx prisma db push
   npm run seed
   ```

5. **Jalankan Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Buka peramban web pada alamat `http://localhost:3000` (atau port yang ditentukan).

---

## ⚙️ Perintah Skrip Operasional

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan lokal. |
| `npm run build` | Melakukan build produksi Next.js. |
| `npm run start` | Menjalankan build produksi. |
| `npm run seed` | Menjalankan pengisian data awal (seeder idempoten). |
| `npm run seed:generate` | Menghasilkan berkas snapshot data operasional dari database aktif. |
| `npm run db:backup` | Mengekspor pencadangan database terkompresi (`.sql.gz`) dengan rotasi retensi 7 hari. |
| `npm run db:restore` | Menjalankan pemandu pemulihan database interaktif berpemandu. |

---

## 📄 Lisensi & Hak Cipta

Dikelola secara resmi oleh **Instalasi Farmasi Kabupaten Kotabaru**, Dinas Kesehatan Kabupaten Kotabaru, Provinsi Kalimantan Selatan.
