"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import * as path from "path";
import * as fs from "fs/promises";
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

const DEFAULT_GREETING = `Assalamualaikum Warahmatullahi Wabarakatuh.

Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga UPTD Instalasi Farmasi Kabupaten Kotabaru dapat terus memberikan pelayanan terbaik di bidang kefarmasian bagi masyarakat Kabupaten Kotabaru.

Kami berkomitmen untuk terus meningkatkan kualitas distribusi obat dan farmasi, menjaga mutu pelayanan, serta memastikan ketersediaan obat yang aman, berkhasiat, dan berkualitas di seluruh fasilitas kesehatan binaan.

Semoga website ini dapat menjadi sarana informasi yang bermanfaat bagi seluruh masyarakat.

Wassalamualaikum Warahmatullahi Wabarakatuh.`;

const DEFAULT_VISION = `Terwujudnya Pelayanan Kefarmasian yang Bermutu, Merata, dan Terjangkau Menuju Masyarakat Kabupaten Kotabaru yang Sehat dan Mandiri.`;

const DEFAULT_MISSION = `1. Menjamin ketersediaan, pemerataan, dan keterjangkauan obat dan perbekalan kesehatan di seluruh fasilitas kesehatan binaan.
2. Meningkatkan mutu pengelolaan dan pengawasan obat secara transparan dan akuntabel.
3. Mengembangkan kapasitas sumber daya manusia dan pemanfaatan teknologi informasi dalam pengelolaan kefarmasian.
4. Mendorong pemberdayaan masyarakat dalam penggunaan obat yang rasional dan bijak.`;

const DEFAULT_TUPOKSI = `UPTD Instalasi Farmasi mempunyai tugas melaksanakan kegiatan teknis operasional dinas dalam pengelolaan obat, alat kesehatan, dan perbekalan kesehatan lainnya yang meliputi perencanaan kebutuhan, penerimaan, penyimpanan, pemeliharaan, pendistribusian, pemantauan, serta evaluasi.`;

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
    headName: "apt. H. Muhammad Yusuf, S.Farm",
    headRole: "Kepala UPTD Instalasi Farmasi Kab. Kotabaru",
    headPhoto: null,
    orgStructurePhoto: null,
    greeting: DEFAULT_GREETING,
    vision: DEFAULT_VISION,
    mission: DEFAULT_MISSION,
    tupoksi: DEFAULT_TUPOKSI,
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

/**
 * Menyimpan file foto pimpinan secara lokal di direktori public/uploads/profile/
 */
async function saveProfilePhotoFile(file: File): Promise<string> {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Format foto tidak didukung. Gunakan file bertipe PNG, JPG, atau WebP.");
  }

  // Batas maksimal 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran foto pimpinan melebihi batas maksimal 5MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "profile");
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `head-photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return `/uploads/profile/${filename}`;
}

/**
 * Menyimpan file bagan struktur organisasi secara lokal di direktori public/uploads/profile/
 */
async function saveOrgStructurePhotoFile(file: File): Promise<string> {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Format bagan tidak didukung. Gunakan file bertipe PNG, JPG, atau WebP.");
  }

  // Batas maksimal 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran berkas bagan struktur organisasi melebihi batas maksimal 5MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "profile");
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `org-structure-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return `/uploads/profile/${filename}`;
}

/**
 * Menghapus file foto pimpinan lama jika berada di direktori lokal
 */
async function deleteOldProfilePhoto(photoUrl?: string | null) {
  if (!photoUrl || !photoUrl.startsWith("/uploads/profile/")) {
    return;
  }
  try {
    const fullPath = path.join(process.cwd(), "public", photoUrl);
    await fs.unlink(fullPath);
  } catch {
    // Abaikan jika berkas tidak ditemukan di filesystem
  }
}

/**
 * Memperbarui data konten profil UPTD (Pimpinan, Sambutan, Visi, Misi, Tupoksi, Bagan Struktur) di PostgreSQL.
 * Memerlukan otentikasi sesi aktif dengan peran SUPER_ADMIN.
 */
export async function updateSiteProfileAction(
  formData: FormData
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
      error: "Hanya Super Admin yang berwenang mengubah profil instansi.",
    };
  }

  const headName = formData.get("headName")?.toString().trim();
  const headRole = formData.get("headRole")?.toString().trim() || "";
  const greeting = formData.get("greeting")?.toString().trim() || "";
  const vision = formData.get("vision")?.toString().trim() || "";
  const mission = formData.get("mission")?.toString().trim() || "";
  const tupoksi = formData.get("tupoksi")?.toString().trim() || "";
  const photoFile = formData.get("headPhoto") as File | null;
  const orgStructureFile = formData.get("orgStructurePhoto") as File | null;

  if (!headName || headName.length < 3) {
    return {
      success: false,
      error: "Nama Kepala UPTD minimal 3 karakter.",
    };
  }

  try {
    const currentSetting = await db.siteSetting.findUnique({
      where: { id: "default" },
    });

    let headPhoto = currentSetting?.headPhoto || null;
    let orgStructurePhoto = currentSetting?.orgStructurePhoto || null;

    if (photoFile && photoFile.size > 0 && photoFile.name && photoFile.name !== "undefined") {
      const newPhotoUrl = await saveProfilePhotoFile(photoFile);
      if (currentSetting?.headPhoto) {
        await deleteOldProfilePhoto(currentSetting.headPhoto);
      }
      headPhoto = newPhotoUrl;
    }

    if (
      orgStructureFile &&
      orgStructureFile.size > 0 &&
      orgStructureFile.name &&
      orgStructureFile.name !== "undefined"
    ) {
      const newOrgPhotoUrl = await saveOrgStructurePhotoFile(orgStructureFile);
      if (currentSetting?.orgStructurePhoto) {
        await deleteOldProfilePhoto(currentSetting.orgStructurePhoto);
      }
      orgStructurePhoto = newOrgPhotoUrl;
    }

    const updated = await db.siteSetting.upsert({
      where: { id: "default" },
      update: {
        headName,
        headRole,
        headPhoto,
        orgStructurePhoto,
        greeting,
        vision,
        mission,
        tupoksi,
      },
      create: {
        id: "default",
        name: siteConfig.name,
        shortName: siteConfig.shortName,
        tagline: siteConfig.tagline,
        motto: siteConfig.motto,
        address: siteConfig.address,
        operationalHours: siteConfig.operationalHours,
        phone: siteConfig.phone,
        whatsappLink: siteConfig.whatsappLink,
        email: siteConfig.email,
        googleMapsEmbedUrl: siteConfig.googleMapsEmbedUrl,
        sp4nLaporUrl: siteConfig.sp4nLaporUrl,
        headName,
        headRole,
        headPhoto,
        orgStructurePhoto,
        greeting,
        vision,
        mission,
        tupoksi,
      },
    });

    // Revalidasi cache halaman publik dan admin
    revalidatePath("/", "layout");
    revalidatePath("/profil");
    revalidatePath("/admin/pengaturan");

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data profil.";
    console.error("[Settings] Gagal menyimpan konten profil:", err);
    return {
      success: false,
      error: msg,
    };
  }
}
