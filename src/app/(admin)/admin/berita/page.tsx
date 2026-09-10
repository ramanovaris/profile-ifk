import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { ArticleTable } from "./article-table";

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage() {
  const [articles, categories] = await Promise.all([
    db.article.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <AdminShell>
      <ArticleTable initialArticles={articles} categories={categories} />
    </AdminShell>
  );
}
