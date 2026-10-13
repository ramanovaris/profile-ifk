# Implementasi Audit Kode React-Doctor & Remediasi Kesehatan Basis Data

> **For agentic workers:** Jalankan per tahapan secara bertahap, verifikasi setiap perubahan menggunakan `react-doctor` dan skrip uji mandiri.

**Goal:** Mengeliminasi 1 temuan keamanan XSS dan 5 duplikasi pohon JSX yang terdeteksi oleh `react-doctor` guna menaikkan skor kesehatan dari 62 menjadi 100 tanpa ketergantungan paket eksternal baru.

**Architecture:** Modul sanitasi HTML ringan mandiri (`src/lib/sanitize.ts`) untuk XSS sink, serta ekstraksi 5 komponen presentasional modular (`AdminPageHeader`, `AdminTablePagination`, `AdminDeleteDialogHeader`, `PublicSectionHeader`, `PublicModalActionFooter`).

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Lucide React, react-doctor 0.9+.

---

## Tahapan Pekerjaan

### Task 1: Remediasi Keamanan XSS Sink (`react-doctor/dangerous-html-sink`)
- **Files**:
  - Create: `src/lib/sanitize.ts`
  - Create: `scripts/verify-sanitize-html.ts`
  - Modify: `src/components/admin/article-preview-modal.tsx`
  - Modify: `src/app/(public)/berita/[slug]/page.tsx`
- **Langkah**:
  1. Tulis skrip verifikasi `scripts/verify-sanitize-html.ts` dengan 8 skenario payload XSS.
  2. Implementasikan fungsi `sanitizeHtml(html: string): string` di `src/lib/sanitize.ts`.
  3. Jalankan `npx tsx scripts/verify-sanitize-html.ts` hingga 100% PASS.
  4. Integrasikan `sanitizeHtml` pada `article-preview-modal.tsx` dan `berita/[slug]/page.tsx`.
  5. Jalankan `npx react-doctor@latest src --no-lint --no-supply-chain -y --verbose` dan pastikan temuan `dangerous-html-sink` tuntas.

### Task 2: Ekstraksi Komponen Admin (`AdminPageHeader`, `AdminTablePagination`, `AdminDeleteDialogHeader`)
- **Files**:
  - Create: `src/components/admin/admin-page-header.tsx`
  - Create: `src/components/admin/admin-table-pagination.tsx`
  - Create: `src/components/admin/admin-delete-dialog-header.tsx`
  - Modify: `src/app/(admin)/admin/dashboard/page.tsx`
  - Modify: `src/app/(admin)/admin/berita/article-table.tsx`
  - Modify: `src/app/(admin)/admin/kategori/category-table.tsx`
  - Modify: `src/app/(admin)/admin/pengguna/user-table.tsx`
  - Modify: `src/app/(admin)/admin/stok/stock-table.tsx`
- **Langkah**:
  1. Buat `AdminPageHeader` dan ganti duplikasi di `article-table.tsx` dan `dashboard/page.tsx`.
  2. Buat `AdminTablePagination` dan ganti duplikasi di `article-table.tsx` dan `category-table.tsx`.
  3. Buat `AdminDeleteDialogHeader` dan ganti duplikasi di `category-table.tsx`, `user-table.tsx`, dan `stock-table.tsx`.
  4. Verifikasi `react-doctor` untuk memastikan 3 duplikasi admin tereliminasi.

### Task 3: Ekstraksi Komponen Publik (`PublicSectionHeader`, `PublicModalActionFooter`)
- **Files**:
  - Create: `src/components/public/public-section-header.tsx`
  - Create: `src/components/public/public-modal-action-footer.tsx`
  - Modify: `src/app/(public)/layanan/page.tsx`
  - Modify: `src/app/(public)/page.tsx`
  - Modify: `src/app/(public)/profil/page.tsx`
  - Modify: `src/components/public/cold-room-image-modal.tsx`
  - Modify: `src/components/public/surat-pengantar-modal.tsx`
- **Langkah**:
  1. Buat `PublicSectionHeader` dan ganti 10 kemunculan header section di `layanan/page.tsx`, `page.tsx`, dan `profil/page.tsx`.
  2. Buat `PublicModalActionFooter` dan ganti duplikasi footer modal 50/50 di `cold-room-image-modal.tsx` dan `surat-pengantar-modal.tsx`.
  3. Verifikasi `react-doctor` untuk memastikan seluruh temuan duplikasi JSX tersisa tereliminasi.

### Task 4: Verifikasi Menyeluruh & Uji Dev Server
- **Langkah**:
  1. Jalankan `npx react-doctor@latest src --no-lint --no-supply-chain -y --verbose` dan pastikan skor mencapai **100 / 100** (*Excellent*) dengan 0 issues.
  2. Jalankan `npx tsx scripts/verify-sanitize-html.ts` dan seluruh suite tes mandiri yang ada.
  3. Tes HTTP request dev server port 3003 pada rute-rute terdampak: `/`, `/profil`, `/layanan`, `/admin/dashboard`, `/admin/berita`, `/admin/kategori`, `/admin/pengguna`, `/admin/stok`.
  4. Buat PR ke `develop`, cantumkan narasi e-Kinerja, dan konfirmasi ke pengguna sebelum merge.
