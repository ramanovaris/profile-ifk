# Spesifikasi Desain: Reset Otomatis Nilai Autofill dan Banner Peringatan Form Tambah Obat (#161)

## 1. Ringkasan
Dokumen spesifikasi ini mendefinisikan perbaikan UX dan validasi integritas data pada formulir modal "Tambah Data Obat Baru" di modul admin stok (`/admin/stok`). Perbaikan ini menyelesaikan masalah celah (bug) di mana penggantian nama obat setelah autofill riwayat menyisakan banner peringatan usang dan nilai-nilai lama (kode barang, RPB, kategori, satuan).

## 2. Latar Belakang & Analisis Masalah
Pada implementasi sebelumnya di `src/app/(admin)/admin/stok/stock-table.tsx`:
1. Pengguna mengetik atau memilih nama obat lama (contoh: "Obat Kuat" dengan kode `OBT-091`).
2. Fungsi `handleSelectSuggestion` mengisi otomatis:
   - `code`: "OBT-091"
   - `name`: "Obat Kuat"
   - `category`: "Obat Program"
   - `unit`: "Tablet"
   - `avgUsage`: "200"
   - `historyHint`: `⚠️ Obat 'Obat Kuat' (OBT-091) sudah terdaftar pada periode...`
3. Pengguna kemudian menyadari obat tersebut sudah terdaftar dan memutuskan mengganti `Nama Obat / Barang` menjadi nama baru (contoh: "dmfdf").
4. **Masalah yang timbul:**
   - `historyHint` tidak direset dan tetap menampilkan pesan peringatan obat lama.
   - Kolom `code` tetap berisi `OBT-091` dan kolom `avgUsage` tetap berisi `200`, sehingga obat baru berisiko tersimpan dengan kode dan nilai historis obat lain.
   - Pengecekan saat blur (`handleFieldBlur`) terkunci oleh evaluasi `if (addForm.avgUsage === "" || !historyHint)`, sehingga tidak memproses query baru saat nama diubah.

## 3. Desain Solusi Teknis

### 3.1. Pelacakan Status Asal Autofill (`autofilledSource`)
Menambahkan state pelacak di `StockTable`:
```typescript
interface AutofilledSource {
  code: string;
  name: string;
  category: MedicineCategory;
  unit: string;
  nomenklatur: string;
  avgUsage: string;
}
const [autofilledSource, setAutofilledSource] = useState<AutofilledSource | null>(null);
```
- Diset saat pengguna memilih saran (`handleSelectSuggestion`) atau saat `handleFieldBlur` menemukan kecocokan riwayat.
- Direset ke `null` saat modal dibuka baru (`handleOpenAdd`) atau saat nilai input tidak lagi sesuai dengan data autofill.

### 3.2. Handler Perubahan Input (`onChange`)
Pada input `Nama Obat / Barang`:
- Jika pengguna mengubah nama sehingga tidak sama dengan `autofilledSource.name`:
  - Reset `historyHint` menjadi `null`.
  - Jika kolom `code` masih bernilai sama dengan `autofilledSource.code`, kosongkan `code: ""`.
  - Jika kolom `avgUsage` masih bernilai sama dengan `autofilledSource.avgUsage`, reset `avgUsage: ""`, hitung ulang `mos: ""`, dan sesuaikan `status`.
  - Jika `nomenklatur` sama dengan `autofilledSource.nomenklatur`, kosongkan `nomenklatur: ""`.
  - Reset `autofilledSource = null`.

Pada input `Kode Barang`:
- Logika simetris: jika kode diubah menjauhi `autofilledSource.code`:
  - Reset `historyHint` menjadi `null`.
  - Jika `name` masih identik dengan `autofilledSource.name`, kosongkan `name: ""`.
  - Reset `avgUsage: ""`, `mos: ""`, `autofilledSource = null`.

### 3.3. Pemulihan Logika `handleFieldBlur`
- Hapus penguncian sepihak `if (addForm.avgUsage === "" || !historyHint)`.
- Jika teks masukan tidak cocok dengan data riwayat di database, tampilkan status obat baru:
  ```typescript
  setHistoryHint({
    message: "🆕 Obat baru (belum ada riwayat pemakaian di periode sebelumnya)",
    type: "new",
  });
  ```
- Jika teks masukan kosong (< 2 karakter), pastikan `historyHint` bersih (`null`).

### 3.4. Validasi Duplikasi saat Submit (`handleSaveAdd`)
- Pertahankan validasi agar kode obat yang sudah terdaftar pada periode aktif ditolak dengan notifikasi toast informatif.

## 4. Kriteria Keberhasilan (Acceptance Criteria)
1. Memilih/mengetik obat lama memicu autofill dan banner peringatan (jika sudah ada di periode aktif).
2. Mengganti nama obat ke kata lain langsung menghilangkan banner peringatan obat lama.
3. Nilai kode barang dan RPB hasil autofill lama otomatis tereset saat nama diganti, mencegah benturan data.
4. Ketika kursor keluar dari input nama obat baru (`blur`), muncul indikator "🆕 Obat baru".
5. Skrip pengujian otomatis membuktikan alur transisi ini 100% lulus.
