import { Suspense } from "react";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { StockTable } from "./stock-table";
import type { MedicineStockItem, MedicineCategory, StockStatus } from "@/lib/dummy-data";

export const dynamic = "force-dynamic";

export default async function AdminStokPage() {
  const session = await getCurrentSession();

  const stocks = await db.medicineStock.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const initialItems: MedicineStockItem[] = stocks.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    category: s.category as MedicineCategory,
    unit: s.unit,
    quantity: s.quantity,
    status: s.status as StockStatus,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <AdminShell currentUser={session?.user}>
      <Suspense fallback={null}>
        <StockTable initialItems={initialItems} />
      </Suspense>
    </AdminShell>
  );
}
