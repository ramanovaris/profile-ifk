"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminShell } from "@/components/admin/admin-shell";
import { dummyArticles } from "@/lib/dummy-data";

export default function AdminBeritaPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleDelete() {
    // Dummy — tidak menghapus apa-apa
    alert("Artikel berhasil dihapus (dummy)");
    setDeleteId(null);
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Kelola Berita</h1>
        <Link
          href="/admin/berita/baru"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-700/80"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Artikel
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dummyArticles.map((article) => (
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
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/berita/${article.id}/edit`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteId(article.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog hapus */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Artikel</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
