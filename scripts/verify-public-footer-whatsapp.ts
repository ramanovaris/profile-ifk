import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=== Verifikasi Tautan WhatsApp di Portal Publik (Issue #173) ===");

  const footerPath = path.resolve(process.cwd(), "src/components/public/footer.tsx");
  const kontakPath = path.resolve(process.cwd(), "src/app/(public)/kontak/page.tsx");

  const footerContent = fs.readFileSync(footerPath, "utf-8");
  const kontakContent = fs.readFileSync(kontakPath, "utf-8");

  // 1. WhatsAppIcon check di footer.tsx
  if (!footerContent.includes("function WhatsAppIcon")) {
    throw new Error("FAIL: Komponen WhatsAppIcon tidak ditemukan di footer.tsx");
  }
  console.log("✓ Komponen WhatsAppIcon terdefinisi di footer.tsx");

  // 2. formatWhatsappNumber check di footer.tsx
  if (!footerContent.includes("function formatWhatsappNumber")) {
    throw new Error("FAIL: Fungsi pembantu formatWhatsappNumber tidak ditemukan di footer.tsx");
  }
  console.log("✓ Fungsi formatWhatsappNumber terdefinisi untuk memformat nomor kontak di footer.tsx");

  // 3. Social Media Link check (Footer Kolom 1)
  if (!footerContent.includes('{ url: whatsappLink, icon: WhatsAppIcon, label: "WhatsApp" }')) {
    throw new Error("FAIL: Tautan WhatsApp belum didaftarkan pada daftar socialLinks Kolom 1");
  }
  console.log("✓ Tombol ikon WhatsApp terpasang di kelompok socialLinks Footer Kolom 1");

  // 4. Contact List Item check (Footer Kolom 3)
  if (!footerContent.includes("whatsappLink && (") || !footerContent.includes("formatWhatsappNumber(whatsappLink)")) {
    throw new Error("FAIL: Item WhatsApp pada daftar kontak Footer Kolom 3 tidak ditemukan");
  }
  console.log("✓ Item kontak WhatsApp dengan format nomor terpasang di Footer Kolom 3");

  // 5. Pemisahan WhatsApp dan Telepon di Halaman Kontak (/kontak)
  const hasKontakWhatsApp =
    kontakContent.includes('label: "WhatsApp"') &&
    kontakContent.includes("formatWhatsappNumber(whatsappLink)");
  const hasKontakPhone =
    kontakContent.includes('label: "Telepon / Fax"') &&
    kontakContent.includes("value: phone");

  if (!hasKontakWhatsApp || !hasKontakPhone) {
    throw new Error("FAIL: Pemisahan WhatsApp dan Telepon / Fax pada src/app/(public)/kontak/page.tsx belum benar");
  }
  console.log("✓ Pemisahan baris WhatsApp dan Telepon / Fax pada /kontak berhasil diterapkan");

  console.log("=== SEMUA 5/5 PENGUJIAN MANDIRI LULUS ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
