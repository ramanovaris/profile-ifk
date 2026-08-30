import { Card, CardContent } from "@/components/ui/card";

export default function ProfilPage() {
  return (
    <>
      {/* ── Header ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            Beranda / Profil
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Profil Instansi</h1>
        </div>
      </section>

      {/* ── Sambutan Kepala ───────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Sambutan Kepala UPTD</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-[auto_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://placehold.co/300x360/f1f5f9/475569?text=Foto+Kepala+IFK"
              alt="Kepala UPTD Instalasi Farmasi"
              className="mx-auto h-72 w-56 rounded-lg object-cover md:mx-0"
            />
            <div>
              <p className="text-sm font-semibold text-blue-700">
                apt. H. Muhammad Yusuf, S.Farm
              </p>
              <p className="text-xs text-slate-500">Kepala UPTD Instalasi Farmasi Kab. Kotabaru</p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <p>
                  Assalamualaikum Warahmatullahi Wabarakatuh.
                </p>
                <p>
                  Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga
                  UPTD Instalasi Farmasi Kabupaten Kotabaru dapat terus memberikan pelayanan terbaik di bidang
                  kefarmasian bagi masyarakat Kabupaten Kotabaru.
                </p>
                <p>
                  Kami berkomitmen untuk terus meningkatkan kualitas distribusi obat dan farmasi, menjaga mutu
                  pelayanan, serta memastikan ketersediaan obat yang aman, berkhasiat, dan berkualitas di seluruh
                  fasilitas kesehatan binaan.
                </p>
                <p>
                  Semoga website ini dapat menjadi sarana informasi yang bermanfaat bagi seluruh masyarakat.
                </p>
                <p>Wassalamualaikum Warahmatullahi Wabarakatuh.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visi & Misi ───────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Visi &amp; Misi</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900">Visi</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Menjadi pengelola logistik kefarmasian yang profesional dan terpercaya dalam mendukung ketersediaan
                  obat bermutu bagi seluruh masyarakat Kabupaten Kotabaru.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900">Misi</h3>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">
                  <li>Mengoptimalkan distribusi obat ke fasilitas kesehatan secara tepat waktu dan tepat jumlah.</li>
                  <li>Menjamin mutu dan keamanan obat melalui pengawasan sesuai standar farmakope.</li>
                  <li>Memberikan pelayanan kefarmasian yang profesional, cepat, dan akurat.</li>
                  <li>Meningkatkan kompetensi SDM melalui pelatihan dan pengembangan berkelanjutan.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Tupoksi ───────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Tugas Pokok &amp; Fungsi</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Tugas Pokok */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900">Tugas Pokok</h3>
                <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
                  <li>
                    Melaksanakan kegiatan pelayanan kefarmasian di bidang penyaluran obat dan bahan medis habis
                    pakai.
                  </li>
                  <li>
                    Melaksanakan pengendalian mutu distribusi obat dan bahan medis habis pakai.
                  </li>
                  <li>
                    Melaksanakan pembinaan teknis kefarmasian terhadap fasilitas kesehatan binaan.
                  </li>
                </ol>
              </CardContent>
            </Card>
            {/* Fungsi */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-slate-900">Fungsi</h3>
                <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
                  <li>Perencanaan kebutuhan dan pengadaan obat serta bahan medis habis pakai.</li>
                  <li>Penyimpanan dan pengelolaan stok obat sesuai standar farmakope.</li>
                  <li>Distribusi dan penyaluran obat ke faskes binaan secara tepat waktu.</li>
                  <li>Pengawasan mutu obat melalui pemeriksaan fisik dan dokumentasi.</li>
                  <li>Pembinaan dan sosialisasi tata cara pengelolaan obat di faskes.</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Struktur Organisasi ───────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Struktur Organisasi</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://placehold.co/800x500/f1f5f9/475569?text=Struktur+Organisasi+IFK"
            alt="Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru"
            className="mx-auto mt-6 w-full max-w-3xl rounded-lg shadow"
          />
          <p className="mt-3 text-sm text-slate-500">
            Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru
          </p>
        </div>
      </section>
    </>
  );
}
