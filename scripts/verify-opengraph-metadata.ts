/**
 * Skrip verifikasi otomatis OpenGraph & Twitter Card Metadata
 * Menjalankan pemeriksaan HTTP GET ke 7 halaman publik dan memvalidasi
 * keberadaan tag <meta property="og:*">, <meta name="twitter:*">, dan <link rel="canonical">.
 */

export {};

const BASE_URL = process.env.BASE_URL || "http://localhost:3003/profile-ifk";

interface OgPageCheck {
  path: string;
  name: string;
  expectedOgTitleContains: string;
  expectedOgImageContains: string;
  isArticle?: boolean;
}

const PAGES_TO_TEST: OgPageCheck[] = [
  {
    path: "/",
    name: "Beranda",
    expectedOgTitleContains: "Beranda",
    expectedOgImageContains: "kantor-ifk.jpg",
  },
  {
    path: "/profil/",
    name: "Profil & Struktur Organisasi",
    expectedOgTitleContains: "Profil",
    expectedOgImageContains: "profil-ifk.jpg",
  },
  {
    path: "/layanan/",
    name: "Standar Layanan & Distribusi",
    expectedOgTitleContains: "Standar Pelayanan",
    expectedOgImageContains: "cold-room-ifk.jpg",
  },
  {
    path: "/stok/",
    name: "Ketersediaan Stok",
    expectedOgTitleContains: "Ketersediaan Stok",
    expectedOgImageContains: "stok-obat-ifk.jpg",
  },
  {
    path: "/berita/",
    name: "Indeks Berita",
    expectedOgTitleContains: "Berita",
    expectedOgImageContains: "berita-ifk.jpg",
  },
  {
    path: "/berita/sosialisasi-sistem-informasi-kefarmasian/",
    name: "Detail Berita (Sosialisasi SI)",
    expectedOgTitleContains: "Sosialisasi Penggunaan Sistem Informasi",
    expectedOgImageContains: "picsum.photos/seed/kegiatan-1",
    isArticle: true,
  },
  {
    path: "/kontak/",
    name: "Kontak & Layanan Pengaduan",
    expectedOgTitleContains: "Kontak",
    expectedOgImageContains: "kontak-ifk.jpg",
  },
];

async function verifyPage(page: OgPageCheck): Promise<boolean> {
  const url = `${BASE_URL}${page.path}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; VerifyBot/1.0)" } });
    if (res.status !== 200) {
      console.error(`❌ [${page.name}] HTTP status not 200: got ${res.status} at ${url}`);
      return false;
    }

    const html = await res.text();

    // 1. Periksa og:title
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
    if (!ogTitleMatch || !ogTitleMatch[1].includes(page.expectedOgTitleContains)) {
      console.error(`❌ [${page.name}] og:title mismatch or missing. Found: ${ogTitleMatch ? ogTitleMatch[1] : "NONE"}, Expected contains: ${page.expectedOgTitleContains}`);
      return false;
    }

    // 2. Periksa og:description
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i);
    if (!ogDescMatch || ogDescMatch[1].trim().length === 0) {
      console.error(`❌ [${page.name}] og:description is missing or empty.`);
      return false;
    }

    // 3. Periksa og:image
    const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                       html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (!ogImgMatch || !ogImgMatch[1].includes(page.expectedOgImageContains)) {
      console.error(`❌ [${page.name}] og:image mismatch or missing. Found: ${ogImgMatch ? ogImgMatch[1] : "NONE"}, Expected contains: ${page.expectedOgImageContains}`);
      return false;
    }

    // 4. Periksa twitter:card
    const twCardMatch = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:card["']/i);
    if (!twCardMatch || twCardMatch[1] !== "summary_large_image") {
      console.error(`❌ [${page.name}] twitter:card is not summary_large_image. Found: ${twCardMatch ? twCardMatch[1] : "NONE"}`);
      return false;
    }

    // 5. Periksa canonical link
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
                           html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
    if (!canonicalMatch) {
      console.error(`❌ [${page.name}] canonical link is missing.`);
      return false;
    }

    // 6. Jika artikel warta, pastikan article:published_time dan og:type="article"
    if (page.isArticle) {
      const ogTypeMatch = html.match(/<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i) ||
                          html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:type["']/i);
      if (!ogTypeMatch || ogTypeMatch[1] !== "article") {
        console.error(`❌ [${page.name}] og:type is not 'article'. Found: ${ogTypeMatch ? ogTypeMatch[1] : "NONE"}`);
        return false;
      }

      const pubTimeMatch = html.match(/<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']article:published_time["']/i);
      if (!pubTimeMatch) {
        console.error(`❌ [${page.name}] article:published_time is missing.`);
        return false;
      }
    }

    console.log(`✅ [${page.name}] status 200, og:title="${ogTitleMatch[1]}", og:image="${ogImgMatch[1]}", canonical="${canonicalMatch[1]}"`);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [${page.name}] Request error: ${msg}`);
    return false;
  }
}

async function main() {
  console.log(`🧪 Verifikasi Metadata OpenGraph & Pratinjau Sosial Media (${BASE_URL})\n`);
  let allPassed = true;

  for (const page of PAGES_TO_TEST) {
    const passed = await verifyPage(page);
    if (!passed) allPassed = false;
  }

  if (allPassed) {
    console.log("\n🎉 Seluruh 7 rute publik berhasil diverifikasi dengan metadata OpenGraph & Twitter Card yang lengkap!");
    process.exit(0);
  } else {
    console.error("\n💥 Ada pemeriksaan halaman yang gagal!");
    process.exit(1);
  }
}

main();
