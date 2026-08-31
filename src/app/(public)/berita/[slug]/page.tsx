import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { dummyArticles } from "@/lib/dummy-data";

export function generateStaticParams() {
  return dummyArticles.map((a) => ({ slug: a.slug }));
}

export default async function BeritaDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const article = dummyArticles.find((a) => a.slug === slug);

  if (!article) notFound();

  const otherArticles = dummyArticles
    .filter((a) => a.id !== article.id && a.isPublished)
    .slice(0, 2);

  return (
    <>
      {/* ── Cover Image ────────────────────────────────────────────── */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-b-3xl">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          unoptimized={article.coverImage.startsWith("https://picsum.photos/")}
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* ── Article ────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <Breadcrumb
              items={[
                { label: "Beranda", href: "/" },
                { label: "Berita", href: "/berita" },
                { label: article.category },
              ]}
            />
            <Badge variant="default" className="mt-4 bg-brand-50 text-brand-700">
              {article.category}
            </Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              {article.title}
            </h1>
            <p className="mt-2 text-sm font-mono text-muted">
              {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              &middot; {article.authorName}
            </p>
            <div
              className="prose prose-zinc mt-6 max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>
      </section>

      {/* ── Related Articles ─────────────────────────────────────── */}
      {otherArticles.length > 0 && (
        <section className="border-t border-border bg-surface py-24">
          <div className="section-container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-xl font-bold tracking-tight text-heading">
                Berita Lainnya
              </h2>
              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                {otherArticles.map((a) => (
                  <Link key={a.id} href={`/berita/${a.slug}`} className="group block">
                    <Card className="h-full overflow-hidden border-border transition-colors hover:border-brand-300">
                      <div className="relative h-36 w-full overflow-hidden">
                        <Image
                          src={a.coverImage}
                          alt={a.title}
                          fill
                          unoptimized={a.coverImage.startsWith("https://picsum.photos/")}
                          sizes="(min-width: 768px) 33vw, 100vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <Badge variant="default" className="mb-2 bg-brand-50 text-brand-700">
                          {a.category}
                        </Badge>
                        <h3 className="mt-2 line-clamp-2 font-semibold text-heading group-hover:text-brand-800">
                          {a.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-muted">
                          {new Date(a.publishedAt).toLocaleDateString("id-ID", {
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
            </div>
          </div>
        </section>
      )}
    </>
  );
}
