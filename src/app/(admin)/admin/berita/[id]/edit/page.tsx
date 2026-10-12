import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleForm } from "@/components/admin/article-form";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBeritaEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const [session, categories, article, activeUsers] = await Promise.all([
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
    db.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        coverImage: true,
        isPublished: true,
        categoryId: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
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

  if (!article) {
    return (
      <AdminShell currentUser={session?.user}>
        <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-8 text-center backdrop-blur-xl">
          <p className="text-base text-[var(--admin-text-main)]">Artikel tidak ditemukan.</p>
          <Link
            href="/admin/berita/"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#455a26] dark:text-brand-400 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Berita</span>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell currentUser={session?.user}>
      <div className="mx-auto max-w-4xl w-full min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-text-main)] sm:text-3xl">
            Edit Artikel
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Perbarui informasi artikel atau ubah status publikasinya.
          </p>
        </div>
        <ArticleForm
          article={article}
          categories={categories}
          currentUserRole={session?.user.role}
          currentUserId={session?.user.id}
          currentAuthorId={article.authorId}
          currentAuthorName={article.author?.name}
          availableAuthors={activeUsers}
        />
      </div>
    </AdminShell>
  );
}
