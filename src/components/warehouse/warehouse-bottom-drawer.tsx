"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Package,
  Info,
  Tag,
  CheckCircle2,
  FolderOpen,
  Layers,
} from "lucide-react";
import { RackTierVisualizer } from "./rack-tier-visualizer";
import { TierItemPlacement } from "@/lib/warehouse-multi-item";

export interface DrawerDetailData {
  buildingName: string;
  rackId: string;
  rackName: string;
  corridor: string;
  totalLevels: number;
  activeLevelCode?: string; // e.g. "T2"
  activeItem?: TierItemPlacement;
  itemsByLevel?: Record<string, TierItemPlacement[]>;
  countsByLevel?: Record<string, number>;
  totalItemsCount?: number;
  notes?: string | null;

  // Fallback compatibility
  itemName?: string;
  itemCode?: string;
  itemUnit?: string;
  itemCategory?: string | null;
  levelCode?: string;
  locationCode?: string;
  itemsOnSameRack?: Array<{
    name: string;
    levelCode: string;
    unit: string;
  }>;
}

interface WarehouseBottomDrawerProps {
  data: DrawerDetailData | null;
  onClose: () => void;
  onSelectLevel?: (level: string) => void;
  onSelectItem?: (item: TierItemPlacement) => void;
}

export function WarehouseBottomDrawer({
  data,
  onClose,
  onSelectLevel,
  onSelectItem,
}: WarehouseBottomDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({});

  const currentLevel = data?.activeLevelCode || data?.levelCode || "T1";

  // Auto-buka accordion ambalan aktif saat data atau level aktif berubah
  useEffect(() => {
    if (currentLevel) {
      setOpenLevels((prev) => ({
        ...prev,
        [currentLevel]: true,
      }));
    }
  }, [currentLevel, data?.rackId]);

  if (!data) return null;

  const activeItem = data.activeItem || (data.itemName ? {
    id: "legacy",
    itemId: "legacy",
    itemName: data.itemName,
    itemCode: data.itemCode || "",
    itemUnit: data.itemUnit || "",
    itemCategory: data.itemCategory || null,
    locationCode: data.locationCode || `${data.rackId}-${currentLevel}`,
    levelCode: currentLevel,
    notes: data.notes || null,
    isTarget: true,
  } : undefined);

  const displayLocationCode = activeItem?.locationCode || data.locationCode || `${data.rackId}-${currentLevel}`;
  const displayTitle = activeItem?.itemName || data.itemName || data.rackName;
  const itemsInActiveLevel = data.itemsByLevel?.[currentLevel] || [];

  // Urutan ambalan dari atas ke bawah (TN ... T1)
  const levelKeys = Array.from({ length: data.totalLevels }, (_, i) => {
    const num = data.totalLevels - i;
    return `T${num}`;
  });

  const toggleAccordion = (lvl: string) => {
    setOpenLevels((prev) => ({
      ...prev,
      [lvl]: !prev[lvl],
    }));
  };

  // ponytail: Drawer compact 1 baris toggle statis; upgrade to swipe gesture sheet bila staf butuh drag touch.
  return (
    <aside
      aria-label="Panel Rincian Lokasi Rak Gudang"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out"
    >
      {/* Bar Compact 1 Baris */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm shrink-0">
            <MapPin className="w-3 h-3" />
            {displayLocationCode}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {displayTitle}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
              <span>{data.buildingName} • {data.corridor}</span>
              <span>• Tingkat {currentLevel}</span>
              {itemsInActiveLevel.length > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 font-medium text-slate-600 dark:text-zinc-300">
                  {itemsInActiveLevel.length} jenis obat
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ciutkan</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Detail</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Tutup Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Konten Detail saat Expanded */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-zinc-800 px-4 py-3 max-w-4xl mx-auto max-h-[62vh] overflow-y-auto space-y-4">
          {/* Header Info Item Aktif */}
          {activeItem && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeItem.itemName}
                  </span>
                  {activeItem.isTarget && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Target Obat
                    </span>
                  )}
                </div>
                {activeItem.itemCode && (
                  <span className="font-mono bg-white dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300">
                    {activeItem.itemCode}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 flex-wrap">
                {activeItem.itemUnit && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    Satuan: <strong className="text-slate-800 dark:text-zinc-200">{activeItem.itemUnit}</strong>
                  </span>
                )}
                {activeItem.itemCategory && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Kategori: <strong className="text-slate-800 dark:text-zinc-200">{activeItem.itemCategory}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  Posisi: <strong className="text-slate-800 dark:text-zinc-200">Tingkat {activeItem.levelCode} ({activeItem.locationCode})</strong>
                </span>
              </div>

              {activeItem.notes && (
                <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg p-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{activeItem.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Grid Layout: Visualisator Ambalan & Accordion Daftar Obat */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Visualisator Ambalan (Kiri - 5 kolom) */}
            <div className="md:col-span-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Struktur Rak ({data.totalLevels} Tingkat)</span>
                {data.totalItemsCount !== undefined && (
                  <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">
                    Total: {data.totalItemsCount} Obat
                  </span>
                )}
              </h4>
              <RackTierVisualizer
                totalLevels={data.totalLevels}
                activeLevel={currentLevel}
                itemCountsByLevel={data.countsByLevel}
                onSelectLevel={(lvl) => {
                  onSelectLevel?.(lvl);
                  setOpenLevels((prev) => ({ ...prev, [lvl]: true }));
                }}
              />
            </div>

            {/* Accordion Daftar Obat per Ambalan (Kanan - 7 kolom) */}
            <div className="md:col-span-7 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Daftar Obat per Ambalan Fisik</span>
              </h4>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {levelKeys.map((lvl) => {
                  const items = data.itemsByLevel?.[lvl] || [];
                  const isOpen = Boolean(openLevels[lvl]);
                  const isCurrentActiveTier = currentLevel === lvl;
                  const levelNum = lvl.replace("T", "");

                  return (
                    <div
                      key={lvl}
                      className={`rounded-xl border transition-all ${
                        isCurrentActiveTier
                          ? "border-amber-400/80 dark:border-amber-600/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      {/* Header Accordion */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(lvl)}
                        className="w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              isCurrentActiveTier
                                ? "bg-amber-500 text-white"
                                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                            }`}
                          >
                            {levelNum}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                            Tingkat {levelNum} ({lvl})
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              items.length > 0
                                ? "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700"
                                : "text-slate-400 dark:text-zinc-500"
                            }`}
                          >
                            {items.length > 0 ? `${items.length} Obat` : "Kosong"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          {isCurrentActiveTier && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hidden sm:inline">
                              Ambalan Aktif
                            </span>
                          )}
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Konten Lipatan Obat */}
                      {isOpen && (
                        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                          {items.length === 0 ? (
                            <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 dark:text-zinc-500">
                              Tidak ada obat yang ditempatkan pada ambalan ini
                            </div>
                          ) : (
                            items.map((item) => {
                              const isSelected = activeItem?.itemId === item.itemId;

                              return (
                                <div
                                  key={item.id}
                                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                                    isSelected
                                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-xs"
                                      : "bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                          {item.itemName}
                                        </span>
                                        {item.isTarget && (
                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            Target
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
                                        {item.itemCode && (
                                          <span className="font-mono bg-white dark:bg-zinc-800 px-1 py-0.2 rounded text-[10px] border border-slate-200 dark:border-zinc-700">
                                            {item.itemCode}
                                          </span>
                                        )}
                                        <span>Satuan: {item.itemUnit}</span>
                                        {item.itemCategory && <span>• {item.itemCategory}</span>}
                                      </div>
                                      {item.notes && (
                                        <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-400">
                                          Catatan: {item.notes}
                                        </p>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSelectItem?.(item);
                                        onSelectLevel?.(lvl);
                                      }}
                                      className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                                        isSelected
                                          ? "bg-amber-500 text-white shadow-xs"
                                          : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700"
                                      }`}
                                    >
                                      {isSelected ? "Aktif" : "Pilih"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
