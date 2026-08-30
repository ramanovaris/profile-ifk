# Product Requirement Document (PRD)
## Proyek: Website Profil Resmi & Portal Berita UPTD Instalasi Farmasi Kab. Kotabaru

### 1. Ringkasan Proyek (Overview)
Website resmi UPTD Instalasi Farmasi Kabupaten Kotabaru sebagai media informasi profil instansi, publikasi standar pelayanan operasional (SOP) distribusi logistik kefarmasian bagi fasilitas pelayanan kesehatan (Puskesmas/Faskes), dan portal publikasi dokumentasi kegiatan dinas. Seluruh sistem dibangun mandiri (*self-hosted*) untuk berjalan di Linux VPS dinas tanpa ketergantungan layanan pihak ketiga.

---

### 2. Tech Stack & Server Environment
* **Framework:** Next.js (App Router, TypeScript)
* **Styling & UI:** Tailwind CSS, Shadcn/UI, Lucide React Icons
* **Database & ORM:** SQLite / PostgreSQL dengan Prisma ORM
* **Autentikasi & Sesi:** NextAuth.js / Session Cookie (Password di-hash dengan `bcrypt`)
* **Penyimpanan Berkas:** Local File Storage di VPS (folder `public/uploads` yang disajikan statis via Nginx)
* **Pengolahan Gambar:** Pustaka `sharp` (konversi otomatis ke format `.webp`, kualitas ~80%, maks. lebar 1200px)
* **Target Server:** Linux VPS (Ubuntu Server, PM2 / Docker, Nginx Reverse Proxy, SSL Let's Encrypt)
* **Build Config:** `output: 'standalone'` pada `next.config.ts`

---

### 3. Matriks Hak Akses Pengguna (Role-Based Access Control)

| Menu / Fitur | Super Admin (`SUPER_ADMIN`) | Staf Penulis (`STAFF`) |
| :--- | :---: | :---: |
| **Login & Dashboard Ringkasan** | Ya | Ya |
| **Buat & Edit Artikel Milik Sendiri** | Ya | Ya |
| **Edit / Hapus Semua Artikel** | Ya | Tidak (hanya miliknya) |
| **Kelola Pengguna (Tambah, Edit, Reset Sandi, Hapus)** | Ya | Tidak (diblokir) |
| **Edit Profil & Ubah Sandi Sendiri** | Ya | Ya |

---

### 4. Arsitektur Informasi & Spesifikasi Halaman

#### A. Halaman Publik (Frontend)
1. **`/` (Beranda):**
   * *Hero Section:* Foto kantor, identitas resmi UPTD Instalasi Farmasi Kotabaru, dan visi/motto pelayanan.
   * *Statistik Ringkas:* Ringkasan faskes binaan yang dilayani dan komitmen mutu obat.
   * *Quick Links:* Pintasan cepat ke SOP Layanan, Berita Terkini, dan Kontak.
   * *Berita Terbaru:* Menampilkan 3–4 artikel kegiatan dinas terkini.
2. **`/profil` (Profil Instansi):**
   * Sambutan Kepala UPTD Instalasi Farmasi[cite: 1].
   * Visi & Misi Instansi[cite: 1].
   * Tugas Pokok dan Fungsi (Tupoksi)[cite: 1].
   * Struktur Organisasi Instansi[cite: 1].
3. **`/layanan` (Standar Pelayanan Operasional - Komponen Statis):**
   * **Jam Pelayanan Operasional:**
     * Senin – Kamis: 08.00 – 16.30 WITA[cite: 1]
     * Jumat: 08.00 – 11.00 WITA[cite: 1]
   * **Standar Mutu & Penyimpanan:**
     * Penerapan sistem FEFO (*First Expired First Out*)[cite: 1].
     * Pemantauan suhu penyimpanan harian[cite: 1].
     * Pemeliharaan *Cold Chain* (suhu 2°C – 8°C) khusus vaksin dan serum[cite: 1].
   * **Alur Pelayanan Permintaan Rutin (LPLPO):**
     * *Periode:* 1–2 bulan sekali sesuai jadwal wilayah Puskesmas[cite: 1].
     * *Batas Pengajuan:* Maksimal tanggal 10 pada bulan periode berjalan[cite: 1].
     * *Persyaratan:* Formulir LPLPO resmi rangkap 2 yang ditandatangani Pengelola Obat dan Kepala Puskesmas[cite: 1].
     * *Output Dokumen:* Surat Penyerahan Barang (SPB)[cite: 1].
     * *SLA/Waktu Penyelesaian:* ±2 hari kerja (ambil mandiri di kantor) / ±7 hari kerja (didistribusikan ke faskes)[cite: 1].
   * **Alur Pelayanan Permintaan Cito / Darurat (*Emergency*):**
     * *Kriteria:* Pemenuhan kebutuhan mendesak faskes di luar jadwal rutin[cite: 1].
     * *Persyaratan:* Surat permohonan resmi bertanda tangan Kepala Puskesmas[cite: 1].
     * *Metode Penyerahan:* Petugas faskes mengambil mandiri langsung ke gudang IFK[cite: 1].
     * *SLA/Waktu Penyelesaian:* Maksimal 1x24 jam kerja[cite: 1].
   * **Alur Penanganan Obat Rusak & Kedaluwarsa (*Expired Date*):**
     * *Waktu:* Kapan saja saat berkunjung ke IFK atau berbarengan jadwal LPLPO[cite: 1].
     * *Persyaratan:* Fisik obat dipisahkan, dilengkapi Berita Acara Serah Terima (BAST) dan lampiran rincian (*Nama Obat, No. Batch, Jumlah, Tanggal ED*)[cite: 1].
     * *Penanganan IFK:* Penyimpanan di ruang karantina khusus obat rusak sebelum dimusnahkan berkala sesuai regulasi[cite: 1].
4. **`/berita` & `/berita/[slug]` (Katalog & Detail Berita):**
   * Katalog artikel kegiatan dinas dengan fitur pencarian dan filter kategori (*Kegiatan, Informasi, Sosialisasi*)[cite: 1].
   * Halaman detail artikel: Gambar sampul, judul, tanggal terbit, nama penulis, dan isi konten lengkap[cite: 1].
5. **`/kontak` (Kontak & Informasi):**
   * Alamat kantor, jam operasional, dan sematan Google Maps[cite: 1].
   * Tautan langsung WhatsApp Admin, Email resmi, dan tautan kanal SP4N-LAPOR![cite: 1].

#### B. Panel Admin (`/admin`)
1. **`/admin/login`:** Autentikasi staf/admin pengelola website[cite: 1].
2. **`/admin/dashboard`:** Ringkasan statistik jumlah artikel (*published* vs *draft*), daftar akun aktif, dan riwayat posting terakhir[cite: 1].
3. **`/admin/berita` (Manajemen Artikel):**
   * Tabel daftar artikel (fitur tambah, edit, hapus)[cite: 1].
   * Form editor artikel: Judul, *auto-generate slug*, kategori, upload cover image (.webp), rich text editor (Tiptap/Markdown), dan status publikasi[cite: 1].
4. **`/admin/pengguna` (Manajemen Akun - Khusus `SUPER_ADMIN`):**
   * Tabel daftar pengguna (*Username*, Nama Lengkap, Peran, Tanggal dibuat)[cite: 1].
   * Form buat akun baru (*Username*, Nama, Password, Pilihan Role: `SUPER_ADMIN` / `STAFF`)[cite: 1].
   * Edit data pengguna & reset kata sandi[cite: 1].
   * Hapus akun pengguna[cite: 1].
5. **`/admin/profil` (Pengaturan Akun Mandiri):**
   * Form ubah nama tampilan dan ganti kata sandi milik sendiri (dapat diakses oleh semua pengguna terdaftar)[cite: 1].

---

### 5. Skema Database (Prisma Schema)

```prisma
datasource db {
  provider = "sqlite" // ganti ke "postgresql" jika menggunakan PostgreSQL di VPS
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  STAFF
}

model User {
  id        String    @id @default(cuid())
  username  String    @unique
  password  String    // Password hash (bcrypt)
  name      String
  role      Role      @default(STAFF)
  articles  Article[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  category    String   // 'Kegiatan', 'Informasi', 'Sosialisasi'
  content     String   // Format Markdown atau HTML
  coverImage  String?  // Path berkas lokal: /uploads/nama-file.webp
  isPublished Boolean  @default(true)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

---

### 6. Struktur Direktori Proyek
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                # Inisialisasi akun Super Admin pertama dari .env
├── public/
│   └── uploads/               # Direktori simpanan berkas gambar (.webp)
├── src/
│   ├── app/
│   │   ├── (public)/          # Route group frontend publik
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Beranda
│   │   │   ├── profil/
│   │   │   │   └── page.tsx
│   │   │   ├── layanan/
│   │   │   │   └── page.tsx   # Layanan SOP Statis
│   │   │   ├── berita/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── kontak/
│   │   │       └── page.tsx
│   │   ├── (admin)/           # Route group panel admin
│   │   │   ├── layout.tsx
│   │   │   └── admin/
│   │   │       ├── login/page.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── berita/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── baru/page.tsx
│   │   │       │   └── [id]/edit/page.tsx
│   │   │       ├── pengguna/   # Khusus SUPER_ADMIN
│   │   │       │   ├── page.tsx
│   │   │       │   └── baru/page.tsx
│   │   │       └── profil/     # Profil & Ganti Password Mandiri
│   │   │           └── page.tsx
│   ├── components/
│   │   ├── ui/                # Shadcn UI primitives
│   │   ├── public/            # Navbar, Footer, Hero, TimelineLayanan
│   │   └── admin/             # SidebarAdmin, ArticleForm, UserForm, Editor
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # Session logic & verifikasi role
│   │   └── upload.ts          # Sharp image processor & storage helper
│   └── middleware.ts          # Proteksi route /admin/* dan route /admin/pengguna/*
└── next.config.ts

---

### 7. Aturan & Batasan Teknis (Guardrails)
* Standalone Build: Wajib menyertakan output: 'standalone' pada konfigurasi next.config.ts[cite: 1].
* Server Actions: Seluruh operasi login, mutasi artikel, kelola pengguna, dan upload gambar wajib menggunakan Next.js Server Actions[cite: 1].
* Inisialisasi Database Bersih: Kredensial akun pertama pada prisma/seed.ts wajib dibaca melalui environment variables (INITIAL_ADMIN_USERNAME dan INITIAL_ADMIN_PASSWORD), tidak di-hardcode.
* Otorisasi Berlapis:
    * Route /admin/* (kecuali /admin/login) dilindungi Next.js Middleware untuk memastikan sesi aktif[cite: 1].
    * Route /admin/pengguna/* dan aksi mutasi pengguna wajib memiliki validasi role SUPER_ADMIN baik di Middleware maupun di level Server Actions.
* Optimasi Gambar: Setiap file sampul artikel yang diunggah wajib dikompresi via sharp ke format .webp dengan resolusi maksimal lebar 1200px sebelum disimpan ke folder public/uploads[cite: 1].
* Keamanan Akun: Password di-hash minimal dengan bcrypt (salt rounds 10), dan sanitasi input diterapkan pada setiap form mutasi data.
