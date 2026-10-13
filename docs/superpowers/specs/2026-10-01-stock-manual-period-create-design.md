# Spesifikasi Desain: Tambah Periode Baru Manual Stok Obat

**Status:** Disetujui  
**Tanggal:** 2026-10-01  
**Target Rilis:** Panel Admin Stok (`/admin/stok`)  
**Penulis:** Tim Pengembang Profile IFK Kotabaru  

---

## 1. Latar Belakang & Tujuan
Pada sistem informasi ketersediaan obat UPTD Instalasi Farmasi Kabupaten Kotabaru, pencatatan stok logistik diselenggarakan secara berkala berbasis periode *cut-off* bulanan (format `YYYY-MM`, seperti `2026-06`, `2026-07`). 

Sebelumnya, periode baru hanya dapat terbentuk melalui proses impor berkas rekapan Excel/CSV. Petugas belum memiliki mekanisme untuk membuka lembar periode pelaporan baru secara mandiri langsung dari antarmuka web saat ingin melakukan input atau *stock opname* manual.

Fitur ini bertujuan untuk menyediakan tombol dan alur kerja **"Tambah Periode Baru"** secara manual yang efisien, rapi, dan fleksibel (bisa menyalin master obat dari bulan sebelumnya atau membuka lembar kosong).

---

## 2. Keputusan Desain & Hasil Diskusi Pengguna
Berdasarkan klarifikasi dan persetujuan pengguna:
1. **Penempatan Tombol Pemicu:**
   * Diintegrasikan secara alami di dalam dropdown filter **Periode** (`StockMultiSelectFilter`), bukan menambah tombol mandiri di header agar antarmuka ponsel/desktop tetap rapi dan tidak padat.
   * Tampil sebagai aksi teratas: `+ Buka Periode Baru` bertema *Dark Ethereal*.
2. **Pilihan Fleksibel Inisialisasi Data Obat:**
   * **Opsi 1 (Disarankan): Salin Master Obat dari Periode Terakhir**  
     Menyalin seluruh master obat (kode, nama, kategori, satuan, nomenklatur, dan RPB histori) dari periode sebelumnya, mereset kuantitas fisik ke `0` dan status ke `EMPTY`. Petugas tidak perlu mengetik ulang 200+ nama obat satu per satu.
   * **Opsi 2: Lembar Kosong Murni (Blank)**  
     Membuka periode baru dari 0 item untuk input bertahap mandiri.

---

## 3. Komponen Antarmuka & UX

### 3.1. Dropdown Filter Periode (`StockMultiSelectFilter`)
* Ditambahkan properti `createAction` pada `StockMultiSelectFilter`:
  ```tsx
  createAction={{
    label: "+ Buka Periode Baru",
    onClick: () => setIsCreatePeriodOpen(true),
  }}
  ```
* Tampil di bagian atas daftar pilihan periode dengan batas pemisah halus (`border-b border-white/5`), berteks hijau emerald (`text-emerald-400 hover:bg-emerald-500/10`).

### 3.2. Dialog Modal "Buka Periode Stok Baru"
* **Kontainer Dialog:**
  * Berukuran `max-w-md` responsif dengan tema *Dark Ethereal* (`bg-zinc-950 border-white/10`).
  * Header dialog dengan ikon kalender berkilau (`CalendarPlus` / `Sparkles`).
* **Field Pemilih Periode:**
  * **Dropdown Bulan:** Januari s.d. Desember. Otomatis merekomendasikan bulan berikutnya dari periode terakhir yang tercatat di database (contoh: jika periode terakhir `2026-07`, otomatis memilih `Agustus`).
  * **Input/Dropdown Tahun:** Default tahun berjalan (contoh: `2026`).
  * **Pratinjau Periode:** Label badge pill monospaced rapi: `Agustus 2026 (2026-08)`.
* **Pilihan Metode Inisialisasi (Radio Cards):**
  * Kartu 1: *Salin Master Obat dari [Periode Sumber]*  
    Menampilkan info ringkas: *"Menyalin N item master obat. Kuantitas fisik di-reset ke 0."*
  * Kartu 2: *Lembar Kosong Murni*  
    Menampilkan info ringkas: *"Mulai lembar periode dari 0 obat."*
