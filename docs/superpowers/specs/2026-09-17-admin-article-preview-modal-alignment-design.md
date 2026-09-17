# Spesifikasi Teknis: Penyelarasan Tampilan Modal Pratinjau Artikel dengan Tata Letak Berita Publik Terbaru (Issue #70)

## 1. Konteks & Latar Belakang

Pada portal UPTD Instalasi Farmasi Kabupaten Kotabaru (`profile-ifk`), pembaruan tata letak halaman detail berita publik (`/berita/[slug]`) pada **#62** telah mengadopsi hierarki visual modern:
- Header artikel (Breadcrumb, Badge Kategori, Judul, Metadata) ditempatkan di bagian paling atas.
- Foto sampul ekspansif dengan rasio **16:9** diletakkan di bawah header sebelum isi naskah.
- Metadata mencakup inisial avatar pengunggah serta estimasi waktu baca (*reading time*).

Namun, komponen modal simulasi pratinjau di dashboard admin (`ArticlePreviewModal` pada `src/components/admin/article-preview-modal.tsx`) masih menggunakan struktur lama:
- Foto sampul berada di urutan pertama paling atas card dengan rasio sinematik `aspect-[21/9]`.
- Baru kemudian diikuti judul, tanggal, dan nama penulis sederhana tanpa avatar dan tanpa kalkulasi waktu baca.

**Issue #70** bertujuan menyelaraskan komponen `ArticlePreviewModal` secara 1:1 dengan struktur, proporsi, dan tipografi halaman publik terbaru sehingga admin pengelola konten mendapatkan gambaran akurat (*WYSIWYG preview*) sebelum mempublikasikan berita.

### Naskah Laporan Capaian e-Kinerja PNS (SKP):
> *"Melakukan penyelarasan tata letak dan hierarki visual pada modul simulasi pratinjau warta kesehatan di antarmuka pengelola konten agar selaras dengan tampilan portal publik, guna menjamin ketepatan penyajian informasi sebelum dipublikasikan kepada masyarakat."*

---

## 2. Analisis Perbandingan Antarmuka

| Aspek | Tampilan Pratinjau Modal Lama | Halaman Publik Baru (`/berita/[slug]`) | Rancangan Pembaruan Modal Baru |
|---|---|---|---|
| **Urutan Elemen** | Cover Image &rarr; Header/Judul &rarr; Konten | Header &rarr; Cover Image &rarr; Konten | **Header &rarr; Cover Image &rarr; Konten** |
| **Rasio Cover** | `aspect-[21/9]` | `aspect-video` (16:9) | **`aspect-video` (16:9)** |
| **Badge Kategori** | `bg-brand-50 text-brand-700` | `bg-brand-50 text-brand-700 border border-brand-200/60 rounded-full text-xs px-3 py-1 font-medium` | **Identik dengan publik (`rounded-full`, border lembut)** |
| **Judul H1** | `text-xl font-bold tracking-tight text-heading sm:text-2xl md:text-3xl` | `text-2xl font-extrabold tracking-tight text-heading sm:text-3xl md:text-4xl lg:text-5xl` | **`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-heading`** (proporsional dalam modal) |
| **Avatar Penulis** | Ikon lucide `User` kecil | Inisial lingkaran `bg-brand-50 border border-brand-200 text-brand-700` | **Inisial lingkaran identik publik** |
| **Reading Time** | Belum ada | `X menit baca` (rata-rata 200 kata/menit) | **Dihitung otomatis dinamis `X menit baca`** |
| **Cover Fallback** | Ikon file sederhana | Banner identitas UPTD IFK Kotabaru | **Placeholder identitas UPTD IFK Kotabaru** |

---

## 3. Detail Perubahan Struktur Komponen (`ArticlePreviewModal`)

### A. Perhitungan Estimasi Waktu Baca (*Reading Time*)
Menghitung estimasi durasi membaca secara otomatis dari naskah HTML editor:
```tsx
const plainText = (data.content || "").replace(/<[^>]*>/g, " ").trim();
const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
```

### B. Restrukturisasi Blok Konten di Dalam Kartu Pratinjau

Di dalam kontainer pratinjau (`viewportMode === "desktop"` maupun `"mobile"`):

