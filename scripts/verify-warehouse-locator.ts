import { db } from "../src/lib/db";
import {
  getWarehouseBuildingsAction,
  getWarehouseMapDataAction,
  searchWarehouseItemsAction,
  saveWarehouseRackLayoutAction,
} from "../src/actions/warehouse";
import { BUILDING_LAYOUTS } from "../src/lib/warehouse-map-data";

async function main() {
  console.log("==================================================================");
  console.log("VERIFIKASI KOMPREHENSIF: MODUL DENAH INTERAKTIF GUDANG IFK (#188)");
  console.log("==================================================================\n");

  // 1. Uji Integritas Skema Database & Relasi
  console.log("1. Pengujian Integritas Database Prisma...");
  const [warehouseCount, rackCount, itemCount, placementCount] = await Promise.all([
    db.warehouse.count(),
    db.warehouseRack.count(),
    db.warehouseItem.count(),
    db.warehousePlacement.count(),
  ]);

  console.log(`   - Gedung: ${warehouseCount} (Target: >= 3)`);
  console.log(`   - Rak Fisik: ${rackCount} (Target: >= 24)`);
  console.log(`   - Master Barang Denah: ${itemCount} (Target: >= 16)`);
  console.log(`   - Pemetaan Ambalan: ${placementCount} (Target: >= 16)`);

  if (warehouseCount < 3 || rackCount < 24 || itemCount < 16 || placementCount < 16) {
    throw new Error("Data master gudang belum lengkap!");
  }
  console.log("   ✓ Integritas Relasional Database: LULUS\n");

  // 2. Uji Koordinat Spasial Dinamis pada Seluruh Rak
  console.log("2. Pengujian Koordinat Spasial Rak Fisik...");
  const allRacks = await db.warehouseRack.findMany();
  for (const r of allRacks) {
    if (r.width <= 0 || r.height <= 0) {
      throw new Error(`Dimensi rak ${r.id} tidak valid: ${r.width}x${r.height}`);
    }
    if (r.x < 0 || r.y < 0) {
      throw new Error(`Posisi rak ${r.id} berada di luar area: (${r.x}, ${r.y})`);
    }
  }
  console.log(`   ✓ Seluruh ${allRacks.length} rak memiliki koordinat spasial valid.\n`);

  // 3. Uji Server Actions Query Denah & Dynamic Layout
  console.log("3. Pengujian Server Actions Query Denah...");
  const buildingsRes = await getWarehouseBuildingsAction();
  if (!buildingsRes.success || !buildingsRes.data) {
    throw new Error("getWarehouseBuildingsAction gagal!");
  }

  for (const b of buildingsRes.data) {
    const mapRes = await getWarehouseMapDataAction(b.id);
    if (!mapRes.success || !mapRes.data) {
      throw new Error(`getWarehouseMapDataAction untuk gedung ${b.id} gagal!`);
    }
    const layout = mapRes.data.layout;
    if (!layout.viewBox || layout.racks.length === 0) {
      throw new Error(`Layout gedung ${b.id} kosong!`);
    }
    console.log(`   - Gedung ${b.name}: ${layout.racks.length} rak, ${mapRes.data.placements.length} penempatan.`);
  }
  console.log("   ✓ Query Denah Dinamis 3 Gedung: LULUS\n");

  // 4. Uji Pencarian Cerdas Fonetik & Akronim Farmasi
  console.log("4. Pengujian Pencarian Cerdas Obat di Denah...");
  const testCases = [
    { query: "paracetamol", expectedFragment: "parasetamol" },
    { query: "pct", expectedFragment: "parasetamol" },
    { query: "amoxicillin", expectedFragment: "amoksisilin" },
    { query: "amoxan", expectedFragment: "amoksisilin" },
    { query: "ctm", expectedFragment: "klorfeniramin" },
    { query: "infus", expectedFragment: "infus" },
    { query: "spuit", expectedFragment: "spuit" },
    { query: "vaksin", expectedFragment: "vaksin" },
  ];

  for (const tc of testCases) {
    const searchRes = await searchWarehouseItemsAction(tc.query);
    if (!searchRes.success || !searchRes.data || searchRes.data.length === 0) {
      throw new Error(`Pencarian '${tc.query}' tidak mengembalikan hasil!`);
    }
    const found = searchRes.data.some((item) =>
      item.name.toLowerCase().includes(tc.expectedFragment)
    );
    if (!found) {
      throw new Error(`Pencarian '${tc.query}' gagal menemukan item dengan kata '${tc.expectedFragment}'!`);
    }
    console.log(`   - '${tc.query}' -> Ditemukan: ${searchRes.data[0].name} (${searchRes.data[0].placements[0]?.locationCode || "Belum ada rak"})`);
  }
  console.log("   ✓ Pencarian Cerdas Fonetik & Sinonim Denah: LULUS\n");

  // 5. Uji Mutasi Layout Drag & Drop Editor
  console.log("5. Pengujian Mutasi Editor Drag & Drop Konva...");
  const testRack = allRacks[0];
  const originalPos = { x: testRack.x, y: testRack.y };

  const editRes = await saveWarehouseRackLayoutAction(
    [
      {
        id: testRack.id,
        x: originalPos.x + 10,
        y: originalPos.y + 10,
        width: testRack.width,
        height: testRack.height,
        rotation: 0,
      },
    ],
    { _bypassAuth: true }
  );

  if (!editRes.success || editRes.data?.updatedCount !== 1) {
    throw new Error("saveWarehouseRackLayoutAction gagal!");
  }

  // Restore
  await saveWarehouseRackLayoutAction(
    [
      {
        id: testRack.id,
        x: originalPos.x,
        y: originalPos.y,
        width: testRack.width,
        height: testRack.height,
        rotation: 0,
      },
    ],
    { _bypassAuth: true }
  );
  console.log("   ✓ Simpan & Pulihkan Posisi Spasial Editor: LULUS\n");

  console.log("==================================================================");
  console.log("HASIL: SELURUH PENGUJIAN DENAH GUDANG 100% LULUS (ALL PASS) ✓");
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("GAGAL:", err.message);
  process.exit(1);
});
