import {
  getWarehouseBuildingsAction,
  getWarehouseMapDataAction,
  searchWarehouseItemsAction,
  upsertWarehouseItemAction,
  placeWarehouseItemAction,
} from "../src/actions/warehouse";

async function main() {
  console.log("=== Verifikasi Server Actions Denah Gudang IFK ===");

  // 1. Uji getWarehouseBuildingsAction
  const buildingsRes = await getWarehouseBuildingsAction();
  if (!buildingsRes.success || !buildingsRes.data) {
    throw new Error(`getWarehouseBuildingsAction gagal: ${buildingsRes.error}`);
  }
  console.log(`- Berhasil mengambil ${buildingsRes.data.length} data gedung.`);
  if (buildingsRes.data.length < 3) {
    throw new Error("Jumlah gedung kurang dari 3!");
  }

  // 2. Uji getWarehouseMapDataAction untuk Gedung Saijaan
  const mapDataRes = await getWarehouseMapDataAction("SJ");
  if (!mapDataRes.success || !mapDataRes.data) {
    throw new Error(`getWarehouseMapDataAction gagal: ${mapDataRes.error}`);
  }
  console.log(`- Gedung Saijaan memiliki ${mapDataRes.data.racks.length} rak dan ${mapDataRes.data.placements.length} penempatan obat.`);
  if (mapDataRes.data.racks.length !== 12) {
    throw new Error(`Rak Saijaan harus 12, didapat: ${mapDataRes.data.racks.length}`);
  }

  // 3. Uji pencarian cerdas fonetik & alias
  // a. Ejaan bahasa Inggris (paracetamol) -> Parasetamol
  const searchPara = await searchWarehouseItemsAction("paracetamol");
  if (!searchPara.success || !searchPara.data || searchPara.data.length === 0) {
    throw new Error("Pencarian fonetik 'paracetamol' gagal menemukan Parasetamol!");
  }
  const paraItem = searchPara.data[0];
  console.log(`- Cari 'paracetamol' -> Ditemukan: ${paraItem.name} di ${paraItem.placements[0]?.locationCode}`);
  if (!paraItem.placements[0]?.locationCode.startsWith("SJ-R01")) {
    throw new Error("Lokasi rak Parasetamol tidak sesuai (ekspektasi SJ-R01)!");
  }

  // b. Akronim apotek (pct) -> Parasetamol
  const searchPct = await searchWarehouseItemsAction("pct");
  if (!searchPct.success || !searchPct.data?.some((i) => i.name.toLowerCase().includes("parasetamol"))) {
    throw new Error("Pencarian akronim 'pct' gagal menemukan Parasetamol!");
  }
  console.log(`- Cari akronim 'pct' -> Berhasil menemukan: ${searchPct.data[0].name}`);

  // c. Fonetik amoxicillin -> Amoksisilin
  const searchAmox = await searchWarehouseItemsAction("amoxicillin");
  if (!searchAmox.success || !searchAmox.data?.some((i) => i.name.toLowerCase().includes("amoksisilin"))) {
    throw new Error("Pencarian 'amoxicillin' gagal menemukan Amoksisilin!");
  }
  console.log(`- Cari 'amoxicillin' -> Berhasil menemukan: ${searchAmox.data[0].name}`);

  // 4. Uji mutasi upsert barang & penempatan
  const dummyCode = "TEST-OBT-999";
  const upsertRes = await upsertWarehouseItemAction(
    {
      code: dummyCode,
      name: "Obat Percobaan Uji Mandiri 500mg",
      unit: "Kotak",
      category: "Uji Coba",
    },
    { _bypassAuth: true }
  );
  if (!upsertRes.success || !upsertRes.data) {
    throw new Error(`upsertWarehouseItemAction gagal: ${upsertRes.error}`);
  }
  console.log(`- Berhasil upsert item uji coba: ${upsertRes.data.code}`);

  const placeRes = await placeWarehouseItemAction(
    {
      itemId: upsertRes.data.id,
      rackId: "SJ-R05",
      levelCode: "T1",
      notes: "Wadah tester",
    },
    { _bypassAuth: true }
  );
  if (!placeRes.success || !placeRes.data) {
    throw new Error(`placeWarehouseItemAction gagal: ${placeRes.error}`);
  }
  console.log(`- Berhasil menempatkan item di ${placeRes.data.locationCode}`);

  console.log("Semua pengujian Server Actions Denah Gudang IFK: LULUS (100% PASS)\n");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
