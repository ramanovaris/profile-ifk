# Spesifikasi Desain: Integrasi Sitemap XML & Robots.txt Dinamis

- **Tanggal Dokumen:** 2026-10-04
- **Terkait Issue:** [#114](https://github.com/ramanovaris/profile-ifk/issues/114)
- **Status:** Approved by User (Ready for Implementation)
- **Target Rilis:** Branch `feat/114-sitemap-robots-seo` -> `develop`

---

## 1. Latar Belakang & Tujuan

Mesin pencari (seperti Googlebot dan Bingbot) mengandalkan dua berkas standar web untuk mengindeks situs secara efisien:
1. **`sitemap.xml`:** Peta situs yang mendaftar seluruh URL halaman resmi instansi beserta tanggal modifikasi terakhir (`lastmod`), perkiraan frekuensi pembaruan (`changefreq`), dan tingkat kepentingan perayapan (`priority`).
2. **`robots.txt`:** Berkas instruksi bagi robot perayap yang mengarahkan perayapan hanya ke halaman publik resmi dan melarang perayapan pada rute internal operasional (seperti halaman admin `/admin/` dan endpoint internal `/api/`), sekaligus memberitahukan letak berkas `sitemap.xml`.

Tujuan dari implementasi ini adalah mengintegrasikan berkas rute bawaan Next.js App Router (`sitemap.ts` dan `robots.ts`) dengan dukungan subfolder (`basePath`), penyertaan dinamis artikel berita yang terbit, dan pertahanan terhadap potensi kegagalan koneksi data.

---

## 2. Arsitektur Teknis

### A. Resolusi Base URL & Base Path (`src/lib/seo.ts`)
Karena situs profil IFK dapat dijalankan pada lingkungan lokal (`http://localhost:3000` atau `http://localhost:3003/profile-ifk/`) maupun di lingkungan produksi di balik reverse proxy Nginx (`https://ramanovaris.my.id/profile-ifk/`), penyusunan URL absolut memerlukan helper tunggal yang konsisten:

```ts
export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ramanovaris.my.id/profile-ifk";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  let url = envUrl.replace(/\/+$/, "");
  if (basePath && !url.endsWith(basePath)) {
    url = `${url}${basePath.startsWith("/") ? basePath : `/${basePath}`}`;
  }

  return url.replace(/\/+$/, "");
}

export function getAbsoluteUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") return base;
  return `${base}${cleanPath}`;
}
```

Helper ini menjamin:
- Tidak terjadi penggandaan subfolder (misal `/profile-ifk/profile-ifk`).
- Mendukung prefix `basePath` secara otomatis.
- Berkas sitemap dan robots.txt selalu menghasilkan URL absolut yang valid dan siap dikonsumsi oleh Google Search Console.

---

### B. Spesifikasi Peta Situs (`src/app/sitemap.ts`)
Menggunakan antarmuka bawaan Next.js `MetadataRoute.Sitemap`.

1. **Rute Publik Inti (6 Halaman):**
   - Beranda (`/`): Priority `1.0`, changeFrequency `'daily'`
   - Profil Instansi (`/profil`): Priority `0.8`, changeFrequency `'monthly'`
   - Standar Layanan (`/layanan`): Priority `0.8`, changeFrequency `'monthly'`
   - Ketersediaan Stok (`/stok`): Priority `0.9`, changeFrequency `'weekly'`
   - Warta Berita (`/berita`): Priority `0.9`, changeFrequency `'daily'`
   - Kontak & Lokasi (`/kontak`): Priority `0.7`, changeFrequency `'monthly'`

2. **Rute Dinamis Artikel Berita:**
   - Mengambil seluruh artikel yang berstatus `isPublished: true`.
   - Menggunakan tanggal `updatedAt` atau `publishedAt` sebagai nilai `lastModified`.
   - URL: `${baseUrl}/berita/${article.slug}`
   - Priority `0.7`, changeFrequency `'weekly'`.

3. **Ketahanan / Fault-Tolerance:**
   - Seluruh pengambilan data artikel dibungkus blok `try-catch`. Jika koneksi basis data gagal, sitemap tetap berhasil menghasilkan 6 rute publik inti (HTTP 200) tanpa menimbulkan galat sistem (*safe fallback*).

---

### C. Spesifikasi Instruksi Perayap (`src/app/robots.ts`)
Menggunakan antarmuka bawaan Next.js `MetadataRoute.Robots`.

1. **Aturan Perayapan (`rules`):**
   - `userAgent`: `'*'` (berlaku untuk semua perayap mesin pencari)
   - `allow`: `'/'` (seluruh konten publik diizinkan)
   - `disallow`: `['/admin/', '/api/']` (melindungi panel administrasi dan rute API internal)
2. **Deklarasi Peta Situs (`sitemap`):**
   - Menghasilkan tautan absolut: `${baseUrl}/sitemap.xml`.

---

## 3. Strategi Pengujian & Verifikasi

1. **Unit Test Helper SEO (`scripts/test-seo-url.ts`):**
   - Memvalidasi pembentukan URL dengan variasi variabel `NEXT_PUBLIC_SITE_URL` dan `NEXT_PUBLIC_BASE_PATH` (dengan/tanpa slash, dengan/tanpa subfolder).
2. **Verifikasi HTTP Langsung (`scripts/verify-sitemap-robots.ts`):**
   - Mengirim permintaan GET ke dev server lokal (`http://localhost:3003/profile-ifk/sitemap.xml` dan `/profile-ifk/robots.txt`).
   - Memeriksa header `Content-Type: application/xml` atau `text/xml` pada sitemap, keberadaan tag `<loc>`, `<lastmod>`, dan rute publik.
   - Memeriksa struktur teks pada robots.txt (`User-agent: *`, `Disallow: /admin/`, `Sitemap:`).
3. **Pemberlakuan Hemat Memori VPS:**
   - Tidak menjalankan `npm run build` atau `npx tsc` di VPS lokal. Pengujian dilakukan melalui skrip verifikasi HTTP mandiri via `tsx`.
