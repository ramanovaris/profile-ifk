import Image from "next/image";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { placeholderImage } from "@/lib/placeholder";
import { getAssetUrl } from "@/lib/utils";
import { getSiteSettings } from "@/actions/setting";
import { OrgStructureViewer } from "@/components/public/org-structure-viewer";

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
      <section className="border-t border-border bg-surface py-24">
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
                <p className="text-xs text-muted">{settings.headRole}</p>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
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
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
              Visi &amp; Misi
            </h2>
          </Reveal>

          {/* Visi */}
          <Reveal delay={80} className="mt-12 block">
            <h3 className="text-lg font-semibold text-muted">Visi</h3>
            <p className="mt-4 max-w-[65ch] text-base italic leading-relaxed text-heading">
              {settings.vision}
            </p>
          </Reveal>

          {/* Misi */}
          <div className="mt-16">
            <Reveal delay={160} className="block">
              <h3 className="text-lg font-semibold text-muted">Misi</h3>
            </Reveal>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {missionItems.map((item, i) => (
                <Reveal key={i} delay={240 + i * 60} className="block">
                  <div className="flex items-start gap-4 border-t border-border pt-4">
                    <span
                      className="shrink-0 text-4xl font-bold text-brand-200"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted">{item}</p>
                  </div>
                </Reveal>
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

          <Reveal delay={80} className="mt-12 block">
            <div className="space-y-4 max-w-[75ch] text-sm leading-relaxed text-muted">
              {tupoksiParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </Reveal>
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
          <Reveal delay={80} className="mt-12 block">
            <OrgStructureViewer
              src={orgStructureSrc}
              alt="Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
