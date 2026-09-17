"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/public/reveal";
import { PublicMultiSelectFilter } from "@/components/public/public-stock-filter";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inisialisasi state dari query parameter URL jika ada
  const initialQ = searchParams.get("q") || "";
  const initialCategoryParam = searchParams.get("kategori") || "";

  const initialSelectedCategories = useMemo(() => {
    if (!initialCategoryParam || initialCategoryParam === "semua") return [];
    return initialCategoryParam
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [initialCategoryParam]);

  const [articles, setArticles] = useState<PublicArticleItem[]>(initialArticles);
  const [search, setSearch] = useState(initialQ);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialSelectedCategories
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isFirstRender = useRef(true);

  // Opsi kategori untuk PublicMultiSelectFilter
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.slug, label: c.name })),
    [categories]
  );

  // Helper untuk memperbarui URL query parameter tanpa lonjakan scroll
  const updateUrlParams = useCallback(
    (newSearch: string, newCategories: string[]) => {
      if (typeof window === "undefined") return;

      const currentParams = new URLSearchParams(window.location.search);
      const currentQ = currentParams.get("q") || "";
      const currentCat = currentParams.get("kategori") || "";
      const trimmed = newSearch.trim();
      const targetCat = newCategories.join(",");

      // Guard: jangan panggil router.replace jika parameter tidak berubah
      if (currentQ === trimmed && currentCat === targetCat) {
        return;
      }

      const params = new URLSearchParams(window.location.search);

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      if (targetCat) {
        params.set("kategori", targetCat);
      } else {
        params.delete("kategori");
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch data awal jika halaman dibuka langsung dengan query parameter URL non-default
  useEffect(() => {
    if (initialQ || initialSelectedCategories.length > 0) {
      const fetchInitialFiltered = async () => {
        setIsLoading(true);
        const res = await getPublicArticlesAction({
          page: 1,
          limit: 12,
          categorySlugs:
            initialSelectedCategories.length > 0
              ? initialSelectedCategories
              : undefined,
          search: initialQ.trim() || undefined,
        });
        if (res.success) {
          setArticles(res.articles);
          setHasMore(res.hasMore);
        }
        setIsLoading(false);
      };
      fetchInitialFiltered();
    }
  }, [initialSelectedCategories, initialQ]);

  // Debounced search & filter kategori (350ms) saat pengguna berinteraksi
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setPage(1);

      // Sinkronkan ke URL
      updateUrlParams(search, selectedCategories);

      const res = await getPublicArticlesAction({
        page: 1,
        limit: 12,
        categorySlugs:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setArticles(res.articles);
        setHasMore(res.hasMore);
      }
      setIsLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, selectedCategories, updateUrlParams]);

  // Hapus pencarian seketika (0ms)
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    updateUrlParams("", selectedCategories);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    const res = await getPublicArticlesAction({
      page: nextPage,
      limit: 12,
      categorySlugs:
        selectedCategories.length > 0 ? selectedCategories : undefined,
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
      {/* ── Toolbar Pencarian & Filter Terpadu Sticky ──────────────── */}
      {/* ponytail: native CSS sticky container; offset top-20 (mobile) & top-24 (desktop) clears floating navbar */}
      <div className="sticky top-20 sm:top-24 z-30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-surface/90 sm:bg-surface-alt/85 p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all">
        {/* Kolom Pencarian dengan Tombol Clear 'X' */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Cari judul berita, artikel, atau pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-12 text-sm text-heading placeholder:text-muted outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            )}
            {search && !isLoading && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Bersihkan pencarian"
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-zinc-200 hover:text-heading cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filter Kategori Multi-Select dengan Fitur Pencarian */}
        <PublicMultiSelectFilter
          title="Kategori"
          allLabel="Semua Kategori"
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={(vals) => {
            setSelectedCategories(vals);
            setPage(1);
          }}
          enableSearch={true}
        />
      </div>

      {/* ── Grid Daftar Artikel ────────────────────────────────────── */}
      <Reveal delay={100}>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
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
              <p className="mt-2 font-mono text-xs text-muted">
                {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>

        {articles.length === 0 && !isLoading && (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Search className="h-8 w-8 text-muted/60" />
            <p className="mt-3 text-sm font-medium text-heading">
              Tidak ada berita yang sesuai
            </p>
            <p className="mt-1 text-xs text-muted">
              Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
            </p>
            {(search || selectedCategories.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategories([]);
                  updateUrlParams("", []);
                }}
                className="mt-4 rounded-full bg-surface-alt px-4 py-1.5 text-xs font-medium text-brand-700 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-heading transition-all duration-300 hover:border-brand-600 hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  <span>Memuat...</span>
                </>
              ) : (
                <>
                  <span>Muat Berita Lainnya</span>
                  <ArrowDown className="h-4 w-4 text-muted" />
                </>
              )}
            </button>
          </div>
        )}
      </Reveal>
    </div>
  );
}