1. **Header Artikel (Di atas Foto Sampul):**
   - **Breadcrumb:** Menggunakan komponen `Breadcrumb` dengan item `Beranda`, `Berita`, dan `[Nama Kategori]`. Tautan non-aktif (`href="#"` dengan pencegahan navigasi) agar tidak menutup modal.
   - **Badge Kategori:**
     ```tsx
     <Badge
       variant="default"
       className="mt-4 inline-flex bg-brand-50 text-brand-700 border border-brand-200/60 font-medium px-3 py-1 rounded-full text-xs"
     >
       {displayCategory}
     </Badge>
     ```
   - **Judul Artikel:**
     ```tsx
     <h1 className="mt-3 text-xl font-extrabold tracking-tight text-heading sm:text-2xl md:text-3xl leading-snug">
       {displayTitle}
     </h1>
     ```
   - **Metadata Sebaris:**
     ```tsx
     <div className="mt-4 flex flex-wrap items-center gap-y-1.5 text-xs sm:text-sm text-muted">
       <div className="flex items-center gap-2 font-medium text-zinc-800">
         <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 border border-brand-200 text-[11px] font-semibold text-brand-700">
           {displayAuthor.charAt(0).toUpperCase()}
         </span>
         <span>{displayAuthor}</span>
       </div>
       <span className="mx-2 text-zinc-400">&middot;</span>
       <time className="font-mono text-xs text-zinc-600">
         {formattedDate}
       </time>
       <span className="mx-2 text-zinc-400">&middot;</span>
       <span className="font-mono text-xs text-zinc-600">
         {readingMinutes} menit baca
       </span>
     </div>
     ```

2. **Foto Sampul Ekspansif 16:9 (`aspect-video`):**
   - Diletakkan tepat di bawah header metadata.
   - Sudut melengkung halus `rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 bg-zinc-100 shadow-md my-6`.
   - Menggunakan `Image` dengan `fill` dan `object-cover`.
   - Jika belum ada gambar cover (`!data.coverPreviewUrl`), menampilkan placeholder UPTD IFK:
     ```tsx
     <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-100 p-6 text-center text-zinc-600">
       <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-brand-700 shadow-xs">
         <span className="text-xs font-bold">IFK</span>
       </div>
       <span className="text-xs font-medium text-zinc-600">
         UPTD Instalasi Farmasi Kabupaten Kotabaru
       </span>
     </div>
     ```

3. **Isi Naskah Berita (*Prose Body*):**
   - Diletakkan di bawah foto sampul.
   - Menggunakan `prose prose-zinc max-w-none text-zinc-800 text-sm sm:text-base leading-relaxed md:leading-7`.
   - Tetap menyediakan area visual terformat jika naskah editor masih kosong.

---

## 4. Simulasi Viewport (Desktop & Mobile 390px)

- **Mode Desktop:**
  - Lebar maksimum: `max-w-3xl`.
  - Padding nyaman: `p-6 sm:p-8`.
  - Tampilan proporsional mensimulasikan layar monitor pengguna publik.
- **Mode Mobile (HP 390px):**
  - Lebar tetap: `max-w-[390px]`.
  - Bingkai ponsel dengan `ring-8 ring-zinc-900/60 rounded-3xl border border-zinc-800 bg-surface shadow-2xl p-4 sm:p-5 my-2`.
  - Skala teks dan ukuran gambar beradaptasi otomatis sesuai rasio layar ponsel pintar.

---

## 5. Rencana Pengujian & Kriteria Keberhasilan

1. **Akurasi Urutan:** Header &rarr; Foto Sampul 16:9 &rarr; Isi Naskah tampil dengan urutan yang tepat.
2. **Metadata Lengkap:** Avatar inisial pengunggah, nama penulis, tanggal Indonesia, dan estimasi waktu baca (`X menit baca`) tampil rapi.
3. **Kesesuaian Rasio Gambar:** Gambar sampul tampil dalam rasio 16:9 (`aspect-video`) tanpa distorsi atau cropping janggal.
4. **Fallback Placeholder:** Ketika artikel belum memiliki gambar sampul, placeholder identitas UPTD IFK tampil proporsional.
5. **Dua Mode Viewport:** Pengalihan antara tombol *Desktop* dan *Mobile* berjalan mulus dan tetap terisolasi di dalam modal.
6. **Kualitas Kode:** Lolos uji tipe TypeScript dan linting ESLint tanpa *warning* baru.
