# Spesifikasi Desain: Audit Kesehatan Kode React-Doctor & Remediasi Keamanan serta Maintainability

## Identitas Fitur
- **Issue**: #148 (`refactor(code-health): audit kode react-doctor dan remediasi keamanan serta maintainability`)
- **Proyek**: PNS (Project #1)
- **Branch**: `refactor/148-code-health-react-doctor`
- **Target Merge**: `develop`

---

## 1. Konteks & Latar Belakang
Audit basis kode `src/` menggunakan `react-doctor` pada commit `40579ff` menghasilkan skor **62 / 100** (*Needs work*) dengan 6 diagnosa:
- **1 Security Warning**: `react-doctor/dangerous-html-sink` (Bobot P1: 84) pada `src/components/admin/article-preview-modal.tsx:242` dan review terkait pada `src/app/(public)/berita/[slug]/page.tsx:356`.
- **5 Maintainability Warnings**: `react-doctor/duplicate-jsx-subtree` (Bobot P2: 52) pada 5 kelompok komponen redundan di modul admin dan publik.

Sasaran akhir:
1. Mengeliminasi celah XSS potensial melalui sanitasi HTML terisolasi tanpa menambah dependensi eksternal berat (zero-dep, ramah VPS 2GB).
2. Mengekstraksi 5 pola sub-pohon JSX duplikat ke dalam komponen bersama yang bersih, teruji, dan modular.
3. Mencapai skor kesehatan **100 / 100** (*Excellent*) pada pemindaian `react-doctor`.

---

## 2. Arsitektur & Desain Solusi

### A. Keamanan: Utilitas Sanitasi HTML Mandiri (`src/lib/sanitize.ts`)
- **Masalah**: Penggunaan `dangerouslySetInnerHTML={{ __html: data.content }}` mentah berisiko injeksi script jika konten artikel TipTap disusupi markup berbahaya.
- **Batasan**: Server VPS 2GB dilarang memasang pustaka berat seperti `jsdom` / `isomorphic-dompurify` yang memicu OOM saat SSR.
- **Solusi**:
  - Buat modul utilitas `sanitizeHtml(html: string): string` di `src/lib/sanitize.ts`.
  - Fungsi ini membersihkan tag berbahaya (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`), event handlers inline (`onload`, `onerror`, `onclick`, dll.), serta URL berisiko (`javascript:`, `vbscript:`, `data:text/html`).
  - Bungkus pemanggilan di `src/components/admin/article-preview-modal.tsx` dan `src/app/(public)/berita/[slug]/page.tsx`.
  - Sesuai spesifikasi `react-doctor/dangerous-html-sink`, sink yang dilewatkan melalui fungsi sanitizer bernama `sanitize*` secara otomatis dianggap aman.

### B. Keterpeliharaan: Ekstraksi 5 Komponen Bersama

#### 1. `AdminPageHeader` (`src/components/admin/admin-page-header.tsx`)
- **Target Duplikasi**:
  - `src/app/(admin)/admin/berita/article-table.tsx:260-278`
  - `src/app/(admin)/admin/dashboard/page.tsx:144-162`
- **Tanggung Jawab**: Merender judul halaman admin (h1), deskripsi singkat, dan aksi tombol (misal tombol Tambah Berita).

#### 2. `AdminTablePagination` (`src/components/admin/admin-table-pagination.tsx`)
- **Target Duplikasi**:
  - `src/app/(admin)/admin/berita/article-table.tsx:669-735`
  - `src/app/(admin)/admin/kategori/category-table.tsx:374-440`
- **Tanggung Jawab**: Kontrol paginasi terpadu (keterangan rentang data, pemilih jumlah baris 5/10/20, tombol Sebelumnya/Halaman/Selanjutnya).

#### 3. `AdminDeleteDialogHeader` (`src/components/admin/admin-delete-dialog-header.tsx`)
- **Target Duplikasi**:
  - `src/app/(admin)/admin/kategori/category-table.tsx:618-632`
  - `src/app/(admin)/admin/pengguna/user-table.tsx:1219-1233`
  - `src/app/(admin)/admin/stok/stock-table.tsx:2192-2206`
  - `src/app/(admin)/admin/stok/stock-table.tsx:2259-2273`
- **Tanggung Jawab**: Header dialog konfirmasi penghapusan data dengan ikon `AlertTriangle` berlatar merah lembut, judul tebal, dan deskripsi peringatan.

#### 4. `PublicSectionHeader` (`src/components/public/public-section-header.tsx`)
- **Target Duplikasi**:
  - `src/app/(public)/layanan/page.tsx` (4 tempat)
  - `src/app/(public)/page.tsx` (1 tempat)
  - `src/app/(public)/profil/page.tsx` (5 tempat)
- **Tanggung Jawab**: Header section publik dengan pembungkus animasi `Reveal`, badge eyebrow, judul utama h2, dan paragraf deskripsi terformat.

#### 5. `PublicModalActionFooter` (`src/components/public/public-modal-action-footer.tsx`)
- **Target Duplikasi**:
  - `src/components/public/cold-room-image-modal.tsx:138-158`
  - `src/components/public/surat-pengantar-modal.tsx:119-139`
- **Tanggung Jawab**: Bilah aksi bawah 50/50 untuk modal penampil dokumen/gambar (tombol tautan "Buka Penuh" dan tombol "Tutup").

---

## 3. Strategi Pengujian & Verifikasi
1. **Unit Test Sanitasi**: `scripts/verify-sanitize-html.ts` menguji 10 kasus uji payload XSS (tag script, inline onload/onerror, href javascript, payload terenkripsi) dan memastikan output bersih.
2. **Uji AST React-Doctor**: Jalankan `npx react-doctor@latest src --no-lint --no-supply-chain -y --verbose` dan pastikan skor mencapai 100/100 (0 issues).
3. **Uji Integrasi Dev Server**: Verifikasi dev server port 3003 merespons HTTP 200 pada halaman publik dan admin terkait tanpa regresi tampilan.
