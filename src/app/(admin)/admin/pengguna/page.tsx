"use client";

import { useState } from "react";
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
import { AdminShell } from "@/components/admin/admin-shell";
import { toast } from "@/components/ui/toast";
import { dummyUsers, type User } from "@/lib/dummy-data";

type RoleFilter = "ALL" | "SUPER_ADMIN" | "STAFF";

type UserFormData = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: "SUPER_ADMIN" | "STAFF";
  status: "ACTIVE" | "INACTIVE";
};

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<User[]>(dummyUsers);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal Tambah / Edit State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
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
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Modal Hapus State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter Pengguna
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query);

    const matchesRole =
      roleFilter === "ALL" || user.role === roleFilter;

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
  const handleOpenEdit = (user: User) => {
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

    if (!/^[a-z0-9_.-]+$/.test(trimmedUsername)) {
      setFormError(
        "Username hanya boleh menggunakan huruf kecil, angka, underscore, atau tanda hubung."
      );
      toast.error("Format username tidak valid.");
      return;
    }

    // Cek duplikasi username (kecuali pengguna yang sedang diedit)
    const isDuplicate = users.some(
      (u) =>
        u.username.toLowerCase() === trimmedUsername &&
        u.id !== editUser?.id
    );

    if (isDuplicate) {
      setFormError(`Username "${trimmedUsername}" sudah digunakan oleh akun lain.`);
      toast.error(`Username "${trimmedUsername}" sudah digunakan.`);
      return;
    }

    // Validasi password
    if (!editUser) {
      // Mode Tambah: Password wajib
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

      // Tambah pengguna baru
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: trimmedName,
        username: trimmedUsername,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString(),
      };

      setUsers([newUser, ...users]);
      toast.success(`Pengguna "${trimmedName}" berhasil ditambahkan.`);
    } else {
      // Mode Edit: Password opsional
      if (formData.password) {
        if (formData.password.length < 6) {
          setFormError("Kata sandi baru minimal 6 karakter.");
          toast.error("Kata sandi baru minimal 6 karakter.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setFormError("Konfirmasi kata sandi baru tidak cocok.");
          toast.error("Konfirmasi kata sandi baru tidak cocok.");
          return;
        }
      }

      // Update pengguna
      setUsers(
        users.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                name: trimmedName,
                username: trimmedUsername,
                role: formData.role,
                status: formData.status,
              }
            : u
        )
      );
      toast.success(`Pengguna "${trimmedName}" berhasil diperbarui.`);
    }

    setIsUserModalOpen(false);
  };

  // Handler Toggle Status Akun
  const toggleStatus = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (target.username.toLowerCase() === "admin") {
      toast.error("Akun Administrator Utama tidak dapat dinonaktifkan.");
      return;
    }

    const nextStatus = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: nextStatus } : u
      )
    );
    toast.info(
      `Status akun "${target.name}" diubah ke ${
        nextStatus === "ACTIVE" ? "Aktif" : "Non-Aktif"
      }.`
    );
  };

  // Handler Reset Sandi
  const handleOpenReset = (user: User) => {
    setResetTarget(user);
    setNewPassword("");
    setConfirmNewPassword("");
    setResetError(null);
    setResetSuccessMessage(null);
    setIsResetPasswordOpen(true);
  };

  const handleSubmitReset = (e: React.FormEvent) => {
    e.preventDefault();
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

    // Sukses reset
    setResetSuccessMessage(
      `Kata sandi untuk @${resetTarget?.username} berhasil diperbarui!`
    );
    toast.success(`Kata sandi @${resetTarget?.username} berhasil diperbarui.`);
    setTimeout(() => {
      setIsResetPasswordOpen(false);
      setResetSuccessMessage(null);
    }, 1200);
  };

  // Target Hapus Pengguna
  const userToDelete = users.find((u) => u.id === deleteId);
  const isRootAdmin = userToDelete?.username.toLowerCase() === "admin";

  const handleConfirmDelete = () => {
    if (!deleteId || isRootAdmin) {
      if (isRootAdmin) toast.error("Akun root admin tidak dapat dihapus.");
      return;
    }
    const name = userToDelete?.name ?? "";
    setUsers(users.filter((u) => u.id !== deleteId));
    toast.success(`Pengguna "${name}" berhasil dihapus.`);
    setDeleteId(null);
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
    <AdminShell>
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
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 transition-all [@media(hover:hover)]:hover:brightness-110 active:scale-95 sm:self-auto self-start"
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
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
                            onClick={() => toggleStatus(user.id)}
                            disabled={user.username.toLowerCase() === "admin"}
                            title={
                              user.username.toLowerCase() === "admin"
                                ? "Status Administrator Utama selalu aktif"
                                : "Klik untuk ubah status akun"
                            }
                            className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                              user.status === "ACTIVE"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 [@media(hover:hover)]:hover:bg-emerald-500/20 active:bg-emerald-500/30"
                                : "border-zinc-600 bg-zinc-800/50 text-zinc-400 [@media(hover:hover)]:hover:bg-zinc-800 active:bg-zinc-700"
                            } ${
                              user.username.toLowerCase() === "admin"
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
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors [@media(hover:hover)]:hover:bg-white/10 [@media(hover:hover)]:hover:text-zinc-100 active:scale-95"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            {/* Tombol Reset Sandi */}
                            <button
                              type="button"
                              onClick={() => handleOpenReset(user)}
                              title="Reset Kata Sandi"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors [@media(hover:hover)]:hover:bg-amber-500/15 [@media(hover:hover)]:hover:text-amber-300 active:scale-95"
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
                                  : "Hapus Pengguna"
                              }
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors [@media(hover:hover)]:hover:bg-red-500/15 [@media(hover:hover)]:hover:text-red-400 active:scale-95"
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
                    className="rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none transition-colors hover:border-white/20 focus:border-brand-500/50"
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
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
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
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
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
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
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
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value.toLowerCase(),
                  }));
                  if (formError) setFormError(null);
                }}
                placeholder="Contoh: sitinur"
                className="h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
              />
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
                  onClick={() => setFormData((prev) => ({ ...prev, role: "STAFF" }))}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                    formData.role === "STAFF"
                      ? "border-sky-500/50 bg-sky-500/10 text-sky-200 shadow-sm shadow-sky-500/10"
                      : "border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
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
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
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
                disabled={editUser?.username.toLowerCase() === "admin"}
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
                    : "Ubah status akun"
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-opacity-75 ${
                  formData.status === "ACTIVE" ? "bg-emerald-600" : "bg-zinc-700"
                } ${
                  editUser?.username.toLowerCase() === "admin"
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
            <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.01] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">
                  {editUser ? "Ubah Kata Sandi (Opsional)" : "Kata Sandi"}
                </span>
                {editUser && (
                  <span className="text-[10px] text-zinc-500">
                    Kosongkan jika tetap
                  </span>
                )}
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
                  placeholder={editUser ? "Kata sandi baru..." : "Minimal 6 karakter"}
                  className="h-9 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all"
                />

                {(formData.password || !editUser) && (
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
                )}
              </div>
            </div>

            {/* Error Message */}
            {formError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{formError}</span>
              </p>
            )}

            {/* Tombol Aksi Modal */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Pengguna</span>
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsResetPasswordOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-600 to-amber-500 px-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Kata Sandi</span>
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

            {/* Guard Peringatan jika Akun Root Admin */}
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
            ) : (
              <p className="text-xs text-zinc-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun ini? Pengguna tidak akan dapat masuk
                lagi ke portal admin setelah dihapus.
              </p>
            )}
          </div>

          <div className={`mt-6 ${isRootAdmin ? "flex justify-end" : "grid grid-cols-2 gap-3"}`}>
            {isRootAdmin ? (
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
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Akun</span>
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
