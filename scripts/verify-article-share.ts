import * as assert from "node:assert";

async function verifyArticleShare() {
  console.log("🔍 Memulai verifikasi fitur ArticleShareBar...");

  const targetUrl = "http://localhost:3003/profile-ifk/berita/pengumuman-jadwal-pelayanan-libur-nasional/";
  console.log(`Mengambil halaman berita dari: ${targetUrl}`);

  const res = await fetch(targetUrl);
  assert.strictEqual(res.status, 200, `Ekspektasi HTTP 200, didapat ${res.status}`);

  const html = await res.text();

  // 1. Verifikasi elemen varian compact
  assert.ok(html.includes("Bagikan:"), "Label 'Bagikan:' pada varian compact harus ada");
  assert.ok(html.includes("Bagikan ke WhatsApp"), "Tombol 'Bagikan ke WhatsApp' harus ada");
  assert.ok(html.includes("Bagikan ke Telegram"), "Tombol 'Bagikan ke Telegram' harus ada");
  assert.ok(html.includes("Bagikan ke Facebook"), "Tombol 'Bagikan ke Facebook' harus ada");
  assert.ok(html.includes("Bagikan ke X"), "Tombol 'Bagikan ke X' harus ada");
  assert.ok(html.includes("Salin Tautan") || html.includes("Salin"), "Tombol 'Salin' harus ada");

  // 2. Verifikasi elemen varian card
  assert.ok(html.includes("Bagikan Informasi Ini"), "Judul 'Bagikan Informasi Ini' pada varian card harus ada");

  // 3. Verifikasi tautan media sosial
  assert.ok(html.includes("https://api.whatsapp.com/send?text="), "Skema URL WhatsApp harus valid");
  assert.ok(html.includes("https://t.me/share/url?url="), "Skema URL Telegram harus valid");
  assert.ok(html.includes("https://www.facebook.com/sharer/sharer.php?u="), "Skema URL Facebook harus valid");
  assert.ok(html.includes("https://twitter.com/intent/tweet?url="), "Skema URL X/Twitter harus valid");

  console.log("✅ Seluruh verifikasi ArticleShareBar (compact & card) BERHASIL!");
}

verifyArticleShare().catch((err) => {
  console.error("❌ Verifikasi gagal:", err);
  process.exit(1);
});
