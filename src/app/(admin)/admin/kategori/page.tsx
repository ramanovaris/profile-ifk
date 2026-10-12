import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryTable, type CategoryWithCount } from "./category-table";

export const dynamic = "force-dynamic";

export default async function AdminKategoriPage() {
  const [session, categories] = await Promise.all([
    getCurrentSession(),
    db.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <AdminShell currentUser={session?.user}>
      <CategoryTable initialCategories={categories as CategoryWithCount[]} />
    </AdminShell>
  );
}
