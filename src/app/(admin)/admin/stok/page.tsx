import { Suspense } from "react";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { StockTable } from "./stock-table";
import type { MedicineStockItem, MedicineCategory, StockStatus } from "@/lib/dummy-data";

export const dynamic = "force-dynamic";

interface AdminStokPageProps {
  searchParams: Promise<{
    periode?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function AdminStokPage({ searchParams }: AdminStokPageProps) {
  const session = await getCurrentSession();
  const resolvedParams = await searchParams;
  const requestedPeriod = resolvedParams?.periode;

  const periodsRaw = await db.medicineStock.findMany({
    select: { period: true },
    distinct: ["period"],
    orderBy: { period: "desc" },
  });
  const availablePeriods = periodsRaw.map((p) => p.period);
  const activePeriod =
    requestedPeriod && availablePeriods.includes(requestedPeriod)
      ? requestedPeriod
      : availablePeriods[0] || "2026-08";

  const stocks = await db.medicineStock.findMany({
    where: { period: activePeriod },
    orderBy: {
      name: "asc",
    },
  });

  const initialItems: MedicineStockItem[] = stocks.map((s) => ({
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

  return (
    <AdminShell currentUser={session?.user}>
      <Suspense fallback={null}>
        <StockTable
          initialItems={initialItems}
          activePeriod={activePeriod}
          availablePeriods={availablePeriods}
        />
      </Suspense>
    </AdminShell>
  );
}
