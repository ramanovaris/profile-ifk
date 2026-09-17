# Rencana Implementasi: Penyelarasan Modal Pratinjau Artikel dengan Tata Letak Berita Publik Terbaru (#70)

> **For agentic workers:** Gunakan `patch` atau `write_file` untuk modifikasi terarah pada `src/components/admin/article-preview-modal.tsx`. Hindari menjalankan `build`/`tsc` manual di VPS untuk menjaga RAM 2GB.

**Goal:** Menyelaraskan urutan elemen, rasio gambar sampul, metadata (avatar inisial dan estimasi waktu baca), serta tipografi pada komponen `ArticlePreviewModal` di dashboard admin agar identik 1:1 dengan halaman detail berita publik (`/berita/[slug]`).

**Architecture:** Restrukturisasi hierarki komponen di dalam kartu pratinjau modal (Header di atas &rarr; Foto Sampul 16:9 &rarr; Tubuh Naskah), penambahan kalkulasi dinamis durasi membaca berbasis jumlah kata ($\lceil \text{kata} / 200 \rceil$), implementasi avatar inisial pengunggah, penyelarasan rasio foto dari 21:9 ke 16:9 (`aspect-video`), dan peremajaan placeholder identitas UPTD IFK Kotabaru.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Lucide React, TypeScript.

## Global Constraints
- Jangan menjalankan `npm run build`, `lint`, atau `tsc` di VPS (RAM terbatas 2GB, serahkan verifikasi ke CI GitHub Actions).
- Dev server Next.js aktif di port 3003 (`http://43.129.57.214/profile-ifk/`).
- Terapkan perubahan dalam batch kecil (1-2 penyesuaian visual/UX) agar mudah diuji pada perangkat mobile / Chrome Android Desktop site mode.
- Redaksi SKP e-Kinerja bebas istilah teknis backend database.

---

### Task 1: Restrukturisasi Urutan & Metadata `ArticlePreviewModal`

**Berkas:**
- Modifikasi: `src/components/admin/article-preview-modal.tsx`

**Tindakan:**
1. Tambahkan kalkulasi estimasi waktu baca dinamis dari data naskah HTML:
   ```tsx
   const plainText = (data.content || "").replace(/<[^>]*>/g, " ").trim();
   const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
   const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
   ```
2. Pindahkan blok Header (Breadcrumb, Badge Kategori, Judul Artikel, Metadata) ke posisi teratas kartu naskah sebelum gambar sampul:
   - **Breadcrumb:** Item Beranda, Berita, dan nama kategori (`displayCategory`).
   - **Badge Kategori:** Menggunakan kelas `mt-4 inline-flex bg-brand-50 text-brand-700 border border-brand-200/60 font-medium px-3 py-1 rounded-full text-xs`.
   - **Judul Artikel:** Menggunakan kelas `mt-3 text-xl font-extrabold tracking-tight text-heading sm:text-2xl md:text-3xl leading-snug`.
   - **Metadata Sebaris:**
     - Inisial avatar: lingkaran `flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 border border-brand-200 text-[11px] font-semibold text-brand-700`.
     - Nama penulis: `span font-medium text-zinc-800`.
     - Titik pemisah: `&middot;`.
     - Tanggal publikasi lokal: `formattedDate`.
     - Titik pemisah: `&middot;`.
     - Durasi baca: `{readingMinutes} menit baca`.
3. Posisikan kontainer foto sampul tepat di bawah Header metadata:
   - Ganti rasio dari `aspect-[21/9]` menjadi `aspect-video` (16:9).
   - Berikan sudut melengkung `rounded-xl sm:rounded-2xl border border-border/80 bg-zinc-100 shadow-md my-5 sm:my-6`.
   - Perbarui tampilan *fallback* jika `coverPreviewUrl` belum ada dengan lencana identitas UPTD IFK Kotabaru.
4. Posisikan tubuh artikel di bawah foto sampul:
   - Tipografi `prose prose-zinc max-w-none text-zinc-800 text-sm sm:text-base leading-relaxed md:leading-7`.
   - Tetap sediakan tampilan kosong berpola garis putus-putus (*dashed border*) jika naskah belum diisi.

---

### Task 2: Verifikasi Dev Server & Uji Tampilan Modal Pratinjau

**Tindakan:**
1. Pastikan dev server di port 3003 aktif dan merespons `200 OK`.
2. Uji alur antarmuka formulir berita admin di `http://43.129.57.214/profile-ifk/admin/berita/baru` atau edit berita:
   - Klik tombol **"Pratinjau"**.
   - Periksa urutan elemen: Header berada di atas, Foto Sampul 16:9 di tengah, dan Isi Naskah di bawah.
   - Periksa metadata: Inisial avatar pengunggah tampil benar, tanggal terformat lokal Indonesia, dan estimasi waktu baca dinamis muncul (*misal: 1 menit baca*).
   - Periksa toggle mode: Tombol **Desktop** dan **Mobile (390px)** beralih secara mulus.
   - Periksa penutupan: Tombol 'X', tombol 'Tutup Pratinjau', maupun tombol keyboard `Esc` berfungsi semestinya.

---

### Task 3: Git Commit, Push Branch, Pembukaan PR, & Pembaruan Project Board PNS

**Tindakan:**
1. Commit berkas plan dan perubahan kode:
   `git add docs/superpowers/plans/2026-09-17-admin-article-preview-modal-alignment.md src/components/admin/article-preview-modal.tsx`
   `git commit -m "feat(admin-berita): selaraskan modal pratinjau dengan tata letak publik (#70)"`
2. Push branch ke remote:
   `git push origin feat/70-admin-preview-modal-alignment`
3. Buat Pull Request ke `develop` dengan deskripsi lengkap, tautan penutup `Closes #70`, dan redaksi SKP e-Kinerja:
   > *"Melakukan penyelarasan tata letak dan hierarki visual pada modul simulasi pratinjau warta kesehatan di antarmuka pengelola konten agar selaras dengan tampilan portal publik, guna menjamin ketepatan penyajian informasi sebelum dipublikasikan kepada masyarakat."*
4. Perbarui status Issue #70 dan PR baru di GitHub Project Board "PNS" ke status **In progress**.
