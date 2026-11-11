import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditorClientView } from "./editor-client-view";

export const dynamic = "force-dynamic";

export default async function AdminWarehouseEditorPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  const buildings = await db.warehouse.findMany({
    include: {
      racks: {
        orderBy: { rackCode: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  return (
    <AdminShell currentUser={session.user}>
      <div className="flex flex-col gap-4">
        <AdminPageHeader
          title="Editor Tata Letak Denah Gudang (Drag & Drop)"
          description="Atur denah lorong fisik, geser letak balok rak, dan putar rotasi untuk menyesuaikan dengan denah riil IFK Kotabaru."
        />

        <EditorClientView initialBuildings={buildings} />
      </div>
    </AdminShell>
  );
}
