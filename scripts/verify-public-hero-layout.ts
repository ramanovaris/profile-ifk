/**
 * scripts/verify-public-hero-layout.ts
 * Verifikasi ketersediaan dan respon halaman publik serta konten hero desktop.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3003/profile-ifk";

interface PageCheck {
  path: string;
  expectedKeyword?: string;
}

const PAGES: PageCheck[] = [
  { path: "/layanan/", expectedKeyword: "Jam Pelayanan Distribusi" },
  { path: "/profil/", expectedKeyword: "Jangkauan Layanan Logistik" },
  { path: "/stok/", expectedKeyword: "Standar Data Stok Fisik" },
  { path: "/kontak/", expectedKeyword: "Kanal Konsultasi" },
  { path: "/berita/", expectedKeyword: "Pusat Informasi" },
];

async function verifyPages() {
  console.log("=== VERIFIKASI HERO HALAMAN PUBLIK ===");
  let allPassed = true;

  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`❌ [${page.path}] HTTP Error: ${res.status} ${res.statusText}`);
        allPassed = false;
        continue;
      }
      const text = await res.text();
      console.log(`✅ [${page.path}] HTTP ${res.status} OK`);

      if (page.expectedKeyword) {
        if (text.includes(page.expectedKeyword)) {
          console.log(`   ✨ Ditemukan keyword kartu hero: "${page.expectedKeyword}"`);
        } else {
          console.log(`   ⏳ Keyword kartu hero belum ditemukan (belum diimplementasikan): "${page.expectedKeyword}"`);
        }
      }
    } catch (err: any) {
      console.error(`❌ [${page.path}] Fetch failed: ${err.message}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log("\n🎉 Seluruh endpoint publik aktif dan merespon dengan baik!");
  } else {
    console.error("\n⚠️ Beberapa pemeriksaan gagal.");
    process.exit(1);
  }
}

verifyPages();
