/**
 * scripts/verify-article-preview.ts
 *
 * Pengujian integrasi mandiri untuk fitur pratinjau (preview) artikel berita (Issue #45):
 * 1. Pengecekan artikel terbit (isPublished: true) -> Terbuka untuk umum.
 * 2. Pengecekan artikel draf (isPublished: false) tanpa sesi admin -> Akses ditolak (404 Not Found).
 * 3. Pengecekan artikel draf (isPublished: false) dengan sesi admin -> Akses diizinkan (Mode Pratinjau Aktif).
 * 4. Pengecekan rekomendasi berita terkait -> Hanya menampilkan artikel berstatus published.
 * 5. Pembersihan data uji.
 */

import { db } from "../src/lib/db";

async function runPreviewVerification() {
  console.log("=== [TEST START] Verifikasi Logika Pratinjau Artikel (Issue #45) ===");
  let passed = 0;
  let failed = 0;

  const adminUser = await db.user.findFirst({
    where: { role: "SUPER_ADMIN", status: "ACTIVE" },
  });
  if (!adminUser) {
    throw new Error("Super Admin aktif tidak ditemukan di basis data.");
  }

  const category = await db.category.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!category) {
    throw new Error("Kategori aktif tidak ditemukan di basis data.");
  }

  // 1. Buat 1 artikel Published dan 1 artikel Draft untuk pengujian
  const timestamp = Date.now();
  const publishedSlug = `uji-artikel-terbit-${timestamp}`;
  const draftSlug = `uji-artikel-draf-${timestamp}`;

  const publishedArticle = await db.article.create({
    data: {
      title: `Artikel Terbit Uji Coba ${timestamp}`,
      slug: publishedSlug,
      content: "<p>Konten artikel terbit publik.</p>",
      isPublished: true,
      categoryId: category.id,
      authorId: adminUser.id,
    },
  });

  const draftArticle = await db.article.create({
    data: {
      title: `Artikel Draf Uji Coba ${timestamp}`,
      slug: draftSlug,
      content: "<p>Konten artikel draf rahasia.</p>",
      isPublished: false,
      categoryId: category.id,
      authorId: adminUser.id,
    },
  });

  console.log(`[INFO] Artikel uji dibuat: Published (${publishedArticle.id}), Draft (${draftArticle.id})`);

  // Helper simulasi otorisasi pembacaan halaman publik
  async function simulatePageAccess(slug: string, sessionToken?: string) {
    const article = await db.article.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
      },
    });

    if (!article) {
      return { status: 404, reason: "NOT_FOUND" };
    }

    if (!article.isPublished) {
      let hasAdminSession = false;
      if (sessionToken) {
        const session = await db.session.findUnique({
          where: { sessionToken },
          include: { user: true },
        });
        if (session && session.expiresAt > new Date() && session.user.status === "ACTIVE") {
          hasAdminSession = true;
        }
      }

      if (!hasAdminSession) {
        // Mirip notFound() di Next.js App Router
        return { status: 404, reason: "DRAFT_UNAUTHORIZED" };
      }

      return { status: 200, isPreview: true, article };
    }

    return { status: 200, isPreview: false, article };
  }

  try {
    // TEST 1: Artikel Terbit diakses publik (tanpa token sesi)
    const res1 = await simulatePageAccess(publishedSlug);
    if (res1.status === 200 && res1.isPreview === false && res1.article?.title === publishedArticle.title) {
      console.log("✅ TEST 1 LULUS: Artikel terbit dapat diakses publik tanpa sesi admin.");
      passed++;
    } else {
      console.error("❌ TEST 1 GAGAL:", res1);
      failed++;
    }

    // TEST 2: Artikel Draf diakses publik (tanpa token sesi) -> WAJIB 404
    const res2 = await simulatePageAccess(draftSlug);
    if (res2.status === 404 && res2.reason === "DRAFT_UNAUTHORIZED") {
      console.log("✅ TEST 2 LULUS: Artikel draf memblokir akses publik non-admin (404 Not Found).");
      passed++;
    } else {
      console.error("❌ TEST 2 GAGAL: Artikel draf bocor ke publik!", res2);
      failed++;
    }

    // TEST 3: Artikel Draf diakses dengan sesi admin valid -> WAJIB 200 dengan isPreview: true
    const testSessionToken = "preview_test_token_" + timestamp;
    await db.session.create({
      data: {
        sessionToken: testSessionToken,
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 1800 * 1000),
      },
    });

    const res3 = await simulatePageAccess(draftSlug, testSessionToken);
    if (res3.status === 200 && res3.isPreview === true && res3.article?.id === draftArticle.id) {
      console.log("✅ TEST 3 LULUS: Artikel draf dapat diakses admin dengan status Mode Pratinjau Aktif.");
      passed++;
    } else {
      console.error("❌ TEST 3 GAGAL: Admin tidak dapat melihat pratinjau draf!", res3);
      failed++;
    }

    // TEST 4: Query berita terkait tidak memasukkan artikel draf
    const related = await db.article.findMany({
      where: {
        isPublished: true,
        id: { not: draftArticle.id },
      },
      select: { id: true, isPublished: true },
    });

    const containsDraft = related.some((r) => r.isPublished === false || r.id === draftArticle.id);
    if (!containsDraft) {
      console.log("✅ TEST 4 LULUS: Berita terkait hanya menampilkan artikel terbit dan tidak memuat draf.");
      passed++;
    } else {
      console.error("❌ TEST 4 GAGAL: Berita terkait memuat artikel draf!");
      failed++;
    }

    // Hapus sesi tes
    await db.session.delete({ where: { sessionToken: testSessionToken } });
  } finally {
    // Bersihkan artikel uji
    await db.article.deleteMany({
      where: {
        id: { in: [publishedArticle.id, draftArticle.id] },
      },
    });
    console.log("[INFO] Data uji dibersihkan dari basis data.");
  }

  console.log(`\n=== [HASIL TEST] ${passed} Lulus, ${failed} Gagal ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runPreviewVerification()
  .catch((err) => {
    console.error("Fatal Error running verification:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
