import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ManagementClientView } from "./management-client-view";

export const dynamic = "force-dynamic";

export default async function AdminWarehouseManagementPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  const buildings = await db.warehouse.findMany({
    include: {
      racks: {
        include: {
          placements: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { rackCode: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  return (
    <AdminShell currentUser={session.user}>
      <div className="flex flex-col gap-6">
        <AdminPageHeader
          title="Manajemen Rak & Penempatan Obat Gudang"
          description="Konfigurasi baris rak fisik, kapasitas ambalan, dan daftar obat/alkes yang ditempatkan di tiap lorong IFK."
        />

        <ManagementClientView initialBuildings={buildings} />
      </div>
    </AdminShell>
  );
}
