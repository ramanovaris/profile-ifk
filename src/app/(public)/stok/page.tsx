"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { Input } from "@/components/ui/input";
import {
  initialMedicineStock,
  getStockSummary,
  type MedicineCategory,
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

export default function StokPublikPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [activeStatus, setActiveStatus] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

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
      .filter((item) => {
        const query = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      });
  }, [search, activeCategory, activeStatus]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Stok Obat" }]}
        eyebrow="Transparansi Publik"
        title={<>Ketersediaan Stok Obat &amp; BMHP</>}
        subtitle="Informasi transparansi ketersediaan stok fisik perbekalan farmasi pada UPTD Instalasi Farmasi Kab. Kotabaru per akhir bulan."
      />

      <section className="border-t border-border bg-surface py-16 md:py-24">
        <div className="section-container">
          {/* ── Info Bar Pembaruan Cut-off ──────────────────────────── */}
          <Reveal>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-alt/70 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Periode Data Stok
                  </p>
                  <p className="text-sm font-medium text-heading">
                    Stok Fisik Per 31 Agustus 2026 (Cut-off Bulanan)
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Data Terverifikasi Petugas Farmasi
              </div>
            </div>
          </Reveal>

          {/* ── Kartu Metrik Ringkasan ─────────────────────────────── */}
          <Reveal delay={60}>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-surface-alt/50 p-5 shadow-xs transition-all duration-300 hover:border-brand-500/30">
                <div className="flex items-center gap-2 text-muted">
                  <Package className="h-4 w-4 text-brand-600" />
                  <span className="text-xs font-medium">Total Perbekalan</span>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-heading">
                  {summary.totalItems}
                </p>
                <p className="mt-1 text-xs text-muted">Item Obat &amp; Alkes</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Stok Aman</span>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-800">
                  {summary.availableItems}
                </p>
                <p className="mt-1 text-xs text-emerald-700/80">Kondisi cukup untuk faskes</p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-medium">Stok Menipis</span>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-amber-800">
                  {summary.lowItems}
                </p>
                <p className="mt-1 text-xs text-amber-700/80">Di bawah batas buffer</p>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-rose-700">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Stok Kosong</span>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-rose-800">
                  {summary.emptyItems}
                </p>
                <p className="mt-1 text-xs text-rose-700/80">Dalam proses pengadaan</p>
              </div>
            </div>
          </Reveal>

          {/* ── Toolbar Pencarian & Filter ─────────────────────────── */}
          <Reveal delay={100}>
            <div className="mt-10 rounded-2xl border border-border bg-surface-alt/60 p-5 backdrop-blur-md">
              <div className="relative max-w-lg">
                <Search
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.5}
                />
                <Input
                  placeholder="Cari nama obat (contoh: Paracetamol, Amoxicillin, Infus)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-border bg-surface pl-10 text-sm text-heading placeholder:text-muted focus:border-brand-600"
                />
              </div>

              <div className="mt-5 space-y-3.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="min-w-[80px] text-xs font-semibold uppercase tracking-wider text-muted">
                    Kategori:
                  </span>
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
                            "cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-300",
                            isActive
                              ? "bg-zinc-950 text-white shadow-xs"
                              : "bg-surface text-muted hover:bg-zinc-200/70 hover:text-heading"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="min-w-[80px] text-xs font-semibold uppercase tracking-wider text-muted">
                    Status:
                  </span>
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
                            "cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-300",
                            isActive
                              ? "bg-zinc-950 text-white shadow-xs"
                              : "bg-surface text-muted hover:bg-zinc-200/70 hover:text-heading"
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

          {/* ── Tabel Ketersediaan Obat ────────────────────────────── */}
          <Reveal delay={140}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[768px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-alt/70 text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-5 py-3.5 w-16">No</th>
                      <th className="px-5 py-3.5">Nama Obat / Barang</th>
                      <th className="px-5 py-3.5">Kategori</th>
                      <th className="px-5 py-3.5">Satuan</th>
                      <th className="px-5 py-3.5 text-right">Stok Fisik</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="transition-colors duration-150 hover:bg-surface-alt/40"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-muted">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-heading">{item.name}</div>
                          <div className="font-mono text-xs text-muted">{item.code}</div>
                        </td>
                        <td className="px-5 py-3.5 text-muted">{item.category}</td>
                        <td className="px-5 py-3.5 text-muted">{item.unit}</td>
                        <td className="px-5 py-3.5 text-right font-mono font-semibold text-heading">
                          {item.quantity.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                              item.status === "AVAILABLE" &&
                                "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
                              item.status === "LOW" &&
                                "border border-amber-500/20 bg-amber-500/10 text-amber-700",
                              item.status === "EMPTY" &&
                                "border border-rose-500/20 bg-rose-500/10 text-rose-700"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                item.status === "AVAILABLE" && "bg-emerald-500",
                                item.status === "LOW" && "bg-amber-500",
                                item.status === "EMPTY" && "bg-rose-500"
                              )}
                            />
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

              {/* ── Empty State ────────────────────────────────────── */}
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted/50" />
                  <p className="mt-3 text-base font-semibold text-heading">
                    Item tidak ditemukan
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Tidak ada obat atau BMHP yang cocok dengan kata kunci &quot;{search}&quot;.
                  </p>
                </div>
              )}

              {/* ── Pagination Controls ────────────────────────────── */}
              {filtered.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-border bg-surface-alt/40 px-5 py-4 sm:flex-row">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>
                      Menampilkan{" "}
                      <strong className="text-heading">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </strong>{" "}
                      -{" "}
                      <strong className="text-heading">
                        {Math.min(currentPage * itemsPerPage, filtered.length)}
                      </strong>{" "}
                      dari <strong className="text-heading">{filtered.length}</strong> item
                    </span>
                    <span>•</span>
                    <label className="flex items-center gap-1.5">
                      <span>Baris:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-heading focus:outline-none"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-heading transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Sebelumnya
                    </button>
                    <span className="font-mono text-xs text-muted">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-heading transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Selanjutnya
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
