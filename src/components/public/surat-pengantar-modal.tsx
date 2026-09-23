"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  FileText,
  X,
  Building2,
  Info,
  ExternalLink,
} from "lucide-react";
import { getAssetUrl } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function SuratPengantarModalButton() {
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

  const imageUrl = getAssetUrl("/images/contoh-surat-pengantar.jpg");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 active:scale-[0.98] cursor-pointer"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>Lihat Contoh Surat</span>
      </button>

      {isOpen && isClient && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Contoh Surat Pengantar Puskesmas"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in-0 duration-150"
        >
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative z-10 flex w-full max-w-xl flex-col max-h-[92vh] rounded-2xl border border-border bg-white shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 shadow-xs">
                  <Building2 className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-heading sm:text-lg">
                    Contoh Surat Pengantar Puskesmas
                  </h3>
                  <p className="text-xs text-muted">
                    Format tata naskah dinas resmi pengajuan perbekalan farmasi
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Petunjuk Singkat */}
              <div className="flex items-start gap-3 rounded-xl border border-brand-200/70 bg-brand-50/50 p-3.5 text-xs sm:text-sm text-brand-900">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-brand-700" />
                <p className="text-xs text-brand-800 leading-relaxed">
                  Contoh surat pengantar resmi dari UPTD Puskesmas ke Kepala Dinas Kesehatan Kab. Kotabaru Cq. Kepala UPTD Instalasi Farmasi untuk permohonan penyaluran perbekalan farmasi.
                </p>
              </div>

              {/* Tampilan Gambar Contoh Surat */}
              <div className="overflow-hidden rounded-xl border border-border bg-zinc-50 p-2 sm:p-4 flex items-center justify-center shadow-2xs">
                <Image
                  src={imageUrl}
                  alt="Contoh Surat Pengantar Puskesmas"
                  width={533}
                  height={647}
                  unoptimized
                  className="h-auto max-h-[58vh] w-auto max-w-full rounded border border-border/80 shadow-xs object-contain"
                />
              </div>
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
