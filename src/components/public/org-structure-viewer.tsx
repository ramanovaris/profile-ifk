"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from "lucide-react";

interface OrgStructureViewerProps {
  src: string;
  alt?: string;
}

// ponytail: Native fullscreen lightbox with zoom (1x-4x) and pan drag. Upgrade to multi-touch pinch gesture if needed.
export function OrgStructureViewer({
  src,
  alt = "Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru",
}: OrgStructureViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.5).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(2)), 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(Math.max(Number((prev + delta).toFixed(2)), 1), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Abaikan jika pointer capture telah dilepas otomatis
      }
    }
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "+" || e.key === "=") {
        setScale((prev) => Math.min(Number((prev + 0.5).toFixed(2)), 4));
      } else if (e.key === "-" || e.key === "_") {
        setScale((prev) => {
          const next = Math.max(Number((prev - 0.5).toFixed(2)), 1);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      {/* Trigger Card di Halaman Profil */}
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
        className="bezel mx-auto max-w-3xl group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl transition-all"
        aria-label="Lihat bagan struktur organisasi"
      >
        <div className="bezel-inner relative overflow-hidden">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={500}
            unoptimized
            className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center p-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-zinc-900/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
              <Maximize2 className="h-3.5 w-3.5 text-brand-400" />
              Klik untuk Perbesar &amp; Zoom
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {alt} •{" "}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <Maximize2 className="h-3 w-3" />
          Lihat Bagan Penuh
        </button>
      </p>

      {/* Modal Dialog Lightbox (Centered in Viewport) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Modal Bagan Struktur Organisasi"
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200"
        >
          {/* Modal Container Centered */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl border border-white/15 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6 bg-white/[0.02]">
              <div className="min-w-0 pr-3">
                <h3 className="truncate text-sm sm:text-base font-semibold text-white">
                  Bagan Struktur Organisasi
                </h3>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5 sm:p-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={scale <= 1}
                    aria-label="Perkecil zoom"
                    title="Perkecil (-)"
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                  >
                    <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <span className="w-12 sm:w-14 text-center text-xs font-mono font-medium text-zinc-300">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={scale >= 4}
                    aria-label="Perbesar zoom"
                    title="Perbesar (+)"
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                  >
                    <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>

                {/* Reset Zoom Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={scale === 1 && position.x === 0 && position.y === 0}
                  aria-label="Reset ukuran zoom"
                  title="Reset Zoom (0)"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Tutup modal"
                  title="Tutup (Esc)"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition-colors hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 active:scale-95 cursor-pointer ml-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Centered Image Viewport Stage */}
            <div
              className="relative flex-1 min-h-[45vh] max-h-[72vh] overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-zinc-900/30"
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onDoubleClick={handleDoubleClick}
              style={{
                cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                touchAction: scale > 1 ? "none" : "auto",
              }}
            >
              <div
                className="relative flex items-center justify-center transition-transform duration-75 select-none"
                style={{
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                  transformOrigin: "center center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg shadow-xl pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Modal Footer Info */}
            <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[11px] text-zinc-400 bg-white/[0.01]">
              <span className="truncate max-w-[240px] sm:max-w-md">{alt}</span>
              <span className="hidden sm:inline text-zinc-500">
                Klik ganda / roda mouse untuk zoom • Geser saat di-zoom • Esc untuk tutup
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
