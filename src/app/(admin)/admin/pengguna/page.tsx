import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserTable, type UserItem } from "./user-table";

export const dynamic = "force-dynamic";

export default async function AdminPenggunaPage() {
  const session = await getCurrentSession();

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: { articles: true },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const initialUsers: UserItem[] = users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    articleCount: u._count.articles,
  }));

  return (
    <AdminShell currentUser={session.user}>
      <UserTable
        initialUsers={initialUsers}
        currentUserId={session.user.id}
      />
    </AdminShell>
  );
}
