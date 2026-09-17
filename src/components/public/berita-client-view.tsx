"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Check,
  X,
  Loader2,
  ArrowDown,
} from "lucide-react";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inisialisasi state dari query parameter URL jika ada
  const initialQ = searchParams.get("q") || "";
  const initialCategoryParam = searchParams.get("kategori") || "semua";

  const [articles, setArticles] = useState<PublicArticleItem[]>(initialArticles);
  const [search, setSearch] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategoryParam);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Kategori filter: 'Semua Kategori' + kategori aktif dinamis
  const filterCategories = [
    { id: "semua", name: "Semua Kategori", slug: "semua" },
    ...categories,
  ];

  // Helper untuk memperbarui URL query parameter tanpa lonjakan scroll
  const updateUrlParams = useCallback(
    (newSearch: string, newCategory: string) => {
      if (typeof window === "undefined") return;

      const currentParams = new URLSearchParams(window.location.search);
      const currentQ = currentParams.get("q") || "";
      const currentCat = currentParams.get("kategori") || "semua";
      const trimmed = newSearch.trim();
      const targetCat = newCategory && newCategory !== "semua" ? newCategory : "semua";

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

      if (targetCat !== "semua") {
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

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    }
    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryOpen]);

  // Fetch data awal jika halaman dibuka langsung dengan query parameter URL non-default
  useEffect(() => {
    if (initialQ || (initialCategoryParam && initialCategoryParam !== "semua")) {
      const fetchInitialFiltered = async () => {
        setIsLoading(true);
        const res = await getPublicArticlesAction({
          page: 1,
          limit: 12,
          categorySlug:
            initialCategoryParam === "semua" ? undefined : initialCategoryParam,
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
  }, [initialCategoryParam, initialQ]);

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
      updateUrlParams(search, activeCategory);

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
    }, 350);

    return () => clearTimeout(timer);
  }, [search, activeCategory, updateUrlParams]);

  // Hapus pencarian seketika (0ms)
  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    updateUrlParams("", activeCategory);
  };

  const handleSelectCategory = (catSlug: string) => {
    setActiveCategory(catSlug);
    setIsCategoryOpen(false);
    setPage(1);
    updateUrlParams(search, catSlug);
  };

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

  const activeCategoryObj = filterCategories.find(
    (c) => c.slug === activeCategory
  );
  const activeCategoryLabel = activeCategoryObj
    ? activeCategoryObj.name
    : "Semua Kategori";

  return (
    <div className="section-container">
      {/* ── Toolbar Pencarian & Filter Terpadu (Serasi Halaman Stok) ─ */}
      <Reveal className="relative z-30">
        <div className="relative z-30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-surface-alt/60 p-3.5 sm:p-4 backdrop-blur-md">
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

          {/* Dropdown Filter Kategori */}
          <div ref={dropdownRef} className="relative inline-block w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              aria-expanded={isCategoryOpen}
              aria-haspopup="listbox"
              className={cn(
                "inline-flex h-10 w-full items-center justify-between gap-2.5 rounded-full border px-4 text-xs font-medium transition-all duration-300 sm:w-auto sm:min-w-[180px] cursor-pointer",
                activeCategory !== "semua"
                  ? "border-brand-600/30 bg-brand-500/10 text-brand-700 shadow-xs"
                  : "border-border bg-surface text-muted hover:border-zinc-300 hover:text-heading hover:bg-surface-alt/80"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <SlidersHorizontal
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors",
                    activeCategory !== "semua" ? "text-brand-600" : "text-muted"
                  )}
                />
                <span className="truncate">{activeCategoryLabel}</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted transition-transform duration-200 shrink-0",
                  isCategoryOpen && "rotate-180"
                )}
              />
            </button>

            {/* Popover Menu Dropdown */}
            {isCategoryOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
              >
                <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                  {filterCategories.map((cat) => {
                    const isSelected = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left",
                          isSelected
                            ? "bg-brand-500/10 text-brand-700"
                            : "text-zinc-700 hover:bg-surface-alt hover:text-heading"
                        )}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-brand-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>

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
            {(search || activeCategory !== "semua") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("semua");
                  updateUrlParams("", "semua");
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
