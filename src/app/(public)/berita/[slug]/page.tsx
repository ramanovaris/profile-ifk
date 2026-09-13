import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { ArticlePreviewBanner } from "@/components/public/article-preview-banner";
import { dummyArticles } from "@/lib/dummy-data";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  const dbArticle = await db.article.findUnique({
    where: { slug },
    select: { title: true, isPublished: true },
  });

  if (dbArticle) {
    return {
      title: `${dbArticle.title} | UPTD Instalasi Farmasi Kab. Kotabaru`,
      robots: dbArticle.isPublished ? undefined : { index: false, follow: false },
    };
  }

  const dummy = dummyArticles.find((a) => a.slug === slug);
  if (dummy) {
    return {
      title: `${dummy.title} | UPTD Instalasi Farmasi Kab. Kotabaru`,
    };
  }

  return {
    title: "Artikel Tidak Ditemukan | UPTD Instalasi Farmasi Kab. Kotabaru",
  };
}

export default async function BeritaDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // 1. Coba cari artikel dari basis data PostgreSQL
  const dbArticle = await db.article.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true },
      },
      author: {
        select: { id: true, name: true },
      },
    },
  });

  let articleId: string | undefined;
  let title = "";
  let content = "";
  let coverImage: string | null = null;
  let categoryName = "";
  let authorName = "";
  let publishedAt = new Date();
  let isPublished = false;

  if (dbArticle) {
    articleId = dbArticle.id;
    title = dbArticle.title;
    content = dbArticle.content;
    coverImage = dbArticle.coverImage;
    categoryName = dbArticle.category?.name || "Umum";
    authorName = dbArticle.author?.name || "Administrator";
    publishedAt = dbArticle.publishedAt;
    isPublished = dbArticle.isPublished;
  } else {
    // Fallback ke dummy data untuk kompatibilitas data awal
    const dummy = dummyArticles.find((a) => a.slug === slug);
    if (!dummy) {
      notFound();
    }
    articleId = dummy.id;
    title = dummy.title;
    content = dummy.content;
    coverImage = dummy.coverImage;
    categoryName = dummy.category;
    authorName = dummy.authorName;
    publishedAt = new Date(dummy.publishedAt);
    isPublished = dummy.isPublished;
  }

  // 2. Proteksi Akses Draf:
  // Jika artikel berstatus DRAFT, hanya admin yang sedang login yang boleh mengakses.
  // Pengunjung publik / anonim akan mendapatkan 404 Not Found.
  let isPreview = false;
  if (!isPublished) {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      notFound();
    }
    isPreview = true;
  }

  // 3. Ambil Berita Terkait (Hanya yang sudah terbit)
  let otherArticles: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    coverImage: string | null;
    publishedAt: Date | string;
  }> = [];

  try {
    const relatedDb = await db.article.findMany({
      where: {
        isPublished: true,
        ...(articleId ? { id: { not: articleId } } : {}),
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 2,
    });

    otherArticles = relatedDb.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      category: item.category?.name || "Umum",
      coverImage: item.coverImage,
      publishedAt: item.publishedAt,
    }));
  } catch {
    // Abaikan jika query relasi bermasalah
  }

  // Fallback related articles ke dummy data jika db kosong
  if (otherArticles.length === 0) {
    otherArticles = dummyArticles
      .filter((a) => a.id !== articleId && a.isPublished)
      .slice(0, 2);
  }

  return (
    <>
      {/* ── Cover Image ────────────────────────────────────────────── */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-b-3xl bg-zinc-900">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            unoptimized={
              coverImage.startsWith("https://picsum.photos/") ||
              coverImage.startsWith("http://") ||
              coverImage.startsWith("https://")
            }
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-600">
            <span className="text-sm font-medium">UPTD Instalasi Farmasi Kabupaten Kotabaru</span>
          </div>
        )}
      </div>

      {/* ── Article Content ────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            {isPreview && <ArticlePreviewBanner articleId={articleId} />}

            <Breadcrumb
              items={[
                { label: "Beranda", href: "/" },
                { label: "Berita", href: "/berita" },
                { label: categoryName },
              ]}
            />
            <Badge variant="default" className="mt-4 bg-brand-50 text-brand-700">
              {categoryName}
            </Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm font-mono text-muted">
              {new Date(publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              &middot; {authorName}
            </p>
            <div
              className="prose prose-zinc mt-6 max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </section>

      {/* ── Related Articles ─────────────────────────────────────── */}
      {otherArticles.length > 0 && (
        <section className="border-t border-border bg-surface py-24">
          <div className="section-container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-xl font-bold tracking-tight text-heading">
                Berita Lainnya
              </h2>
              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                {otherArticles.map((a) => (
                  <Link key={a.id} href={`/berita/${a.slug}`} className="group block">
                    <Card className="h-full overflow-hidden border-border transition-colors hover:border-brand-300">
                      <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
                        {a.coverImage ? (
                          <Image
                            src={a.coverImage}
                            alt={a.title}
                            fill
                            unoptimized={
                              a.coverImage.startsWith("https://picsum.photos/") ||
                              a.coverImage.startsWith("http://") ||
                              a.coverImage.startsWith("https://")
                            }
                            sizes="(min-width: 768px) 33vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <span className="text-xs">UPTD IFK</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <Badge variant="default" className="mb-2 bg-brand-50 text-brand-700">
                          {a.category}
                        </Badge>
                        <h3 className="mt-2 line-clamp-2 font-semibold text-heading group-hover:text-brand-800">
                          {a.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-muted">
                          {new Date(a.publishedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
