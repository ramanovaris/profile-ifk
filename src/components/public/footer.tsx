import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, Phone, MapPin, Globe } from "lucide-react";

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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function formatWhatsappNumber(link: string): string {
  const match = link.match(/(?:wa\.me\/|send\?phone=|\+?)(\d{9,15})/);
  if (!match) return "WhatsApp";
  const num = match[1];
  if (num.startsWith("62")) {
    const rest = num.slice(2);
    if (rest.length >= 9) {
      return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
    }
    return `+${num}`;
  }
  return num;
}

export function Footer({ settings }: FooterProps = {}) {
  const shortName = settings?.shortName || siteConfig.shortName;
  const name = settings?.name || siteConfig.name;
  const address = settings?.address || siteConfig.address;
  const motto = settings?.motto || siteConfig.motto;
  const email = settings?.email || siteConfig.email;
  const phone = settings?.phone || siteConfig.phone;
  const whatsappLink = settings?.whatsappLink || siteConfig.whatsappLink;

  const socialLinks = [
    { url: whatsappLink, icon: WhatsAppIcon, label: "WhatsApp" },
    { url: settings?.instagramUrl, icon: InstagramIcon, label: "Instagram" },
    { url: settings?.facebookUrl, icon: FacebookIcon, label: "Facebook" },
    { url: settings?.youtubeUrl, icon: YouTubeIcon, label: "YouTube" },
  ].filter((link) => link.url);

  const externalLinks = [
    { url: settings?.dinkesUrl, label: "Portal Dinkes", icon: Globe },
  ].filter((link) => link.url);

  return (
    <footer className="page-hero text-zinc-300">
      <div className="section-container pt-16 pb-8">
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
              {whatsappLink && (
                <li className="flex items-center gap-2.5 text-sm">
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-brand-400" />
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/wa inline-flex items-center gap-1 transition-colors duration-300 ease-luxe hover:text-brand-400"
                    title="Hubungi WhatsApp Resmi IFK Kotabaru (Buka di tab baru)"
                    aria-label="Hubungi WhatsApp Resmi IFK Kotabaru"
                  >
                    <span>{formatWhatsappNumber(whatsappLink)}</span>
                    <ArrowUpRight
                      className="h-3 w-3 opacity-60 transition-transform duration-200 group-hover/wa:translate-x-0.5 group-hover/wa:-translate-y-0.5"
                      strokeWidth={1.5}
                    />
                  </a>
                </li>
              )}
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
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} {name}. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
