import Link from "next/link";
import { FileQuestion, LayoutDashboard, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminNotFound() {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-zinc-950 p-4 sm:p-6 text-zinc-100">
      {/* Efek pencahayaan aurora khas Dark Ethereal */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl sm:h-96 sm:w-96"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl sm:h-96 sm:w-96"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center">
        {/* Ikon Simbolik & Badge 404 */}
        <div className="inline-flex items-center justify-center mb-5">
          <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-inner">
            <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.75]" />
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase rounded-full bg-emerald-950 border border-emerald-700/60 shadow-sm">
              404
            </span>
          </div>
        </div>

        {/* Subjudul & Judul */}
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          Panel Administrasi IFK Kotabaru
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
          Halaman Admin Tidak Ditemukan
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-md mx-auto">
          Tautan menu internal atau sumber daya administrasi yang Anda tuju tidak terdaftar atau telah dipindahkan.
        </p>

        {/* Tombol Aksi Navigasi Staf */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto mb-6">
          <Link
            href="/admin/dashboard"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-all inline-flex items-center justify-center"
            )}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>

          <Link
            href="/admin/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 px-4 rounded-xl border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium transition-all inline-flex items-center justify-center"
            )}
          >
            Halaman Masuk
          </Link>
        </div>

        {/* Tautan Kembali ke Portal Publik */}
        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Menuju Beranda Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
