"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeSetting = "light" | "dark" | "system";

interface ThemeDropdownProps {
  themeSetting: ThemeSetting;
  onThemeChange: (theme: ThemeSetting) => void;
  className?: string;
}

const themeOptions: {
  value: ThemeSetting;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}[] = [
  {
    value: "light",
    label: "Terang",
    icon: Sun,
    iconClass: "text-amber-500",
  },
  {
    value: "dark",
    label: "Gelap",
    icon: Moon,
    iconClass: "text-brand-400",
  },
  {
    value: "system",
    label: "Sistem",
    icon: Laptop,
    iconClass: "text-sky-400",
  },
];

export function ThemeDropdown({
  themeSetting,
  onThemeChange,
  className,
}: ThemeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeOption =
    themeOptions.find((opt) => opt.value === themeSetting) || themeOptions[0];
  const ActiveIcon = activeOption.icon;

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Pilih mode tema (Terang, Gelap, Sistem)"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-main)] shadow-xs transition-all hover:bg-[var(--admin-hover-bg)] focus:outline-none focus:ring-2 focus:ring-brand-500/40",
          isOpen && "ring-2 ring-brand-500/40"
        )}
      >
        <ActiveIcon className={cn("h-4 w-4 transition-transform duration-200", activeOption.iconClass)} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-50 mt-2 w-36 origin-top-right rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-[var(--admin-muted)]">
            Mode Tema
          </div>
          <div className="flex flex-col gap-0.5">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = themeSetting === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onThemeChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    isSelected
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                      : "text-[var(--admin-text-main)] hover:bg-[var(--admin-hover-bg)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-3.5 w-3.5", option.iconClass)} />
                    <span>{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
