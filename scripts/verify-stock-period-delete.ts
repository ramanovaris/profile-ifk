/**
 * scripts/verify-stock-period-delete.ts
 *
 * Pengujian mandiri (TDD) untuk fitur Hapus / Reset Data Stok per Periode (Issue #111):
 * 1. Menolak pemanggilan tanpa sesi otentikasi.
 * 2. Menolak format periode yang tidak valid (bukan YYYY-MM).
 * 3. Menghapus seluruh record pada periode target secara terisolasi.
 * 4. Memastikan data pada periode riil lainnya sama sekali tidak terpengaruh.
 * 5. Idempotensi penghapusan (periode kosong menghasilkan count 0 tanpa error).
 */

import { db } from "../src/lib/db";
import { deleteStockPeriodAction } from "../src/actions/stock";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`   ✓ ${message}`);
}

async function runTests() {
  console.log("=== Memulai Pengujian Mandiri Hapus Periode Stok (#111) ===");

  const TEST_PERIOD = "2099-12";

  // Cleanup awal jika ada sisa data uji coba dari run sebelumnya
  await db.medicineStock.deleteMany({
    where: { period: TEST_PERIOD },
  });

  // Catat jumlah data pada periode produksi (misal 2026-08 atau lainnya)
  const initialProdCount = await db.medicineStock.count();
  console.log(`Jumlah total data awal di DB: ${initialProdCount}`);

  // 1. Uji otentikasi sesi
  console.log("1. Uji otentikasi sesi...");
  const unauthRes = await deleteStockPeriodAction(TEST_PERIOD);
  assert(
    unauthRes.success === false,
    "deleteStockPeriodAction menolak aksi tanpa otentikasi sesi"
  );

  // 2. Uji validasi format periode
  console.log("2. Uji validasi format periode...");
  const invalidFormat1 = await deleteStockPeriodAction("invalid-period", { _testUserId: "tester" });
  assert(
    invalidFormat1.success === false && Boolean(invalidFormat1.error?.includes("Format periode tidak valid")),
    "deleteStockPeriodAction menolak format periode 'invalid-period'"
  );

  const invalidFormat2 = await deleteStockPeriodAction("2026/08", { _testUserId: "tester" });
  assert(
    invalidFormat2.success === false,
    "deleteStockPeriodAction menolak format '2026/08'"
  );

  // 3. Setup data uji coba pada TEST_PERIOD
  console.log("3. Setup data uji coba 3 item pada periode 2099-12...");
  await db.medicineStock.createMany({
    data: [
      {
        period: TEST_PERIOD,
        code: "DEL-TEST-001",
        name: "Obat Uji Coba Hapus 1",
        category: "Obat Generik",
        unit: "Tablet",
        quantity: 100,
        status: "AVAILABLE",
      },
      {
        period: TEST_PERIOD,
        code: "DEL-TEST-002",
        name: "Obat Uji Coba Hapus 2",
        category: "Obat Program",
        unit: "Botol",
        quantity: 50,
        status: "LOW",
      },
      {
        period: TEST_PERIOD,
        code: "DEL-TEST-003",
        name: "Obat Uji Coba Hapus 3",
        category: "BMHP",
        unit: "Pcs",
        quantity: 0,
        status: "EMPTY",
      },
    ],
  });

  const createdCount = await db.medicineStock.count({
    where: { period: TEST_PERIOD },
  });
  assert(createdCount === 3, "Berhasil membuat 3 item uji coba pada periode 2099-12");

  // 4. Eksekusi penghapusan periode uji coba
  console.log("4. Eksekusi deleteStockPeriodAction...");
  const deleteRes = await deleteStockPeriodAction(TEST_PERIOD, { _testUserId: "tester" });
  assert(deleteRes.success === true, "deleteStockPeriodAction mengembalikan success = true");
  assert(deleteRes.count === 3, `Jumlah item terhapus tepat 3 (didapat: ${deleteRes.count})`);

  // 5. Verifikasi di DB bahwa TEST_PERIOD bersih total
  const remainingInTest = await db.medicineStock.count({
    where: { period: TEST_PERIOD },
  });
  assert(remainingInTest === 0, "Seluruh data pada periode 2099-12 telah terhapus dari basis data");

  // 6. Verifikasi isolasi: data periode lain sama sekali tidak terpengaruh
  const finalProdCount = await db.medicineStock.count();
  assert(
    finalProdCount === initialProdCount,
    `Data periode lain 100% aman (total data kembali ke awal: ${finalProdCount})`
  );

  // 7. Uji idempotensi (hapus periode yang sudah kosong tidak menyebabkan error)
  console.log("5. Uji idempotensi penghapusan periode kosong...");
  const idempotentRes = await deleteStockPeriodAction(TEST_PERIOD, { _testUserId: "tester" });
  assert(idempotentRes.success === true, "Penghapusan periode kosong tetap sukses");
  assert(idempotentRes.count === 0, "Count yang dikembalikan bernilai 0");

  console.log("🎉 SEMUA PENGUJIAN HAPUS PERIODE STOK (#111) BERHASIL!");
}

runTests()
  .catch((err) => {
    console.error("❌ Error runtime pengujian:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
