# Design: `/layanan` Reveal Cascade

**Tanggal:** 2026-09-04
**Status:** Draft (menunggu review user)
**Branch:** `fix/layanan-reveal-cascade` (dari `develop`)
**Author:** brainstorming session Rama + Hermes

---

## Latar Belakang

Setelah `/profil` reveal cascade di-ship via PR #5, user mereview halaman `/layanan`
dan menemukan pola bug yang sama persis:

> "Layanan juga sama, judul yang muncul duluan, body langsung kelihatan. Harusnya
> muncul satu-satu dari atas ke bawah."

Inspeksi source `src/app/(public)/layanan/page.tsx` (227 baris) mengkonfirmasi:

- `<Reveal>` hanya membungkus `<h2>` judul tiap section (5 section: Jam Pelayanan,
  Standar Mutu, Alur LPLPO, Bon/Sewaktu, Rusak/Kedaluwarsa).
- Body section (tabel, list item, step timeline, sub-card) di-render langsung di
  bawah `<Reveal>` judul tanpa wrapper animasi.
- Efek visual: judul ke-animate pas masuk viewport, lalu body tiba-tiba sudah visible
  tanpa animasi. Tidak ada kesan "muncul satu-satu".

Sama seperti `/profil`, halaman `/layanan` punya list multi-item (3 standar mutu,
5 step LPLPO, 4 sub-bagian Bon/Sewaktu, 3 sub-bagian Rusak) yang ideal untuk
stagger per item.

## Tujuan

Memperbaiki animasi scroll-reveal di `/layanan` agar tiap section, sub-card, dan
list item muncul bertahap dari atas ke bawah saat user scroll — bukan barengan
atau hanya judul saja.

Rhythm per section dibedakan untuk memberikan feel "cinematic" yang sesuai dengan
panjang konten tiap section, mengikuti keputusan brainstorming opsi C-simple:

- Alur LPLPO (5 step) = section terpanjang, gunakan stagger lebih lambat
- Section lain = stagger standar
- Bon/Sewaktu & Rusak = container card muncul duluan, baru sub-items di dalam cascade

## Non-Tujuan

- Tidak menambah section baru (FAQ, Kontak Darurat, Download Form, dll).
- Tidak mengubah teks, ikon, data, atau copy yang sudah ada.
- Tidak mengubah `Reveal` component API atau behavior default.
- Tidak mengubah `PageHero`, navbar, footer, atau styling di luar layanan.
- Tidak menyentuh homepage, `/profil`, atau halaman public lain.

## Pendekatan

**Hybrid stagger dengan rhythm per section (C-simple):**

1. **Section-level wrap**: tiap section utama tetap memakai `<Reveal>` untuk judul.
2. **List-item stagger**: untuk list/array item, tiap item dibungkus `<Reveal>`
   dengan `delay` prop递增 (incremental).
3. **Container-card stagger** (khusus Bon/Sewaktu & Rusak/Kedaluwarsa): card
   parent muncul duluan, lalu sub-items di dalamnya cascade setelahnya.

**Komponen yang dipakai:** `Reveal` existing di `src/components/public/reveal.tsx`
sudah punya `delay` prop. Tidak perlu perubahan pada komponen.

## Perubahan per Section

| Section | Container Reveal | Stagger items | Increment | Judul → item pertama |
|---|---|---|---|---|
| Jam Pelayanan | — | Tidak (1 Reveal membungkus seluruh tabel) | — | 80ms |
| Standar Mutu & Penyimpanan | — | Ya (3 items: FEFO, Suhu, Cold Chain) | 80ms | 80ms |
| Alur Pelayanan Rutin (LPLPO) | — | Ya (5 steps: 1–5) | **120ms** (centerpiece) | 80ms |
| Permintaan Bon / Sewaktu | Ya (delay 0) | Ya (4 sub-items: Kriteria, Persyaratan, Metode, Komitmen) | 80ms | 80ms |
| Obat Rusak & Kedaluwarsa | Ya (delay 0) | Ya (3 sub-items: Waktu Pelaporan, Persyaratan, Penanganan IFK) | 80ms | 80ms |

**Catatan detail per section:**

- **Jam Pelayanan**: tabel cuma 2 baris (Senin-Kamis & Jumat). Stagger per-baris
  terasa dipaksakan. Pakai 1 Reveal membungkus seluruh `<table>` dengan delay 80ms
  setelah judul.
- **Standar Mutu & Penyimpanan**: 3 item (FEFO, Pemantauan Suhu, Cold Chain) di
  dalam `divide-y divide-border`. Stagger 80ms × 3 = 240ms total.
- **Alur LPLPO**: 5 step dalam timeline `border-l-2 border-brand-300`. Stagger
  120ms × 5 = 600ms total. Lebih dramatis, sesuai peran sebagai section terpanjang
  dan terpenting di halaman (prosedur distribusi).
- **Bon/Sewaktu**: card brand-50/60 berisi 4 sub-bagian dalam `md:grid-cols-2`.
  Container Reveal (delay 0), 4 sub-item Reveal (delay 80/160/240/320).
- **Rusak/Kedaluwarsa**: card red-50/60 berisi 3 sub-bagian stacked. Container
  Reveal (delay 0), 3 sub-item Reveal (delay 80/160/240).

