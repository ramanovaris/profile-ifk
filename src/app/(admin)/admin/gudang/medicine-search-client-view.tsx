"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Map,
  LayoutGrid,
  SlidersHorizontal,
  Package,
  X,
} from "lucide-react";
import { matchMedicineSearch } from "@/lib/medicine-search";

export interface PlacementWithDetails {
  id: string;
  levelCode: string;
  locationCode: string;
  notes: string | null;
  item: {
    id: string;
    code: string;
    name: string;
    unit: string;
    category: string | null;
  };
  rack: {
    id: string;
    rackCode: string;
    name: string;
    corridor: string | null;
    warehouse: {
      id: string;
      name: string;
    };
  };
}

interface MedicineSearchClientViewProps {
  initialPlacements: PlacementWithDetails[];
}

export function MedicineSearchClientView({
  initialPlacements,
}: MedicineSearchClientViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");

  const buildings = [
    { id: "ALL", label: "Semua Gedung" },
    { id: "SJ", label: "Saijaan (SJ)" },
    { id: "TD", label: "Todak (TD)" },
    { id: "KT", label: "Kantor (KT)" },
  ];

  // Hitung jumlah posisi per gedung
  const buildingCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialPlacements.length, SJ: 0, TD: 0, KT: 0 };
    for (const p of initialPlacements) {
      const bId = p.rack.warehouse.id.toUpperCase();
      if (counts[bId] !== undefined) {
        counts[bId]++;
      }
    }
    return counts;
  }, [initialPlacements]);

  // Filter daftar obat berdasarkan input pencarian fonetik cerdas dan tab gedung
  const filteredPlacements = useMemo(() => {
    const q = searchQuery.trim();

    return initialPlacements.filter((p) => {
      // 1. Filter gedung
      if (selectedBuilding !== "ALL" && p.rack.warehouse.id.toUpperCase() !== selectedBuilding) {
        return false;
      }

      // 2. Filter teks pencarian (mendukung fonetik, sinonim farmasi, & nama/kode)
      if (!q) return true;

      // Pencocokan cerdas obat (Paracetamol <=> Parasetamol, dll)
      const matchedByMedicineLogic = matchMedicineSearch(
        {
          name: p.item.name,
          code: p.item.code,
          category: p.item.category || undefined,
        },
        q
      );

      if (matchedByMedicineLogic) return true;

      // Tambahan pencocokan terhadap kode lokasi rak / ambalan / nama rak
      const qLower = q.toLowerCase();
      if (
        p.locationCode.toLowerCase().includes(qLower) ||
        p.rack.name.toLowerCase().includes(qLower) ||
        p.rack.rackCode.toLowerCase().includes(qLower) ||
        (p.rack.corridor && p.rack.corridor.toLowerCase().includes(qLower)) ||
        (p.notes && p.notes.toLowerCase().includes(qLower))
      ) {
        return true;
      }

      return false;
    });
  }, [initialPlacements, searchQuery, selectedBuilding]);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#455a26]/10 text-[#455a26] dark:text-[#6e903c] border border-[#455a26]/20">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Katalog Lokasi Obat & Perbekalan Kesehatan
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cari nama sediaan untuk mengetahui posisi rak, lorong, dan ambalan fisik di gudang.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/gudang/peta"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#455a26] hover:bg-[#384a1e] text-white transition-all shadow-sm active:scale-95"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Buka Peta Denah 2D</span>
          </Link>
          <Link
            href="/admin/gudang/editor"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Editor Denah</span>
            <span className="sm:hidden">Editor</span>
          </Link>
          <Link
            href="/admin/gudang/kelola"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#455a26] dark:text-[#6e903c]" />
            <span className="hidden sm:inline">Kelola Rak</span>
            <span className="sm:hidden">Kelola</span>
          </Link>
        </div>
      </div>

      {/* Instant Search Bar & Building Filter Tabs */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        {/* Large Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik nama obat, alkes, atau kode barang (contoh: Paracetamol, Amoxicillin, Infus)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#455a26] transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              title="Bersihkan Pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Building Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-1">
          {buildings.map((b) => {
            const isSelected = selectedBuilding === b.id;
            const count = buildingCounts[b.id] ?? 0;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBuilding(b.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#455a26] text-white shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{b.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-black/20 text-white"
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Menampilkan <span className="font-bold text-slate-900 dark:text-white">{filteredPlacements.length}</span> posisi obat terpetakan
          {searchQuery ? ` untuk "${searchQuery}"` : ""}
        </p>
      </div>

      {/* Content: Mobile Cards + Desktop Table */}
      {filteredPlacements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-3">
            <Search className="h-6 w-6 stroke-[1.75]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Tidak Ada Lokasi Obat yang Cocok
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mb-4">
            Tidak ditemukan penempatan obat dengan kata kunci &quot;{searchQuery}&quot;. Periksa ejaan atau tambahkan barang fisik baru di menu Kelola Rak.
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 transition-colors"
            >
              Reset Kata Kunci
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card List (sm:hidden) */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filteredPlacements.map((plc) => (
              <div
                key={plc.id}
                className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
              >
                {/* Header Card: Nama & Badge Lokasi */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                      {plc.item.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {plc.item.code} • {plc.item.unit}
                      {plc.item.category ? ` • ${plc.item.category}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#455a26] text-white shadow-sm">
                    {plc.locationCode}
                  </span>
                </div>

                {/* Info Detail Lokasi */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gedung & Rak</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block truncate">
                      {plc.rack.warehouse.name}
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px] block truncate">
                      {plc.rack.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tingkat Ambalan</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                      Tingkat {plc.levelCode.replace("T", "")} ({plc.levelCode})
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px] block truncate">
                      {plc.notes || "Posisi standar"}
                    </span>
                  </div>
                </div>

                {/* Tombol Lihat di Denah */}
                <Link
                  href={`/admin/gudang/peta?building=${plc.rack.warehouse.id}&rack=${plc.rack.id}&level=${plc.levelCode}&item=${encodeURIComponent(
                    plc.item.name
                  )}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-[#455a26] hover:bg-[#384a1e] text-white shadow-sm transition-all active:scale-[0.98]"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lihat Lokasi di Denah 2D</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3.5">Kode Barang</th>
                    <th className="p-3.5">Nama Obat / Alkes</th>
                    <th className="p-3.5">Kategori & Satuan</th>
                    <th className="p-3.5">Gedung & Rak</th>
                    <th className="p-3.5">Lokasi Ambalan</th>
                    <th className="p-3.5">Catatan Posisi</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredPlacements.map((plc) => (
                    <tr
                      key={plc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-mono text-slate-500 dark:text-zinc-400 font-medium">
                        {plc.item.code}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {plc.item.name}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-zinc-300">
                        <span className="font-medium">{plc.item.unit}</span>
                        {plc.item.category && (
                          <span className="block text-[11px] text-slate-400">{plc.item.category}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-zinc-300">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">
                          {plc.rack.warehouse.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {plc.rack.name} ({plc.rack.rackCode})
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#455a26] text-white shadow-sm">
                          {plc.locationCode}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                          Tingkat {plc.levelCode.replace("T", "")}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-zinc-400 text-xs">
                        {plc.notes || "-"}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/admin/gudang/peta?building=${plc.rack.warehouse.id}&rack=${plc.rack.id}&level=${plc.levelCode}&item=${encodeURIComponent(
                            plc.item.name
                          )}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#455a26] hover:bg-[#384a1e] text-white shadow-sm transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Lihat di Denah</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
