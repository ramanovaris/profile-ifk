"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import {
  User,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Save,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminShell } from "@/components/admin/admin-shell";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function AdminProfilPage() {
  // Informasi Akun State
  const [displayName, setDisplayName] = useState("Administrator");
  const [email, setEmail] = useState("admin@ifk-kotabaru.go.id");
  const [savedName, setSavedName] = useState("Administrator");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Keamanan & Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Visibility Toggle
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback Banners State
  const [infoFeedback, setInfoFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Helper Inisial Avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "AD";
  };

  // Handler Avatar Upload Mockup
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setInfoFeedback({
        type: "success",
        message: "Foto profil sementara berhasil diperbarui.",
      });
      toast.success("Foto profil berhasil diperbarui.");
    }
  };

  // Handler Simpan Informasi Profil
  function handleSaveInfo(e: FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setInfoFeedback({
        type: "error",
        message: "Nama lengkap / nama tampilan tidak boleh kosong.",
      });
      toast.error("Nama lengkap tidak boleh kosong.");
      return;
    }
    setSavedName(displayName.trim());
    setInfoFeedback({
      type: "success",
      message: "Informasi profil dan kontak berhasil disimpan.",
    });
    toast.success("Informasi profil berhasil disimpan.");
  }

  // Handler Ubah Kata Sandi
  function handleChangePassword(e: FormEvent) {
    e.preventDefault();

    if (!oldPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Silakan masukkan kata sandi saat ini.",
      });
      toast.error("Silakan masukkan kata sandi saat ini.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Kata sandi baru minimal harus 8 karakter.",
      });
      toast.error("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru.",
      });
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setPasswordFeedback({
      type: "success",
      message: "Kata sandi Anda berhasil diperbarui dengan aman.",
    });
    toast.success("Kata sandi berhasil diperbarui.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <AdminShell>
      {/* Header Halaman */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-brand-400 mb-1">
          <Shield className="h-3.5 w-3.5" />
          <span>Pengaturan Akun</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Profil Pengguna
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Kelola informasi profil, data kontak, dan pengaturan keamanan kata sandi akun Anda.
        </p>
      </div>

      {/* Grid 2-Kolom: Kiri Identitas (Sticky), Kanan Form Profil & Keamanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Kartu Identitas & Metadata Akun */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            {/* Ambient Radial Top Glow */}
            <div
              className="pointer-events-none absolute -top-24 inset-x-0 h-48 bg-gradient-to-b from-brand-500/15 via-emerald-500/10 to-transparent blur-2xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-col items-center text-center">
              {/* Avatar dengan Ring & Tombol Kamera Mockup */}
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/10">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={savedName} />}
                  <AvatarFallback className="bg-gradient-to-br from-brand-500/20 to-emerald-500/20 text-brand-300 font-bold text-2xl">
                    {getInitials(savedName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 [@media(hover:hover)]:hover:text-white [@media(hover:hover)]:hover:bg-zinc-700 active:scale-95 transition-all shadow-md cursor-pointer"
                  title="Ganti foto profil"
                  aria-label="Ganti foto profil"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Nama & Handle Akun */}
              <h2 className="text-lg font-bold text-white mt-4 tracking-tight">
                {savedName}
              </h2>
              <span className="text-xs font-mono text-zinc-400 mt-0.5">
                @admin
              </span>

              {/* Role Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 shadow-sm shadow-emerald-500/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Super Admin</span>
              </div>

              {/* Metadata Akun List */}
              <div className="mt-6 w-full divide-y divide-white/5 border-t border-white/5 pt-4 text-left">
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-zinc-400">Status Akun</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-zinc-400">Hak Akses</span>
                  <span className="font-medium text-zinc-200">Full Access</span>
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-zinc-400">Terdaftar</span>
                  <span className="font-medium text-zinc-300">15 Jan 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Informasi Pribadi & Form Keamanan */}
        <div className="lg:col-span-8 space-y-6">
          {/* Kartu 1: Informasi Pribadi */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-400 shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Informasi Pribadi
                </h3>
                <p className="text-xs text-zinc-400">
                  Perbarui identitas tampilan dan alamat email utama Anda.
                </p>
              </div>
            </div>

            {/* In-page Feedback Banner Informasi */}
            {infoFeedback && (
              <div
                className={cn(
                  "mb-5 flex items-center justify-between rounded-xl border p-3.5 text-xs transition-all",
                  infoFeedback.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                )}
              >
                <div className="flex items-center gap-2">
                  {infoFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  )}
                  <span>{infoFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoFeedback(null)}
                  className="text-zinc-400 [@media(hover:hover)]:hover:text-white p-1 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <Label
                  htmlFor="displayName"
                  className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5"
                >
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  Nama Lengkap / Tampilan
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Masukkan nama tampilan"
                  className="h-10 rounded-lg border-white/10 bg-zinc-950/60 text-sm text-white placeholder:text-zinc-600 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                />
              </div>

              <div>
                <Label
                  htmlFor="username"
                  className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  Username Sistem
                </Label>
                <Input
                  id="username"
                  value="admin"
                  readOnly
                  disabled
                  className="h-10 rounded-lg border-white/5 bg-white/[0.02] text-sm text-zinc-400 cursor-not-allowed select-none"
                />
                <p className="mt-1.5 text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-zinc-400 shrink-0" />
                  Username akun sistem bawaan tidak dapat diubah demi keamanan.
                </p>
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5"
                >
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  Alamat Email Kontak
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ifk-kotabaru.go.id"
                  className="h-10 rounded-lg border-white/10 bg-zinc-950/60 text-sm text-white placeholder:text-zinc-600 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-brand-400/30 bg-brand-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-lg shadow-brand-500/20 [@media(hover:hover)]:hover:bg-brand-500 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>

          {/* Kartu 2: Keamanan & Kata Sandi */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-sm">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Keamanan & Kata Sandi
                </h3>
                <p className="text-xs text-zinc-400">
                  Pastikan akun Anda menggunakan kombinasi kata sandi yang kuat dan aman.
                </p>
              </div>
            </div>

            {/* In-page Feedback Banner Password */}
            {passwordFeedback && (
              <div
                className={cn(
                  "mb-5 flex items-center justify-between rounded-xl border p-3.5 text-xs transition-all",
                  passwordFeedback.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                )}
              >
                <div className="flex items-center gap-2">
                  {passwordFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordFeedback(null)}
                  className="text-zinc-400 [@media(hover:hover)]:hover:text-white p-1 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Password Lama */}
              <div>
                <Label
                  htmlFor="oldPassword"
                  className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  Kata Sandi Lama
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini"
                    className="h-10 rounded-lg border-white/10 bg-zinc-950/60 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 [@media(hover:hover)]:hover:text-zinc-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showOldPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <Label
                  htmlFor="newPassword"
                  className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                  Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="h-10 rounded-lg border-white/10 bg-zinc-950/60 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 [@media(hover:hover)]:hover:text-zinc-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                  Konfirmasi Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="h-10 rounded-lg border-white/10 bg-zinc-950/60 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 [@media(hover:hover)]:hover:text-zinc-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Hint Box */}
              <div className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk menjaga keamanan akun Anda.
                </span>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-800 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md [@media(hover:hover)]:hover:bg-zinc-700 [@media(hover:hover)]:hover:border-white/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  Perbarui Kata Sandi
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
