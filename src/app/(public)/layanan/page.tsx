import { Thermometer, Snowflake, PackageCheck, AlertTriangle } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
export default function LayananPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Layanan" }]}
        eyebrow="Pelayanan"
        title="Standar Pelayanan Operasional"
        subtitle="Pedoman pelayanan lengkap mulai dari jadwal operasional hingga alur distribusi obat."
      />

      {/* ── Jam Pelayanan ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-24">
        <div className="section-container">
          <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Jam Pelayanan
          </h2>
          </Reveal>
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
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 py-6">
                <item.icon className="h-10 w-10 shrink-0 text-brand-600" strokeWidth={1} />
                <div>
                  <h3 className="font-semibold text-heading">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.desc}</p>
                </div>
              </div>
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
          <p className="mt-2 max-w-[65ch] text-base text-muted">
            Layanan Pengadaan Logistik Pemerintah Obligasi — distribusi obat rutin tiap periode.
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
                title: "SLA",
                detail:
                  "Penyelesaian permintaan dan distribusi obat dilakukan maksimal 10 hari kerja sejak berkas lengkap diterima.",
              },
            ].map((item) => (
              <div key={item.step} className="relative mb-8 last:mb-0">
                <div className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="font-semibold text-heading">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.detail}</p>
              </div>
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

          <div className="rounded-[2rem] border border-brand-200/60 bg-brand-50/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-brand-700" strokeWidth={1.5} />
              <span className="font-semibold text-brand-800">Permintaan Darurat / Sewaktu</span>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-heading">Kriteria</h4>
                <p className="mt-1 text-sm text-muted">
                  Permintaan di luar periode LPLPO, biasanya untuk kebutuhan mendesak atau kekurangan stok yang
                  mengancam pelayanan pasien.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-heading">Persyaratan</h4>
                <ul className="mt-1 list-inside list-disc text-sm text-muted">
                  <li>Surat permintaan dari Kepala Faskes</li>
                  <li>Surat keterangan kebutuhan mendesak</li>
                  <li>Daftar obat yang diminta</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-heading">Metode Penyerahan</h4>
                <p className="mt-1 text-sm text-muted">
                  Pengambilan langsung ke gudang IFK oleh perwakilan faskes, atau pengiriman apabila kondisi
                  memungkinkan.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-heading">SLA</h4>
                <p className="mt-1 text-sm text-muted">
                  Maksimal <strong>1×24 jam</strong> sejak berkas permintaan lengkap dan disetujui.
                </p>
              </div>
            </div>
          </div>
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

          <div className="rounded-[2rem] border border-red-200/60 bg-red-50/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-700" strokeWidth={1.5} />
              <span className="font-semibold text-red-800">Obat Rusak / Kedaluwarsa</span>
            </div>

            <div className="mt-6 space-y-6">
              <div className="border-t border-red-200 pt-4">
                <h4 className="font-semibold text-heading">Waktu Pelaporan</h4>
                <p className="mt-1 text-sm text-muted">
                  Laporan diajukan paling lambat <strong>7 hari kerja</strong> sejak ditemukannya obat rusak atau
                  kedaluwarsa di faskes.
                </p>
              </div>
              <div className="border-t border-red-200 pt-4">
                <h4 className="font-semibold text-heading">Persyaratan</h4>
                <ul className="mt-1 list-inside list-disc text-sm text-muted">
                  <li>Surat laporan kerusakan dari Kepala Faskes</li>
                  <li>Berita Acara Serah Terima (BAST) obat rusak/kedaluwarsa</li>
                  <li>Foto obat dan kemasan sebagai lampiran bukti</li>
                  <li>Daftar rincian obat (nama, jumlah, batch, kedaluwarsa)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 border-t border-red-200 pt-4">
              <h4 className="font-semibold text-heading">Penanganan oleh IFK</h4>
              <p className="mt-1 text-sm text-muted">
                Obat rusak/kedaluwarsa yang diterima dari faskes akan dikarantina di gudang IFK untuk proses
                pemusnahan sesuai ketentuan peraturan perundang-undangan yang berlaku.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
