"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    // Mencatat detail error teknis ke log peramban untuk keperluan penelusuran
    console.error("[Public Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Latar belakang dekoratif halus */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[28rem] w-[28rem] sm:h-[36rem] sm:w-[36rem] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="h-[20rem] w-[20rem] sm:h-[28rem] sm:w-[28rem] -translate-x-24 translate-y-20 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-lg mx-auto text-center">
        {/* Ikon Peringatan Ramah Pengguna */}
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-sm text-amber-600">
            <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.75]" />
          </div>
        </div>

        {/* Heading & Deskripsi */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
          Terjadi Kendala Memuat Halaman
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
          Sistem mengalami kendala tak terduga saat memuat informasi yang diminta. Anda dapat mencoba memuat ulang halaman ini atau kembali ke beranda utama.
        </p>

        {/* Kode Referensi jika tersedia */}
        {error.digest && (
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-xs font-mono text-slate-500">
              Kode Referensi: {error.digest}
            </span>
          </div>
        )}

        {/* Tombol Pemulihan */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto mb-10">
          <Button
            onClick={() => reset()}
            className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-all"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2 text-emerald-600" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>

        {/* Navigasi Bantuan Tambahan */}
        <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
          <span>Kendala berlanjut?</span>
          <Link
            href="/kontak"
            className="inline-flex items-center font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            Hubungi Staf Layanan IFK
          </Link>
        </div>
      </div>
    </div>
  );
}
