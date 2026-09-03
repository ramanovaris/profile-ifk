import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";

import { siteConfig } from "@/lib/dummy-data";

const quickLinks = [
  { href: "/profil", label: "Profil" },
  { href: "/layanan", label: "Layanan" },
  { href: "/berita", label: "Berita" },
  { href: "/kontak", label: "Kontak" },
];

export function Footer() {
  return (
    <footer className="page-hero text-zinc-300">
      <div className="section-container py-24">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          {/* Kolom 1 — Info Instansi + Motto */}
          <div>
            <div className="flex items-center gap-2 font-semibold tracking-tight text-white">
            <Image src="/images/logo-ifk.jpg" alt="Logo IFK Kotabaru" width={28} height={28} unoptimized className="h-7 w-7 rounded-full" />
            <span className="font-semibold tracking-tight text-white">{siteConfig.shortName}</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
              {siteConfig.address}
            </p>
            <p className="mt-4 max-w-md text-sm italic text-zinc-500">{siteConfig.motto}</p>
          </div>

          {/* Kolom 2 — Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Tautan</h3>
            <ul className="mt-5 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-300 transition-colors duration-300 ease-luxe hover:text-brand-400"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3 w-3 opacity-0 transition-all duration-300 ease-luxe group-hover:translate-x-0.5 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3 — Kontak */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Kontak</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.5} />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors duration-300 ease-luxe hover:text-brand-400"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.5} />
                <span>{siteConfig.phone}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.5} />
                <span>Kotabaru, Kalimantan Selatan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 border-t border-white/10 pt-6 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} {siteConfig.name}. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
