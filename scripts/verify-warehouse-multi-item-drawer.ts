import {
  groupRackPlacementsByLevel,
  RawRackPlacement,
} from "../src/lib/warehouse-multi-item";

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`❌ Gagal: ${message} (Diharapkan: ${expected}, Didapat: ${actual})`);
  }
}

function assertTrue(value: boolean, message: string) {
  if (!value) {
    throw new Error(`❌ Gagal: ${message}`);
  }
}

console.log("🧪 Memulai Pengujian TDD Utilitas Multi-Item per Ambalan...");

// Mock data penempatan obat di rak SJ-R01 (5 tingkat)
const mockPlacements: RawRackPlacement[] = [
  {
    id: "place-1",
    rackId: "SJ-R01",
    levelCode: "T2",
    locationCode: "SJ-R01-T2",
    notes: "Dekat sisi kiri",
    item: {
      id: "item-1",
      code: "OBT-001",
      name: "Paracetamol 500 mg Tablet",
      unit: "Tablet",
      category: "Analgesik",
    },
  },
  {
    id: "place-2",
    rackId: "SJ-R01",
    levelCode: "T2",
    locationCode: "SJ-R01-T2",
    notes: null,
    item: {
      id: "item-2",
      code: "OBT-002",
      name: "Ibuprofen 400 mg Tablet",
      unit: "Tablet",
      category: "Analgesik",
    },
  },
  {
    id: "place-3",
    rackId: "SJ-R01",
    levelCode: "T2",
    locationCode: "SJ-R01-T2",
    notes: "Kemasan blister",
    item: {
      id: "item-3",
      code: "OBT-003",
      name: "Asam Mefenamat 500 mg Kapsul",
      unit: "Kapsul",
      category: "Analgesik",
    },
  },
  {
    id: "place-4",
    rackId: "SJ-R01",
    levelCode: "T1",
    locationCode: "SJ-R01-T1",
    notes: "Kardus besar di lantai",
    item: {
      id: "item-4",
      code: "INF-001",
      name: "Ringer Laktat 500 ml Infus",
      unit: "Botol",
      category: "Cairan Infus",
    },
  },
  {
    id: "place-5",
    rackId: "SJ-R01",
    levelCode: "T4",
    locationCode: "SJ-R01-T4",
    notes: null,
    item: {
      id: "item-5",
      code: "AB-001",
      name: "Amoxicillin 500 mg Kaplet",
      unit: "Kaplet",
      category: "Antibiotik",
    },
  },
];

// Kasus 1: Pengelompokan ambalan dan penghitungan jumlah item
{
  const result = groupRackPlacementsByLevel(mockPlacements, 5);

  assertEqual(result.totalCount, 5, "Total item harus bernilai 5");
  assertEqual(result.countsByLevel["T1"], 1, "T1 harus berisi 1 item");
  assertEqual(result.countsByLevel["T2"], 3, "T2 harus berisi 3 item");
  assertEqual(result.countsByLevel["T3"], 0, "T3 harus berisi 0 item");
  assertEqual(result.countsByLevel["T4"], 1, "T4 harus berisi 1 item");
  assertEqual(result.countsByLevel["T5"], 0, "T5 harus berisi 0 item");

  assertEqual(result.itemsByLevel["T2"].length, 3, "Daftar T2 harus berisi 3 item");
  assertEqual(result.itemsByLevel["T3"].length, 0, "Daftar T3 harus kosong");
  console.log("✅ Kasus 1 (Pengelompokan & Count per Tingkat) LULUS");
}

// Kasus 2: Penandaan isTarget berdasarkan nama item
{
  const result = groupRackPlacementsByLevel(mockPlacements, 5, {
    targetItemName: "Ibuprofen",
  });

  const t2Items = result.itemsByLevel["T2"];
  const ibuprofen = t2Items.find((i) => i.itemId === "item-2");
  const paracetamol = t2Items.find((i) => i.itemId === "item-1");

  assertTrue(Boolean(ibuprofen), "Ibuprofen harus ditemukan");
  assertEqual(ibuprofen?.isTarget, true, "Ibuprofen harus ditandai isTarget: true");
  assertEqual(paracetamol?.isTarget, false, "Paracetamol harus isTarget: false");
  assertEqual(result.activeLevelCode, "T2", "Active level harus T2 karena Ibuprofen di T2");
  assertEqual(result.activeItem?.itemId, "item-2", "Active item harus Ibuprofen");
  console.log("✅ Kasus 2 (Penandaan isTarget & Active Item Otomatis) LULUS");
}

// Kasus 3: Prioritas levelCode eksplisit
{
  const result = groupRackPlacementsByLevel(mockPlacements, 5, {
    levelCode: "T4",
    targetItemName: "Ibuprofen", // Ibuprofen ada di T2, tapi user secara eksplisit pilih T4
  });

  assertEqual(result.activeLevelCode, "T4", "Prioritas levelCode eksplisit harus dihormati");
  assertEqual(result.activeItem?.itemId, "item-5", "Active item harus mengambil item di T4");
  console.log("✅ Kasus 3 (Prioritas Parameter Tingkat Eksplisit) LULUS");
}

// Kasus 4: Rak tanpa barang sama sekali
{
  const emptyResult = groupRackPlacementsByLevel([], 5);

  assertEqual(emptyResult.totalCount, 0, "Total count rak kosong harus 0");
  assertEqual(emptyResult.activeLevelCode, "T1", "Fallback default rak kosong adalah T1");
  assertEqual(emptyResult.activeItem, undefined, "Active item harus undefined");
  assertEqual(emptyResult.countsByLevel["T1"], 0, "Counts T1 harus 0");
  assertEqual(emptyResult.itemsByLevel["T1"].length, 0, "Items T1 harus kosong");
  console.log("✅ Kasus 4 (Penanganan Rak Kosong) LULUS");
}

console.log("🎉 SEMUA PENGUJIAN TDD UTILITAS MULTI-ITEM LULUS!");
