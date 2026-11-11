"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Eye } from "lucide-react";
import { WarehouseCanvasEditor, EditableRackItem } from "@/components/warehouse/warehouse-canvas-editor";
import { saveWarehouseRackLayoutAction } from "@/actions/warehouse";

interface EditorClientViewProps {
  initialBuildings: Array<{
    id: string;
    name: string;
    description: string | null;
    racks: Array<{
      id: string;
      rackCode: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      totalLevels: number;
      corridor: string | null;
    }>;
  }>;
}

export function EditorClientView({ initialBuildings }: EditorClientViewProps) {
  const [activeBuildingId, setActiveBuildingId] = useState<string>("SJ");

  const currentBuilding =
    initialBuildings.find((b) => b.id === activeBuildingId) || initialBuildings[0];

  const editableRacks: EditableRackItem[] = (currentBuilding?.racks || []).map((r) => ({
    id: r.id,
    rackCode: r.rackCode,
    name: r.name,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    rotation: r.rotation,
    totalLevels: r.totalLevels,
    corridor: r.corridor || "Lorong Gudang",
  }));

  const handleSaveLayout = async (updatedRacks: EditableRackItem[]) => {
    const payload = updatedRacks.map((r) => ({
      id: r.id,
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      rotation: r.rotation,
      corridor: r.corridor,
    }));

    const res = await saveWarehouseRackLayoutAction(payload);
    return res.success;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/gudang"
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
            title="Kembali ke Peta Lapangan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#455a26] dark:text-[#6e903c]" />
              Editor Denah Gudang Interaktif (Drag & Drop Canvas)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ubah posisi lorong fisik, geser balok rak, dan sesuaikan ukuran denah secara bebas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/gudang"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-[#455a26]" />
            Pratinjau di HP
          </Link>
        </div>
      </div>

      {/* Building Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 max-w-fit">
        {initialBuildings.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveBuildingId(b.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeBuildingId === b.id
                ? "bg-[#455a26] text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {b.name} ({b.racks.length} Rak)
          </button>
        ))}
      </div>

      {/* Konva Canvas Editor Component */}
      <WarehouseCanvasEditor
        key={activeBuildingId}
        buildingId={activeBuildingId}
        buildingName={currentBuilding?.name || "Gedung IFK"}
        initialRacks={editableRacks}
        canvasWidth={activeBuildingId === "KT" ? 800 : activeBuildingId === "TD" ? 900 : 1000}
        canvasHeight={activeBuildingId === "KT" ? 500 : 650}
        onSaveLayout={handleSaveLayout}
      />
    </div>
  );
}
