"use client";

import { useState, useEffect, useCallback, useTransition, useOptimistic } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Globe,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  CategoryMultiSelectFilter,
  type CategoryFilterItem,
} from "@/components/admin/category-multi-select-filter";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination } from "@/components/admin/admin-table-pagination";
import {
  toggleArticlePublishAction,
  deleteArticleAction,
} from "@/actions/article";
import { getAssetUrl, cn } from "@/lib/utils";
import {
  sortArticles,
  type SortKey,
  type SortOrder,
} from "@/lib/article-sorting";

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: Date | string;
  createdAt: Date | string;
  category: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    name: string;
  };
}

interface ArticleTableProps {
  initialArticles: ArticleItem[];
  categories: CategoryFilterItem[];
}

export function ArticleTable({ initialArticles, categories }: ArticleTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggleArticle, setToggleArticle] = useState<ArticleItem | null>(null);
  const urlQ = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);

  // Sesuaikan state lokal jika URL query berubah (misal saat navigasi tombol Back/Forward)
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setSearchQuery(urlQ);
  }

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isPending, startTransition] = useTransition();

  // Single Source of Truth dari URL query parameter
  const paramSort = searchParams.get("sort") as SortKey | null;
  const sortKey: SortKey =
    paramSort && ["title", "category", "isPublished", "publishedAt"].includes(paramSort)
      ? paramSort
      : "publishedAt";

  const paramOrder = searchParams.get("order") as SortOrder | null;
  const sortOrder: SortOrder = paramOrder === "asc" ? "asc" : "desc";

  const rawKategori = searchParams.get("kategori");
  const selectedCategories = rawKategori
    ? rawKategori
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const rawStatus = searchParams.get("status"); // "terbit" | "draft" | null

  const rawPage = Number(searchParams.get("page"));
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  // Helper untuk memperbarui URL query parameter secara terpusat & konsisten
  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || (key === "page" && value === "1")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Debounce sinkronisasi search query ke URL (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      const trimmed = searchQuery.trim();
      if (currentQ !== trimmed) {
        updateUrl({ q: trimmed || null, page: null });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, updateUrl]);

  const handleSort = (key: SortKey) => {
    let nextOrder: SortOrder;
    if (sortKey === key) {
      nextOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      nextOrder = key === "publishedAt" ? "desc" : "asc";
    }

    updateUrl({ sort: key, order: nextOrder, page: null });
  };

  const handleCategoryChange = (cats: string[]) => {
    updateUrl({
      kategori: cats.length > 0 ? cats.join(",") : null,
      page: null,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    updateUrl({
      q: null,
      kategori: null,
      status: null,
      page: null,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage > 1 ? String(newPage) : null });
  };

  // Optimistic UI untuk pergantian status publikasi instan
  const [optimisticArticles, setOptimisticArticles] = useOptimistic(
    initialArticles,
    (state, update: { id: string; nextStatus: boolean }) =>
      state.map((a) =>
        a.id === update.id ? { ...a, isPublished: update.nextStatus } : a
      )
  );

  const filteredArticles = optimisticArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(article.category.name);
    const matchesStatus =
      !rawStatus ||
      ((rawStatus === "terbit" || rawStatus === "published") && article.isPublished) ||
      (rawStatus === "draft" && !article.isPublished);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedArticles = sortArticles(filteredArticles, sortKey, sortOrder);

  const totalPages = Math.max(1, Math.ceil(sortedArticles.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedArticles = sortedArticles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Toggle status publikasi
  const handleTogglePublish = (article: ArticleItem) => {
    startTransition(async () => {
      setOptimisticArticles({ id: article.id, nextStatus: !article.isPublished });
      try {
        const res = await toggleArticlePublishAction(article.id);
        if (res.success) {
          toast.success(
            res.isPublished
              ? `Artikel "${article.title}" berhasil diterbitkan.`
              : `Artikel "${article.title}" diubah menjadi draft.`
          );
        } else {
          toast.error(res.error || "Gagal mengubah status publikasi.");
        }
      } catch (err: unknown) {
        console.error("[handleTogglePublish] Error:", err);
        toast.error("Gagal mengubah status publikasi. Periksa koneksi server Anda.");
      }
    });
  };

  // Konfirmasi dan hapus artikel
  const handleDelete = () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setDeleteId(null);

    startTransition(async () => {
      try {
        const res = await deleteArticleAction(idToDelete);
        if (res.success) {
          toast.success("Artikel berhasil dihapus.");
        } else {
          toast.error(res.error || "Gagal menghapus artikel.");
        }
      } catch (err: unknown) {
        console.error("[handleDelete] Error:", err);
        toast.error("Gagal menghapus artikel. Periksa koneksi server Anda.");
      }
    });
  };

  const articleToDelete = optimisticArticles.find((a) => a.id === deleteId);

  return (
    <>
      {/* Header section */}
      <AdminPageHeader
        title="Kelola Berita"
        description="Daftar publikasi, pengumuman, dan artikel informasi farmasi."
        action={
          <Link
            href="/admin/berita/baru/"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Artikel</span>
          </Link>
        }
      />

      {/* Status Filter Tabs (Semua / Terbit / Draft) */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
        {[
          {
            key: null,
            label: "Semua",
            count: optimisticArticles.length,
            activeColor: "border-[#455a26] bg-[#455a26] text-white shadow-xs font-bold",
            badgeColor: "bg-black/20 text-white font-bold",
          },
          {
            key: "terbit",
            label: "Terbit",
            count: optimisticArticles.filter((a) => a.isPublished).length,
            activeColor: "border-emerald-700 bg-emerald-700 text-white shadow-xs font-bold",
            badgeColor: "bg-black/20 text-white font-bold",
          },
          {
            key: "draft",
            label: "Draft",
            count: optimisticArticles.filter((a) => !a.isPublished).length,
            activeColor: "border-amber-700 bg-amber-700 text-white shadow-xs font-bold",
            badgeColor: "bg-black/20 text-white font-bold",
          },
        ].map((tab) => {
          const isActive =
            (tab.key === null && !rawStatus) ||
            rawStatus === tab.key ||
            (tab.key === "terbit" && rawStatus === "published");

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => updateUrl({ status: tab.key, page: null })}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer border",
                isActive
                  ? tab.activeColor
                  : "border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-muted)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)]"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                  isActive
                    ? tab.badgeColor
                    : "bg-[var(--admin-hover-bg)] text-[var(--admin-muted)]"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="relative z-20 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[var(--admin-card-border)] bg-[var(--admin-card-bg)] p-3.5 backdrop-blur-xl">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            type="text"
            placeholder="Cari judul atau topik artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] py-2 pl-9 pr-9 text-sm text-[var(--admin-text-main)] placeholder-[var(--admin-muted)] outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                updateUrl({ q: null, page: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Hapus pencarian"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Multi-Select Filter */}
        <CategoryMultiSelectFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onChange={handleCategoryChange}
          getArticleCount={(catName) =>
            optimisticArticles.filter((a) => a.category.name === catName).length
          }
        />
      </div>

      {/* Table Container / Status Kosong */}
      {filteredArticles.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--admin-card-border)] bg-[var(--admin-card-bg)] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-table-header-bg)] text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                {/* Artikel / Judul */}
                <th
                  scope="col"
                  className="px-4 py-3"
                  aria-sort={
                    sortKey === "title"
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort("title")}
                    className="group inline-flex items-center gap-1.5 font-medium uppercase tracking-wider transition-colors hover:text-[var(--admin-text-main)] focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400 rounded-sm cursor-pointer"
                    title={`Urutkan berdasarkan Judul Artikel (${
                      sortKey === "title" && sortOrder === "asc"
                        ? "Z ke A"
                        : "A ke Z"
                    })`}
                  >
                    <span
                      className={
                        sortKey === "title"
                          ? "text-[#455a26] dark:text-brand-400 font-bold"
                          : ""
                      }
                    >
                      Artikel
                    </span>
                    {sortKey === "title" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 transition-colors" />
                    )}
                  </button>
                </th>

                {/* Kategori */}
                <th
                  scope="col"
                  className="px-4 py-3"
                  aria-sort={
                    sortKey === "category"
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort("category")}
                    className="group inline-flex items-center gap-1.5 font-medium uppercase tracking-wider transition-colors hover:text-[var(--admin-text-main)] focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400 rounded-sm cursor-pointer"
                    title={`Urutkan berdasarkan Kategori (${
                      sortKey === "category" && sortOrder === "asc"
                        ? "Z ke A"
                        : "A ke Z"
                    })`}
                  >
                    <span
                      className={
                        sortKey === "category"
                          ? "text-[#455a26] dark:text-brand-400 font-bold"
                          : ""
                      }
                    >
                      Kategori
                    </span>
                    {sortKey === "category" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 transition-colors" />
                    )}
                  </button>
                </th>

                {/* Status */}
                <th
                  scope="col"
                  className="px-4 py-3"
                  aria-sort={
                    sortKey === "isPublished"
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort("isPublished")}
                    className="group inline-flex items-center gap-1.5 font-medium uppercase tracking-wider transition-colors hover:text-[var(--admin-text-main)] focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400 rounded-sm cursor-pointer"
                    title={`Urutkan berdasarkan Status (${
                      sortKey === "isPublished" && sortOrder === "asc"
                        ? "Draft dahulu"
                        : "Terbit dahulu"
                    })`}
                  >
                    <span
                      className={
                        sortKey === "isPublished"
                          ? "text-[#455a26] dark:text-brand-400 font-bold"
                          : ""
                      }
                    >
                      Status
                    </span>
                    {sortKey === "isPublished" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 transition-colors" />
                    )}
                  </button>
                </th>

                {/* Tanggal Terbit */}
                <th
                  scope="col"
                  className="px-4 py-3"
                  aria-sort={
                    sortKey === "publishedAt"
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort("publishedAt")}
                    className="group inline-flex items-center gap-1.5 font-medium uppercase tracking-wider transition-colors hover:text-[var(--admin-text-main)] focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400 rounded-sm cursor-pointer"
                    title={`Urutkan berdasarkan Tanggal Terbit (${
                      sortKey === "publishedAt" && sortOrder === "desc"
                        ? "Terlama dahulu"
                        : "Terbaru dahulu"
                    })`}
                  >
                    <span
                      className={
                        sortKey === "publishedAt"
                          ? "text-[#455a26] dark:text-brand-400 font-bold"
                          : ""
                      }
                    >
                      Tanggal Terbit
                    </span>
                    {sortKey === "publishedAt" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 transition-colors" />
                    )}
                  </button>
                </th>

                <th scope="col" className="px-4 py-3 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {paginatedArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="transition-colors hover:bg-[var(--admin-hover-bg)]"
                  >
                    {/* Judul & Cover */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md border border-[var(--admin-border)] bg-[var(--admin-hover-bg)]">
                          {article.coverImage ? (
                            <Image
                              src={getAssetUrl(article.coverImage)}
                              alt={article.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--admin-muted)] font-mono">
                              IFK
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-md">
                          <p className="truncate font-medium text-[var(--admin-text-main)]">
                            {article.title}
                          </p>
                          <p className="truncate text-xs text-[var(--admin-muted)]">
                            /{article.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3 text-[var(--admin-muted)]">
                      <span className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] px-2.5 py-1 text-xs">
                        {article.category.name}
                      </span>
                    </td>

                    {/* Status Publikasi (Interaktif Toggle) */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setToggleArticle(article)}
                        disabled={isPending}
                        title="Klik untuk mengubah status publikasi"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                          article.isPublished
                            ? "border border-emerald-600 bg-emerald-700 text-white hover:bg-emerald-600"
                            : "border border-amber-600 bg-amber-700 text-white hover:bg-amber-600"
                        } disabled:opacity-50`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-white"
                        />
                        <span>{article.isPublished ? "Terbit" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-3 text-xs text-[var(--admin-muted)]">
                      {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/berita/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-muted)] transition-colors hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                          title="Pratinjau Artikel di Tab Baru"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/berita/${article.id}/edit/`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-muted)] transition-colors hover:border-[var(--admin-border)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)]"
                          title="Edit Artikel"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(article.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-muted)] transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <AdminTablePagination
          totalItems={sortedArticles.length}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          currentPage={validPage}
          totalPages={totalPages}
          itemLabel="artikel"
          onPageChange={handlePageChange}
          onItemsPerPageChange={(limit) => setItemsPerPage(limit)}
        />
      </div>
    ) : (
      <div className="mt-6 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-bg)]/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] text-[var(--admin-muted)]">
          <Newspaper className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--admin-text-main)]">
          {initialArticles.length === 0
            ? "Belum ada warta atau berita"
            : "Tidak ada artikel yang ditemukan"}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--admin-muted)] leading-relaxed">
          {initialArticles.length === 0
            ? "Mulai publikasikan warta kegiatan, edukasi farmasi, atau pengumuman resmi IFK Kotabaru."
            : "Tidak ada artikel yang cocok dengan kata kunci pencarian atau filter yang dipilih."}
        </p>
        <div className="mt-5 flex items-center justify-center gap-2.5">
          {initialArticles.length === 0 ? (
            <Link
              href="/admin/berita/baru"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#455a26] hover:bg-[#3b4d20] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Tulis Berita Baru
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] hover:bg-[var(--admin-border)] px-4 py-2 text-xs font-semibold text-[var(--admin-text-main)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
              Reset Filter & Pencarian
            </button>
          )}
        </div>
      </div>
    )}

      {/* Dialog Konfirmasi Toggle Status Publikasi */}
      <Dialog open={!!toggleArticle} onOpenChange={() => setToggleArticle(null)}>
        <DialogContent className="border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-main)] backdrop-blur-2xl w-[calc(100vw-2rem)] sm:w-full max-w-[calc(100vw-2rem)] sm:max-w-md shadow-2xl rounded-2xl p-5 sm:p-6 overflow-hidden">
          <DialogHeader className="space-y-2 pr-6">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  toggleArticle?.isPublished
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {toggleArticle?.isPublished ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Globe className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg font-bold text-[var(--admin-text-main)] tracking-tight leading-snug">
                  {toggleArticle?.isPublished ? "Jadikan Draft?" : "Terbitkan Artikel?"}
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--admin-text-muted)] mt-1 leading-relaxed">
                  {toggleArticle?.isPublished
                    ? "Artikel akan disembunyikan dari akses publik."
                    : "Artikel akan segera dapat diakses oleh masyarakat umum."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {toggleArticle && (
            <div className="space-y-3 mt-2 min-w-0 w-full">
              {/* Article Preview Card */}
              <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)]/50 p-3.5 space-y-2.5 min-w-0 w-full overflow-hidden">
                <div className="flex items-start gap-3 min-w-0 w-full">
                  <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] mt-0.5">
                    {toggleArticle.coverImage ? (
                      <Image
                        src={getAssetUrl(toggleArticle.coverImage)}
                        alt={toggleArticle.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--admin-text-muted)] font-mono">
                        IFK
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-[var(--admin-text-main)] leading-snug break-words">
                      {toggleArticle.title}
                    </p>
                    <p className="truncate text-xs text-[var(--admin-text-muted)] mt-0.5 block">
                      /{toggleArticle.slug}
                    </p>
                  </div>
                </div>

                {/* Status Transition Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-2 text-xs w-full min-w-0">
                  <span className="text-[var(--admin-text-muted)] shrink-0">Perubahan Status:</span>
                  <div className="flex items-center gap-1.5 font-medium shrink-0">
                    <span
                      className={
                        toggleArticle.isPublished
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-amber-600 dark:text-amber-400 font-medium"
                      }
                    >
                      {toggleArticle.isPublished ? "Terbit" : "Draft"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-[var(--admin-text-muted)]" />
                    <span
                      className={
                        toggleArticle.isPublished
                          ? "text-amber-600 dark:text-amber-400 font-semibold"
                          : "text-emerald-600 dark:text-emerald-400 font-semibold"
                      }
                    >
                      {toggleArticle.isPublished ? "Draft" : "Terbit"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Change Explanatory Notice */}
              <div
                className={`rounded-lg border p-3 text-xs leading-relaxed break-words w-full ${
                  toggleArticle.isPublished
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {toggleArticle.isPublished
                  ? "Artikel ini tidak akan tampil di portal publik, namun tetap tersimpan dan dapat diedit kapan saja."
                  : "Artikel ini akan langsung dipublikasikan dan dapat dibaca oleh pengunjung portal resmi UPTD IFK Kotabaru."}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setToggleArticle(null)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-sm font-medium text-[var(--admin-text-main)] transition-colors hover:bg-[var(--admin-hover-bg)] disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (toggleArticle) {
                  const target = toggleArticle;
                  setToggleArticle(null);
                  handleTogglePublish(target);
                }
              }}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg ${
                toggleArticle?.isPublished
                  ? "border border-amber-500/30 bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-500/20 hover:brightness-110 active:scale-95"
                  : "border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 shadow-brand-500/20 hover:brightness-110 active:scale-95"
              }`}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {toggleArticle?.isPublished ? "Ubah ke Draft" : "Terbitkan Artikel"}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-main)] backdrop-blur-2xl w-[calc(100vw-2rem)] sm:w-full max-w-[calc(100vw-2rem)] sm:max-w-md shadow-2xl rounded-2xl p-5 sm:p-6 overflow-hidden">
          <DialogHeader className="space-y-2 pr-6">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg font-bold text-[var(--admin-text-main)] tracking-tight leading-snug">
                  Hapus Artikel?
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--admin-text-muted)] mt-1 leading-relaxed">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {articleToDelete && (
            <div className="space-y-3 mt-2 min-w-0 w-full">
              <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)]/50 p-3.5 space-y-2.5 min-w-0 w-full overflow-hidden">
                <div className="flex items-start gap-3 min-w-0 w-full">
                  <div className="relative h-12 w-16 shrink-0 rounded-lg overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                    {articleToDelete.coverImage ? (
                      <Image
                        src={getAssetUrl(articleToDelete.coverImage)}
                        alt={articleToDelete.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[var(--admin-text-muted)]">
                        <Newspaper className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--admin-text-main)] line-clamp-2 leading-tight break-words">
                      {articleToDelete.title}
                    </p>
                    <p className="text-[11px] text-[var(--admin-text-muted)] font-mono mt-1 truncate">
                      /{articleToDelete.slug}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs leading-relaxed text-red-600 dark:text-red-300 break-words w-full">
                Artikel ini beserta berkas gambar sampul terkait akan dihapus secara permanen dari sistem.
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setDeleteId(null)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-sm font-medium text-[var(--admin-text-main)] transition-colors hover:bg-[var(--admin-hover-bg)] disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>Hapus Artikel</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
