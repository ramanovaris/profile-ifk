"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { dummyArticles } from "@/lib/dummy-data";

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
      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Beranda / Berita</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Berita &amp; Informasi</h1>
        </div>
      </section>

      {/* ── Filter & Grid ─────────────────────────────────────────── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari berita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="cursor-pointer"
              >
                <Badge
                  variant={activeCategory === cat ? "default" : "secondary"}
                  className="transition"
                >
                  {cat}
                </Badge>
              </button>
            ))}
          </div>

          {/* Article grid */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
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
                      })}{" "}
                      &middot; {article.authorName}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {article.content.replace(/<[^>]+>/g, "").slice(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-12 text-center text-sm text-slate-500">
              Tidak ada berita yang cocok dengan pencarian Anda.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
