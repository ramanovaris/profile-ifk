# Spesifikasi Desain: Otomasi Kalkulasi RPB & Tingkat Ketersediaan (MOS) Berbasis Histori

**Tanggal:** 2026-10-01  
**Nomor Issue:** [#118](https://github.com/ramanovaris/profile-ifk/issues/118)  
**Branch:** `feat/118-stock-auto-calc-usage-mos`  
**Target:** `develop`  

---

## 1. Latar Belakang & Kebutuhan

Pada modul pengelolaan stok obat di `/admin/stok`, pengelola perbekalan farmasi sering kali harus mengingat atau menghitung secara manual nilai **Rata-rata Pemakaian Bulanan (RPB / Tren 12 Bulan)** dan **Kecukupan Stok (Months of Supply / MOS)**.
Proses manual ini memiliki kelemahan:
1. Memakan waktu dan rentan salah hitung (*human error*).
2. Membingungkan pengelola saat memasukkan data obat yang sudah pernah terdaftar di periode sebelumnya.
3. Inkonsistensi status ketersediaan (*Tersedia*, *Menipis*, *Kosong*) jika tidak mengikuti kaidah logistik buffer stock farmasi secara otomatis.

**Solusi yang Dirancang:**
1. Otomasi pencarian riwayat obat (kode & nama) dari periode sebelumnya (hingga 12 bulan ke belakang).
2. Pengisian otomatis nilai RPB efektif ke dalam formulir berdasarkan riwayat pemakaian yang tercatat di database.
3. Kalkulasi instan (*real-time*) nilai Kecukupan Stok (MOS) dan penentuan otomatis status ketersediaan saat pengelola menginput kuantitas fisik.
4. Dukungan autocomplete cerdas + deteksi otomatis saat pengelola mengetik manual (*on-blur detection*).

---

## 2. Arsitektur & Logika Sistem

### 2.1 Formula Standar Logistik Farmasi
$$\text{MOS (Bulan)} = \frac{\text{Jumlah Stok Fisik}}{\text{Rata-rata Pemakaian per Bulan (RPB)}}$$

* **Kondisi Khusus (Edge Cases):**
  * Jika `Jumlah Stok Fisik == 0`: MOS = `0.0`, Status = `EMPTY` (Kosong).
  * Jika `RPB <= 0` atau tidak ada data: MOS = `null` (`-`), Status ditentukan dari kuantitas fisik (< 500 = `LOW`, >= 500 = `AVAILABLE`).
  * Jika `RPB > 0`:
    * $\text{MOS} < 3.0 \longrightarrow$ **Menipis (`LOW`)** (perlu pengadaan/peringatan dini buffer stock).
    * $\text{MOS} \ge 3.0 \longrightarrow$ **Tersedia (`AVAILABLE`)** (stok aman).
    * Jika kuantitas fisik = 0 $\longrightarrow$ **Kosong (`EMPTY`)**.

### 2.2 Agregasi RPB dari Histori 12 Bulan
$$\text{RPB Efektif} = \frac{\sum_{i=1}^{N} \text{avgUsage}_i}{N}$$
di mana $N$ adalah jumlah periode bulan sebelumnya yang memiliki data obat tersebut (maksimal 12 bulan sebelum periode aktif).

---

## 3. Komponen & Alur Data

### 3.1 Pustaka Kalkulasi Murni (`src/lib/stock-calc.ts`)
Fungsi murni terisolasi tanpa efek samping (*pure functions*) yang digunakan baik di sisi klien maupun server:
* `calculateMos(quantity: number, avgUsage: number | null | undefined): number | null`
* `determineStockStatus(quantity: number, mos: number | null | undefined, manualStatus?: StockStatus): StockStatus`
* `aggregateHistoricalUsage(records: Array<{ avgUsage: number | null }>): { avgUsage: number; count: number }`

### 3.2 Server Action Riwayat Obat (`src/actions/stock.ts`)
* `searchMedicineHistoryAction(query: string, currentPeriod: string)`:
  * Mengambil data obat dari tabel `medicine_stocks` untuk periode sebelum `currentPeriod`.
  * Melakukan pencarian berdasarkan kecocokan kode atau nama obat.
  * Menghitung RPB gabungan dan menyertakan metadata obat (nama, kode, kategori, satuan, nomenklatur).

### 3.3 Antarmuka Pengguna Modal Tambah & Edit (`stock-table.tsx`)
* **Autocomplete Dropdown:**
  * Saat admin mengetik pada input Nama Obat atau Kode Obat, muncul daftar saran riil obat IFK.
  * Mengklik saran langsung mengisi seluruh field master obat + RPB historis.
* **Smart On-Blur Detection:**
  * Bila admin mengetik manual tanpa klik saran, event `onBlur` langsung mencocokkan input dengan database. Jika ditemukan riwayatnya, RPB otomatis terisi.
  * Jika benar-benar baru, tampil indikator: *"🆕 Obat baru (belum ada riwayat pemakaian)"*.
* **Reaktivitas Instan:**
  * Mengubah Stok Fisik langsung memperbarui MOS dan Status Ketersediaan.
  * Mengubah RPB langsung memperbarui MOS dan Status Ketersediaan.
  * Quick Insight Box menampilkan pratinjau badge status (Hijau/Kuning/Merah) secara instan.

---

## 4. Kriteria Keberhasilan (Acceptance Criteria)
1. Perhitungan MOS dinamis dan instan tanpa jeda saat mengetik stok atau RPB.
2. Penanganan pembagian dengan nol aman tanpa `NaN` atau `Infinity`.
3. Deteksi obat riil berfungsi baik melalui dropdown maupun ketikan manual.
4. RPB ditarik secara akurat dari periode-periode historis database.
5. Seluruh tes TDD lolos dengan assertion ketat.
