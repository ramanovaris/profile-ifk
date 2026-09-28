import { Suspense } from "react";
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

interface StokPublikPageProps {
  searchParams: Promise<{
    periode?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function StokPublikPage({ searchParams }: StokPublikPageProps) {
  const resolvedParams = await searchParams;
  const requestedPeriod = resolvedParams?.periode;

  let items: MedicineStockItem[] = [];
  let availablePeriods: string[] = [];
  let activePeriod = "2026-08";

  try {
    const periodsRaw = await db.medicineStock.findMany({
      select: { period: true },
      distinct: ["period"],
      orderBy: { period: "desc" },
    });
    availablePeriods = periodsRaw.map((p) => p.period);
    if (availablePeriods.length === 0) {
      availablePeriods = ["2026-08", "2026-07", "2026-06"];
    }

    activePeriod =
      requestedPeriod && availablePeriods.includes(requestedPeriod)
        ? requestedPeriod
        : availablePeriods[0];

    const dbStocks = await db.medicineStock.findMany({
      where: { period: activePeriod },
      orderBy: {
        name: "asc",
      },
    });

    if (dbStocks.length > 0) {
      items = dbStocks.map((s) => ({
        id: s.id,
        period: s.period,
        code: s.code,
        name: s.name,
        category: s.category as MedicineCategory,
        unit: s.unit,
        quantity: s.quantity,
        status: s.status as StockStatus,
        updatedAt: s.updatedAt.toISOString(),
        avgUsage: s.avgUsage,
        mos: s.mos,
        expiryDate: s.expiryDate,
        nomenklatur: s.nomenklatur,
        source: s.source,
      }));
    }
  } catch (err) {
    console.error("[StokPublikPage] Gagal mengambil data stok dari basis data:", err);
  }

  // Graceful fallback ke initialMedicineStock jika basis data kosong
  if (items.length === 0) {
    items = initialMedicineStock;
  }

  return (
    <Suspense fallback={null}>
      <PublicStockClientView
        initialItems={items}
        activePeriod={activePeriod}
        availablePeriods={availablePeriods}
      />
    </Suspense>
  );
}
