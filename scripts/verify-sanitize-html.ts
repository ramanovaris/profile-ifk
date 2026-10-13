import { sanitizeHtml } from "../src/lib/sanitize";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log("Menjalankan pengujian fungsi sanitizeHtml...\n");

// 1. Menghapus script tag
{
  const input = `<p>Halo dunia</p><script>alert('xss')</script><p>Aman</p>`;
  const result = sanitizeHtml(input);
  assert(!result.includes("<script"), "Gagal menghapus tag <script>");
  assert(!result.includes("alert"), "Gagal menghapus konten script");
  assert(result.includes("<p>Halo dunia</p>"), "Tag aman hilang");
  assert(result.includes("<p>Aman</p>"), "Tag aman hilang");
  console.log("✔ Test 1: Tag <script> berhasil dibersihkan");
}

// 2. Menghapus iframe, object, embed
{
  const input = `<div><iframe src="https://evil.com"></iframe><embed src="test.swf"><object data="malware"></object></div>`;
  const result = sanitizeHtml(input);
  assert(!result.includes("<iframe"), "Gagal menghapus iframe");
  assert(!result.includes("<embed"), "Gagal menghapus embed");
  assert(!result.includes("<object"), "Gagal menghapus object");
  console.log("✔ Test 2: Tag <iframe>, <embed>, <object> berhasil dibersihkan");
}

// 3. Menghapus inline event handlers
{
  const input = `<img src="/img.jpg" onerror="alert(1)" onload="fetch('/leak')" onclick="alert(2)" />`;
  const result = sanitizeHtml(input);
  assert(!result.includes("onerror"), "Gagal menghapus onerror");
  assert(!result.includes("onload"), "Gagal menghapus onload");
  assert(!result.includes("onclick"), "Gagal menghapus onclick");
  console.log("✔ Test 3: Inline event handlers berhasil dibersihkan");
}

// 4. Menghapus skema javascript: URL
{
  const input = `<a href="javascript:alert(1)">Klik Disini</a><a href="JAVASCRIPT:evil()">Test</a>`;
  const result = sanitizeHtml(input);
  assert(!result.toLowerCase().includes("javascript:"), "Gagal membersihkan skema URL javascript:");
  console.log("✔ Test 4: URL javascript: berhasil dinetralkan");
}

// 5. Menjaga format rich-text aman
{
  const input = `<h2>Judul Artikel</h2><p>Paragraf <strong>tebal</strong> dan <em>miring</em>.</p><ul><li>Poin 1</li></ul><a href="https://kotabarukab.go.id">Tautan Resmi</a>`;
  const result = sanitizeHtml(input);
  assert(result.includes("<h2>Judul Artikel</h2>"), "Header h2 terhapus");
  assert(result.includes("<strong>tebal</strong>"), "Format strong terhapus");
  assert(result.includes("<em>miring</em>"), "Format em terhapus");
  assert(result.includes("<ul><li>Poin 1</li></ul>"), "Format list terhapus");
  assert(result.includes('href="https://kotabarukab.go.id"'), "Tautan sah terhapus");
  console.log("✔ Test 5: Format TipTap yang sah tetap terjaga utuh");
}

// 6. Menangani input kosong atau null-ish
{
  assert(sanitizeHtml("") === "", "String kosong harus mengembalikan string kosong");
  assert(sanitizeHtml(null as unknown as string) === "", "Null harus mengembalikan string kosong");
  assert(sanitizeHtml(undefined as unknown as string) === "", "Undefined harus mengembalikan string kosong");
  console.log("✔ Test 6: Penanganan nilai kosong aman");
}

console.log("\nSemua 6 pengujian sanitizeHtml BERHASIL (100% PASS)!");
