import * as assert from "node:assert";
import { 
  calculateMos, 
  determineStockStatus, 
  aggregateHistoricalUsage 
} from "../src/lib/stock-calc";
import { searchMedicineHistoryAction } from "../src/actions/stock";

console.log("Menjalankan rangkaian pengujian TDD untuk modul stock-calc...");

// ── 1. Uji Fungsi calculateMos ───────────────────────────────────────────────
console.log("1. Uji calculateMos:");
assert.strictEqual(calculateMos(2000, 10), 200.0, "2000 / 10 harus bernilai 200.0");
assert.strictEqual(calculateMos(100, 30), 3.3, "100 / 30 harus dibulatkan ke 3.3 (1 desimal)");
assert.strictEqual(calculateMos(0, 100), 0.0, "Kuantitas 0 harus menghasilkan MOS 0.0");
assert.strictEqual(calculateMos(500, 0), null, "Pemakaian 0 harus menghasilkan null (mencegah division by zero)");
assert.strictEqual(calculateMos(500, -10), null, "Pemakaian negatif harus menghasilkan null");
assert.strictEqual(calculateMos(500, null), null, "Pemakaian null harus menghasilkan null");
assert.strictEqual(calculateMos(500, undefined), null, "Pemakaian undefined harus menghasilkan null");
console.log("   ✅ Seluruh pengujian calculateMos lolos!");

// ── 2. Uji Fungsi determineStockStatus ─────────────────────────────────────────
console.log("2. Uji determineStockStatus:");
// Kuantitas 0 selalu EMPTY
assert.strictEqual(determineStockStatus(0, 10), "EMPTY", "Kuantitas 0 harus berstatus EMPTY meski MOS ada");
assert.strictEqual(determineStockStatus(0, null), "EMPTY", "Kuantitas 0 harus berstatus EMPTY");

// Berdasarkan nilai MOS (< 3 => LOW, >= 3 => AVAILABLE)
assert.strictEqual(determineStockStatus(50, 0.5), "LOW", "MOS 0.5 (<3) harus berstatus LOW");
assert.strictEqual(determineStockStatus(250, 2.9), "LOW", "MOS 2.9 (<3) harus berstatus LOW");
assert.strictEqual(determineStockStatus(300, 3.0), "AVAILABLE", "MOS 3.0 (>=3) harus berstatus AVAILABLE");
assert.strictEqual(determineStockStatus(5000, 12.0), "AVAILABLE", "MOS 12.0 (>=3) harus berstatus AVAILABLE");

// Fallback tanpa MOS (berdasarkan kuantitas fisik)
assert.strictEqual(determineStockStatus(499, null), "LOW", "Kuantitas < 500 tanpa MOS harus fallback ke LOW");
assert.strictEqual(determineStockStatus(500, null), "AVAILABLE", "Kuantitas >= 500 tanpa MOS harus fallback ke AVAILABLE");

// Manual status override ketika tanpa MOS
assert.strictEqual(determineStockStatus(100, null, "AVAILABLE"), "AVAILABLE", "Manual status AVAILABLE harus dihormati jika tanpa MOS");
console.log("   ✅ Seluruh pengujian determineStockStatus lolos!");

// ── 3. Uji Fungsi aggregateHistoricalUsage ────────────────────────────────────
console.log("3. Uji aggregateHistoricalUsage:");
const sampleHistory = [
  { period: "2026-07", avgUsage: 14000 },
  { period: "2026-06", avgUsage: 16000 },
];
const aggResult = aggregateHistoricalUsage(sampleHistory);
assert.strictEqual(aggResult.count, 2, "Jumlah sampel harus 2 periode");
assert.strictEqual(aggResult.avgUsage, 15000, "Rata-rata (14000 + 16000)/2 harus 15000");

// Kasus data kosong
const emptyAgg = aggregateHistoricalUsage([]);
assert.strictEqual(emptyAgg.count, 0);
assert.strictEqual(emptyAgg.avgUsage, 0);

// Kasus data dengan nilai null/0 (Standar Metode Konsumsi Kemenkes: tetap dibagi total bulan observasi)
const mixedHistory = [
  { period: "2026-07", avgUsage: 100 },
  { period: "2026-06", avgUsage: 0 },
  { period: "2026-05", avgUsage: null },
];
const mixedAgg = aggregateHistoricalUsage(mixedHistory);
assert.strictEqual(mixedAgg.count, 3, "Seluruh periode observasi (termasuk yang 0/null) harus menjadi pembagi");
assert.strictEqual(mixedAgg.avgUsage, 33.3, "Rata-rata 100 / 3 bulan harus 33.3");
console.log("   ✅ Seluruh pengujian aggregateHistoricalUsage lolos!");

// ── 4. Uji Server Action searchMedicineHistoryAction dengan Database Riil ──────
async function testDbSearch() {
  console.log("4. Uji searchMedicineHistoryAction terhadap basis data riil:");
  const res = await searchMedicineHistoryAction({
    query: "Alopurinol",
    currentPeriod: "2026-08",
  });

  assert.strictEqual(res.success, true, "Pencarian harus berhasil (success: true)");
  assert.ok(Array.isArray(res.data), "Hasil data harus berupa array");
  assert.ok(res.data.length > 0, "Harus menemukan setidaknya 1 riwayat Alopurinol");

  const item = res.data[0];
  console.log("   Hasil riwayat obat ditemukan:", {
    code: item.code,
    name: item.name,
    category: item.category,
    unit: item.unit,
    historicalAvgUsage: item.historicalAvgUsage,
    sampleCount: item.sampleCount,
  });

  assert.strictEqual(item.code, "IND-001", "Kode obat harus IND-001");
  assert.ok(item.historicalAvgUsage > 0, "historicalAvgUsage harus lebih dari 0");
  assert.ok(item.sampleCount >= 1, "sampleCount harus setidaknya 1 bulan riwayat");
  console.log("   ✅ Pengujian integrasi basis data riil lolos!");
}

testDbSearch().catch((err) => {
  console.error("❌ Terjadi kegagalan pengujian:", err);
  process.exit(1);
});
