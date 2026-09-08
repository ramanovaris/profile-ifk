"use client";

import { useState, useMemo } from "react";
import { Search, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { 
  initialMedicineStock, 
  getStockSummary, 
  type MedicineCategory 
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

const filterCategories: (MedicineCategory | "Semua")[] = [
  "Semua",
  "Obat Generik",
  "Obat Program",
  "Obat Emergensi",
  "BMHP / Alkes",
  "Vaksin & Serum",
];

const filterStatuses = ["Semua", "Tersedia", "Menipis", "Kosong"] as const;

export default function StokPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [activeStatus, setActiveStatus] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
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
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Ketersediaan Obat" }]}
        eyebrow="Informasi Publik"
        title={<>Ketersediaan Obat &amp; BMHP</>}
        subtitle="Informasi ketersediaan stok fisik perbekalan farmasi pada Instalasi Farmasi Kabupaten Kotabaru per akhir bulan."
      />

      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="section-container">
          {/* ── Metrik Ringkas ─────────────────────────────────────────────── */}
          <Reveal>
            <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="mb-2 flex justify-center text-zinc-500">
                  <Package className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{summary.totalItems}</p>
                <p className="mt-1 text-sm font-medium text-muted">Total Item</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="mb-2 flex justify-center text-emerald-500">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-emerald-600">{summary.availableItems}</p>
                <p className="mt-1 text-sm font-medium text-emerald-700">Tersedia</p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="mb-2 flex justify-center text-amber-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-amber-600">{summary.lowItems}</p>
                <p className="mt-1 text-sm font-medium text-amber-700">Menipis</p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="mb-2 flex justify-center text-rose-500">
                  <XCircle className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-rose-600">{summary.emptyItems}</p>
                <p className="mt-1 text-sm font-medium text-rose-700">Kosong</p>
              </div>
            </div>
          </Reveal>

          {/* ── Search & Filter ─────────────────────────────────────────────── */}
          <Reveal>
            <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
                <Input
                  placeholder="Cari nama obat, kode, atau kategori..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-border pl-9 focus:border-brand-600"
                />
              </div>
              
              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Kategori</p>
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
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            isActive
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-border bg-transparent text-muted hover:border-brand-300 hover:text-foreground"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Status Stok</p>
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
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            isActive
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-border bg-transparent text-muted hover:border-brand-300 hover:text-foreground"
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
          </Reveal>

          {/* ── Tabel Stok ──────────────────────────────────────────────────── */}
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-zinc-50/50">
                      <th className="px-4 py-3 font-semibold text-muted">No</th>
                      <th className="px-4 py-3 font-semibold text-muted">Kode / Nama Obat</th>
                      <th className="hidden px-4 py-3 font-semibold text-muted md:table-cell">Kategori</th>
                      <th className="px-4 py-3 font-semibold text-muted">Satuan</th>
                      <th className="px-4 py-3 font-semibold text-muted">Stok</th>
                      <th className="px-4 py-3 font-semibold text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedItems.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-zinc-50/50">
                        <td className="px-4 py-3 text-muted">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="text-xs text-muted">{item.code}</div>
                        </td>
                        <td className="hidden px-4 py-3 text-muted md:table-cell">{item.category}</td>
                        <td className="px-4 py-3 text-muted">{item.unit}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{item.quantity.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                              item.status === "AVAILABLE" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
                              item.status === "LOW" && "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
                              item.status === "EMPTY" && "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
                            )}
                          >
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              item.status === "AVAILABLE" && "bg-emerald-500",
                              item.status === "LOW" && "bg-amber-500",
                              item.status === "EMPTY" && "bg-rose-500"
                            )} />
                            {item.status === "AVAILABLE" && "Tersedia"}
                            {item.status === "LOW" && "Menipis"}
                            {item.status === "EMPTY" && "Kosong"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ──────────────────────────────────────────────── */}
              {filtered.length > itemsPerPage && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-border bg-zinc-50/30 px-4 py-3 sm:flex-row">
                  <p className="text-sm text-muted">
                    Menampilkan <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(currentPage * itemsPerPage, filtered.length)}
                    </span>{" "}
                    dari <span className="font-medium text-foreground">{filtered.length}</span> item
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm text-muted">
                      Hal {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {filtered.length === 0 && (
              <div className="mt-12 text-center">
                <Package className="mx-auto h-12 w-12 text-zinc-300" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">Tidak ada data ditemukan</h3>
                <p className="mt-1 text-sm text-muted">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
