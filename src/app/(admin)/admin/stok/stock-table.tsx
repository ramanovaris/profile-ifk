"use client";

import { useState, useMemo, useTransition, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Save,
  Loader2
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
import { toast } from "@/components/ui/toast";
import { StockMultiSelectFilter } from "@/components/admin/stock-multi-select-filter";
import { 
  getStockSummary, 
  type MedicineStockItem,
  type StockStatus,
  type MedicineCategory 
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";
import { 
  createStockAction, 
  updateStockAction, 
  deleteStockAction 
} from "@/actions/stock";
import { StockForm } from "./stock-form";

interface StockTableProps {
  initialItems: MedicineStockItem[];
}

export function StockTable({ initialItems }: StockTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [items, setItems] = useState<MedicineStockItem[]>(initialItems);
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);

  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

  // URL query search
  const urlQ = searchParams.get("q") || "";
  const [search, setSearch] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);

  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setSearch(urlQ);
  }

  // URL query kategori
  const rawKategori = searchParams.get("kategori");
  const selectedCategories = useMemo(() => {
    return rawKategori
      ? rawKategori
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }, [rawKategori]);

  // URL query status
  const rawStatus = searchParams.get("status");
  const selectedStatuses = useMemo(() => {
    return rawStatus
      ? rawStatus
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : [];
  }, [rawStatus]);

  // URL query page
  const rawPage = Number(searchParams.get("page"));
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  // Helper untuk memperbarui URL query parameter secara terpusat & konsisten
  const updateUrl = useCallback(
    (
      updates: Record<string, string | null>,
      method: "push" | "replace" = "push"
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || (key === "page" && value === "1")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const queryString = params.toString();
      const currentQuery = searchParams.toString();
      if (queryString === currentQuery) {
        return;
      }
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      if (method === "push") {
        router.push(targetUrl, { scroll: false });
      } else {
        router.replace(targetUrl, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  // Debounce sinkronisasi search query ke URL (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      const trimmed = search.trim();
      if (currentQ !== trimmed) {
        // Jika mulai mengetik dari query kosong, gunakan push agar navigasi Back dapat membatalkan pencarian
        const method = currentQ === "" ? "push" : "replace";
        updateUrl({ q: trimmed || null, page: null }, method);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, searchParams, updateUrl]);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const itemsPerPage = 10;

  // Edit & Delete Dialog State
  const [editItem, setEditItem] = useState<MedicineStockItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MedicineStockItem | null>(null);

  // Form State for Add / Create
  const [addForm, setAddForm] = useState<{
    code: string;
    name: string;
    category: MedicineCategory;
    unit: string;
    quantity: number | string;
    status: StockStatus;
  }>({
    code: "",
    name: "",
    category: "Obat Generik",
    unit: "Tablet",
    quantity: "",
    status: "AVAILABLE",
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState<{
    code: string;
    name: string;
    category: MedicineCategory;
    unit: string;
    quantity: number | string;
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

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setAddForm({
      code: "",
      name: "",
      category: "Obat Generik",
      unit: "Tablet",
      quantity: "",
      status: "AVAILABLE",
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.name.trim()) {
      toast.error("Nama obat tidak boleh kosong");
      return;
    }
    if (!addForm.code.trim()) {
      toast.error("Kode obat tidak boleh kosong");
      return;
    }

    startTransition(async () => {
      const res = await createStockAction({
        code: addForm.code.trim(),
        name: addForm.name.trim(),
        category: addForm.category,
        unit: addForm.unit.trim() || "Tablet",
        quantity: Number(addForm.quantity),
        status: addForm.status,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal menambahkan data obat");
        return;
      }

      const newItem: MedicineStockItem = {
        id: res.data.id,
        code: res.data.code,
        name: res.data.name,
        category: res.data.category as MedicineCategory,
        unit: res.data.unit,
        quantity: res.data.quantity,
        status: res.data.status as StockStatus,
        updatedAt: res.data.updatedAt.toISOString(),
      };

      setItems((prev) => [newItem, ...prev]);
      toast.success(`Obat ${newItem.name} berhasil ditambahkan`);
      setIsAddOpen(false);
    });
  };

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

    startTransition(async () => {
      const res = await updateStockAction(editItem.id, {
        code: editForm.code.trim(),
        name: editForm.name.trim(),
        category: editForm.category,
        unit: editForm.unit.trim() || editItem.unit,
        quantity: Number(editForm.quantity),
        status: editForm.status,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal memperbarui data obat");
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? {
                ...item,
                code: res.data!.code,
                name: res.data!.name,
                category: res.data!.category as MedicineCategory,
                unit: res.data!.unit,
                quantity: res.data!.quantity,
                status: res.data!.status as StockStatus,
                updatedAt: res.data!.updatedAt.toISOString(),
              }
            : item
        )
      );

      toast.success(`Data ${editForm.name} berhasil diperbarui`);
      setEditItem(null);
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    const targetName = deleteItem.name;

    startTransition(async () => {
      const res = await deleteStockAction(deleteItem.id);
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus item");
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
      toast.success(`Item "${targetName}" berhasil dihapus`);
      setDeleteItem(null);
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Kode,Nama Obat,Kategori,Satuan,Jumlah Stok\n" +
      "OBG-001,Paracetamol 500 mg,Obat Generik,Tablet,15000\n" +
      "OBG-002,Amoxicillin 500 mg,Obat Generik,Kaplet,12000\n" +
      "BMH-001,Infus Cairan Ringer Laktat (RL) 500 ml,BMHP / Alkes,Botol,4500\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_stok_ifk_kotabaru.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template format CSV berhasil diunduh");
  };

  // Status kartu aktif
  const isAllActive = selectedStatuses.length === 0;
  const isAvailableActive = selectedStatuses.includes("AVAILABLE");
  const isLowActive = selectedStatuses.includes("LOW");
  const isEmptyActive = selectedStatuses.includes("EMPTY");

  const handleCardStatusClick = (statusKey?: StockStatus) => {
    if (!statusKey) {
      updateUrl({ status: null, page: null });
    } else {
      if (selectedStatuses.length === 1 && selectedStatuses[0] === statusKey) {
        updateUrl({ status: null, page: null });
      } else {
        updateUrl({ status: statusKey, page: null });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Kelola Stok Obat
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manajemen dan pembaruan data stok fisik IFK per akhir bulan
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
          <button 
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm font-medium text-zinc-300 shadow-sm transition-all hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4 text-zinc-400" />
            <span>Unduh Template</span>
          </button>
          <button 
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm font-medium text-zinc-300 shadow-sm transition-all hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-zinc-400" />
            <span>Import CSV</span>
          </button>
          <button 
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Obat</span>
          </button>
        </div>
      </div>

      {/* ── Metrik Ringkasan Interaktif ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Item */}
        <button
          type="button"
          onClick={() => handleCardStatusClick()}
          aria-pressed={isAllActive}
          className={cn(
            "group relative w-full text-left rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
            isAllActive
              ? "border-brand-500/60 bg-brand-500/15 ring-2 ring-brand-500/40"
              : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Package className="h-5 w-5 text-brand-400" />
              <span className="text-sm font-medium">Total Item</span>
            </div>
            {isAllActive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                Aktif
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-zinc-100">{summary.totalItems}</p>
        </button>

        {/* Stok Aman */}
        <button
          type="button"
          onClick={() => handleCardStatusClick("AVAILABLE")}
          aria-pressed={isAvailableActive}
          className={cn(
            "group relative w-full text-left rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
            isAvailableActive
              ? "border-emerald-500/60 bg-emerald-950/40 ring-2 ring-emerald-500/40"
              : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Stok Aman</span>
            </div>
            {isAvailableActive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Aktif
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-emerald-400">{summary.availableItems}</p>
        </button>

        {/* Menipis */}
        <button
          type="button"
          onClick={() => handleCardStatusClick("LOW")}
          aria-pressed={isLowActive}
          className={cn(
            "group relative w-full text-left rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
            isLowActive
              ? "border-amber-500/60 bg-amber-950/40 ring-2 ring-amber-500/40"
              : "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Menipis</span>
            </div>
            {isLowActive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Aktif
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-amber-400">{summary.lowItems}</p>
        </button>

        {/* Kosong */}
        <button
          type="button"
          onClick={() => handleCardStatusClick("EMPTY")}
          aria-pressed={isEmptyActive}
          className={cn(
            "group relative w-full text-left rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
            isEmptyActive
              ? "border-rose-500/60 bg-rose-950/40 ring-2 ring-rose-500/40"
              : "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 hover:bg-rose-500/10"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-rose-400">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Kosong</span>
            </div>
            {isEmptyActive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Aktif
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-rose-400">{summary.emptyItems}</p>
        </button>
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
            onChange={(e) => setSearch(e.target.value)}
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
              updateUrl({
                kategori: vals.length > 0 ? vals.join(",") : null,
                page: null,
              });
            }}
            enableSearch={true}
          />

          <StockMultiSelectFilter
            title="Status"
            allLabel="Semua Status"
            options={statusOptions}
            selectedValues={selectedStatuses}
            onChange={(vals) => {
              updateUrl({
                status: vals.length > 0 ? vals.join(",") : null,
                page: null,
              });
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
                    <div className="text-xs text-zinc-500 font-mono">{item.code}</div>
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
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button 
                        type="button" 
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.02] text-zinc-400 transition-colors [@media(hover:hover)]:hover:border-white/10 [@media(hover:hover)]:hover:bg-white/5 [@media(hover:hover)]:hover:text-white active:bg-white/10 active:text-white cursor-pointer"
                        title="Edit Item"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setDeleteItem(item)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.02] text-zinc-400 transition-colors [@media(hover:hover)]:hover:border-red-500/20 [@media(hover:hover)]:hover:bg-red-500/10 [@media(hover:hover)]:hover:text-red-400 active:bg-red-500/20 active:text-red-400 cursor-pointer"
                        title="Hapus Item"
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
                onClick={() =>
                  updateUrl({
                    page: currentPage > 2 ? String(currentPage - 1) : null,
                  })
                }
                disabled={currentPage <= 1}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-zinc-400">
                Hal {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  updateUrl({
                    page: String(currentPage + 1),
                  })
                }
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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

      {/* ── Modal Tambah Item Baru ─────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-lg shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-400">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Tambah Data Obat Baru
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Input data master dan stok fisik obat/perbekalan farmasi baru
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveAdd} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="add-name" className="text-xs font-medium text-zinc-300">
                  Nama Obat / Barang
                </Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  placeholder="Contoh: Paracetamol 500mg Tablet"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-code" className="text-xs font-medium text-zinc-300">
                  Kode Barang / Barcode
                </Label>
                <Input
                  id="add-code"
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value }))}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white font-mono placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  placeholder="Contoh: OBG-999"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-category" className="text-xs font-medium text-zinc-300">
                  Kategori
                </Label>
                <select
                  id="add-category"
                  value={addForm.category}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, category: e.target.value as MedicineCategory }))
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
                <Label htmlFor="add-unit" className="text-xs font-medium text-zinc-300">
                  Satuan Kemasan
                </Label>
                <Input
                  id="add-unit"
                  value={addForm.unit}
                  onChange={(e) => setAddForm((f) => ({ ...f, unit: e.target.value }))}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  placeholder="Tablet / Botol / Vial / Box"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-quantity" className="text-xs font-medium text-zinc-300">
                  Jumlah Stok Fisik
                </Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={addForm.quantity}
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.select();
                  }}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/^0+(?=\d)/, "");
                    const qty = cleaned === "" ? 0 : parseInt(cleaned, 10) || 0;
                    setAddForm((f) => ({
                      ...f,
                      quantity: cleaned,
                      status: cleaned === "" || qty === 0 ? "EMPTY" : qty < 500 ? "LOW" : "AVAILABLE",
                    }));
                  }}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white font-semibold placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="add-status" className="text-xs font-medium text-zinc-300">
                  Status Ketersediaan
                </Label>
                <select
                  id="add-status"
                  value={addForm.status}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, status: e.target.value as StockStatus }))
                  }
                  className="h-10 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="AVAILABLE">Tersedia (Aman)</option>
                  <option value="LOW">Menipis (Perlu Pengadaan)</option>
                  <option value="EMPTY">Kosong (Habis)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Obat</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                  placeholder="0"
                  value={editForm.quantity}
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.select();
                  }}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/^0+(?=\d)/, "");
                    const qty = cleaned === "" ? 0 : parseInt(cleaned, 10) || 0;
                    setEditForm((f) => ({
                      ...f,
                      quantity: cleaned,
                      status: cleaned === "" || qty === 0 ? "EMPTY" : qty < 500 ? "LOW" : "AVAILABLE",
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
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
                  Tindakan ini permanen dan data obat akan dihapus dari sistem.
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

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeleteItem(null)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>Hapus Item</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <StockForm 
        open={isImportOpen} 
        onOpenChange={setIsImportOpen} 
        onImportSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
