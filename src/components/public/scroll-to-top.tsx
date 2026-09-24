"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Tampilkan tombol saat pengguna menggulir melebihi 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className={cn(
        "group fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full",
        "border border-slate-200/80 bg-white/85 text-slate-600 shadow-md backdrop-blur-md",
        "transition-all duration-300 ease-out",
        "hover:border-emerald-300 hover:bg-white hover:text-emerald-700 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-95",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
