import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryTable, type CategoryWithCount } from "./category-table";

export const dynamic = "force-dynamic";

export default async function AdminKategoriPage() {
  const categories: CategoryWithCount[] = await db.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AdminShell>
      <CategoryTable initialCategories={categories} />
    </AdminShell>
  );
}
