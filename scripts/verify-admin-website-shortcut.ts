import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=== Verifikasi Tombol Pintasan Navigasi Website Publik (Issue #177) ===");
  const adminShellPath = path.resolve(process.cwd(), "src/components/admin/admin-shell.tsx");
  const content = fs.readFileSync(adminShellPath, "utf-8");

  // 1. Icon imports
  const hasGlobeImport = content.includes("Globe");
  const hasExternalLinkImport = content.includes("ExternalLink");
  if (!hasGlobeImport || !hasExternalLinkImport) {
    throw new Error("FAIL: Globe / ExternalLink belum diimpor dari lucide-react");
  }
  console.log("✓ Icon Globe dan ExternalLink terimpor dari lucide-react");

  // 2. Topbar link check
  const hasTopbarLink =
    content.includes('href="/"') &&
    content.includes('target="_blank"') &&
    content.includes('rel="noopener noreferrer"');
  if (!hasTopbarLink) {
    throw new Error("FAIL: Tautan href='/' target='_blank' rel='noopener noreferrer' tidak ditemukan");
  }
  console.log("✓ Tautan pintasan ke portal publik ('/') dengan target='_blank' dan rel='noopener noreferrer' ditemukan");

  // 3. Header button check
  const headerSectionMatch = content.match(/{\/\* Right Header Admin Info \*\/}[\s\S]*?<ThemeDropdown/);
  if (!headerSectionMatch || !headerSectionMatch[0].includes("Lihat Website")) {
    throw new Error("FAIL: Tombol pintasan 'Lihat Website' tidak ditemukan di header dekat ThemeDropdown");
  }
  console.log("✓ Tombol 'Lihat Website' ditemukan di header topbar di samping ThemeDropdown");

  // 4. Sidebar navigation check
  const sidebarSectionMatch = content.match(/{\/\* Bottom section \*\/}[\s\S]*?Keluar Sesi/);
  if (!sidebarSectionMatch || !sidebarSectionMatch[0].includes("Lihat Website")) {
    throw new Error("FAIL: Menu pintasan 'Lihat Website' tidak ditemukan di sidebar navigasi");
  }
  console.log("✓ Menu 'Lihat Website' ditemukan di bilah samping (sidebar & drawer mobile) di atas tombol Keluar Sesi");

  // 5. Semantic variables check
  const hasSemanticVars =
    content.includes("var(--admin-border)") &&
    content.includes("var(--admin-surface)") &&
    content.includes("var(--admin-hover-bg)") &&
    content.includes("var(--admin-text-main)") &&
    content.includes("var(--admin-muted)");
  if (!hasSemanticVars) {
    throw new Error("FAIL: Variabel semantik tema admin belum lengkap");
  }
  console.log("✓ Styling menggunakan variabel semantik tema (--admin-border, --admin-surface, dll)");

  console.log("=== SEMUA 5/5 PENGUJIAN MANDIRI LULUS ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
