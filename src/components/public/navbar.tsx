"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";

import { siteConfig } from "@/lib/dummy-data";
import { cn, getAssetUrl } from "@/lib/utils";
import type { SiteSetting } from "@prisma/client";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/layanan", label: "Layanan" },
  { href: "/stok", label: "Stok Obat" },
  { href: "/berita", label: "Berita" },
  { href: "/kontak", label: "Kontak" },
];

interface NavbarProps {
  settings?: SiteSetting;
}

export function Navbar({ settings }: NavbarProps = {}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const shortName = settings?.shortName || siteConfig.shortName;

  return (
    <>
      {/* ── Floating glass pill, detached dari tepi atas ─────────────── */}
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="mx-auto flex h-14 w-full max-w-4xl lg:max-w-5xl items-center justify-between rounded-full border border-black/5 bg-white/70 px-4 sm:px-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-heading"
          >
            <Image src="/images/logo-ifk.jpg" alt="Logo IFK Kotabaru" width={28} height={28} unoptimized className="h-7 w-7 shrink-0 rounded-full" />
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap">{shortName}</span>
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
                    "rounded-full px-3 py-1.5 text-sm transition-all duration-300 ease-luxe whitespace-nowrap",
                    isActive
                      ? "bg-black/5 font-medium text-heading"
                      : "text-muted hover:text-heading"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="ml-1.5 flex shrink-0 items-center gap-1">
              <a
                href={getAssetUrl("/admin/login/")}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/5 bg-black/5 px-3 py-1.5 text-xs font-medium text-heading transition-colors hover:bg-black/10 whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5 shrink-0" />
                Masuk Admin
              </a>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-heading md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 pt-20 bg-white/90 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium",
                    isActive ? "bg-black/5 text-heading" : "text-muted hover:bg-black/5 hover:text-heading"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-black/5 pt-4">
              <a
                href={getAssetUrl("/admin/login/")}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-black/5 px-4 py-3 text-sm font-medium text-heading hover:bg-black/10"
              >
                <LogIn className="h-4 w-4" />
                Masuk Admin
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
