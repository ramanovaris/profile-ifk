import Image from "next/image";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";

export default function ProfilPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Profil" }]}
        eyebrow="Tentang Kami"
        title="Profil Instansi"
        subtitle="UPTD Instalasi Farmasi Kab. Kotabaru — Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat."
      />

      {/* ── Sambutan Kepala ───────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Sambutan Kepala UPTD
          </h2>
          </Reveal>
          <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr]">
            <div className="bezel w-full">
              <div className="bezel-inner relative aspect-[3/4]">
                <Image
                  src="https://picsum.photos/seed/ifk-kepala/300/400"
                  alt="Kepala UPTD Instalasi Farmasi"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-700">
                apt. H. Muhammad Yusuf, S.Farm
              </p>
              <p className="text-xs text-muted">Kepala UPTD Instalasi Farmasi Kab. Kotabaru</p>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
                <p>Assalamualaikum Warahmatullahi Wabarakatuh.</p>
                <p>
                  Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat
                  dan karunia-Nya sehingga UPTD Instalasi Farmasi Kabupaten Kotabaru dapat terus
                  memberikan pelayanan terbaik di bidang kefarmasian bagi masyarakat Kabupaten
                  Kotabaru.
                </p>
                <p>
                  Kami berkomitmen untuk terus meningkatkan kualitas distribusi obat dan farmasi,
                  menjaga mutu pelayanan, serta memastikan ketersediaan obat yang aman, berkhasiat,
                  dan berkualitas di seluruh fasilitas kesehatan binaan.
                </p>
                <p>Semoga website ini dapat menjadi sarana informasi yang bermanfaat bagi seluruh masyarakat.</p>
                <p>Wassalamualaikum Warahmatullahi Wabarakatuh.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visi & Misi ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Visi &amp; Misi
          </h2>
          </Reveal>

          {/* Visi */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-muted">Visi</h3>
            <p className="mt-4 max-w-[65ch] text-base italic leading-relaxed text-heading">
              Menjadi pengelola logistik kefarmasian yang profesional dan terpercaya dalam
              mendukung ketersediaan obat bermutu bagi seluruh masyarakat Kabupaten Kotabaru.
            </p>
          </div>

          {/* Misi */}
          <div className="mt-16">
            <h3 className="text-lg font-semibold text-muted">Misi</h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {[
                "Mengoptimalkan distribusi obat ke fasilitas kesehatan secara tepat waktu dan tepat jumlah.",
                "Menjamin mutu dan keamanan obat melalui pengawasan sesuai standar farmakope.",
                "Memberikan pelayanan kefarmasian yang profesional, cepat, dan akurat.",
                "Meningkatkan kompetensi SDM melalui pelatihan dan pengembangan berkelanjutan.",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 border-t border-border pt-4"
                >
                  <span
                    className="shrink-0 text-4xl font-bold text-brand-200"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tupoksi ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Tugas Pokok &amp; Fungsi
          </h2>
          </Reveal>

          {/* Tugas Pokok */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-muted">Tugas Pokok</h3>
            <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-muted">
              <li>Melaksanakan pelayanan kefarmasian di bidang penyaluran obat dan bahan medis habis pakai.</li>
              <li>Melaksanakan pengendalian mutu distribusi obat dan bahan medis habis pakai.</li>
              <li>Melaksanakan pembinaan teknis kefarmasian terhadap fasilitas kesehatan binaan.</li>
            </ol>
          </div>

          {/* Fungsi */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-muted">Fungsi</h3>
            <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-muted">
              <li>Perencanaan kebutuhan dan pengadaan obat serta bahan medis habis pakai.</li>
              <li>Penyimpanan dan pengelolaan stok obat sesuai standar farmakope.</li>
              <li>Distribusi dan penyaluran obat ke faskes binaan secara tepat waktu.</li>
              <li>Pengawasan mutu obat melalui pemeriksaan fisik dan dokumentasi.</li>
              <li>Pembinaan dan sosialisasi tata cara pengelolaan obat di faskes.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* ── Struktur Organisasi ───────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24 text-center">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Struktur Organisasi
          </h2>
          </Reveal>
          <div className="bezel mx-auto mt-12 max-w-3xl">
            <div className="bezel-inner">
              <Image
                src="https://picsum.photos/seed/ifk-struktur/800/500"
                alt="Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru"
                width={800}
                height={500}
                className="h-auto w-full"
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">
            Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru
          </p>
        </div>
      </section>
    </>
  );
}
