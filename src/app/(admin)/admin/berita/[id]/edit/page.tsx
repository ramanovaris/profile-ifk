"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleForm } from "@/components/admin/article-form";
import { dummyArticles } from "@/lib/dummy-data";

export default function AdminBeritaEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const article = dummyArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/5 bg-zinc-900/60 p-8 text-center backdrop-blur-xl">
          <p className="text-base text-zinc-300">Artikel tidak ditemukan.</p>
          <Link
            href="/admin/berita"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Berita</span>
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Edit Artikel
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Perbarui informasi artikel atau ubah status publikasinya.
          </p>
        </div>
        <ArticleForm article={article} />
      </div>
    </AdminShell>
  );
}
