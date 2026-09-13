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

  // 3. Estimasi Waktu Baca (Reading Time: rata-rata 200 kata/menit)
  const plainText = content.replace(/<[^>]*>/g, " ").trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // 4. Ambil Berita Terkait (Hanya yang sudah terbit)
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
    <article className="min-h-screen bg-surface text-foreground">
      {/* ── 1. Header Artikel: Breadcrumb, Badge, Judul, Metadata ───── */}
      <header className="pt-10 sm:pt-14 pb-4 sm:pb-6">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            {isPreview && (
              <div className="mb-6">
                <ArticlePreviewBanner articleId={articleId} />
              </div>
            )}

            <Breadcrumb
              items={[
                { label: "Beranda", href: "/" },
                { label: "Berita", href: "/berita" },
                { label: categoryName },
              ]}
            />

            <Badge
              variant="default"
              className="mt-5 inline-flex bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium px-3 py-1 rounded-full text-xs"
            >
              {categoryName}
            </Badge>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-heading sm:text-3xl md:text-4xl lg:text-5xl leading-tight sm:leading-tight md:leading-tight">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-y-2 text-sm text-muted">
              <div className="flex items-center gap-2 font-medium text-zinc-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 border border-border/40 text-[11px] font-semibold text-brand-400">
                  {authorName.charAt(0).toUpperCase()}
                </span>
                <span>{authorName}</span>
              </div>
              <span className="mx-2.5 text-zinc-600">&middot;</span>
              <time
                dateTime={new Date(publishedAt).toISOString()}
                className="font-mono text-xs sm:text-sm text-zinc-400"
              >
                {new Date(publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span className="mx-2.5 text-zinc-600">&middot;</span>
              <span className="font-mono text-xs sm:text-sm text-zinc-400">
                {readingMinutes} menit baca
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Foto Sampul Ekspansif (Full-Width Container, 16:9) ───── */}
      <section className="my-4 sm:my-8">
        <div className="section-container">
          <div className="mx-auto max-w-5xl">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/50 bg-zinc-900 shadow-2xl backdrop-blur-sm">
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
                  sizes="(min-width: 1280px) 1024px, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 text-center text-zinc-600">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-zinc-800/80 text-brand-400">
                    <span className="text-sm font-bold">IFK</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-400">
                    UPTD Instalasi Farmasi Kabupaten Kotabaru
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Tubuh Naskah Artikel (Prose Terpusat & Nyaman) ───────── */}
      <section className="pb-16 sm:pb-24 pt-2 sm:pt-4">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <div
              className="prose prose-zinc prose-invert max-w-none text-base sm:text-lg leading-relaxed md:leading-8 text-zinc-300/95"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </section>

      {/* ── 4. Rekomendasi Berita Terkait ──────────────────────────── */}
      {otherArticles.length > 0 && (
        <section className="border-t border-border/40 bg-surface/40 py-16 sm:py-20">
          <div className="section-container">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-heading">
                Berita Lainnya
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {otherArticles.map((a) => (
                  <Link key={a.id} href={`/berita/${a.slug}`} className="group block">
                    <Card className="h-full overflow-hidden border-border/50 bg-zinc-900/40 transition-all duration-300 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5">
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
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
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <span className="text-xs">UPTD IFK</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <Badge
                          variant="default"
                          className="mb-2.5 inline-flex bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium text-xs"
                        >
                          {a.category}
                        </Badge>
                        <h3 className="line-clamp-2 text-base font-semibold text-heading group-hover:text-brand-300 transition-colors">
                          {a.title}
                        </h3>
                        <p className="mt-2 font-mono text-xs text-muted">
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
    </article>
  );
}
