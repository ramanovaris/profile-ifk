"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, User, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/dummy-data";
import { loginAction } from "@/actions/auth";
import { Toaster, toast } from "@/components/ui/toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success("Berhasil masuk! Mengalihkan ke dashboard...", "Autentikasi Berhasil");
      router.push("/admin/dashboard");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error, "Gagal Masuk");
    }
  }, [state, router]);

  const isRedirecting = Boolean(state?.success);
  const isLoading = isPending || isRedirecting;

  return (
    <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-zinc-950 p-4 sm:p-6">
      {/* Aurora mesh glows */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl sm:h-96 sm:w-96"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-600/15 blur-3xl sm:h-96 sm:w-96"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        {/* Tombol kembali ke beranda */}
        <div className="mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 backdrop-blur-md transition-colors hover:border-white/10 hover:bg-zinc-900/90 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Kartu login glassmorphism */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-2xl shadow-black/70 backdrop-blur-xl sm:p-7">
          {/* Header instansi */}
          <div className="text-center">
            <div className="relative mx-auto inline-block">
              <Image
                src="/images/logo-ifk.jpg"
                alt="Logo IFK Kotabaru"
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 rounded-full ring-2 ring-brand-500/30 shadow-md shadow-brand-500/20"
              />
            </div>
            <h1 className="mt-2 text-base font-bold tracking-tight text-white sm:text-lg">
              {siteConfig.shortName}
            </h1>
            <p className="text-xs text-zinc-400">
              Panel Administrasi Internal
            </p>
            <div className="mt-1.5">
              <span className="inline-block rounded-full border border-emerald-800/40 bg-emerald-950/60 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400 sm:text-[10px]">
                Akses Terbatas Petugas
              </span>
            </div>
          </div>

          {/* Feedback error alert box */}
          {state?.error && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Form login */}
          <form action={formAction} className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs font-medium text-zinc-300">
                Username
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  placeholder="Masukkan username"
                  className="h-10 rounded-xl border-zinc-800 bg-zinc-950/70 pl-9.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium text-zinc-300">
                Password
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  className="h-10 rounded-xl border-zinc-800 bg-zinc-950/70 pl-9.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 transition-colors hover:text-zinc-300"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-1.5">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 w-full rounded-xl bg-brand-600 font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRedirecting ? "Mengalihkan..." : "Memverifikasi..."}
                  </span>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer kartu */}
          <p className="mt-4 text-center text-[10px] text-zinc-500 sm:mt-5 sm:text-[11px]">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Hak cipta dilindungi.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
