"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminProfilPage() {
  const [displayName, setDisplayName] = useState("Administrator");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    alert("Informasi akun berhasil diperbarui (dummy)");
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok");
      return;
    }
    alert("Kata sandi berhasil diubah (dummy)");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-slate-900">Profil Saya</h1>

      <div className="mt-6 max-w-lg space-y-6">
        {/* Informasi Akun */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <Label htmlFor="displayName">Nama Tampilan</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value="admin" readOnly className="mt-1 bg-slate-50" />
              </div>
              <Button type="submit">Simpan Perubahan</Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Ubah Kata Sandi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ubah Kata Sandi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Password Lama</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit">Simpan Perubahan</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
