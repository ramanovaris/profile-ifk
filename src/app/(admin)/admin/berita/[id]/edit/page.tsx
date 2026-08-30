"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleForm } from "@/components/admin/article-form";
import { dummyArticles } from "@/lib/dummy-data";

export default function AdminBeritaEditPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const article = dummyArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <AdminShell>
        <p className="text-sm text-slate-500">Artikel tidak ditemukan.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-slate-900">Edit Artikel</h1>
      <div className="mt-6 max-w-3xl">
        <ArticleForm article={article} />
      </div>
    </AdminShell>
  );
}
