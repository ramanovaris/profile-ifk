import { getSiteSettings } from "@/actions/setting";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentSession } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export default async function AdminPengaturanPage() {
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getCurrentSession(),
  ]);

  return (
    <AdminShell currentUser={session?.user}>
      <div className="space-y-6">
        {/* Header Halaman */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-text-main)] sm:text-3xl">
              Pengaturan Website
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
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
