import { FileText, CheckCircle, FilePen, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminShell } from "@/components/admin/admin-shell";
import { dummyArticles, dummyUsers, dummyStats } from "@/lib/dummy-data";

const statCards = [
  { label: "Total Artikel", value: dummyStats.totalArticles, icon: FileText, color: "text-blue-700" },
  { label: "Terbit", value: dummyStats.published, icon: CheckCircle, color: "text-green-600" },
  { label: "Draft", value: dummyStats.draft, icon: FilePen, color: "text-amber-600" },
  { label: "Total Pengguna", value: dummyStats.totalUsers, icon: Users, color: "text-purple-600" },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabel Artikel Terakhir */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Artikel Terakhir</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {dummyArticles.slice(0, 5).map((article) => (
                <tr key={article.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{article.title}</td>
                  <td className="px-4 py-3 text-slate-600">{article.category}</td>
                  <td className="px-4 py-3">
                    <Badge variant={article.isPublished ? "default" : "secondary"}>
                      {article.isPublished ? "Terbit" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(article.publishedAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daftar Pengguna Aktif */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Pengguna Aktif</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dummyUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center gap-3 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <Badge variant={user.role === "SUPER_ADMIN" ? "default" : "secondary"} className="mt-0.5 text-xs">
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
