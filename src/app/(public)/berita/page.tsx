"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { dummyArticles } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

const categories = ["Semua", "Kegiatan", "Informasi", "Sosialisasi"] as const;

export default function BeritaPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  const filtered = useMemo(() => {
    return dummyArticles
      .filter((a) => a.isPublished)
      .filter((a) => activeCategory === "Semua" || a.category === activeCategory)
      .filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.category.toLowerCase().includes(search.toLowerCase())
      );
  }, [search, activeCategory]);

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
        eyebrow="Informasi"
        title={<>Berita &amp; Informasi</>}
        subtitle="Informasi kegiatan dan pengumuman terkini seputar pelayanan kefarmasian."
      />

      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          {/* Search bar */}
          <Reveal>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
            <Input
              placeholder="Cari berita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border pl-9 focus:border-brand-600"
            />
          </div>

          {/* Category filter */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-500 ease-luxe",
                    isActive
                      ? "bg-zinc-950 text-white"
                      : "bg-surface-alt text-muted hover:bg-zinc-200",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          </Reveal>

          {/* Article grid */}
          <Reveal delay={100}>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {filtered.map((article) => (
              <Link key={article.id} href={`/berita/${article.slug}`} className="group block">
                <div className="bezel">
                  <div className="bezel-inner relative aspect-[16/10]">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      unoptimized={article.coverImage.startsWith("https://picsum.photos/")}
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="default" className="bg-white/90 text-brand-700">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-heading line-clamp-2 group-hover:text-brand-800">
                  {article.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-muted">
                  {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
          </Reveal>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-sm text-muted">
              Tidak ada berita yang cocok dengan pencarian Anda.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
