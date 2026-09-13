"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Megaphone, AlertTriangle, Info, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSetting } from "@prisma/client";

interface AnnouncementBannerProps {
  settings?: SiteSetting | null;
}

const emptySubscribe = () => () => {};

export function AnnouncementBanner({ settings }: AnnouncementBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!settings?.announcementEnabled || !settings?.announcementText?.trim()) {
    return null;
  }

  const type = settings.announcementType || "info";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          "group w-full cursor-pointer border-b px-4 py-2 text-xs font-medium shadow-sm backdrop-blur-xl transition-colors",
          type === "important"
            ? "border-rose-500/25 bg-rose-950/85 text-rose-200 hover:bg-rose-900/90"
            : type === "warning"
            ? "border-amber-500/25 bg-amber-950/85 text-amber-200 hover:bg-amber-900/90"
            : "border-sky-500/25 bg-sky-950/85 text-sky-200 hover:bg-sky-900/90"
        )}
      >
        <div className="section-container flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                type === "important"
                  ? "bg-rose-500/30 text-rose-300"
                  : type === "warning"
                  ? "bg-amber-500/30 text-amber-300"
                  : "bg-sky-500/30 text-sky-300"
              )}
            >
              {type === "important" ? (
                <AlertTriangle className="h-3 w-3 shrink-0" />
              ) : type === "warning" ? (
                <Megaphone className="h-3 w-3 shrink-0" />
              ) : (
                <Info className="h-3 w-3 shrink-0" />
              )}
              {type === "important"
                ? "Penting"
                : type === "warning"
                ? "Peringatan"
                : "Info"}
            </span>
            <span className="truncate text-left">{settings.announcementText}</span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-normal opacity-75 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
            <span>Detail</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Modal Dialog Detail Pengumuman */}
      {isOpen &&
        isClient &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                      type === "important"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : type === "warning"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    )}
                  >
                    {type === "important" ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : type === "warning" ? (
                      <Megaphone className="h-3.5 w-3.5" />
                    ) : (
                      <Info className="h-3.5 w-3.5" />
                    )}
                    {type === "important"
                      ? "Pengumuman Penting"
                      : type === "warning"
                      ? "Peringatan / Himbauan"
                      : "Informasi Publik"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Isi Pesan Utuh */}
              <div className="my-5 max-h-[60vh] overflow-y-auto pr-1">
                <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                  {settings.announcementText}
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto rounded-xl border border-white/10 bg-zinc-900 px-5 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
