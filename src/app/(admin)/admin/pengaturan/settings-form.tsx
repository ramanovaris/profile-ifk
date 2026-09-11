"use client";

import { useState, useRef, useTransition, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import type { SiteSetting } from "@prisma/client";
import {
  Building2,
  FileText,
  Link2,
  Save,
  RotateCcw,
  Phone,
  Mail,
  ExternalLink,
  Camera,
  Upload,
  Globe,
  Radio,
  Share2,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { placeholderImage } from "@/lib/placeholder";
import { cn } from "@/lib/utils";
import { updateSiteIdentityAction } from "@/actions/setting";

type TabKey = "identitas" | "profil" | "tautan";

interface SettingsFormProps {
  initialSettings: SiteSetting;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("identitas");
  const [isPending, startTransition] = useTransition();

  // ── Tab 1: Identitas & Kontak State ───────────────────────────────────────
  const initialIdentity = {
    name: initialSettings.name,
    shortName: initialSettings.shortName,
    tagline: initialSettings.tagline,
    motto: initialSettings.motto,
    address: initialSettings.address,
    operationalHours: initialSettings.operationalHours,
    phone: initialSettings.phone,
    whatsappLink: initialSettings.whatsappLink,
    email: initialSettings.email,
    googleMapsEmbedUrl: initialSettings.googleMapsEmbedUrl,
  };
  const [identityForm, setIdentityForm] = useState(initialIdentity);

  // ── Tab 2: Konten Profil UPTD State ───────────────────────────────────────
  const initialProfile = {
    headName: "apt. H. Muhammad Yusuf, S.Farm",
    headRole: "Kepala UPTD Instalasi Farmasi Kab. Kotabaru",
    headPhoto: placeholderImage(300, 400, "Kepala IFK", "Profil"),
    greeting: `Assalamualaikum Warahmatullahi Wabarakatuh.\n\nPuji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga UPTD Instalasi Farmasi Kabupaten Kotabaru dapat terus memberikan pelayanan terbaik di bidang kefarmasian bagi masyarakat Kabupaten Kotabaru.\n\nKami berkomitmen untuk terus meningkatkan kualitas distribusi obat dan farmasi, menjaga mutu pelayanan, serta memastikan ketersediaan obat yang aman, berkhasiat, dan berkualitas di seluruh fasilitas kesehatan binaan.\n\nSemoga website ini dapat menjadi sarana informasi yang bermanfaat bagi seluruh masyarakat.\n\nWassalamualaikum Warahmatullahi Wabarakatuh.`,
    vision: `Terwujudnya Pelayanan Kefarmasian yang Bermutu, Merata, dan Terjangkau Menuju Masyarakat Kabupaten Kotabaru yang Sehat dan Mandiri.`,
    mission: `1. Menjamin ketersediaan, pemerataan, dan keterjangkauan obat dan perbekalan kesehatan di seluruh fasilitas kesehatan binaan.\n2. Meningkatkan mutu pengelolaan dan pengawasan obat secara transparan dan akuntabel.\n3. Mengembangkan kapasitas sumber daya manusia dan pemanfaatan teknologi informasi dalam pengelolaan kefarmasian.\n4. Mendorong pemberdayaan masyarakat dalam penggunaan obat yang rasional dan bijak.`,
    tupoksi: `UPTD Instalasi Farmasi mempunyai tugas melaksanakan kegiatan teknis operasional dinas dalam pengelolaan obat, alat kesehatan, dan perbekalan kesehatan lainnya yang meliputi perencanaan kebutuhan, penerimaan, penyimpanan, pemeliharaan, pendistribusian, pemantauan, serta evaluasi.`,
  };
  const [profileForm, setProfileForm] = useState(initialProfile);
  const headPhotoInputRef = useRef<HTMLInputElement>(null);

  // ── Tab 3: Tautan & Layanan State ─────────────────────────────────────────
  const initialLinks = {
    sp4nLaporUrl: initialSettings.sp4nLaporUrl,
    dinkesUrl: "https://dinkes.kotabarukab.go.id",
    instagramUrl: "https://instagram.com/ifk_kotabaru",
    facebookUrl: "https://facebook.com/ifk.kotabaru",
    youtubeUrl: "https://youtube.com/@ifkkotabaru",
    announcementEnabled: false,
    announcementType: "info" as "info" | "warning" | "important",
    announcementText:
      "Layanan penerimaan dan distribusi obat libur nasional. Layanan darurat kefarmasian tetap disiagakan.",
  };
  const [linksForm, setLinksForm] = useState(initialLinks);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleIdentitySave = (e: FormEvent) => {
    e.preventDefault();
    if (!identityForm.name.trim() || !identityForm.shortName.trim()) {
      toast.error("Nama instansi dan nama singkat tidak boleh kosong.");
      return;
    }

    startTransition(async () => {
      const res = await updateSiteIdentityAction(identityForm);
      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan identitas instansi.");
        return;
      }
      toast.success("Identitas dan kontak lembaga berhasil disimpan ke basis data.");
    });
  };

  const handleIdentityReset = () => {
    setIdentityForm(initialIdentity);
    toast.info("Form identitas dikembalikan ke data awal basis data.");
  };

  const handleProfilePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileForm((prev) => ({ ...prev, headPhoto: url }));
      toast.success("Foto pimpinan berhasil diperbarui.");
    }
  };

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault();
    if (!profileForm.headName.trim()) {
      toast.error("Nama Kepala UPTD tidak boleh kosong.");
      return;
    }
    toast.success("Konten profil UPTD berhasil disimpan.");
  };

  const handleProfileReset = () => {
    setProfileForm(initialProfile);
    toast.info("Form konten profil dikembalikan ke data default.");
  };

  const handleLinksSave = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Tautan layanan eksternal berhasil disimpan.");
  };

  const handleLinksReset = () => {
    setLinksForm(initialLinks);
    toast.info("Form tautan layanan dikembalikan ke data default.");
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Segmented Tab Bar */}
      <div className="inline-flex max-w-full gap-1.5 overflow-x-auto rounded-xl border border-white/5 bg-zinc-900/80 p-1.5 backdrop-blur-xl scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("identitas")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm active:scale-[0.98]",
            activeTab === "identitas"
              ? "border border-brand-500/30 bg-brand-500/15 font-semibold text-brand-300 shadow-sm shadow-brand-500/20"
              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>Identitas &amp; Kontak</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm active:scale-[0.98]",
            activeTab === "profil"
              ? "border border-brand-500/30 bg-brand-500/15 font-semibold text-brand-300 shadow-sm shadow-brand-500/20"
              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          )}
        >
          <FileText className="h-4 w-4" />
          <span>Konten Profil UPTD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tautan")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm active:scale-[0.98]",
            activeTab === "tautan"
              ? "border border-brand-500/30 bg-brand-500/15 font-semibold text-brand-300 shadow-sm shadow-brand-500/20"
              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          )}
        >
          <Link2 className="h-4 w-4" />
          <span>Tautan &amp; Layanan</span>
        </button>
      </div>

      {/* ── TAB 1: IDENTITAS & KONTAK ────────────────────────────────────── */}
      {activeTab === "identitas" && (
        <form onSubmit={handleIdentitySave} className="space-y-6">
          {/* Kartu Identitas Lembaga */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-brand-500/10 via-emerald-500/5 to-transparent blur-2xl" />

            <div className="relative flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Identitas Instansi</h2>
                <p className="text-xs text-zinc-400">
                  Nama resmi, inisial lembaga, motto pelayanan, dan slogan publik.
                </p>
              </div>
            </div>

            <div className="relative mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instansi-name" className="text-xs font-medium text-zinc-300">
                  Nama Lengkap Instansi <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="instansi-name"
                  value={identityForm.name}
                  onChange={(e) => setIdentityForm({ ...identityForm, name: e.target.value })}
                  placeholder="Contoh: UPTD Instalasi Farmasi Kab. Kotabaru"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instansi-short" className="text-xs font-medium text-zinc-300">
                  Nama Pendek / Inisial <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="instansi-short"
                  value={identityForm.shortName}
                  onChange={(e) => setIdentityForm({ ...identityForm, shortName: e.target.value })}
                  placeholder="Contoh: IFK Kotabaru"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instansi-tagline" className="text-xs font-medium text-zinc-300">
                  Tagline Ringkas
                </Label>
                <Input
                  id="instansi-tagline"
                  value={identityForm.tagline}
                  onChange={(e) => setIdentityForm({ ...identityForm, tagline: e.target.value })}
                  placeholder="Contoh: Stok Valid, Team Solid"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instansi-motto" className="text-xs font-medium text-zinc-300">
                  Motto Pelayanan
                </Label>
                <Textarea
                  id="instansi-motto"
                  rows={2}
                  value={identityForm.motto}
                  onChange={(e) => setIdentityForm({ ...identityForm, motto: e.target.value })}
                  placeholder="Contoh: Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>
            </div>
          </div>

          {/* Kartu Kontak & Lokasi Pelayanan */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="relative flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Kontak &amp; Alamat Pelayanan</h2>
                <p className="text-xs text-zinc-400">
                  Alamat kantor, nomor kontak resmi, jam buka pelayanan, dan integrasi Google Maps.
                </p>
              </div>
            </div>

            <div className="relative mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-address" className="text-xs font-medium text-zinc-300">
                  Alamat Lengkap Kantor
                </Label>
                <Textarea
                  id="contact-address"
                  rows={2}
                  value={identityForm.address}
                  onChange={(e) => setIdentityForm({ ...identityForm, address: e.target.value })}
                  placeholder="Jl. Kenanga Desa Dirgahayu, Kotabaru 72116. Telp/Fax (0518) 21603"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-hours" className="text-xs font-medium text-zinc-300">
                  Jam Operasional Pelayanan (Format Baris Baru)
                </Label>
                <Textarea
                  id="contact-hours"
                  rows={2}
                  value={identityForm.operationalHours}
                  onChange={(e) => setIdentityForm({ ...identityForm, operationalHours: e.target.value })}
                  placeholder="Senin - Kamis: 08.00 - 16.30 WITA&#10;Jumat: 08.00 - 11.00 WITA"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-xs font-medium text-zinc-300">
                  Nomor Telepon Kantor
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="contact-phone"
                    value={identityForm.phone}
                    onChange={(e) => setIdentityForm({ ...identityForm, phone: e.target.value })}
                    placeholder="(0518) 21603"
                    className="border-white/10 bg-zinc-950/60 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-wa" className="text-xs font-medium text-zinc-300">
                  Tautan WhatsApp Layanan
                </Label>
                <Input
                  id="contact-wa"
                  value={identityForm.whatsappLink}
                  onChange={(e) => setIdentityForm({ ...identityForm, whatsappLink: e.target.value })}
                  placeholder="https://wa.me/6281234567890"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-email" className="text-xs font-medium text-zinc-300">
                  Email Resmi Dinas
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="contact-email"
                    type="email"
                    value={identityForm.email}
                    onChange={(e) => setIdentityForm({ ...identityForm, email: e.target.value })}
                    placeholder="instalasifarmasi4@gmail.com"
                    className="border-white/10 bg-zinc-950/60 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-maps" className="text-xs font-medium text-zinc-300">
                  URL Iframe Embed Google Maps
                </Label>
                <Input
                  id="contact-maps"
                  value={identityForm.googleMapsEmbedUrl}
                  onChange={(e) => setIdentityForm({ ...identityForm, googleMapsEmbedUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="border-white/10 bg-zinc-950/60 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
                <p className="text-[11px] text-zinc-500">
                  Salin URL dari atribut <code className="text-zinc-400">src</code> pada menu Google Maps &gt; Bagikan &gt; Sematkan Peta.
                </p>
              </div>

              {/* Mini Live Map Preview */}
              <div className="space-y-2 md:col-span-2">
                <span className="text-xs font-medium text-zinc-400">Pratinjau Peta Google Maps</span>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
                  {identityForm.googleMapsEmbedUrl ? (
                    <iframe
                      src={identityForm.googleMapsEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full grayscale contrast-125 opacity-80 transition-opacity hover:opacity-100"
                      title="Pratinjau Lokasi IFK"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                      URL Peta Belum Diisi
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleIdentityReset}
              className="gap-2 border-white/10 bg-zinc-800/60 text-zinc-300 transition-colors [@media(hover:hover)]:hover:bg-zinc-800 [@media(hover:hover)]:hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Form</span>
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 bg-brand-500 text-zinc-950 font-semibold shadow-lg shadow-brand-500/20 transition-all [@media(hover:hover)]:hover:bg-brand-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* ── TAB 2: KONTEN PROFIL UPTD ───────────────────────────────────── */}
      {activeTab === "profil" && (
        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* Kartu Pimpinan & Sambutan */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-brand-500/10 via-emerald-500/5 to-transparent blur-2xl" />

            <div className="relative flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Sambutan Kepala UPTD</h2>
                <p className="text-xs text-zinc-400">
                  Foto pimpinan, identitas Kepala UPTD, dan naskah sambutan resmi di halaman profil.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[180px_1fr]">
              {/* Kolom Foto Kepala UPTD */}
              <div className="flex flex-col items-center gap-3">
                <div className="group relative aspect-[3/4] w-full max-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-md">
                  <Image
                    src={profileForm.headPhoto}
                    alt="Kepala UPTD IFK"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <button
                    type="button"
                    onClick={() => headPhotoInputRef.current?.click()}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Ganti Foto
                  </button>
                </div>
                <input
                  type="file"
                  ref={headPhotoInputRef}
                  onChange={handleProfilePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => headPhotoInputRef.current?.click()}
                  className="w-full max-w-[180px] gap-2 border-white/10 bg-zinc-800/60 text-xs text-zinc-300 [@media(hover:hover)]:hover:bg-zinc-800 [@media(hover:hover)]:hover:text-white"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Foto (3:4)
                </Button>
              </div>

              {/* Kolom Data Pimpinan & Sambutan */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="head-name" className="text-xs font-medium text-zinc-300">
                      Nama &amp; Gelar Kepala UPTD <span className="text-rose-400">*</span>
                    </Label>
                    <Input
                      id="head-name"
                      value={profileForm.headName}
                      onChange={(e) => setProfileForm({ ...profileForm, headName: e.target.value })}
                      placeholder="Contoh: apt. H. Muhammad Yusuf, S.Farm"
                      className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="head-role" className="text-xs font-medium text-zinc-300">
                      Jabatan Resmi
                    </Label>
                    <Input
                      id="head-role"
                      value={profileForm.headRole}
                      onChange={(e) => setProfileForm({ ...profileForm, headRole: e.target.value })}
                      placeholder="Kepala UPTD Instalasi Farmasi Kab. Kotabaru"
                      className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="head-greeting" className="text-xs font-medium text-zinc-300">
                    Naskah Sambutan
                  </Label>
                  <Textarea
                    id="head-greeting"
                    rows={6}
                    value={profileForm.greeting}
                    onChange={(e) => setProfileForm({ ...profileForm, greeting: e.target.value })}
                    placeholder="Tuliskan naskah sambutan resmi Kepala UPTD..."
                    className="border-white/10 bg-zinc-950/60 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kartu Visi, Misi & Tupoksi */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="relative flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Visi, Misi &amp; Tupoksi</h2>
                <p className="text-xs text-zinc-400">
                  Arah haluan, pilar pelayanan, dan tugas pokok fungsi UPTD Instalasi Farmasi.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-vision" className="text-xs font-medium text-zinc-300">
                  Pernyataan Visi Lembaga
                </Label>
                <Textarea
                  id="profile-vision"
                  rows={2}
                  value={profileForm.vision}
                  onChange={(e) => setProfileForm({ ...profileForm, vision: e.target.value })}
                  placeholder="Pernyataan visi instansi..."
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-mission" className="text-xs font-medium text-zinc-300">
                  Butir-Butir Misi (Pisahkan Tiap Nomor/Baris)
                </Label>
                <Textarea
                  id="profile-mission"
                  rows={5}
                  value={profileForm.mission}
                  onChange={(e) => setProfileForm({ ...profileForm, mission: e.target.value })}
                  placeholder="1. Butir misi pertama&#10;2. Butir misi kedua..."
                  className="border-white/10 bg-zinc-950/60 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-tupoksi" className="text-xs font-medium text-zinc-300">
                  Tugas Pokok &amp; Fungsi (Tupoksi)
                </Label>
                <Textarea
                  id="profile-tupoksi"
                  rows={4}
                  value={profileForm.tupoksi}
                  onChange={(e) => setProfileForm({ ...profileForm, tupoksi: e.target.value })}
                  placeholder="Uraian tugas pokok dan fungsi instansi..."
                  className="border-white/10 bg-zinc-950/60 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleProfileReset}
              className="gap-2 border-white/10 bg-zinc-800/60 text-zinc-300 transition-colors [@media(hover:hover)]:hover:bg-zinc-800 [@media(hover:hover)]:hover:text-white active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Form</span>
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-brand-500 text-zinc-950 font-semibold shadow-lg shadow-brand-500/20 transition-all [@media(hover:hover)]:hover:bg-brand-400 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </form>
      )}

      {/* ── TAB 3: TAUTAN & LAYANAN ─────────────────────────────────────── */}
      {activeTab === "tautan" && (
        <form onSubmit={handleLinksSave} className="space-y-6">
          {/* Kartu Portal Eksternal & Media Sosial */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-brand-500/10 via-emerald-500/5 to-transparent blur-2xl" />

            <div className="relative flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Integrasi Portal &amp; Media Sosial</h2>
                <p className="text-xs text-zinc-400">
                  Tautan saluran pengaduan nasional, portal dinas induk, dan jejaring sosial resmi.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="link-sp4n" className="text-xs font-medium text-zinc-300">
                  URL SP4N LAPOR!
                </Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="link-sp4n"
                    value={linksForm.sp4nLaporUrl}
                    onChange={(e) => setLinksForm({ ...linksForm, sp4nLaporUrl: e.target.value })}
                    placeholder="https://www.lapor.go.id"
                    className="border-white/10 bg-zinc-950/60 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-dinkes" className="text-xs font-medium text-zinc-300">
                  URL Portal Dinas Kesehatan
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="link-dinkes"
                    value={linksForm.dinkesUrl}
                    onChange={(e) => setLinksForm({ ...linksForm, dinkesUrl: e.target.value })}
                    placeholder="https://dinkes.kotabarukab.go.id"
                    className="border-white/10 bg-zinc-950/60 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-ig" className="text-xs font-medium text-zinc-300">
                  Akun Instagram Resmi
                </Label>
                <Input
                  id="link-ig"
                  value={linksForm.instagramUrl}
                  onChange={(e) => setLinksForm({ ...linksForm, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/ifk_kotabaru"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-fb" className="text-xs font-medium text-zinc-300">
                  Halaman Facebook Resmi
                </Label>
                <Input
                  id="link-fb"
                  value={linksForm.facebookUrl}
                  onChange={(e) => setLinksForm({ ...linksForm, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/ifk.kotabaru"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="link-yt" className="text-xs font-medium text-zinc-300">
                  Kanal YouTube Resmi
                </Label>
                <Input
                  id="link-yt"
                  value={linksForm.youtubeUrl}
                  onChange={(e) => setLinksForm({ ...linksForm, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@ifkkotabaru"
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>
            </div>
          </div>

          {/* Kartu Banner Pengumuman Darurat */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="relative flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Banner Pengumuman Publik</h2>
                  <p className="text-xs text-zinc-400">
                    Tampilkan pengumuman penting atau darurat tepat di bagian teratas halaman publik.
                  </p>
                </div>
              </div>

              {/* Sliding Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={linksForm.announcementEnabled}
                onClick={() =>
                  setLinksForm({
                    ...linksForm,
                    announcementEnabled: !linksForm.announcementEnabled,
                  })
                }
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/40",
                  linksForm.announcementEnabled ? "bg-amber-500" : "bg-zinc-800"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    linksForm.announcementEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-zinc-400">Tipe Badge:</span>
                <div className="flex gap-2">
                  {(["info", "warning", "important"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLinksForm({ ...linksForm, announcementType: type })}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors active:scale-95",
                        linksForm.announcementType === type
                          ? type === "warning"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : type === "important"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                          : "bg-zinc-800/60 text-zinc-400 border border-white/5 hover:text-zinc-200"
                      )}
                    >
                      {type === "info" ? "Informasi" : type === "warning" ? "Peringatan" : "Penting"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-text" className="text-xs font-medium text-zinc-300">
                  Isi Pesan Pengumuman
                </Label>
                <Textarea
                  id="banner-text"
                  rows={2}
                  value={linksForm.announcementText}
                  onChange={(e) => setLinksForm({ ...linksForm, announcementText: e.target.value })}
                  placeholder="Contoh: Layanan farmasi libur nasional..."
                  className="border-white/10 bg-zinc-950/60 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                />
              </div>

              {/* Pratinjau Banner */}
              {linksForm.announcementEnabled && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    <Radio className="h-3 w-3 animate-pulse" />
                    Live Preview
                  </span>
                  <span className="truncate">{linksForm.announcementText}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleLinksReset}
              className="gap-2 border-white/10 bg-zinc-800/60 text-zinc-300 transition-colors [@media(hover:hover)]:hover:bg-zinc-800 [@media(hover:hover)]:hover:text-white active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Form</span>
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-brand-500 text-zinc-950 font-semibold shadow-lg shadow-brand-500/20 transition-all [@media(hover:hover)]:hover:bg-brand-400 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
