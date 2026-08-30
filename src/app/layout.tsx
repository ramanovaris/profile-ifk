import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UPTD Instalasi Farmasi Kab. Kotabaru",
  description:
    "Website resmi UPTD Instalasi Farmasi Kabupaten Kotabaru — Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
