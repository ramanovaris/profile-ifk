import {
  Thermometer,
  Snowflake,
  PackageCheck,
  AlertTriangle,
  ClipboardCheck,
  Truck,
  RotateCcw,
  BarChart3,
  Layers,
  Coins,
  ShieldCheck,
  ArrowLeftRight,
  GitMerge,
} from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";

const supplyCycle = [
  {
    step: "01",
    title: "Perencanaan",
    icon: ClipboardCheck,
    desc: "Penyusunan RKO terpadu berbasis konsumsi riil dan analisis ABC-VEN dengan alokasi buffer stock 6 bulan.",
  },
  {
    step: "02",
    title: "Pengadaan & Penerimaan",
    icon: PackageCheck,
    desc: "Realisasi anggaran APBD, DAK Farmasi, dan dropping Kemenkes dengan verifikasi fisik serta kepatuhan dokumen.",
  },
  {
    step: "03",
    title: "Penyaluran (Distribusi)",
    icon: Truck,
    desc: "Penyaluran terjadwal ke 28 Puskesmas dan 2 RSUD terintegrasi sistem digital e-Farmasi dan SMILE.",
  },
  {
    step: "04",
    title: "Pengendalian Mutu",
    icon: RotateCcw,
    desc: "Pencatatan stok opname, audit berkala, relokasi aktif antarfaskes, hingga karantina obat rusak/kedaluwarsa.",
  },
] as const;

const rkoMethods = [
  {
    icon: BarChart3,
    title: "Dasar Acuan Data Riil",
    desc: "Penyusunan RKO dilakukan secara terpadu mengacu pada pola penyakit lokal dan riwayat konsumsi pemakaian faskes.",
  },
  {
    icon: Layers,
    title: "Metode Konsumsi & ABC–VEN",
    desc: "Mengkombinasikan metode konsumsi dengan analisis ABC (prioritas anggaran) dan VEN (skala vitalitas obat).",
  },
  {
    icon: ShieldCheck,
    title: "Buffer Stock 6 Bulan",
    desc: "Pengalokasian stok penyangga selama 6 bulan guna menjamin ketersediaan obat saat lonjakan kebutuhan darurat atau KLB.",
  },
] as const;

const fundingSources = [
  {
    source: "APBD Kabupaten",
    tag: "Daerah",
    desc: "Pemenuhan belanja operasional obat pelayanan kesehatan dasar dan kebutuhan rutin faskes daerah.",
  },
  {
    source: "DAK Farmasi",
    tag: "Nasional",
    desc: "Dana Alokasi Khusus pemerintah pusat untuk penyediaan obat, vaksin, serta penguatan sarana kefarmasian.",
  },
  {
    source: "Dropping Kemenkes RI",
    tag: "Program Prioritas",
    desc: "Pasokan terpusat untuk program nasional: TB, HIV, DBD, Imunisasi, Jiwa, Malaria, Kusta, dan Gizi Masyarakat.",
  },
] as const;

