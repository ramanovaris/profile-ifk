"use client";

import React, { useEffect } from "react";
import { Plus, Minus, RotateCcw, Compass } from "lucide-react";
import { BuildingLayout, RackCoordinates } from "@/lib/warehouse-map-data";
import { useSvgPanZoom } from "@/lib/use-svg-pan-zoom";

interface WarehouseSvgMapProps {
  layout: BuildingLayout;
  activeRackId?: string | null;
  onSelectRack: (rack: RackCoordinates) => void;
  rackItemCounts?: Record<string, number>;
  className?: string;
}

export function WarehouseSvgMap({
  layout,
  activeRackId,
  onSelectRack,
  rackItemCounts = {},
  className = "",
}: WarehouseSvgMapProps) {
  const {
    containerRef,
    transform,
    isTransitioning,
    reset,
    zoomIn,
    zoomOut,
    focusOnTarget,
    bind,
  } = useSvgPanZoom({
    layout,
    initialScale: 1.0,
    minScale: 0.5,
    maxScale: 3.5,
  });

  // Saat activeRackId berubah, auto-pan dan fokus ke koordinat rak target
  useEffect(() => {
    if (!activeRackId) return;
    const target = layout.racks.find((r) => r.id === activeRackId);
    if (target) {
      focusOnTarget(target.centerX, target.centerY, 1.85);
    }
  }, [activeRackId, layout.racks, focusOnTarget]);

  return (
    <div
      ref={containerRef}
      {...bind}
      className={`relative w-full h-full overflow-hidden bg-slate-100/80 dark:bg-zinc-950 cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-lg">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            zoomIn();
          }}
          title="Perbesar Denah"
          className="p-2 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            zoomOut();
          }}
          title="Perkecil Denah"
          className="p-2 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200 dark:bg-zinc-800 my-0.5" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            reset();
          }}
          title="Reset Posisi Kamera"
          className="p-2 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Arah Mata Angin Kompas */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-sm text-xs font-semibold text-slate-600 dark:text-zinc-300 pointer-events-none">
        <Compass className="w-4 h-4 text-[#455a26] dark:text-[#6e903c]" />
        <span>U</span>
      </div>

      {/* SVG Canvas Container with CSS Matrix Translation */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          transition: isTransitioning ? "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          width: `${layout.width}px`,
          height: `${layout.height}px`,
        }}
        className="will-change-transform pointer-events-auto"
      >
        <svg
          viewBox={layout.viewBox}
          width={layout.width}
          height={layout.height}
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Grid Background Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-200/60 dark:text-zinc-800/40"
              />
            </pattern>

            {/* Amber Glow Filter untuk Rak Terpilih */}
            <filter id="active-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Lantai & Dinding Utama Gedung */}
          <rect
            x="20"
            y="20"
            width={layout.width - 40}
            height={layout.height - 40}
            rx="20"
            fill="url(#grid)"
            className="fill-white dark:fill-zinc-900 stroke-slate-300 dark:stroke-zinc-700 stroke-[3]"
          />

          {/* Area Lorong & Koridor */}
          {layout.corridors.map((c) => (
            <g key={c.id}>
              <rect
                x={c.x}
                y={c.y}
                width={c.width}
                height={c.height}
                rx="12"
                className="fill-slate-50/80 dark:fill-zinc-800/30 stroke-dashed stroke-slate-200 dark:stroke-zinc-800 stroke-[1.5]"
              />
              <text
                x={c.x + 16}
                y={c.y + 24}
                className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-bold uppercase tracking-wider"
              >
                {c.name}
              </text>
            </g>
          ))}

          {/* Pintu Masuk / Akses Bongkar Muat */}
          <g>
            <rect
              x={layout.entrance.x - 70}
              y={layout.entrance.y - 12}
              width="140"
              height="24"
              rx="6"
              className="fill-slate-800 dark:fill-zinc-700"
            />
            <text
              x={layout.entrance.x}
              y={layout.entrance.y + 4}
              textAnchor="middle"
              className="fill-white text-[11px] font-bold"
            >
              🚪 {layout.entrance.label}
            </text>
          </g>

          {/* Baris Rak-Rak Fisik */}
          {layout.racks.map((rack) => {
            const isActive = activeRackId === rack.id;
            const isDimmed = activeRackId && !isActive;
            const itemCount = rackItemCounts[rack.id] ?? 0;

            return (
              <g
                key={rack.id}
                id={rack.svgElementId}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRack(rack);
                }}
                className={`cursor-pointer transition-all duration-200 ${
                  isDimmed ? "opacity-35" : "opacity-100"
                }`}
              >
                {/* Balok Rak Utama */}
                <rect
                  x={rack.x}
                  y={rack.y}
                  width={rack.width}
                  height={rack.height}
                  rx="10"
                  filter={isActive ? "url(#active-glow)" : undefined}
                  className={`transition-all duration-200 ${
                    isActive
                      ? "fill-amber-400 dark:fill-amber-500 stroke-amber-600 dark:stroke-amber-400 stroke-[3] animate-pulse"
                      : "fill-slate-100 dark:fill-zinc-800 hover:fill-slate-200 dark:hover:fill-zinc-700 stroke-slate-300 dark:stroke-zinc-600 stroke-[1.5]"
                  }`}
                />

                {/* Sekat Garis Tingkat Ambalan di dalam Rak */}
                {Array.from({ length: rack.totalLevels - 1 }).map((_, idx) => {
                  const step = rack.width / rack.totalLevels;
                  const lineX = rack.x + (idx + 1) * step;
                  return (
                    <line
                      key={idx}
                      x1={lineX}
                      y1={rack.y + 6}
                      x2={lineX}
                      y2={rack.y + rack.height - 6}
                      className={
                        isActive
                          ? "stroke-amber-600/40 stroke-[1]"
                          : "stroke-slate-300/80 dark:stroke-zinc-700 stroke-[1]"
                      }
                    />
                  );
                })}

                {/* Label Kode Rak */}
                <text
                  x={rack.centerX}
                  y={rack.centerY + 4}
                  textAnchor="middle"
                  className={`text-[13px] font-black tracking-wide ${
                    isActive
                      ? "fill-amber-950 font-extrabold"
                      : "fill-slate-800 dark:fill-zinc-100 font-bold"
                  }`}
                >
                  {rack.rackCode}
                </text>

                {/* Badge Jumlah Item Terpetakan */}
                {itemCount > 0 && (
                  <g>
                    <circle
                      cx={rack.x + rack.width - 10}
                      cy={rack.y + 10}
                      r="9"
                      className={
                        isActive
                          ? "fill-amber-900 text-white"
                          : "fill-[#455a26] dark:fill-[#6e903c]"
                      }
                    />
                    <text
                      x={rack.x + rack.width - 10}
                      y={rack.y + 13}
                      textAnchor="middle"
                      className="fill-white text-[9px] font-bold"
                    >
                      {itemCount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
