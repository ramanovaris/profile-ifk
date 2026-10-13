"use client";

import { useState, useRef, useTransition, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Save,
  Camera,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";
import { cn, getAssetUrl } from "@/lib/utils";
import {
  updateMyProfileAction,
  changeMyPasswordAction,
  type SafeProfileUser,
} from "@/actions/profile";

interface ProfileClientViewProps {
  initialUser: SafeProfileUser;
}

export function ProfileClientView({ initialUser }: ProfileClientViewProps) {
  const router = useRouter();

  // Informasi Pengguna State
  const [currentUser, setCurrentUser] = useState<SafeProfileUser>(initialUser);
  const [displayName, setDisplayName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialUser.avatar ? getAssetUrl(initialUser.avatar) : null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingInfo, startSavingInfo] = useTransition();
  const [isUploadingAvatar, startUploadingAvatar] = useTransition();
  const [isUpdatingPassword, startUpdatingPassword] = useTransition();

  // Form Keamanan & Kata Sandi State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toggle Visibility Password
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inisial Avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "AD";
  };

  // Tanggal Terdaftar Terformat
  const formattedRegistrationDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(currentUser.createdAt));

  // Handler Upload Foto Profil Langsung
  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Format foto tidak didukung. Gunakan file JPG, PNG, atau WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto profil melebihi batas maksimal 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Set preview instan
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Unggah ke server
    startUploadingAvatar(async () => {
      const formData = new FormData();
      formData.set("name", displayName.trim() || currentUser.name);
      formData.set("email", email.trim());
      formData.set("avatar", file);

      const res = await updateMyProfileAction(formData);
      if (res.success && res.data) {
        setCurrentUser(res.data);
        setAvatarPreview(res.data.avatar ? getAssetUrl(res.data.avatar) : null);
        toast.success("Foto profil berhasil diperbarui.");
        router.refresh();
      } else {
        toast.error(res.error || "Terjadi kendala saat mengunggah foto profil.");
        setAvatarPreview(currentUser.avatar ? getAssetUrl(currentUser.avatar) : null);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  // Handler Hapus Foto Profil
  const handleRemoveAvatar = () => {
    if (!currentUser.avatar && !avatarPreview) return;

    startUploadingAvatar(async () => {
      const formData = new FormData();
      formData.set("name", displayName.trim() || currentUser.name);
      formData.set("email", email.trim());
      formData.set("removeAvatar", "true");

      const res = await updateMyProfileAction(formData);
      if (res.success && res.data) {
        setCurrentUser(res.data);
        setAvatarPreview(null);
        toast.success("Foto profil berhasil dihapus.");
        router.refresh();
      } else {
        toast.error(res.error || "Terjadi kendala saat menghapus foto profil.");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  // Handler Simpan Informasi Profil
  function handleSaveInfo(e: FormEvent) {
    e.preventDefault();
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Nama lengkap minimal 2 karakter.");
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Format alamat email tidak valid.");
      return;
    }

    startSavingInfo(async () => {
      const formData = new FormData();
      formData.set("name", trimmedName);
      formData.set("email", trimmedEmail);

      const res = await updateMyProfileAction(formData);
      if (res.success && res.data) {
        setCurrentUser(res.data);
        setDisplayName(res.data.name);
        setEmail(res.data.email || "");
        toast.success("Informasi profil berhasil disimpan.");
        router.refresh();
      } else {
        toast.error(res.error || "Terjadi kendala saat menyimpan informasi profil.");
      }
    });
  }

  // Handler Ubah Kata Sandi
  function handleChangePassword(e: FormEvent) {
    e.preventDefault();

    if (!oldPassword) {
      toast.error("Silakan masukkan kata sandi saat ini.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    startUpdatingPassword(async () => {
      const res = await changeMyPasswordAction({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success("Kata sandi berhasil diperbarui.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Terjadi kendala saat memperbarui kata sandi.");
      }
    });
  }

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-text-main)] sm:text-3xl">
          Profil Pengguna
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Kelola informasi profil, kontak kedinasan, dan pengaturan keamanan kata sandi akun Anda.
        </p>
      </div>

      {/* Grid 2-Kolom: Kiri Identitas (Sticky), Kanan Form Profil & Keamanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Kartu Identitas & Metadata Akun */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-xl backdrop-blur-xl">
            {/* Ambient Radial Top Glow */}
            <div
              className="pointer-events-none absolute -top-24 inset-x-0 h-48 bg-gradient-to-b from-brand-500/15 via-emerald-500/10 to-transparent blur-2xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-col items-center text-center">
              {/* Avatar dengan Ring & Tombol Kamera Unggah */}
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/10">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={currentUser.name} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-brand-500/20 to-emerald-500/20 text-[#455a26] dark:text-brand-300 font-bold text-2xl">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Loading indicator saat upload avatar */}
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-xs">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                  </div>
                ) : null}

                {/* Tombol Kamera */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--admin-card-bg)] border border-[var(--admin-border)] text-[var(--admin-muted)] [@media(hover:hover)]:hover:text-[var(--admin-text-main)] [@media(hover:hover)]:hover:bg-[var(--admin-hover-bg)] active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  title="Ganti foto profil"
                  aria-label="Ganti foto profil"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              {/* Tombol Hapus Foto Profil jika ada avatar */}
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-[var(--admin-muted)] hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Hapus foto</span>
                </button>
              )}

              {/* Nama & Username Akun */}
              <h2 className="text-lg font-bold text-[var(--admin-text-main)] mt-3 tracking-tight">
                {currentUser.name}
              </h2>
              <span className="text-xs font-mono text-[var(--admin-muted)] mt-0.5">
                @{currentUser.username}
              </span>

              {/* Role Badge */}
              <div
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                  isSuperAdmin
                    ? "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-semibold"
                    : "border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-400 font-semibold"
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isSuperAdmin ? "Super Admin" : "Staf Operasional"}</span>
              </div>

              {/* Metadata Akun List */}
              <div className="mt-6 w-full divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)] pt-4 text-left">
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-[var(--admin-muted)]">Status Akun</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentUser.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-[var(--admin-muted)]">Hak Akses</span>
                  <span className="font-medium text-[var(--admin-text-main)]">
                    {isSuperAdmin ? "Akses Penuh (Super Admin)" : "Akses Terbatas (Staf)"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-[var(--admin-muted)]">Terdaftar</span>
                  <span className="font-medium text-[var(--admin-text-main)]">
                    {formattedRegistrationDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Informasi Pribadi & Form Keamanan */}
        <div className="lg:col-span-8 space-y-6">
          {/* Kartu 1: Informasi Pribadi */}
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#455a26]/30 bg-[#455a26]/10 text-[#455a26] dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[var(--admin-text-main)]">
                  Informasi Pribadi
                </h3>
                <p className="text-xs text-[var(--admin-muted)]">
                  Perbarui identitas tampilan dan alamat surel utama akun Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <Label
                  htmlFor="displayName"
                  className="text-xs font-medium text-[var(--admin-text-main)] flex items-center gap-1.5 mb-1.5"
                >
                  <User className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                  Nama Lengkap / Tampilan
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Masukkan nama tampilan"
                  disabled={isSavingInfo}
                  className="h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-sm text-[var(--admin-text-main)] placeholder:text-[var(--admin-muted)] focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                />
              </div>

              <div>
                <Label
                  htmlFor="username"
                  className="text-xs font-medium text-[var(--admin-text-main)] flex items-center gap-1.5 mb-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                  Username Sistem
                </Label>
                <Input
                  id="username"
                  value={`@${currentUser.username}`}
                  readOnly
                  disabled
                  className="h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] text-sm text-[var(--admin-muted)] cursor-not-allowed select-none"
                />
                <p className="mt-1.5 text-[11px] text-[var(--admin-muted)] flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-[var(--admin-muted)] shrink-0" />
                  Username akun sistem tidak dapat diubah demi keamanan akses.
                </p>
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-[var(--admin-text-main)] flex items-center gap-1.5 mb-1.5"
                >
                  <Mail className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                  Alamat Surel / Email Kontak
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staf@ifk-kotabaru.go.id"
                  disabled={isSavingInfo}
                  className="h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-sm text-[var(--admin-text-main)] placeholder:text-[var(--admin-muted)] focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSavingInfo}
                  className="inline-flex items-center gap-2 rounded-lg border border-brand-400/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-lg shadow-brand-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingInfo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Kartu 2: Keamanan & Kata Sandi */}
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-[var(--admin-border)] pb-4 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[var(--admin-text-main)]">
                  Keamanan & Kata Sandi
                </h3>
                <p className="text-xs text-[var(--admin-muted)]">
                  Pastikan akun Anda menggunakan kombinasi kata sandi yang kuat dan aman.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Password Lama */}
              <div>
                <Label
                  htmlFor="oldPassword"
                  className="text-xs font-medium text-[var(--admin-text-main)] flex items-center gap-1.5 mb-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                  Kata Sandi Saat Ini
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini"
                    disabled={isUpdatingPassword}
                    className="h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] pr-10 text-sm text-[var(--admin-text-main)] placeholder:text-[var(--admin-muted)] focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] hover:text-[var(--admin-text-main)] transition-colors cursor-pointer"
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
                  className="text-xs font-medium text-[var(--admin-text-main)] flex items-center gap-1.5 mb-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                  Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    disabled={isUpdatingPassword}
                    className="h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] pr-10 text-sm text-[var(--admin-text-main)] placeholder:text-[var(--admin-muted)] focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] hover:text-[var(--admin-text-main)] transition-colors cursor-pointer"
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
                  className="text-xs font-medium text-[var(--admin-text-main)] flex items-center gap-1.5 mb-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#455a26] dark:text-brand-400" />
                  Konfirmasi Kata Sandi Baru
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    disabled={isUpdatingPassword}
                    className="h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] pr-10 text-sm text-[var(--admin-text-main)] placeholder:text-[var(--admin-muted)] focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] hover:text-[var(--admin-text-main)] transition-colors cursor-pointer"
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
              <div className="flex items-start gap-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] p-3 text-xs text-[var(--admin-muted)]">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk menjaga keamanan akun Anda.
                </span>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2 text-xs sm:text-sm font-medium text-[var(--admin-text-main)] shadow-md hover:bg-[var(--admin-hover-bg)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Perbarui Kata Sandi</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
