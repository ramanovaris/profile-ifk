# Spesifikasi Desain: Ekspor Rekap Ketersediaan Stok Obat ke Excel (Issue #110)

## 1. Latar Belakang & Tujuan
Petugas farmasi di Fasilitas Pelayanan Kesehatan (Puskesmas, Pustu, Poskesdes, Klinik, Rumah Sakit) serta pemangku kebijakan Dinas Kesehatan Kabupaten Kotabaru memerlukan arsip ketersediaan obat dan BMHP secara luring (*offline*) untuk kebutuhan verifikasi LPLPO, perencanaan pengadaan, maupun pelaporan bulanan.

Fitur ini menyediakan fasilitas ekspor langsung ke format spreadsheet Excel (`.xlsx`) secara instan di peramban pengguna (*client-side export*) tanpa membebani lalu lintas server atau basis data.

## 2. Ruang Lingkup & Cakupan Data
1. **Cakupan Data yang Diekspor:**
   - Data yang diekspor adalah data yang **sedang aktif dan terfilter di layar** (`filteredItems`).
   - Jika pengguna memfilter kategori tertentu (misal "Obat Program") atau status tertentu (misal "Menipis"), berkas Excel hanya berisi data hasil filter tersebut.
   - Jika tidak ada filter aktif, berkas Excel memuat seluruh data obat pada periode yang sedang dipilih.
2. **Ketersediaan Fitur:**
   - Halaman Publik: `/stok` (dapat diakses oleh publik dan petugas faskes).
   - Panel Admin: `/admin/stok` (dapat diakses oleh pengelola farmasi IFK).

## 3. Struktur Berkas Excel (`.xlsx`)
Berkas Excel dihasilkan menggunakan pustaka `xlsx` (SheetJS) yang sudah terpasang pada proyek.

### Metadata & Header Dokumen (Baris 1 - 5)
- **Baris 1:** `PEMERINTAH KABUPATEN KOTABARU` (Font tebal)
- **Baris 2:** `DINAS KESEHATAN — UPTD INSTALASI FARMASI` (Font tebal)
- **Baris 3:** `REKAPITULASI KETERSEDIAAN OBAT & BMHP`
- **Baris 4:** `Periode Data: [Bulan Tahun, contoh: Juli 2026] | Tanggal Ekspor: [DD MMMM YYYY]`
- **Baris 5:** `Filter Diterapkan: [Keterangan Kategori, Status, atau Kata Kunci Pencarian]`

### Kolom Data Tabel (Mulai Baris 7)
1. **No:** Nomor urut item (1, 2, 3, ...)
2. **Kode Barang:** Kode resmi logistik (misal: `IND-001`, `PRG-012`)
3. **Nama Obat / BMHP:** Nama lengkap sediaan obat/alkes
4. **Satuan:** Bentuk kemasan/satuan fisik (Tablet, Botol, Vial, Ampul, dsb.)
5. **Kategori:** Kategori perbekalan (Obat Indikator, Obat Program, BMHP, dsb.)
6. **Sisa Stok Fisik:** Jumlah unit stok akhir (format numerik murni agar dapat dihitung dengan rumus `SUM`)
7. **Rata-rata Pemakaian (RPB):** Rata-rata pemakaian bulanan (numerik/desimal 2 digit)
8. **Kecukupan (MOS):** Nilai Months of Supply dalam satuan bulan (numerik/desimal 1 digit)
9. **Status Ketersediaan:** Teks status resmi (`Aman`, `Menipis`, `Kosong`)

### Penyesuaian Kolom & Format
- Mengatur lebar kolom otomatis (*auto-fit column width*) berdasarkan panjang teks terpanjang dengan padding minimal 3 karakter agar teks tidak terpotong.
- Format penamaan berkas: `Rekap-Stok-IFK-Kotabaru-[YYYY-MM].xlsx` (misal: `Rekap-Stok-IFK-Kotabaru-2026-07.xlsx`).

## 4. Antarmuka Pengguna (UI / UX)

### Halaman Publik (`/stok`)
- **Penempatan:** Pada baris info pembaruan cut-off periode data, bersebelahan dengan dropdown pemilih periode.
- **Gaya Desain:** Tombol sekunder bernuansa *Clean Light* dengan aksen emerald:
  - Kelas: `inline-flex items-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:border-emerald-600/30 cursor-pointer`
  - Ikon: `FileSpreadsheet` atau `Download` dari `lucide-react`.
  - Teks: `"Unduh Excel"` (atau ikon + teks responsif).
  - Tampilan Ponsel: Mengisi lebar kontainer tombol secara wajar (`w-full sm:w-auto`).

### Panel Admin (`/admin/stok`)
- **Penempatan:** Pada deretan tombol aksi atas di samping tombol `"Unduh Template"` dan `"Import CSV"`.
- **Gaya Desain:** Bertema *Dark Ethereal*:
  - Kelas: `inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 text-sm font-medium text-emerald-300 shadow-sm transition-all hover:bg-emerald-500/20 hover:text-white cursor-pointer`
  - Teks: `"Ekspor Excel"`.

## 5. Arsitektur Komponen & Data Flow

```
[public-stock-client-view.tsx / stock-table.tsx]
       │
       │ klik tombol "Unduh Excel"
       ▼
[src/lib/stock-exporter.ts: exportStockToExcel(items, period, meta)]
       │
       │ 1. Transformasi data ke struktur baris Excel
       │ 2. Bangun worksheet dengan header resmi instansi
       │ 3. Konfigurasi lebar kolom otomatis
       │ 4. Bangun workbook dan generate buffer XLSX
       │ 5. Trigger download file di browser via XLSX.writeFile()
       ▼
Pengguna menerima berkas Rekap-Stok-IFK-Kotabaru-[YYYY-MM].xlsx
```

## 6. Penanganan Galat & Kasus Ekstrem
- **Data Kosong (0 hasil pencarian):** Jika filter menghasilkan 0 data, tombol menampilkan umpan balik/notifikasi bahwa tidak ada data yang dapat diekspor, atau menghasilkan lembar kerja dengan baris keterangan "Tidak ada data obat sesuai kriteria".
- **Nilai Kosong / Null:** Kolom RPB atau MOS yang bernilai `null` ditulis sebagai strip (`-`) atau `0` sesuai standar logistik farmasi.
- **Karakter Khusus pada Nama File:** Periode distandarisasi menggunakan format aman berkas sistem (`YYYY-MM`).

## 7. Rencana Pengujian
1. **Uji Fungsionalitas Ekspor Publik:** Buka halaman `/stok`, terapkan filter kategori "Obat Program", klik "Unduh Excel", pastikan berkas yang terunduh hanya memuat item Obat Program.
2. **Uji Fungsionalitas Ekspor Admin:** Buka panel `/admin/stok`, ganti periode data ke Juni 2026, klik "Ekspor Excel", pastikan data yang terunduh sesuai periode aktif.
3. **Uji Kompatibilitas Seluler:** Pastikan tombol unduh tertata rapi di layar ponsel 390px tanpa merusak posisi pemilih periode.
