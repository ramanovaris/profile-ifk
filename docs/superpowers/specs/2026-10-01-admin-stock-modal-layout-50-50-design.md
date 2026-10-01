# Spesifikasi Desain: Optimalisasi Tata Letak Modal Form Obat di Tampilan Desktop dengan Layout Responsif 50/50 & Tanpa Spin Button Angka (Issue #120)

## 1. Latar Belakang & Tujuan
Pada panel admin Instalasi Farmasi Kabupaten (IFK) Kotabaru (`/admin/stok`), formulir **Tambah Data Obat Baru** dan **Edit Data Stok** sebelumnya menggunakan kontainer modal vertikal tunggal yang sempit (`max-w-lg` ~512px).

Kondisi tersebut menimbulkan sejumlah kendala pengalaman pengguna (*UX friction*):
1. **Pemanfaatan Layar Desktop Tidak Optimal:** Pada resolusi monitor desktop (768p/1080p), modal tampak sempit di tengah layar dan menyisakan banyak area kosong di sisi kiri dan kanan.
2. **Scroll Internal yang Canggung (*Awkward Inner Scroll*):** Tumpukan elemen formulir yang panjang secara vertikal membuat kolom logistik (ED, Nomenklatur) serta tombol aksi ("Batal" dan "Simpan") terpotong di bawah lipatan layar (*below the fold*), memaksa administrator sering menggulir isi modal.
3. **Risiko Salah Klik pada Tombol Panah Angka (*Spin Button Hazard*):** Pada kolom input bertipe angka (`Jumlah Stok Fisik`, `Rata-rata Pemakaian`, dan `Kecukupan Stok`), tombol panah naik-turun bawaan peramban rentan tertekan tidak sengaja atau berubah nilai saat pengguna menggulir roda mouse (*mousewheel*), berpotensi mengakibatkan galat data kuantitas (*human error*).

Pembaruan ini bertujuan mengoptimalkan antarmuka modal formulir stok menjadi arsitektur dua kolom seimbang (**50/50**) pada layar desktop (`md+`), meniadakan pemotongan tombol aksi, menghilangkan *spin button* pada kolom angka, serta menjaga kenyamanan antarmuka satu kolom yang responsif di perangkat ponsel pintar.

---

## 2. Ruang Lingkup & Kriteria Kebutuhan

1. **Kontainer Modal Responsif:**
   - Mobile (`< md`): `max-w-lg`, `max-h-[85dvh]` dengan pembungkus `ModalScrollArea` untuk mencegah luapan layar ponsel.
   - Desktop (`md+`): Diperluas menjadi `md:max-w-3xl lg:max-w-4xl` dengan batas tinggi proporsional (`md:max-h-[90vh]`), pas dalam satu pandangan layar tanpa *scrolling* yang melelahkan.
2. **Arsitektur Grid 2 Kolom Seimbang (50/50 pada `md+`):**
   - **Kolom Kiri (50%) — Data Master & Kuantitas Fisik:**
     - Nama Obat / Barang (lebar penuh kolom kiri)
     - Sub-grid 2 kolom: Kode Barang / Barcode & Kategori
     - Sub-grid 2 kolom: Satuan Kemasan & Jumlah Stok Fisik
     - Status Ketersediaan (Dropdown kustom bertema *Dark Ethereal*)
   - **Kolom Kanan (50%) — Logistik & Perencanaan:**
     - Header seksi logistik & perencanaan dengan aksen halus
     - Sub-grid 2 kolom: Rata-rata Pemakaian / Bulan & Kecukupan Stok (Bulan)
     - Sub-grid 2 kolom: Tanggal Kedaluwarsa (ED) & Nomenklatur / Sub-Kelas Terapi
     - *Quick Insight Card* (Pratinjau cerdas Dark Ethereal): Ringkasan otomatis ketersediaan obat berdasarkan kuantitas fisik dan pemakaian rata-rata.
3. **Peniadaan Spin Button Input Angka (*No-Spinner Numbers*):**
   - Meniadakan tombol panah atas/bawah pada kolom angka (`input[type="number"]`) di seluruh formulir menggunakan aturan CSS standar (`appearance: textfield` dan pembersihan `-webkit-inner-spin-button` / `-webkit-outer-spin-button`).
4. **Tombol Aksi Responsif (Batal & Simpan):**
   - Di mobile: Tata letak grid 2 kolom 50/50 simetris.
   - Di desktop: Rata kanan (`flex justify-end gap-3`) dengan tombol lebar proporsional yang selalu terlihat (*no cut-off*).
5. **Keselarasan Visual *Dark Ethereal*:**
   - Konsisten dengan palet `zinc-950/95`, batas halus `border-white/10`, aksen status ketersediaan emerald/amber/rose, dan fokus ring `brand-500/40`.

---

## 3. Detail Komponen & Desain Tata Letak

### 3.1. Penataan Grid 50/50 Desktop

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  {/* Kolom Kiri: Master Data & Fisik */}
  <div className="space-y-3.5">
    {/* Nama Barang */}
    {/* Kode & Kategori (grid 2 kolom) */}
    {/* Satuan & Jumlah Stok (grid 2 kolom) */}
    {/* Status Ketersediaan */}
  </div>

  {/* Kolom Kanan: Logistik & Perencanaan */}
  <div className="space-y-3.5 flex flex-col justify-between">
    <div className="space-y-3.5">
      {/* Header Logistik */}
      {/* RPB & MOS (grid 2 kolom) */}
      {/* ED & Nomenklatur (grid 2 kolom) */}
    </div>
    {/* Quick Insight Card (Pratinjau kalkulasi ketersediaan) */}
  </div>
</div>
```

### 3.2. Penanganan Input Angka Bebas Human Error
Aturan styling input angka:
```css
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
```

---

## 4. Rencana Verifikasi
1. **Desktop Viewport Test (1280x800 & 1920x1080):** Memastikan modal Tambah & Edit Obat terbagi 2 kolom 50/50 seimbang, tombol aksi langsung terlihat, dan panah spin button tidak muncul.
2. **Mobile Viewport Test (375x667):** Memastikan modal tetap adaptif dalam 1 kolom vertikal, mudah disentuh, dan indikator scroll bekerja lancar.
3. **Type Checking:** Memastikan `npx tsc --noEmit` lolos tanpa galat.

---

## 5. Draf Redaksi SKP e-Kinerja PNS
> *"Mengoptimalkan antarmuka modal formulir stok obat pada portal web Profile IFK dengan tata letak responsif desktop 50/50 dan proteksi input angka guna meningkatkan kenyamanan serta meminimalisir human error dalam pengelolaan data perbekalan farmasi daerah."*
