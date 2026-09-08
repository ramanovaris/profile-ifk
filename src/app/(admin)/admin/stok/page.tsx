"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Package, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Pencil,
  Trash2,
  Save
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/admin-shell";
import { toast } from "@/components/ui/toast";
import { StockMultiSelectFilter } from "@/components/admin/stock-multi-select-filter";
import { 
  initialMedicineStock, 
  getStockSummary, 
  type MedicineStockItem,
  type StockStatus,
  type MedicineCategory 
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";
import { StockForm } from "./stock-form";

export default function AdminStokPage() {
  // ponytail: in-memory state, upgrade to server action/API when database is connected
  const [items, setItems] = useState<MedicineStockItem[]>(initialMedicineStock);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const itemsPerPage = 10;

  // Edit & Delete Dialog State
  const [editItem, setEditItem] = useState<MedicineStockItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MedicineStockItem | null>(null);

  // Form State for Edit
  const [editForm, setEditForm] = useState<{
    code: string;
    name: string;
    category: MedicineCategory;
    unit: string;
    quantity: number;
    status: StockStatus;
  }>({
    code: "",
    name: "",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: 0,
    status: "AVAILABLE",
  });

  const summary = useMemo(() => getStockSummary(items), [items]);

  const categoryOptions = useMemo(() => {
    const cats: MedicineCategory[] = [
      "Obat Generik",
      "Obat Program",
      "Obat Emergensi",
      "BMHP / Alkes",
      "Vaksin & Serum",
    ];
    return cats.map((cat) => ({
      value: cat,
      label: cat,
      count: items.filter((i) => i.category === cat).length,
    }));
  }, [items]);

  const statusOptions = useMemo(() => [
    {
      value: "AVAILABLE",
      label: "Tersedia",
      indicatorColor: "bg-emerald-400",
      count: summary.availableItems,
    },
    {
      value: "LOW",
      label: "Menipis",
      indicatorColor: "bg-amber-400",
      count: summary.lowItems,
    },
    {
      value: "EMPTY",
      label: "Kosong",
      indicatorColor: "bg-rose-400",
      count: summary.emptyItems,
    },
  ], [summary]);

  const filtered = useMemo(() => {
    return items
      .filter(
        (item) =>
          selectedCategories.length === 0 ||
          selectedCategories.includes(item.category)
      )
      .filter(
        (item) =>
          selectedStatuses.length === 0 ||
          selectedStatuses.includes(item.status)
      )
      .filter((item) => {
        const query = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      });
  }, [items, search, selectedCategories, selectedStatuses]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleOpenEdit = (item: MedicineStockItem) => {
    setEditItem(item);
    setEditForm({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      status: item.status,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    if (!editForm.name.trim()) {
      toast.error("Nama obat tidak boleh kosong");
      return;
    }
    if (!editForm.code.trim()) {
      toast.error("Kode obat tidak boleh kosong");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === editItem.id
          ? {
              ...item,
              code: editForm.code.trim(),
              name: editForm.name.trim(),
              category: editForm.category,
              unit: editForm.unit.trim() || item.unit,
              quantity: Number(editForm.quantity),
              status: editForm.status,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    toast.success(`Data ${editForm.name} berhasil diperbarui`);
    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    const targetName = deleteItem.name;
    setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
    toast.success(`Item "${targetName}" berhasil dihapus`);
    setDeleteItem(null);
  };

  return (
    <AdminShell>
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Kelola Stok Obat
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manajemen dan pembaruan data stok fisik IFK per akhir bulan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => toast.info("Fitur unduh template akan segera hadir")}
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh Template
            </Button>
            <Button 
              className="bg-brand-600 hover:bg-brand-700 text-white"
              onClick={() => setIsImportOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Import Data Stok
            </Button>
          </div>
        </div>

        {/* ── Metrik ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Package className="h-5 w-5" />
              <span className="text-sm font-medium">Total Item</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">{summary.totalItems}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Stok Aman</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{summary.availableItems}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Menipis</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{summary.lowItems}</p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Kosong</span>
            </div>
            <p className="text-3xl font-bold text-rose-400">{summary.emptyItems}</p>
          </div>
        </div>

        {/* ── Toolbar Pencarian & Filter Terpadu ────────────────────────── */}
        <div className="relative z-30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/5 bg-zinc-900/60 p-3.5 backdrop-blur-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama obat, kode barang, atau kategori..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-white/5 bg-zinc-950/60 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {/* Filter Dropdowns (Kategori & Status) */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <StockMultiSelectFilter
              title="Kategori"
              allLabel="Semua Kategori"
              options={categoryOptions}
              selectedValues={selectedCategories}
              onChange={(vals) => {
                setSelectedCategories(vals);
                setCurrentPage(1);
              }}
              enableSearch={true}
            />

            <StockMultiSelectFilter
              title="Status"
              allLabel="Semua Status"
              options={statusOptions}
              selectedValues={selectedStatuses}
              onChange={(vals) => {
                setSelectedStatuses(vals);
                setCurrentPage(1);
              }}
              enableSearch={false}
            />
          </div>
        </div>

        {/* ── Tabel Stok ──────────────────────────────────────────────────── */}
        <div className="relative z-10 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="px-4 py-3 font-medium text-zinc-400">No</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Nama Obat / Kode</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Kategori</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Satuan</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Stok Fisik</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
                  <th className="px-4 py-3 font-medium text-zinc-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {paginatedItems.map((item, index) => (
                  <tr key={item.id} className="transition-colors hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-100">{item.name}</div>
                      <div className="text-xs text-zinc-500">{item.code}</div>
                    </td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {item.quantity.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                          item.status === "AVAILABLE" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          item.status === "LOW" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                          item.status === "EMPTY" && "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        )}
                      >
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          item.status === "AVAILABLE" && "bg-emerald-400",
                          item.status === "LOW" && "bg-amber-400",
                          item.status === "EMPTY" && "bg-rose-400"
                        )} />
                        {item.status === "AVAILABLE" && "Tersedia"}
                        {item.status === "LOW" && "Menipis"}
                        {item.status === "EMPTY" && "Kosong"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Item"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => setDeleteItem(item)}
                          title="Hapus Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {filtered.length > itemsPerPage && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800 bg-zinc-900/50 px-4 py-3 sm:flex-row">
              <p className="text-sm text-zinc-400">
                Menampilkan <span className="font-medium text-zinc-200">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
                <span className="font-medium text-zinc-200">
                  {Math.min(currentPage * itemsPerPage, filtered.length)}
                </span>{" "}
                dari <span className="font-medium text-zinc-200">{filtered.length}</span> item
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <span className="text-sm text-zinc-400">
                  Hal {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
        
        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <Package className="mx-auto h-12 w-12 text-zinc-700" />
            <h3 className="mt-2 text-sm font-semibold text-zinc-200">Tidak ada data ditemukan</h3>
            <p className="mt-1 text-sm text-zinc-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* ── Modal Edit Item ────────────────────────────────────────────── */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-lg shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-400">
                <Pencil className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Edit Data Stok
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Sesuaikan informasi dan kuantitas fisik obat atau BMHP
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-name" className="text-xs font-medium text-zinc-300">
                  Nama Obat / Barang
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  placeholder="Contoh: Paracetamol 500mg Tablet"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-code" className="text-xs font-medium text-zinc-300">
                  Kode Barang / Barcode
                </Label>
                <Input
                  id="edit-code"
                  value={editForm.code}
                  onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white font-mono placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  placeholder="Contoh: OBT-001"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-category" className="text-xs font-medium text-zinc-300">
                  Kategori
                </Label>
                <select
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, category: e.target.value as MedicineCategory }))
                  }
                  className="h-10 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="Obat Generik">Obat Generik</option>
                  <option value="Obat Program">Obat Program</option>
                  <option value="Obat Emergensi">Obat Emergensi</option>
                  <option value="BMHP / Alkes">BMHP / Alkes</option>
                  <option value="Vaksin & Serum">Vaksin & Serum</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-unit" className="text-xs font-medium text-zinc-300">
                  Satuan Kemasan
                </Label>
                <Input
                  id="edit-unit"
                  value={editForm.unit}
                  onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  placeholder="Tablet / Botol / Vial / Box"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-quantity" className="text-xs font-medium text-zinc-300">
                  Jumlah Stok Fisik
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  value={editForm.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value, 10) || 0;
                    setEditForm((f) => ({
                      ...f,
                      quantity: qty,
                      status: qty === 0 ? "EMPTY" : f.status === "EMPTY" ? "AVAILABLE" : f.status,
                    }));
                  }}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white font-semibold placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-status" className="text-xs font-medium text-zinc-300">
                  Status Ketersediaan
                </Label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value as StockStatus }))
                  }
                  className="h-10 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="AVAILABLE">Tersedia (Aman)</option>
                  <option value="LOW">Menipis (Perlu Pengadaan)</option>
                  <option value="EMPTY">Kosong (Habis)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-500"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal Konfirmasi Hapus ─────────────────────────────────────── */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Hapus Item Stok?
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Tindakan ini permanen dan akan menghapus item dari daftar inventaris.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deleteItem && (
            <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-100 text-sm">{deleteItem.name}</p>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">{deleteItem.code}</p>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-medium shrink-0">
                  {deleteItem.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
                <span>Stok Fisik Saat Ini:</span>
                <span className="font-medium text-zinc-200">
                  {deleteItem.quantity.toLocaleString("id-ID")} {deleteItem.unit}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setDeleteItem(null)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Item</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <StockForm open={isImportOpen} onOpenChange={setIsImportOpen} />
    </AdminShell>
  );
}
