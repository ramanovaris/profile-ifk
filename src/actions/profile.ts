"use server";

import { revalidatePath } from "next/cache";
import * as path from "path";
import * as fs from "fs/promises";
import * as bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { getCurrentSession, verifyPassword } from "../lib/auth";
import type { Role, UserStatus } from "@prisma/client";

export type ProfileActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type SafeProfileUser = {
  id: string;
  username: string;
  name: string;
  email: string | null;
  avatar: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
};

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Menyimpan file foto avatar secara lokal di public/uploads/avatars/
 */
async function saveAvatarFile(file: File, userId: string): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Format foto tidak didukung. Gunakan file bertipe JPG, PNG, atau WebP.");
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("Ukuran foto profil melebihi batas maksimal 5MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await fs.mkdir(uploadDir, { recursive: true });

  const extMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  const ext = extMap[file.type] || path.extname(file.name) || ".jpg";
  const filename = `avatar-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return `/uploads/avatars/${filename}`;
}

/**
 * Menghapus file avatar lama jika tersimpan di direktori lokal
 */
async function deleteOldAvatarFile(avatarUrl?: string | null) {
  if (!avatarUrl || !avatarUrl.startsWith("/uploads/avatars/")) {
    return;
  }
  try {
    const fullPath = path.join(process.cwd(), "public", avatarUrl);
    await fs.unlink(fullPath);
  } catch {
    // Abaikan jika berkas tidak ditemukan di filesystem
  }
}

/**
 * Server Action: Mengambil profil pengguna yang sedang aktif.
 */
export async function getMyProfileAction(): Promise<ProfileActionResult<SafeProfileUser>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  const user = await db.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    return {
      success: false,
      error: "Akun pengguna tidak ditemukan.",
    };
  }

  return {
    success: true,
    data: user,
  };
}

/**
 * Server Action: Memperbarui profil mandiri pengguna (nama lengkap, email, foto profil).
 */
export async function updateMyProfileAction(
  formData: FormData
): Promise<ProfileActionResult<SafeProfileUser>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  const name = formData.get("name")?.toString().trim();
  const rawEmail = formData.get("email")?.toString().trim();
  const email = rawEmail && rawEmail.length > 0 ? rawEmail : null;
  const avatarFile = formData.get("avatar") as File | null;
  const removeAvatar = formData.get("removeAvatar")?.toString() === "true";

  if (!name || name.length < 2) {
    return {
      success: false,
      error: "Nama lengkap minimal 2 karakter.",
    };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: "Format alamat email tidak valid.",
    };
  }

  try {
    const currentUser = await db.user.findUnique({
      where: { id: auth.user.id },
    });

    if (!currentUser) {
      return {
        success: false,
        error: "Akun pengguna tidak ditemukan.",
      };
    }

    let nextAvatar: string | null | undefined = undefined;

    // Unggah foto baru jika ada
    if (avatarFile && avatarFile.size > 0 && avatarFile.name && avatarFile.name !== "undefined") {
      const savedPath = await saveAvatarFile(avatarFile, auth.user.id);
      if (currentUser.avatar) {
        await deleteOldAvatarFile(currentUser.avatar);
      }
      nextAvatar = savedPath;
    } else if (removeAvatar) {
      if (currentUser.avatar) {
        await deleteOldAvatarFile(currentUser.avatar);
      }
      nextAvatar = null;
    }

    const updated = await db.user.update({
      where: { id: auth.user.id },
      data: {
        name,
        email,
        ...(nextAvatar !== undefined ? { avatar: nextAvatar } : {}),
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    try {
      revalidatePath("/admin/profil");
      revalidatePath("/admin/pengguna");
      revalidatePath("/admin/dashboard");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error("[updateMyProfileAction] Error:", err);
    const msg = err instanceof Error ? err.message : "Terjadi kendala pada sistem saat memperbarui profil.";
    return {
      success: false,
      error:
        msg.includes("Format foto") || msg.includes("Ukuran foto")
          ? msg
          : "Terjadi kendala pada sistem saat memperbarui profil.",
    };
  }
}

/**
 * Server Action: Mengganti kata sandi mandiri pengguna aktif.
 */
export async function changeMyPasswordAction(data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ProfileActionResult<null>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  const { oldPassword, newPassword, confirmPassword } = data;

  if (!oldPassword) {
    return {
      success: false,
      error: "Silakan masukkan kata sandi saat ini.",
    };
  }

  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      error: "Kata sandi baru minimal harus 8 karakter.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Konfirmasi kata sandi baru tidak cocok.",
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: auth.user.id },
    });

    if (!user) {
      return {
        success: false,
        error: "Akun pengguna tidak ditemukan.",
      };
    }

    const isMatch = await verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      return {
        success: false,
        error: "Kata sandi saat ini tidak sesuai.",
      };
    }

    // Periksa apakah kata sandi baru sama dengan kata sandi lama
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return {
        success: false,
        error: "Kata sandi baru tidak boleh sama dengan kata sandi saat ini.",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: auth.user.id },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      data: null,
    };
  } catch (err: unknown) {
    console.error("[changeMyPasswordAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kendala pada sistem saat memperbarui kata sandi.",
    };
  }
}
