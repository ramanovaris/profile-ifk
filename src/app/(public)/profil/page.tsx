import Image from "next/image";
import {
  Users,
  Pill,
  FlaskConical,
  UserCog,
  Warehouse,
  Snowflake,
  Lock,
  Network,
  ClipboardCheck,
  PackageCheck,
  Truck,
  RotateCcw,
  BarChart3,
  Layers,
  Coins,
  ShieldCheck,
  GitMerge,
  ArrowLeftRight,
} from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { placeholderImage } from "@/lib/placeholder";
import { getAssetUrl } from "@/lib/utils";
import { getSiteSettings } from "@/actions/setting";
import { OrgStructureViewer } from "@/components/public/org-structure-viewer";

const sdmCategories = [
  {
    role: "Tenaga Apoteker",
    count: "5 Orang",
    icon: Pill,
    desc: "Penanggung jawab teknis kefarmasian, pengawasan mutu sediaan, perencanaan kebutuhan obat daerah (RKO), serta kepatuhan standar CDOB.",
  },
  {
    role: "Tenaga Teknis Kefarmasian (TTK)",
    count: "7 Orang",
    icon: FlaskConical,
    desc: "Pelaksanaan teknis tata kelola penyimpanan gudang, pengendalian kedaluwarsa sistem FEFO, verifikasi batch, dan penyiapan distribusi.",
  },
  {
    role: "Tenaga Fungsional & Pendukung",
    count: "11 Orang",
    icon: UserCog,
    desc: "Pengelolaan SIM logistik terintegrasi (e-Farmasi & SMILE), pemeliharaan elektromedis rantai dingin, tata usaha, serta pengamanan fasilitas.",
  },
] as const;

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

const facilities = [
  {
    title: "Gudang Farmasi 690 m²",
    tag: "Kapasitas Fisik",
    icon: Warehouse,
    desc: "Bangunan gudang penyimpanan utama seluas 690 m² (Sertifikat Hak Pakai No. 30) dengan tata letak palet dan rak terstandarisasi.",
  },
  {
    title: "Rantai Dingin (Cold Chain)",
    tag: "Suhu 2°C – 8°C",
    icon: Snowflake,
    desc: "1 unit Cold Room berkapasitas besar dan 5 unit Cold Chain terkalibrasi berkala untuk menjamin stabilitas vaksin dan produk biologi.",
  },
  {
    title: "Pengamanan Narkotika & Psikotropika",
    tag: "Double Lock System",
    icon: Lock,
    desc: "Lemari penyimpanan khusus berpintu ganda dengan mekanisme kunci ganda (double lock) dan pengawasan akses berkala sesuai regulasi.",
  },
  {
    title: "SIM Logistik Terintegrasi",
    tag: "Digital Logistik",
    icon: Network,
    desc: "Pencatatan dan pemantauan distribusi perbekalan secara real-time melalui integrasi aplikasi e-Farmasi Kemenkes RI dan aplikasi SMILE.",
  },
] as const;

