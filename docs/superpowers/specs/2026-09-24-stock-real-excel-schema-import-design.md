# Design Spec: Penyesuaian Skema Database & Impor Data Real Stok Obat Excel (Issue #68)

- **Tanggal:** 2026-09-24
- **Isu Referensi:** [#68 (feat(stok): penyesuaian skema DB dan import data stok agar sesuai data real Excel)](https://github.com/ramanovaris/profile-ifk/issues/68)
- **Status:** Approved (Opsi A - Penggabungan Obat Indikator & Obat Program Data Real)
- **Branch Target:** `feat/68-stock-real-excel-schema-import` -> `develop`

---

## 1. Latar Belakang & Tujuan
Saat ini, modul stok obat (`MedicineStock`) baru memiliki kolom dasar: `code`, `name`, `category`, `unit`, `quantity`, dan `status`. Sementara itu, data logistik riil yang digunakan oleh UPTD Instalasi Farmasi Kabupaten Kotabaru per Juni 2026 bersumber dari dua laporan resmi Kemenkes:
1. **Survei Obat Indikator:** 40 item obat esensial pelayanan dasar (Parasetamol, Amlodipin, Amoksisilin, Metformin, dll.) dengan data rata-rata pemakaian bulanan dan tingkat ketersediaan (*Months of Supply* / MOS).
2. **Laporan Ketersediaan Obat Program:** 60 item logistik program prioritas nasional (TB, Gizi/Stunting, Malaria, HIV, Filariasis, KIA) lengkap dengan rincian per batch tanggal kedaluwarsa (*Expiry Date* / ED) dan rata-rata distribusi bulanan.

Kedua laporan tersebut menghasilkan **87 jenis obat unik** dengan angka stok yang 100% konsisten.

Tujuan spesifikasi ini:
1. Memperluas skema model `MedicineStock` untuk menampung metrik logistik riil (`avgUsage`, `mos`, `expiryDate`, `nomenklatur`, `source`) secara *backward compatible*.
2. Memperbarui data awal (*seed & dummy fallback*) dengan 87 item data riil resmi Kabupaten Kotabaru periode Juni 2026.
3. Menampilkan indikator **Tingkat Ketersediaan (Kecukupan Bulan / MOS)** dan informasi kedaluwarsa pada tabel publik (`/stok`) dan admin (`/admin/stok`).
4. Menyediakan fitur **Impor File Excel (.xlsx)** di panel admin dengan deteksi otomatis format *Obat Indikator* maupun *Obat Program*.

---

## 2. Kesepakatan Desain (Brainstorming Results)

1. **Penamaan Kategori:**
   - 40 Obat Indikator dipetakan ke kategori **"Obat Generik"** agar masyarakat awam mudah mengenali obat rutin puskesmas.
   - 60 Obat Program dipetakan ke kategori **"Obat Program"**.
   - Kategori existing lainnya (*Obat Emergensi*, *Vaksin & Serum*, *BMHP / Alkes*) tetap didukung oleh sistem untuk fleksibilitas ke depan.
2. **Indikator Tingkat Ketersediaan (MOS):**
   - Menampilkan badge visual yang informatif:
     - `Kosong`: Stok 0 atau status EMPTY.
     - `Kritis (< 1 bln)`: MOS < 1 bulan (badge rose/merah muda).
     - `Menipis (1 - 3 bln)`: MOS 1 hingga 3 bulan (badge amber/oranye).
     - `Aman (3 - 18 bln)`: MOS 3 hingga 18 bulan (badge emerald/hijau).
     - `Melimpah (> 18 bln)`: MOS > 18 bulan (badge teal/biru langit).
3. **Mekanisme Impor Excel Admin:**
   - Admin dapat mengunggah berkas `.xlsx` (atau `.csv`) langsung melalui modal impor di `/admin/stok`.
   - Server Action akan membaca file buffer dan secara cerdas mendeteksi struktur kolom:
     - *Format Obat Indikator* (mengenali header `Nomenklatur`, `Tingkat Ketersediaan`).
     - *Format Obat Program* (mengenali sheet `Laporan Obat Program` & `Detil Stok`).
     - *Format Standar / CSV* (mengenali kolom `Kode`, `Nama`, `Kategori`, `Satuan`, `Stok`).

---

## 3. Desain Skema Basis Data (`prisma/schema.prisma`)

Menambahkan 5 kolom opsional baru pada model `MedicineStock`:

```prisma
model MedicineStock {
  id           String      @id @default(cuid())
  code         String      @unique
  name         String
  category     String
  unit         String
  quantity     Int         @default(0)
  status       StockStatus @default(AVAILABLE)

  // Kolom Baru Penyesuaian Data Real Excel
  avgUsage     Float?      @default(0)        // Rata-rata pemakaian/distribusi per bulan
  mos          Float?                         // Tingkat ketersediaan (Months of Supply)
  expiryDate   String?                        // Tanggal kedaluwarsa terdekat (format yyyy-mm-dd atau teks)
  nomenklatur  String?                        // Nomenklatur terapi klinis (misal: Antihipertensi, Antibiotik)
  source       String?     @default("MANUAL") // Asal data: "INDIKATOR", "PROGRAM", atau "MANUAL"

  updatedAt    DateTime    @updatedAt
  createdAt    DateTime    @default(now())

  @@index([category])
  @@index([status])
  @@index([source])
  @@map("medicine_stocks")
}
```

*Catatan Migrasi:* Semua kolom bersifat nullable/memiliki nilai *default* sehingga tidak ada data eksisting yang rusak (*100% backward compatible*).

---

## 4. Arsitektur Komponen & Alur Data

### A. TypeScript Type Definitions (`src/lib/dummy-data.ts`)
Memperbarui tipe `MedicineStockItem`:
```typescript
export type MedicineStockItem = {
  id: string;
  code: string;
  name: string;
  category: MedicineCategory;
  unit: string;
  quantity: number;
  status: StockStatus;
  updatedAt: string;
  avgUsage?: number;
  mos?: number;
  expiryDate?: string;
  nomenklatur?: string;
  source?: string;
};
```

### B. Helper Evaluasi Status & MOS (`src/lib/dummy-data.ts` atau `src/lib/stock-utils.ts`)
```typescript
export function getMosBadgeInfo(quantity: number, mos?: number | null) {
  if (quantity <= 0) {
    return { label: "Kosong (0 bln)", variant: "empty" };
  }
  if (mos === undefined || mos === null) {
    return null;
  }
  if (mos < 1) {
    return { label: `Kritis (${mos.toFixed(1)} bln)`, variant: "critical" };
  }
  if (mos < 3) {
    return { label: `Menipis (${mos.toFixed(1)} bln)`, variant: "low" };
  }
  if (mos <= 18) {
    return { label: `Aman (${mos.toFixed(1)} bln)`, variant: "safe" };
  }
  return { label: `Melimpah (> 18 bln)`, variant: "abundant" };
}
```

### C. Server Actions (`src/actions/stock.ts`)
1. **`createStockAction` & `updateStockAction`:** Mendukung input `avgUsage`, `mos`, `expiryDate`, `nomenklatur`, `source`.
2. **`importStockFileAction(formData: FormData)`:**
   - Membaca berkas `.xlsx` atau `.csv`.
   - Menggunakan package `xlsx` di lingkungan Node.js server.
   - Deteksi otomatis layout: Indikator, Program, atau CSV Standard.
   - Batch upsert ke PostgreSQL berdasarkan `code`.
   - Revalidate cache rute `/stok` dan `/admin/stok`.

### D. Tampilan Publik (`src/components/public/public-stock-client-view.tsx`)
- Menambahkan kolom **Tingkat Ketersediaan** di sebelah kolom Stok Fisik.
- Menampilkan badge MOS dengan warna kontekstual (Aman / Menipis / Kritis / Kosong).
- Di bawah nama obat, menampilkan subteks nomenklatur/kategori terapi dan tanggal kedaluwarsa terdekat jika tersedia.
- Tetap responsif di layar ponsel dengan horizontal scroll bersih dan card summary interaktif.

### E. Tampilan Admin (`src/app/(admin)/admin/stok/`)
- `stock-table.tsx`: Menampilkan kolom Tingkat Ketersediaan & aksi edit/hapus.
- `stock-form.tsx`: Modal tambah/edit mendukung field baru opsional.
- Modal impor diperbarui: Menerima `.xlsx` dan `.csv`, panduan format Indikator & Program, serta status proses impor.

---

## 5. Rencana Pengujian (Testing Strategy)
1. **Unit / Logic Test:** Pengujian parser file Excel (Indikator & Program) dan perhitungan MOS.
2. **Database Roundtrip:** Verifikasi `prisma db push`, `prisma db seed`, dan kueri PostgreSQL.
3. **Admin Actions Test:** Uji `createStockAction`, `updateStockAction`, dan `importStockFileAction`.
4. **Mobile Visual Check:** Verifikasi tabel publik dan admin di resolusi mobile (390px) tanpa layout shift atau text overflow.
