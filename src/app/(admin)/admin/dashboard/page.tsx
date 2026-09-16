import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  CheckCircle,
  FilePen,
  Users,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Package,
  Clock,
  PenLine,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const currentUserId = session.user.id;

  // Mengambil seluruh metrik statistik, artikel terbaru, dan ringkasan hak akses secara konkuren
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalStock,
    recentArticles,
    superAdminUsers,
    staffArticles,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { isPublished: true } }),
    db.article.count({ where: { isPublished: false } }),
    db.medicineStock.count(),
    db.article.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, name: true, username: true },
        },
      },
    }),
    isSuperAdmin
      ? db.user.findMany({
          where: { status: "ACTIVE" },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            _count: {
              select: { articles: true },
            },
          },
          orderBy: [
            { role: "asc" },
            { name: "asc" },
          ],
        })
      : Promise.resolve([]),
    !isSuperAdmin
      ? db.article.findMany({
          where: { authorId: currentUserId },
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const statCards = [
    {
      label: "Total Artikel",
      value: totalArticles,
      href: "/admin/berita/",
      icon: FileText,
      glow: "bg-brand-500/15 text-brand-400 border-brand-500/30",
      watermark: "text-brand-500/[0.05] group-hover:text-brand-500/[0.10]",
      borderHover: "hover:border-brand-500/30",
    },
    {
      label: "Artikel Terbit",
      value: publishedArticles,
      href: "/admin/berita/?status=terbit",
      icon: CheckCircle,
      glow: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      watermark: "text-emerald-500/[0.05] group-hover:text-emerald-500/[0.10]",
      borderHover: "hover:border-emerald-500/30",
    },
    {
      label: "Artikel Draf",
      value: draftArticles,
      href: "/admin/berita/?status=draft",
      icon: FilePen,
      glow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      watermark: "text-amber-500/[0.05] group-hover:text-amber-500/[0.10]",
      borderHover: "hover:border-amber-500/30",
    },
    {
      label: "Master Stok Obat",
      value: totalStock,
      href: "/admin/stok/",
      icon: Package,
      glow: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      watermark: "text-sky-500/[0.05] group-hover:text-sky-500/[0.10]",
      borderHover: "hover:border-sky-500/30",
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Pengguna Aktif",
            value: superAdminUsers.length,
            href: "/admin/pengguna/",
            icon: Users,
            glow: "bg-purple-500/15 text-purple-400 border-purple-500/30",
            watermark: "text-purple-500/[0.05] group-hover:text-purple-500/[0.10]",
            borderHover: "hover:border-purple-500/30",
          },
        ]
      : []),
  ];

  return (
    <AdminShell currentUser={session.user}>
      {/* Header section with quick action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Ringkasan status publikasi, inventaris obat, dan aktivitas portal IFK Kotabaru.
          </p>
        </div>
        <div>
          <Link
            href="/admin/berita/baru/"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Berita Baru</span>
          </Link>
        </div>
      </div>

      {/* Responsive Stat KPI cards (Grid 2 Kolom Mobile, 5 untuk Super Admin, 4 untuk Staf) */}
      <div
        className={`mt-6 grid grid-cols-2 gap-3 sm:gap-4 ${
          isSuperAdmin ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-4"
        }`}
      >
        {statCards.map((stat, idx) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 cursor-pointer ${
              stat.borderHover
            } ${
              isSuperAdmin && idx === 4 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            {/* Ornamen Watermark Icon Samar (Dark Ethereal Depth) */}
            <div
              className={`pointer-events-none absolute -bottom-3 -right-3 transition-all duration-300 group-hover:scale-110 ${stat.watermark}`}
            >
              <stat.icon className="h-20 w-20 sm:h-24 sm:w-24 -rotate-12" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border ${stat.glow}`}
                >
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex items-center gap-0.5 text-zinc-500 transition-colors group-hover:text-zinc-300">
                  <span className="text-[10px] font-medium opacity-0 sm:group-hover:opacity-100 transition-opacity">Buka</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-zinc-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tabel 5 Artikel Terakhir Sistem */}
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
            href="/admin/berita/"
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
                <th className="px-4 py-3">Penulis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal Terbit</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentArticles.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-zinc-400"
                  >
                    Belum ada rekaman artikel berita pada sistem.
                  </td>
                </tr>
              ) : (
                recentArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-200">
                      {article.title}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-xs">
                        {article.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-300">
                      {article.author?.name || article.author?.username || "-"}
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
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/berita/${article.id}/edit/`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
                      >
                        <span>Edit</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Bawah Berbasis Peran (RBAC) */}
      {isSuperAdmin ? (
        /* Tampilan Super Admin: Pengelola Akun Aktif */
        <div className="mt-8 rounded-xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Pengelola Akun Aktif
              </h2>
              <p className="text-xs text-zinc-400">
                Daftar staf dan pengelola akun admin portal
              </p>
            </div>
            <Link
              href="/admin/pengguna/"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300"
            >
              <span>Kelola Pengguna</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {superAdminUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3.5 rounded-lg border border-white/5 bg-zinc-900/40 p-3.5 transition-colors hover:border-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/20 text-sm font-bold text-brand-300">
                  {user.name.charAt(0).toUpperCase()}
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
                    <span className="text-[11px] text-zinc-400">
                      {user._count.articles} artikel ditulis
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tampilan Staf: Ringkasan Artikel Saya */
        <div className="mt-8 rounded-xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Artikel Saya
              </h2>
              <p className="text-xs text-zinc-400">
                Daftar artikel yang baru saja Anda kelola atau buat
              </p>
            </div>
            <Link
              href="/admin/berita/baru/"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-brand-300"
            >
              <span>Tulis Berita Baru</span>
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          {staffArticles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-8 text-center">
              <PenLine className="mx-auto h-8 w-8 text-zinc-400" />
              <p className="mt-2 text-sm font-medium text-zinc-300">
                Anda belum memiliki rekaman naskah artikel
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Mulai publikasikan informasi, agenda kegiatan, atau sosialisasi kefarmasian.
              </p>
              <div className="mt-4">
                <Link
                  href="/admin/berita/baru/"
                  className="inline-flex items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-600/20 px-3 py-1.5 text-xs font-medium text-brand-300 transition-colors hover:bg-brand-600/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Buat Artikel Pertama</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {staffArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col justify-between rounded-lg border border-white/5 bg-zinc-900/40 p-4 transition-colors hover:border-white/10"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-400">
                        {article.category?.name || "Umum"}
                      </span>
                      {article.isPublished ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          Terbit
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-medium text-zinc-200">
                      {article.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {new Date(article.updatedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/admin/berita/${article.id}/edit/`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 transition-colors hover:text-brand-300"
                    >
                      <span>Lanjutkan Edit</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
