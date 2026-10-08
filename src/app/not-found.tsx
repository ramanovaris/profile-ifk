import Link from "next/link";
import { Home, Pill, FileQuestion, ArrowRight, PhoneCall } from "lucide-react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ScrollToTop } from "@/components/public/scroll-to-top";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/actions/setting";

export default async function NotFound() {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* Latar belakang dekoratif halus */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden"
        >
          <div className="h-[28rem] w-[28rem] sm:h-[36rem] sm:w-[36rem] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="h-[20rem] w-[20rem] sm:h-[28rem] sm:w-[28rem] -translate-x-24 translate-y-20 rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="w-full max-w-xl mx-auto text-center">
          {/* Badge & Ikon Simbolik */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-50 border border-emerald-200/80 shadow-sm text-emerald-600">
              <FileQuestion className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.75]" />
              <span className="absolute -top-2 -right-2 px-2.5 py-0.5 text-xs font-bold tracking-wide text-white uppercase rounded-full bg-emerald-600 shadow-sm">
                404
              </span>
            </div>
          </div>

          {/* Heading & Penjelasan */}
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto mb-8">
            Maaf, halaman atau warta yang Anda tuju tidak dapat ditemukan. Tautan mungkin telah dipindahkan, artikel tidak lagi tersedia, atau alamat URL salah ketik.
          </p>

          {/* Tombol Aksi Navigasi Cepat */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto mb-10">
            <Button
              asChild
              className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-all"
            >
              <Link href="/stok">
                <Pill className="w-4 h-4 mr-2 text-emerald-600" />
                Cek Ketersediaan Obat
              </Link>
            </Button>
          </div>

          {/* Navigasi Bantuan Tambahan */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
            <span>Butuh informasi lebih lanjut?</span>
            <Link
              href="/kontak"
              className="inline-flex items-center font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
              Hubungi Layanan IFK
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
      <ScrollToTop />
      {/* Film grain overlay */}
      <div aria-hidden className="noise-layer" />
    </>
  );
}
