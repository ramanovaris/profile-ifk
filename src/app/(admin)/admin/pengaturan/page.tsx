import { getSiteSettings } from "@/actions/setting";
import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "./settings-form";

export default async function AdminPengaturanPage() {
  const settings = await getSiteSettings();

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header Halaman */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pengaturan Website
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Kelola identitas instansi, kontak pelayanan, konten profil lembaga, dan integrasi tautan publik.
            </p>
          </div>
        </div>

        {/* Form Pengaturan Multi-Tab */}
        <SettingsForm initialSettings={settings} />
      </div>
    </AdminShell>
  );
}
