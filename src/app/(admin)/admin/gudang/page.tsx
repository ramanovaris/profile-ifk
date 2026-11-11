import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MedicineSearchClientView, PlacementWithDetails } from "./medicine-search-client-view";

export const dynamic = "force-dynamic";

export default async function AdminWarehousePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

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

  return (
    <AdminShell currentUser={session.user}>
      <div className="flex flex-col gap-4">
        <AdminPageHeader
          title="Pencarian Lokasi Obat & Denah Gudang IFK"
          description="Cari sediaan obat atau perbekalan kesehatan untuk menemukan letak baris rak dan nomor ambalan fisik di gudang penyimpanan IFK Kotabaru."
        />

        <MedicineSearchClientView initialPlacements={placements as unknown as PlacementWithDetails[]} />
      </div>
    </AdminShell>
  );
}
