import * as fs from "fs";
import { parseStockWorkbook } from "../src/lib/stock-parser";
import { batchImportStockAction, createStockAction, updateStockAction, deleteStockAction } from "../src/actions/stock";
import { db } from "../src/lib/db";

async function main() {
  console.log("=== UJI COBA 1: Parser File Excel Obat Indikator ===");
  const fileIndikator = "/home/ubuntu/.hermes/cache/documents/doc_b4a435ccc88b_Survei Obat Indikator Periode June 2026.xlsx";
  const bufInd = fs.readFileSync(fileIndikator);
  const itemsInd = parseStockWorkbook(bufInd);

  console.log(`Berhasil mengurai ${itemsInd.length} item Obat Indikator.`);
  if (itemsInd.length !== 40) {
    throw new Error(`Ekspektasi 40 item Indikator, didapat: ${itemsInd.length}`);
  }
  const sampleInd = itemsInd[0];
  console.log("Contoh Item Indikator:", {
    code: sampleInd.code,
    name: sampleInd.name,
    category: sampleInd.category,
    unit: sampleInd.unit,
    quantity: sampleInd.quantity,
    avgUsage: sampleInd.avgUsage,
    mos: sampleInd.mos,
    nomenklatur: sampleInd.nomenklatur,
    status: sampleInd.status,
  });

  console.log("\n=== UJI COBA 2: Parser File Excel Obat Program ===");
  const fileProgram = "/home/ubuntu/.hermes/cache/documents/doc_bcd35b03bfa9_Template Pelaporan Ketersediaan Obat Program 2026 06-.xlsx";
  const bufProg = fs.readFileSync(fileProgram);
  const itemsProg = parseStockWorkbook(bufProg);

  console.log(`Berhasil mengurai ${itemsProg.length} item Obat Program.`);
  if (itemsProg.length !== 60) {
    throw new Error(`Ekspektasi 60 item Program, didapat: ${itemsProg.length}`);
  }
  const sampleProg = itemsProg[0];
  console.log("Contoh Item Program:", {
    code: sampleProg.code,
    name: sampleProg.name,
    category: sampleProg.category,
    unit: sampleProg.unit,
    quantity: sampleProg.quantity,
    avgUsage: sampleProg.avgUsage,
    mos: sampleProg.mos,
    expiryDate: sampleProg.expiryDate,
    nomenklatur: sampleProg.nomenklatur,
    status: sampleProg.status,
  });

  console.log("\n=== UJI COBA 3: Batch Import ke Database ===");
  const resInd = await batchImportStockAction(itemsInd, { _testUserId: "test-admin" });
  console.log("Hasil impor Indikator:", resInd);

  const resProg = await batchImportStockAction(itemsProg, { _testUserId: "test-admin" });
  console.log("Hasil impor Program:", resProg);

  console.log("\n=== UJI COBA 4: CRUD Single Item dengan Field Baru ===");
  const testCode = "TEST-CRUD-" + Date.now();
  const createRes = await createStockAction({
    code: testCode,
    name: "Uji Coba Obat Baru MOS",
    category: "Obat Generik",
    unit: "Botol",
    quantity: 1500,
    avgUsage: 250,
    mos: 6.0,
    expiryDate: "2028-06-30",
    nomenklatur: "Antimikroba",
    source: "MANUAL",
    _testUserId: "test-admin",
  });
  console.log("Create result:", createRes.success, createRes.data?.code, createRes.data?.mos);

  if (!createRes.data?.id) throw new Error("Gagal membuat item uji coba.");

  const updateRes = await updateStockAction(createRes.data.id, {
    quantity: 200,
    mos: 0.8,
    _testUserId: "test-admin",
  });
  console.log("Update result:", updateRes.success, updateRes.data?.quantity, updateRes.data?.status, updateRes.data?.mos);

  const deleteRes = await deleteStockAction(createRes.data.id, { _testUserId: "test-admin" });
  console.log("Delete result:", deleteRes.success);

  const totalInDb = await db.medicineStock.count();
  console.log(`\nTotal stok dalam database sekarang: ${totalInDb} item.`);
  console.log("Semua pengujian server action sukses!");
}

main()
  .catch((e) => {
    console.error("Uji coba gagal:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
