# Spesifikasi Desain: Optimasi OpenGraph Metadata & Pratinjau Media Sosial

- **Tanggal Dokumen:** 2026-10-04
- **Terkait Issue:** [#112](https://github.com/ramanovaris/profile-ifk/issues/112)
- **Status:** Approved by User (Ready for Implementation Planning)
- **Target Rilis:** Branch `feat/112-opengraph-social-previews` -> `develop`

---

## 1. Latar Belakang & Tujuan
Saat pengguna membagikan tautan halaman publik atau artikel warta UPTD Instalasi Farmasi Kab. Kotabaru ke platform pesan instan (WhatsApp, Telegram) maupun media sosial (Facebook, X/Twitter), peramban mengandalkan metadata OpenGraph (`og:*`) dan Twitter Card (`twitter:*`) untuk menyusun kartu pratinjau (*rich link preview*).

Tanpa metadata yang lengkap dan absolut:
1. Kartu pratinjau tidak menampilkan gambar sampul berita atau foto gedung instansi.
2. Deskripsi cuplikan kosong atau hanya menampilkan teks acak.
3. Tautan tidak memiliki URL kanonikal resmi, sehingga berisiko terpecah dalam indeks mesin pencari.

Tujuan dari implementasi ini adalah melengkapi seluruh halaman publik dengan metadata OpenGraph terstruktur, gambar pratinjau kontekstual berkualitas tinggi, kartu Twitter berformat `summary_large_image`, dan URL kanonikal yang valid.

---

## 2. Arsitektur Teknis

### A. Konfigurasi Global & `metadataBase` (`src/app/layout.tsx`)
Next.js App Router memerlukan `metadataBase` agar URL gambar dan kanonikal yang didefinisikan secara relatif dapat dikonversi menjadi URL absolut secara otomatis saat rendering HTML.

1. **Resolusi Domain:**
   ```ts
   const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://43.129.57.214/profile-ifk";
   ```
2. **Metadata Global:**
   - `metadataBase`: `new URL(siteUrl)`
   - `title`: `{ default: "UPTD Instalasi Farmasi Kab. Kotabaru", template: "%s | UPTD Instalasi Farmasi Kab. Kotabaru" }`
   - `description`: "Website resmi UPTD Instalasi Farmasi Kabupaten Kotabaru — Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat."
   - `openGraph`:
     - `type`: `"website"`
     - `locale`: `"id_ID"`
     - `siteName`: `"UPTD Instalasi Farmasi Kab. Kotabaru"`
     - `images`: `[{ url: "/images/kantor-ifk.webp", width: 1200, height: 630, alt: "Gedung Kantor UPTD Instalasi Farmasi Kab. Kotabaru" }]`
   - `twitter`:
     - `card`: `"summary_large_image"`
     - `images`: `["/images/kantor-ifk.webp"]`

---

### B. Metadata Halaman Publik Statis

1. **Beranda (`/` di `src/app/(public)/page.tsx`):**
   - `title`: `"Beranda"`
   - `description`: `"Pusat distribusi logistik farmasi, pengelolaan ketersediaan obat, vaksin, dan BMHP terpadu Kabupaten Kotabaru."`
   - `alternates`: `{ canonical: "/" }`
   - `openGraph`: Gambar gedung kantor IFK.

2. **Profil Instansi (`/profil` di `src/app/(public)/profil/page.tsx`):**
   - `title`: `"Profil & Struktur Organisasi"`
   - `description`: `"Profil instansi, visi misi, tupoksi, dan susunan organisasi UPTD Instalasi Farmasi Kab. Kotabaru."`
   - `alternates`: `{ canonical: "/profil" }`
   - `openGraph`: Gambar gedung kantor IFK.

3. **Standar Layanan (`/layanan` di `src/app/(public)/layanan/page.tsx`):**
   - `title`: `"Standar Pelayanan & Distribusi"`
   - `description`: `"Standar alur pelayanan distribusi obat dan perbekalan kesehatan bagi faskes binaan se-Kabupaten Kotabaru."`
   - `alternates`: `{ canonical: "/layanan" }`
   - `openGraph`: Gambar Cold Room penyimpanan vaksin (`/images/cold-room-ifk.webp`).

4. **Ketersediaan Stok (`/stok` di `src/app/(public)/stok/page.tsx`):**
   - `title`: `"Ketersediaan Stok Obat & BMHP"`
   - `description`: `"Informasi transparansi ketersediaan stok fisik perbekalan farmasi pada UPTD Instalasi Farmasi Kab. Kotabaru per akhir bulan."`
   - `alternates`: `{ canonical: "/stok" }`
   - `openGraph`: Gambar gedung kantor IFK.

5. **Warta & Informasi (`/berita` di `src/app/(public)/berita/page.tsx`):**
   - `title`: `"Berita & Informasi Publik"`
   - `description`: `"Publikasi warta kegiatan, distribusi logistik, dan pengumuman resmi kefarmasian Kabupaten Kotabaru."`
   - `alternates`: `{ canonical: "/berita" }`
   - `openGraph`: Gambar gedung kantor IFK.

6. **Kontak & Pengaduan (`/kontak` di `src/app/(public)/kontak/page.tsx`):**
   - `title`: `"Kontak & Layanan Pengaduan"`
   - `description`: `"Hubungi UPTD Instalasi Farmasi Kab. Kotabaru untuk informasi layanan, koordinasi faskes, atau pengaduan resmi."`
   - `alternates`: `{ canonical: "/kontak" }`
   - `openGraph`: Gambar gedung kantor IFK.

---

### C. Metadata Dinamis Detail Berita (`src/app/(public)/berita/[slug]/page.tsx`)

Fungsi `generateMetadata(props)` ditingkatkan untuk mengekstrak data artikel:
1. **Pembersihan Ringkasan (Excerpt Stripper):**
   - Membuat helper utilitas ringan untuk menghapus tag HTML `<p>`, `<a>`, format markdown, dan spasi berlebih dari kolom `content`.
   - Mengambil maksimal 160 karakter pertama diakhiri elipsis (`...`) sebagai `description` pratinjau.
2. **Penentuan Gambar Sampul:**
   - Memeriksa `article.coverImage`.
   - Jika tersedia, gunakan gambar sampul artikel tersebut sebagai `og:image` dan `twitter:image`.
   - Jika tidak ada gambar sampul, gunakan fallback ke `/images/kantor-ifk.webp`.
3. **Atribut OpenGraph & Twitter Lengkap:**
   - `openGraph`:
     - `title`: `article.title`
     - `description`: ringkasan 160 karakter
     - `url`: `/berita/${slug}`
     - `type`: `"article"`
     - `publishedTime`: `article.publishedAt.toISOString()`
     - `authors`: `[article.author.name || "Administrator"]`
     - `images`: `[{ url: coverImageUrl, width: 1200, height: 630, alt: article.title }]`
   - `twitter`:
     - `card`: `"summary_large_image"`
     - `title`: `article.title`
     - `description`: ringkasan 160 karakter
     - `images`: `[coverImageUrl]`
   - `alternates`:
     - `canonical`: `/berita/${slug}`

---

## 3. Strategi Pengujian & Verifikasi

Membuat skrip verifikasi otomatis `scripts/verify-opengraph-metadata.ts`:
1. Melakukan request HTTP `GET` ke 7 rute publik:
   - `/` (Beranda)
   - `/profil`
   - `/layanan`
   - `/stok`
   - `/berita`
   - `/berita/sosialisasi-sistem-informasi-kefarmasian` (atau slug artikel pertama yang tersedia)
   - `/kontak`
2. Memeriksa keberadaan tag HTML kunci pada tag `<head>`:
   - `<meta property="og:title" ...>`
   - `<meta property="og:description" ...>`
   - `<meta property="og:image" ...>`
   - `<meta property="og:url" ...>`
   - `<meta name="twitter:card" content="summary_large_image" ...>`
   - `<link rel="canonical" ...>`
3. Memastikan gambar pratinjau detail artikel sesuai dengan gambar sampul artikel yang bersangkutan.

---

## 4. Kriteria Keberhasilan (Acceptance Criteria)
- [x] Desain spesifikasi disetujui pengguna.
- [ ] Seluruh 7 rute publik merender tag OpenGraph dan Twitter Card yang valid.
- [ ] Detail berita menampilkan judul artikel, cuplikan isi ringkas, dan gambar sampul riil pada pratinjau WhatsApp/Telegram.
- [ ] Skrip verifikasi `scripts/verify-opengraph-metadata.ts` lulus 100%.
- [ ] Pipeline CI GitHub Actions berstatus hijau tanpa peringatan.
