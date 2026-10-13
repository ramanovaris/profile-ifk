"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RotateCcw, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    // Mencatat detail kendala pada sesi internal admin
    console.error("[Admin Error Boundary]", error);
  }, [error]);

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
        {/* Ikon Keamanan & Peringatan */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 shadow-inner">
          <ShieldAlert className="h-8 w-8 stroke-[1.75]" />
        </div>

        {/* Subjudul & Judul */}
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          Panel Administrasi IFK Kotabaru
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
          Terjadi Kendala pada Sistem Administrasi
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-md mx-auto">
          Sistem mendeteksi kendala saat memproses halaman ini. Data dan sesi login Anda tetap aman. Silakan muat ulang komponen atau kembali ke dashboard utama.
        </p>

        {/* Kode Pelaporan Digest (Aman & Tanpa Detail Kredensial) */}
        {error.digest && (
          <div className="mb-6">
            <span className="inline-block rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-mono text-zinc-400">
              Digest ID: {error.digest}
            </span>
          </div>
        )}

        {/* Tombol Aksi Staf Administrasi */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto mb-6">
          <Button
            onClick={() => reset()}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Coba Muat Ulang
          </Button>

          <Link
            href="/admin/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 px-4 rounded-xl border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium transition-all inline-flex items-center justify-center"
            )}
          >
            <LayoutDashboard className="w-4 h-4 mr-2 text-emerald-400" />
            Kembali ke Dashboard
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
