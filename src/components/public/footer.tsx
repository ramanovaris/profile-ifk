import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";

import { siteConfig } from "@/lib/dummy-data";
import type { SiteSetting } from "@prisma/client";

const quickLinks = [
  { href: "/profil", label: "Profil" },
  { href: "/layanan", label: "Layanan" },
  { href: "/berita", label: "Berita" },
  { href: "/kontak", label: "Kontak" },
];

interface FooterProps {
  settings?: SiteSetting;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

export function Footer({ settings }: FooterProps = {}) {
  const shortName = settings?.shortName || siteConfig.shortName;
  const name = settings?.name || siteConfig.name;
  const address = settings?.address || siteConfig.address;
  const motto = settings?.motto || siteConfig.motto;
  const email = settings?.email || siteConfig.email;
  const phone = settings?.phone || siteConfig.phone;

  const socialLinks = [
    { url: settings?.instagramUrl, icon: InstagramIcon, label: "Instagram" },
    { url: settings?.facebookUrl, icon: FacebookIcon, label: "Facebook" },
    { url: settings?.youtubeUrl, icon: YouTubeIcon, label: "YouTube" },
  ].filter((link) => link.url);

  const externalLinks = [
    { url: settings?.sp4nLaporUrl, label: "SP4N LAPOR!", icon: ExternalLink },
    { url: settings?.dinkesUrl, label: "Portal Dinkes", icon: Globe },
  ].filter((link) => link.url);

  return (
    <footer className="page-hero text-zinc-300">
      <div className="section-container py-24">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          {/* Kolom 1 — Info Instansi + Motto */}
          <div>
            <div className="flex items-center gap-2 font-semibold tracking-tight text-white">
            <Image src="/images/logo-ifk.jpg" alt="Logo IFK Kotabaru" width={28} height={28} unoptimized className="h-7 w-7 rounded-full" />
            <span className="font-semibold tracking-tight text-white">{shortName}</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
              {address}
            </p>
            <p className="mt-4 max-w-md text-sm italic text-zinc-500">{motto}</p>

            {/* Social Media Icons */}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors duration-300 hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-brand-400"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
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

            {/* External Links */}
            {externalLinks.length > 0 && (
              <>
                <h3 className="mt-6 text-xs uppercase tracking-[0.2em] text-zinc-500">Portal Eksternal</h3>
                <ul className="mt-5 space-y-2.5">
                  {externalLinks.map((ext) => (
                    <li key={ext.label}>
                      <a
                        href={ext.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-sm text-zinc-300 transition-colors duration-300 ease-luxe hover:text-brand-400"
                      >
                        {ext.label}
                        <ArrowUpRight
                          className="h-3 w-3 opacity-0 transition-all duration-300 ease-luxe group-hover:translate-x-0.5 group-hover:opacity-100"
                          strokeWidth={1.5}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Kolom 3 — Kontak */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Kontak</h3>
            <ul className="mt-5 space-y-3">
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.5} />
                <a
                  href={`mailto:${email}`}
                  className="transition-colors duration-300 ease-luxe hover:text-brand-400"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.5} />
                <span>{phone}</span>
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
          &copy; {new Date().getFullYear()} {name}. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
