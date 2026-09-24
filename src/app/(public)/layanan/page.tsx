import {
  Thermometer,
  Snowflake,
  PackageCheck,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { SuratPengantarModalButton } from "@/components/public/surat-pengantar-modal";

const hardcopySteps = [
  {
    step: "01",
    title: "Penyusunan Berkas di Faskes",
    desc: "Pengelola Obat faskes menyusun dokumen permintaan (LPLPO berkala atau Formulir Permintaan Sewaktu).",
  },
  {
    step: "02",
    title: "Registrasi & Penomoran TU Dinkes",
    desc: "Puskesmas menyerahkan surat permintaan ke Bagian TU Dinas Kesehatan untuk registrasi penomoran resmi dinas.",
  },
  {
    step: "03",
    title: "Penyerahan ke IFK & Disposisi",
    desc: "Puskesmas membawa 1 rangkap dokumen ke UPTD IFK, sementara 1 rangkap menjadi arsip disposisi Dinkes beserta surat pengantar.",
  },
  {
    step: "04",
    title: "Validasi & Penyiapan Fisik",
    desc: "Petugas IFK memvalidasi ketersediaan stok di gudang dan menyiapkan paket perbekalan farmasi untuk diserahterimakan.",
  },
] as const;

const softcopySteps = [
  {
    step: "01",
    title: "Koordinasi Internal Puskesmas",
    desc: "Pengelola Obat dan Pengelola Program Puskesmas berkoordinasi menyusun draf rincian kebutuhan perbekalan.",
  },
  {
    step: "02",
    title: "Persetujuan Program Dinkes",
    desc: "Pengelola Program di Dinas Kesehatan (Bidang SDK / P2P / Kesmas) memeriksa, menyetujui, dan menandatangani alokasi sasaran.",
  },
  {
    step: "03",
    title: "Pengiriman PDF Minimal H-1",
    desc: "Berkas PDF bertanda tangan lengkap dikirimkan ke Admin IFK paling lambat H-1 sebelum jadwal pengambilan fisik.",
  },
  {
    step: "04",
    title: "Registrasi TU & Penyiapan Barang",
    desc: "Admin IFK meneruskan berkas PDF ke TU Dinkes untuk penomoran resmi, dan perbekalan disiapkan di gudang IFK.",
  },
] as const;

const downloadTemplates = [
  {
    title: "Format LPLPO",
    subtitle: "Lembar Permintaan & Pemakaian Obat",
    tag: "Distribusi Berkala",
    desc: "Formulir standar resmi pelaporan pemakaian dan permintaan rutin perbekalan farmasi faskes per periode distribusi.",
    href: "https://docs.google.com/spreadsheets/d/1ypgpgMjzoZiWWisXV5G_8lPwp6r4PXDI/edit?usp=drive_link&ouid=115052879703335488719&rtpof=true&sd=true",
    icon: FileSpreadsheet,
    format: "Google Sheets / Excel",
  },
  {
    title: "Format Permintaan Sewaktu",
    subtitle: "Kategori Program & Non-Program",
    tag: "Insidental / Cito",
    desc: "Formulir baku pengajuan perbekalan insidental di luar siklus LPLPO rutin untuk kebutuhan program prioritas maupun non-program.",
    href: "https://docs.google.com/spreadsheets/d/19Eilxy1uqE6JM45kY5b7ZMj0OlKP-I6H/edit?usp=sharing&ouid=115052879703335488719&rtpof=true&sd=true",
    icon: FileSpreadsheet,
    format: "Google Sheets / Excel",
  },
  {
    title: "Pedoman Surat Pengantar",
    subtitle: "Standar Naskah Dinas Faskes",
    tag: "Tata Naskah Resmi",
    desc: "Format standar kop surat dan pengantar dinas resmi dari pimpinan faskes kepada Dinas Kesehatan & UPTD Instalasi Farmasi.",
    href: null,
    icon: FileCheck,
    format: "Dokumen Resmi Faskes",
  },
] as const;

export default function LayananPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Layanan" }]}
        eyebrow="Pelayanan"
        title="Standar Pelayanan Operasional"
        subtitle="Pedoman operasional lengkap bagi faskes mitra, mencakup alur pengajuan perbekalan, format dokumen resmi, hingga standar mutu."
      />

      {/* ── Mekanisme Pengajuan Permintaan Perbekalan ───────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Prosedur Pengajuan</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Mekanisme Pengajuan Permintaan
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Dua opsi alur resmi bagi Puskesmas dan fasilitas kesehatan jejaring untuk pengajuan
                LPLPO berkala maupun perbekalan insidental sewaktu.
              </p>
            </div>
          </Reveal>

          {/* 2 Kolom Alur: Hardcopy vs Softcopy */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Jalur Hardcopy */}
            <Reveal delay={80} className="block h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 shadow-xs">
                        <FileText className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-heading">
                          Jalur Berkas Fisik (Hardcopy)
                        </h3>
                        <p className="text-xs text-zinc-600">Penomoran langsung di TU Dinas Kesehatan</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                      Reguler
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {hardcopySteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 rounded-xl border border-border/70 bg-surface/60 p-4 transition-colors hover:bg-surface">
                        <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100/80 px-2 py-1 rounded-md shrink-0">
                          {step.step}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-heading">{step.title}</h4>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-700">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-zinc-600">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                  <span>Membawa 1 rangkap ke IFK dan 1 rangkap arsip disposisi Dinkes.</span>
                </div>
              </div>
            </Reveal>

            {/* Jalur Softcopy (WhatsApp) */}
            <Reveal delay={160} className="block h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 shadow-xs">
                        <Smartphone className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-heading">
                          Jalur Digital Cepat (WhatsApp)
                        </h3>
                        <p className="text-xs text-zinc-600">Verifikasi digital &amp; konfirmasi H-1</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                      Minimal H-1
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {softcopySteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 rounded-xl border border-border/70 bg-surface/60 p-4 transition-colors hover:bg-surface">
                        <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100/80 px-2 py-1 rounded-md shrink-0">
                          {step.step}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-heading">{step.title}</h4>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-700">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-zinc-600">
                  <Clock className="h-4 w-4 text-brand-600 shrink-0" />
                  <span>Pengiriman berkas PDF minimal H-1 sebelum pengambilan fisik perbekalan.</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Banner Catatan Integrasi SMILE */}
          <Reveal delay={240}>
            <div className="mt-8 rounded-2xl border border-brand-200/70 bg-brand-50/50 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-heading">
                        Ketentuan Khusus Program Berbasis Aplikasi SMILE
                      </h4>
                      <span className="hidden sm:inline-block font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-800 bg-brand-100 px-2 py-0.5 rounded">
                        Wajib
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-700 max-w-[85ch]">
                      Untuk perbekalan program nasional seperti <strong>Imunisasi (Vaksin), HIV-Sifilis, Hepatitis, Malaria, Tuberkulosis (TB), VAR (Anti-Rabies), dan PKG</strong>, pemesanan wajib terdaftar dan diproses melalui platform digital <strong>SMILE</strong> sebelum penyerahan fisik perbekalan di gudang IFK.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Pusat Unduhan Formulir & Format Resmi ───────────────────── */}
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Pusat Unduhan</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Formulir &amp; Format Resmi
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Akses dan unduh formulir standar dinas untuk pengajuan distribusi LPLPO rutin maupun
                kebutuhan perbekalan sewaktu.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {downloadTemplates.map((item, idx) => (
              <Reveal key={idx} delay={80 + idx * 80} className="block h-full">
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-7 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 shadow-xs transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <item.icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="font-mono text-[10px] font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-base sm:text-lg font-bold tracking-tight text-heading">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-brand-700">{item.subtitle}</p>

                    <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-zinc-700">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 active:scale-[0.98]"
                      >
                        <span>Buka Formulir</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <SuratPengantarModalButton />
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Standar Mutu & Penyimpanan ────────────────────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Kualitas &amp; Keamanan</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Standar Mutu &amp; Penyimpanan
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Protokol ketat penjagaan mutu sediaan farmasi selama masa simpan di instalasi
                hingga didistribusikan ke fasilitas pelayanan kesehatan.
              </p>
            </div>
          </Reveal>
          <div className="mt-6 sm:mt-8 space-y-0 divide-y divide-border">
            {[
              { icon: PackageCheck, title: "FEFO (First Expired First Out)", desc: "Sediaan farmasi dengan masa kedaluwarsa lebih dekat diprioritaskan untuk didistribusikan terlebih dahulu guna mencegah penumpukan obat kedaluwarsa di gudang faskes." },
              { icon: Thermometer, title: "Pemantauan Suhu Ruang Teratur", desc: "Pemeriksaan dan pencatatan temperatur ruangan penyimpanan dilakukan secara harian serta terdokumentasi teratur dalam logbook kalibrasi." },
              { icon: Snowflake, title: "Rantai Dingin (Cold Chain 2°C–8°C)", desc: "Vaksin dan produk biologi disimpan pada suhu dingin terstandar dalam unit cold room dan lemari es medis dengan pemantauan suhu otomatis berkesinambungan." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={80 + i * 80}>
                <div className="flex items-start gap-4 py-6">
                  <item.icon className="h-10 w-10 shrink-0 text-brand-600" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-heading">{item.title}</h3>
                    <p className="mt-1 text-xs sm:text-sm text-zinc-700 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Penanganan Obat Rusak & Kedaluwarsa ────────────────────── */}
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-red-50 text-red-700">Karantina &amp; Retur</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Penanganan Obat Rusak &amp; Kedaluwarsa
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Tata cara pelaporan, pengembalian, dan karantina perbekalan farmasi rusak atau kedaluwarsa
                dari fasilitas kesehatan untuk dimusnahkan sesuai regulasi.
              </p>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-8 rounded-2xl border border-red-200/70 bg-red-50/50 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 border border-red-200">
                  <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-red-950">
                    Prosedur Pengembalian Obat Rusak / Kedaluwarsa
                  </h3>
                  <p className="text-xs text-red-800">Karantina terpusat demi mencegah penyalahgunaan obat kedaluwarsa</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 border-t border-red-200/60 pt-6 sm:grid-cols-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-900">
                    Waktu Pelaporan
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-red-950/80">
                    Laporan diajukan paling lambat <strong>7 hari kerja</strong> sejak ditemukannya perbekalan rusak atau kedaluwarsa di unit faskes.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-900">
                    Persyaratan Dokumen
                  </h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-xs sm:text-sm text-red-950/80">
                    <li>Surat pengantar Kepala Faskes</li>
                    <li>Berita Acara Serah Terima (BAST)</li>
                    <li>Rincian nama, jumlah, batch, ED</li>
                    <li>Dokumentasi foto fisik obat</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-900">
                    Tindak Lanjut IFK
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-red-950/80">
                    Obat yang diterima segera diisolasi di ruang karantina khusus UPTD IFK sebelum proses pemusnahan resmi terpadu bersama Dinkes.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Jam Pelayanan ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Operasional Loket</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Jam Pelayanan
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Jadwal resmi pelayanan administrasi, penerimaan berkas permohonan, dan pengambilan fisik
                perbekalan farmasi di UPTD Instalasi Farmasi.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/50 font-mono">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Hari Pelayanan
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Jam Kerja
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="transition-colors hover:bg-surface/30">
                    <td className="px-6 py-4 font-medium text-heading">Senin — Kamis</td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-700 font-medium">08.00 — 16.30 WITA</td>
                  </tr>
                  <tr className="transition-colors hover:bg-surface/30">
                    <td className="px-6 py-4 font-medium text-heading">Jumat</td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-700 font-medium">08.00 — 11.00 WITA</td>
                  </tr>
                  <tr className="bg-surface/30 text-xs text-zinc-600">
                    <td className="px-6 py-3 italic" colSpan={2}>
                      * Sabtu, Minggu, dan Hari Libur Nasional tutup (kecuali kondisi darurat / KLB).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
