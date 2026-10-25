"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Search, X, Loader2, MapPin, Package } from "lucide-react";
import { searchWarehouseItemsAction, SearchableWarehouseItem } from "@/actions/warehouse";

interface WarehouseSearchBoxProps {
  onSelectItem: (
    item: SearchableWarehouseItem,
    selectedPlacement: SearchableWarehouseItem["placements"][0]
  ) => void;
  className?: string;
  placeholder?: string;
}

export function WarehouseSearchBox({
  onSelectItem,
  className = "",
  placeholder = "Ketik nama obat / alkes / barcode...",
}: WarehouseSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchableWarehouseItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      if (!trimmed) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      startTransition(async () => {
        const res = await searchWarehouseItemsAction(trimmed);
        if (res.success && res.data) {
          setResults(res.data);
          setIsOpen(true);
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#455a26] focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
        />
        {isSearching ? (
          <Loader2 className="absolute right-3.5 w-4 h-4 text-slate-400 dark:text-zinc-500 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl divide-y divide-slate-100 dark:divide-zinc-800/80 animate-in fade-in-50 slide-in-from-top-1">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">
              Tidak ada barang fisik ditemukan untuk &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item) => (
              <div key={item.id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#455a26] dark:text-[#6e903c] shrink-0" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                    {item.unit}
                  </span>
                </div>

                {item.placements.length === 0 ? (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                    Belum dipetakan ke rak fisik
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.placements.map((plc) => (
                      <button
                        key={plc.id}
                        type="button"
                        onClick={() => {
                          onSelectItem(item, plc);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60 transition-all text-left"
                      >
                        <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>
                          <strong className="font-bold">{plc.locationCode}</strong> ({plc.buildingName})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
