import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ramanovaris.my.id/profile-ifk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "UPTD Instalasi Farmasi Kab. Kotabaru",
    template: "%s | UPTD Instalasi Farmasi Kab. Kotabaru",
  },
  description:
    "Website resmi UPTD Instalasi Farmasi Kabupaten Kotabaru — Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "UPTD Instalasi Farmasi Kab. Kotabaru",
    title: "UPTD Instalasi Farmasi Kab. Kotabaru",
    description:
      "Website resmi UPTD Instalasi Farmasi Kabupaten Kotabaru — Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat.",
    images: [
      {
        url: "/images/kantor-ifk.jpg",
        width: 1200,
        height: 630,
        alt: "Gedung Kantor UPTD Instalasi Farmasi Kab. Kotabaru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UPTD Instalasi Farmasi Kab. Kotabaru",
    description:
      "Website resmi UPTD Instalasi Farmasi Kabupaten Kotabaru — Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat.",
    images: ["/images/kantor-ifk.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}