export default function LayananPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Layanan" }]}
        eyebrow="Pelayanan"
        title="Standar Pelayanan Operasional"
        subtitle="Pedoman pelayanan lengkap mulai dari jadwal operasional hingga alur distribusi obat."
      />

      {/* ── Siklus Pengelolaan Perbekalan Farmasi ───────────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Rantai Pasok</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Siklus Pengelolaan Perbekalan Farmasi
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-muted">
                Empat tahapan terpadu dalam rantai pasok kefarmasian UPTD IFK Kotabaru untuk menjamin
                efektivitas, mutu, dan kesinambungan ketersediaan obat.
              </p>
            </div>
          </Reveal>

          {/* Kontainer terpadu: divide-y di mobile, 4 kolom di desktop */}
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-white lg:grid lg:grid-cols-4 lg:divide-x lg:divide-y-0 shadow-xs">
            {supplyCycle.map((item, i) => (
              <Reveal key={item.step} delay={80 + i * 80} className="block h-full">
                <div className="group flex h-full flex-col justify-between p-5 sm:p-7 transition-colors duration-300 hover:bg-surface">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tracking-widest text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-md">
                        {item.step}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface border border-border text-brand-700 shadow-xs transition-colors group-hover:bg-brand-50 group-hover:border-brand-300">
                        <item.icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                    </div>

                    <h3 className="mt-4 text-base sm:text-lg font-bold tracking-tight text-heading">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perencanaan (RKO) & Sumber Anggaran ──────────────────────── */}
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Perencanaan Terpadu</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Perencanaan Obat (RKO) &amp; Penganggaran
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-muted">
                Penyusunan Rencana Kebutuhan Obat (RKO) secara ilmiah, transparan, dan terkoordinasi
                lintas sumber pembiayaan daerah maupun nasional.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Box 1: Metodologi RKO */}
            <Reveal delay={80} className="block h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                      <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-heading">
                        Metodologi Analisis RKO
                      </h3>
                      <p className="text-xs text-muted">Pendekatan saintifik perhitungan kebutuhan</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {rkoMethods.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 rounded-xl border border-border/70 bg-white p-4">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <m.icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-heading">{m.title}</h4>
                          <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-muted">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Box 2: Sumber Anggaran */}
            <Reveal delay={160} className="block h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                      <Coins className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-heading">
                        Sinergi Sumber Pembiayaan
                      </h3>
                      <p className="text-xs text-muted">Pengalokasian pos anggaran pengadaan perbekalan</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {fundingSources.map((f, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-white p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-heading">{f.source}</h4>
                            <span className="font-mono text-[10px] font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                              {f.tag}
                            </span>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Kebijakan Satu Pintu & Relokasi Antar-Faskes ─────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Tata Kelola &amp; Pengendalian</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Satu Pintu &amp; Relokasi Aktif
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-muted">
                Strategi pengendalian terpusat untuk menjaga pemerataan stok, mencegah pemborosan obat,
                dan mengeliminasi risiko kekosongan di faskes binaan.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:gap-8">
            <Reveal delay={80} className="block h-full">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-8 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-brand-200 hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <GitMerge className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                      One Gate Policy
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-heading sm:text-xl">
                    Kebijakan Distribusi Satu Pintu
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted">
                    Seluruh perbekalan farmasi dari anggaran daerah maupun dropping program pusat dikelola
                    satu pintu melalui UPTD Instalasi Farmasi guna menjamin tertib administrasi, standardisasi
                    penyimpanan, dan pengawasan mutu rantai dingin yang ketat.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={160} className="block h-full">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-8 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-brand-200 hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <ArrowLeftRight className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Buffer &amp; Mutasi
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-heading sm:text-xl">
                    Sistem Relokasi Antar-Puskesmas
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted">
                    Pemantauan ketersediaan secara aktif memfasilitasi relokasi perbekalan antarfaskes
                    apabila terjadi ketimpangan tren pemakaian. Sistem ini efektif mencegah penumpukan obat
                    kedaluwarsa (dead stock) dan mengamankan faskes dari risiko kekosongan obat.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Jam Pelayanan ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Jam Pelayanan
          </h2>
          </Reveal>
          <Reveal delay={80}>
          <div className="mt-8 overflow-x-auto font-mono">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                    Hari
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted">
                    Jam
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 font-medium text-heading">Senin - Kamis</td>
                  <td className="py-3 text-right text-muted">08.00 — 16.30 WITA</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-heading">Jumat</td>
                  <td className="py-3 text-right text-muted">08.00 — 11.00 WITA</td>
                </tr>
              </tbody>
            </table>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ── Standar Mutu & Penyimpanan ────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Standar Mutu &amp; Penyimpanan
          </h2>
          </Reveal>
          <div className="mt-12 space-y-0 divide-y divide-border">
            {[
              { icon: PackageCheck, title: "FEFO", desc: "First Expired First Out — obat dengan tanggal kedaluwarsa paling depan didistribusikan terlebih dahulu." },
              { icon: Thermometer, title: "Pemantauan Suhu", desc: "Pemantauan suhu gudang dilakukan secara harian dan didokumentasikan dalam logbook." },
              { icon: Snowflake, title: "Cold Chain", desc: "Obat yang membutuhkan suhu dingin (2°C–8°C) disimpan dalam lemari es khusus dengan pemantauan berkelanjutan." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={80 + i * 80}>
              <div className="flex items-start gap-4 py-6">
                <item.icon className="h-10 w-10 shrink-0 text-brand-600" strokeWidth={1} />
                <div>
                  <h3 className="font-semibold text-heading">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.desc}</p>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alur Pelayanan Rutin (LPLPO) ──────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Alur Pelayanan Rutin (LPLPO)
          </h2>
          </Reveal>
          <Reveal delay={80}>
          <p className="mt-2 max-w-[65ch] text-base text-muted">
            Laporan Pemakaian dan Lembar Permintaan Obat — distribusi obat rutin tiap periode.
          </p>
          </Reveal>
          <div className="mt-12 border-l-2 border-brand-300 pl-6">
            {[
              {
                step: "1",
                title: "Periode Distribusi",
                detail:
                  "Distribusi dilakukan secara berkala sesuai periode yang ditentukan (triwulanan atau sesuai jadwal dari Dinas Kesehatan).",
              },
              {
                step: "2",
                title: "Batas Pengajuan",
                detail:
                  "Faskes mengajukan permintaan paling lambat H-14 sebelum periode distribusi dimulai.",
              },
              {
                step: "3",
                title: "Persyaratan",
                detail:
                  "Surat permintaan resmi dari faskes, formulir LPLPO terisi lengkap, dan Daftar Isian Rencana Kebutuhan Obat (DIRKO).",
              },
              {
                step: "4",
                title: "Output Dokumen",
                detail:
                  "Surat persetujuan distribusi, berita acara serah terima obat, dan bukti penerimaan faskes.",
              },
              {
                step: "5",
                title: "Komitmen Waktu",
                detail:
                  "Penyelesaian permintaan dan distribusi obat dilakukan maksimal 10 hari kerja sejak berkas lengkap diterima.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={80 + i * 120}>
              <div className="relative mb-8 last:mb-0">
                <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="font-semibold text-heading">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.detail}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Permintaan Bon / Sewaktu ──────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Permintaan Bon / Sewaktu
          </h2>
          </Reveal>

          <Reveal delay={0}>
          <div className="rounded-[2rem] border border-brand-200/60 bg-brand-50/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-brand-700" strokeWidth={1.5} />
              <span className="font-semibold text-brand-800">Permintaan Darurat / Sewaktu</span>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Reveal delay={80}>
              <div>
                <h4 className="font-semibold text-heading">Kriteria</h4>
                <p className="mt-1 text-sm text-muted">
                  Permintaan di luar periode LPLPO, biasanya untuk kebutuhan mendesak atau kekurangan stok yang
                  mengancam pelayanan pasien.
                </p>
              </div>
              </Reveal>
              <Reveal delay={160}>
              <div>
                <h4 className="font-semibold text-heading">Persyaratan</h4>
                <ul className="mt-1 list-inside list-disc text-sm text-muted">
                  <li>Surat permintaan dari Kepala Faskes</li>
                  <li>Surat keterangan kebutuhan mendesak</li>
                  <li>Daftar obat yang diminta</li>
                </ul>
              </div>
              </Reveal>
              <Reveal delay={240}>
              <div>
                <h4 className="font-semibold text-heading">Metode Penyerahan</h4>
                <p className="mt-1 text-sm text-muted">
                  Pengambilan langsung ke gudang IFK oleh perwakilan faskes, atau pengiriman apabila kondisi
                  memungkinkan.
                </p>
              </div>
              </Reveal>
              <Reveal delay={320}>
              <div>
                <h4 className="font-semibold text-heading">Komitmen Waktu</h4>
                <p className="mt-1 text-sm text-muted">
                  Maksimal <strong>1×24 jam</strong> sejak berkas permintaan lengkap dan disetujui.
                </p>
              </div>
              </Reveal>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ── Obat Rusak & Kedaluwarsa ──────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Penanganan Obat Rusak &amp; Kedaluwarsa
          </h2>
          </Reveal>

          <Reveal delay={0}>
          <div className="rounded-[2rem] border border-red-200/60 bg-red-50/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-700" strokeWidth={1.5} />
              <span className="font-semibold text-red-800">Obat Rusak / Kedaluwarsa</span>
            </div>

            <Reveal delay={80}>
            <div className="mt-6 border-t border-red-200 pt-4">
              <h4 className="font-semibold text-heading">Waktu Pelaporan</h4>
              <p className="mt-1 text-sm text-muted">
                Laporan diajukan paling lambat <strong>7 hari kerja</strong> sejak ditemukannya obat rusak atau
                kedaluwarsa di faskes.
              </p>
            </div>
            </Reveal>
            <Reveal delay={160}>
            <div className="mt-6 border-t border-red-200 pt-4">
              <h4 className="font-semibold text-heading">Persyaratan</h4>
              <ul className="mt-1 list-inside list-disc text-sm text-muted">
                <li>Surat laporan kerusakan dari Kepala Faskes</li>
                <li>Berita Acara Serah Terima (BAST) obat rusak/kedaluwarsa</li>
                <li>Foto obat dan kemasan sebagai lampiran bukti</li>
                <li>Daftar rincian obat (nama, jumlah, batch, kedaluwarsa)</li>
              </ul>
            </div>
            </Reveal>
            <Reveal delay={240}>
            <div className="mt-6 border-t border-red-200 pt-4">
              <h4 className="font-semibold text-heading">Penanganan oleh IFK</h4>
              <p className="mt-1 text-sm text-muted">
                Obat rusak/kedaluwarsa yang diterima dari faskes akan dikarantina di gudang IFK untuk proses
                pemusnahan sesuai ketentuan peraturan perundang-undangan yang berlaku.
              </p>
            </div>
            </Reveal>
          </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
