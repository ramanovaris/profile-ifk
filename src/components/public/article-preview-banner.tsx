import Link from "next/link";
import { Eye, ShieldAlert, ArrowLeft } from "lucide-react";

interface ArticlePreviewBannerProps {
  articleId?: string;
}

export function ArticlePreviewBanner({ articleId }: ArticlePreviewBannerProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-4 text-amber-200 shadow-lg backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/20 text-amber-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/25 px-2 py-0.5 text-xs font-semibold tracking-wider text-amber-300">
                <Eye className="h-3 w-3" />
                MODE PRATINJAU DRAF
              </span>
              <span className="hidden text-xs text-amber-300/70 sm:inline">&middot; Khusus Administrator</span>
            </div>
            <p className="mt-1 text-xs text-amber-200/90 sm:text-sm">
              Artikel ini berstatus <strong>DRAFT</strong> dan belum dipublikasikan ke masyarakat luas. Pengunjung umum tanpa sesi login admin tidak dapat mengakses halaman ini (404 Not Found).
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
          {articleId ? (
            <Link
              href={`/admin/berita/${articleId}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-100 transition-colors hover:bg-amber-500/30"
            >
              Edit Draf
            </Link>
          ) : null}
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Panel Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
