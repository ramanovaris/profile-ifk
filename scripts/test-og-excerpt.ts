import * as assert from "node:assert";
import { stripHtmlAndTruncate } from "../src/lib/string";

console.log("🧪 Running unit tests for stripHtmlAndTruncate...");

// 1. Teks polos di bawah batas maksimum
{
  const input = "Informasi ketersediaan obat dan perbekalan farmasi.";
  const result = stripHtmlAndTruncate(input, 160);
  assert.strictEqual(result, input, "Teks polos di bawah batas harus utuh");
}

// 2. Membersihkan tag HTML (p, strong, a, br, span, dll)
{
  const input = "<p>UPTD <strong>Instalasi Farmasi</strong> Kab. Kotabaru mengadakan <a href='#'>sosialisasi</a>.</p>";
  const result = stripHtmlAndTruncate(input, 160);
  assert.strictEqual(result, "UPTD Instalasi Farmasi Kab. Kotabaru mengadakan sosialisasi.");
}

// 3. Membersihkan spasi ganda, newline berlebih, dan entitas HTML
{
  const input = "<p>Paragraf satu &amp; dua.&nbsp;&nbsp;</p>\n\n<p>Paragraf   tiga.</p>";
  const result = stripHtmlAndTruncate(input, 160);
  assert.strictEqual(result, "Paragraf satu & dua. Paragraf tiga.");
}

// 4. Memotong tepat di batas maksimal dengan elipsis (...) tanpa memotong kata di tengah jika memungkinkan
{
  const longText = "UPTD Instalasi Farmasi Kabupaten Kotabaru merupakan unit pelaksana teknis dinas yang bertanggung jawab langsung kepada Kepala Dinas Kesehatan Kabupaten Kotabaru dalam pengelolaan perbekalan farmasi dan alat kesehatan secara terpadu.";
  const result = stripHtmlAndTruncate(longText, 80);
  assert.ok(result.length <= 83, "Panjang hasil tidak boleh melebihi batas (termasuk ...)");
  assert.ok(result.endsWith("..."), "Teks panjang harus diakhiri ...");
}

// 5. Menangani input kosong atau null/undefined
{
  assert.strictEqual(stripHtmlAndTruncate(""), "");
  assert.strictEqual(stripHtmlAndTruncate("   "), "");
  assert.strictEqual(stripHtmlAndTruncate(null as unknown as string), "");
  assert.strictEqual(stripHtmlAndTruncate(undefined as unknown as string), "");
}

console.log("✅ All stripHtmlAndTruncate unit tests passed successfully!");
