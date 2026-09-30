"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalScrollAreaProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  topShadowClassName?: string;
  bottomShadowClassName?: string;
}

export function ModalScrollArea({
  children,
  className,
  containerClassName,
  topShadowClassName,
  bottomShadowClassName,
}: ModalScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 2;
    setCanScrollUp(el.scrollTop > 8);
    setCanScrollDown(hasOverflow && el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    const rafId = requestAnimationFrame(checkScroll);
    const timer = setTimeout(checkScroll, 120);

    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [checkScroll]);

  return (
    <div className={cn("relative flex flex-col flex-1 min-h-0 overflow-hidden", containerClassName)}>
      {/* Top scroll hairline & shadow indicator */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-20 h-5 border-t border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-950/70 to-transparent transition-opacity duration-200",
          topShadowClassName,
          canScrollUp ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn("flex-1 overflow-y-auto overscroll-contain", className)}
      >
        {children}
      </div>

      {/* Bottom scroll shadow & gradient fade */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent transition-opacity duration-200",
          bottomShadowClassName,
          canScrollDown ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
