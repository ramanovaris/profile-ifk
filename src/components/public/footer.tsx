import Link from "next/link";
import { Pill, Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/dummy-data";

const quickLinks = [
  { href: "/profil", label: "Profil" },
  { href: "/layanan", label: "Layanan" },
  { href: "/berita", label: "Berita" },
  { href: "/kontak", label: "Kontak" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Kolom 1 — Info Instansi */}
          <div>
            <div className="mb-3 flex items-center gap-2 font-bold text-white">
              <Pill className="h-5 w-5 text-blue-400" />
              <span>{siteConfig.shortName}</span>
            </div>
            <p className="text-sm leading-relaxed">{siteConfig.address}</p>
          </div>

          {/* Kolom 2 — Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Tautan
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3 — Kontak */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Kontak
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition hover:text-white"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                <span>{siteConfig.phone}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Kotabaru, Kalimantan Selatan</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} {siteConfig.name}. Hak cipta dilindungi.
      </div>
    </footer>
  );
}
