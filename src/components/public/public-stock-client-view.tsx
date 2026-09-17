"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { PublicStockFilter } from "@/components/public/public-stock-filter";
import {
  getStockSummary,
  type MedicineStockItem,
  type MedicineCategory,
  type StockStatus,
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface PublicStockClientViewProps {
  initialItems: MedicineStockItem[];
}

export function PublicStockClientView({ initialItems }: PublicStockClientViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Helper untuk memperbarui URL query parameter secara terpusat & konsisten tanpa lonjakan scroll
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
      const trimmed = search.trim();
      if (currentQ !== trimmed) {
        updateUrl({ q: trimmed || null, page: null });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, searchParams, updateUrl]);

  const summary = useMemo(() => getStockSummary(initialItems), [initialItems]);

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
      count: initialItems.filter((i) => i.category === cat).length,
    }));
  }, [initialItems]);

  const statusOptions = useMemo(() => [
    {
      value: "AVAILABLE",
      label: "Tersedia",
      indicatorColor: "bg-emerald-500",
      count: summary.availableItems,
    },
    {
      value: "LOW",
      label: "Menipis",
      indicatorColor: "bg-amber-500",
      count: summary.lowItems,
    },
    {
      value: "EMPTY",
      label: "Kosong",
      indicatorColor: "bg-rose-500",
      count: summary.emptyItems,
    },
  ], [summary]);

  const filtered = useMemo(() => {
    return initialItems
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
  }, [initialItems, search, selectedCategories, selectedStatuses]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status kartu aktif
  const isAllActive = selectedStatuses.length === 0;
  const isAvailableActive = selectedStatuses.includes("AVAILABLE");
  const isLowActive = selectedStatuses.includes("LOW");
  const isEmptyActive = selectedStatuses.includes("EMPTY");

  // Handler interaksi kartu ringkasan
  const handleCardStatusClick = (statusKey?: StockStatus) => {
    if (!statusKey) {
      // Total Perbekalan: reset filter status
      updateUrl({ status: null, page: null });
    } else {
      // Toggle jika sedang aktif
      if (selectedStatuses.length === 1 && selectedStatuses[0] === statusKey) {
        updateUrl({ status: null, page: null });
      } else {
        updateUrl({ status: statusKey, page: null });
      }
    }
  };

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
                    Stok Fisik Terverifikasi (Basis Data Terintegrasi)
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Data Terverifikasi Petugas Farmasi
              </div>
            </div>
          </Reveal>

          {/* ── Kartu Metrik Ringkasan Interaktif ─────────────────── */}
          <Reveal delay={60}>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {/* Total Item */}
              <button
                type="button"
                onClick={() => handleCardStatusClick()}
                aria-pressed={isAllActive}
                className={cn(
                  "group relative w-full text-left rounded-2xl border p-5 shadow-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
                  isAllActive
                    ? "border-brand-500/60 bg-brand-500/10 ring-2 ring-brand-500/30"
                    : "border-border bg-surface-alt/50 hover:border-brand-500/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted">
                    <Package className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-medium">Total Perbekalan</span>
                  </div>
                  {isAllActive && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                      Aktif
                    </span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-heading">
                  {summary.totalItems}
                </p>
                <p className="mt-1 text-xs text-muted">Item Obat &amp; Alkes</p>
              </button>

              {/* Stok Aman */}
              <button
                type="button"
                onClick={() => handleCardStatusClick("AVAILABLE")}
                aria-pressed={isAvailableActive}
                className={cn(
                  "group relative w-full text-left rounded-2xl border p-5 shadow-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
                  isAvailableActive
                    ? "border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30"
                    : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Stok Aman</span>
                  </div>
                  {isAvailableActive && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-800">
                  {summary.availableItems}
                </p>
                <p className="mt-1 text-xs text-emerald-700/80">Kondisi cukup untuk faskes</p>
              </button>

              {/* Stok Menipis */}
              <button
                type="button"
                onClick={() => handleCardStatusClick("LOW")}
                aria-pressed={isLowActive}
                className={cn(
                  "group relative w-full text-left rounded-2xl border p-5 shadow-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
                  isLowActive
                    ? "border-amber-500/60 bg-amber-500/15 ring-2 ring-amber-500/30"
                    : "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-medium">Stok Menipis</span>
                  </div>
                  {isLowActive && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Aktif
                    </span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-amber-800">
                  {summary.lowItems}
                </p>
                <p className="mt-1 text-xs text-amber-700/80">Di bawah batas buffer</p>
              </button>

              {/* Stok Kosong */}
              <button
                type="button"
                onClick={() => handleCardStatusClick("EMPTY")}
                aria-pressed={isEmptyActive}
                className={cn(
                  "group relative w-full text-left rounded-2xl border p-5 shadow-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
                  isEmptyActive
                    ? "border-rose-500/60 bg-rose-500/15 ring-2 ring-rose-500/30"
                    : "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 hover:bg-rose-500/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-700">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Stok Kosong</span>
                  </div>
                  {isEmptyActive && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Aktif
                    </span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-rose-800">
                  {summary.emptyItems}
                </p>
                <p className="mt-1 text-xs text-rose-700/80">Dalam proses pengadaan</p>
              </button>
            </div>
          </Reveal>

          {/* ── Toolbar Pencarian & Filter ─────────────────────────── */}
          <Reveal delay={100} className="relative z-30">
            <div className="relative z-30 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-surface-alt/60 p-3.5 sm:p-4 backdrop-blur-md">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  placeholder="Cari nama obat (contoh: Paracetamol, Amoxicillin, Infus)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm text-heading placeholder:text-muted outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Filter Dropdowns (Kategori & Status) */}
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <PublicStockFilter
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

                <PublicStockFilter
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
          </Reveal>

          {/* ── Tabel Ketersediaan Obat ────────────────────────────── */}
          <Reveal delay={140} className="relative z-10">
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
                    Tidak ada perbekalan farmasi yang cocok dengan kriteria pencarian dan filter aktif.
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
                          updateUrl({ page: null });
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
                      onClick={() =>
                        updateUrl({
                          page: currentPage > 2 ? String(currentPage - 1) : null,
                        })
                      }
                      disabled={currentPage <= 1}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-heading transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Sebelumnya
                    </button>
                    <span className="font-mono text-xs text-muted">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        updateUrl({
                          page: String(currentPage + 1),
                        })
                      }
                      disabled={currentPage >= totalPages}
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
