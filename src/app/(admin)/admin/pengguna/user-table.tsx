"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  Search,
  Users,
  UserPlus,
  User as UserIcon,
  Shield,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Save,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  resetUserPasswordAction,
  deleteUserAction,
} from "@/actions/user";
import type { Role, UserStatus } from "@prisma/client";

export type UserItem = {
  id: string;
  name: string;
  username: string;
  role: Role;
  status: UserStatus;
  createdAt: string | Date;
  articleCount?: number;
};

type RoleFilter = "ALL" | "SUPER_ADMIN" | "STAFF";

type UserFormData = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: Role;
  status: UserStatus;
};

export function UserTable({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserItem[];
  currentUserId?: string;
}) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal Tambah / Edit State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "STAFF",
    status: "ACTIVE",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Reset Sandi State
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Modal Hapus State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal Konfirmasi Toggle Status State
  const [toggleStatusTarget, setToggleStatusTarget] = useState<UserItem | null>(null);

  // Filter Pengguna
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Paginasi
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handler Tambah
  const handleOpenAdd = () => {
    setEditUser(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "STAFF",
      status: "ACTIVE",
    });
    setFormError(null);
    setIsUserModalOpen(true);
  };

  // Handler Edit
  const handleOpenEdit = (user: UserItem) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: "",
      confirmPassword: "",
      role: user.role,
      status: user.status ?? "ACTIVE",
    });
    setFormError(null);
    setIsUserModalOpen(true);
  };

  // Submit Tambah / Edit
  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim().toLowerCase();

    if (!trimmedName) {
      setFormError("Nama lengkap tidak boleh kosong.");
      toast.error("Nama lengkap tidak boleh kosong.");
      return;
    }

    if (!trimmedUsername) {
      setFormError("Username tidak boleh kosong.");
      toast.error("Username tidak boleh kosong.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmedUsername)) {
      setFormError(
        "Username hanya boleh menggunakan huruf, angka, atau underscore (3-30 karakter)."
      );
      toast.error("Format username tidak valid.");
      return;
    }

    // Validasi kata sandi untuk mode tambah baru
    if (!editUser) {
      if (!formData.password) {
        setFormError("Kata sandi wajib diisi untuk pengguna baru.");
        toast.error("Kata sandi wajib diisi untuk pengguna baru.");
        return;
      }
      if (formData.password.length < 6) {
        setFormError("Kata sandi minimal 6 karakter.");
        toast.error("Kata sandi minimal 6 karakter.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("Konfirmasi kata sandi tidak cocok.");
        toast.error("Konfirmasi kata sandi tidak cocok.");
        return;
      }
    }

    startTransition(async () => {
      try {
        if (!editUser) {
          // Create User
          const res = await createUserAction({
            name: trimmedName,
            username: trimmedUsername,
            password: formData.password,
            role: formData.role,
            status: formData.status,
          });

          if (!res.success || !res.data) {
            setFormError(res.error || "Gagal menambahkan pengguna.");
            toast.error(res.error || "Gagal menambahkan pengguna.");
            return;
          }

          setUsers((prev) => [res.data as UserItem, ...prev]);
          toast.success(`Pengguna "${trimmedName}" berhasil ditambahkan.`);
          setIsUserModalOpen(false);
        } else {
          // Update User
          const res = await updateUserAction(editUser.id, {
            name: trimmedName,
            username: trimmedUsername,
            role: formData.role,
            status: formData.status,
          });

          if (!res.success || !res.data) {
            setFormError(res.error || "Gagal memperbarui pengguna.");
            toast.error(res.error || "Gagal memperbarui pengguna.");
            return;
          }

          setUsers((prev) =>
            prev.map((u) => (u.id === editUser.id ? (res.data as UserItem) : u))
          );
          toast.success(`Pengguna "${trimmedName}" berhasil diperbarui.`);
          setIsUserModalOpen(false);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan data pengguna.";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    });
  };

  // Handler Toggle Status Akun
  const handleOpenToggleStatus = (user: UserItem) => {
    if (user.username.toLowerCase() === "admin") {
      toast.error("Status Administrator Utama selalu aktif.");
      return;
    }

    if (user.id === currentUserId) {
      toast.error("Anda tidak dapat menonaktifkan akun sendiri.");
      return;
    }

    setToggleStatusTarget(user);
  };

  const handleConfirmToggleStatus = () => {
    if (!toggleStatusTarget) return;
    const target = toggleStatusTarget;
    setToggleStatusTarget(null);

    startTransition(async () => {
      try {
        const res = await toggleUserStatusAction(target.id);
        if (!res.success || !res.data) {
          toast.error(res.error || "Gagal memperbarui status akun.");
          return;
        }

        const nextStatus = res.data.status;
        setUsers((prev) =>
          prev.map((u) => (u.id === target.id ? { ...u, status: nextStatus } : u))
        );
        toast.info(
          `Status akun "${target.name}" diubah ke ${
            nextStatus === "ACTIVE" ? "Aktif" : "Non-Aktif"
          }.`
        );
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Gagal memperbarui status akun."
        );
      }
    });
  };

  // Handler Reset Sandi
  const handleOpenReset = (user: UserItem) => {
    setResetTarget(user);
    setNewPassword("");
    setConfirmNewPassword("");
    setResetError(null);
    setResetSuccessMessage(null);
    setIsResetPasswordOpen(true);
  };

  const handleSubmitReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    if (!newPassword) {
      setResetError("Kata sandi baru tidak boleh kosong.");
      toast.error("Kata sandi baru tidak boleh kosong.");
      return;
    }
    if (newPassword.length < 6) {
      setResetError("Kata sandi baru minimal 6 karakter.");
      toast.error("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError("Konfirmasi kata sandi tidak cocok.");
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await resetUserPasswordAction(resetTarget.id, newPassword);
        if (!res.success) {
          setResetError(res.error || "Gagal mengatur ulang kata sandi.");
          toast.error(res.error || "Gagal mengatur ulang kata sandi.");
          return;
        }

        setResetSuccessMessage(
          `Kata sandi untuk @${resetTarget.username} berhasil diperbarui!`
        );
        toast.success(`Kata sandi @${resetTarget.username} berhasil diperbarui.`);
        setTimeout(() => {
          setIsResetPasswordOpen(false);
          setResetSuccessMessage(null);
        }, 1200);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengatur ulang kata sandi.";
        setResetError(msg);
        toast.error(msg);
      }
    });
  };

  // Target Hapus Pengguna
  const userToDelete = users.find((u) => u.id === deleteId);
  const isRootAdmin = userToDelete?.username.toLowerCase() === "admin";
  const isSelf = userToDelete?.id === currentUserId;
  const hasArticles = (userToDelete?.articleCount ?? 0) > 0;
  const isProtectedFromDelete = isRootAdmin || isSelf || hasArticles;

  const handleConfirmDelete = () => {
    if (!deleteId || isProtectedFromDelete) {
      if (isRootAdmin) toast.error("Akun Administrator Utama tidak dapat dihapus.");
      if (isSelf) toast.error("Anda tidak dapat menghapus akun Anda sendiri.");
      if (hasArticles)
        toast.error(
          "Pengguna memiliki riwayat artikel dan tidak dapat dihapus."
        );
      return;
    }

    const name = userToDelete?.name ?? "";
    startTransition(async () => {
      try {
        const res = await deleteUserAction(deleteId);
        if (!res.success) {
          toast.error(res.error || "Gagal menghapus pengguna.");
          return;
        }

        setUsers((prev) => prev.filter((u) => u.id !== deleteId));
        toast.success(`Pengguna "${name}" berhasil dihapus.`);
        setDeleteId(null);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Gagal menghapus pengguna."
        );
      }
    });
  };

  // Helper Inisial Avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Kelola Pengguna
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manajemen akun staf dan administrator sistem profil UPTD IFK Kotabaru.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 transition-all [@media(hover:hover)]:hover:brightness-110 active:scale-95 sm:self-auto self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Toolbar: Search & Filter Peran */}
      <div className="relative z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/5 bg-zinc-900/60 p-3.5 backdrop-blur-xl">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama atau username..."
            className="w-full rounded-lg border border-white/5 bg-zinc-950/60 py-2 pl-9 pr-8 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-zinc-400 hover:text-white"
              title="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setRoleFilter("ALL");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              roleFilter === "ALL"
                ? "border border-brand-500/30 bg-brand-500/15 text-brand-300 font-semibold shadow-sm shadow-brand-500/10"
                : "border border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleFilter("SUPER_ADMIN");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              roleFilter === "SUPER_ADMIN"
                ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm shadow-emerald-500/10"
                : "border border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            Super Admin ({users.filter((u) => u.role === "SUPER_ADMIN").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleFilter("STAFF");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              roleFilter === "STAFF"
                ? "border border-sky-500/40 bg-sky-500/20 text-sky-300 font-semibold shadow-sm shadow-sky-500/10"
                : "border border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            Staff ({users.filter((u) => u.role === "STAFF").length})
          </button>
        </div>
      </div>

      {/* Tabel Pengguna (Dark Ethereal Card) */}
      <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-400 font-medium tracking-wider uppercase">
                <th className="px-4 py-3.5 align-middle">Pengguna</th>
                <th className="px-4 py-3.5 align-middle w-[140px]">Peran</th>
                <th className="px-4 py-3.5 align-middle text-center w-[120px]">Status</th>
                <th className="hidden md:table-cell px-4 py-3.5 align-middle w-[150px]">
                  Tanggal Dibuat
                </th>
                <th className="px-4 py-3.5 align-middle text-right w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const isSuper = user.role === "SUPER_ADMIN";
                  const formattedDate = new Date(user.createdAt).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Kolom Pengguna */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-emerald-700 text-xs font-bold text-white ring-1 ring-white/10 shadow-sm">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-xs sm:text-sm">
                              {user.name}
                            </p>
                            <p className="font-mono text-[11px] text-zinc-400 truncate">
                              @{user.username}
                              {user.articleCount !== undefined && user.articleCount > 0 && (
                                <span className="ml-1.5 text-zinc-500 font-sans">
                                  &bull; {user.articleCount} artikel
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Peran */}
                      <td className="px-4 py-3.5 align-middle">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] shrink-0" />
                            <span>Super Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)] shrink-0" />
                            <span>Staff</span>
                          </span>
                        )}
                      </td>

                      {/* Kolom Status Toggle */}
                      <td className="px-4 py-3.5 align-middle text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenToggleStatus(user)}
                          disabled={
                            isPending ||
                            user.username.toLowerCase() === "admin" ||
                            user.id === currentUserId
                          }
                          title={
                            user.username.toLowerCase() === "admin"
                              ? "Status Administrator Utama selalu aktif"
                              : user.id === currentUserId
                              ? "Tidak dapat menonaktifkan akun sendiri"
                              : "Klik untuk ubah status akun"
                          }
                          className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            user.status === "ACTIVE"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 [@media(hover:hover)]:hover:bg-emerald-500/20 active:bg-emerald-500/30"
                              : "border-zinc-600 bg-zinc-800/50 text-zinc-400 [@media(hover:hover)]:hover:bg-zinc-800 active:bg-zinc-700"
                          } ${
                            user.username.toLowerCase() === "admin" ||
                            user.id === currentUserId
                              ? "cursor-not-allowed opacity-80"
                              : ""
                          }`}
                        >
                          {user.status === "ACTIVE" ? (
                            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span>{user.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}</span>
                        </button>
                      </td>

                      {/* Kolom Tanggal Dibuat */}
                      <td className="hidden md:table-cell px-4 py-3.5 align-middle text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Kolom Aksi */}
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          {/* Tombol Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            title="Edit Pengguna"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors [@media(hover:hover)]:hover:bg-white/10 [@media(hover:hover)]:hover:text-zinc-100 active:scale-95 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Tombol Reset Sandi */}
                          <button
                            type="button"
                            onClick={() => handleOpenReset(user)}
                            title="Reset Kata Sandi"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors [@media(hover:hover)]:hover:bg-amber-500/15 [@media(hover:hover)]:hover:text-amber-300 active:scale-95 cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => setDeleteId(user.id)}
                            title={
                              user.username.toLowerCase() === "admin"
                                ? "Akun Administrator Utama tidak dapat dihapus"
                                : user.id === currentUserId
                                ? "Tidak dapat menghapus akun sendiri"
                                : "Hapus Pengguna"
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors [@media(hover:hover)]:hover:bg-red-500/15 [@media(hover:hover)]:hover:text-red-400 active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-zinc-500">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-zinc-300">
                      Tidak ada pengguna yang ditemukan
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Coba sesuaikan kata kunci pencarian atau filter peran yang dipilih.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/5 bg-white/[0.01] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <p>
                Menampilkan{" "}
                <span className="font-medium text-white">
                  {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                </span>{" "}
                dari <span className="font-medium text-white">{filteredUsers.length}</span> pengguna
              </p>

              {/* Selector Baris Per Halaman */}
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                <span className="text-zinc-500">Baris:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none transition-colors hover:border-white/20 focus:border-brand-500/50 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(Math.max(1, validPage - 1))}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      validPage === page
                        ? "border border-brand-500/30 bg-brand-500/15 text-brand-300 font-semibold shadow-sm shadow-brand-500/10"
                        : "border border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, validPage + 1))}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Pengguna */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                {editUser ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  {editUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  {editUser
                    ? "Perbarui data nama, username, atau peran akun pengguna."
                    : "Tambahkan akun staf atau administrator sistem baru."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitUser} className="space-y-4 mt-2">
            {/* Field Nama Lengkap */}
            <div className="space-y-1.5">
              <Label
                htmlFor="userName"
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
              >
                <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span>Nama Lengkap</span>
              </Label>
              <Input
                id="userName"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (formError) setFormError(null);
                }}
                placeholder="Contoh: Siti Nurhaliza, S.Farm"
                className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Field Username */}
            <div className="space-y-1.5">
              <Label
                htmlFor="userUsername"
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
              >
                <span className="text-zinc-400 font-mono text-xs">@</span>
                <span>Username</span>
              </Label>
              <Input
                id="userUsername"
                value={formData.username}
                disabled={editUser?.username.toLowerCase() === "admin"}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value.toLowerCase(),
                  }));
                  if (formError) setFormError(null);
                }}
                placeholder="Contoh: sitinur"
                className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {editUser?.username.toLowerCase() === "admin" && (
                <p className="text-[11px] text-amber-400/90">
                  Username akun Administrator Utama tidak dapat diubah.
                </p>
              )}
            </div>

            {/* Pilihan Peran (Role Selector) */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                <Shield className="h-3.5 w-3.5 text-zinc-400" />
                <span>Peran Akun</span>
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={editUser?.username.toLowerCase() === "admin"}
                  onClick={() => setFormData((prev) => ({ ...prev, role: "STAFF" }))}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    formData.role === "STAFF"
                      ? "border-sky-500/50 bg-sky-500/10 text-sky-200 shadow-sm shadow-sky-500/10"
                      : "border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  } ${editUser?.username.toLowerCase() === "admin" ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <span className="font-semibold text-xs text-white">Staff</span>
                  <span className="text-[11px] text-zinc-400">
                    Akses kelola berita dan data profil
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "SUPER_ADMIN" }))
                  }
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    formData.role === "SUPER_ADMIN"
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-sm shadow-emerald-500/10"
                      : "border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-semibold text-xs text-white">Super Admin</span>
                  <span className="text-[11px] text-zinc-400">
                    Akses penuh termasuk kelola pengguna
                  </span>
                </button>
              </div>
            </div>

            {/* Toggle Status Pengguna */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div>
                <Label className="text-xs font-medium text-zinc-200">
                  Status Akun
                </Label>
                <p className="text-[11px] text-zinc-400">
                  {formData.status === "ACTIVE"
                    ? "Akun aktif dan dapat masuk ke sistem"
                    : "Akun non-aktif dan akses sistem ditangguhkan"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                disabled={
                  editUser?.username.toLowerCase() === "admin" ||
                  editUser?.id === currentUserId
                }
                aria-checked={formData.status === "ACTIVE"}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  }))
                }
                title={
                  editUser?.username.toLowerCase() === "admin"
                    ? "Status Administrator Utama selalu aktif"
                    : editUser?.id === currentUserId
                    ? "Tidak dapat mengubah status akun sendiri"
                    : "Ubah status akun"
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-opacity-75 ${
                  formData.status === "ACTIVE" ? "bg-emerald-600" : "bg-zinc-700"
                } ${
                  editUser?.username.toLowerCase() === "admin" ||
                  editUser?.id === currentUserId
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                <span className="sr-only">Toggle Status</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.status === "ACTIVE" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Field Password & Konfirmasi (Wajib di Add, Opsional di Edit) */}
            {!editUser && (
              <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.01] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Kata Sandi Awal
                  </span>
                </div>

                <div className="space-y-2">
                  <Input
                    id="userPassword"
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }));
                      if (formError) setFormError(null);
                    }}
                    placeholder="Minimal 6 karakter"
                    className="h-9 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  />

                  <Input
                    id="userConfirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }));
                      if (formError) setFormError(null);
                    }}
                    placeholder="Ulangi kata sandi..."
                    className="h-9 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {formError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{formError}</span>
              </p>
            )}

            {/* Tombol Aksi Modal (Standar Simetris 50/50) */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isPending ? "Menyimpan..." : "Simpan Pengguna"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Reset Sandi */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Reset Kata Sandi
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Atur ulang kata sandi untuk akun{" "}
                  <span className="font-semibold text-zinc-200">
                    {resetTarget?.name} (@{resetTarget?.username})
                  </span>
                  .
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitReset} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="newPassword"
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
              >
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Kata Sandi Baru</span>
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (resetError) setResetError(null);
                }}
                placeholder="Minimal 6 karakter..."
                className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-amber-500/60 focus-visible:ring-2 focus-visible:ring-amber-500/40 outline-none transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmNewPassword"
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-200"
              >
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Konfirmasi Kata Sandi Baru</span>
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (resetError) setResetError(null);
                }}
                placeholder="Ulangi kata sandi baru..."
                className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-amber-500/60 focus-visible:ring-2 focus-visible:ring-amber-500/40 outline-none transition-all"
              />
            </div>

            {resetError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{resetError}</span>
              </p>
            )}

            {resetSuccessMessage && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </p>
            )}

            {/* Tombol Aksi Modal (Standar Simetris 50/50) */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsResetPasswordOpen(false)}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-600 to-amber-500 px-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isPending ? "Menyimpan..." : "Simpan Kata Sandi"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Pengguna */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Hapus Akun Pengguna
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Konfirmasi penghapusan akun pengguna dari sistem.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Info Card Pengguna Target */}
            {userToDelete && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white ring-1 ring-white/10">
                    {getInitials(userToDelete.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-xs truncate">
                      {userToDelete.name}
                    </p>
                    <p className="font-mono text-[11px] text-zinc-400 truncate">
                      @{userToDelete.username} &bull; {userToDelete.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Guard Peringatan jika Akun Terlindungi */}
            {isRootAdmin ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Akun Utama Terlindungi
                </p>
                <p className="mt-1 text-[11px] text-amber-400/90 leading-relaxed">
                  Akun Administrator Utama (<code className="font-mono text-white">admin</code>)
                  tidak dapat dihapus untuk mencegah hilangnya akses administratif sistem.
                </p>
              </div>
            ) : isSelf ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Sesi Sedang Aktif
                </p>
                <p className="mt-1 text-[11px] text-amber-400/90 leading-relaxed">
                  Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk ke sistem.
                </p>
              </div>
            ) : hasArticles ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Pengguna Memiliki Artikel Terkait
                </p>
                <p className="mt-1 text-[11px] text-amber-400/90 leading-relaxed">
                  Pengguna ini telah mempublikasikan{" "}
                  <strong className="text-white font-semibold">
                    {userToDelete?.articleCount} artikel berita
                  </strong>
                  . Alihkan kepemilikan artikel atau hapus artikel terkait terlebih dahulu sebelum menghapus akun ini.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun ini? Seluruh data sesi dan akses
                pengguna akan dihapus secara permanen dari basis data.
              </p>
            )}
          </div>

          <div className={`mt-6 ${isProtectedFromDelete ? "flex justify-end" : "grid grid-cols-2 gap-3"}`}>
            {isProtectedFromDelete ? (
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Tutup / Mengerti
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>{isPending ? "Menghapus..." : "Hapus Akun"}</span>
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Toggle Status Pengguna */}
      <Dialog
        open={!!toggleStatusTarget}
        onOpenChange={() => setToggleStatusTarget(null)}
      >
        <DialogContent className="border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl w-[calc(100vw-2rem)] sm:w-full max-w-[calc(100vw-2rem)] sm:max-w-md shadow-2xl rounded-2xl p-5 sm:p-6 overflow-hidden">
          <DialogHeader className="space-y-2 pr-6">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  toggleStatusTarget?.status === "ACTIVE"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {toggleStatusTarget?.status === "ACTIVE" ? (
                  <UserX className="h-5 w-5" />
                ) : (
                  <UserCheck className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {toggleStatusTarget?.status === "ACTIVE"
                    ? "Nonaktifkan Akun Pengguna?"
                    : "Aktifkan Akun Pengguna?"}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {toggleStatusTarget?.status === "ACTIVE"
                    ? "Akses masuk akun ke sistem akan ditangguhkan sementara."
                    : "Akun akan diaktifkan kembali dan dapat masuk ke sistem."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {toggleStatusTarget && (
            <div className="space-y-3 mt-2 min-w-0 w-full">
              {/* User Info Card */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-2.5 min-w-0 w-full overflow-hidden">
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-emerald-700 text-xs font-bold text-white ring-1 ring-white/10 shadow-sm">
                    {getInitials(toggleStatusTarget.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate text-xs sm:text-sm">
                      {toggleStatusTarget.name}
                    </p>
                    <p className="font-mono text-[11px] text-zinc-400 truncate">
                      @{toggleStatusTarget.username} &bull;{" "}
                      {toggleStatusTarget.role === "SUPER_ADMIN"
                        ? "Super Admin"
                        : "Staff"}
                    </p>
                  </div>
                </div>

                {/* Status Transition Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2 text-xs w-full min-w-0">
                  <span className="text-zinc-400 shrink-0">Perubahan Status:</span>
                  <div className="flex items-center gap-1.5 font-medium shrink-0">
                    <span
                      className={
                        toggleStatusTarget.status === "ACTIVE"
                          ? "text-emerald-400"
                          : "text-zinc-400"
                      }
                    >
                      {toggleStatusTarget.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-zinc-500" />
                    <span
                      className={
                        toggleStatusTarget.status === "ACTIVE"
                          ? "text-amber-400 font-semibold"
                          : "text-emerald-400 font-semibold"
                      }
                    >
                      {toggleStatusTarget.status === "ACTIVE" ? "Non-Aktif" : "Aktif"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanatory Notice */}
              <div
                className={`rounded-lg border p-3 text-xs leading-relaxed break-words w-full ${
                  toggleStatusTarget.status === "ACTIVE"
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-300/90"
                    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300/90"
                }`}
              >
                {toggleStatusTarget.status === "ACTIVE"
                  ? "Akun ini tidak akan dapat login ke portal admin. Seluruh sesi login yang sedang aktif milik pengguna ini akan otomatis dicabut demi keamanan."
                  : "Akun ini akan diaktifkan kembali dan pengguna dapat segera masuk ke portal admin menggunakan kredensial yang tersimpan."}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setToggleStatusTarget(null)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirmToggleStatus}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg active:scale-95 ${
                toggleStatusTarget?.status === "ACTIVE"
                  ? "border border-amber-500/30 bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-500/20 hover:brightness-110"
                  : "border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 shadow-brand-500/20 hover:brightness-110"
              }`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : toggleStatusTarget?.status === "ACTIVE" ? (
                <UserX className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              <span>
                {toggleStatusTarget?.status === "ACTIVE"
                  ? "Nonaktifkan Akun"
                  : "Aktifkan Akun"}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
