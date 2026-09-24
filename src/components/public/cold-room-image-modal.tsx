"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Snowflake, X, Maximize2, ExternalLink } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function ColdRoomImageModal() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const imageUrl = getAssetUrl("/images/cold-room-ifk.webp");

  return (
    <>
      {/* Interactive Photo Card Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Perbesar foto fisik Cold Room IFK Kotabaru"
        className="group relative w-full h-72 sm:h-80 md:h-full min-h-[280px] md:min-h-[360px] rounded-xl overflow-hidden border border-border shadow-xs bg-zinc-900 cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-brand-500"
      >
        <Image
          src={imageUrl}
          alt="Instalasi Cold Room UPTD Farmasi Kabupaten Kotabaru"
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          unoptimized
          className="object-cover object-center transition-transform duration-500 ease-luxe group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 transition-opacity group-hover:from-black/85" />

        {/* Overlay Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-[11px] font-semibold text-white shadow-xs border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">Cold Room IFK Kotabaru</span>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-zinc-900 shadow-xs group-hover:bg-brand-50 group-hover:text-brand-800 transition-colors">
            <Maximize2 className="h-3 w-3" />
            <span>Perbesar</span>
          </div>
        </div>
      </button>

      {/* Modal Lightbox via createPortal to document.body */}
      {isOpen && isClient && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dokumentasi Fasilitas Cold Room IFK Kotabaru"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in-0 duration-150"
        >
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative z-10 flex w-full max-w-2xl flex-col max-h-[92vh] rounded-2xl border border-border bg-white shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 shadow-xs">
                  <Snowflake className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-heading sm:text-lg">
                    Instalasi Cold Room &amp; Rantai Dingin
                  </h3>
                  <p className="text-xs text-muted">
                    UPTD Instalasi Farmasi Kabupaten Kotabaru • Standar Suhu 2°C – 8°C
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-heading active:scale-95 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-zinc-950/5">
              <div className="w-full overflow-hidden rounded-xl border border-border bg-zinc-950 p-2 sm:p-3 flex items-center justify-center shadow-inner">
                <Image
                  src={imageUrl}
                  alt="Instalasi Cold Room UPTD Farmasi Kabupaten Kotabaru"
                  width={438}
                  height={971}
                  unoptimized
                  className="h-auto max-h-[62vh] w-auto max-w-full rounded border border-white/10 shadow-xs object-contain"
                />
              </div>
              <p className="mt-3 text-center text-xs text-zinc-600 max-w-lg">
                Fasilitas ruang pendingin utama berpintu kedap udara dengan tanjakan akses dan panel otomatis terkalibrasi berkala untuk pengamanan vaksin serta produk biologi.
              </p>
            </div>

            {/* Footer Buttons 50/50 */}
            <div className="shrink-0 border-t border-border bg-surface/50 p-4 sm:px-6">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 active:scale-[0.98]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka Penuh</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-semibold text-heading shadow-xs transition-colors hover:bg-surface active:scale-[0.98] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
