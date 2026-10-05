# Spesifikasi Desain: Fitur Berbagi Artikel ke Media Sosial dan Salin Tautan (Issue #121)

## 1. Ringkasan & Latar Belakang

Fitur ini menyediakan fasilitas interaktif bagi pembaca untuk menyebarluaskan warta dan artikel resmi UPTD Instalasi Farmasi Kabupaten (IFK) Kotabaru ke berbagai jejaring media sosial (WhatsApp, Telegram, Facebook, X/Twitter), salin tautan langsung ke papan klip (*clipboard*), serta pemanfaatan *Web Share API* bawaan peramban perangkat seluler.

Penyebaran informasi kefarmasian (seperti rilis stok obat publik, edukasi penggunaan obat, dan pengumuman dinas) memerlukan kemudahan akses satu klik (*one-click share*) agar masyarakat dan pemangku kepentingan dapat membagikan tautan secara cepat dan akurat.

---

## 2. Tujuan & Sasaran Fitur

1. **Kemudahan Diseminasi:** Pembaca dapat membagikan artikel langsung ke aplikasi pesan dan media sosial tanpa harus menyalin URL manual dari bilah alamat peramban.
2. **Pengalaman Pengguna Adaptif (*Dual Bar*):**
   - **Bilah Atas (*Top Compact Bar*):** Diletakkan di bawah metadata artikel (penulis & tanggal baca) sebelum foto sampul untuk pembaca yang ingin segera menyalin/membagikan tautan.
   - **Bilah Bawah (*Bottom Rich Card*):** Diletakkan di akhir naskah artikel sebelum seksi "Berita Lainnya" berupa kartu ajakan (*callout*) yang menonjolkan nilai edukasi keterbukaan informasi publik.
3. **Dukungan Perangkat Seluler Prima:** Mengintegrasikan *Native Web Share API* (`navigator.share`) jika didukung oleh peramban HP, serta memastikan target sentuh (*touch target*) minimal 40px tanpa meluap (*no horizontal overflow*).
4. **Performa & SEO Terjaga:** Mempertahankan `src/app/(public)/berita/[slug]/page.tsx` sebagai Server Component murni; interaktivitas tombol diisolasi dalam Client Component terpisah.

---

## 3. Arsitektur Komponen

```
src/app/(public)/berita/[slug]/page.tsx (Server Component)
  ├── <header>
  │     ├── <Breadcrumb />
  │     ├── <Badge>Kategori</Badge>
  │     ├── <h1>Judul Artikel</h1>
  │     ├── <div className="metadata">Penulis, Tanggal, Durasi</div>
  │     └── <ArticleShareBar variant="compact" title={title} url={articleUrl} />  <── BARU (Atas)
  │
  ├── <section className="foto-sampul">
  │     └── <Image ... />
  │
  ├── <section className="naskah-artikel">
  │     ├── <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />
  │     └── <ArticleShareBar variant="card" title={title} url={articleUrl} />     <── BARU (Bawah)
  │
  └── <section className="berita-lainnya">
        └── ...
```

### Berkas Baru:
- `src/components/public/article-share-bar.tsx` (Client Component):
  - Menerima props:
    ```typescript
    interface ArticleShareBarProps {
      title: string;
      slug: string;
      variant?: "compact" | "card";
      className?: string;
    }
    ```
  - Menghitung URL kanonikal secara aman di sisi klien (`window.location.origin + /berita/[slug]`) dengan fallback aman saat SSR / *initial render*.

---

## 4. Rincian Saluran Berbagi & Mekanisme Interaksi

