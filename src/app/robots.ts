import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim().replace(/\/+$/, "");

  // Jika aplikasi berjalan di bawah subfolder basePath (misal /profile-ifk),
  // sertakan varian path murni dan dengan prefix basePath agar kompatibel dengan seluruh crawler
  const disallowPaths = ["/admin/", "/api/"];
  if (basePath && basePath !== "/") {
    const cleanPrefix = basePath.startsWith("/") ? basePath : `/${basePath}`;
    disallowPaths.push(`${cleanPrefix}/admin/`, `${cleanPrefix}/api/`);
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowPaths,
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
  };
}
