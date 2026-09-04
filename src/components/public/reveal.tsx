"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** delay ms sebelum animasi berjalan (untuk stagger) */
  delay?: number;
}

/**
 * Wrapper scroll-reveal via IntersectionObserver.
 * CSS-driven: hanya animasi opacity/transform/filter (GPU-safe).
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
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

    // Fallback: kalau IO tidak support atau gagal, tampilkan setelah 1.5s
    const fallback = window.setTimeout(() => el.classList.add("is-visible"), 1500);

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
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(el);
    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

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
