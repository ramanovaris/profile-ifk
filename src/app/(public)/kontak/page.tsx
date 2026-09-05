import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { siteConfig } from "@/lib/dummy-data";

// Override per-section untuk section tinggi — trigger IO lebih awal + fallback cepat
const ioRootMargin = "0px 0px 50px 0px";
const ioThreshold = 0.05;
const ioFallback = 800;
// Per-section delay judul → item pertama (konsisten /profil & /layanan)
const sectionDelay = 80;
// Stagger increment per item (rhythm medium, sama dengan /profil)
const stagger = 80;

export default function KontakPage() {
  const items = [
    {
      icon: MapPin,
      label: "Alamat",
      value: siteConfig.address,
    },
    {
      icon: Clock,
      label: "Jam Operasional",
      value: siteConfig.operationalHours,
      pre: true,
    },
    {
      icon: Phone,
      label: "WhatsApp",
      value: siteConfig.phone,
      link: siteConfig.whatsappLink,
    },
    {
      icon: Mail,
      label: "Email",
      value: siteConfig.email,
      mailto: siteConfig.email,
    },
    {
      icon: ExternalLink,
      label: "SP4N-LAPOR",
      value: "lapor.go.id",
      link: siteConfig.sp4nLaporUrl,
    },
  ];

  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
        eyebrow="Hubungi"
        title="Kontak Kami"
        subtitle="Hubungi kami untuk informasi lebih lanjut seputar layanan kefarmasian."
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
                            className={`mt-1 ${item.pre ? "whitespace-pre-line" : ""} text-sm text-muted`}
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
                      src={siteConfig.googleMapsEmbedUrl}
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
