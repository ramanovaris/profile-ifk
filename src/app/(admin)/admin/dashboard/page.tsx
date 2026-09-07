import Link from "next/link";
import {
  FileText,
  CheckCircle,
  FilePen,
  Users,
  Plus,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { dummyArticles, dummyUsers, dummyStats } from "@/lib/dummy-data";

const statCards = [
  {
    label: "Total Artikel",
    value: dummyStats.totalArticles,
    icon: FileText,
    glow: "bg-brand-500/15 text-brand-400 border-brand-500/30",
    borderHover: "hover:border-brand-500/30",
  },
  {
    label: "Artikel Terbit",
    value: dummyStats.published,
    icon: CheckCircle,
    glow: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    label: "Artikel Draft",
    value: dummyStats.draft,
    icon: FilePen,
    glow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    borderHover: "hover:border-amber-500/30",
  },
  {
    label: "Total Pengguna",
    value: dummyStats.totalUsers,
    icon: Users,
    glow: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    borderHover: "hover:border-purple-500/30",
  },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      {/* Header section with quick action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Ringkasan status publikasi dan aktivitas portal IFK Kotabaru.
          </p>
        </div>
        <div>
          <Link
            href="/admin/berita/baru"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Berita Baru</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl transition-all duration-200 ${stat.borderHover}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border ${stat.glow}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-zinc-400">Live</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-zinc-400">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Artikel Terakhir */}
      <div className="mt-8 rounded-xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Artikel Terakhir
            </h2>
            <p className="text-xs text-zinc-400">
              5 artikel yang baru saja diperbarui atau dipublikasikan
            </p>
          </div>
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            <span>Semua Berita</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-medium uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3">Judul Artikel</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal Terbit</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dummyArticles.slice(0, 5).map((article) => (
                <tr
                  key={article.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    {article.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-xs">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {article.isPublished ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        Terbit
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/berita/${article.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
                    >
                      <span>Edit</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daftar Pengguna Aktif */}
      <div className="mt-8 rounded-xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Pengguna Aktif
            </h2>
            <p className="text-xs text-zinc-400">
              Daftar pengelola akun admin portal
            </p>
          </div>
          <Link
            href="/admin/pengguna"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            <span>Kelola Pengguna</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dummyUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3.5 rounded-lg border border-white/5 bg-zinc-900/40 p-3.5 transition-colors hover:border-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/20 text-sm font-bold text-brand-300">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {user.name}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                      user.role === "SUPER_ADMIN"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/5 text-zinc-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
