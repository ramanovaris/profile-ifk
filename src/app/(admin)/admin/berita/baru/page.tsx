import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleForm } from "@/components/admin/article-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBeritaBaruPage() {
  const categories = await db.category.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tambah Artikel Baru
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Publikasikan pengumuman atau berita terbaru UPTD IFK Kotabaru.
          </p>
        </div>
        <ArticleForm categories={categories} />
      </div>
    </AdminShell>
  );
}
