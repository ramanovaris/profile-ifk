"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

// ── Toast Types ──────────────────────────────────────────────────────────────
type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}

// ── Observer Store ───────────────────────────────────────────────────────────
type Listener = () => void;
let toasts: ToastItem[] = [];
let listeners: Listener[] = [];
let idCounter = 0;

function emitChange() {
  for (const l of listeners) l();
}

function subscribe(listener: Listener) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

function addToast(variant: ToastVariant, title: string, message?: string): string {
  const id = `toast-${++idCounter}`;
  toasts = [...toasts, { id, variant, title, message }];
  emitChange();
  return id;
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

// ── Public API ───────────────────────────────────────────────────────────────
export const toast = {
  success: (message: string, title?: string) =>
    addToast("success", title ?? "Berhasil", message),
  error: (message: string, title?: string) =>
    addToast("error", title ?? "Gagal", message),
  info: (message: string, title?: string) =>
    addToast("info", title ?? "Informasi", message),
  warning: (message: string, title?: string) =>
    addToast("warning", title ?? "Peringatan", message),
  dismiss: dismissToast,
};

// ── Variant Config ───────────────────────────────────────────────────────────
const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; border: string; text: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    border: "border-rose-500/20",
    text: "text-rose-400",
    iconColor: "text-rose-400",
  },
  info: {
    icon: Info,
    border: "border-brand-500/20",
    text: "text-brand-400",
    iconColor: "text-brand-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/20",
    text: "text-amber-400",
    iconColor: "text-amber-400",
  },
};

// ── Single Toast Item ────────────────────────────────────────────────────────
function ToastCard({ item }: { item: ToastItem }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cfg = variantConfig[item.variant];
  const Icon = cfg.icon;

  // mount animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // auto-dismiss 3.5s
  useEffect(() => {
    timerRef.current = setTimeout(() => handleDismiss(), 3500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => dismissToast(item.id), 300);
  }, [item.id]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        pointer-events-auto w-full rounded-xl p-3.5
        shadow-2xl shadow-black/60 backdrop-blur-xl
        bg-zinc-900/95 border ${cfg.border}
        transition-all duration-300 ease-out
        ${visible && !exiting ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconColor}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${cfg.text}`}>{item.title}</p>
          {item.message && (
            <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">{item.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Viewport (install once in AdminShell) ────────────────────────────────────
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>(() => getSnapshot());

  useEffect(() => {
    return subscribe(() => setItems(getSnapshot()));
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-label="Notifikasi"
      className="
        fixed z-50 flex flex-col gap-2.5
        pointer-events-none
        bottom-4 inset-x-4
        sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-sm sm:w-full
      "
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
