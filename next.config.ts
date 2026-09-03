import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  trailingSlash: !!basePath,
  output: "standalone",
  turbopack: undefined,
  allowedDevOrigins: ["43.129.57.214", "localhost", "127.0.0.1"],
  images: {
    unoptimized: !!basePath,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
