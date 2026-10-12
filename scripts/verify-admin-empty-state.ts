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
  console.log("=== [1] Verifikasi Modul Stok Obat (stock-table.tsx) ===");
  const stockTablePath = path.resolve(__dirname, "../src/app/(admin)/admin/stok/stock-table.tsx");
  assert(fs.existsSync(stockTablePath), "Berkas stock-table.tsx harus ada");
  const stockCode = fs.readFileSync(stockTablePath, "utf-8");

  assert(
    stockCode.includes("filtered.length > 0 ? (") && stockCode.includes(" : ("),
    "Tabel stok disembunyikan saat kosong (tanpa header gantung di HP)"
  );
  assert(
    stockCode.includes("handleResetFilters") && stockCode.includes("Reset Filter & Pencarian"),
    "Terdapat aksi Reset Filter & Pencarian"
  );
  assert(
    stockCode.includes("Tambah Obat Baru"),
    "Terdapat tombol Tambah Obat Baru"
  );

  console.log("\n=== [2] Verifikasi Modul Kategori (category-table.tsx) ===");
  const categoryTablePath = path.resolve(__dirname, "../src/app/(admin)/admin/kategori/category-table.tsx");
  assert(fs.existsSync(categoryTablePath), "Berkas category-table.tsx harus ada");
  const catCode = fs.readFileSync(categoryTablePath, "utf-8");

  assert(
    catCode.includes("filteredCategories.length > 0 ? (") && catCode.includes(" : ("),
    "Tabel kategori disembunyikan saat kosong (tanpa header gantung di HP)"
  );
  assert(
    catCode.includes("Reset Pencarian"),
    "Terdapat tombol Reset Pencarian di kategori"
  );
  assert(
    catCode.includes("Tambah Kategori Baru"),
    "Terdapat tombol Tambah Kategori Baru"
  );

  console.log("\n=== [3] Verifikasi Modul Berita (article-table.tsx) ===");
  const articleTablePath = path.resolve(__dirname, "../src/app/(admin)/admin/berita/article-table.tsx");
  assert(fs.existsSync(articleTablePath), "Berkas article-table.tsx harus ada");
  const artCode = fs.readFileSync(articleTablePath, "utf-8");

  assert(
    artCode.includes("filteredArticles.length > 0 ? (") && artCode.includes(" : ("),
    "Tabel berita disembunyikan saat kosong (tanpa header gantung di HP)"
  );
  assert(
    artCode.includes("handleResetFilters") && artCode.includes("Reset Filter & Pencarian"),
    "Terdapat aksi Reset Filter & Pencarian di berita"
  );
  assert(
    artCode.includes("Tulis Berita Baru"),
    "Terdapat tombol Tulis Berita Baru"
  );

  console.log("\n=== [4] Verifikasi Modul Pengguna (user-table.tsx) ===");
  const userTablePath = path.resolve(__dirname, "../src/app/(admin)/admin/pengguna/user-table.tsx");
  assert(fs.existsSync(userTablePath), "Berkas user-table.tsx harus ada");
  const userCode = fs.readFileSync(userTablePath, "utf-8");

  assert(
    userCode.includes("filteredUsers.length > 0 ? (") && userCode.includes(" : ("),
    "Tabel pengguna disembunyikan saat kosong (tanpa header gantung di HP)"
  );
  assert(
    userCode.includes("handleResetFilters") && userCode.includes("Reset Filter & Pencarian"),
    "Terdapat aksi Reset Filter & Pencarian di pengguna"
  );
  assert(
    userCode.includes("Tambah Pengguna Baru"),
    "Terdapat tombol Tambah Pengguna Baru"
  );

  console.log("\n=== [5] Verifikasi Filter Kategori (category-multi-select-filter.tsx) ===");
  const catFilterPath = path.resolve(__dirname, "../src/components/admin/category-multi-select-filter.tsx");
  assert(fs.existsSync(catFilterPath), "Berkas category-multi-select-filter.tsx harus ada");
  const filterCode = fs.readFileSync(catFilterPath, "utf-8");

  assert(
    filterCode.includes("text-[var(--admin-muted)]") && !filterCode.includes("text-zinc-500"),
    "Filter kategori menggunakan text-[var(--admin-muted)]"
  );

  console.log("\nSemua 5 modul pengujian empty state lulus 100%! 🎉");
}

verifyAdminEmptyState();
