"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/dummy-data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Dummy login — redirect tanpa validasi
    router.push("/admin/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12">
      {/* Aurora mesh glows */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        {/* Tombol kembali ke beranda */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition-colors hover:border-white/10 hover:bg-zinc-900/90 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Kartu login glassmorphism */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/75 p-6 shadow-2xl shadow-black/70 backdrop-blur-xl sm:p-8">
          {/* Header instansi */}
          <div className="text-center">
            <div className="relative mx-auto inline-block">
              <Image
                src="/images/logo-ifk.jpg"
                alt="Logo IFK Kotabaru"
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-full ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/20"
              />
            </div>
            <h1 className="mt-3 text-lg font-bold tracking-tight text-white sm:text-xl">
              {siteConfig.shortName}
            </h1>
            <p className="mt-0.5 text-xs text-zinc-400">
              Panel Administrasi Internal
            </p>
            <div className="mt-2.5">
              <span className="inline-block rounded-full border border-emerald-800/40 bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Akses Terbatas Petugas
              </span>
            </div>
          </div>

          {/* Form login */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium text-zinc-300">
                Username
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="rounded-xl border-zinc-800 bg-zinc-950/70 pl-9.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-zinc-300">
                Password
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="rounded-xl border-zinc-800 bg-zinc-950/70 pl-9.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500"
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

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-2.5 font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 active:scale-[0.99]"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Masuk
              </Button>
            </div>
          </form>

          {/* Footer kartu */}
          <p className="mt-6 text-center text-[11px] text-zinc-500">
            Hak Cipta © {new Date().getFullYear()} Dinas Kesehatan Kota Banjarmasin
          </p>
        </div>
      </div>
    </div>
  );
}