**Total delay maksimal per section:**

- Jam Pelayanan: ~80ms (1 Reveal)
- Standar Mutu: 80 + 240 = ~320ms
- Alur LPLPO: 80 + 600 = ~680ms (terlama, tapi section terpanjang jadi natural)
- Bon/Sewaktu: 0 (container) + 80 + 240 = ~320ms
- Rusak: 0 (container) + 80 + 160 = ~240ms

## Detail Implementasi

### File yang berubah

- `src/app/(public)/layanan/page.tsx` — satu-satunya file yang dimodifikasi.
- `src/components/public/reveal.tsx` — TIDAK berubah.
- `src/app/globals.css` atau CSS Reveal — TIDAK berubah.

### Pola markup

**Pola 1: Section dengan list flat (Standar Mutu, Alur LPLPO)**
```tsx
<section>
  <Reveal>
    <h2>Judul</h2>
  </Reveal>
  <Reveal delay={80}>
    <p>Sub-header (jika ada)</p>
  </Reveal>
  <div>
    {items.map((item, i) => (
      <Reveal key={item.title} delay={80 + i * INCREMENT}>
        <div>...item...</div>
      </Reveal>
    ))}
  </div>
</section>
```

**Pola 2: Section dengan container card (Bon/Sewaktu, Rusak)**
```tsx
<section>
  <Reveal>
    <h2>Judul</h2>
  </Reveal>
  <Reveal delay={0}>
    <div className="card-container">
      <div>...header card...</div>
      {subItems.map((sub, i) => (
        <Reveal key={sub.title} delay={80 + i * 80}>
          <div>...sub-item...</div>
        </Reveal>
      ))}
    </div>
  </Reveal>
</section>
```

**Pola 3: Section dengan tabel (Jam Pelayanan)**
```tsx
<section>
  <Reveal>
    <h2>Judul</h2>
  </Reveal>
  <Reveal delay={80}>
    <div className="table-wrapper">
      <table>...</table>
    </div>
  </Reveal>
</section>
```

### PageHero

`PageHero` di-buang dari animasi — instant visible saat page load. Hanya section
content yang di-Reveal. Ini konsisten dengan `/profil` (PageHero tidak di-Reveal).

### Branch & PR

- Branch dari `develop`: `fix/layanan-reveal-cascade`
- 1 commit logical: `fix(layanan): stagger reveal cascade per section + list item`
- 1 file changed: `src/app/(public)/layanan/page.tsx`
- Target PR: `develop` (sesuai GitFlow)

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Alur LPLPO total delay 680ms dirasa lambat | Increment 120ms bisa di-tune ke 100ms setelah review visual. Default 120ms dulu. |
| Container Reveal + sub-items di Bon/Rusak terasa "double animation" | Container fade-in halus (300ms), sub-items cascade di belakangnya. Nuansa "kotak muncul, isi mengalir" sesuai intent. Jika terlalu bertumpuk, container bisa di-skip dan sub-items langsung dari judul (Opsi B dari brainstorm). |
| Banyak Reveal instance (~16 total) di mobile | Reveal pakai IO + GPU-only CSS (opacity/transform/filter). Observer otomatis `unobserve` setelah visible, tidak menumpuk. |
| Reduced-motion user experience | `Reveal` sudah respect `prefers-reduced-motion` (langsung visible, no animation). Tidak ada perubahan. |
| Bug homepage lain kambuh | Tidak terkait — perubahan hanya di `layanan/page.tsx`, file lain tidak disentuh. |

## Verifikasi

Setelah PR merged ke develop dan VPS auto-pull, user review di HP:

1. Buka `http://43.129.57.214/profile-ifk/layanan/` (mode desktop site).
2. Refresh halaman (penting: agar animasi reset).
3. Scroll pelan dari atas ke bawah.
4. **Expected per section:**
   - **Jam Pelayanan**: judul muncul duluan, lalu tabel muncul sebagai 1 blok (80ms kemudian).
   - **Standar Mutu**: judul → 3 item (FEFO, Suhu, Cold Chain) cascade 80ms.
   - **Alur LPLPO**: judul → sub-header → 5 step timeline cascade 120ms (paling dramatis).
   - **Bon/Sewaktu**: judul → card container muncul → 4 sub-item cascade di dalam card.
   - **Rusak**: judul → card container muncul → 3 sub-item cascade di dalam card.
5. **Bug check:** tidak ada konten yang tiba-tiba muncul tanpa animasi.
6. **Feel check:** Alur LPLPO terasa cinematic (lambat, dramatis), section lain terasa snappy.

## Out of Scope (untuk iterasi berikutnya)

- Tambah section FAQ Layanan.
- Tambah section Download Form (LPLPO, BAST, dll) dengan file PDF/Excel.
- Tambah section Kontak Darurat untuk permintaan sewaktu (telepon/WA).
- Timeline visual untuk alur (gambar alur, bukan teks).
- Data dinamis (jam pelayanan, standar mutu) dari admin/CMS.
- Pencarian/filter layanan.
- Highlight box untuk "1×24 jam" & "10 hari kerja" (komitmen waktu).

Item di atas adalah brainstorming arah masa depan, **bukan** bagian dari spec ini.
