"use client";

import { useState, useTransition, useOptimistic } from "react";
import Link from "next/link";
import Image from "next/image";
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
  EyeOff,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  CategoryMultiSelectFilter,
  type CategoryFilterItem,
} from "@/components/admin/category-multi-select-filter";
import {
  toggleArticlePublishAction,
  deleteArticleAction,
} from "@/actions/article";
import { getAssetUrl } from "@/lib/utils";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggleArticle, setToggleArticle] = useState<ArticleItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isPending, startTransition] = useTransition();

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
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Toggle status publikasi
  const handleTogglePublish = (article: ArticleItem) => {
    startTransition(async () => {
      setOptimisticArticles({ id: article.id, nextStatus: !article.isPublished });
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
    });
  };

  // Konfirmasi dan hapus artikel
  const handleDelete = () => {
    if (!deleteId) return;
    const idToDelete = deleteId;
    setDeleteId(null);

    startTransition(async () => {
      const res = await deleteArticleAction(idToDelete);
      if (res.success) {
        toast.success("Artikel berhasil dihapus dari database.");
      } else {
        toast.error(res.error || "Gagal menghapus artikel.");
      }
    });
  };

  const articleToDelete = optimisticArticles.find((a) => a.id === deleteId);

  return (
    <>
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Kelola Berita
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Daftar publikasi, pengumuman, dan artikel informasi farmasi.
          </p>
        </div>
        <div>
          <Link
            href="/admin/berita/baru"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Artikel</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="relative z-20 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/5 bg-zinc-900/60 p-3.5 backdrop-blur-xl">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari judul atau topik artikel..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-white/5 bg-zinc-950/60 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40"
          />
        </div>

        {/* Category Multi-Select Filter */}
        <CategoryMultiSelectFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onChange={(cats) => {
            setSelectedCategories(cats);
            setCurrentPage(1);
          }}
          getArticleCount={(catName) =>
            optimisticArticles.filter((a) => a.category.name === catName).length
          }
        />
      </div>

      {/* Table Container */}
      <div className="mt-4 overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-medium uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3">Artikel</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal Terbit</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <Newspaper className="mx-auto h-8 w-8 text-zinc-400/80 mb-2" />
                    <p className="text-sm">Tidak ada artikel yang cocok dengan pencarian.</p>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Judul & Cover */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                          {article.coverImage ? (
                            <Image
                              src={getAssetUrl(article.coverImage)}
                              alt={article.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                              IFK
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-md">
                          <p className="truncate font-medium text-zinc-200">
                            {article.title}
                          </p>
                          <p className="truncate text-xs text-zinc-400">
                            /{article.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3 text-zinc-300">
                      <span className="rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs">
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
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer ${
                          article.isPublished
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            article.isPublished ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        <span>{article.isPublished ? "Terbit" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-3 text-xs text-zinc-400">
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
                          href={`/admin/berita/${article.id}/edit`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.02] text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
                          title="Edit Artikel"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(article.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.02] text-zinc-400 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredArticles.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/5 bg-white/[0.01] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <p>
                Menampilkan{" "}
                <span className="font-medium text-white">
                  {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredArticles.length)}
                </span>{" "}
                dari <span className="font-medium text-white">{filteredArticles.length}</span> artikel
              </p>

              {/* Selector Baris Per Halaman */}
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                <span className="text-zinc-500">Baris:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none transition-colors hover:border-white/20 focus:border-brand-500/50"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      validPage === page
                        ? "border border-brand-500/30 bg-brand-500/15 text-brand-300 font-semibold shadow-sm shadow-brand-500/10"
                        : "border border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Konfirmasi Toggle Status Publikasi */}
      <Dialog open={!!toggleArticle} onOpenChange={() => setToggleArticle(null)}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  toggleArticle?.isPublished
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {toggleArticle?.isPublished ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Globe className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  {toggleArticle?.isPublished ? "Jadikan Draft?" : "Terbitkan Artikel?"}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  {toggleArticle?.isPublished
                    ? "Artikel akan disembunyikan dari akses publik."
                    : "Artikel akan segera dapat diakses oleh masyarakat umum."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {toggleArticle && (
            <div className="space-y-3 mt-2">
              {/* Article Preview Card */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                    {toggleArticle.coverImage ? (
                      <Image
                        src={getAssetUrl(toggleArticle.coverImage)}
                        alt={toggleArticle.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500 font-mono">
                        IFK
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {toggleArticle.title}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      /{toggleArticle.slug}
                    </p>
                  </div>
                </div>

                {/* Status Transition Indicator */}
                <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                  <span className="text-zinc-400">Perubahan Status:</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span
                      className={
                        toggleArticle.isPublished
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {toggleArticle.isPublished ? "Terbit" : "Draft"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-zinc-500" />
                    <span
                      className={
                        toggleArticle.isPublished
                          ? "text-amber-400 font-semibold"
                          : "text-emerald-400 font-semibold"
                      }
                    >
                      {toggleArticle.isPublished ? "Draft" : "Terbit"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Change Explanatory Notice */}
              <div
                className={`rounded-lg border p-3 text-xs leading-relaxed ${
                  toggleArticle.isPublished
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-300/90"
                    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300/90"
                }`}
              >
                {toggleArticle.isPublished
                  ? "Artikel ini tidak akan tampil di portal publik, namun tetap aman tersimpan di basis data dan dapat diedit kapan saja."
                  : "Artikel ini akan langsung dipublikasikan dan dapat dibaca oleh pengunjung portal resmi UPTD IFK Kotabaru."}
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setToggleArticle(null)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
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
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg ${
                toggleArticle?.isPublished
                  ? "border-amber-500/30 bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-500/20 hover:brightness-110"
                  : "border-emerald-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 shadow-brand-500/20 hover:brightness-110"
              }`}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {toggleArticle?.isPublished ? "Ubah ke Draft" : "Terbitkan Artikel"}
              </span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Dark Theme */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Hapus Artikel?
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {articleToDelete && (
            <div className="space-y-3 mt-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-950">
                    {articleToDelete.coverImage ? (
                      <Image
                        src={getAssetUrl(articleToDelete.coverImage)}
                        alt={articleToDelete.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500 font-mono">
                        IFK
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {articleToDelete.title}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      /{articleToDelete.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-zinc-400">
                  <span>Kategori:</span>
                  <span className="text-zinc-200 font-medium">
                    {articleToDelete.category.name}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs leading-relaxed text-red-300/90">
                Record artikel ini di basis data dan berkas gambar sampul terkait pada penyimpanan server akan dihapus secara permanen.
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setDeleteId(null)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Hapus Artikel</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
