import * as assert from "node:assert";

async function verifyEndpoint(url: string, expectedContentType: string, checks: Array<(body: string) => void>) {
  console.log(`📡 Memeriksa endpoint: ${url}`);
  const res = await fetch(url);
  assert.strictEqual(res.status, 200, `Status HTTP harus 200, diperoleh: ${res.status}`);

  const contentType = res.headers.get("content-type") || "";
  assert.ok(
    contentType.includes(expectedContentType),
    `Content-Type harus mengandung ${expectedContentType}, diperoleh: ${contentType}`
  );

  const text = await res.text();
  assert.ok(text.length > 50, `Panjang respon terlalu pendek: ${text.length} karakter`);

  for (const check of checks) {
    check(text);
  }
}

async function run() {
  const devOrigin = process.env.DEV_ORIGIN || "http://localhost:3003/profile-ifk";

  console.log("🧪 Memulai verifikasi HTTP sitemap.xml dan robots.txt...");

  // 1. Uji sitemap.xml
  await verifyEndpoint(`${devOrigin}/sitemap.xml`, "xml", [
    (body) => assert.ok(body.includes("<urlset"), "Sitemap harus memiliki tag <urlset"),
    (body) => assert.ok(body.includes("/profil</loc>"), "Sitemap harus memuat rute /profil"),
    (body) => assert.ok(body.includes("/layanan</loc>"), "Sitemap harus memuat rute /layanan"),
    (body) => assert.ok(body.includes("/stok</loc>"), "Sitemap harus memuat rute /stok"),
    (body) => assert.ok(body.includes("/berita</loc>"), "Sitemap harus memuat rute /berita"),
    (body) => assert.ok(body.includes("/kontak</loc>"), "Sitemap harus memuat rute /kontak"),
    (body) => assert.ok(body.includes("<priority>1"), "Sitemap harus memuat prioritas root 1.0"),
    (body) => assert.ok(body.includes("<lastmod>"), "Sitemap harus memuat tag <lastmod>"),
  ]);
  console.log("✅ Endpoint sitemap.xml terverifikasi valid dan lengkap.");

  // 2. Uji robots.txt
  await verifyEndpoint(`${devOrigin}/robots.txt`, "text", [
    (body) => assert.ok(body.includes("User-Agent: *") || body.includes("user-agent: *") || body.includes("User-agent: *"), "Robots.txt harus memuat User-agent: *"),
    (body) => assert.ok(body.includes("Allow: /") || body.includes("allow: /"), "Robots.txt harus mengizinkan Allow: /"),
    (body) => assert.ok(body.includes("Disallow: /admin/") || body.includes("disallow: /admin/"), "Robots.txt harus memblokir /admin/"),
    (body) => assert.ok(body.includes("Disallow: /api/") || body.includes("disallow: /api/"), "Robots.txt harus memblokir /api/"),
    (body) => assert.ok(body.includes("Sitemap: https://") || body.includes("sitemap: https://"), "Robots.txt harus menyertakan deklarasi Sitemap"),
  ]);
  console.log("✅ Endpoint robots.txt terverifikasi valid dan aman.");

  console.log("🎉 SELURUH VERIFIKASI SITEMAP & ROBOTS.TXT BERHASIL 100%!");
}

run().catch((err) => {
  console.error("❌ Verifikasi gagal:", err);
  process.exit(1);
});
