import { PrismaClient } from "@prisma/client";
import { getPublicArticlesAction } from "../src/actions/article";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("=== Memulai Verifikasi Otomatis Integrasi Berita Publik (Issue #58) ===\n");

  let passedTests = 0;
  const totalTests = 6;

  try {
    // 1. Uji Pengambilan Default (Semua Terbit)
    console.log("1. Menguji getPublicArticlesAction() default...");
    const resAll = await getPublicArticlesAction();
    if (!resAll.success) {
      throw new Error(`getPublicArticlesAction gagal: ${resAll.error}`);
    }

    const draftInResult = resAll.articles.some((a) => a.title.includes("Antibiotik"));
    if (draftInResult) {
      throw new Error("FAIL: Artikel draf bocor ke hasil query publik!");
    }
    console.log(`   ✓ Berhasil mengambil ${resAll.articles.length} artikel dari total ${resAll.total} artikel terbit.`);
    console.log("   ✓ Isolasi draf aman: Artikel draf tidak bocor ke publik.");
    passedTests++;

    // 2. Uji Filter Kategori
    console.log("\n2. Menguji filter kategori ('kegiatan')...");
    const resCategory = await getPublicArticlesAction({ categorySlug: "kegiatan" });
    if (!resCategory.success) {
      throw new Error(`Filter kategori gagal: ${resCategory.error}`);
    }
    const allMatchCategory = resCategory.articles.every((a) => a.categorySlug === "kegiatan");
    if (!allMatchCategory && resCategory.articles.length > 0) {
      throw new Error("FAIL: Ditemukan artikel dengan kategori tidak sesuai filter!");
    }
    console.log(`   ✓ Filter kategori 'kegiatan' valid: ${resCategory.articles.length} artikel cocok.`);
    passedTests++;

    // 3. Uji Filter Pencarian
    console.log("\n3. Menguji filter pencarian ('sistem informasi')...");
    const resSearch = await getPublicArticlesAction({ search: "sistem informasi" });
    if (!resSearch.success) {
      throw new Error(`Filter pencarian gagal: ${resSearch.error}`);
    }
    if (resSearch.articles.length === 0) {
      throw new Error("FAIL: Artikel 'Sosialisasi Penggunaan Sistem Informasi Kefarmasian' tidak ditemukan!");
    }
    console.log(`   ✓ Pencarian 'sistem informasi' berhasil menemukan ${resSearch.articles.length} artikel.`);
    passedTests++;

    // 4. Uji Paginasi & hasMore
    console.log("\n4. Menguji paginasi & hasMore (limit: 2)...");
    const resPage1 = await getPublicArticlesAction({ page: 1, limit: 2 });
    if (!resPage1.success || resPage1.articles.length !== 2) {
      throw new Error(`FAIL: Harusnya mengembalikan 2 artikel, dapat ${resPage1.articles.length}`);
    }
    if (!resPage1.hasMore) {
      throw new Error("FAIL: hasMore harus bernilai true jika masih ada artikel lanjutan!");
    }

    const resPage2 = await getPublicArticlesAction({ page: 2, limit: 2 });
    if (!resPage2.success) {
      throw new Error("FAIL: Gagal mengambil halaman 2!");
    }
    if (resPage1.articles[0].id === resPage2.articles[0].id) {
      throw new Error("FAIL: Halaman 2 tidak menggeser offset artikel!");
    }
    console.log("   ✓ Paginasi halaman 1 & 2 bekerja presisi dengan offset akurat.");
    console.log(`   ✓ hasMore flag terdeteksi tepat (hasMore = ${resPage1.hasMore}).`);
    passedTests++;

    // 5. Uji HTTP Endpoint Halaman Berita (/profile-ifk/berita)
    console.log("\n5. Menguji respon HTTP endpoint publik di http://localhost:3003/profile-ifk/berita...");
    const httpResBerita = await fetch("http://localhost:3003/profile-ifk/berita", { redirect: "follow" });
    if (httpResBerita.status !== 200) {
      throw new Error(`FAIL: Endpoint /berita merespon status ${httpResBerita.status}`);
    }
    const htmlBerita = await httpResBerita.text();
    if (!htmlBerita.includes("Sosialisasi Penggunaan Sistem Informasi Kefarmasian")) {
      throw new Error("FAIL: HTML /berita tidak memuat judul artikel riil PostgreSQL!");
    }
    if (htmlBerita.includes("Antibiotik")) {
      throw new Error("FAIL: HTML /berita membocorkan artikel draf 'Antibiotik'!");
    }
    console.log("   ✓ HTTP Endpoint /berita merespon status 200 OK.");
    console.log("   ✓ Konten HTML memuat artikel PostgreSQL dan mengisolasi draf.");
    passedTests++;

    // 6. Uji HTTP Endpoint Halaman Beranda (/profile-ifk/)
    console.log("\n6. Menguji respon HTTP endpoint publik di http://localhost:3003/profile-ifk/...");
    const httpResHome = await fetch("http://localhost:3003/profile-ifk/", { redirect: "follow" });
    if (httpResHome.status !== 200) {
      throw new Error(`FAIL: Endpoint / (Beranda) merespon status ${httpResHome.status}`);
    }
    const htmlHome = await httpResHome.text();
    if (!htmlHome.includes("dari rama")) {
      throw new Error("FAIL: HTML Beranda tidak memuat artikel terbaru PostgreSQL 'dari rama'!");
    }
    if (htmlHome.includes("Antibiotik")) {
      throw new Error("FAIL: HTML Beranda membocorkan artikel draf 'Antibiotik'!");
    }
    console.log("   ✓ HTTP Endpoint Beranda merespon status 200 OK.");
    console.log("   ✓ Berita terbaru PostgreSQL ditampilkan dengan isolasi draf aman.");
    passedTests++;

    console.log(`\n======================================================`);
    console.log(`HASIL: ${passedTests}/${totalTests} UJI BERHASIL LULUS 100%!`);
    console.log(`======================================================\n`);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification().catch((err) => {
  console.error("\n❌ VERIFIKASI GAGAL:", err);
  process.exit(1);
});
