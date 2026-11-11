import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentSession } from "@/lib/auth";
import { MapClientView } from "./map-client-view";

export const dynamic = "force-dynamic";

export default async function AdminWarehouseMapPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell currentUser={session.user}>
      <div className="flex flex-col gap-4">
        <AdminPageHeader
          title="Denah Interaktif 2D Gudang IFK"
          description="Visualisasi tata letak rak 2D dan penelusuran ambalan penyimpanan obat di Gedung Saijaan, Todak, dan Kantor."
        />

        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-center text-xs text-slate-500">
              Memuat denah interaktif...
            </div>
          }
        >
          <MapClientView />
        </Suspense>
      </div>
    </AdminShell>
  );
}
