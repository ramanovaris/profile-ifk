"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { getCurrentSession } from "../lib/auth";
import type { Role, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

export type UserActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type SafeUser = {
  id: string;
  username: string;
  name: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  articleCount?: number;
};

/**
 * Server Action: Menambahkan akun pengguna baru ke PostgreSQL.
 */
export async function createUserAction(data: {
  name: string;
  username: string;
  password: string;
  role: Role;
  status?: UserStatus;
}): Promise<UserActionResult<SafeUser>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  if (auth.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Hanya Super Admin yang berwenang menambahkan pengguna baru.",
    };
  }

  const trimmedName = data.name?.trim();
  const trimmedUsername = data.username?.trim().toLowerCase();
  const password = data.password;

  if (!trimmedName || trimmedName.length < 2) {
    return {
      success: false,
      error: "Nama lengkap minimal 2 karakter.",
    };
  }

  if (!trimmedUsername || !/^[a-zA-Z0-9_]{3,30}$/.test(trimmedUsername)) {
    return {
      success: false,
      error: "Username hanya boleh huruf, angka, garis bawah (_), dan 3-30 karakter.",
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: "Kata sandi minimal 6 karakter.",
    };
  }

  try {
    const existing = await db.user.findFirst({
      where: {
        username: {
          equals: trimmedUsername,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Username '${trimmedUsername}' sudah digunakan. Silakan gunakan username lain.`,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        name: trimmedName,
        username: trimmedUsername,
        password: hashedPassword,
        role: data.role || "STAFF",
        status: data.status || "ACTIVE",
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    try {
      revalidatePath("/admin/pengguna");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: {
        ...newUser,
        articleCount: 0,
      },
    };
  } catch (err: unknown) {
    console.error("[createUserAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat menambahkan pengguna ke database.",
    };
  }
}

/**
 * Server Action: Memperbarui profil akun pengguna (nama, username, peran, status).
 */
export async function updateUserAction(
  id: string,
  data: {
    name: string;
    username: string;
    role: Role;
    status: UserStatus;
  }
): Promise<UserActionResult<SafeUser>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  if (auth.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Hanya Super Admin yang berwenang mengubah data pengguna.",
    };
  }

  const trimmedName = data.name?.trim();
  const trimmedUsername = data.username?.trim().toLowerCase();

  if (!trimmedName || trimmedName.length < 2) {
    return {
      success: false,
      error: "Nama lengkap minimal 2 karakter.",
    };
  }

  if (!trimmedUsername || !/^[a-zA-Z0-9_]{3,30}$/.test(trimmedUsername)) {
    return {
      success: false,
      error: "Username hanya boleh huruf, angka, garis bawah (_), dan 3-30 karakter.",
    };
  }

  try {
    const targetUser = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan di database.",
      };
    }

    // Proteksi akun super admin utama
    if (targetUser.username === "admin") {
      if (trimmedUsername !== "admin") {
        return {
          success: false,
          error: "Username akun Super Admin utama ('admin') tidak dapat diubah.",
        };
      }
      if (data.role !== "SUPER_ADMIN") {
        return {
          success: false,
          error: "Peran akun Super Admin utama tidak dapat diturunkan.",
        };
      }
      if (data.status !== "ACTIVE") {
        return {
          success: false,
          error: "Status akun Super Admin utama harus tetap aktif.",
        };
      }
    }

    // Cek duplikasi username jika diubah
    if (trimmedUsername !== targetUser.username.toLowerCase()) {
      const existing = await db.user.findFirst({
        where: {
          username: {
            equals: trimmedUsername,
            mode: "insensitive",
          },
          id: { not: id },
        },
      });

      if (existing) {
        return {
          success: false,
          error: `Username '${trimmedUsername}' sudah digunakan oleh akun lain.`,
        };
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name: trimmedName,
        username: trimmedUsername,
        role: data.role,
        status: data.status,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Jika pengguna dinonaktifkan, cabut semua sesi aktifnya
    if (data.status === "INACTIVE") {
      await db.session.deleteMany({
        where: { userId: id },
      });
    }

    try {
      revalidatePath("/admin/pengguna");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: {
        ...updatedUser,
        articleCount: targetUser._count.articles,
      },
    };
  } catch (err: unknown) {
    console.error("[updateUserAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui data pengguna.",
    };
  }
}

/**
 * Server Action: Mengubah status aktif / nonaktif pengguna secara instan.
 */
export async function toggleUserStatusAction(
  id: string
): Promise<UserActionResult<{ status: UserStatus }>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  if (auth.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Hanya Super Admin yang berwenang mengubah status akun pengguna.",
    };
  }

  try {
    const targetUser = await db.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan.",
      };
    }

    if (targetUser.username === "admin") {
      return {
        success: false,
        error: "Status akun Super Admin utama tidak dapat dinonaktifkan.",
      };
    }

    if (targetUser.id === auth.user.id) {
      return {
        success: false,
        error: "Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang masuk.",
      };
    }

    const nextStatus: UserStatus =
      targetUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await db.user.update({
      where: { id },
      data: { status: nextStatus },
    });

    if (nextStatus === "INACTIVE") {
      await db.session.deleteMany({
        where: { userId: id },
      });
    }

    try {
      revalidatePath("/admin/pengguna");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: { status: nextStatus },
    };
  } catch (err: unknown) {
    console.error("[toggleUserStatusAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui status pengguna.",
    };
  }
}

/**
 * Server Action: Reset kata sandi pengguna oleh Super Admin.
 */
export async function resetUserPasswordAction(
  id: string,
  newPassword: string
): Promise<UserActionResult<null>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  if (auth.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Hanya Super Admin yang berwenang mengatur ulang kata sandi pengguna.",
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: "Kata sandi baru minimal 6 karakter.",
    };
  }

  try {
    const targetUser = await db.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan.",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Invalidate semua sesi aktif milik user ini kecuali jika dia mereset dirinya sendiri
    if (targetUser.id !== auth.user.id) {
      await db.session.deleteMany({
        where: { userId: id },
      });
    }

    try {
      revalidatePath("/admin/pengguna");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: null,
    };
  } catch (err: unknown) {
    console.error("[resetUserPasswordAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengatur ulang kata sandi pengguna.",
    };
  }
}

/**
 * Server Action: Menghapus akun pengguna dari database.
 */
export async function deleteUserAction(
  id: string
): Promise<UserActionResult<null>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  if (auth.user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Hanya Super Admin yang berwenang menghapus pengguna.",
    };
  }

  try {
    const targetUser = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan.",
      };
    }

    if (targetUser.username === "admin") {
      return {
        success: false,
        error: "Akun Super Admin utama ('admin') dilindungi sistem dan tidak dapat dihapus.",
      };
    }

    if (targetUser.id === auth.user.id) {
      return {
        success: false,
        error: "Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.",
      };
    }

    if (targetUser._count.articles > 0) {
      return {
        success: false,
        error: `Pengguna tidak dapat dihapus karena tercatat sebagai penulis pada ${targetUser._count.articles} artikel berita. Silakan ubah status akun menjadi Non-Aktif jika staf sudah tidak bertugas.`,
      };
    }

    // Hapus seluruh sesi aktif pengguna
    await db.session.deleteMany({
      where: { userId: id },
    });

    // Hapus record pengguna
    await db.user.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin/pengguna");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: null,
    };
  } catch (err: unknown) {
    console.error("[deleteUserAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus pengguna.",
    };
  }
}
