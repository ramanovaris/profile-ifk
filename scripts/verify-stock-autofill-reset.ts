import * as assert from "node:assert";
import {
  applyAutofillSelection,
  handleNameInputChange,
  handleCodeInputChange,
  type AddStockFormData,
  type AutofilledSource,
} from "../src/lib/stock-autofill";

console.log("🚀 Menjalankan pengujian logika reset autofill modal tambah obat...");

const defaultForm: AddStockFormData = {
  code: "",
  name: "",
  category: "Obat Generik",
  unit: "Tablet",
  quantity: "100",
  status: "AVAILABLE",
  avgUsage: "",
  mos: "",
  expiryDate: "",
  nomenklatur: "",
};

// ── Test 1: Inisialisasi awal ───────────────────────────────────────────────
console.log("  [Test 1] Mengetik nama baru tanpa autofill sebelumnya...");
const test1 = handleNameInputChange("Paracetamol", defaultForm, null);
assert.strictEqual(test1.form.name, "Paracetamol");
assert.strictEqual(test1.form.code, "");
assert.strictEqual(test1.resetHint, false);
assert.strictEqual(test1.autofilledSource, null);
console.log("  ✓ Test 1 Passed");

// ── Test 2: Pemilihan autofill obat lama ─────────────────────────────────────
console.log("  [Test 2] Memilih obat terdaftar dari riwayat...");
const historyItem = {
  code: "OBT-091",
  name: "Obat Kuat",
  category: "Obat Program",
  unit: "Tablet",
  nomenklatur: "Sildenafil 50mg",
  historicalAvgUsage: 200,
};

const autofilled = applyAutofillSelection(historyItem, defaultForm);
assert.strictEqual(autofilled.form.name, "Obat Kuat");
assert.strictEqual(autofilled.form.code, "OBT-091");
assert.strictEqual(autofilled.form.category, "Obat Program");
assert.strictEqual(autofilled.form.unit, "Tablet");
assert.strictEqual(autofilled.form.nomenklatur, "Sildenafil 50mg");
assert.strictEqual(autofilled.form.avgUsage, "200");
assert.strictEqual(autofilled.form.mos, "0.5"); // 100 / 200 = 0.5
assert.strictEqual(autofilled.form.status, "LOW"); // MOS < 3.0
assert.deepStrictEqual(autofilled.autofilledSource, {
  code: "OBT-091",
  name: "Obat Kuat",
  category: "Obat Program",
  unit: "Tablet",
  nomenklatur: "Sildenafil 50mg",
  avgUsage: "200",
});
console.log("  ✓ Test 2 Passed");

// ── Test 3: Kasus Screenshot Bug: Pengguna mengganti nama jadi obat baru ─────
console.log("  [Test 3] Mengganti nama obat ke 'dmfdf' setelah autofill...");
const test3 = handleNameInputChange("dmfdf", autofilled.form, autofilled.autofilledSource);
assert.strictEqual(test3.resetHint, true, "Banner peringatan harus direset");
assert.strictEqual(test3.form.name, "dmfdf");
assert.strictEqual(test3.form.code, "", "Kode barang bekas autofill harus direset kosong");
assert.strictEqual(test3.form.avgUsage, "", "RPB bekas autofill harus direset kosong");
assert.strictEqual(test3.form.mos, "", "MOS bekas autofill harus direset kosong");
assert.strictEqual(test3.form.nomenklatur, "", "Nomenklatur bekas autofill harus direset kosong");
assert.strictEqual(test3.form.category, "Obat Generik", "Kategori harus kembali ke default");
assert.strictEqual(test3.autofilledSource, null, "autofilledSource harus direset ke null");
console.log("  ✓ Test 3 Passed: Celah bug berhasil diatasi!");

// ── Test 4: Pengguna mengganti kode obat setelah autofill ───────────────────
console.log("  [Test 4] Mengganti kode obat setelah autofill...");
const test4 = handleCodeInputChange("OBT-999", autofilled.form, autofilled.autofilledSource);
assert.strictEqual(test4.resetHint, true, "Banner peringatan harus direset");
assert.strictEqual(test4.form.code, "OBT-999");
assert.strictEqual(test4.form.name, "", "Nama obat bekas autofill harus direset kosong");
assert.strictEqual(test4.form.avgUsage, "", "RPB bekas autofill harus direset kosong");
assert.strictEqual(test4.autofilledSource, null, "autofilledSource harus direset ke null");
console.log("  ✓ Test 4 Passed");

// ── Test 5: Variasi whitespace/kapitalisasi pada nama yang sama ─────────────
console.log("  [Test 5] Mengetik ulang nama yang sama persis...");
const test5 = handleNameInputChange("obat kuat", autofilled.form, autofilled.autofilledSource);
assert.strictEqual(test5.resetHint, false);
assert.strictEqual(test5.form.code, "OBT-091");
assert.strictEqual(test5.form.avgUsage, "200");
console.log("  ✓ Test 5 Passed");

// ── Test 6: Nilai manual yang diubah pengguna tidak ikut terhapus sewenang-wenang
console.log("  [Test 6] User telah mengubah RPB secara manual...");
const formWithManualUsage: AddStockFormData = {
  ...autofilled.form,
  avgUsage: "500", // manual
};
const test6 = handleNameInputChange("Obat Herbal", formWithManualUsage, autofilled.autofilledSource);
assert.strictEqual(test6.form.avgUsage, "500", "RPB manual user tidak boleh direset ke kosong");
assert.strictEqual(test6.form.code, "", "Kode lama tetap harus direset");
console.log("  ✓ Test 6 Passed");

console.log("\n🎉 SEMUA PENGUJIAN LOGIKA RESET AUTOFILL BERHASIL (6/6 PASS)");
