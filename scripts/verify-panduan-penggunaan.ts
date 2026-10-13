import * as fs from "node:fs";
import * as path from "node:path";

const filePath = path.join(process.cwd(), "docs", "PANDUAN_PENGGUNAAN.md");
const content = fs.readFileSync(filePath, "utf-8");

const issuesChecked: string[] = [];
const failures: string[] = [];

function check(title: string, condition: boolean, failMsg: string) {
  if (condition) {
    issuesChecked.push(title);
    console.log(`✅ PASS: ${title}`);
  } else {
    failures.push(`${title} -> ${failMsg}`);
    console.error(`❌ FAIL: ${title} -> ${failMsg}`);
  }
}

// 1. Issue #147: IT dinas diganti IT IFK
check(
  "Issue #147: Pemulihan sandi admin di FAQ menunjuk ke IT IFK bukan IT dinas",
  !content.includes("tim pengelola teknis IT dinas") &&
    content.includes("tim pengelola teknis IT IFK"),
  "Masih ditemukan 'tim pengelola teknis IT dinas' atau belum ada 'tim pengelola teknis IT IFK'"
);

// 2. Issue #145: Hapus jargon modal 50/50
check(
  "Issue #145: Peniadaan istilah teknis layout modal 50/50",
  !content.includes("Modal Form Responsif 50/50") &&
    !content.includes("dua kolom (50/50 di layar desktop)") &&
    content.includes("Input dan Perubahan Data Obat Manual"),
  "Masih ditemukan jargon teknis 50/50"
);

// 3. Issue #144: Nomenklatur Laporan Ketersediaan Obat Bulanan vs LPLPO
check(
  "Issue #144: Nomenklatur berkas impor ketersediaan obat bulanan",
  content.includes("Mengunggah Berkas Laporan Ketersediaan Obat Bulanan (Impor Data)") &&
    content.includes("Laporan Ketersediaan Obat Bulanan") &&
    content.includes("Import CSV / Excel") &&
    content.includes("Format Kemenkes Obat Indikator") &&
    content.includes("Format Obat Program (dengan Detil Stok)"),
  "Nomenklatur berkas impor belum diperbarui atau format pendukung belum dirinci"
);

// 4. Issue #138: MoS Formula dan ambang batas
check(
  "Issue #138: Dokumentasi metodologi MoS dan kriteria ambang batas Kemenkes",
  content.includes("Months of Supply (MoS)") &&
    content.includes("Sisa Stok Fisik") &&
    content.includes("Rata-rata Pemakaian Bulanan (RPB)") &&
    (content.includes("MoS < 3.0") || content.includes("MoS $< 3.0$")) &&
    (content.includes("MoS >= 3.0") || content.includes("MoS $\\ge 3.0$")),
  "Metodologi MoS belum lengkap"
);

// 5. Issue #140: Hapus form pesan kontak, ganti saluran langsung
check(
  "Issue #140: Hapus referensi formulir kirim pesan di kontak publik",
  !content.includes("formulir pengiriman pesan") &&
    !content.includes("Kirim Pesan: Mengisi nama") &&
    content.includes("Konsultasi WhatsApp Resmi") &&
    content.includes("Surat Elektronik (Email Dinas)"),
  "Masih ada referensi formulir pesan atau saluran langsung belum lengkap"
);

// 6. Issue #141: 7 Menu sidebar admin + sub-bab 3.6 & 3.7
check(
  "Issue #141: Sinkronisasi 7 menu sidebar admin dan kelengkapan modul pengguna & profil",
  content.includes("/admin/dashboard") &&
    content.includes("/admin/berita") &&
    content.includes("/admin/kategori") &&
    content.includes("/admin/stok") &&
    content.includes("/admin/pengguna") &&
    content.includes("/admin/profil") &&
    content.includes("/admin/pengaturan") &&
    content.includes("3.6 Manajemen Akun Pengguna (Hak Akses Super Admin)") &&
    content.includes("3.7 Pengelolaan Profil Pribadi Operator"),
  "7 menu sidebar atau sub-bab 3.6 / 3.7 belum lengkap"
);

// 7. Issue #143: Status publikasi berita
check(
  "Issue #143: Penjelasan field status publikasi pada form berita",
  content.includes("Penjelasan Field Status Publikasi") &&
    content.includes("Langsung Terbitkan") &&
    content.includes("Simpan Sebagai Draft"),
  "Penjelasan field status publikasi belum ditemukan"
);

// 8. Issue #146: Panduan 5 tab pengaturan website multi-tab
check(
  "Issue #146: Panduan lengkap 5 tab pengaturan website multi-tab",
  content.includes("3.5 Manajemen Pengaturan Website (Multi-Tab)") &&
    content.includes("Tab 1: Identitas & Kontak") &&
    content.includes("Tab 2: Konten Profil UPTD") &&
    content.includes("Tab 3: Tautan & Layanan") &&
    content.includes("Tab 4: Dokumen Layanan") &&
    content.includes("Tab 5: Statistik & SDM") &&
    content.includes("Mekanisme Penyimpanan dan Reset Mandiri Per Tab"),
  "Panduan 5 tab pengaturan website belum lengkap"
);

// 9. Validasi Semua Tautan Daftar Isi (TOC Anchor Links)
const headingRegex = /^#{1,4}\s+(.+)$/gm;
const headings: string[] = [];
let match;
while ((match = headingRegex.exec(content)) !== null) {
  headings.push(match[1].trim());
}

function toGitHubAnchor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except hyphen and space
    .trim()
    .replace(/\s/g, "-"); // replace EACH space with hyphen
}

const tocRegex = /\[([^\]]+)\]\(#([^\)]+)\)/g;
let tocMatch;
const tocLinks: { text: string; anchor: string }[] = [];
const tocSection = content.substring(content.indexOf("## Daftar Isi"), content.indexOf("## Bab I:"));

while ((tocMatch = tocRegex.exec(tocSection)) !== null) {
  tocLinks.push({ text: tocMatch[1], anchor: tocMatch[2] });
}

const missingAnchors: string[] = [];
for (const link of tocLinks) {
  const matchingHeading = headings.find((h) => {
    const slug = toGitHubAnchor(h);
    return slug === link.anchor;
  });
  if (!matchingHeading) {
    missingAnchors.push(`[${link.text}](#${link.anchor})`);
  }
}

check(
  `Integritas Tautan TOC: ${tocLinks.length} tautan diperiksa`,
  missingAnchors.length === 0,
  `Tautan TOC tidak menemukan heading target: ${missingAnchors.join(", ")}`
);

console.log("\n--- HASIL VALIDASI ---");
console.log(`Total cek berhasil: ${issuesChecked.length}/${issuesChecked.length + failures.length}`);

if (failures.length > 0) {
  console.error("Gagal verifikasi panduan penggunaan!");
  process.exit(1);
} else {
  console.log("Semua kriteria verifikasi Batch Panduan Penggunaan LULUS 100%!");
}
