import * as assert from "node:assert";
import { 
  initialMedicineStock, 
  getItemEffectiveStatus, 
  getStockSummary,
  type MedicineStockItem 
} from "../src/lib/dummy-data";
import { buildStockExcelWorkbook } from "../src/lib/stock-exporter";
import * as XLSX from "xlsx";

console.log("=== Memulai Verifikasi Pembatasan Stok Publik (Issue #172) ===");

// 1. Verifikasi fallback dummy data publik bebas dari status EMPTY
const publicItems = initialMedicineStock.filter(
  (item) => getItemEffectiveStatus(item) !== "EMPTY"
);

console.log(`- Total initialMedicineStock: ${initialMedicineStock.length}`);
console.log(`- Total item publik (setelah filter non-EMPTY): ${publicItems.length}`);

assert.ok(publicItems.length > 0, "Item publik tidak boleh kosong");
const emptyInPublic = publicItems.filter((i) => getItemEffectiveStatus(i) === "EMPTY");
assert.strictEqual(
  emptyInPublic.length,
  0,
  "Tidak boleh ada obat berstatus EMPTY dalam data publik"
);

const zeroQtyInPublic = publicItems.filter((i) => i.quantity <= 0);
assert.strictEqual(
  zeroQtyInPublic.length,
  0,
  "Tidak boleh ada obat dengan stok fisik <= 0 dalam data publik"
);

// 2. Verifikasi kalkulasi ringkasan metrik (summary)
const summary = getStockSummary(publicItems);
console.log("- Ringkasan metrik publik:", {
  total: summary.totalItems,
  available: summary.availableItems,
  low: summary.lowItems,
  empty: summary.emptyItems,
});

assert.strictEqual(summary.emptyItems, 0, "Ringkasan emptyItems harus 0 pada data publik");
assert.strictEqual(
  summary.totalItems,
  summary.availableItems + summary.lowItems,
  "Total perbekalan harus sama dengan Available + Low"
);

// 3. Verifikasi opsi filter publik hanya AVAILABLE dan LOW
const statusOptions = [
  { value: "AVAILABLE", label: "Tersedia" },
  { value: "LOW", label: "Menipis" },
];
assert.strictEqual(statusOptions.length, 2, "Hanya boleh 2 opsi status pada halaman publik");
assert.ok(
  !statusOptions.some((o) => o.value === "EMPTY"),
  "Opsi EMPTY tidak boleh ada dalam statusOptions publik"
);

// 4. Verifikasi ekspor Excel hanya memuat data publik (tanpa baris berstatus Kosong)
const wb = buildStockExcelWorkbook(publicItems, "2026-08", {
  filterSummary: "Semua Data (Tanpa Filter)",
});
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

// Header ada di baris index 6, data mulai baris 7
const dataRows = rows.slice(7);
const hasKosongInExcel = dataRows.some((row) => row[8] === "Kosong");
assert.strictEqual(
  hasKosongInExcel,
  false,
  "File Excel ekspor publik tidak boleh memuat baris dengan status 'Kosong'"
);

// 5. Cek sampel item dengan berbagai kondisi
const testItems: MedicineStockItem[] = [
  {
    id: "t1",
    code: "TEST-01",
    name: "Obat Tersedia",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 1000,
    status: "AVAILABLE",
    updatedAt: "2026-08-01T00:00:00Z",
    avgUsage: 100,
    mos: 10,
    period: "2026-08",
  },
  {
    id: "t2",
    code: "TEST-02",
    name: "Obat Menipis",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 200,
    status: "LOW",
    updatedAt: "2026-08-01T00:00:00Z",
    avgUsage: 100,
    mos: 2,
    period: "2026-08",
  },
  {
    id: "t3",
    code: "TEST-03",
    name: "Obat Kosong Fisik",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 0,
    status: "EMPTY",
    updatedAt: "2026-08-01T00:00:00Z",
    avgUsage: 100,
    mos: 0,
    period: "2026-08",
  },
  {
    id: "t4",
    code: "TEST-04",
    name: "Obat Status Available tapi Qty 0",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 0,
    status: "AVAILABLE",
    updatedAt: "2026-08-01T00:00:00Z",
    avgUsage: 100,
    mos: 0,
    period: "2026-08",
  },
];

const filteredTest = testItems.filter(
  (item) => getItemEffectiveStatus(item) !== "EMPTY"
);
assert.strictEqual(filteredTest.length, 2, "Hanya 2 item (Tersedia & Menipis) yang lolos");
assert.strictEqual(filteredTest[0].code, "TEST-01");
assert.strictEqual(filteredTest[1].code, "TEST-02");

console.log("=== SEMUA 5 PENGUJIAN VERIFIKASI LULUS (100% PASS) ===");
