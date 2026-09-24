import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Pill,
  Compass,
  Users,
  PackageCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/public/reveal";
import { dummyArticles } from "@/lib/dummy-data";
import { db } from "@/lib/db";
import { placeholderImage } from "@/lib/placeholder";
import { getSiteSettings } from "@/actions/setting";

const pillars = [
  {
    icon: PackageCheck,
    tag: "Availability",
    title: "Ketersediaan Pasti",
    desc: "Menjamin ketersediaan obat esensial, vaksin, dan BMHP secara berkesinambungan dengan buffer stock 6 bulan untuk kebutuhan pelayanan kesehatan.",
  },
  {
    icon: Compass,
    tag: "Equity",
    title: "Pemerataan Berkeadilan",
    desc: "Distribusi logistik kefarmasian merata dan berkesinambungan ke 28 Puskesmas di wilayah daratan maupun gugusan pulau terpencil Kabupaten Kotabaru.",
  },
  {
    icon: ShieldCheck,
    tag: "Quality & Safety",
    title: "Jaminan Mutu & Keamanan",
    desc: "Penyimpanan berstandar CDOB, rantai dingin (cold chain 2°C–8°C) terkalibrasi, serta sistem relokasi aktif untuk mencegah risiko kedaluwarsa.",
  },
] as const;

