import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { BeritaClientView } from "@/components/public/berita-client-view";
import { db } from "@/lib/db";
import { dummyArticles } from "@/lib/dummy-data";
import type { PublicArticleItem } from "@/actions/article";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Berita & Informasi | UPTD Instalasi Farmasi Kab. Kotabaru",
  description:
    "Informasi kegiatan dan pengumuman terkini seputar pelayanan kefarmasian di Kabupaten Kotabaru.",
};

export default async function BeritaPage() {
  let initialArticles: PublicArticleItem[] = [];
  let categories: Array<{ id: string; name: string; slug: string }> = [];
  let initialTotal = 0;

  try {
    const [totalCount, dbArticles, dbCategories] = await Promise.all([
      db.article.count({
        where: { isPublished: true },
      }),
      db.article.findMany({
        where: { isPublished: true },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 12,
      }),
      db.category.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);

    initialTotal = totalCount;
    categories = dbCategories;

    initialArticles = dbArticles.map((art) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      coverImage: art.coverImage,
      categoryName: art.category?.name || "Umum",
      categorySlug: art.category?.slug || "umum",
      publishedAt: art.publishedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[BeritaPage] Gagal mengambil data dari basis data:", err);
  }

  // Graceful fallback ke dummy data jika basis data kosong
  if (initialArticles.length === 0) {
    const publishedDummy = dummyArticles.filter((a) => a.isPublished);
    initialTotal = publishedDummy.length;
    initialArticles = publishedDummy.slice(0, 12).map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      coverImage: a.coverImage,
      categoryName: a.category,
      categorySlug: a.category.toLowerCase().replace(/\s+/g, "-"),
      publishedAt: a.publishedAt,
    }));
    if (categories.length === 0) {
      const dummyCategoryNames = Array.from(
        new Set(dummyArticles.map((a) => a.category))
      );
      categories = dummyCategoryNames.map((name) => ({
        id: name,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      }));
    }
  }

  const initialHasMore = initialArticles.length < initialTotal;

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
        eyebrow="Informasi"
        title={<>Berita &amp; Informasi</>}
        subtitle="Informasi kegiatan dan pengumuman terkini seputar pelayanan kefarmasian."
      />

      <section className="border-t border-border bg-surface py-24">
        <Suspense fallback={null}>
          <BeritaClientView
            initialArticles={initialArticles}
            categories={categories}
            initialTotal={initialTotal}
            initialHasMore={initialHasMore}
          />
        </Suspense>
      </section>
    </>
  );
}
