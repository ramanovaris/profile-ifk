import Link from "next/link";
import { Eye, ShieldAlert, ArrowLeft, Pencil } from "lucide-react";

interface ArticlePreviewBannerProps {
  articleId?: string;
}

export function ArticlePreviewBanner({ articleId }: ArticlePreviewBannerProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-amber-300 bg-amber-50/95 p-4 text-amber-950 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-300 bg-amber-200/60 text-amber-800">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/80 bg-amber-200/80 px-2 py-0.5 text-xs font-bold tracking-wider text-amber-900">
                <Eye className="h-3 w-3" />
                MODE PRATINJAU DRAF
              </span>
              <span className="text-xs font-medium text-amber-800 sm:inline">
                &middot; Khusus Administrator
              </span>
            </div>
            <p className="mt-1 text-xs text-amber-900/90 sm:text-sm leading-relaxed">
              Artikel ini berstatus <strong className="font-bold text-amber-950 underline decoration-amber-400">DRAFT</strong> dan belum dipublikasikan ke masyarakat luas. Pengunjung umum tanpa sesi login admin tidak dapat mengakses halaman ini (404 Not Found).
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
          {articleId ? (
            <Link
              href={`/admin/berita/${articleId}/edit/`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-600 bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Draf
            </Link>
          ) : null}
          <Link
            href="/admin/berita/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-950"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-zinc-500" />
            Panel Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
