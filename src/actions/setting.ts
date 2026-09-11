"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import type { SiteSetting } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { siteConfig } from "@/lib/dummy-data";

export interface UpdateIdentityInput {
  name: string;
  shortName: string;
  tagline: string;
  motto: string;
  address: string;
  operationalHours: string;
  phone: string;
  whatsappLink: string;
  email: string;
  googleMapsEmbedUrl: string;
}

export type SettingActionResult<T = SiteSetting> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Mendapatkan konfigurasi situs dari PostgreSQL dengan deduplikasi kueri React Cache
 * dan fallback aman ke data bawaan siteConfig jika database belum siap.
 */
export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (setting) {
      return setting;
    }
  } catch (err) {
    console.error("[Settings] Gagal membaca site_settings dari basis data:", err);
  }

  // Fallback aman untuk menjamin halaman tidak crash
  return {
    id: "default",
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    address: siteConfig.address,
    phone: siteConfig.phone,
    email: siteConfig.email,
    whatsappLink: siteConfig.whatsappLink,
    googleMapsEmbedUrl: siteConfig.googleMapsEmbedUrl,
    operationalHours: siteConfig.operationalHours,
    sp4nLaporUrl: siteConfig.sp4nLaporUrl,
    motto: siteConfig.motto,
    tagline: siteConfig.tagline,
    updatedAt: new Date(),
  };
});

/**
 * Memperbarui data identitas & kontak instansi di PostgreSQL.
 * Memerlukan otentikasi sesi aktif dengan peran SUPER_ADMIN.
 */
export async function updateSiteIdentityAction(
  data: UpdateIdentityInput
): Promise<SettingActionResult> {
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
      error: "Hanya Super Admin yang berwenang mengubah pengaturan instansi.",
    };
  }

  const name = data.name?.trim();
  const shortName = data.shortName?.trim();
  const tagline = data.tagline?.trim() || "";
  const motto = data.motto?.trim() || "";
  const address = data.address?.trim() || "";
  const operationalHours = data.operationalHours?.trim() || "";
  const phone = data.phone?.trim() || "";
  const whatsappLink = data.whatsappLink?.trim() || "";
  const email = data.email?.trim() || "";
  const googleMapsEmbedUrl = data.googleMapsEmbedUrl?.trim() || "";

  if (!name || name.length < 3) {
    return {
      success: false,
      error: "Nama instansi minimal 3 karakter.",
    };
  }

  if (!shortName || shortName.length < 2) {
    return {
      success: false,
      error: "Nama singkat instansi minimal 2 karakter.",
    };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: "Format email instansi tidak valid.",
    };
  }

  try {
    const updated = await db.siteSetting.upsert({
      where: { id: "default" },
      update: {
        name,
        shortName,
        tagline,
        motto,
        address,
        operationalHours,
        phone,
        whatsappLink,
        email,
        googleMapsEmbedUrl,
      },
      create: {
        id: "default",
        name,
        shortName,
        tagline,
        motto,
        address,
        operationalHours,
        phone,
        whatsappLink,
        email,
        googleMapsEmbedUrl,
        sp4nLaporUrl: siteConfig.sp4nLaporUrl,
      },
    });

    // Revalidasi cache halaman publik dan admin
    revalidatePath("/", "layout");
    revalidatePath("/admin/pengaturan");
    revalidatePath("/kontak");

    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    console.error("[Settings] Gagal menyimpan pengaturan:", err);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat menyimpan ke basis data.",
    };
  }
}
