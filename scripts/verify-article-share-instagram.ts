import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";

async function verifyInstagramShare() {
  console.log("🔍 Memulai verifikasi opsi berbagi artikel ke Instagram (#175)...");

  // 1. Audit static source code di src/components/public/article-share-bar.tsx
  const componentPath = path.join(process.cwd(), "src/components/public/article-share-bar.tsx");
  const fileContent = fs.readFileSync(componentPath, "utf-8");

  assert.ok(fileContent.includes("function InstagramIcon"), "Komponen InstagramIcon harus didefinisikan");
  assert.ok(fileContent.includes("handleInstagramShare"), "Handler handleInstagramShare harus ada");
  assert.ok(fileContent.includes("instagramCopied"), "State instagramCopied harus ada");
  assert.ok(fileContent.includes("https://www.instagram.com/"), "Tautan tujuan Instagram harus valid");
  assert.ok(fileContent.includes("Tautan tersalin, membuka Instagram..."), "Indikator umpan balik teks harus ada");
  assert.ok(fileContent.includes("copyTextToClipboard"), "Fungsi utilitas penyalin clipboard terpadu harus ada");
  console.log("✅ 1. Audit kode sumber komponen: VALID");

  // 2. Verifikasi live render Server Component pada dev server
  const targetUrl = "http://localhost:3003/profile-ifk/berita/pengumuman-jadwal-pelayanan-libur-nasional/";
  console.log(`Mengambil HTML dari: ${targetUrl}`);
  const res = await fetch(targetUrl);
  assert.strictEqual(res.status, 200, `Ekspektasi HTTP 200, didapat ${res.status}`);
  const html = await res.text();

  // Verifikasi varian compact
  assert.ok(
    html.includes('aria-label="Bagikan ke Instagram"'),
    "Aria-label 'Bagikan ke Instagram' harus ada pada render HTML"
  );
  assert.ok(
    html.includes('title="Bagikan ke Instagram"'),
    "Atribut title 'Bagikan ke Instagram' harus ada pada render HTML"
  );

  // Verifikasi varian card
  assert.ok(
    html.includes(">Instagram<"),
    "Label teks tombol chip 'Instagram' pada varian card harus ada"
  );

  console.log("✅ 2. Render live HTML halaman berita: VALID");

  // 3. Verifikasi sinkronisasi buku panduan
  const docPath = path.join(process.cwd(), "docs/PANDUAN_PENGGUNAAN.md");
  const docContent = fs.readFileSync(docPath, "utf-8");
  assert.ok(
    docContent.includes("- **Instagram:**"),
    "Dokumentasi berbagi Instagram harus tercatat di PANDUAN_PENGGUNAAN.md"
  );
  console.log("✅ 3. Dokumentasi buku panduan: VALID");

  console.log("\n🎉 Seluruh 3 tahap verifikasi Instagram Share (#175) LULUS 100%!");
}

verifyInstagramShare().catch((err) => {
  console.error("❌ Verifikasi gagal:", err);
  process.exit(1);
});
