import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper pembuat slug URL ramah SEO dan aman.
 */
export function slugify(text: string): string {
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "kategori-" + Date.now();
}

/**
 * Helper untuk memastikan URL aset statis (seperti coverImage atau gambar di /uploads/ dan /images/)
 * selalu menyertakan basePath jika aplikasi berjalan di bawah sub-path.
 */
export function getAssetUrl(src: string | null | undefined): string {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  return `${basePath}${cleanPath}`;
}
