import { db } from "../src/lib/db";

async function main() {
  console.log("=== Verifikasi Skema Database Master Denah Gudang IFK ===");

  // 1. Cek Model Warehouse
  if (!("warehouse" in db)) {
    throw new Error("Model 'warehouse' belum terdaftar pada Prisma Client!");
  }
  if (!("warehouseRack" in db)) {
    throw new Error("Model 'warehouseRack' belum terdaftar pada Prisma Client!");
  }
  if (!("warehouseItem" in db)) {
    throw new Error("Model 'warehouseItem' belum terdaftar pada Prisma Client!");
  }
  if (!("warehousePlacement" in db)) {
    throw new Error("Model 'warehousePlacement' belum terdaftar pada Prisma Client!");
  }

  // 2. Cek keberadaan 3 Gedung IFK
  const buildings = await db.warehouse.findMany({ orderBy: { id: "asc" } });
  console.log(`- Jumlah gedung terdaftar: ${buildings.length}`);
  if (buildings.length < 3) {
    throw new Error(`Gedung terdaftar kurang dari 3! Ditemukan: ${buildings.length}`);
  }

  const expectedIds = ["KT", "SJ", "TD"];
  for (const id of expectedIds) {
    const found = buildings.find((b: { id: string }) => b.id === id);
    if (!found) {
      throw new Error(`Gedung dengan ID '${id}' tidak ditemukan!`);
    }
  }

  // 3. Cek rak Saijaan, Todak, Kantor
  const racks = await db.warehouseRack.findMany({ include: { warehouse: true } });
  console.log(`- Jumlah baris rak terdaftar: ${racks.length}`);
  if (racks.length < 24) {
    throw new Error(`Jumlah rak fisik minimal 24 (12 SJ + 8 TD + 4 KT)! Ditemukan: ${racks.length}`);
  }

  // 4. Cek relasi item dan placement
  const placements = await db.warehousePlacement.findMany({
    include: {
      item: true,
      rack: true,
    },
  });
  console.log(`- Jumlah pemetaan barang (placements): ${placements.length}`);
  if (placements.length === 0) {
    throw new Error("Belum ada data barang fisik yang terpetakan ke rak!");
  }

  for (const p of placements) {
    if (!p.item || !p.rack) {
      throw new Error(`Relasi placement id ${p.id} rusak: item atau rack tidak terhubung.`);
    }
    if (!p.locationCode.startsWith(p.rack.id)) {
      throw new Error(`Format locationCode '${p.locationCode}' tidak sesuai dengan rack id '${p.rack.id}'`);
    }
  }

  console.log("Semua pengujian skema database master denah gudang IFK: LULUS (100% PASS)\n");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
