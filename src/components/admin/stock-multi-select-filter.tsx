"use client";

import { useState, useRef, useEffect, useId } from "react";
import { SlidersHorizontal, ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  indicatorColor?: string; // e.g., 'bg-emerald-400'
}

export interface FilterFooterAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "danger" | "default";
  disabled?: boolean;
}

export interface FilterHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface StockMultiSelectFilterProps {
  title: string; // e.g. "Kategori" or "Status"
  allLabel?: string; // e.g. "Semua Kategori"
  options: FilterOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  enableSearch?: boolean;
  className?: string;
  singleSelect?: boolean;
  icon?: React.ReactNode;
  align?: "right" | "left" | "full-mobile";
  footerAction?: FilterFooterAction;
  createAction?: FilterHeaderAction;
}

export function StockMultiSelectFilter({
  title,
  allLabel = "Semua",
  options,
  selectedValues,
  onChange,
  enableSearch = false,
  className = "",
  singleSelect = false,
  icon,
  align = "right",
  footerAction,
  createAction,
}: StockMultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const safeActiveIndex =
    activeIndex >= 0 && activeIndex < filteredOptions.length ? activeIndex : -1;

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  const openDropdown = () => {
    setIsOpen(true);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && enableSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, enableSearch]);

  const handleToggleOption = (val: string) => {
    if (singleSelect) {
      onChange([val]);
      closeDropdown();
      triggerRef.current?.focus();
      return;
    }
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    const allVals = filteredOptions.map((o) => o.value);
    const merged = Array.from(new Set([...selectedValues, ...allVals]));
    onChange(merged);
  };

  const handleResetFilter = () => {
    onChange([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeDropdown();
        triggerRef.current?.focus();
        break;

      case "ArrowDown":
        e.preventDefault();
        if (filteredOptions.length === 0) return;
        setActiveIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        if (filteredOptions.length === 0) return;
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
      case " ":
        if (safeActiveIndex >= 0 && filteredOptions[safeActiveIndex]) {
          e.preventDefault();
          handleToggleOption(filteredOptions[safeActiveIndex].value);
        }
        break;
    }
  };

  const renderTriggerLabel = () => {
    const count = selectedValues.length;
    if (count === 0) {
      return <span className="truncate text-zinc-300">{allLabel}</span>;
    }
    if (count === 1) {
      const found = options.find((o) => o.value === selectedValues[0]);
      return (
        <span className="truncate font-medium text-white">
          {found ? found.label : selectedValues[0]}
        </span>
      );
    }
    return (
      <span className="truncate font-medium text-white">
        {count} {title}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full sm:w-auto ${isOpen ? "z-50" : ""} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`inline-flex h-9.5 w-full items-center justify-between gap-2.5 rounded-lg border bg-zinc-950/60 px-3.5 text-xs text-white outline-none transition-all hover:border-white/10 hover:bg-zinc-900/60 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:w-auto sm:min-w-[170px] ${
          selectedValues.length > 0
            ? "border-brand-500/30 bg-brand-500/5 text-brand-300"
            : "border-white/5"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon ? (
            icon
          ) : (
            <SlidersHorizontal
              className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                selectedValues.length > 0 ? "text-brand-400" : "text-zinc-400"
              }`}
            />
          )}
          {renderTriggerLabel()}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!singleSelect && selectedValues.length > 0 && (
            <span className="inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-500/20 px-1.5 text-[10px] font-semibold text-brand-300">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          role="listbox"
          id={listboxId}
          aria-multiselectable={!singleSelect}
          className={cn(
            "absolute top-full z-50 mt-1.5 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95",
            align === "full-mobile"
              ? "left-0 right-0 w-full sm:left-auto sm:right-0 sm:w-72 origin-top sm:origin-top-right"
              : align === "left"
              ? "left-0 w-72 max-w-[calc(100vw-2rem)] origin-top-left"
              : "right-0 w-72 max-w-[calc(100vw-2rem)] origin-top-right"
          )}
        >
          {/* Mini Search Input if enabled */}
          {enableSearch && (
            <div className="relative mb-2 flex items-center">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={`Cari ${title.toLowerCase()}...`}
                className="w-full rounded-md border border-white/5 bg-zinc-950/70 py-1.5 pl-8 pr-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40"
              />
            </div>
          )}

          {/* Quick Actions Bar (Hanya tampil untuk multi-select) */}
          {!singleSelect && (
            <div className="mb-1.5 flex items-center justify-between border-b border-white/5 px-1 pb-1.5 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="cursor-pointer text-[11px] font-medium text-brand-400 transition-colors hover:text-brand-300"
              >
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                disabled={selectedValues.length === 0}
                className="cursor-pointer text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Create / Add Action (e.g. + Buka Periode Baru) */}
          {createAction && (
            <div className="mb-1.5 pb-1 border-b border-white/5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeDropdown();
                  createAction.onClick();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors cursor-pointer border border-emerald-500/20"
              >
                {createAction.icon ? (
                  <span className="shrink-0">{createAction.icon}</span>
                ) : (
                  <span className="shrink-0 text-emerald-400 text-sm font-bold leading-none">+</span>
                )}
                <span className="truncate">{createAction.label}</span>
              </button>
            </div>
          )}

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-56 space-y-0.5 overflow-y-auto pr-0.5 scrollbar-thin"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500">
                Pilihan tidak ditemukan
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = selectedValues.includes(opt.value);
                const isHighlighted = safeActiveIndex === index;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggleOption(opt.value)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isHighlighted
                        ? "bg-white/10 text-white"
                        : isSelected
                        ? "bg-brand-500/10 text-brand-200"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* Checkbox / Radio Icon */}
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
                          singleSelect ? "rounded-full" : "rounded"
                        } ${
                          isSelected
                            ? "border-brand-500 bg-brand-600 text-white"
                            : "border-zinc-700 bg-zinc-950/50"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>

                      {/* Optional Indicator Dot */}
                      {opt.indicatorColor && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${opt.indicatorColor}`}
                        />
                      )}

                      <span className="truncate">{opt.label}</span>
                    </div>

                    {/* Count Badge */}
                    {opt.count !== undefined && (
                      <span className="ml-2 shrink-0 rounded-full bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                        {opt.count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {footerAction && (
            <div className="mt-1 border-t border-white/5 p-1">
              <button
                type="button"
                disabled={footerAction.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  closeDropdown();
                  footerAction.onClick();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  footerAction.variant === "danger"
                    ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white",
                  footerAction.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {footerAction.icon && (
                  <span className="shrink-0">{footerAction.icon}</span>
                )}
                <span className="truncate">{footerAction.label}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
