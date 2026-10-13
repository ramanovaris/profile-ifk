import * as assert from "node:assert";
import { resolveBaseUrl, resolveAbsoluteUrl } from "../src/lib/seo";

console.log("🧪 Memulai unit test resolusi URL SEO...");

// Skenario 1: Default tanpa modifikasi env
{
  const base = resolveBaseUrl("https://ramanovaris.my.id/profile-ifk", "/profile-ifk");
  assert.strictEqual(base, "https://ramanovaris.my.id/profile-ifk", "Gagal menyelaraskan default domain + basePath");

  const absHome = resolveAbsoluteUrl("/", base);
  assert.strictEqual(absHome, "https://ramanovaris.my.id/profile-ifk", "Gagal membuat URL root /");

  const absProfil = resolveAbsoluteUrl("/profil", base);
  assert.strictEqual(absProfil, "https://ramanovaris.my.id/profile-ifk/profil", "Gagal membuat URL /profil");

  const absNews = resolveAbsoluteUrl("berita/obat-langka", base);
  assert.strictEqual(absNews, "https://ramanovaris.my.id/profile-ifk/berita/obat-langka", "Gagal membuat URL berita tanpa leading slash");
}

// Skenario 2: Domain root tanpa basePath di envUrl, tapi ada basePath terpisah
{
  const base = resolveBaseUrl("https://example.com", "/profile-ifk");
  assert.strictEqual(base, "https://example.com/profile-ifk", "Gagal menggabungkan domain dan basePath");

  const absStok = resolveAbsoluteUrl("/stok", base);
  assert.strictEqual(absStok, "https://example.com/profile-ifk/stok", "Gagal membuat URL /stok");
}

// Skenario 3: Lingkungan localhost murni tanpa basePath
{
  const base = resolveBaseUrl("http://localhost:3000", "");
  assert.strictEqual(base, "http://localhost:3000", "Gagal menangani localhost tanpa basePath");

  const absLayanan = resolveAbsoluteUrl("/layanan", base);
  assert.strictEqual(absLayanan, "http://localhost:3000/layanan", "Gagal membuat URL /layanan di localhost");
}

// Skenario 4: Toleransi trailing slash berlebih
{
  const base = resolveBaseUrl("https://ramanovaris.my.id/profile-ifk///", "/profile-ifk/");
  assert.strictEqual(base, "https://ramanovaris.my.id/profile-ifk", "Gagal memangkas trailing slash berlebih");
}

console.log("✅ Seluruh unit test resolusi URL SEO 100% PASS!");
