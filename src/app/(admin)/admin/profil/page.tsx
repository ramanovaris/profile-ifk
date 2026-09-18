import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProfileClientView } from "./profile-client-view";

export const dynamic = "force-dynamic";

export default async function AdminProfilPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  const initialUser = {
    id: session.user.id,
    username: session.user.username,
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.avatar,
    role: session.user.role,
    status: session.user.status,
    createdAt: session.user.createdAt,
  };

  return (
    <AdminShell currentUser={session.user}>
      <ProfileClientView initialUser={initialUser} />
    </AdminShell>
  );
}
