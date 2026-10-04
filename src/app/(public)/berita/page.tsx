import { Suspense } from "react";
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
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
        rightContent={
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 border border-brand-400/20">
                  <Newspaper className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Pusat Informasi &amp; Publikasi</h3>
                  <p className="text-[11px] text-zinc-400">Warta Resmi UPTD IFK Kotabaru</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-brand-300">
                Warta Terkini
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span className="text-zinc-200">Distribusi Logistik Faskes &amp; Kepulauan</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span className="text-zinc-200">Jaminan Mutu &amp; Keamanan Sediaan Farmasi</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span className="text-zinc-200">Edukasi Penggunaan Obat Rasional (POR)</span>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-3 text-[11px] text-zinc-400">
              Pembaruan informasi publik seputar kebijakan dan pelayanan kefarmasian di wilayah Kotabaru.
            </div>
          </div>
        }
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
