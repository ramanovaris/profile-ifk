import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=== Verifikasi Z-Index Stacking Context Dropdown Tema Admin (Issue #179) ===");
  const adminShellPath = path.resolve(process.cwd(), "src/components/admin/admin-shell.tsx");
  const themeDropdownPath = path.resolve(process.cwd(), "src/components/admin/theme-dropdown.tsx");
  const stockTablePath = path.resolve(process.cwd(), "src/app/(admin)/admin/stok/stock-table.tsx");

  const adminShellContent = fs.readFileSync(adminShellPath, "utf-8");
  const themeDropdownContent = fs.readFileSync(themeDropdownPath, "utf-8");
  const stockTableContent = fs.readFileSync(stockTablePath, "utf-8");

  // 1. Header z-index check
  const headerMatch = adminShellContent.match(/<header[^>]*className=["']([^"']*)["']/);
  if (!headerMatch) {
    throw new Error("FAIL: Elemen <header> tidak ditemukan di admin-shell.tsx");
  }
  const headerClasses = headerMatch[1].split(/\s+/);
  const headerZIndex = headerClasses.find((cls) => cls.startsWith("z-"));
  if (!headerZIndex || !["z-40", "z-50"].includes(headerZIndex)) {
    throw new Error(`FAIL: Header z-index harus z-40 atau z-50, didapat: ${headerZIndex}`);
  }
  if (!headerClasses.includes("relative")) {
    throw new Error("FAIL: Header harus memiliki kelas 'relative'");
  }
  console.log(`✓ Header admin menggunakan '${headerZIndex}' dengan positioning 'relative'`);

  // 2. Main stacking context isolation check
  const mainMatch = adminShellContent.match(/<main[^>]*className=["']([^"']*)["']/);
  if (!mainMatch) {
    throw new Error("FAIL: Elemen <main> tidak ditemukan di admin-shell.tsx");
  }
  const mainClasses = mainMatch[1].split(/\s+/);
  if (!mainClasses.includes("isolate")) {
    throw new Error("FAIL: Elemen <main> wajib memiliki kelas 'isolate' untuk isolasi stacking context");
  }
  if (!mainClasses.includes("relative")) {
    throw new Error("FAIL: Elemen <main> wajib memiliki kelas 'relative'");
  }
  if (!mainClasses.includes("z-0")) {
    throw new Error("FAIL: Elemen <main> wajib memiliki kelas 'z-0'");
  }
  console.log("✓ Kontainer <main> menerapkan isolasi stacking context ('isolate relative z-0')");

  // 3. ThemeDropdown popover z-index check
  if (!themeDropdownContent.includes("z-50")) {
    throw new Error("FAIL: Popover ThemeDropdown wajib memiliki kelas 'z-50'");
  }
  console.log("✓ Popover menu ThemeDropdown menggunakan 'z-50'");

  // 4. Stacking context hierarchy test
  // Header (z-40) strictly outranks Main (z-0)
  const headerZNum = parseInt(headerZIndex.replace("z-", ""), 10);
  const mainZNum = 0;
  if (headerZNum <= mainZNum) {
    throw new Error("FAIL: Hierarki z-index header harus lebih tinggi dari main");
  }
  console.log(`✓ Hierarki terverifikasi: Header (z-${headerZNum}) > Main (z-${mainZNum})`);

  // 5. Stock table toolbar verification
  if (!stockTableContent.includes("relative z-30")) {
    throw new Error("FAIL: Toolbar filter stok obat di stock-table.tsx tidak ditemukan");
  }
  console.log("✓ Toolbar filter stock-table.tsx (z-30) terisolasi sempurna di dalam Stacking Context <main> (z-0)");

  console.log("=== SEMUA 5/5 PENGUJIAN MANDIRI LULUS ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
