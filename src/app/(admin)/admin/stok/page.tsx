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
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/admin-shell";
import { toast } from "@/components/ui/toast";
import { 
  initialMedicineStock, 
  getStockSummary, 
  type MedicineCategory 
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";
import { StockForm } from "./stock-form";

const filterCategories: (MedicineCategory | "Semua")[] = [
  "Semua",
  "Obat Generik",
  "Obat Program",
  "Obat Emergensi",
  "BMHP / Alkes",
  "Vaksin & Serum",
];

const filterStatuses = ["Semua", "Tersedia", "Menipis", "Kosong"] as const;

export default function AdminStokPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [activeStatus, setActiveStatus] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const itemsPerPage = 10;

  const summary = useMemo(() => getStockSummary(initialMedicineStock), []);

  const filtered = useMemo(() => {
    return initialMedicineStock
      .filter((item) => activeCategory === "Semua" || item.category === activeCategory)
      .filter((item) => {
        if (activeStatus === "Semua") return true;
        if (activeStatus === "Tersedia") return item.status === "AVAILABLE";
        if (activeStatus === "Menipis") return item.status === "LOW";
        if (activeStatus === "Kosong") return item.status === "EMPTY";
        return true;
      })
      .filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.code.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase())
      );
  }, [search, activeCategory, activeStatus]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

        {/* ── Toolbar Pencarian & Filter ────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Cari nama obat, kode, atau kategori..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border-zinc-800 bg-zinc-900 pl-9 focus-visible:ring-brand-500 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kategori</p>
              <div className="flex flex-wrap gap-2">
                {filterCategories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                          : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status Stok</p>
              <div className="flex flex-wrap gap-2">
                {filterStatuses.map((status) => {
                  const isActive = activeStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setActiveStatus(status);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                          : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                      )}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabel Stok ──────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
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
                          onClick={() => toast.info("Fitur edit item akan segera hadir")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                          onClick={() => toast.info("Fitur hapus item akan segera hadir")}
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

      <StockForm open={isImportOpen} onOpenChange={setIsImportOpen} />
    </AdminShell>
  );
}
