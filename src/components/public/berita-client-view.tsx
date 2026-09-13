"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/public/reveal";
import { cn } from "@/lib/utils";
import {
  getPublicArticlesAction,
  type PublicArticleItem,
} from "@/actions/article";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

interface BeritaClientViewProps {
  initialArticles: PublicArticleItem[];
  categories: CategoryItem[];
  initialTotal: number;
  initialHasMore: boolean;
}

export function BeritaClientView({
  initialArticles,
  categories,
  initialHasMore,
}: BeritaClientViewProps) {
  const [articles, setArticles] = useState<PublicArticleItem[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isFirstRender = useRef(true);

  // Kategori filter: 'Semua' + kategori aktif dinamis
  const filterCategories = [
    { name: "Semua", slug: "semua" },
    ...categories,
  ];

  // Debounced search & filter kategori
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setPage(1);

      const res = await getPublicArticlesAction({
        page: 1,
        limit: 12,
        categorySlug: activeCategory === "semua" ? undefined : activeCategory,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setArticles(res.articles);
        setHasMore(res.hasMore);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    const res = await getPublicArticlesAction({
      page: nextPage,
      limit: 12,
      categorySlug: activeCategory === "semua" ? undefined : activeCategory,
      search: search.trim() || undefined,
    });

    if (res.success) {
      setArticles((prev) => [...prev, ...res.articles]);
      setPage(nextPage);
      setHasMore(res.hasMore);
    }
    setIsLoadingMore(false);
  };

  return (
    <div className="section-container">
      {/* Search bar & Category Filter */}
      <Reveal>
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Cari berita atau pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border pl-9 focus:border-brand-600"
          />
        </div>

        {/* Category filter pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {filterCategories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-500 ease-luxe",
                  isActive
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-surface-alt text-muted hover:bg-zinc-200 hover:text-heading"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Article grid */}
      <Reveal delay={100}>
        <div
          className={cn(
            "mt-10 grid gap-8 sm:grid-cols-2 transition-opacity duration-300",
            isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
          )}
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className="group block"
            >
              <div className="bezel">
                <div className="bezel-inner relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      unoptimized={
                        article.coverImage.startsWith("https://picsum.photos/") ||
                        article.coverImage.startsWith("http://") ||
                        article.coverImage.startsWith("https://")
                      }
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                      IFK Kotabaru
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="default" className="bg-white/90 text-brand-700 backdrop-blur-xs">
                      {article.categoryName}
                    </Badge>
                  </div>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-heading line-clamp-2 transition-colors duration-300 group-hover:text-brand-800">
                {article.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted">
                {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Empty State */}
      {articles.length === 0 && !isLoading && (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface-alt/40 p-12 text-center">
          <p className="text-base font-semibold text-heading">
            Tidak ada berita yang cocok
          </p>
          <p className="mt-1 text-sm text-muted">
            {search.trim()
              ? `Tidak ditemukan berita dengan kata kunci "${search.trim()}".`
              : "Belum ada berita pada kategori ini."}
          </p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-white px-8 py-3 text-sm font-medium text-heading shadow-xs transition-all duration-500 ease-luxe hover:border-brand-300 hover:bg-zinc-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                <span>Memuat Berita...</span>
              </>
            ) : (
              <>
                <span>Muat Berita Lainnya</span>
                <ArrowDown className="h-4 w-4 text-muted transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-brand-700" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
