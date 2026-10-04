# Implementasi Optimalisasi Hero Halaman Publik di Layar Desktop (#122)

> **For agentic workers:** Jalankan tugas secara bertahap dan terverifikasi untuk setiap langkah.

**Goal:** Mengoptimalkan tata letak `PageHero` pada halaman publik di layar desktop dengan arsitektur 2 kolom seimbang serta menghadirkan kartu informasi ringkas kontekstual di zona kanan.

**Architecture:** Memperbarui komponen `PageHero` untuk menerima slot `rightContent` opsional. Di layar desktop (`lg:`), kontainer menggunakan grid 2 kolom dengan pemisah garis halus tengah, sementara di perangkat seluler (`< lg`) kartu kanan disembunyikan agar tampilan tetap ramping dan fokus.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React Icons.

## Global Constraints
- Tidak menjalankan `next build` atau `npm run lint` menyeluruh di VPS untuk menjaga kestabilan memori RAM (2GB).
- Setiap task wajib diverifikasi secara mandiri menggunakan skrip uji atau validasi HTTP.
- Mempertahankan estetika *Dark Ethereal* (latar gelap, orbs aurora halus, border `white/10`, teks `brand-300`).

---

### Task 1: Peningkatan Komponen Inti `PageHero`

**Files:**
- Modify: `src/components/public/page-hero.tsx`
- Create: `scripts/verify-public-hero-layout.ts`

**Interfaces:**
- Consumes: `PageHeroProps`
- Produces: Slot `rightContent?: React.ReactNode` dengan layout adaptif 2 kolom di breakpoint `lg:`.

- [ ] **Step 1: Buat skrip verifikasi otomatis** — `scripts/verify-public-hero-layout.ts` untuk memvalidasi keberadaan slot `rightContent` dan respon HTTP kelima halaman publik.
- [ ] **Step 2: Perbarui komponen `PageHero`** — tambahkan prop `rightContent?: React.ReactNode` dan kelas grid responsif:
  ```tsx
  <div className={cn(rightContent ? "grid gap-12 lg:grid-cols-2 lg:items-center" : "max-w-2xl")}>
    <div className="max-w-2xl">
      {/* Kolom Kiri: Breadcrumb, eyebrow, title, subtitle */}
    </div>
    {rightContent && (
      <div className="hidden lg:block lg:pl-6">
        {rightContent}
      </div>
    )}
  </div>
  ```
- [ ] **Step 3: Uji verifikasi script** — jalankan `npx tsx scripts/verify-public-hero-layout.ts` untuk memastikan tidak ada kesalahan sintaks.
- [ ] **Step 4: Commit** — `git add src/components/public/page-hero.tsx scripts/verify-public-hero-layout.ts && git commit -m "feat(ui): dukungan slot rightContent pada komponen PageHero (#122)"`

---

### Task 2: Kartu Kontekstual Halaman Layanan (`/layanan`)

**Files:**
- Modify: `src/app/(public)/layanan/page.tsx`

**Interfaces:**
- Consumes: `PageHero` dengan `rightContent`
- Produces: Kartu Pelayanan Operasional & Akses Faskes di hero `/layanan`.

- [ ] **Step 1: Pasang komponen kartu kaca pada `PageHero` di `/layanan`:**
  - Header: Ikon `Clock`, judul "Jam Pelayanan Distribusi", dan badge status "Buka Hari Kerja" berdenyut.
  - Jadwal: Senin–Kamis (08.00–16.00 WITA) dan Jumat (08.00–11.30 WITA).
  - Deskripsi: Melayani LPLPO rutin & distribusi darurat untuk 28 faskes jejaring.
- [ ] **Step 2: Verifikasi HTTP 200** — `curl -s -I http://localhost:3003/profile-ifk/layanan | grep "200 OK"`
- [ ] **Step 3: Commit** — `git add src/app/(public)/layanan/page.tsx && git commit -m "feat(layanan): kartu jam pelayanan distribusi pada hero desktop (#122)"`

---

### Task 3: Kartu Kontekstual Halaman Profil (`/profil`)

**Files:**
- Modify: `src/app/(public)/profil/page.tsx`

**Interfaces:**
- Consumes: `PageHero` dengan `rightContent`
- Produces: Kartu Mandat & Jangkauan Logistik Wilayah di hero `/profil`.