* **Validasi Real-time:**
  * Jika periode target sudah ada di dalam `periodsList`, tampil peringatan kuning: *"Periode [Bulan Tahun] sudah terdaftar. Pilih bulan atau tahun lain."*, dan tombol submit dinonaktifkan.
* **Tombol Aksi:**
  * Tombol `Batal`.
  * Tombol `Buka Periode Baru` dengan efek gradien `from-brand-600 to-emerald-600` dan status *loading spinner* saat proses *bulk insert*.

---

## 4. Arsitektur Data & Server Action

### 4.1. Server Action: `createStockPeriodAction`
Ditempatkan pada `src/actions/stock.ts`:
```ts
export interface CreateStockPeriodInput {
  targetPeriod: string; // e.g. "2026-08"
  mode: "COPY" | "BLANK";
  sourcePeriod?: string; // e.g. "2026-07"
  _testUserId?: string; // untuk pengujian unit/integrasi
}

export async function createStockPeriodAction(
  data: CreateStockPeriodInput
): Promise<StockActionResult<{ period: string; count: number }>>
```

**Logika Pelaksanaan:**
1. Validasi otentikasi sesi staf/admin.
2. Validasi format string periode (`/^\d{4}-\d{2}$/`).
3. Pengecekan apakah data obat dengan periode tersebut sudah ada di basis data:
   * Jika sudah ada $\rightarrow$ Kembalikan pesan galat: *"Periode [YYYY-MM] sudah ada di sistem."*
4. **Jika Mode COPY:**
   * Ambil semua record `MedicineStock` dari `sourcePeriod`.
   * Jika tidak ada obat di periode sumber $\rightarrow$ kembalikan pesan galat.
   * Lakukan `db.medicineStock.createMany` untuk efisiensi transaksi:
     - `period`: `data.targetPeriod`
     - `code`: `item.code`
     - `name`: `item.name`
     - `category`: `item.category`
     - `unit`: `item.unit`
     - `quantity`: `0`
     - `status`: `"EMPTY"`
     - `avgUsage`: `item.avgUsage`
     - `mos`: `null`
     - `expiryDate`: `null`
     - `nomenklatur`: `item.nomenklatur`
     - `source`: `"MANUAL"`
5. Revalidasi path cache `/admin/stok` dan `/stok`.
6. Kembalikan `{ success: true, data: { period, count } }`.

### 4.2. Penanganan State Klien (`stock-table.tsx`)
1. Saat pembuatan berhasil:
   * Menambahkan `targetPeriod` ke dalam state `periodsList`.
   * Memperbarui parameter URL (`?periode=YYYY-MM&page=1`) sehingga tabel langsung berpindah ke periode baru.
   * Menampilkan pesan notifikasi sukses (*toast*):
     - Mode COPY: *"Periode [Bulan Tahun] berhasil dibuka dengan [count] master obat disalin."*
     - Mode BLANK: *"Periode [Bulan Tahun] berhasil dibuka (lembar kosong)."*
   * Menutup dialog modal.

---

## 5. Rencana Pengujian & Verifikasi
1. **Pengujian Unit & TDD (`scripts/verify-stock-period-create.ts`):**
   * Menguji validasi format periode.
   * Menguji penolakan jika target periode sudah ada.
   * Menguji pembuatan periode mode COPY: memastikan jumlah item cocok, kuantitas fisik = 0, status = EMPTY, dan master data tersalin utuh.
   * Membersihkan data uji setelah pengujian tuntas.
2. **Type Checking:**
   * Menjalankan `npx tsc --noEmit` untuk memastikan tidak ada galat tipe data TypeScript.
3. **Pengujian Browser End-to-End:**
   * Verifikasi tampilan tombol `+ Buka Periode Baru` di dropdown filter periode.
   * Verifikasi modal dialog interaktif dan alur pemilihan bulan/tahun.
   * Pengujian respon responsif pada viewport seluler dan desktop.
