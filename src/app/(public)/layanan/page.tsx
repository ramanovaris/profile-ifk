import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Thermometer,
  Snowflake,
  PackageCheck,
  AlertTriangle,
  ArrowDown,

} from "lucide-react";

export default function LayananPage() {
  return (
    <>
      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Beranda / Layanan</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Standar Pelayanan Operasional
          </h1>
        </div>
      </section>

      {/* ── Jam Pelayanan ─────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Jam Pelayanan</h2>
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-700" />
                <h3 className="font-semibold text-slate-900">Jam Operasional</h3>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-slate-700">Senin - Kamis</td>
                      <td className="py-2 text-right text-slate-600">08.00 — 16.30 WITA</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-slate-700">Jumat</td>
                      <td className="py-2 text-right text-slate-600">08.00 — 11.00 WITA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Standar Mutu & Penyimpanan ────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Standar Mutu &amp; Penyimpanan</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: PackageCheck,
                title: "FEFO",
                desc: "First Expired First Out — obat dengan tanggal kedaluwarsa paling depan didistribusikan terlebih dahulu.",
              },
              {
                icon: Thermometer,
                title: "Pemantauan Suhu",
                desc: "Pemantauan suhu gudang dilakukan secara harian dan didokumentasikan dalam logbook.",
              },
              {
                icon: Snowflake,
                title: "Cold Chain",
                desc: "Obat yang membutuhkan suhu dingin (2°C–8°C) disimpan dalam lemari es khusus dengan pemantauan berkelanjutan.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <item.icon className="h-8 w-8 text-blue-700" />
                  <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alur Pelayanan Rutin (LPLPO) ──────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Alur Pelayanan Rutin (LPLPO)
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Layanan Pengadaan Logistik Pemerintah Obligasi — distribusi obat rutin tiap periode.
          </p>

          <div className="relative mt-8 ml-4 border-l-2 border-blue-200 pl-8">
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
                title: "SLA",
                detail:
                  "Penyelesaian permintaan dan distribusi obat dilakukan maksimal 10 hari kerja sejak berkas lengkap diterima.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative mb-8 last:mb-0">
                <div className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                {i < 4 && (
                  <ArrowDown className="absolute -left-10 top-10 h-4 w-4 text-blue-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alur Permintaan Bon / Sewaktu ─────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Alur Permintaan Bon / Sewaktu
          </h2>
          <Card className="mt-6 border-l-4 border-orange-400">
            <CardContent className="pt-6">
              <Badge variant="secondary" className="mb-2">Permintaan Darurat / Sewaktu</Badge>
              <div className="mt-3 grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-slate-900">Kriteria</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Permintaan di luar periode LPLPO, biasanya untuk kebutuhan mendesak atau kekurangan stok yang
                    mengancam pelayanan pasien.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Persyaratan</h4>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                    <li>Surat permintaan dari Kepala Faskes</li>
                    <li>Surat keterangan kebutuhan mendesak</li>
                    <li>Daftar obat yang diminta</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Metode Penyerahan</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Pengambilan langsung ke gudang IFK oleh perwakilan faskes, atau pengiriman apabila kondisi
                    memungkinkan.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">SLA</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Maksimal <strong>1×24 jam</strong> sejak berkas permintaan lengkap dan disetujui.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Alur Penanganan Obat Rusak & Kedaluwarsa ──────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Alur Penanganan Obat Rusak &amp; Kedaluwarsa
          </h2>
          <Card className="mt-6 border-l-4 border-red-400">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <Badge variant="destructive">Obat Rusak / Kedaluwarsa</Badge>
              </div>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-slate-900">Waktu Pelaporan</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Laporan diajukan paling lambat <strong>7 hari kerja</strong> sejak ditemukannya obat rusak atau
                    kedaluwarsa di faskes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Persyaratan</h4>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                    <li>Surat laporan kerusakan dari Kepala Faskes</li>
                    <li>Berita Acara Serah Terima (BAST) obat rusak/kedaluwarsa</li>
                    <li>Foto obat dan kemasan sebagai lampiran bukti</li>
                    <li>Daftar rincian obat (nama, jumlah, batch, kedaluwarsa)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-slate-900">Penanganan oleh IFK</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Obat rusak/kedaluwarsa yang diterima dari faskes akan dikarantina di gudang IFK untuk proses
                  pemusnahan sesuai ketentuan peraturan perundang-undangan yang berlaku.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
