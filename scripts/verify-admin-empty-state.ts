import * as fs from "fs";
import * as path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ LULUS: ${message}`);
}

async function verifyAdminEmptyState() {
  console.log("=== Verifikasi Visual Empty State Panel Admin (Batch 1: Modul Stok) ===");
  const stockTablePath = path.resolve(__dirname, "../src/app/(admin)/admin/stok/stock-table.tsx");
  assert(fs.existsSync(stockTablePath), "Berkas stock-table.tsx harus ada");

  const stockCode = fs.readFileSync(stockTablePath, "utf-8");

  // 1. Kondisional tabel vs empty state
  assert(
    stockCode.includes("filtered.length > 0 ? (") && stockCode.includes(" : ("),
    "Tabel hanya dirender ketika filtered.length > 0 (tidak ada header tabel gantung di HP saat kosong)"
  );

  // 2. Kontainer empty state semantik
  assert(
    stockCode.includes("border-[var(--admin-border)]") &&
    stockCode.includes("bg-[var(--admin-card-bg)]") &&
    stockCode.includes("text-[var(--admin-text-main)]") &&
    stockCode.includes("text-[var(--admin-muted)]"),
    "Empty state stok menggunakan variabel CSS semantik tema admin"
  );

  // 3. Tombol aksi
  assert(
    stockCode.includes("handleResetFilters") && stockCode.includes("Reset Filter & Pencarian"),
    "Terdapat aksi Reset Filter & Pencarian saat data tersaring kosong"
  );

  assert(
    stockCode.includes("Tambah Obat Baru"),
    "Terdapat tombol Tambah Obat Baru saat periode lembar kosong"
  );

  console.log("\n=== Verifikasi Visual Empty State Panel Admin (Batch 2: Kategori & Berita) ===");
  const categoryTablePath = path.resolve(__dirname, "../src/app/(admin)/admin/kategori/category-table.tsx");
  assert(fs.existsSync(categoryTablePath), "Berkas category-table.tsx harus ada");
  const catCode = fs.readFileSync(categoryTablePath, "utf-8");

  assert(
    catCode.includes("rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] text-[var(--admin-muted)]"),
    "category-table.tsx memiliki kontainer ikon empty state semantik rounded-2xl"
  );
  assert(
    catCode.includes("text-[var(--admin-text-main)]") && catCode.includes("text-[var(--admin-muted)]"),
    "category-table.tsx memiliki teks judul dan deskripsi semantik"
  );

  const articleTablePath = path.resolve(__dirname, "../src/app/(admin)/admin/berita/article-table.tsx");
  assert(fs.existsSync(articleTablePath), "Berkas article-table.tsx harus ada");
  const artCode = fs.readFileSync(articleTablePath, "utf-8");

  assert(
    artCode.includes("rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] text-[var(--admin-muted)]"),
    "article-table.tsx memiliki kontainer ikon empty state semantik rounded-2xl"
  );
  assert(
    artCode.includes("text-[var(--admin-text-main)]") && artCode.includes("text-[var(--admin-muted)]"),
    "article-table.tsx memiliki teks judul dan deskripsi semantik"
  );

  const catFilterPath = path.resolve(__dirname, "../src/components/admin/category-multi-select-filter.tsx");
  assert(fs.existsSync(catFilterPath), "Berkas category-multi-select-filter.tsx harus ada");
  const filterCode = fs.readFileSync(catFilterPath, "utf-8");

  assert(
    filterCode.includes("text-[var(--admin-muted)]") && !filterCode.includes("text-zinc-500"),
    "category-multi-select-filter.tsx menggunakan text-[var(--admin-muted)] tanpa text-zinc-500 hardcoded"
  );

  console.log("\nSemua pengujian Batch 1 & 2 berhasil! 🎉");
}

verifyAdminEmptyState();
