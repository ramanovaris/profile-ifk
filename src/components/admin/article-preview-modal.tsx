"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Monitor,
  Smartphone,
  Calendar,
  User,
  Eye,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/public/breadcrumb";

export interface ArticlePreviewData {
  title: string;
  categoryName: string;
  content: string;
  coverPreviewUrl?: string | null;
  authorName?: string;
  isPublished?: boolean;
}

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ArticlePreviewData;
}

export function ArticlePreviewModal({
  isOpen,
  onClose,
  data,
}: ArticlePreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">(
    "desktop"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kunci scroll body saat modal terbuka & pasang handler Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const displayTitle = data.title.trim() || "Judul Artikel Belum Diisi";
  const displayCategory = data.categoryName.trim() || "Umum";
  const displayAuthor = data.authorName || "Administrator";
  const hasContent = !!data.content?.trim();

  const formattedDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-2 backdrop-blur-md sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      {/* Container Dialog */}
      <div className="flex h-full max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        {/* ── Toolbar Header ─────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-400">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="preview-modal-title"
                className="text-sm font-semibold text-white sm:text-base"
              >
                Pratinjau Artikel
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    data.isPublished
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {data.isPublished ? "Status: Publikasi" : "Status: Draf"}
                </span>
                <span className="hidden text-xs text-zinc-400 sm:inline">
                  Simulasi Tampilan Pengunjung
                </span>
              </div>
            </div>
          </div>

          {/* Viewport Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900 p-0.5">
              <button
                type="button"
                onClick={() => setViewportMode("desktop")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewportMode === "desktop"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Tampilan Desktop"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewportMode === "mobile"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Tampilan Mobile (HP 390px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Tutup Pratinjau (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Preview Area ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-zinc-900/50 p-3 sm:p-6">
          <div
            className={`mx-auto transition-all duration-300 ${
              viewportMode === "desktop"
                ? "w-full max-w-3xl"
                : "w-full max-w-[390px] rounded-3xl border border-zinc-800 bg-surface shadow-2xl p-4 sm:p-5 my-2 ring-8 ring-zinc-900/60"
            }`}
          >
            {/* Card Tampilan Artikel Publik */}
            <div
              className={`overflow-hidden rounded-2xl border border-border bg-surface text-heading shadow-md ${
                viewportMode === "mobile" ? "border-0 shadow-none" : ""
              }`}
            >
              {/* Cover Image */}
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-zinc-900">
                {data.coverPreviewUrl ? (
                  <Image
                    src={data.coverPreviewUrl}
                    alt={displayTitle}
                    fill
                    unoptimized
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-500">
                    <FileText className="h-8 w-8 text-zinc-600" />
                    <span className="text-xs">Belum ada gambar sampul</span>
                  </div>
                )}
              </div>

              {/* Konten Artikel */}
              <div className="p-6 sm:p-8">
                {/* Breadcrumb */}
                <Breadcrumb
                  items={[
                    { label: "Beranda", href: "#" },
                    { label: "Berita", href: "#" },
                    { label: displayCategory },
                  ]}
                />

                {/* Badge Kategori */}
                <Badge
                  variant="default"
                  className="mt-4 bg-brand-50 text-brand-700"
                >
                  {displayCategory}
                </Badge>

                {/* Judul Artikel */}
                <h1 className="mt-3 text-xl font-bold tracking-tight text-heading sm:text-2xl md:text-3xl">
                  {displayTitle}
                </h1>

                {/* Metadata Tanggal & Penulis */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate}
                  </span>
                  <span>&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {displayAuthor}
                  </span>
                </div>

                {/* Isi Artikel */}
                <div className="mt-6 border-t border-border pt-6">
                  {hasContent ? (
                    <div
                      className="prose prose-zinc max-w-none text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: data.content }}
                    />
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted">
                      <p className="text-sm italic">
                        Isi berita masih kosong. Tuliskan naskah berita pada editor untuk melihat pratinjau lengkap.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Modal ────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-zinc-900/80 px-4 py-2.5 text-xs text-zinc-400 sm:px-6">
          <span>
            Tekan <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">Esc</kbd> untuk kembali ke editor formulir
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
