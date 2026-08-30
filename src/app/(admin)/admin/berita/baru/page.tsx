import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleForm } from "@/components/admin/article-form";

export default function AdminBeritaBaruPage() {
  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-slate-900">Tambah Artikel Baru</h1>
      <div className="mt-6 max-w-3xl">
        <ArticleForm />
      </div>
    </AdminShell>
  );
}
