"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";

import { siteConfig } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/layanan", label: "Layanan" },
  { href: "/berita", label: "Berita" },
  { href: "/kontak", label: "Kontak" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* ── Floating glass pill, detached dari tepi atas ─────────────── */}
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-full border border-black/5 bg-white/70 pl-5 pr-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-heading"
          >
            <Image src="/images/logo-ifk.jpg" alt="Logo IFK Kotabaru" width={28} height={28} unoptimized className="h-7 w-7 rounded-full" />
            <span className="text-sm font-semibold tracking-tight">{siteConfig.shortName}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm transition-all duration-300 ease-luxe",
                    isActive
                      ? "bg-black/5 font-medium text-heading"
                      : "text-muted hover:text-heading"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Desktop CTA Masuk */}
            <Link
              href="/admin/login"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-sm transition-all duration-300 ease-luxe hover:bg-brand-700 active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Masuk</span>
            </Link>
          </nav>

          {/* Mobile Right Controls: Tombol Masuk compact + Hamburger */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition-transform duration-200 active:scale-95"
            >
              <LogIn className="h-3 w-3" strokeWidth={2} />
              <span>Masuk</span>
            </Link>

            {/* Hamburger — dua garis morph ke X */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/5 transition-transform duration-300 ease-luxe active:scale-95"
            >
              <span
                className={cn(
                  "absolute h-px w-4 bg-heading transition-all duration-500 ease-luxe",
                  open ? "rotate-45" : "-translate-y-[3px]"
                )}
              />
              <span
                className={cn(
                  "absolute h-px w-4 bg-heading transition-all duration-500 ease-luxe",
                  open ? "-rotate-45" : "translate-y-[3px]"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ── Fullscreen glass overlay (mobile) + staggered reveal ─────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-center bg-zinc-950/80 px-8 backdrop-blur-3xl transition-all duration-700 ease-luxe md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <nav className="flex flex-col gap-3">
          {navLinks.map((link, i) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
                className={cn(
                  "text-4xl font-bold tracking-tighter transition-all duration-700 ease-luxe",
                  isActive ? "text-brand-400" : "text-white hover:text-brand-400",
                  open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Fullscreen Mobile Menu Login Button */}
          <div
            style={{ transitionDelay: open ? `${120 + navLinks.length * 60}ms` : "0ms" }}
            className={cn(
              "mt-4 pt-2 transition-all duration-700 ease-luxe",
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}
          >
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-lg transition-transform duration-200 active:scale-98"
            >
              <LogIn className="h-4 w-4" strokeWidth={2} />
              <span>Masuk Admin</span>
            </Link>
          </div>
        </nav>
        <p
          style={{ transitionDelay: open ? "520ms" : "0ms" }}
          className={cn(
            "mt-10 text-xs uppercase tracking-[0.2em] text-zinc-500 transition-all duration-700 ease-luxe",
            open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          )}
        >
          {siteConfig.name}
        </p>
      </div>
    </>
  );
}
