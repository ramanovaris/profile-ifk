"use client";

import React, { useState, useEffect, useMemo, useRef, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  RefreshCw,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import { WarehouseSvgMap } from "@/components/warehouse/warehouse-svg-map";
import { WarehouseSearchBox } from "@/components/warehouse/warehouse-search-box";
import { WarehouseBottomDrawer, DrawerDetailData } from "@/components/warehouse/warehouse-bottom-drawer";
import { BUILDING_LAYOUTS, BuildingLayout, RackCoordinates } from "@/lib/warehouse-map-data";
import { getWarehouseMapDataAction, SearchableWarehouseItem } from "@/actions/warehouse";

export function MapClientView() {
  const searchParams = useSearchParams();
  const paramBuilding = searchParams.get("building")?.toUpperCase() as "SJ" | "TD" | "KT" | null;
  const paramRack = searchParams.get("rack");
  const paramLevel = searchParams.get("level");
  const paramItem = searchParams.get("item");

  const initialBuilding = (paramBuilding && ["SJ", "TD", "KT"].includes(paramBuilding))
    ? paramBuilding
    : "SJ";

  const initialRack = paramRack
    ? BUILDING_LAYOUTS[initialBuilding]?.racks.find((r) => r.id === paramRack) || null
    : null;

  const [activeBuildingId, setActiveBuildingId] = useState<"SJ" | "TD" | "KT">(initialBuilding);
  const [activeRackId, setActiveRackId] = useState<string | null>(paramRack || null);
  const [activePlacementData, setActivePlacementData] = useState<DrawerDetailData | null>(() => {
    if (!initialRack) return null;
    return {
      itemName: paramItem || undefined,
      buildingName: BUILDING_LAYOUTS[initialBuilding]?.name || "Gedung IFK",
      rackId: initialRack.id,
      rackName: initialRack.name,
      corridor: initialRack.corridor || "Area Penyimpanan",
      levelCode: paramLevel || "T1",
      locationCode: `${initialRack.id}-${paramLevel || "T1"}`,
      totalLevels: initialRack.totalLevels || 5,
    };
  });
  const [isPending, startTransition] = useTransition();

  const hasAutoSelectedRef = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke kontainer denah di mobile view agar denah tidak terhalang header
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      if (window.innerWidth < 768 && mapContainerRef.current) {
        const mainEl = mapContainerRef.current.closest("main");
        if (mainEl) {
          mainEl.scrollTo({
            top: Math.max(0, mapContainerRef.current.offsetTop - 12),
            behavior: "smooth",
          });
        } else {
          mapContainerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [paramRack]);

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

  // Efek auto-select ketika membuka halaman denah dari tautan "Lihat di Denah"
  useEffect(() => {
    if (hasAutoSelectedRef.current) return;
    if (!paramRack || serverMapData.racks.length === 0) return;

    const rack = activeLayout.racks.find((r: RackCoordinates) => r.id === paramRack);
    if (!rack) return;

    // Cari placement yang cocok dengan level atau nama item
    const matchedPlacement =
      serverMapData.placements.find(
        (p) =>
          p.rackId === paramRack &&
          (!paramLevel || p.levelCode === paramLevel) &&
          (!paramItem || p.item.name.toLowerCase().includes(paramItem.toLowerCase()))
      ) ||
      serverMapData.placements.find(
        (p) => p.rackId === paramRack && (!paramLevel || p.levelCode === paramLevel)
      ) ||
      serverMapData.placements.find((p) => p.rackId === paramRack);

    const itemsInSameRack = serverMapData.placements
      .filter((p) => p.rackId === paramRack && (!matchedPlacement || p.item.id !== matchedPlacement.item.id))
      .map((p) => ({
        name: p.item.name,
        levelCode: p.levelCode,
        unit: p.item.unit,
      }));

    const timer = setTimeout(() => {
      setActiveRackId(paramRack);
      setActivePlacementData({
        itemName: matchedPlacement ? matchedPlacement.item.name : (paramItem || undefined),
        itemCode: matchedPlacement ? matchedPlacement.item.code : undefined,
        itemUnit: matchedPlacement ? matchedPlacement.item.unit : undefined,
        itemCategory: matchedPlacement ? matchedPlacement.item.category : undefined,
        buildingName: activeLayout.name,
        rackId: rack.id,
        rackName: rack.name,
        corridor: rack.corridor || "Area Penyimpanan",
        levelCode: paramLevel || matchedPlacement?.levelCode || "T1",
        locationCode: matchedPlacement?.locationCode || `${rack.id}-${paramLevel || "T1"}`,
        totalLevels: rack.totalLevels || 5,
        notes: matchedPlacement?.notes || "Posisi rak fisik",
        itemsOnSameRack: itemsInSameRack,
      });
      hasAutoSelectedRef.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [paramRack, paramLevel, paramItem, serverMapData, activeLayout]);

  // Hitung jumlah item per rak untuk badge di denah SVG
  const rackItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of serverMapData.placements) {
      counts[p.rackId] = (counts[p.rackId] || 0) + 1;
    }
    return counts;
  }, [serverMapData.placements]);

  // Saat item dipilih dari search box denah
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

    const rack = activeLayout.racks.find((r: RackCoordinates) => r.id === selectedPlacement.rackId);

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

  // ponytail: Auto-scroll mobile ke kontainer denah; upgrade to fullscreen mode jika staf minta sembunyikan topbar.
  return (
    <div
      ref={mapContainerRef}
      className="relative flex flex-col h-[calc(100dvh-5.5rem)] min-h-[550px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm scroll-mt-3"
    >
      {/* Top Controls Toolbar */}
      <div className="z-30 p-3 sm:p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 flex flex-col gap-3">
        {/* Row 1: Back to Search List Button, Building Selector Tabs & Nav Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/gudang"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              title="Kembali ke Daftar Obat"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Daftar Obat</span>
            </Link>

            {/* Building Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800">
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
              <span className="hidden sm:inline">Kelola Rak</span>
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
