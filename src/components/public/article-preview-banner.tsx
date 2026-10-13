import Link from "next/link";
import { Eye, ArrowLeft, Pencil } from "lucide-react";

interface ArticlePreviewBannerProps {
  articleId?: string;
}

export function ArticlePreviewBanner({ articleId }: ArticlePreviewBannerProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/95 p-4 sm:p-5 text-amber-950 shadow-sm">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Header & Pesan */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/80 bg-amber-200/70 text-amber-800">
            <Eye className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-amber-300/80 bg-amber-200/90 px-2 py-0.5 text-xs font-bold text-amber-900">
                Pratinjau Draf
              </span>
              <span className="text-xs font-medium text-amber-800/90">
                &middot; Belum Diterbitkan
              </span>
            </div>
            <p className="mt-1.5 text-xs text-amber-900/90 sm:text-sm leading-relaxed">
              Artikel ini masih disimpan sebagai draf. Masyarakat umum belum dapat melihat berita ini sampai Anda mempublikasikannya.
            </p>
          </div>
        </div>

        {/* Tombol Aksi (Simetris 50/50 di mobile, rapi di kanan saat desktop) */}
        <div className="flex items-center gap-2 border-t border-amber-200/80 pt-3 sm:border-t-0 sm:pt-0 sm:shrink-0 sm:justify-end">
          {articleId ? (
            <Link
              href={`/admin/berita/${articleId}/edit/`}
              className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit Artikel</span>
            </Link>
          ) : null}
          <Link
            href="/admin/berita/"
            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-xs font-medium text-amber-950 shadow-sm transition-colors hover:bg-amber-100/50 hover:text-zinc-950"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-amber-800" />
            <span>Kelola Berita</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
