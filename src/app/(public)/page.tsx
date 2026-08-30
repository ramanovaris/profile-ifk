import Link from "next/link";
import { Building2, ShieldCheck, Clock, Newspaper, Phone, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig, dummyArticles } from "@/lib/dummy-data";

export default function HomePage() {
  const latestArticles = dummyArticles.filter((a) => a.isPublished).slice(0, 3);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#2c5282] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            {siteConfig.motto}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/layanan"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-5 py-2 text-sm font-medium text-slate-900 shadow hover:bg-slate-100"
            >
              Lihat Layanan
            </Link>
            <Link
              href="/kontak"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-white px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* ── Statistik Ringkas ─────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Building2, value: "23 Faskes Binaan", label: "Fasilitas Kesehatan" },
            { icon: ShieldCheck, value: "100% Mutu Obat Terjamin", label: "Standar Mutu" },
            { icon: Clock, value: "Pelayanan Tepat Waktu", label: "SLA Distribusi" },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="mx-auto h-10 w-10 text-blue-700" />
                <p className="mt-3 text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Quick Links ───────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Stethoscope, href: "/layanan", title: "Layanan", desc: "Standar pelayanan dan alur distribusi obat" },
            { icon: Newspaper, href: "/berita", title: "Berita", desc: "Informasi kegiatan dan pengumuman terkini" },
            { icon: Phone, href: "/kontak", title: "Kontak", desc: "Hubungi kami untuk informasi lebih lanjut" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition hover:shadow-md">
                <CardContent className="pt-6">
                  <item.icon className="h-8 w-8 text-blue-700" />
                  <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Berita Terbaru ────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Berita Terbaru</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <Link key={article.id} href={`/berita/${article.slug}`}>
                <Card className="h-full overflow-hidden transition hover:shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="h-48 w-full object-cover"
                  />
                  <CardContent className="pt-4">
                    <Badge variant="secondary">{article.category}</Badge>
                    <h3 className="mt-2 line-clamp-2 font-semibold text-slate-900">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/berita"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Lihat Semua Berita
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
