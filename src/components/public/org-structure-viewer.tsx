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
        aria-label="Lihat bagan struktur organisasi dalam ukuran penuh"
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
              Klik untuk Layar Penuh &amp; Zoom
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
          Buka Layar Penuh
        </button>
      </p>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan Penuh Bagan Struktur Organisasi"
          className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-xl animate-in fade-in-0 duration-200"
        >
          {/* Header Bar */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
            <div className="min-w-0 pr-4">
              <h3 className="truncate text-sm font-semibold text-white sm:text-base">
                Struktur Organisasi UPTD Instalasi Farmasi
              </h3>
              <p className="hidden text-xs text-zinc-400 sm:block">
                Gunakan tombol zoom (+/-), roda scroll mouse, atau geser (drag) untuk melihat detail.
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={scale <= 1}
                  aria-label="Perkecil zoom"
                  title="Perkecil (-)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="w-14 text-center text-xs font-mono font-medium text-zinc-300">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={scale >= 4}
                  aria-label="Perbesar zoom"
                  title="Perbesar (+)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              {/* Reset Zoom Button */}
              <button
                type="button"
                onClick={handleReset}
                disabled={scale === 1 && position.x === 0 && position.y === 0}
                aria-label="Reset ukuran zoom"
                title="Reset Zoom (0)"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup tampilan penuh"
                title="Tutup (Esc)"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition-colors hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 active:scale-95 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Zoom & Pan Stage */}
          <div
            className="relative flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-6"
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
              className="relative max-h-full max-w-full transition-transform duration-75 select-none"
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
                className="max-h-[82vh] max-w-[95vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
              />
            </div>
          </div>

          {/* Touchscreen Hint Footer */}
          <div className="border-t border-white/5 px-4 py-2.5 text-center text-[11px] text-zinc-500 sm:hidden">
            Ketuk 2x untuk memperbesar • Geser layar saat gambar diperbesar
          </div>
        </div>
      )}
    </>
  );
}
