import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { Session, User } from "@prisma/client";
import { db } from "./db";

export const SESSION_COOKIE_NAME = "ifk_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 hari (dalam detik)

/**
 * Melakukan hashing kata sandi plain text menggunakan bcrypt dengan cost factor 10.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Memverifikasi kecocokan kata sandi plain text terhadap bcrypt hash di database.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Membuat record sesi baru di basis data dan memasang HTTP-Only cookie pada browser.
 */
export async function createSession(userId: string): Promise<Session> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  const session = await db.session.create({
    data: {
      sessionToken: token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return session;
}

/**
 * Mengambil sesi dan data user yang sedang aktif berdasarkan cookie `ifk_session`.
 * Jika sesi kedaluwarsa atau user dinonaktifkan (INACTIVE), sesi otomatis dimusnahkan.
 */
export async function getCurrentSession(): Promise<{ user: User; session: Session } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session) {
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    // Periksa apakah sesi telah kedaluwarsa
    if (session.expiresAt.getTime() < Date.now()) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    // Periksa status keaktifan user (Instant Revocation)
    if (session.user.status !== "ACTIVE") {
      await db.session.deleteMany({ where: { userId: session.userId } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    const { user, ...sessionData } = session;
    return { user, session: sessionData };
  } catch (error) {
    console.error("Gagal memverifikasi sesi aktif:", error);
    return null;
  }
}

/**
 * Menghapus record sesi dari database dan membersihkan cookie sesi dari browser.
 */
export async function invalidateSession(token?: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionToken = token ?? cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await db.session.deleteMany({
        where: { sessionToken },
      }).catch(() => {});
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error("Gagal membatalkan sesi:", error);
  }
}
