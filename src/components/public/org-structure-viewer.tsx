"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Maximize2,
  Download,
  ImageIcon,
} from "lucide-react";

interface OrgStructureViewerProps {
  src: string;
  alt?: string;
}

// ponytail: Native fullscreen lightbox with zoom (1x-4x) and pan drag. Upgrade to multi-touch pinch gesture if needed.
export function OrgStructureViewer({
  src,
  alt = "Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru",
}: OrgStructureViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    dragMovedRef.current = false;
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
    dragMovedRef.current = false;
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || scale <= 1) return;
    dragMovedRef.current = true;
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

      {/* Google Drive Style Lightbox Preview (Portaled to document.body) */}
      {isOpen && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Bagan Struktur Organisasi"
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in-0 duration-150 select-none"
        >
          {/* Top Header Bar (Google Drive Style) */}
          <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-white/10 px-3 sm:px-6 bg-zinc-950/80 backdrop-blur-md z-20">
            {/* Left: Close button (X) + File icon + Title */}
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 pr-2">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup pratinjau"
                title="Tutup (Esc)"
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded bg-rose-600 text-white shadow-sm">
                <ImageIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>

              <span className="truncate text-xs sm:text-base font-medium text-white max-w-[140px] sm:max-w-sm md:max-w-md">
                Struktur-Organisasi-IFK.jpg
              </span>
            </div>

            {/* Right: Zoom Controls, Reset, and Download */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom In / Out Controls */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5 sm:p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={scale <= 1}
                  aria-label="Perkecil zoom"
                  title="Perkecil (-)"
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <span className="w-11 sm:w-13 text-center text-xs font-mono font-medium text-zinc-300">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={scale >= 4}
                  aria-label="Perbesar zoom"
                  title="Perbesar (+)"
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
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
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              {/* Download Button */}
              <a
                href={src}
                download="Struktur-Organisasi-IFK.jpg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Unduh berkas gambar struktur organisasi"
                title="Unduh berkas gambar"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Center Stage: Photo directly centered in viewport */}
          <div
            className="relative flex-1 w-full overflow-hidden flex items-center justify-center p-3 sm:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget && !dragMovedRef.current) {
                handleClose();
              }
            }}
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
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="max-h-[85vh] max-w-[92vw] w-auto h-auto object-contain shadow-[0_25px_70px_rgba(0,0,0,0.9)] pointer-events-none select-none"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
