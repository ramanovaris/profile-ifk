import type { MetadataRoute } from "next";
import { db } from "../lib/db";
import { getAbsoluteUrl } from "../lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Rute publik inti UPTD Instalasi Farmasi Kab. Kotabaru
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: getAbsoluteUrl("/profil"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/layanan"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/stok"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/berita"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/kontak"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 2. Seluruh artikel warta yang berstatus terbit (isPublished: true)
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await db.article.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    articleRoutes = articles.map((article) => ({
      url: getAbsoluteUrl(`/berita/${article.slug}`),
      lastModified: article.updatedAt || article.publishedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Gagal mengambil daftar artikel untuk sitemap:", error);
    // Safe fallback: menyajikan rute publik inti jika database tidak dapat diakses
  }

  return [...staticRoutes, ...articleRoutes];
}
