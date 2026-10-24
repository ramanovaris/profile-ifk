"use client";

import React from "react";
import { Layers } from "lucide-react";

interface RackTierVisualizerProps {
  totalLevels: number;
  activeLevel?: string | null; // e.g. "T2"
  onSelectLevel?: (level: string) => void;
  className?: string;
}

export function RackTierVisualizer({
  totalLevels = 5,
  activeLevel,
  onSelectLevel,
  className = "",
}: RackTierVisualizerProps) {
  // Ambalan dari atas ke bawah: TN ... T1
  const levels = Array.from({ length: totalLevels }, (_, i) => {
    const num = totalLevels - i;
    return `T${num}`;
  });

  return (
    <div className={`flex flex-col gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 ${className}`}>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium pb-1 border-b border-slate-200/60 dark:border-zinc-800">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          Tingkat Ambalan Fisik
        </span>
        <span className="text-[11px] font-mono">
          {activeLevel ? `Posisi: ${activeLevel}` : "Pilih tingkat"}
        </span>
      </div>

      <div className="flex flex-col gap-1 pt-1">
        {levels.map((lvl) => {
          const isActive = activeLevel?.toUpperCase() === lvl.toUpperCase();
          const levelNumber = lvl.replace("T", "");

          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onSelectLevel?.(lvl)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all duration-150 ${
                isActive
                  ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/50 scale-[1.01]"
                  : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                  }`}
                >
                  {levelNumber}
                </span>
                <span>Tingkat {levelNumber}</span>
              </div>

              {isActive ? (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Target Obat
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                  Ambalan {lvl}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 px-1 pt-0.5">
        <span>▲ Atas</span>
        <span>▼ Dasar / Lantai</span>
      </div>
    </div>
  );
}
