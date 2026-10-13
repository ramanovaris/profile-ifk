# Spesifikasi Desain: Pencarian Obat Cerdas Berbasis Normalisasi Fonetik & Alias Sinonim (EN/ID)

- **Tanggal Dokumen:** 2026-10-12
- **Nomor Isu Terkait:** #137
- **Branch Fitur:** `feat/137-smart-medicine-search`
- **Status:** Draf Disetujui (Siap Masuk Perencanaan Implementasi)

---

## 1. Latar Belakang & Tujuan

Pencarian nama obat pada tabel ketersediaan obat saat ini masih mengandalkan pencocokan teks langsung (*case-insensitive exact substring match*). Metode ini memiliki kelemahan ketika pengguna atau petugas mencari obat dengan:
1. **Ejaan Bahasa Inggris / Latin Internasional:** Contohnya mencari *amoxicillin*, *paracetamol*, *chlorpheniramine*, *doxycycline*, *ciprofloxacin*, *thiamine*, *phosphate*.
2. **Ejaan Bahasa Indonesia Baku:** Contohnya *amoksisilin*, *parasetamol*, *klorfeniramin*, *doksisiklin*, *siprofloksasin*, *tiamin*, *fosfat*.
3. **Variasi Populer / Ejaan Sehari-hari:** Contohnya *amoksilin*, *paraset*, *vit c*, *antacid*.
4. **Singkatan Medis & Akronim Apotek Lazim:** Contohnya *pct*, *ctm*, *gg*, *inh*, *oat*, *obh*.

Tujuan implementasi:
1. Menyediakan utilitas pencocokan cerdas `matchMedicineSearch(item, query)` yang cepat, deterministik, dan bebas dependensi eksternal (*zero external dependency*).
2. Mendukung kamus alias statis istilah farmasi lazim tanpa menambah beban database query pada server VPS 2GB.
3. Melakukan normalisasi fonetik dua arah (query maupun target data dinormalisasi ke representasi suara kanonikal yang sama).
4. Mengintegrasikan pencocokan cerdas pada:
   - Filter tabel ketersediaan obat publik (`src/components/public/public-stock-client-view.tsx`).
   - Filter tabel inventaris obat admin (`src/app/(admin)/admin/stok/stock-table.tsx`).
   - Pencarian riwayat master obat server action (`src/actions/stock.ts`).
5. Menyediakan skrip verifikasi mandiri (*self-check script*) untuk memastikan akurasi pencarian dengan berbagai variasi kata kunci.

---

## 2. Arsitektur Teknis & Modul

### A. Modul Baru: `src/lib/medicine-search.ts`

Modul ini bertanggung jawab memproses pencocokan cerdas obat dengan komponen utama:

1. **`MEDICINE_SYNONYMS: Record<string, string[]>`**
   Peta relasi sinonim/akronim farmasi dua arah.
   - Singkatan ke nama generik: `pct` -> `parasetamol`, `ctm` -> `klorfeniramin`, `gg` -> `gliseril guaiakolat`, `inh` -> `isoniazid`, `oat` -> `tuberkulosis`, `obh` -> `batuk hitam`, `vit c` / `vitc` -> `asam askorbat`.
   - Nama dagang/populer ke generik: `panadol` -> `parasetamol`, `bodrex` -> `parasetamol`, `paramex` -> `parasetamol`, `amoxan` -> `amoksisilin`.

2. **`normalizeMedicinePhonetic(text: string): string`**
   Mengubah teks menjadi bentuk representasi fonetik farmasi kanonikal:
   - Lowercase, trim, dan kompresi spasi/tanda hubung.
   - Pemetaan digraf & konsonan:
     - `ph` -> `f` (*phosphate* -> *fosfat*)
     - `th` -> `t` (*thiamine* -> *tiamin*)
     - `x` -> `ks` (*amoxicillin* -> *amoksisilin*)
     - `ch` -> `k` (*chlorpheniramine* -> *klorfeniramin*)
     - `y` -> `i` (*doxycycline* -> *doksisislin*)
     - `c` sebelum e/i -> `s`, lainnya `c` -> `k` (*cefixime* -> *sefiksim*, *curcuma* -> *kurkuma*)
   - Reduksi konsonan ganda: `ll` -> `l`, `ss` -> `s`, `mm` -> `m`, `pp` -> `p`, `tt` -> `t`, `cc` -> `k`, dll.
   - Reduksi pengulangan suku kata tertentu jika ada variasi populer (*amoksisilin* vs *amoksilin*).

