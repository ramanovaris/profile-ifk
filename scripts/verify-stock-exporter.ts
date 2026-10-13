import * as assert from "node:assert";
import * as XLSX from "xlsx";
import { buildStockExcelWorkbook } from "../src/lib/stock-exporter";
import type { MedicineStockItem } from "../src/lib/dummy-data";

const sampleItems: MedicineStockItem[] = [
  {
    id: "item-1",
    code: "IND-001",
    name: "Paracetamol 500 mg Tablet",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 15000,
    status: "AVAILABLE",
    updatedAt: "2026-07-31T00:00:00Z",
    avgUsage: 2500,
    mos: 6.0,
    period: "2026-07",
  },
  {
    id: "item-2",
    code: "PRG-002",
    name: "MDT Dewasa MB (Multi Drug Therapy Lepra)",
    category: "Obat Program",
    unit: "Blister",
    quantity: 80,
    status: "LOW",
    updatedAt: "2026-07-31T00:00:00Z",
    avgUsage: 40,
    mos: 2.0,
    nomenklatur: "Kusta (Lepra)",
    period: "2026-07",
  },
  {
    id: "item-3",
    code: "IND-003",
    name: "Amoxicillin 500 mg Kapsul",
    category: "Obat Generik",
    unit: "Kapsul",
    quantity: 0,
    status: "EMPTY",
    updatedAt: "2026-07-31T00:00:00Z",
    avgUsage: 1200,
    mos: 0,
    period: "2026-07",
  },
];

console.log("Memulai pengujian modul stock-exporter...");

const wb = buildStockExcelWorkbook(sampleItems, "2026-07", {
  filterSummary: "Kategori: Obat Generik, Obat Program",
});

assert.ok(wb.SheetNames.length > 0, "Workbook harus memiliki minimal 1 sheet");
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
assert.ok(ws, "Sheet harus valid");

const rawData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
console.log("Jumlah baris sheet:", rawData.length);

// Baris 1: PEMERINTAH KABUPATEN KOTABARU
assert.strictEqual(rawData[0]?.[0], "PEMERINTAH KABUPATEN KOTABARU");

// Baris 2: DINAS KESEHATAN — UPTD INSTALASI FARMASI
assert.strictEqual(rawData[1]?.[0], "DINAS KESEHATAN — UPTD INSTALASI FARMASI");

// Baris 3: REKAPITULASI KETERSEDIAAN OBAT & BMHP
assert.strictEqual(rawData[2]?.[0], "REKAPITULASI KETERSEDIAAN OBAT & BMHP");

// Baris 4: Keterangan Periode
assert.ok(String(rawData[3]?.[0]).includes("Juli 2026"), "Baris 4 harus mencantumkan periode data 'Juli 2026'");

// Baris 5: Keterangan Filter
assert.ok(String(rawData[4]?.[0]).includes("Obat Generik"), "Baris 5 harus mencantumkan ringkasan filter");

// Baris 7: Header tabel
const tableHeader = rawData[6];
assert.strictEqual(tableHeader[0], "No");
assert.strictEqual(tableHeader[1], "Kode Barang");
assert.strictEqual(tableHeader[2], "Nama Obat / BMHP");
assert.strictEqual(tableHeader[3], "Satuan");
assert.strictEqual(tableHeader[4], "Kategori");
assert.strictEqual(tableHeader[5], "Sisa Stok Fisik");
assert.strictEqual(tableHeader[6], "Rata-rata Pemakaian (RPB)");
assert.strictEqual(tableHeader[7], "Kecukupan Stok (Bulan)");
assert.strictEqual(tableHeader[8], "Status Ketersediaan");

// Baris data (8, 9, 10)
const row1 = rawData[7];
assert.strictEqual(row1[0], 1);
assert.strictEqual(row1[1], "IND-001");
assert.strictEqual(row1[2], "Paracetamol 500 mg Tablet");
assert.strictEqual(row1[5], 15000);
assert.strictEqual(row1[6], 2500);
assert.strictEqual(row1[7], 6.0);
assert.strictEqual(row1[8], "Aman");

const row2 = rawData[8];
assert.strictEqual(row2[0], 2);
assert.strictEqual(row2[1], "PRG-002");
assert.strictEqual(row2[5], 80);
assert.strictEqual(row2[6], 40);
assert.strictEqual(row2[7], 2.0);
assert.strictEqual(row2[8], "Menipis");

const row3 = rawData[9];
assert.strictEqual(row3[0], 3);
assert.strictEqual(row3[1], "IND-003");
assert.strictEqual(row3[5], 0);
assert.strictEqual(row3[8], "Kosong");

console.log("✅ Seluruh uji assertion stock-exporter lolos dengan sempurna!");
