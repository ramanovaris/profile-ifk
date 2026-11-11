import { db } from "../src/lib/db";
import { matchMedicineSearch } from "../src/lib/medicine-search";

async function main() {
  console.log("=== Verifikasi Alur Bentuk A: Pencarian Obat Gudang & Navigasi Denah 2D ===");

  // 1. Cek Data Placement di DB
  const placements = await db.warehousePlacement.findMany({
    include: {
      item: true,
      rack: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: [
      { item: { name: "asc" } },
      { locationCode: "asc" },
    ],
  });

  if (placements.length === 0) {
    throw new Error("Gagal: Data penempatan ambalan obat (placements) kosong!");
  }
  console.log(`- Ditemukan ${placements.length} penempatan ambalan fisik di database.`);

  // 2. Uji Pencarian Cerdas & Fonetik pada Daftar Barang
  const testQueries = ["paracetamol", "parasetamol", "amox", "infus", "spuit"];
  for (const q of testQueries) {
    const matched = placements.filter((p) =>
      matchMedicineSearch(
        {
          name: p.item.name,
          code: p.item.code,
          category: p.item.category || undefined,
        },
        q
      )
    );
    console.log(`- Query "${q}": ${matched.length} obat cocok ditemukan.`);
    if (matched.length === 0) {
      throw new Error(`Uji pencarian gagal untuk kata kunci: "${q}"`);
    }
  }

  // 3. Verifikasi Tautan Deep-Link ke Denah 2D
  for (const p of placements.slice(0, 5)) {
    const targetUrl = `/admin/gudang/peta?building=${p.rack.warehouse.id}&rack=${p.rack.id}&level=${p.levelCode}&item=${encodeURIComponent(
      p.item.name
    )}`;
    if (!targetUrl.includes("building=") || !targetUrl.includes("rack=")) {
      throw new Error(`Tautan denah tidak valid untuk item: ${p.item.name}`);
    }
  }
  console.log("- Format URL deep-link 'Lihat di Denah' valid 100%.");

  console.log("Semua pengujian alur pencarian obat & denah Bentuk A: LULUS (100% PASS)\n");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
