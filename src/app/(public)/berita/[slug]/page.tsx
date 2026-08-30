import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.coverImage}
        alt={article.title}
        className="h-64 w-full object-cover sm:h-80"
      />

      {/* ── Article ────────────────────────────────────────────────── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            Beranda / Berita / {article.category}
          </p>
          <Badge variant="secondary" className="mt-4">
            {article.category}
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            {article.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {new Date(article.publishedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            &middot; {article.authorName}
          </p>
          <div
            className="prose prose-slate mt-6 max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </section>

      {/* ── Berita Lainnya ─────────────────────────────────────────── */}
      {otherArticles.length > 0 && (
        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-slate-900">Berita Lainnya</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {otherArticles.map((a) => (
                <Link key={a.id} href={`/berita/${a.slug}`}>
                  <Card className="h-full overflow-hidden transition hover:shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.coverImage}
                      alt={a.title}
                      className="h-36 w-full object-cover"
                    />
                    <CardContent className="pt-3">
                      <Badge variant="secondary" className="text-xs">
                        {a.category}
                      </Badge>
                      <h3 className="mt-2 line-clamp-2 font-semibold text-slate-900">
                        {a.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
