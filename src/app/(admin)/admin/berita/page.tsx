"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  Newspaper,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminShell } from "@/components/admin/admin-shell";
import { dummyArticles, ARTICLE_CATEGORIES } from "@/lib/dummy-data";

const filterCategories = ["Semua", ...ARTICLE_CATEGORIES] as const;

export default function AdminBeritaPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredArticles = dummyArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  function handleDelete() {
    alert("Artikel berhasil dihapus (dummy mode)");
    setDeleteId(null);
  }

  return (
    <AdminShell>
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
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/5 bg-zinc-900/60 p-3.5 backdrop-blur-xl">
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
            className="w-full rounded-lg border border-white/5 bg-zinc-950/60 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/30"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="mr-1 hidden items-center gap-1 text-xs text-zinc-400 lg:flex">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Kategori:</span>
          </span>
          {filterCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "border border-brand-500/30 bg-brand-500/15 text-brand-300 shadow-sm shadow-brand-500/10"
                  : "border border-transparent bg-white/[0.03] text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
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
                              src={article.coverImage}
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
                        {article.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {article.isPublished ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          Terbit
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                          Draft
                        </span>
                      )}
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

      {/* Dialog Konfirmasi Hapus Dark Theme */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              Hapus Artikel?
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              Apakah Anda yakin ingin menghapus artikel ini? Data artikel akan
              dihapus dari daftar dan tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-500/30 bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              Hapus Artikel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
