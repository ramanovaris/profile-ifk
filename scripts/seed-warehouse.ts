import { db } from "../src/lib/db";
import { BUILDING_LAYOUTS } from "../src/lib/warehouse-map-data";

async function main() {
  console.log("Seeding Master Denah Gudang IFK...");

  // 1. Seed Warehouses
  const warehouses = [
    {
      id: "SJ",
      name: "Gedung Saijaan",
      description: "Gudang utama penyimpanan sediaan obat oral, sirup, tablet, kapsul, dan salep.",
    },
    {
      id: "TD",
      name: "Gedung Todak",
      description: "Gudang penyimpanan cairan infus (LVP), alat kesehatan habis pakai, dan PKRT bervolume besar.",
    },
    {
      id: "KT",
      name: "Gedung Kantor",
      description: "Area ruang penerimaan, transit pengiriman, serta ruang rantai dingin (cold chain/vaksin).",
    },
  ];

  for (const w of warehouses) {
    await db.warehouse.upsert({
      where: { id: w.id },
      update: {
        name: w.name,
        description: w.description,
      },
      create: w,
    });
  }
  console.log(`✓ Seeded ${warehouses.length} Gedung IFK`);

  // 2. Seed Racks with Spatial Coordinates
  const racksData: Array<{
    id: string;
    warehouseId: string;
    rackCode: string;
    name: string;
    svgElementId: string;
    totalLevels: number;
    notes: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    corridor: string;
  }> = [];

  for (const [buildingId, layout] of Object.entries(BUILDING_LAYOUTS)) {
    for (const r of layout.racks) {
      racksData.push({
        id: r.id,
        warehouseId: buildingId,
        rackCode: r.rackCode,
        name: r.name,
        svgElementId: r.svgElementId,
        totalLevels: r.totalLevels,
        notes: r.corridor,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        rotation: 0,
        corridor: r.corridor,
      });
    }
  }

  for (const r of racksData) {
    await db.warehouseRack.upsert({
      where: { id: r.id },
      update: {
        warehouseId: r.warehouseId,
        rackCode: r.rackCode,
        name: r.name,
        svgElementId: r.svgElementId,
        totalLevels: r.totalLevels,
        notes: r.notes,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        rotation: r.rotation,
        corridor: r.corridor,
      },
      create: r,
    });
  }
  console.log(`✓ Seeded ${racksData.length} baris rak fisik dengan koordinat spasial`);

  // 3. Seed Items & Placements
  const sampleItems = [
    {
      code: "OBT-001",
      name: "Amoksisilin 500 mg Kaplet",
      unit: "Kotak/100",
      category: "Antibiotik",
      rackId: "SJ-R01",
      levelCode: "T2",
      notes: "Sisi kiri ambalan nomor 2",
    },
    {
      code: "OBT-002",
      name: "Parasetamol 500 mg Tablet",
      unit: "Kotak/100",
      category: "Analgesik & Antipiretik",
      rackId: "SJ-R01",
      levelCode: "T3",
      notes: "Box tengah warna hijau",
    },
    {
      code: "OBT-003",
      name: "Sefiksim 100 mg Kapsul",
      unit: "Kotak/30",
      category: "Antibiotik",
      rackId: "SJ-R02",
      levelCode: "T1",
      notes: "Ambalan paling bawah rak depan",
    },
    {
      code: "OBT-004",
      name: "Klorfeniramin Maleat (CTM) 4 mg",
      unit: "Botol/1000",
      category: "Antihistamin",
      rackId: "SJ-R03",
      levelCode: "T4",
      notes: "Ambalan tingkat 4 bagian kanan",
    },
    {
      code: "OBT-005",
      name: "Gliseril Guaiakolat (GG) 100 mg",
      unit: "Botol/1000",
      category: "Ekspektoran",
      rackId: "SJ-R03",
      levelCode: "T2",
      notes: "Ambalan tingkat 2 bersebelahan dengan OBH",
    },
    {
      code: "OBT-006",
      name: "Tiamin HCl (Vitamin B1) 50 mg",
      unit: "Botol/1000",
      category: "Vitamin & Suplemen",
      rackId: "SJ-R04",
      levelCode: "T3",
      notes: "Tingkat 3 deretan suplemen",
    },
    {
      code: "OBT-007",
      name: "Asam Askorbat (Vitamin C) 50 mg",
      unit: "Botol/1000",
      category: "Vitamin & Suplemen",
      rackId: "SJ-R04",
      levelCode: "T1",
      notes: "Tingkat 1 bawah",
    },
    {
      code: "OBT-008",
      name: "Infus Ringer Laktat (RL) 500 ml",
      unit: "Kolf/Karton 20",
      category: "Cairan Infus",
      rackId: "TD-R01",
      levelCode: "T1",
      notes: "Palet dasar ambalan bawah",
    },
    {
      code: "OBT-009",
      name: "Infus Natrium Klorida (NaCl) 0.9% 500 ml",
      unit: "Kolf/Karton 20",
      category: "Cairan Infus",
      rackId: "TD-R01",
      levelCode: "T2",
      notes: "Tingkat 2 karton tebal",
    },
    {
      code: "OBT-010",
      name: "Infus Glukosa 5% 500 ml",
      unit: "Kolf/Karton 20",
      category: "Cairan Infus",
      rackId: "TD-R02",
      levelCode: "T1",
      notes: "Tingkat 1 ambalan depan",
    },
    {
      code: "ALK-001",
      name: "Spuit Disposable 3 cc / Jarum Suntik",
      unit: "Kotak/100",
      category: "Alkes Habis Pakai",
      rackId: "TD-R03",
      levelCode: "T2",
      notes: "Tingkat 2 rak alkes steril",
    },
    {
      code: "ALK-002",
      name: "Kasa Hidrofil Steril 16x16 cm",
      unit: "Kotak/10",
      category: "Alkes Habis Pakai",
      rackId: "TD-R04",
      levelCode: "T1",
      notes: "Tingkat 1 ambalan bawah",
    },
    {
      code: "ALK-003",
      name: "Masker Bedah 3-Ply Earloop",
      unit: "Kotak/50",
      category: "Alkes Habis Pakai",
      rackId: "TD-R05",
      levelCode: "T3",
      notes: "Tingkat 3 karton wadah hijau",
    },
    {
      code: "VAK-001",
      name: "Vaksin Hepatitis B Rekombinan Uniject",
      unit: "Vial/Box",
      category: "Vaksin & Cold Chain",
      rackId: "KT-R01",
      levelCode: "T1",
      notes: "Chiller 1 suhu 2-8°C",
    },
    {
      code: "VAK-002",
      name: "Vaksin BCG Beku Kering + Pelarut",
      unit: "Ampul/Box",
      category: "Vaksin & Cold Chain",
      rackId: "KT-R01",
      levelCode: "T2",
      notes: "Chiller 1 kompartemen tengah",
    },
    {
      code: "VAK-003",
      name: "Vaksin Polio Tetes (bOPV)",
      unit: "Dropper/Box",
      category: "Vaksin & Cold Chain",
      rackId: "KT-R02",
      levelCode: "T1",
      notes: "Freezer suhu -15 s.d. -25°C",
    },
  ];

  for (const item of sampleItems) {
    const createdItem = await db.warehouseItem.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        unit: item.unit,
        category: item.category,
      },
      create: {
        code: item.code,
        name: item.name,
        unit: item.unit,
        category: item.category,
      },
    });

    const locationCode = `${item.rackId}-${item.levelCode}`;
    await db.warehousePlacement.upsert({
      where: {
        itemId_rackId_levelCode: {
          itemId: createdItem.id,
          rackId: item.rackId,
          levelCode: item.levelCode,
        },
      },
      update: {
        locationCode,
        notes: item.notes,
      },
      create: {
        itemId: createdItem.id,
        rackId: item.rackId,
        levelCode: item.levelCode,
        locationCode,
        notes: item.notes,
      },
    });
  }

  console.log(`✓ Seeded ${sampleItems.length} barang fisik dan pemetaan rak`);
  console.log("Seeding Denah Gudang Selesai!\n");
}

main()
  .catch((e) => {
    console.error("Gagal seeding denah gudang:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
