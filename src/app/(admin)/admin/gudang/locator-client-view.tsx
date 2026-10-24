"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { Building2, SlidersHorizontal, Compass, Layers, MapPin, RefreshCw, LayoutGrid } from "lucide-react";
import { WarehouseSvgMap } from "@/components/warehouse/warehouse-svg-map";
import { WarehouseSearchBox } from "@/components/warehouse/warehouse-search-box";
import { WarehouseBottomDrawer, DrawerDetailData } from "@/components/warehouse/warehouse-bottom-drawer";
import { BUILDING_LAYOUTS, RackCoordinates } from "@/lib/warehouse-map-data";
import { getWarehouseMapDataAction, SearchableWarehouseItem } from "@/actions/warehouse";

interface LocatorClientViewProps {
  initialBuildingId?: "SJ" | "TD" | "KT";
}

export function LocatorClientView({
  initialBuildingId = "SJ",
}: LocatorClientViewProps) {
  const [activeBuildingId, setActiveBuildingId] = useState<"SJ" | "TD" | "KT">(initialBuildingId);
  const [activeRackId, setActiveRackId] = useState<string | null>(null);
  const [activePlacementData, setActivePlacementData] = useState<DrawerDetailData | null>(null);
  const [isPending, startTransition] = useTransition();

  // Data pemetaan rak dan item dari server
  const [serverMapData, setServerMapData] = useState<{
    layout?: BuildingLayout;
    racks: Array<{ id: string; name: string; totalLevels: number; placementsCount: number }>;
    placements: Array<{
      id: string;
      rackId: string;
      levelCode: string;
      locationCode: string;
      notes: string | null;
      item: { id: string; code: string; name: string; unit: string; category: string | null };
    }>;
  }>({ racks: [], placements: [] });

  const activeLayout = serverMapData.layout || BUILDING_LAYOUTS[activeBuildingId];

  // Fetch data gedung saat activeBuildingId berubah
  useEffect(() => {
    startTransition(async () => {
      const res = await getWarehouseMapDataAction(activeBuildingId);
      if (res.success && res.data) {
        setServerMapData({
          layout: res.data.layout,
          racks: res.data.racks,
          placements: res.data.placements,
        });
      }
    });
  }, [activeBuildingId]);

  // Hitung jumlah item per rak untuk badge di denah SVG
  const rackItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of serverMapData.placements) {
      counts[p.rackId] = (counts[p.rackId] || 0) + 1;
    }
    return counts;
  }, [serverMapData.placements]);

  // Saat item dipilih dari search box
  const handleSelectItemFromSearch = (
    item: SearchableWarehouseItem,
    selectedPlacement: SearchableWarehouseItem["placements"][0]
  ) => {
    const buildingKey = selectedPlacement.buildingId.toUpperCase() as "SJ" | "TD" | "KT";

    // Ganti gedung jika item berada di gedung lain
    if (buildingKey !== activeBuildingId && BUILDING_LAYOUTS[buildingKey]) {
      setActiveBuildingId(buildingKey);
    }

    setActiveRackId(selectedPlacement.rackId);

    // Cari barang lain di rak yang sama
    const itemsInSameRack = serverMapData.placements
      .filter((p) => p.rackId === selectedPlacement.rackId && p.item.id !== item.id)
      .map((p) => ({
        name: p.item.name,
        levelCode: p.levelCode,
        unit: p.item.unit,
      }));

    const rack = activeLayout.racks.find((r) => r.id === selectedPlacement.rackId);

    setActivePlacementData({
      itemName: item.name,
      itemCode: item.code,
      itemUnit: item.unit,
      itemCategory: item.category,
      buildingName: selectedPlacement.buildingName,
      rackId: selectedPlacement.rackId,
      rackName: selectedPlacement.rackName,
      corridor: rack?.corridor || "Area Penyimpanan",
      levelCode: selectedPlacement.levelCode,
      locationCode: selectedPlacement.locationCode,
      totalLevels: rack?.totalLevels || 5,
      notes: selectedPlacement.notes,
      itemsOnSameRack: itemsInSameRack,
    });
  };

  // Saat balok rak diklik di denah SVG
  const handleSelectRackOnMap = (rack: RackCoordinates) => {
    setActiveRackId(rack.id);

    // Ambil seluruh barang di rak ini
    const rackPlacements = serverMapData.placements.filter((p) => p.rackId === rack.id);

    const firstItem = rackPlacements[0];
    const otherItems = rackPlacements.slice(1).map((p) => ({
      name: p.item.name,
      levelCode: p.levelCode,
      unit: p.item.unit,
    }));

    setActivePlacementData({
      itemName: firstItem ? firstItem.item.name : undefined,
      itemCode: firstItem ? firstItem.item.code : undefined,
      itemUnit: firstItem ? firstItem.item.unit : undefined,
      itemCategory: firstItem ? firstItem.item.category : undefined,
      buildingName: activeLayout.name,
      rackId: rack.id,
      rackName: rack.name,
      corridor: rack.corridor,
      levelCode: firstItem ? firstItem.levelCode : "T1",
      locationCode: firstItem ? firstItem.locationCode : `${rack.id}-T1`,
      totalLevels: rack.totalLevels,
      notes: firstItem?.notes || "Ketuk ambalan untuk melihat daftar barang",
      itemsOnSameRack: otherItems,
    });
  };

  const buildings: Array<{ id: "SJ" | "TD" | "KT"; label: string; desc: string }> = [
    { id: "SJ", label: "Saijaan (SJ)", desc: "Obat Tablet & Cair" },
    { id: "TD", label: "Todak (TD)", desc: "Alkes & Cairan Infus" },
    { id: "KT", label: "Kantor (KT)", desc: "Vaksin & Cold Chain" },
  ];

  return (
    <div className="relative flex flex-col h-[calc(100dvh-5.5rem)] min-h-[550px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      {/* Top Controls Toolbar */}
      <div className="z-30 p-3 sm:p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 flex flex-col gap-3">
        {/* Row 1: Building Selector Tabs & Manage Button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800">
            {buildings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setActiveBuildingId(b.id);
                  setActiveRackId(null);
                  setActivePlacementData(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeBuildingId === b.id
                    ? "bg-[#455a26] text-white shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/gudang/editor"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#455a26] hover:bg-[#384a1e] text-white transition-colors shadow-sm"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor Denah</span>
              <span className="sm:hidden">Edit</span>
            </Link>
            <Link
              href="/admin/gudang/kelola"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#455a26] dark:text-[#6e903c]" />
              <span className="hidden sm:inline">Kelola Rak & Ambalan</span>
              <span className="sm:hidden">Kelola</span>
            </Link>
          </div>
        </div>

        {/* Row 2: Instant Search Autocomplete Bar */}
        <div className="w-full">
          <WarehouseSearchBox
            onSelectItem={handleSelectItemFromSearch}
            placeholder="Cari obat / alkes di denah (contoh: paracetamol, amox, infus, spuit)..."
          />
        </div>
      </div>

      {/* SVG Canvas Workspace Area */}
      <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
        <WarehouseSvgMap
          layout={activeLayout}
          activeRackId={activeRackId}
          onSelectRack={handleSelectRackOnMap}
          rackItemCounts={rackItemCounts}
          className="w-full h-full"
        />

        {/* Loading Indicator Overlay */}
        {isPending && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-md border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#455a26]" />
            Memuat layout denah...
          </div>
        )}
      </div>

      {/* Bottom Drawer Detail Modal */}
      <WarehouseBottomDrawer
        data={activePlacementData}
        onClose={() => {
          setActivePlacementData(null);
          setActiveRackId(null);
        }}
        onSelectLevel={(level) => {
          if (activePlacementData) {
            setActivePlacementData({
              ...activePlacementData,
              levelCode: level,
              locationCode: `${activePlacementData.rackId}-${level}`,
            });
          }
        }}
      />
    </div>
  );
}
