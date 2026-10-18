"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArticleShareBarProps {
  title: string;
  slug: string;
  variant?: "compact" | "card";
  className?: string;
}

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useCanNativeShare() {
  return useSyncExternalStore(
    emptySubscribe,
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Gagal menyalin tautan:", err);
    return false;
  }
}

export function ArticleShareBar({
  title,
  slug,
  variant = "compact",
  className,
}: ArticleShareBarProps) {
  const isClient = useIsClient();
  const canNativeShare = useCanNativeShare();
  const [copied, setCopied] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);

  const shareUrl =
    isClient && typeof window !== "undefined"
      ? window.location.href
      : `/berita/${slug}`;

  const shareText = title ? `${title}\n\n${shareUrl}` : shareUrl;

  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText
  )}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(title)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;
  const xHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(title)}`;

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstagramShare = async () => {
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setInstagramCopied(true);
      setTimeout(() => setInstagramCopied(false), 3000);
    }
    if (typeof window !== "undefined") {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url: shareUrl,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Gagal membagikan tautan:", err);
        }
      }
    }
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 pt-4 border-t border-border/60",
          className
        )}
      >
        <span className="text-xs font-medium text-zinc-500 mr-1 select-none">
          Bagikan:
        </span>

        {/* WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-white text-emerald-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 shadow-2xs"
          title="Bagikan ke WhatsApp"
          aria-label="Bagikan ke WhatsApp"
        >
          <WhatsAppIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
        </a>

        {/* Telegram */}
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-white text-sky-500 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 shadow-2xs"
          title="Bagikan ke Telegram"
          aria-label="Bagikan ke Telegram"
        >
          <TelegramIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
        </a>

        {/* Facebook */}
        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-white text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 shadow-2xs"
          title="Bagikan ke Facebook"
          aria-label="Bagikan ke Facebook"
        >
          <FacebookIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
        </a>

        {/* Instagram */}
        <button
          onClick={handleInstagramShare}
          type="button"
          className={cn(
            "group flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shadow-2xs cursor-pointer",
            instagramCopied
              ? "border-pink-500 bg-pink-50 text-pink-700"
              : "border-border/80 bg-white text-pink-600 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700"
          )}
          title={
            instagramCopied
              ? "Tautan tersalin! Membuka Instagram..."
              : "Bagikan ke Instagram"
          }
          aria-label="Bagikan ke Instagram"
        >
          {instagramCopied ? (
            <Check className="h-3.5 w-3.5 text-pink-600" />
          ) : (
            <InstagramIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* X (Twitter) */}
        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-white text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-black shadow-2xs"
          title="Bagikan ke X"
          aria-label="Bagikan ke X"
        >
          <XIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
        </a>

        {/* Salin Tautan */}
        <button
          onClick={handleCopy}
          type="button"
          className={cn(
            "group inline-flex h-8 items-center gap-1.5 px-2.5 rounded-lg border transition-colors text-xs font-medium shadow-2xs cursor-pointer",
            copied
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
              : "border-border/80 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
          )}
          title="Salin Tautan"
          aria-label="Salin Tautan"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-brand-700" />
          )}
          <span>{copied ? "Tersalin!" : "Salin"}</span>
        </button>

        {/* Notifikasi Tautan Tersalin Instagram */}
        {instagramCopied && (
          <span className="text-[11px] font-medium text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md animate-in fade-in">
            Tautan tersalin, membuka Instagram...
          </span>
        )}

        {/* Native Web Share di Ponsel */}
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            type="button"
            className="group inline-flex h-8 items-center gap-1.5 px-2.5 rounded-lg border border-border/80 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 transition-colors text-xs font-medium shadow-2xs cursor-pointer"
            title="Menu Berbagi Lainnya"
            aria-label="Menu Berbagi Lainnya"
          >
            <Share2 className="h-3.5 w-3.5 text-zinc-500 group-hover:text-brand-700" />
            <span>Lainnya</span>
          </button>
        )}
      </div>
    );
  }

  // Varian Card (Callout di akhir artikel)
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-50/50 via-white to-zinc-50/60 p-5 sm:p-7 shadow-xs",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 border border-brand-200/60">
            <Share2 className="h-4 w-4" />
          </span>
          <h3 className="text-base font-bold text-heading">
            Bagikan Informasi Ini
          </h3>
        </div>

        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            type="button"
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium text-xs sm:text-sm hover:bg-brand-700 transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Bagikan Cepat</span>
          </button>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-brand-200/50 flex flex-wrap items-center gap-2.5">
        {/* WhatsApp Chip */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-[38px] items-center gap-2 px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-colors shadow-2xs"
        >
          <WhatsAppIcon className="h-4 w-4 text-emerald-600 transition-transform group-hover:scale-110" />
          <span>WhatsApp</span>
        </a>

        {/* Telegram Chip */}
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-[38px] items-center gap-2 px-3.5 py-1.5 rounded-xl border border-sky-200 bg-sky-50/80 text-sky-800 text-xs font-semibold hover:bg-sky-100 hover:border-sky-300 transition-colors shadow-2xs"
        >
          <TelegramIcon className="h-4 w-4 text-sky-500 transition-transform group-hover:scale-110" />
          <span>Telegram</span>
        </a>

        {/* Facebook Chip */}
        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-[38px] items-center gap-2 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 text-blue-800 text-xs font-semibold hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs"
        >
          <FacebookIcon className="h-4 w-4 text-blue-600 transition-transform group-hover:scale-110" />
          <span>Facebook</span>
        </a>

        {/* Instagram Chip */}
        <button
          onClick={handleInstagramShare}
          type="button"
          className={cn(
            "group inline-flex min-h-[38px] items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs cursor-pointer",
            instagramCopied
              ? "border-pink-300 bg-pink-100 text-pink-900"
              : "border-pink-200 bg-pink-50/80 text-pink-800 hover:bg-pink-100 hover:border-pink-300"
          )}
          title={
            instagramCopied
              ? "Tautan tersalin! Membuka Instagram..."
              : "Bagikan ke Instagram"
          }
          aria-label="Bagikan ke Instagram"
        >
          {instagramCopied ? (
            <Check className="h-4 w-4 text-pink-600" />
          ) : (
            <InstagramIcon className="h-4 w-4 text-pink-600 transition-transform group-hover:scale-110" />
          )}
          <span>{instagramCopied ? "Tautan Tersalin, Buka IG..." : "Instagram"}</span>
        </button>

        {/* X Chip */}
        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-[38px] items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 text-xs font-semibold hover:bg-zinc-100 hover:border-zinc-300 transition-colors shadow-2xs"
        >
          <XIcon className="h-3.5 w-3.5 text-zinc-800 transition-transform group-hover:scale-110" />
          <span>X / Twitter</span>
        </a>

        {/* Salin Tautan Chip */}
        <button
          onClick={handleCopy}
          type="button"
          className={cn(
            "group inline-flex min-h-[38px] items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs cursor-pointer",
            copied
              ? "border-emerald-500 bg-emerald-100 text-emerald-900"
              : "border-zinc-200 bg-white text-zinc-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900"
          )}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-600 group-hover:text-brand-700" />
          )}
          <span>{copied ? "Tautan Tersalin!" : "Salin Tautan"}</span>
        </button>
      </div>
    </div>
  );
}
