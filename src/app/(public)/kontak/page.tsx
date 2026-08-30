import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/dummy-data";

export default function KontakPage() {
  return (
    <>
      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Beranda / Kontak</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Kontak Kami</h1>
        </div>
      </section>

      {/* ── 2-kolom ───────────────────────────────────────────────── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Kiri — Info Kontak */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Informasi Kontak</h2>
              <div className="mt-6 space-y-4">
                <Card>
                  <CardContent className="flex items-start gap-3 pt-4">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Alamat</p>
                      <p className="text-sm text-slate-600">{siteConfig.address}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-3 pt-4">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Jam Operasional</p>
                      <p className="whitespace-pre-line text-sm text-slate-600">
                        {siteConfig.operationalHours}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-3 pt-4">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">WhatsApp</p>
                      <a
                        href={siteConfig.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-3 pt-4">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Email</p>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-3 pt-4">
                    <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">SP4N-LAPOR</p>
                      <a
                        href={siteConfig.sp4nLaporUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        lapor.go.id
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Kanan — Google Maps */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Lokasi Kami</h2>
              <div className="mt-6 overflow-hidden rounded-lg border">
                <iframe
                  src={siteConfig.googleMapsEmbedUrl}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi UPTD Instalasi Farmasi Kab. Kotabaru"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
