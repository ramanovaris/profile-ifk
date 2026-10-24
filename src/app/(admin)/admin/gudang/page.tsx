import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentSession } from "@/lib/auth";
import { LocatorClientView } from "./locator-client-view";

export const dynamic = "force-dynamic";

export default async function AdminWarehouseLocatorPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell currentUser={session.user}>
      <div className="flex flex-col gap-4">
        <AdminPageHeader
          title="Denah Interaktif & Lokasi Obat Gudang"
          description="Visualisasi tata letak rak 2D dan pencarian lokasi fisik sediaan obat dan perbekalan kesehatan IFK Kotabaru."
        />

        <LocatorClientView initialBuildingId="SJ" />
      </div>
    </AdminShell>
  );
}
