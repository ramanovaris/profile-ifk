"use client";

import { useState, useRef, useEffect, useId } from "react";
import { SlidersHorizontal, ChevronDown, Search, Check } from "lucide-react";

export interface CategoryFilterItem {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CategoryMultiSelectFilterProps {
  categories: CategoryFilterItem[];
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
  getArticleCount?: (categoryName: string) => number;
  className?: string;
}

export function CategoryMultiSelectFilter({
  categories,
  selectedCategories,
  onChange,
  getArticleCount,
  className = "",
}: CategoryMultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Hanya kategori aktif yang dapat difilter
  const activeCategories = categories.filter((c) => c.status === "ACTIVE");

  // Kategori yang difilter oleh input pencarian mini internal
  const filteredCategories = activeCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const safeActiveIndex =
    activeIndex >= 0 && activeIndex < filteredCategories.length
      ? activeIndex
      : -1;

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

  // Click outside to close
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

  // Focus input search saat dropdown dibuka
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto scroll item yang sedang aktif di keyboard navigation
  useEffect(() => {
    if (safeActiveIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[safeActiveIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [safeActiveIndex]);

  const handleToggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      onChange(selectedCategories.filter((name) => name !== categoryName));
    } else {
      onChange([...selectedCategories, categoryName]);
    }
  };

  const handleSelectAll = () => {
    const allActiveNames = filteredCategories.map((c) => c.name);
    const merged = Array.from(
      new Set([...selectedCategories, ...allActiveNames])
    );
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
        if (filteredCategories.length === 0) return;
        setActiveIndex((prev) =>
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        if (filteredCategories.length === 0) return;
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCategories.length - 1
        );
        break;

      case "Enter":
      case " ":
        if (safeActiveIndex >= 0 && filteredCategories[safeActiveIndex]) {
          e.preventDefault();
          handleToggleCategory(filteredCategories[safeActiveIndex].name);
        }
        break;
    }
  };

  // Label tampilan trigger button
  const renderTriggerLabel = () => {
    const count = selectedCategories.length;
    if (count === 0) {
      return (
        <span className="truncate text-zinc-300">Semua Kategori</span>
      );
    }
    if (count === 1) {
      return (
        <span className="truncate font-medium text-white">
          {selectedCategories[0]}
        </span>
      );
    }
    return (
      <span className="truncate font-medium text-white">
        {count} Kategori
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full sm:w-auto ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`inline-flex h-9.5 w-full items-center justify-between gap-2.5 rounded-lg border bg-zinc-950/60 px-3.5 text-xs text-white outline-none transition-all hover:border-white/10 hover:bg-zinc-900/60 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:w-auto sm:min-w-[210px] ${
          selectedCategories.length > 0
            ? "border-brand-500/30 bg-brand-500/5 text-brand-300"
            : "border-white/5"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <SlidersHorizontal
            className={`h-3.5 w-3.5 shrink-0 transition-colors ${
              selectedCategories.length > 0
                ? "text-brand-400"
                : "text-zinc-400"
            }`}
          />
          {renderTriggerLabel()}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedCategories.length > 0 && (
            <span className="inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-500/20 px-1.5 text-[10px] font-semibold text-brand-300">
              {selectedCategories.length}
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
          aria-multiselectable="true"
          className="absolute right-0 top-full z-50 mt-1.5 w-72 max-w-[calc(100vw-2rem)] origin-top-right rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
          {/* Mini Search Input */}
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
              placeholder="Cari kategori..."
              className="w-full rounded-md border border-white/5 bg-zinc-950/70 py-1.5 pl-8 pr-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40"
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="mb-1.5 flex items-center justify-between border-b border-white/5 px-1 pb-1.5 text-xs">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-medium text-brand-400 transition-colors hover:text-brand-300"
            >
              Pilih Semua
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              disabled={selectedCategories.length === 0}
              className="text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset Filter
            </button>
          </div>

          {/* Category List */}
          <div
            ref={listRef}
            className="max-h-56 space-y-0.5 overflow-y-auto pr-0.5 scrollbar-thin"
          >
            {filteredCategories.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500">
                Kategori tidak ditemukan
              </div>
            ) : (
              filteredCategories.map((cat, index) => {
                const isSelected = selectedCategories.includes(cat.name);
                const isHighlighted = safeActiveIndex === index;
                const count = getArticleCount
                  ? getArticleCount(cat.name)
                  : undefined;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggleCategory(cat.name)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isHighlighted
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? "border-brand-500 bg-brand-500 text-zinc-950"
                            : "border-white/20 bg-zinc-950/60"
                        }`}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 stroke-[3]" />
                        )}
                      </div>
                      <span
                        className={`truncate font-medium ${
                          isSelected ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </div>

                    {count !== undefined && (
                      <span className="shrink-0 text-[11px] text-zinc-500">
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
