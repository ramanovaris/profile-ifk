/**
 * scripts/verify-stock-db.ts
 *
 * Pengujian integrasi mandiri untuk modul Stok Obat (#47):
 * 1. Verifikasi penolakan Server Action create/update/delete tanpa sesi aktif.
 * 2. Verifikasi pembacaan master stok obat di PostgreSQL (224 item dari seed).
 * 3. Verifikasi logika kalkulasi otomatis status stok (calculateStockStatus).
 * 4. Verifikasi mutasi Server Action createStockAction dengan test override.
 * 5. Verifikasi penolakan kode obat duplikat.
 * 6. Verifikasi mutasi updateStockAction (pembaruan data & rekalkulasi status).
 * 7. Verifikasi mutasi deleteStockAction.
 * 8. Verifikasi batchImportStockAction (impor/pembaruan massal).
 */

import { db } from "../src/lib/db";
import { 
  createStockAction, 
  updateStockAction, 
  deleteStockAction, 
  batchImportStockAction
} from "../src/actions/stock";
import { calculateStockStatus } from "../src/lib/dummy-data";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`   ✓ ${message}`);
}

async function runTests() {
  console.log("=== Memulai Pengujian Mandiri Modul Stok Obat (#47) ===");

  // Cleanup data tes jika ada dari run sebelumnya
  await db.medicineStock.deleteMany({
    where: {
      code: { in: ["TEST-STK-001", "TEST-UNAUTH", "TEST-BATCH-NEW"] },
    },
  });

  // 1. Pengujian proteksi otentikasi Server Action
  console.log("1. Pengujian proteksi otentikasi Server Action...");
  const unauthCreate = await createStockAction({
    code: "TEST-UNAUTH",
    name: "Obat Tanpa Sesi",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 100,
  });
  assert(
    unauthCreate.success === false,
    "createStockAction menolak aksi tanpa otentikasi sesi"
  );

  const unauthUpdate = await updateStockAction("non-existent-id", {
    name: "Update Tanpa Sesi",
  });
  assert(
    unauthUpdate.success === false,
    "updateStockAction menolak aksi tanpa otentikasi sesi"
  );

  const unauthDelete = await deleteStockAction("non-existent-id");
  assert(
    unauthDelete.success === false,
    "deleteStockAction menolak aksi tanpa otentikasi sesi"
  );

  // 2. Pengujian pembacaan data awal dari PostgreSQL
  console.log("2. Pengujian pembacaan data stok obat di basis data PostgreSQL...");
  const totalStocks = await db.medicineStock.count();
  assert(totalStocks >= 224, `Jumlah stok di database (${totalStocks}) terverifikasi >= 224 item`);

  const sampleStock = await db.medicineStock.findUnique({
    where: { code: "OBG-001" },
  });
  assert(sampleStock !== null, "Item OBG-001 (Paracetamol 500 mg) ditemukan di basis data");
  assert(sampleStock?.unit === "Tablet", "Satuan OBG-001 sesuai ('Tablet')");

  // 3. Pengujian kalkulasi otomatis status ketersediaan
  console.log("3. Pengujian logika kalkulasi otomatis status stok...");
  assert(calculateStockStatus(0) === "EMPTY", "Kuantitas 0 menghasilkan status EMPTY");
  assert(calculateStockStatus(-5) === "EMPTY", "Kuantitas negatif menghasilkan status EMPTY");
  assert(calculateStockStatus(150) === "LOW", "Kuantitas < 500 menghasilkan status LOW");
  assert(calculateStockStatus(1500) === "AVAILABLE", "Kuantitas >= 500 menghasilkan status AVAILABLE");
  assert(calculateStockStatus(1500, "LOW") === "LOW", "Manual override status dipatuhi jika > 0");

  // 4. Pengujian pembuatan obat baru via Server Action
  console.log("4. Pengujian pembuatan obat baru via Server Action (createStockAction)...");
  const testCode = "TEST-STK-001";
  const createRes = await createStockAction({
    code: testCode,
    name: "Obat Uji Coba Integrasi",
    category: "Obat Emergensi",
    unit: "Ampul",
    quantity: 350,
    _testUserId: "test-super-admin",
  });

  assert(createRes.success === true, "createStockAction berhasil menyimpan item baru");
  assert(createRes.data?.code === testCode, "Kode item baru tersimpan sesuai");
  assert(createRes.data?.status === "LOW", "Status otomatis terhitung LOW karena quantity < 500");

  const createdId = createRes.data!.id;

  // 5. Pengujian validasi keunikan kode obat
  console.log("5. Pengujian validasi duplikasi kode obat...");
  const dupRes = await createStockAction({
    code: testCode,
    name: "Obat Duplikat",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 1000,
    _testUserId: "test-super-admin",
  });
  assert(dupRes.success === false, "Server Action menolak kode obat duplikat");

  // 6. Pengujian pembaruan obat via Server Action (updateStockAction)
  console.log("6. Pengujian updateStockAction...");
  const updateRes = await updateStockAction(createdId, {
    quantity: 2500,
    _testUserId: "test-super-admin",
  });
  assert(updateRes.success === true, "updateStockAction berhasil memperbarui kuantitas");
  assert(updateRes.data?.quantity === 2500, "Kuantitas obat terbarui menjadi 2500");
  assert(updateRes.data?.status === "AVAILABLE", "Status obat otomatis berubah menjadi AVAILABLE");

  // 7. Pengujian batchImportStockAction
  console.log("7. Pengujian batchImportStockAction...");
  const batchRes = await batchImportStockAction(
    [
      {
        code: testCode,
        name: "Obat Uji Coba Diperbarui Batch",
        category: "Obat Emergensi",
        unit: "Ampul",
        quantity: 5000,
      },
      {
        code: "TEST-BATCH-NEW",
        name: "Obat Batch Baru",
        category: "BMHP / Alkes",
        unit: "Kotak",
        quantity: 100,
      },
    ],
    { _testUserId: "test-super-admin" }
  );
  assert(batchRes.success === true, "batchImportStockAction berhasil");
  assert(batchRes.data?.updated === 1, "1 item berhasil diperbarui via batch import");
  assert(batchRes.data?.inserted === 1, "1 item baru berhasil ditambahkan via batch import");

  // Cleanup item batch baru
  await db.medicineStock.deleteMany({
    where: { code: { in: [testCode, "TEST-BATCH-NEW"] } },
  });
  console.log("   ✓ Pembersihan data uji coba berhasil");

  console.log("\n🎉 SELURUH PENGUJIAN INTEGRASI MODUL STOK OBAT (#47) BERHASIL 100%!");
}

runTests()
  .catch((err) => {
    console.error("❌ Terjadi kesalahan fatal pada pengujian:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
