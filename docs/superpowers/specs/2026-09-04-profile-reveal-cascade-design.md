# Design: `/profil` Reveal Cascade

**Tanggal:** 2026-09-04
**Status:** Draft (menunggu review user)
**Branch:** `fix/profile-reveal-cascade` (dari `develop`)
**Author:** brainstorming session Rama + Hermes

---

## Latar Belakang

User mereview halaman `/profil` dari HP (desktop site mode) dan melaporkan:

> "Tadi aku buka halaman Profile nya, animasinya kaya gak pas gitu muncul konten nya,
> harusnya kan muncul satu-satu dari atas ke bawah, tapi tadi yang ku lihat animasinya
> masih cuman judul nya saja sepertinya"

Inspeksi source `src/app/(public)/profil/page.tsx` (169 baris) mengkonfirmasi:

- `<Reveal>` hanya membungkus `<h2>` judul tiap section (4 section: Sambutan, Visi-Misi,
  Tupoksi, Struktur Organisasi).
- Body section (paragraf, list, foto) di-render langsung di bawah `<Reveal>` judul tanpa
  wrapper animasi.
- Efek visual: judul ke-animate pas masuk viewport, lalu body tiba-tiba sudah visible
  tanpa animasi. Tidak ada kesan "muncul satu-satu".

Pada homepage sudah ada fix Reveal sebelumnya (PR #4: `threshold: 0`, `rootMargin -10%`,
fallback 1.5s, `prefers-reduced-motion`). Fix homepage sudah cukup karena section
homepage pendek (1 Reveal per section, body di dalam). Halaman `/profil` lebih panjang
dan punya list multi-item (4 Misi, 3 Tugas Pokok, 5 Fungsi) yang tidak ada di homepage,
membutuhkan stagger per item.

## Tujuan

Memperbaiki animasi scroll-reveal di `/profil` agar tiap section dan list item muncul
bertahap dari atas ke bawah saat user scroll — bukan barengan atau hanya judul saja.

## Non-Tujuan

- Tidak menambah section baru (Timeline, Peta, Gallery, dll).
- Tidak mengubah teks, foto, data, atau copy yang sudah ada.
- Tidak mengubah `Reveal` component API atau behavior default.
- Tidak mengubah `PageHero`, navbar, footer, atau styling di luar profil.
- Tidak menyentuh homepage atau halaman public lain.

## Pendekatan

**Hybrid stagger (section-level + list-item stagger):**

1. **Section-level wrap**: tiap `<section>` utama dibungkus / memiliki beberapa `<Reveal>`
   yang membungkus blok konten besar (judul, blok paragraf, blok list).
2. **List-item stagger**: untuk list multi-item (Misi, Tugas Pokok, Fungsi), tiap `<li>`
   dibungkus `<Reveal>` dengan `delay` prop递增 (incremental) sehingga item muncul
   berurutan dengan jeda 60ms.

**Komponen yang dipakai:** `Reveal` existing di `src/components/public/reveal.tsx`
sudah punya `delay` prop (line 11, 59). Tidak perlu perubahan pada komponen.

## Perubahan per Section

| Section | Reveal yang ditambah | Stagger delay (ms) |
|---|---|---|
| Sambutan | 1 Reveal membungkus judul+h2 block. Body paragraf dibungkus Reveal kedua. | judul 0, body 80 |
| Visi & Misi | 3 Reveal: judul, Visi quote, lalu tiap Misi item | judul 0, Visi 80, Misi 0/60/120/180 |
| Tupoksi | judul Reveal + Tugas Pokok block + 3 item Reveal + Fungsi block + 5 item Reveal | judul 0, TP-block 80, TP-items 0/60/120, Fn-block 80 (relatif terhadap section), Fn-items 0/60/120/180/240 |
| Struktur Organisasi | 1 Reveal membungkus judul+image | judul 0 |

**Catatan delay Tupoksi:** karena Tugas Pokok dan Fungsi berada di section yang sama
dan sama-sama terlihat di viewport, delaynya dikumulatifkan dari atas section. Estimasi:
judul 0 → TP-block 80 → TP-item1 160 → TP-item2 220 → TP-item3 280 → Fn-block 360 →
Fn-item1 440 → Fn-item2 500 → Fn-item3 560 → Fn-item4 620 → Fn-item5 680. Total ~700ms
untuk section Tupoksi penuh. Masih dalam batas "smooth" (user tidak merasa lambat).

## Detail Implementasi

### File yang berubah

- `src/app/(public)/profil/page.tsx` — satu-satunya file yang dimodifikasi.
- `src/components/public/reveal.tsx` — TIDAK berubah.
- `src/app/globals.css` atau CSS Reveal — TIDAK berubah.

### Pola markup

Sebelum (sekarang):
```tsx
<section>
  <Reveal><h2>Judul</h2></Reveal>
  <div>...konten tanpa Reveal...</div>
</section>
```

Sesudah (untuk section dengan list):
```tsx
<section>
  <Reveal><h2>Judul</h2></Reveal>
  <Reveal delay={80}>
    <h3>Sub-judul</h3>
  </Reveal>
  <ul>
    {items.map((item, i) => (
      <Reveal key={i} delay={160 + i * 60}>
        <li>...</li>
      </Reveal>
    ))}
  </ul>
</section>
```

### Branch & PR

- Branch dari `develop`: `fix/profile-reveal-cascade`
- 1 commit logical: `fix(profil): stagger reveal cascade per section + list item`
- 1 file changed: `src/app/(public)/profil/page.tsx`
- Target PR: `develop` (sesuai GitFlow)

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Banyak Reveal instance → berat di mobile | Reveal pakai IO + GPU-only CSS (opacity/transform/filter). Maks ~16 instance per halaman, masih aman. |
| Total delay terlalu lama di Tupoksi (700ms) | Gunakan delay lebih kecil (40ms) untuk item agar total ~500ms jika dirasa lambat. Default 60ms dulu, adjust setelah review visual. |
| Reduced-motion user experience | `Reveal` sudah respect `prefers-reduced-motion` (langsung visible, no animation). Tidak ada perubahan. |
| IO threshold 0 + banyak observer | Threshold 0 + `rootMargin -10%` artinya trigger saat 10% section masuk viewport. Untuk list stagger, observer pada tiap `<li>` — tapi observer otomatis `unobserve` setelah visible, jadi tidak menumpuk. |

## Verifikasi

Setelah PR merged ke develop dan VPS auto-pull, user review di HP:

1. Buka `http://43.129.57.214/profile-ifk/profil/` (mode desktop site).
2. Refresh halaman (penting: agar animasi reset).
3. Scroll pelan dari atas ke bawah.
4. **Expected:** tiap section judul muncul duluan, lalu body, lalu tiap list item muncul
   berurutan dengan jeda halus. Total animasi per section terasa ~400-700ms.
5. **Bug check:** tidak ada konten yang tiba-tiba muncul tanpa animasi.

## Out of Scope (untuk iterasi berikutnya)

- Sambutan Kepala layout overhaul (foto portrait besar, signature, callout).
- Visi quote typography hero treatment.
- Struktur Organisasi sebagai bagan pohon/card per jabatan.
- Peta Lokasi (Google Maps embed dari `siteConfig.googleMapsEmbedUrl`).
- Timeline sejarah instansi.
- Gallery kegiatan.
- Sub-route `/profil/[section]` dengan sidebar nav.
- Data dinamis (admin edit via CMS).

Item di atas adalah brainstorming arah masa depan, **bukan** bagian dari spec ini.