export default async function HomePage() {
  const settings = await getSiteSettings();

  const stats = [
    {
      icon: Building2,
      value: settings.statsFaskesCount || "30 Faskes",
      label: settings.statsFaskesLabel || "28 Puskesmas & 2 RSUD",
    },
    {
      icon: Compass,
      value: settings.statsPulauCount || "45 Pulau",
      label: settings.statsPulauLabel || "Jangkauan Kepulauan",
    },
    {
      icon: Users,
      value: settings.statsMasyarakatCount || "334 Ribu+",
      label: settings.statsMasyarakatLabel || "Masyarakat Terlayani",
    },
  ];

  let latestArticles: Array<{
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    category: string;
    publishedAt: Date | string;
  }> = [];

  try {
    const dbArticles = await db.article.findMany({
      where: { isPublished: true },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 3,
    });

    latestArticles = dbArticles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      coverImage: a.coverImage,
      category: a.category?.name || "Umum",
      publishedAt: a.publishedAt,
    }));
  } catch (err) {
    console.error("[HomePage] Gagal mengambil artikel dari basis data:", err);
  }

  if (latestArticles.length === 0) {
    latestArticles = dummyArticles
      .filter((a) => a.isPublished)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3)
      .map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        coverImage: a.coverImage,
        category: a.category,
        publishedAt: a.publishedAt,
      }));
  }

  const featuredArticle = latestArticles[0];
  const otherArticles = latestArticles.slice(1);

  return (
    <>
      {/* ── Hero: full-canvas glass + Z-Axis Cascade ─────────────────── */}
      <section className="relative flex min-h-[100dvh] flex-col overflow-hidden text-white [@media(min-height:760px)]:h-[100dvh]">
        {/* BG — foto kantor full-bleed + overlay gradasi */}
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/images/kantor-ifk.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center md:object-[72%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-transparent to-zinc-950" />
        </div>
        {/* Aurora orbs + spotlight */}
        <div aria-hidden className="hero-aurora pointer-events-none absolute inset-0" />
        {/* Grid halus bermask */}
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
        <div className="section-container relative z-10 flex flex-1 flex-col justify-center pb-12 pt-[clamp(2rem,5vh,3.5rem)] md:pb-[clamp(1.5rem,6vh,4rem)] md:pt-[clamp(3rem,12vh,9rem)]">
          <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
            {/* Kiri — massive typography */}
            <div>
              <span className="eyebrow border border-brand-400/25 bg-brand-500/10 text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden />
                Dinas Kesehatan Kabupaten Kotabaru
              </span>
              <h1 className="mt-5 text-[clamp(2.1rem,4.6vw,4.5rem)] font-bold leading-[1.04] tracking-tighter [@media(max-height:759px)]:text-[clamp(2rem,4vw,3rem)] lg:mt-8">
                UPTD Instalasi{" "}
                <span className="italic text-brand-400">Farmasi</span>
                <span className="block">Kabupaten Kotabaru</span>
              </h1>
              <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-zinc-400 lg:mt-7 lg:text-lg">
                <span className="font-medium text-zinc-100">Melayani dengan Integritas.</span>{" "}
                Menjamin ketersediaan dan mutu perbekalan farmasi bagi 334 ribu lebih masyarakat di
                seluruh penjuru daratan hingga kepulauan Kabupaten Kotabaru.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3 lg:mt-10">
                <Link
                  href="/layanan"
                  className="group inline-flex items-center gap-2 sm:gap-3 rounded-xl bg-brand-600 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white shadow-sm shadow-brand-950/20 transition-all duration-300 ease-luxe hover:bg-brand-500 active:scale-[0.98]"
                >
                  Lihat Layanan
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 ease-luxe group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
                  </span>
                </Link>
                <Link
                  href="/stok"
                  className="group inline-flex items-center gap-2 sm:gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all duration-300 ease-luxe hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                >
                  <Pill className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-400 transition-transform duration-300 ease-luxe group-hover:scale-110" strokeWidth={1.75} />
                  Ketersediaan Obat
                </Link>
              </div>

              {/* Trust line — mini stats */}
              <div className="mt-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-4 sm:flex-nowrap sm:gap-x-6 lg:mt-14 lg:flex-nowrap lg:gap-x-8 lg:pt-8">
                {stats.map((stat, i) => {
                  const isCenteredMobile = i === 2;
                  return (
                    <div
                      key={stat.label}
                      className={
                        isCenteredMobile
                          ? "basis-full lg:basis-auto"
                          : ""
                      }
                    >
                      <p
                        className={
                          isCenteredMobile
                            ? "flex items-center justify-center gap-2 text-xl font-bold tracking-tighter lg:justify-start lg:text-2xl"
                            : "flex items-center gap-2 text-xl font-bold tracking-tighter lg:text-2xl"
                        }
                      >
                        <stat.icon className="h-4 w-4 text-brand-400 lg:h-5 lg:w-5" strokeWidth={1} />
                        {stat.value}
                      </p>
                      <p
                        className={
                          isCenteredMobile
                            ? "mt-0.5 text-center text-[10px] font-medium tracking-wide text-zinc-400 lg:mt-1 lg:text-left lg:whitespace-nowrap lg:text-[11px] lg:font-normal lg:uppercase lg:tracking-[0.15em] lg:text-zinc-500"
                            : "mt-0.5 text-[10px] font-medium tracking-wide text-zinc-400 lg:mt-1 lg:whitespace-nowrap lg:text-[11px] lg:font-normal lg:uppercase lg:tracking-[0.15em] lg:text-zinc-500"
                        }
                      >
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kanan — Z-Axis Cascade */}
            <div className="relative hidden lg:block">
              {/* Kartu belakang — crop sisi kiri gedung, dim */}
              <div className="bezel-dark absolute -right-4 top-8 w-3/4 rotate-[3deg] opacity-40">
                <div className="bezel-inner relative aspect-[16/10]">
                  <Image
                    src="/images/kantor-ifk.webp"
                    alt="Gedung UPTD Instalasi Farmasi Kab. Kotabaru"
                    fill
                    sizes="40vw"
                    className="object-cover object-left"
                  />
                </div>
              </div>
              {/* Kartu utama — foto kantor asli, papan nama terbaca penuh */}
              <div className="bezel-dark relative w-[92%] -rotate-2">
                <div className="bezel-inner relative aspect-[16/10]">
                  <Image
                    src="/images/kantor-ifk.webp"
                    alt="Kantor UPTD Instalasi Farmasi Kab. Kotabaru"
                    fill
                    sizes="45vw"
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Chip glass mengambang */}
              <div className="absolute -bottom-8 left-10 flex w-max items-center gap-3 rounded-2xl border border-sand/25 bg-white/10 px-5 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand/20">
                  <ShieldCheck className="h-5 w-5 text-sand" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{settings.tagline}</p>
                  <p className="text-xs text-zinc-400">Komitmen pelayanan kami</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator — mobile centered, desktop kanan-bawah */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 md:left-auto md:right-10 md:bottom-6 md:translate-x-0 md:gap-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 md:text-[10px] md:tracking-[0.25em]">Gulir</span>
          <span className="relative h-6 w-px overflow-hidden bg-white/10 md:h-12">
            <span className="scroll-line absolute inset-0 bg-brand-400" aria-hidden />
          </span>
        </div>
      </section>

      {/* ── Pilar Komitmen Pelayanan (Editorial Numbered Strip) ───────── */}
      <section className="border-b border-border bg-white py-14 sm:py-20">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Pilar Pelayanan</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Prinsip Tata Kelola Farmasi Daerah
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Landasan UPTD Instalasi Farmasi Kabupaten Kotabaru dalam memastikan rantai pasok
                perbekalan farmasi yang andal, merata, dan bermutu tinggi.
              </p>
            </div>
          </Reveal>

          {/* Kontainer tunggal editorial: divide-y di mobile, 3 kolom di desktop */}
          <div className="mt-6 sm:mt-8 divide-y divide-border rounded-2xl border border-border bg-surface lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0 shadow-xs">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.tag} delay={80 + i * 80} className="block h-full">
                <div className="group flex h-full flex-col justify-between p-5 sm:p-7 lg:p-8 transition-colors duration-300 hover:bg-white">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tracking-widest text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-md">
                        0{i + 1}
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                        {pillar.tag}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-border text-brand-700 shadow-xs transition-colors group-hover:border-brand-300 group-hover:bg-brand-50">
                        <pillar.icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-heading">
                        {pillar.title}
                      </h3>
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-zinc-700">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Links: zig-zag + double-bezel images ───────────────── */}
      <section className="py-32">
        <div className="section-container">
          {/* Item 1: teks kiri, gambar kanan */}
          <Reveal>
            <div className="mb-24 grid gap-10 md:grid-cols-[2fr_1fr] md:items-center">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Pelayanan</span>
                <h2 className="mt-4 text-4xl font-bold tracking-tighter text-heading sm:text-5xl">
                  Layanan Farmasi
                </h2>
                <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-zinc-700">
                  Standar pelayanan dan alur distribusi obat ke seluruh faskes binaan Kabupaten
                  Kotabaru.
                </p>
                <Link
                  href="/layanan"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-white py-2.5 pl-6 pr-2.5 text-sm font-medium text-heading transition-all duration-500 ease-luxe hover:border-brand-200 active:scale-[0.98]"
                >
                  Pelajari selengkapnya
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:scale-105">
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </Link>
              </div>
              <div className="bezel">
                <div className="bezel-inner relative aspect-[4/3]">
                  <Image
                    src={placeholderImage(600, 450, "Distribusi Obat", "Layanan")}
                    alt="Distribusi obat"
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Item 2: gambar kiri, teks kanan (reverse) */}
          <Reveal>
            <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-center">
              {/* Text duluan di DOM (mobile: text-top). md:order-2 paksa text ke kanan di desktop. */}
              <div className="md:order-2">
                <span className="eyebrow bg-brand-50 text-brand-700">Informasi</span>
                <h2 className="mt-4 text-4xl font-bold tracking-tighter text-heading sm:text-5xl">
                  Berita &amp; Informasi
                </h2>
                <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-zinc-700">
                  Informasi kegiatan dan pengumuman terkini seputar pelayanan kefarmasian.
                </p>
                <Link
                  href="/berita"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-white py-2.5 pl-6 pr-2.5 text-sm font-medium text-heading transition-all duration-500 ease-luxe hover:border-brand-200 active:scale-[0.98]"
                >
                  Lihat berita kami
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:scale-105">
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </Link>
              </div>
              {/* Image kedua di DOM (mobile: image-bottom). md:order-1 paksa image ke kiri di desktop. */}
              <div className="bezel md:order-1">
                <div className="bezel-inner relative aspect-[4/3]">
                  <Image
                    src={placeholderImage(600, 450, "Berita & Informasi", "Informasi")}
                    alt="Berita kegiatan"
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Berita Terbaru: asymmetric grid + bezel featured ─────────── */}
      <section className="border-t border-border bg-surface py-32">
        <div className="section-container">
          <Reveal>
            <span className="eyebrow bg-brand-50 text-brand-700">Terkini</span>
            <h2 className="mt-4 text-4xl font-bold tracking-tighter text-heading sm:text-5xl">
              Berita Terbaru
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-14 grid gap-10 md:grid-cols-[1.5fr_1fr]">
              {/* Featured */}
              {featuredArticle && (
                <Link href={`/berita/${featuredArticle.slug}`} className="group block">
                  <div className="bezel">
                    <div className="bezel-inner relative aspect-[16/9] overflow-hidden rounded-2xl bg-zinc-100">
                      {featuredArticle.coverImage ? (
                        <Image
                          src={featuredArticle.coverImage}
                          alt={featuredArticle.title}
                          fill
                          sizes="(min-width: 768px) 60vw, 100vw"
                          unoptimized={
                            featuredArticle.coverImage.startsWith("https://picsum.photos/") ||
                            featuredArticle.coverImage.startsWith("http://") ||
                            featuredArticle.coverImage.startsWith("https://")
                          }
                          className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                          IFK Kotabaru
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <Badge variant="default" className="bg-brand-50 text-brand-700">
                      {featuredArticle.category}
                    </Badge>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-heading transition-colors duration-500 ease-luxe group-hover:text-brand-800">
                      {featuredArticle.title}
                    </h3>
                    <p className="mt-2 font-mono text-xs text-zinc-500">
                      {new Date(featuredArticle.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              )}

              {/* Sidebar list */}
              <div className="flex flex-col divide-y divide-border">
                {otherArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/berita/${article.slug}`}
                    className="group py-6 transition-transform duration-500 ease-luxe"
                  >
                    <div className="flex gap-4">
                      <span className="shrink-0 pt-0.5 font-mono text-xs text-zinc-500 font-medium">
                        {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div>
                        <Badge variant="default" className="bg-brand-50 text-brand-700">
                          {article.category}
                        </Badge>
                        <h3 className="mt-1.5 text-sm font-semibold leading-snug text-heading transition-colors duration-500 ease-luxe group-hover:text-brand-800">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-14 text-center">
              <Link
                href="/berita"
                className="group inline-flex items-center gap-3 rounded-full border border-border bg-white py-2.5 pl-6 pr-2.5 text-sm font-medium text-heading transition-all duration-500 ease-luxe hover:border-brand-200 active:scale-[0.98]"
              >
                Lihat Semua Berita
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:scale-105">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
