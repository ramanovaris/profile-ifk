/**
 * scripts/verify-dashboard-db.ts
 *
 * Pengujian integrasi mandiri untuk integrasi database Dashboard Admin (#65):
 * 1. Verifikasi kalkulasi dinamis metrik KPI: total artikel, terbit, draft, stok obat, dan pengguna aktif.
 * 2. Verifikasi kueri 5 artikel sistem terbaru lengkap dengan relasi kategori dan penulis (tanpa N+1 problem).
 * 3. Verifikasi kueri ringkasan peran Super Admin (daftar pengguna aktif dan agregasi kontribusi artikel).
 * 4. Verifikasi kueri ringkasan peran Staf (daftar artikel yang dikelola oleh staf tertentu).
 * 5. Verifikasi pembersihan total data tiruan statis (dummyStats, dummyArticles, dummyUsers) pada page.tsx.
 */

import * as fs from "fs";
import * as path from "path";
import { db } from "../src/lib/db";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`   ✓ ${message}`);
}

async function runTests() {
  console.log("=== Memulai Pengujian Mandiri Integrasi Database Dashboard Admin (#65) ===");

  // 1. Verifikasi Kueri Agregasi Metrik KPI
  console.log("1. Pengujian kueri agregasi metrik KPI...");
  const [totalArticles, publishedArticles, draftArticles, totalStock, activeUsersCount] =
    await Promise.all([
      db.article.count(),
      db.article.count({ where: { isPublished: true } }),
      db.article.count({ where: { isPublished: false } }),
      db.medicineStock.count(),
      db.user.count({ where: { status: "ACTIVE" } }),
    ]);

  assert(typeof totalArticles === "number" && totalArticles >= 0, `Total artikel valid: ${totalArticles}`);
  assert(typeof publishedArticles === "number" && publishedArticles >= 0, `Artikel terbit valid: ${publishedArticles}`);
  assert(typeof draftArticles === "number" && draftArticles >= 0, `Artikel draf valid: ${draftArticles}`);
  assert(
    publishedArticles + draftArticles === totalArticles,
    `Konsistensi jumlah artikel: ${publishedArticles} terbit + ${draftArticles} draf = ${totalArticles} total`
  );
  assert(typeof totalStock === "number" && totalStock >= 200, `Total master stok obat valid: ${totalStock} item`);
  assert(typeof activeUsersCount === "number" && activeUsersCount >= 1, `Total pengguna aktif valid: ${activeUsersCount} akun`);

  // 2. Verifikasi Kueri 5 Artikel Terbaru
  console.log("2. Pengujian kueri 5 artikel terbaru berserta relasi...");
  const recentArticles = await db.article.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      author: {
        select: { id: true, name: true, username: true },
      },
    },
  });

  assert(Array.isArray(recentArticles), "Hasil kueri artikel berbentuk array");
  assert(recentArticles.length <= 5, `Jumlah artikel terbaru maksimal 5 (ditemukan: ${recentArticles.length})`);
  if (recentArticles.length > 0) {
    const firstArticle = recentArticles[0];
    assert(!!firstArticle.category?.name, `Relasi kategori terhubung dengan baik: '${firstArticle.category.name}'`);
    assert(!!firstArticle.author?.name, `Relasi penulis terhubung dengan baik: '${firstArticle.author.name}'`);
  }

  // 3. Verifikasi Kueri Ringkasan RBAC Super Admin
  console.log("3. Pengujian kueri ringkasan RBAC Super Admin...");
  const activeUsers = await db.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      _count: {
        select: { articles: true },
      },
    },
    orderBy: [
      { role: "asc" },
      { name: "asc" },
    ],
  });

  assert(Array.isArray(activeUsers) && activeUsers.length >= 1, `Ditemukan ${activeUsers.length} pengguna aktif`);
  for (const user of activeUsers) {
    assert(typeof user._count.articles === "number", `Hitungan artikel pengguna ${user.name} valid: ${user._count.articles}`);
  }

  // 4. Verifikasi Kueri Ringkasan RBAC Staf
  console.log("4. Pengujian kueri ringkasan RBAC Staf...");
  const sampleStaff = await db.user.findFirst({
    where: { role: "STAFF" },
  });

  if (sampleStaff) {
    const staffArticles = await db.article.findMany({
      where: { authorId: sampleStaff.id },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    assert(Array.isArray(staffArticles), `Kueri artikel staf '${sampleStaff.name}' berhasil`);
  } else {
    console.log("   ℹ Tidak ada akun staf untuk diuji kueri pribadinya (diabaikan)");
  }

  // 5. Verifikasi Pembersihan Dummy Data pada page.tsx
  console.log("5. Pengujian kebersihan berkas dashboard page.tsx...");
  const pagePath = path.resolve(__dirname, "../src/app/(admin)/admin/dashboard/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf8");

  const hasDummyArticles = pageContent.includes("dummyArticles");
  const hasDummyUsers = pageContent.includes("dummyUsers");
  const hasDummyStats = pageContent.includes("dummyStats");

  assert(!hasDummyArticles, "Tidak ada dependensi 'dummyArticles' pada page.tsx");
  assert(!hasDummyUsers, "Tidak ada dependensi 'dummyUsers' pada page.tsx");
  assert(!hasDummyStats, "Tidak ada dependensi 'dummyStats' pada page.tsx");
  assert(pageContent.includes("force-dynamic"), "Konfigurasi force-dynamic terpasang pada page.tsx");

  console.log("\n✅ SELURUH PENGUJIAN MANDIRI INTEGRASI DATABASE DASHBOARD BERHASIL 100%!");
}

runTests()
  .catch((err) => {
    console.error("❌ Terjadi kesalahan saat pengujian:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
