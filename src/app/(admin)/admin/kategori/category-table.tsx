"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  CheckCircle,
  XCircle,
  Type,
  AlertTriangle,
  AlertCircle,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { AdminTablePagination } from "@/components/admin/admin-table-pagination";
import { AdminDeleteDialogHeader } from "@/components/admin/admin-delete-dialog-header";
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryStatusAction,
  deleteCategoryAction,
} from "@/actions/category";

export type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date | string;
  updatedAt: Date | string;
  _count: {
    articles: number;
  };
};

type CategoryInput = {
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export function CategoryTable({
  initialCategories,
}: {
  initialCategories: CategoryWithCount[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [categories, setOptimisticCategories] = useOptimistic(
    initialCategories,
    (
      state: CategoryWithCount[],
      update: { id: string; status: "ACTIVE" | "INACTIVE" }
    ) =>
      state.map((c) =>
        c.id === update.id ? { ...c, status: update.status } : c
      )
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<CategoryWithCount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Form State
  const [formData, setFormData] = useState<CategoryInput>({
    name: "",
    status: "ACTIVE",
  });
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((cat) => {
    const query = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Target Kategori yang sedang akan dihapus
  const catToDelete = categories.find((c) => c.id === deleteId);
  const catArticleCount = catToDelete ? catToDelete._count.articles : 0;

  const handleOpenAdd = () => {
    setEditCategory(null);
    setFormData({ name: "", status: "ACTIVE" });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryWithCount) => {
    setEditCategory(cat);
    setFormData({ name: cat.name, status: cat.status });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setError("Nama kategori tidak boleh kosong.");
      toast.error("Nama kategori tidak boleh kosong.");
      return;
    }

    startTransition(async () => {
      setIsSubmitting(true);
      setError(null);

      try {
        if (editCategory) {
          // Proses Edit Kategori
          const res = await updateCategoryAction(editCategory.id, {
            name: trimmedName,
            status: formData.status,
          });

          setIsSubmitting(false);
          if (!res.success) {
            setError(res.error || "Gagal memperbarui kategori.");
            toast.error(res.error || "Gagal memperbarui kategori.");
            return;
          }

          toast.success(`Kategori "${trimmedName}" berhasil diperbarui.`);
          setIsModalOpen(false);
          router.refresh();
        } else {
          // Proses Tambah Kategori
          const res = await createCategoryAction({
            name: trimmedName,
            status: formData.status,
          });

          setIsSubmitting(false);
          if (!res.success) {
            setError(res.error || "Gagal menambahkan kategori.");
            toast.error(res.error || "Gagal menambahkan kategori.");
            return;
          }

          toast.success(`Kategori "${trimmedName}" berhasil ditambahkan.`);
          setIsModalOpen(false);
          router.refresh();
        }
      } catch (err: unknown) {
        setIsSubmitting(false);
        console.error("[category-table] Submit error:", err);
        toast.error("Gagal menghubungi server. Periksa koneksi Anda.");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      setIsDeleting(true);
      try {
        const res = await deleteCategoryAction(deleteId);
        setIsDeleting(false);

        if (!res.success) {
          toast.error(res.error || "Gagal menghapus kategori.");
          setDeleteId(null);
          return;
        }

        toast.success("Kategori berhasil dihapus.");
        setDeleteId(null);
        router.refresh();
      } catch (err: unknown) {
        setIsDeleting(false);
        setDeleteId(null);
        console.error("[deleteCategory] Error:", err);
        toast.error("Gagal menghapus kategori. Periksa koneksi Anda.");
      }
    });
  };

  const toggleStatus = (cat: CategoryWithCount) => {
    startTransition(async () => {
      // Optimistic update
      setOptimisticCategories({
        id: cat.id,
        status: cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });

      try {
        const res = await toggleCategoryStatusAction(cat.id);
        if (!res.success) {
          toast.error(res.error || "Gagal memperbarui status kategori.");
          router.refresh();
          return;
        }

        toast.info(`Status "${cat.name}" berhasil diubah.`);
        router.refresh();
      } catch (err: unknown) {
        console.error("[toggleStatus] Error:", err);
        toast.error("Gagal memperbarui status kategori. Periksa koneksi Anda.");
        router.refresh();
      }
    });
  };

  return (
    <>
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-text-main)] sm:text-3xl">
            Master Kategori
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Kelola daftar kategori untuk pengelompokan artikel dan berita.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative z-20 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[var(--admin-card-border)] bg-[var(--admin-card-bg)] p-3.5 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            type="text"
            placeholder="Cari nama kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] py-2 pl-9 pr-4 text-sm text-[var(--admin-text-main)] placeholder-[var(--admin-muted)] outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
      </div>

      {/* Table Container / Status Kosong */}
      {filteredCategories.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--admin-card-border)] bg-[var(--admin-card-bg)] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-table-header-bg)] text-xs font-medium uppercase tracking-wider text-[var(--admin-muted)]">
                  <th className="px-3 sm:px-4 py-3 align-middle">
                    <span className="sm:hidden">Kategori</span>
                    <span className="hidden sm:inline">Nama Kategori</span>
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-center align-middle w-[90px] sm:w-[130px]">
                    <span className="sm:hidden">Artikel</span>
                    <span className="hidden sm:inline">Jumlah Artikel</span>
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-center align-middle w-[105px] sm:w-[120px]">
                    Status
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-right align-middle w-[75px] sm:w-[90px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((cat) => {
                  return (
                    <tr
                      key={cat.id}
                      className="border-b border-[var(--admin-border)] last:border-b-0 transition-colors [@media(hover:hover)]:hover:bg-[var(--admin-hover-bg)]"
                    >
                      {/* Nama Kategori */}
                      <td className="px-3 sm:px-4 py-3 align-middle">
                        <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-[var(--admin-text-main)] min-w-0">
                          <Tags className="hidden sm:inline-block h-4 w-4 text-brand-500 shrink-0" />
                          <span className="truncate max-w-[110px] sm:max-w-none">{cat.name}</span>
                        </div>
                      </td>

                      {/* Jumlah Artikel */}
                      <td className="px-2 sm:px-4 py-3 text-center align-middle whitespace-nowrap">
                        <span className="inline-flex min-w-[24px] items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] px-2.5 py-1 text-xs font-medium text-[var(--admin-muted)]">
                          {cat._count.articles} artikel
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-2 sm:px-4 py-3 text-center align-middle whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleStatus(cat)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            cat.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-[var(--admin-hover-bg)] text-[var(--admin-muted)] border border-[var(--admin-border)]"
                          }`}
                        >
                          {cat.status === "ACTIVE" ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          <span>{cat.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="px-3 sm:px-4 py-3 text-right align-middle whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-muted)] transition-colors [@media(hover:hover)]:hover:border-[var(--admin-border)] [@media(hover:hover)]:hover:bg-[var(--admin-hover-bg)] [@media(hover:hover)]:hover:text-[var(--admin-text-main)] active:bg-[var(--admin-hover-bg)] cursor-pointer"
                            title="Edit Kategori"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(cat.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-muted)] transition-colors [@media(hover:hover)]:hover:border-red-500/20 [@media(hover:hover)]:hover:bg-red-500/10 [@media(hover:hover)]:hover:text-red-500 active:bg-red-500/20 cursor-pointer"
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

          {/* Pagination Bar */}
          <AdminTablePagination
            totalItems={filteredCategories.length}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            currentPage={validPage}
            totalPages={totalPages}
            itemLabel="kategori"
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => setItemsPerPage(limit)}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-card-bg)]/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] text-[var(--admin-muted)]">
            <Tags className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--admin-text-main)]">
            {categories.length === 0
              ? "Belum ada kategori yang ditambahkan"
              : "Tidak ada kategori yang ditemukan"}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--admin-muted)] leading-relaxed">
            {categories.length === 0
              ? "Tambahkan kategori baru untuk mulai mengelompokkan artikel dan warta kesehatan."
              : "Tidak ada kategori yang cocok dengan kata kunci pencarian Anda."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-2.5">
            {categories.length === 0 ? (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#455a26] hover:bg-[#3b4d20] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Kategori Baru
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] hover:bg-[var(--admin-border)] px-4 py-2 text-xs font-semibold text-[var(--admin-text-main)] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
                Reset Pencarian
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Kategori */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border border-[var(--admin-popover-border)] bg-[var(--admin-popover-bg)] text-[var(--admin-text-main)] backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-500">
                {editCategory ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <Tags className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[var(--admin-text-main)] tracking-tight">
                  {editCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--admin-muted)] mt-0.5">
                  {editCategory
                    ? "Perbarui informasi nama dan status kategori artikel."
                    : "Tambahkan kategori baru untuk pengelompokan artikel publik."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Field Nama Kategori */}
            <div className="space-y-2">
              <Label
                htmlFor="categoryName"
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--admin-text-main)]"
              >
                <Type className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
                <span>Nama Kategori</span>
              </Label>
              <Input
                id="categoryName"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (error) setError(null);
                }}
                placeholder="Contoh: Regulasi, Vaksinasi, Panduan..."
                className="h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] px-3 py-2 text-sm text-[var(--admin-text-main)] placeholder:text-[var(--admin-muted)] focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                autoFocus
              />
              {error && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            {/* Status Switcher di dalam Modal */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] p-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--admin-text-main)]">
                    Status Kategori
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      formData.status === "ACTIVE"
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-muted)]"
                    }`}
                  >
                    {formData.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--admin-muted)]">
                  {formData.status === "ACTIVE"
                    ? "Kategori aktif dan dapat dipilih di form artikel"
                    : "Kategori dinonaktifkan dari form artikel"}
                </p>
              </div>

              {/* Sliding Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-label="Status Kategori"
                aria-checked={formData.status === "ACTIVE"}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border p-0.5 transition-colors duration-200 ease-in-out focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none ${
                  formData.status === "ACTIVE"
                    ? "border-emerald-500/50 bg-emerald-600 shadow-xs shadow-emerald-500/30"
                    : "border-[var(--admin-border)] bg-zinc-300 dark:bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    formData.status === "ACTIVE" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 text-sm font-medium text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)] disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Kategori"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border border-[var(--admin-popover-border)] bg-[var(--admin-popover-bg)] text-[var(--admin-text-main)] backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <AdminDeleteDialogHeader
            title="Hapus Kategori?"
            description="Tindakan ini permanen dan akan menghapus kategori dari sistem."
          />

          {catToDelete && (
            <div className="space-y-3 mt-2">
              {/* Category Info Preview Card */}
              <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-[var(--admin-text-main)]">
                    <Tags className="h-4 w-4 text-brand-500" />
                    <span>{catToDelete.name}</span>
                  </div>
                  <code className="rounded bg-[var(--admin-card-bg)] border border-[var(--admin-border)] px-1.5 py-0.5 font-mono text-xs text-[var(--admin-muted)]">
                    /{catToDelete.slug}
                  </code>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--admin-muted)] pt-1 border-t border-[var(--admin-border)]">
                  <span>Status Kategori:</span>
                  <span
                    className={
                      catToDelete.status === "ACTIVE"
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-[var(--admin-muted)]"
                    }
                  >
                    {catToDelete.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--admin-muted)]">
                  <span>Artikel Terhubung:</span>
                  <span
                    className={
                      catArticleCount > 0
                        ? "font-medium text-amber-500"
                        : "text-[var(--admin-muted)]"
                    }
                  >
                    {catArticleCount} artikel
                  </span>
                </div>
              </div>

              {/* Dependency Guard Notice */}
              {catArticleCount > 0 ? (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 leading-relaxed">
                    <p className="font-semibold text-amber-800 dark:text-amber-200">
                      Kategori tidak dapat dihapus
                    </p>
                    <p className="text-amber-700/90 dark:text-amber-300/90">
                      Masih ada{" "}
                      <span className="font-bold underline">{catArticleCount} artikel</span>{" "}
                      yang menggunakan kategori ini. Silakan ubah atau pindahkan kategori artikel terkait terlebih dahulu.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] p-3 text-xs text-[var(--admin-muted)]">
                  Kategori ini tidak digunakan oleh artikel manapun dan aman untuk dihapus.
                </div>
              )}
            </div>
          )}

          <div className={`mt-6 ${catArticleCount > 0 ? "flex justify-end" : "grid grid-cols-2 gap-3"}`}>
            {catArticleCount > 0 ? (
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 text-sm font-medium text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)] cursor-pointer"
              >
                Tutup / Mengerti
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteId(null)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 text-sm font-medium text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)] disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>{isDeleting ? "Menghapus..." : "Hapus Kategori"}</span>
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
