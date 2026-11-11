import {
  getWarehouseMapDataAction,
  saveWarehouseRackLayoutAction,
} from "../src/actions/warehouse";

async function main() {
  console.log("=== Verifikasi Editor Tata Letak Denah Gudang (Drag & Drop) ===");

  // 1. Ambil data denah awal Gedung Saijaan
  const initialMap = await getWarehouseMapDataAction("SJ");
  if (!initialMap.success || !initialMap.data) {
    throw new Error(`Gagal mengambil data denah awal: ${initialMap.error}`);
  }

  const rack = initialMap.data.racks.find((r) => r.id === "SJ-R01");
  if (!rack) {
    throw new Error("Rak SJ-R01 tidak ditemukan di Saijaan!");
  }

  const originalCoords = {
    x: rack.x,
    y: rack.y,
    width: rack.width,
    height: rack.height,
    rotation: rack.rotation,
  };
  console.log(`- Koordinat awal SJ-R01: (${originalCoords.x}, ${originalCoords.y}) [${originalCoords.width}x${originalCoords.height}] rotasi: ${originalCoords.rotation}°`);

  // 2. Simulasikan perubahan hasil drag, resize, dan rotate di Konva Canvas Editor
  const targetUpdate = {
    id: "SJ-R01",
    x: 200,
    y: 120,
    width: 300,
    height: 70,
    rotation: 90,
    corridor: "Lorong Barat Hasil Edit",
  };

  const saveRes = await saveWarehouseRackLayoutAction([targetUpdate], { _bypassAuth: true });
  if (!saveRes.success || !saveRes.data) {
    throw new Error(`saveWarehouseRackLayoutAction gagal: ${saveRes.error}`);
  }
  console.log(`- Berhasil menyimpan tata letak: ${saveRes.data.updatedCount} rak terupdate.`);

  // 3. Verifikasi denah membaca koordinat baru dari database
  const updatedMap = await getWarehouseMapDataAction("SJ");
  if (!updatedMap.success || !updatedMap.data) {
    throw new Error("Gagal mengambil data denah setelah update!");
  }

  const updatedRackInLayout = updatedMap.data.layout.racks.find((r) => r.id === "SJ-R01");
  if (!updatedRackInLayout) {
    throw new Error("SJ-R01 tidak ada di layout dinamis!");
  }

  if (
    updatedRackInLayout.x !== targetUpdate.x ||
    updatedRackInLayout.y !== targetUpdate.y ||
    updatedRackInLayout.width !== targetUpdate.width ||
    updatedRackInLayout.height !== targetUpdate.height
  ) {
    throw new Error(
      `Koordinat layout tidak tersinkronisasi! Got: (${updatedRackInLayout.x}, ${updatedRackInLayout.y})`
    );
  }
  console.log(`- Layout denah dinamis tersinkronisasi: (${updatedRackInLayout.x}, ${updatedRackInLayout.y}) [${updatedRackInLayout.width}x${updatedRackInLayout.height}]`);

  // 4. Kembalikan ke koordinat awal
  await saveWarehouseRackLayoutAction(
    [
      {
        id: "SJ-R01",
        x: originalCoords.x,
        y: originalCoords.y,
        width: originalCoords.width,
        height: originalCoords.height,
        rotation: originalCoords.rotation,
        corridor: "Lorong Barat (Obat Sediaan Padat)",
      },
    ],
    { _bypassAuth: true }
  );
  console.log("- Berhasil memulihkan koordinat asli SJ-R01.");

  console.log("Semua pengujian Editor Denah Interaktif Drag & Drop: LULUS (100% PASS)\n");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
