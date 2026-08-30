import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { siteConfig } from "@/lib/dummy-data";

export default function KontakPage() {
  return (
    <>
      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="page-hero pb-24 pt-36 text-white">
        <div className="section-container">
          <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]} />
          <span className="eyebrow mt-6 border border-white/10 bg-white/5 text-brand-300">
            Hubungi
          </span>
          <h1 className="mt-4 text-5xl font-bold tracking-tighter sm:text-6xl">
            Kontak Kami
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-zinc-400">
            Hubungi kami untuk informasi lebih lanjut seputar layanan kefarmasian.
          </p>
        </div>
      </section>

      {/* ── 2-kolom ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
            {/* Kiri — Info Kontak */}
            <div>
              <h2 className="text-xl font-bold text-heading">Informasi Kontak</h2>
              <div className="mt-8 space-y-0 divide-y divide-border">
                {[
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
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 py-6">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" strokeWidth={1.5} />
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
                ))}
              </div>
            </div>

            {/* Kanan — Google Maps */}
            <div>
              <h2 className="text-xl font-bold text-heading">Lokasi Kami</h2>
              <div className="bezel mt-8">
                <div className="bezel-inner">
                <iframe
                  src={siteConfig.googleMapsEmbedUrl}
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi UPTD Instalasi Farmasi Kab. Kotabaru"
                  className="h-full w-full grayscale"
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
