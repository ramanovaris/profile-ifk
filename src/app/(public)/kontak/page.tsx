import { MapPin, Phone, Mail, Clock, ExternalLink, MessageSquareText } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { getSiteSettings } from "@/actions/setting";

// Override per-section untuk section tinggi — trigger IO lebih awal + fallback cepat
const ioRootMargin = "0px 0px 50px 0px";
const ioThreshold = 0.05;
const ioFallback = 800;
// Per-section delay judul → item pertama (konsisten /profil & /layanan)
const sectionDelay = 80;
// Stagger increment per item (rhythm medium, sama dengan /profil)
const stagger = 80;

export default async function KontakPage() {
  const settings = await getSiteSettings();

  const items = [
    {
      icon: MapPin,
      label: "Alamat",
      value: settings.address,
    },
    {
      icon: Clock,
      label: "Jam Operasional",
      value: settings.operationalHours,
      pre: true,
    },
    {
      icon: Phone,
      label: "WhatsApp",
      value: settings.phone,
      link: settings.whatsappLink,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      mailto: settings.email,
    },
    {
      icon: ExternalLink,
      label: "SP4N-LAPOR",
      value: "lapor.go.id",
      link: settings.sp4nLaporUrl,
    },
  ];

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
        eyebrow="Pelayanan Publik"
        title="Layanan Kontak & Informasi"
        subtitle="Saluran resmi komunikasi, konsultasi kefarmasian, dan layanan pengaduan terpadu UPTD Instalasi Farmasi Kabupaten Kotabaru."
        rightContent={
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 border border-brand-400/20">
                  <MessageSquareText className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Kanal Konsultasi &amp; Pengaduan</h3>
                  <p className="text-[11px] text-zinc-400">Saluran Resmi Komunikasi Publik</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
                Respon Cepat
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {settings.whatsappLink && (
                <a
                  href={settings.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs text-zinc-200 transition-colors hover:bg-white/[0.07] hover:border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">WhatsApp Pelayanan IFK</p>
                      <p className="text-[10px] text-zinc-400">{settings.phone}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </a>
              )}

              {settings.sp4nLaporUrl && (
                <a
                  href={settings.sp4nLaporUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs text-zinc-200 transition-colors hover:bg-white/[0.07] hover:border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="h-4 w-4 text-brand-300" />
                    <div>
                      <p className="font-semibold text-white">SP4N-LAPOR! Kotabaru</p>
                      <p className="text-[10px] text-zinc-400">Portal Pengaduan Pelayanan Publik</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </a>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-zinc-400">
              <span>Konsultasi aktif di jam operasional</span>
              <span className="font-mono text-xs text-brand-300">WITA</span>
            </div>
          </div>
        }
      />

      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
            {/* Kiri — Info Kontak */}
            <div>
              <Reveal
                rootMargin={ioRootMargin}
                threshold={ioThreshold}
                fallbackMs={ioFallback}
                delay={sectionDelay}
              >
                <h2 className="text-xl font-bold text-heading">Informasi Kontak</h2>
              </Reveal>

              <div className="mt-8 space-y-0 divide-y divide-border">
                {items.map((item, i) => (
                  <Reveal
                    key={item.label}
                    rootMargin={ioRootMargin}
                    threshold={ioThreshold}
                    fallbackMs={ioFallback}
                    delay={sectionDelay + i * stagger}
                  >
                    <div className="flex items-start gap-3 py-6">
                      <item.icon
                        className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                        strokeWidth={1.5}
                      />
                      <div>
                        <p className="text-sm font-medium text-heading">{item.label}</p>
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-brand-600 hover:text-brand-800 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : item.mailto ? (
                          <a
                            href={`mailto:${item.mailto}`}
                            className="mt-1 text-sm text-brand-600 hover:text-brand-800 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p
                            className={`mt-1 ${item.pre ? "whitespace-pre-line" : ""} text-sm text-zinc-700`}
                          >
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Kanan — Google Maps */}
            <div>
              <Reveal
                rootMargin={ioRootMargin}
                threshold={ioThreshold}
                fallbackMs={ioFallback}
                delay={sectionDelay}
              >
                <h2 className="text-xl font-bold text-heading">Lokasi Kami</h2>
              </Reveal>
              <Reveal
                rootMargin={ioRootMargin}
                threshold={ioThreshold}
                fallbackMs={ioFallback}
              >
                <div className="bezel mt-8">
                  <div className="bezel-inner">
                    <iframe
                      src={settings.googleMapsEmbedUrl}
                      width="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokasi UPTD Instalasi Farmasi Kab. Kotabaru"
                      className="h-[360px] w-full md:h-[440px]"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
