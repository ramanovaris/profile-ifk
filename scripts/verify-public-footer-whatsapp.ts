import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=== Verifikasi Tautan WhatsApp di Footer Portal Publik (Issue #173) ===");

  const footerPath = path.resolve(process.cwd(), "src/components/public/footer.tsx");
  const content = fs.readFileSync(footerPath, "utf-8");

  // 1. WhatsAppIcon component check
  const hasIcon = content.includes("function WhatsAppIcon");
  if (!hasIcon) {
    throw new Error("FAIL: Komponen WhatsAppIcon tidak ditemukan di footer.tsx");
  }
  console.log("✓ Komponen WhatsAppIcon terdefinisi di footer.tsx");

  // 2. formatWhatsappNumber helper check
  const hasFormatter = content.includes("function formatWhatsappNumber");
  if (!hasFormatter) {
    throw new Error("FAIL: Fungsi pembantu formatWhatsappNumber tidak ditemukan di footer.tsx");
  }
  console.log("✓ Fungsi formatWhatsappNumber terdefinisi untuk memformat nomor kontak");

  // 3. Social Media Link check (Kolom 1)
  const hasSocialLink =
    content.includes('{ url: whatsappLink, icon: WhatsAppIcon, label: "WhatsApp" }');
  if (!hasSocialLink) {
    throw new Error("FAIL: Tautan WhatsApp belum didaftarkan pada daftar socialLinks Kolom 1");
  }
  console.log("✓ Tombol ikon WhatsApp terpasang di kelompok socialLinks Kolom 1");

  // 4. Contact List Item check (Kolom 3)
  const hasContactItem =
    content.includes("whatsappLink && (") &&
    content.includes("formatWhatsappNumber(whatsappLink)") &&
    content.includes('title="Hubungi WhatsApp Resmi IFK Kotabaru');
  if (!hasContactItem) {
    throw new Error("FAIL: Item WhatsApp pada daftar kontak Kolom 3 tidak ditemukan");
  }
  console.log("✓ Item kontak WhatsApp dengan format nomor dan tautan langsung terpasang di Kolom 3");

  // 5. Target _blank and rel noopener noreferrer check
  const hasSafeLinks =
    content.includes('target="_blank"') &&
    content.includes('rel="noopener noreferrer"');
  if (!hasSafeLinks) {
    throw new Error("FAIL: Atribut keamanan target='_blank' dan rel='noopener noreferrer' belum lengkap");
  }
  console.log("✓ Tautan eksternal WhatsApp dilindungi target='_blank' dan rel='noopener noreferrer'");

  console.log("=== SEMUA 5/5 PENGUJIAN MANDIRI LULUS ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
