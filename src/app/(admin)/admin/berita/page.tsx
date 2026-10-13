import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { ArticleTable } from "./article-table";

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage() {
  const [session, articles, categories] = await Promise.all([
    getCurrentSession(),
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
    <AdminShell currentUser={session?.user}>
      <Suspense fallback={null}>
        <ArticleTable initialArticles={articles} categories={categories} />
      </Suspense>
    </AdminShell>
  );
}
