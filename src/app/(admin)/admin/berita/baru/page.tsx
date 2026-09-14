import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleForm } from "@/components/admin/article-form";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBeritaBaruPage() {
  const [session, categories, activeUsers] = await Promise.all([
    getCurrentSession(),
    db.category.findMany({
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
    }),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
      orderBy: [
        { role: "asc" },
        { name: "asc" },
      ],
    }),
  ]);

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl w-full min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tambah Artikel Baru
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Publikasikan pengumuman atau berita terbaru UPTD IFK Kotabaru.
          </p>
        </div>
        <ArticleForm
          categories={categories}
          currentUserRole={session?.user.role}
          currentUserId={session?.user.id}
          availableAuthors={activeUsers}
        />
      </div>
    </AdminShell>
  );
}
