"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/db";
import { createSession, invalidateSession, verifyPassword } from "../lib/auth";

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

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
