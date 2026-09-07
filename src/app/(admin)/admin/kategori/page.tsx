"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  initialCategories,
  dummyArticles,
  getArticleCountByCategory,
  type Category,
  type ArticleCategory,
} from "@/lib/dummy-data";

type CategoryInput = {
  name: string;
};

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState<CategoryInput>({ name: "" });
  const [error, setError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditCategory(null);
    setFormData({ name: "" });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditCategory(cat);
    setFormData({ name: cat.name });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setError("Nama kategori tidak boleh kosong.");
      return;
    }

    // Cek duplikasi nama (case insensitive)
    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        c.id !== editCategory?.id
    );

    if (isDuplicate) {
      setError("Nama kategori sudah ada. Gunakan nama yang berbeda.");
      return;
    }

    if (editCategory) {
      // Proses Edit
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editCategory.id
            ? {
                ...c,
                name: trimmedName as ArticleCategory,
                slug: trimmedName.toLowerCase().replace(/\s+/g, "-"),
              }
            : c
        )
      );
    } else {
      // Proses Tambah
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: trimmedName as ArticleCategory,
        slug: trimmedName.toLowerCase().replace(/\s+/g, "-"),
        status: "ACTIVE",
      };
      setCategories((prev) => [...prev, newCategory]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    // Jika kategori sedang dipakai artikel, cegah hapus atau beri peringatan
    const catToDelete = categories.find((c) => c.id === deleteId);
    if (catToDelete) {
      const count = getArticleCountByCategory(catToDelete.name, dummyArticles);
      if (count > 0) {
        alert(`Tidak dapat menghapus kategori "${catToDelete.name}" karena masih digunakan oleh ${count} artikel.`);
        setDeleteId(null);
        return;
      }
    }

    setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  const toggleStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : c
      )
    );
  };

  return (
    <AdminShell>
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Master Kategori
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Kelola daftar kategori untuk pengelompokan artikel dan berita.
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-medium uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3">Nama Kategori</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-center">Jumlah Artikel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat) => {
                const articleCount = getArticleCountByCategory(
                  cat.name,
                  dummyArticles
                );
                return (
                  <tr
                    key={cat.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Nama Kategori */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-zinc-200">
                        <Tags className="h-4 w-4 text-brand-400" />
                        <span>{cat.name}</span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-3">
                      <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-zinc-400 font-mono">
                        /{cat.slug}
                      </code>
                    </td>

                    {/* Jumlah Artikel */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex min-w-[24px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-zinc-300">
                        {articleCount} artikel
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleStatus(cat.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                          cat.status === "ACTIVE"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-zinc-600 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        {cat.status === "ACTIVE" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {cat.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.02] text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
                          title="Edit Kategori"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(cat.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.02] text-zinc-400 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Kategori */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {editCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              {editCategory
                ? "Perbarui nama kategori artikel. Slug akan diperbarui otomatis."
                : "Masukkan nama kategori baru yang akan digunakan untuk pengelompokan artikel."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-medium text-zinc-200">
                Nama Kategori
              </Label>
              <Input
                id="categoryName"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ name: e.target.value });
                  if (error) setError(null);
                }}
                placeholder="Contoh: Regulasi, Vaksinasi, dll."
                className="border-white/10 bg-zinc-950/60 text-white focus:border-brand-500/50"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-lg border border-brand-500/30 bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
              >
                {editCategory ? "Simpan Perubahan" : "Tambah Kategori"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              Hapus Kategori?
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              Apakah Anda yakin ingin menghapus kategori ini? Kategori yang masih
              digunakan oleh artikel tidak dapat dihapus.
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
              Hapus Kategori
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
