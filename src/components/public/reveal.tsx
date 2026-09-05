"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** delay ms sebelum animasi berjalan (untuk stagger) */
  delay?: number;
  /** override IntersectionObserver rootMargin (default: "0px 0px -10% 0px") */
  rootMargin?: string;
  /** override IntersectionObserver threshold (default: 0) */
  threshold?: number;
  /** override fallback setTimeout dalam ms (default: 1500) */
  fallbackMs?: number;
}

/**
 * Wrapper scroll-reveal via IntersectionObserver.
 * CSS-driven: hanya animasi opacity/transform/filter (GPU-safe).
 *
 * Props `rootMargin`, `threshold`, `fallbackMs` opsional untuk override
 * per-instance — pakai ketika section tinggi butuh trigger lebih awal
 * atau fallback lebih cepat. Default cocok untuk section pendek.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  rootMargin = "0px 0px -10% 0px",
  threshold = 0,
  fallbackMs = 1500,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Cek preferensi reduced-motion: langsung tampil tanpa animasi
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.classList.add("is-visible");
      return;
    }

    // Fallback: kalau IO tidak support atau gagal, tampilkan setelah fallbackMs
    const fallback = window.setTimeout(() => el.classList.add("is-visible"), fallbackMs);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            window.clearTimeout(fallback);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin }
    );

    io.observe(el);
    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, [rootMargin, threshold, fallbackMs]);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
