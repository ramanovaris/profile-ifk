import assert from "assert";
import { db } from "../src/lib/db";
import { createStockPeriodAction } from "../src/actions/stock";

async function main() {
  console.log("Menjalankan pengujian TDD untuk createStockPeriodAction...");

  // 1. Uji validasi format periode
  console.log("1. Pengujian validasi format periode...");
  const invalidRes1 = await createStockPeriodAction({
    targetPeriod: "2026/08",
    mode: "COPY",
    _testUserId: "test-super-admin",
  });
  assert.strictEqual(invalidRes1.success, false, "Format '2026/08' harus ditolak");

  const invalidRes2 = await createStockPeriodAction({
    targetPeriod: "2026-8",
    mode: "COPY",
    _testUserId: "test-super-admin",
  });
  assert.strictEqual(invalidRes2.success, false, "Format '2026-8' harus ditolak");

  console.log("   ✅ Validasi format periode lolos!");

  // 2. Uji penolakan duplikasi periode yang sudah ada di basis data
  console.log("2. Pengujian penolakan duplikasi periode eksis...");
  const dupRes = await createStockPeriodAction({
    targetPeriod: "2026-06",
    mode: "COPY",
    sourcePeriod: "2026-06",
    _testUserId: "test-super-admin",
  });
  assert.strictEqual(dupRes.success, false, "Periode '2026-06' yang sudah ada harus ditolak");
  assert(
    dupRes.error?.includes("sudah terdaftar") || dupRes.error?.includes("sudah ada"),
    "Pesan galat harus mengindikasikan duplikasi periode"
  );
  console.log("   ✅ Penolakan periode duplikat lolos:", dupRes.error);

  // 3. Uji pembuatan periode mode COPY (dari 2026-06 ke 2026-99)
  console.log("3. Pengujian pembuatan periode mode COPY...");
  const testPeriod = "2026-99";
  // Bersihkan data uji jika sebelumnya tersisa
  await db.medicineStock.deleteMany({ where: { period: testPeriod } });

  const copyRes = await createStockPeriodAction({
    targetPeriod: testPeriod,
    mode: "COPY",
    sourcePeriod: "2026-06",
    _testUserId: "test-super-admin",
  });

  assert.strictEqual(copyRes.success, true, "createStockPeriodAction mode COPY harus berhasil");
  assert.strictEqual(copyRes.data?.period, testPeriod);
  assert(copyRes.data!.count > 0, "Jumlah obat disalin harus lebih dari 0");
  console.log(`   Berhasil menyalin ${copyRes.data!.count} obat ke periode ${testPeriod}`);

  // Verifikasi isi data di basis data
  const createdItems = await db.medicineStock.findMany({
    where: { period: testPeriod },
  });
  assert.strictEqual(createdItems.length, copyRes.data!.count, "Jumlah record di DB harus sama");

  for (const item of createdItems) {
    assert.strictEqual(item.quantity, 0, `Kuantitas obat ${item.name} harus di-reset ke 0`);
    assert.strictEqual(item.status, "EMPTY", `Status obat ${item.name} harus EMPTY`);
    assert.strictEqual(item.source, "MANUAL", "Source obat harus MANUAL");
  }
  console.log("   ✅ Verifikasi data tersalin di DB lolos (semua stok = 0, status = EMPTY)!");

  // Bersihkan data uji
  await db.medicineStock.deleteMany({ where: { period: testPeriod } });
  console.log("   ✅ Data uji berhasil dibersihkan");

  // 4. Uji mode BLANK
  console.log("4. Pengujian pembuatan periode mode BLANK...");
  const blankRes = await createStockPeriodAction({
    targetPeriod: "2026-98",
    mode: "BLANK",
    _testUserId: "test-super-admin",
  });
  assert.strictEqual(blankRes.success, true, "createStockPeriodAction mode BLANK harus berhasil");
  assert.strictEqual(blankRes.data?.count, 0, "Mode BLANK mengembalikan count 0");
  console.log("   ✅ Pengujian mode BLANK lolos!");

  console.log("\n🎉 Seluruh pengujian TDD createStockPeriodAction berhasil 100%!");
}

main().catch((err) => {
  console.error("❌ Galat pengujian:", err);
  process.exit(1);
});
