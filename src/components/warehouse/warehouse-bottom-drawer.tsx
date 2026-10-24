"use client";

import React, { useState } from "react";
import { X, ChevronUp, ChevronDown, MapPin, Package, Info, Tag } from "lucide-react";
import { RackTierVisualizer } from "./rack-tier-visualizer";

export interface DrawerDetailData {
  itemName?: string;
  itemCode?: string;
  itemUnit?: string;
  itemCategory?: string | null;
  buildingName: string;
  rackId: string;
  rackName: string;
  corridor: string;
  levelCode?: string; // "T2"
  locationCode?: string; // "SJ-R01-T2"
  totalLevels: number;
  notes?: string | null;
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
}

export function WarehouseBottomDrawer({
  data,
  onClose,
  onSelectLevel,
}: WarehouseBottomDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  return (
    <aside
      aria-label="Panel Rincian Lokasi Rak Gudang"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out"
    >
      {/* Drawer Drag Bar / Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
        >
          <span className="w-8 h-1 rounded-full bg-slate-300 dark:bg-zinc-700 mr-2" />
          {isExpanded ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Ciutkan Detail
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Lihat Ambalan & Barang Sekitar
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Quick Info Bar */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Item & Location Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                <MapPin className="w-3 h-3" />
                {data.locationCode || data.rackId}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {data.buildingName} • {data.corridor}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
              {data.itemName || data.rackName}
            </h3>

            {data.itemName && (
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-zinc-300 flex-wrap">
                {data.itemCode && (
                  <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                    {data.itemCode}
                  </span>
                )}
                {data.itemUnit && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-slate-400" />
                    Satuan: {data.itemUnit}
                  </span>
                )}
                {data.itemCategory && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {data.itemCategory}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Notes */}
          {data.notes && (
            <div className="sm:max-w-xs p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1 font-semibold mb-0.5">
                <Info className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Catatan Posisi:
              </div>
              <p className="line-clamp-2">{data.notes}</p>
            </div>
          )}
        </div>

        {/* Expanded View: Rack Tier Visualizer & Neighbouring items */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto">
            {/* Visualizer Ambalan */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Struktur Ambalan Rak ({data.totalLevels} Tingkat)
              </h4>
              <RackTierVisualizer
                totalLevels={data.totalLevels}
                activeLevel={data.levelCode}
                onSelectLevel={onSelectLevel}
              />
            </div>

            {/* Obat/Alkes Lain di Rak yang Sama */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Barang Lain di Rak Ini
              </h4>
              {!data.itemsOnSameRack || data.itemsOnSameRack.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 dark:text-zinc-500">
                  Tidak ada barang lain terdaftar di baris rak ini
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {data.itemsOnSameRack.map((neighbor, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="font-medium text-slate-800 dark:text-zinc-200 line-clamp-1">
                        {neighbor.name}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                          {neighbor.levelCode}
                        </span>
                        <span className="text-slate-400">{neighbor.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
