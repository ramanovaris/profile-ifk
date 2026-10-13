/**
 * Resolusi basis URL situs dengan mempertimbangkan NEXT_PUBLIC_SITE_URL dan NEXT_PUBLIC_BASE_PATH
 */
export function resolveBaseUrl(
  siteUrlEnv?: string | null,
  basePathEnv?: string | null
): string {
  const fallback = "https://ramanovaris.my.id/profile-ifk";
  const rawUrl = (siteUrlEnv || fallback).trim().replace(/\/+$/, "");
  const basePath = (basePathEnv || "").trim().replace(/\/+$/, "");

  if (!basePath) {
    return rawUrl;
  }

  const cleanBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;

  // Jika rawUrl belum berakhiran basePath, gabungkan
  if (!rawUrl.endsWith(cleanBasePath)) {
    return `${rawUrl}${cleanBasePath}`;
  }

  return rawUrl;
}

/**
 * Mengambil base URL aktif dari environment sistem
 */
export function getBaseUrl(): string {
  return resolveBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_BASE_PATH
  );
}

/**
 * Menghasilkan URL absolut lengkap untuk rute tertentu
 */
export function resolveAbsoluteUrl(routePath: string, baseUrl?: string): string {
  const base = (baseUrl || getBaseUrl()).replace(/\/+$/, "");
  const cleanPath = routePath.trim();

  if (cleanPath === "/" || cleanPath === "") {
    return base;
  }

  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${base}${normalizedPath}`;
}

/**
 * Helper pembentuk URL absolut untuk rute publik aplikasi
 */
export function getAbsoluteUrl(routePath: string): string {
  return resolveAbsoluteUrl(routePath);
}