export default async function ProfilPage() {
  const settings = await getSiteSettings();

  const headPhotoSrc = settings.headPhoto
    ? getAssetUrl(settings.headPhoto)
    : placeholderImage(300, 400, "Kepala IFK", "Profil");

  const orgStructureSrc = settings.orgStructurePhoto
    ? getAssetUrl(settings.orgStructurePhoto)
    : placeholderImage(800, 500, "Struktur Organisasi", "Profil");

  const greetingParagraphs = settings.greeting
    ? settings.greeting
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const missionItems = settings.mission
    ? settings.mission
        .split(/\n+/)
        .map((m) => m.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  const tupoksiParagraphs = settings.tupoksi
    ? settings.tupoksi
        .split(/\n+/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Profil" }]}
        eyebrow="Tentang Kami"
        title="Profil Instansi"
        subtitle={`${settings.name} — ${settings.motto}`}
      />

      {/* ── Sambutan Kepala ───────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              Sambutan Kepala UPTD
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-12 block">
            <div className="grid gap-12 md:grid-cols-[280px_1fr]">
              <div className="bezel w-full">
                <div className="bezel-inner relative aspect-[3/4]">
                  <Image
                    src={headPhotoSrc}
                    alt={settings.headName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-700">
                  {settings.headName}
                </p>
                <p className="text-xs font-medium text-zinc-600">{settings.headRole}</p>
                <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-zinc-700">
                  {greetingParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Visi & Misi ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              Visi &amp; Misi
            </h2>
          </Reveal>

          {/* Visi */}
          <Reveal delay={80} className="mt-12 block">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">Visi</h3>
            <div className="mt-3 border-l-2 border-brand-500 pl-4 sm:pl-5">
              <p className="max-w-[70ch] text-base sm:text-lg font-medium leading-relaxed text-zinc-900">
                &ldquo;{settings.vision}&rdquo;
              </p>
            </div>
          </Reveal>

          {/* Misi */}
          <div className="mt-14">
            <Reveal delay={160} className="block">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">Misi</h3>
            </Reveal>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {missionItems.map((item, i) => (
                <Reveal key={i} delay={240 + i * 60} className="block">
                  <div className="flex items-start gap-4 border-t border-border pt-4">
                    <span
                      className="shrink-0 mt-0.5 font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-1 rounded-md"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed text-zinc-800">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tupoksi ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              Tugas Pokok &amp; Fungsi
            </h2>
          </Reveal>

          <Reveal delay={80} className="mt-12 block">
            <div className="space-y-4 max-w-[75ch] text-sm sm:text-base leading-relaxed text-zinc-700">
              {tupoksiParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Struktur Organisasi ───────────────────────────────────── */}
      <section className="border-t border-border bg-white py-20 sm:py-24 text-center">
        <div className="section-container">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              Struktur Organisasi
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-12 block">
            <OrgStructureViewer
              src={orgStructureSrc}
              alt="Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru"
            />
          </Reveal>
        </div>
      </section>

      {/* ── Sumber Daya Manusia ───────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Kapasitas SDM</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Sumber Daya Manusia
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Didukung oleh 24 personel tenaga kefarmasian profesional dan tenaga pendukung
                teknis yang berdedikasi menjaga ketahanan rantai pasok obat Kabupaten Kotabaru.
              </p>
            </div>
          </Reveal>

          {/* Banner total kapasitas */}
          <Reveal delay={60} className="mt-8 block">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200/70 bg-brand-50/50 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                  <Users className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-heading sm:text-xl">
                    Total 24 Personel Aktif
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600">
                    Kepala UPTD, Tenaga Fungsional Kefarmasian, dan Tenaga Teknis Operasional
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-brand-800">
                <span className="rounded-lg bg-white px-3 py-1.5 border border-brand-200/80 shadow-xs">
                  1 Kepala UPTD
                </span>
                <span className="rounded-lg bg-white px-3 py-1.5 border border-brand-200/80 shadow-xs">
                  5 Apoteker
                </span>
                <span className="rounded-lg bg-white px-3 py-1.5 border border-brand-200/80 shadow-xs">
                  7 Tenaga Teknis (TTK)
                </span>
                <span className="rounded-lg bg-white px-3 py-1.5 border border-brand-200/80 shadow-xs">
                  11 Staf Pendukung
                </span>
              </div>
            </div>
          </Reveal>

          {/* Grid Kategori SDM */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sdmCategories.map((item, i) => (
              <Reveal key={item.role} delay={120 + i * 80} className="block h-full">
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-7 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-brand-200 hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 text-brand-700 shadow-xs transition-colors group-hover:border-brand-300 group-hover:bg-brand-100">
                        <item.icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100/70 px-2.5 py-1 rounded-md">
                        {item.count}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base sm:text-lg font-bold tracking-tight text-heading">
                      {item.role}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-700">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Siklus Pengelolaan Perbekalan Farmasi (Rantai Pasok) ─────── */}
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Rantai Pasok</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Siklus Pengelolaan Perbekalan Farmasi
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Empat tahapan terpadu dalam tata kelola logistik kefarmasian UPTD IFK Kotabaru untuk menjamin
                efektivitas, mutu, dan kesinambungan ketersediaan obat.
              </p>
            </div>
          </Reveal>

          {/* Kontainer terpadu: divide-y di mobile, 4 kolom di desktop */}
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface lg:grid lg:grid-cols-4 lg:divide-x lg:divide-y-0 shadow-xs">
            {supplyCycle.map((item, i) => (
              <Reveal key={item.step} delay={80 + i * 80} className="block h-full">
                <div className="group flex h-full flex-col justify-between p-5 sm:p-7 transition-colors duration-300 hover:bg-white">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tracking-widest text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-md">
                        {item.step}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-border text-brand-700 shadow-xs transition-colors group-hover:bg-brand-50 group-hover:border-brand-300">
                        <item.icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                    </div>

                    <h3 className="mt-4 text-base sm:text-lg font-bold tracking-tight text-heading">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-700">
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
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Perencanaan Terpadu</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Perencanaan Obat (RKO) &amp; Penganggaran
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Penyusunan Rencana Kebutuhan Obat (RKO) secara ilmiah, transparan, dan terkoordinasi
                lintas sumber pembiayaan daerah maupun nasional.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Box 1: Metodologi RKO */}
            <Reveal delay={80} className="block h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                      <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-heading">
                        Metodologi Analisis RKO
                      </h3>
                      <p className="text-xs text-zinc-600">Pendekatan saintifik perhitungan kebutuhan</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {rkoMethods.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 rounded-xl border border-border/70 bg-surface/60 p-4">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <m.icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-heading">{m.title}</h4>
                          <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-zinc-700">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Box 2: Sumber Anggaran */}
            <Reveal delay={160} className="block h-full">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                      <Coins className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-heading">
                        Sinergi Sumber Pembiayaan
                      </h3>
                      <p className="text-xs text-zinc-600">Pengalokasian pos anggaran pengadaan perbekalan</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {fundingSources.map((f, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-surface/60 p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-heading">{f.source}</h4>
                            <span className="font-mono text-[10px] font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                              {f.tag}
                            </span>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-700">{f.desc}</p>
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
      <section className="border-t border-border bg-white py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Tata Kelola &amp; Pengendalian</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Satu Pintu &amp; Relokasi Aktif
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Strategi pengendalian terpusat untuk menjaga pemerataan stok, mencegah pemborosan obat,
                dan mengeliminasi risiko kekosongan di faskes binaan.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:gap-8">
            <Reveal delay={80} className="block h-full">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <GitMerge className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                      One Gate Policy
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-heading sm:text-xl">
                    Kebijakan Distribusi Satu Pintu
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-700">
                    Seluruh perbekalan farmasi dari anggaran daerah maupun dropping program pusat dikelola
                    satu pintu melalui UPTD Instalasi Farmasi guna menjamin tertib administrasi, standardisasi
                    penyimpanan, dan pengawasan mutu rantai dingin yang ketat.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={160} className="block h-full">
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-border text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <ArrowLeftRight className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                      Buffer &amp; Mutasi
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-heading sm:text-xl">
                    Sistem Relokasi Antar-Puskesmas
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-700">
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

      {/* ── Sarana & Prasarana Fasilitas ──────────────────────────── */}
      <section className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="section-container">
          <Reveal>
            <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
              <div>
                <span className="eyebrow bg-brand-50 text-brand-700">Infrastruktur</span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
                  Sarana &amp; Fasilitas Gudang
                </h2>
              </div>
              <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
                Fasilitas penyimpanan terstandarisasi, sistem pendingin bersertifikasi, dan pengawasan
                berkelanjutan untuk menjaga stabilitas perbekalan farmasi.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8">
            {facilities.map((facility, i) => (
              <Reveal key={facility.title} delay={80 + i * 80} className="block h-full">
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 sm:p-8 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-brand-200 hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <facility.icon className="h-6 w-6" strokeWidth={1.5} />
                      </span>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                        {facility.tag}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold tracking-tight text-heading sm:text-xl">
                      {facility.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-700">
                      {facility.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