1. **WhatsApp:**
   - URL: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + "\n\n" + shareUrl)}`
   - Target: `_blank`, `rel="noopener noreferrer"`.
2. **Telegram:**
   - URL: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
   - Target: `_blank`, `rel="noopener noreferrer"`.
3. **Facebook:**
   - URL: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
   - Target: `_blank`, `rel="noopener noreferrer"`.
4. **X (Twitter):**
   - URL: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
   - Target: `_blank`, `rel="noopener noreferrer"`.
5. **Salin Tautan (*Copy Link*):**
   - Menggunakan `navigator.clipboard.writeText(shareUrl)` dengan fallback aman `document.execCommand("copy")`.
   - Memberikan umpan balik visual (*state `copied: boolean`*) selama 2.000 milidetik (ikon berganti centang hijau, teks beralih menjadi *"Tersalin!"*).
6. **Web Share API Native (Seluler):**
   - Mendeteksi ketersediaan `typeof navigator !== 'undefined' && !!navigator.share`.
   - Jika tersedia, tombol pemicu utama *"Bagikan"* akan membuka dialog berbagi bawaan sistem operasi (Android Share Sheet / iOS Share Sheet).

---

## 5. Tata Letak & Estetika Visual (*Clean Light*)

### A. Varian Compact (`variant="compact"`)
- Terpasang di bawah metadata artikel pada `header`.
- Berupa baris fleksibel horizontal berjarak rapat (`flex items-center gap-2 pt-4 border-t border-border/60`).
- Label halus: *"Bagikan:"* (`text-xs font-medium text-zinc-500`).
- Tombol lingkaran/persegi melengkung (`h-8 w-8 rounded-lg`) dengan batas garis netral (`border border-border/80 bg-white/80 hover:bg-brand-50 hover:border-brand-200 transition-colors`).

### B. Varian Card (`variant="card"`)
- Terpasang di akhir naskah artikel, sebelum seksi *"Berita Lainnya"*.
- Menggunakan kartu beraksen lembut (`rounded-2xl border border-brand-200/50 bg-gradient-to-br from-brand-50/40 via-white to-zinc-50/50 p-6 sm:p-7 shadow-xs`).
- Teks ajakan:
  - Judul: *"Bagikan Informasi Ini"* (`text-base font-bold text-heading`).
  - Deskripsi: *"Dukung keterbukaan informasi dan edukasi kesehatan kefarmasian dengan membagikan warta ini kepada rekan dan masyarakat."* (`text-sm text-zinc-600 mt-1`).
- Deretan tombol aksi dengan ikon + label nama platform yang ramah sentuhan (`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold`).

---

## 6. Penanganan Kasus Batas (*Edge Cases & Resilience*)

1. **Kompatibilitas SSR / Hidrasi:**
   - Menghindari akses langsung ke `window.location` saat render awal Server. URL dibentuk berbasis props `slug` atau state klien setelah komponen terpasang (`useEffect` / mount).
2. **Ketiadaan Ikon Lucide untuk Brand Medsos:**
   - Lucide-react versi modern tidak menyertakan logo Facebook, Twitter/X, dan WhatsApp. Disediakan komponen SVG vektor presisi mandiri di dalam berkas tombol berbagi.
3. **Fallback Salin Clipboard:**
   - Jika `navigator.clipboard` terblokir oleh kebijakan iframe/keamanan, fallback berbasis *textarea dummy* aktif otomatis tanpa melempar eksepsi error.
4. **Responsif Layar Sempit (<360px):**
   - Kontainer tombol menggunakan `flex-wrap gap-2` sehingga tombol tidak pernah terpotong atau menimbulkan *horizontal scroll*.

---

## 7. Rencana Pengujian & Verifikasi

1. **Uji Fungsionalitas Tautan Berbagi:**
   - Verifikasi URL WhatsApp, Telegram, Facebook, dan X menghasilkan parameter teks dan tautan yang valid.
2. **Uji Salin Tautan:**
   - Verifikasi teks tersalin ke clipboard dan indikator centang muncul selama 2 detik.
3. **Uji Web Share API:**
   - Verifikasi pemanggilan `navigator.share` pada peramban seluler.
4. **Uji Responsif & Estetika Visual:**
   - Verifikasi tampilan *Compact Bar* dan *Card Bar* pada layar HP (360px–412px) dan Desktop (>1024px).
5. **Uji Build & CI:**
   - Verifikasi tidak ada galat TypeScript dan linter Next.js.

---

## 8. Naskah Capaian e-Kinerja PNS (SKP)

> *"Mengembangkan fitur berbagi artikel berita ke kanal media sosial dan salin tautan pada halaman publik website Profile IFK guna memperluas penyebarluasan informasi kefarmasian dan memudahkan akses publikasi bagi masyarakat."*
