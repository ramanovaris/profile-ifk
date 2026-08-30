import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
export const metadata: Metadata = {
  title: "UPTD Instalasi Farmasi Kab. Kotabaru",
  description:
    "Website resmi UPTD Instalasi Farmasi Kabupaten Kotabaru — Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat.",
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