import type { Metadata } from "next";
import { db } from "@/lib/db";
import { 
  initialMedicineStock, 
  type MedicineStockItem, 
  type MedicineCategory, 
  type StockStatus 
} from "@/lib/dummy-data";
import { PublicStockClientView } from "@/components/public/public-stock-client-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ketersediaan Stok Obat & BMHP | UPTD Instalasi Farmasi Kab. Kotabaru",
  description:
    "Informasi transparansi ketersediaan stok fisik perbekalan farmasi pada UPTD Instalasi Farmasi Kab. Kotabaru per akhir bulan.",
};

export default async function StokPublikPage() {
  let items: MedicineStockItem[] = [];

  try {
    const dbStocks = await db.medicineStock.findMany({
      orderBy: {
        name: "asc",
      },
    });

    if (dbStocks.length > 0) {
      items = dbStocks.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        category: s.category as MedicineCategory,
        unit: s.unit,
        quantity: s.quantity,
        status: s.status as StockStatus,
        updatedAt: s.updatedAt.toISOString(),
      }));
    }
  } catch (err) {
    console.error("[StokPublikPage] Gagal mengambil data stok dari basis data:", err);
  }

  // Graceful fallback ke initialMedicineStock jika basis data kosong
  if (items.length === 0) {
    items = initialMedicineStock;
  }

  return <PublicStockClientView initialItems={items} />;
}
