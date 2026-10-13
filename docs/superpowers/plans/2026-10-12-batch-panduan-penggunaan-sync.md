# Batch Panduan Penggunaan Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Menyelaraskan seluruh materi `docs/PANDUAN_PENGGUNAAN.md` mencakup 8 isu backlog (#138, #140, #141, #143, #144, #145, #146, #147).

**Architecture:** Pemutakhiran dokumen markdown tunggal terintegrasi dengan validasi integritas tautan internal, format penomoran, kelengkapan terminologi operasional, serta verifikasi konsistensi terhadap implementasi aplikasi.

**Tech Stack:** Markdown, Git, GitHub CLI.

## Global Constraints
- Bahasa: Bahasa Indonesia baku dan ramah pengguna operasional.
- Bebas dari jargon teknis tata letak internal seperti modal 50/50.
- Presisi terhadap alur riil antarmuka Next.js di `/admin` dan portal publik.
- Seluruh 8 isu diselesaikan dalam satu siklus PR komprehensif.

---

### Task 1: Pembaruan Bab I dan Bab II (Isu #145, #138, #140)

**Files:**
- Modify: `docs/PANDUAN_PENGGUNAAN.md:10-150`

- [ ] **Step 1: Hapus jargon layout 50/50 di Bab 1.2 (#145)**
- [ ] **Step 2: Mutakhirkan Bab 2.2 terkait metodologi MoS standar Kemenkes (#138)**
- [ ] **Step 3: Hapus referensi formulir kirim pesan di Bab 2.1 & 2.4, ganti saluran kontak langsung (#140)**
- [ ] **Step 4: Verifikasi format markdown Bab I & II**

---

### Task 2: Pembaruan Bab III Sub-bab 3.1 - 3.4 (Isu #141, #143, #144, #145, #138)

**Files:**
- Modify: `docs/PANDUAN_PENGGUNAAN.md:151-275`

- [ ] **Step 1: Mutakhirkan daftar 7 menu sidebar riil di Bab 3.2 (#141)**
- [ ] **Step 2: Tambahkan penjelasan field Status Publikasi pada form berita Bab 3.3 (#143)**
- [ ] **Step 3: Koreksi nomenklatur LPLPO menjadi Laporan Ketersediaan Obat Bulanan di Bab 3.4 (#144)**
- [ ] **Step 4: Hapus istilah teknis modal 50/50 pada judul & teks input obat manual (#145)**
- [ ] **Step 5: Selaraskan formula dan logika status MoS di Bab 3.4 (#138)**

---

### Task 3: Pembaruan Bab III Sub-bab 3.5 - 3.7 (Isu #146, #141)

**Files:**
- Modify: `docs/PANDUAN_PENGGUNAAN.md:274-325`

- [ ] **Step 1: Tuliskan panduan komprehensif 5 tab Pengaturan Website di Bab 3.5 (#146)**
- [ ] **Step 2: Susun sub-bab baru 3.6 Manajemen Akun Pengguna (Super Admin) (#141)**
- [ ] **Step 3: Susun sub-bab baru 3.7 Pengelolaan Profil Pribadi Operator (#141)**

---

### Task 4: Pembaruan Bab IV FAQ, Kontak Bantuan, dan Daftar Isi (Isu #147, #144, #141, #145, #146)

**Files:**
- Modify: `docs/PANDUAN_PENGGUNAAN.md` (TOC baris 8-46 & FAQ baris akhir)

- [ ] **Step 1: Sesuaikan unit pemulihan kata sandi admin menjadi IT IFK (#147)**
- [ ] **Step 2: Sesuaikan pertanyaan FAQ impor persediaan obat (#144)**
- [ ] **Step 3: Sinkronkan seluruh entri Daftar Isi (TOC) di bagian awal dokumen**
- [ ] **Step 4: Jalankan skrip verifikasi integritas panduan**

---

### Task 5: Validasi Skrip & Pembukaan PR

**Files:**
- Create: `scripts/verify-panduan-penggunaan.ts`
- Commit & Push: Git branch `docs/batch-panduan-penggunaan`
- Pull Request: Buka PR ke branch `develop`, tautkan ke 8 Isu dan Project #1 PNS

- [ ] **Step 1: Buat dan jalankan skrip verifikasi otomatis `scripts/verify-panduan-penggunaan.ts`**
- [ ] **Step 2: Commit perubahan dokumen dan skrip**
- [ ] **Step 3: Push branch ke origin dan buat PR**
