"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/db";
import { createSession, invalidateSession, verifyPassword, getCurrentSession } from "../lib/auth";
import type { Role } from "@prisma/client";

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

export type AuthUserInfo = {
  id: string;
  name: string;
  username: string;
  role: Role;
};

/**
 * Server Action untuk mengambil informasi profil pengguna yang sedang login.
 */
export async function getCurrentUserAction(): Promise<AuthUserInfo | null> {
  const session = await getCurrentSession();
  if (!session) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    username: session.user.username,
    role: session.user.role,
  };
}

/**
 * Server Action untuk menangani login administrator dan staf.
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { success: false, error: "Username dan password wajib diisi." };
  }

  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { success: false, error: "Username atau kata sandi tidak sesuai." };
  }

  if (user.status !== "ACTIVE") {
    return {
      success: false,
      error: "Akun Anda dinonaktifkan. Silakan hubungi Administrator.",
    };
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return { success: false, error: "Username atau kata sandi tidak sesuai." };
  }

  await createSession(user.id);
  return { success: true };
}

/**
 * Server Action untuk memproses logout: menghapus sesi dari database & cookie.
 */
export async function logoutAction(): Promise<void> {
  await invalidateSession();
  redirect("/admin/login");
}
