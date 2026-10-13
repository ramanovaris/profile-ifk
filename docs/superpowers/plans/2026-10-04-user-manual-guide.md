# Rencana Implementasi: Buku Pedoman dan Petunjuk Penggunaan Aplikasi untuk End User

> **Terkait Issue:** [#133](https://github.com/ramanovaris/profile-ifk/issues/133)  
> **Spesifikasi Desain:** `docs/superpowers/specs/2026-10-04-user-manual-guide-design.md`  
> **Target Branch:** `docs/133-user-manual-guide` -> `develop`

**Goal:** Menyusun buku pedoman dan petunjuk penggunaan aplikasi web (*user manual guide*) resmi yang terstruktur, komprehensif, dan ramah pengguna non-teknis bagi masyarakat/faskes serta petugas pengelola IFK Kotabaru, serta mengintegrasikannya ke berkas `README.md`.

**Architecture:** Penyusunan dokumen komprehensif tunggal berformat Markdown terstruktur (`docs/PANDUAN_PENGGUNAAN.md`) yang dilengkapi daftar isi interaktif berbasis tautan anchor, tips visual, dan peringatan operasional penting. Diikuti pembaruan `README.md` untuk mengaitkan dokumen panduan resmi dan skrip validasi integritas anchor dokumen.

**Tech Stack:** Markdown (GitHub Flavored Markdown), Node.js/Bash untuk validasi keutuhan tautan dan struktur.

## Global Constraints
- Jangan build/lint/tsc di VPS (hemat RAM; serahkan ke CI GitHub Actions).
- Hindari istilah teknis tingkat rendah database/backend (SQL, Prisma, migration, Next.js, API, hydration). Jelaskan semua perilaku dari sudut pandang antarmuka pengguna.
- Wajib menyertakan langkah bernomor (1-2-3), penanda visual tips (`💡 Tips`), dan peringatan (`⚠️ Catatan Penting`).

---

### Task 1: Pembuatan Dokumen Panduan Penggunaan Terpadu (`docs/PANDUAN_PENGGUNAAN.md`)

**Files:**
- Create: `docs/PANDUAN_PENGGUNAAN.md`

**Deskripsi Rinci:**
Menyusun dokumen panduan lengkap yang mencakup:
1. **Daftar Isi Interaktif:** Seluruh judul bab dan subbab dapat diklik untuk melompat langsung.
2. **Bab I: Pengenalan Aplikasi:**
   - Tujuan aplikasi sistem informasi ketersediaan obat dan profil instansi.
   - Alamat akses web, kompatibilitas browser, dan dukungan tampilan HP/Desktop.
   - Pembedaan peran: Pengguna Publik vs Administrator IFK.
3. **Bab II: Panduan Pengguna Publik & Fasilitas Kesehatan (Puskesmas/Klinik):**
   - Navigasi menu utama (Beranda, Profil, Layanan, Kontak, Berita, Stok Obat).
   - Panduan portal `/stok`: membaca kartu ringkasan status obat (Total, Aman, Menipis, Kosong), pencarian cepat obat, filter kategori & status, membaca tabel sisa stok & periode cut-off.
   - Panduan portal `/berita`: membaca artikel edukasi, fitur berbagi ke media sosial (WhatsApp, Telegram, Facebook, Salin Tautan).
   - Panduan kontak: menemukan alamat, jam kerja, dan saluran pengaduan resmi.
4. **Bab III: Petunjuk Operasional Administrator (Petugas Pengelola IFK):**
   - Prosedur masuk akun (`/admin/login`), keamanan kata sandi, dan logout.
   - Mengenal dashboard administrator dan indikator statistik.
   - Manajemen artikel & berita: tambah berita, upload foto sampul, pratinjau langsung (*live preview*), draf vs publikasi, ubah, dan hapus.
   - Manajemen persediaan obat: siklus cut-off bulanan, membuka periode baru secara mandiri, impor berkas Excel LPLPO (format kolom yang didukung), input & edit manual obat (modal formulir responsif 50/50), kalkulasi otomatis pemakaian bulanan (MoS), ekspor rekapitulasi ke Excel, dan prosedur reset/hapus data periode yang aman.
   - Manajemen profil & pengaturan instansi: ubah jam kerja, kontak telepon/WhatsApp dinas, dan tautan sosial media.
5. **Bab IV: Tanya Jawab Umum & Pemecahan Masalah (FAQ):**
   - Penjelasan keterlambatan data periode bulanan.
   - Solusi gagal impor Excel LPLPO.
   - Kontak bantuan pengelola sistem.

- [ ] **Step 1:** Tulis dokumen lengkap `docs/PANDUAN_PENGGUNAAN.md`.
- [ ] **Step 2:** Komit berkas dengan pesan: `docs(panduan): susun buku pedoman dan petunjuk penggunaan aplikasi end user`.

---

### Task 2: Pembaruan Berkas `README.md` Repositori

**Files:**
- Modify: `README.md`

**Deskripsi Rinci:**
Memperbarui `README.md` utama agar menyajikan gambaran ringkas aplikasi web IFK Kotabaru, modul publik vs admin yang tersedia, serta menyematkan tautan utama ke `docs/PANDUAN_PENGGUNAAN.md` dan dokumentasi operasional database backup.

- [ ] **Step 1:** Perbarui `README.md` dengan informasi proyek yang relevan dan tautan buku pedoman.
- [ ] **Step 2:** Komit berkas dengan pesan: `docs(readme): integrasikan tautan buku panduan penggunaan aplikasi`.

---

### Task 3: Verifikasi Integritas Dokumen & Uji Tautan Anchor

**Files:**
- Create: `scripts/verify-user-manual.sh`

**Deskripsi Rinci:**
Membuat skrip verifikasi otomatis untuk memastikan:
1. Berkas `docs/PANDUAN_PENGGUNAAN.md` ada dan tidak kosong (> 100 baris).
2. Seluruh 4 Bab utama tersedia lengkap.
3. Seluruh tautan internal (*anchor links*) pada Daftar Isi cocok 100% dengan heading yang ada di dalam berkas.
4. Tidak ada teks placeholder tersisa (`TODO`, `TBD`, `PLACEHOLDER`).
5. Jalankan verifikasi dan hapus skrip pengujian temporer atau simpan sebagai verifikasi mandiri.

- [ ] **Step 1:** Buat dan jalankan skrip `scripts/verify-user-manual.sh`.
- [ ] **Step 2:** Pastikan verifikasi menghasilkan status **PASS**.

---

### Task 4: Pengajuan Pull Request & Pembaruan Status GitHub Projects

**Deskripsi Rinci:**
- [ ] **Step 1:** Push branch `docs/133-user-manual-guide` ke GitHub remote.
- [ ] **Step 2:** Buat Pull Request ke branch `develop` dengan referensi ke Issue #133.
- [ ] **Step 3:** Pantau hasil CI GitHub Actions hingga status Hijau (PASS).
- [ ] **Step 4:** Siapkan rekomendasi redaksi e-Kinerja untuk Mas Rama.
