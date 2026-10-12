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

  const code = fs.readFileSync(stockTablePath, "utf-8");

  // 1. Kondisional tabel vs empty state
  assert(
    code.includes("filtered.length > 0 ? (") && code.includes(" : ("),
    "Tabel hanya dirender ketika filtered.length > 0 (tidak ada header tabel gantung di HP saat kosong)"
  );

  // 2. Kontainer empty state semantik
  assert(
    code.includes("border-[var(--admin-border)]") &&
    code.includes("bg-[var(--admin-card-bg)]") &&
    code.includes("text-[var(--admin-text-main)]") &&
    code.includes("text-[var(--admin-muted)]"),
    "Empty state menggunakan variabel CSS semantik tema admin"
  );

  // 3. Tombol aksi
  assert(
    code.includes("handleResetFilters") && code.includes("Reset Filter & Pencarian"),
    "Terdapat aksi Reset Filter & Pencarian saat data tersaring kosong"
  );

  assert(
    code.includes("Tambah Obat Baru"),
    "Terdapat tombol Tambah Obat Baru saat periode lembar kosong"
  );

  console.log("Semua pengujian Batch 1 berhasil! 🎉");
}

verifyAdminEmptyState();
