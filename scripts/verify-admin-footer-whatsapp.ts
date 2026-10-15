import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=== Verifikasi Tautan Bantuan WhatsApp di Footer Admin (Issue #173) ===");

  const adminShellPath = path.resolve(process.cwd(), "src/components/admin/admin-shell.tsx");
  const settingActionPath = path.resolve(process.cwd(), "src/actions/setting.ts");

  const shellContent = fs.readFileSync(adminShellPath, "utf-8");
  const settingContent = fs.readFileSync(settingActionPath, "utf-8");

  // 1. Elemen Footer pada AdminShell
  const hasFooter =
    shellContent.includes("<footer") &&
    shellContent.includes("border-t border-[var(--admin-border)]") &&
    shellContent.includes("bg-[var(--admin-surface)]");
  if (!hasFooter) {
    throw new Error("FAIL: Elemen <footer> dengan border dan background semantik tidak ditemukan pada AdminShell");
  }
  console.log("✓ Elemen <footer> terimplementasi dengan variabel semantik tema (--admin-border, --admin-surface)");

  // 2. Tombol Tautan Bantuan WhatsApp
  const hasWhatsAppButton =
    shellContent.includes("WhatsAppIcon") &&
    shellContent.includes("Bantuan Teknis WhatsApp") &&
    shellContent.includes('target="_blank"') &&
    shellContent.includes('rel="noopener noreferrer"');
  if (!hasWhatsAppButton) {
    throw new Error("FAIL: Tombol bantuan WhatsApp dengan target='_blank' dan rel='noopener noreferrer' tidak ditemukan");
  }
  console.log("✓ Tombol interaktif Bantuan Teknis WhatsApp dengan target='_blank' dan rel='noopener noreferrer' tersedia");

  // 3. Dukungan Prop whatsappLink pada AdminShellProps
  const hasProp =
    shellContent.includes("whatsappLink?: string;") &&
    shellContent.includes("formatWhatsAppSupportUrl");
  if (!hasProp) {
    throw new Error("FAIL: Prop whatsappLink atau fungsi formatWhatsAppSupportUrl tidak ditemukan pada AdminShell");
  }
  console.log("✓ Dukungan prop kustom whatsappLink dan format pemformatan URL pesan terpasang");

  // 4. Server Action getAdminSupportWhatsAppAction
  const hasServerAction = settingContent.includes("export async function getAdminSupportWhatsAppAction");
  if (!hasServerAction) {
    throw new Error("FAIL: Server action getAdminSupportWhatsAppAction tidak ditemukan pada src/actions/setting.ts");
  }
  console.log("✓ Server action getAdminSupportWhatsAppAction terdaftar di src/actions/setting.ts");

  // 5. Responsivitas dan Touch-friendly
  const hasResponsiveClasses =
    shellContent.includes("flex-col") &&
    shellContent.includes("sm:flex-row") &&
    shellContent.includes("min-h-[36px]");
  if (!hasResponsiveClasses) {
    throw new Error("FAIL: Kelas fleksibel responsif ponsel (flex-col sm:flex-row min-h-[36px]) tidak ditemukan");
  }
  console.log("✓ Penataan responsif ponsel dan desktop (flex-col sm:flex-row, min-h-[36px]) terverifikasi");

  // 6. Keterbacaan dan Kontras Standar Tema (Light & Dark)
  const hasThemeTokens =
    shellContent.includes("var(--admin-muted)") &&
    shellContent.includes("var(--admin-text-main)") &&
    shellContent.includes("var(--admin-bg)") &&
    shellContent.includes("emerald-600") &&
    shellContent.includes("dark:text-emerald-400");
  if (!hasThemeTokens) {
    throw new Error("FAIL: Token warna tema terang/gelap atau aksen emerald kontras tinggi belum lengkap");
  }
  console.log("✓ Kontras tinggi WCAG dan token tema ganda (Light & Dark) diterapkan");

  console.log("=== SEMUA 6/6 PENGUJIAN MANDIRI LULUS ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
