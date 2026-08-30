"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";
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
import { dummyUsers } from "@/lib/dummy-data";

export default function AdminPenggunaPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleAction(action: string, name: string) {
    alert(`${action} "${name}" (dummy — tidak ada perubahan)`);
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Kelola Pengguna</h1>
        <Link
          href="/admin/pengguna/baru"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue/80"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Nama Lengkap</th>
              <th className="px-4 py-3">Peran</th>
              <th className="px-4 py-3">Tanggal Dibuat</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dummyUsers.map((user) => (
              <tr key={user.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-slate-900">{user.username}</td>
                <td className="px-4 py-3 text-slate-600">{user.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleAction("Edit", user.name)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleAction("Reset sandi", user.name)}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteId(user.id)}
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
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                alert("Pengguna berhasil dihapus (dummy)");
                setDeleteId(null);
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