- [ ] **Step 1: Pasang kartu ringkasan jangkauan wilayah pada `PageHero` di `/profil`:**
  - Header: Ikon `ShieldCheck`, judul "Jangkauan Layanan Logistik".
  - Metrik 3 Kolom:
    - 28 Faskes (Puskesmas & Jejaring)
    - 22 Kecamatan (Daratan & Kepulauan)
    - 334+ Ribu Jiwa (Penduduk Terlayani)
  - Motto: *"Menjamin ketersediaan, pemerataan, dan keterjangkauan obat bermutu bagi seluruh masyarakat Kotabaru."*
- [ ] **Step 2: Verifikasi HTTP 200** — `curl -s -I http://localhost:3003/profile-ifk/profil | grep "200 OK"`
- [ ] **Step 3: Commit** — `git add src/app/(public)/profil/page.tsx && git commit -m "feat(profil): kartu jangkauan wilayah logistik pada hero desktop (#122)"`

---

### Task 4: Kartu Kontekstual Halaman Ketersediaan Obat (`/stok`)

**Files:**
- Modify: `src/components/public/public-stock-client-view.tsx`

**Interfaces:**
- Consumes: `PageHero` dengan `rightContent`
- Produces: Kartu Standar Data Stok Fisik & Kategori di hero `/stok`.

- [ ] **Step 1: Pasang kartu transparansi data stok pada `PageHero` di `public-stock-client-view.tsx`:**
  - Header: Ikon `PackageCheck`, judul "Standar Data Stok Fisik".
  - Deskripsi metodologi: Hasil opname fisik perbekalan farmasi gudang instalasi per akhir bulan (cut-off bulanan).
  - Akses fitur: Panduan unduh berkas Excel resmi dan kategori perbekalan (Obat Program, Esensial, dan BMHP).
- [ ] **Step 2: Verifikasi HTTP 200** — `curl -s -I http://localhost:3003/profile-ifk/stok | grep "200 OK"`
- [ ] **Step 3: Commit** — `git add src/components/public/public-stock-client-view.tsx && git commit -m "feat(stok): kartu standar data stok fisik pada hero desktop (#122)"`

---

### Task 5: Kartu Kontekstual Halaman Kontak & Berita (`/kontak` & `/berita`)

**Files:**
- Modify: `src/app/(public)/kontak/page.tsx`
- Modify: `src/app/(public)/berita/page.tsx`

**Interfaces:**
- Consumes: `PageHero` dengan `rightContent`
- Produces:
  - Kartu Kanal Respon Cepat pada `/kontak`.
  - Kartu Pusat Warta & Publikasi pada `/berita`.

- [ ] **Step 1: Pasang kartu respon cepat di `/kontak`:**
  - Header: Ikon `MessageSquareText`, judul "Kanal Konsultasi & Pengaduan".
  - Tautan tombol WhatsApp resmi dan tautan pengaduan SP4N-LAPOR!.
  - Catatan waktu tanggap jam kerja.
- [ ] **Step 2: Pasang kartu pusat informasi di `/berita`:**
  - Header: Ikon `Newspaper`, judul "Pusat Warta & Pengumuman".
  - Sorotan topik: Distribusi Faskes, Obat Esensial, Mutu & Keamanan.
  - Catatan keterbukaan informasi publik UPTD IFK.
- [ ] **Step 3: Verifikasi HTTP 200** — `curl -s -I http://localhost:3003/profile-ifk/kontak | grep "200 OK"` && `curl -s -I http://localhost:3003/profile-ifk/berita | grep "200 OK"`
- [ ] **Step 4: Commit** — `git add src/app/(public)/kontak/page.tsx src/app/(public)/berita/page.tsx && git commit -m "feat(kontak,berita): kartu info kontekstual pada hero desktop (#122)"`

---

### Task 6: Verifikasi Menyeluruh & Uji Visual Responsif

**Files:**
- Execute: `scripts/verify-public-hero-layout.ts`

- [ ] **Step 1: Jalankan skrip verifikasi layout publik** — `npx tsx scripts/verify-public-hero-layout.ts`.
- [ ] **Step 2: Validasi kelima halaman publik** — pastikan semua mengembalikan status 200 OK dan elemen kartu kanan terdeteksi pada HTML.
- [ ] **Step 3: Push ke remote branch** — `git push -u origin feat/122-public-hero-desktop-layout`.
- [ ] **Step 4: Buat PR GitHub** — tautkan ke Issue #122.