3. **`matchMedicineSearch(item: StockSearchableItem, rawQuery: string): boolean`**
   Antarmuka pencocokan utama bertingkat:
   - **Tingkat 1 (Exact Substring):** Jika `rawQuery` langsung terdapat dalam `name`, `code`, `category`, atau `nomenklatur` (case-insensitive), kembalikan `true`.
   - **Tingkat 2 (Ekspansi Alias/Sinonim):** Cari padanan alias dari `rawQuery` di `MEDICINE_SYNONYMS`. Jika salah satu ekspansi cocok pada teks item, kembalikan `true`.
   - **Tingkat 3 (Pencocokan Fonetik Kanonikal):** Bandingkan `normalizeMedicinePhonetic(rawQuery)` terhadap `normalizeMedicinePhonetic(name)` dan `normalizeMedicinePhonetic(nomenklatur)`. Jika substring fonetik cocok, kembalikan `true`.

---

## 3. Titik Integrasi Komponen

### A. Komponen Publik (`src/components/public/public-stock-client-view.tsx`)
Pada hook `useMemo` filter item:
```ts
// Sebelumnya:
item.name.toLowerCase().includes(query) ||
item.code.toLowerCase().includes(query) ||
item.category.toLowerCase().includes(query)

// Menjadi:
matchMedicineSearch(item, search)
```

### B. Komponen Admin (`src/app/(admin)/admin/stok/stock-table.tsx`)
Pada hook `useMemo` filter item admin:
```ts
// Sebelumnya:
item.name.toLowerCase().includes(query) ||
item.code.toLowerCase().includes(query) ||
item.category.toLowerCase().includes(query) ||
(item.nomenklatur && item.nomenklatur.toLowerCase().includes(query))

// Menjadi:
matchMedicineSearch(item, search)
```

### C. Server Action (`src/actions/stock.ts`)
Pada fungsi `searchMedicineHistoryAction`:
- Query pencarian diperluas dengan istilah sinonim jika query cocok dengan entri `MEDICINE_SYNONYMS`.
- Menghasilkan pencarian riwayat yang cerdas saat admin menginput nama obat baru.

---

## 4. Pengujian & Kriteria Keberhasilan

1. **Uji Coba Fonetik:**
   - Kata kunci `amoxicillin` menemukan `Amoksisilin 500 mg`.
   - Kata kunci `amoksilin` menemukan `Amoksisilin 500 mg`.
   - Kata kunci `paracetamol` menemukan `Parasetamol 500 mg`.
   - Kata kunci `thiamine` menemukan `Tiamin HCl`.
   - Kata kunci `chlorpheniramine` menemukan `Klorfeniramin Maleat (CTM)`.
2. **Uji Coba Alias/Akronim:**
   - Kata kunci `pct` menemukan `Parasetamol 500 mg`.
   - Kata kunci `ctm` menemukan `Klorfeniramin Maleat 4 mg`.
   - Kata kunci `gg` menemukan `Gliseril Guaiakolat 100 mg`.
   - Kata kunci `inh` menemukan `Isoniazid`.
3. **Uji Coba Kode & Kategori:**
   - Pencarian kode obat (misal `OBT-001`) dan kategori (misal `Antibiotik`) tetap berfungsi 100% normal.
4. **Performa:**
   - Evaluasi filter 200+ obat pada browser client selesai di bawah 2 milidetik tanpa frame drop di perangkat mobile.

---

## 5. Redaksi e-Kinerja (SKP)

> "Melaksanakan optimalisasi fitur pencarian data ketersediaan obat melalui penerapan pencocokan cerdas fonetik dan sinonim istilah farmasi guna mempermudah penemuan informasi obat oleh masyarakat dan petugas."
