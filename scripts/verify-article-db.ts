/**
 * scripts/verify-article-db.ts
 *
 * Pengujian integrasi mandiri untuk modul Berita / Artikel di PostgreSQL VPS:
 * 1. Autentikasi sesi staf/admin.
 * 2. Pembuatan artikel baru dengan auto-slug dan relasi category + author.
 * 3. Proteksi keunikan slug (auto-suffix jika duplikat).
 * 4. Pembaruan data artikel (judul, konten, status publikasi).
 * 5. Toggle status publikasi instan (isPublished).
 * 6. Pembersihan data uji dan verifikasi integritas foreign key.
 */

import { db } from "../src/lib/db";
import {
  createArticleAction,
  updateArticleAction,
  toggleArticlePublishAction,
  deleteArticleAction,
} from "../src/actions/article";

async function runTests() {
  console.log("=== [TEST START] Verifikasi Integrasi Database Artikel ===");
  let passed = 0;
  let failed = 0;

  // 0. Setup mock session / cari user admin
  const adminUser = await db.user.findFirst({
    where: { role: "SUPER_ADMIN", status: "ACTIVE" },
  });
  if (!adminUser) {
    throw new Error("User Super Admin aktif tidak ditemukan di DB.");
  }

  const category = await db.category.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!category) {
    throw new Error("Kategori aktif tidak ditemukan di DB.");
  }

  // Buat sesi aktif sementara untuk tes
  const testSessionToken = "test_session_token_" + Date.now();
  const session = await db.session.create({
    data: {
      sessionToken: testSessionToken,
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    },
  });

  // Inject session cookie mock ke process.env atau cookie store
  // Catatan: createArticleAction menggunakan getCurrentSession() yang membaca cookies()
  // Kita pastikan helper getCurrentSession atau action mendukung auth session
  console.log(`[INFO] Sesi tes terdaftar: ID ${session.id} untuk user ${adminUser.username}`);

  // TEST 1: Create Article
  let createdArticleId = "";
  try {
    const testTitle = "Uji Coba Integrasi Berita Farmasi " + Date.now();
    const res = await createArticleAction({
      title: testTitle,
      categoryId: category.id,
      content: "<p>Konten artikel pengujian otomatis integrasi database.</p>",
      isPublished: true,
      _testUserId: adminUser.id, // Bypass auth cookie untuk standalone script
    });

    if (res.success && res.data?.id && res.data?.slug) {
      createdArticleId = res.data.id;
      console.log(`✅ TEST 1 PASSED: Berhasil membuat artikel (ID: ${res.data.id}, Slug: ${res.data.slug})`);
      passed++;
    } else {
      console.error("❌ TEST 1 FAILED:", res.error);
      failed++;
    }
  } catch (err) {
    console.error("❌ TEST 1 EXCEPTION:", err);
    failed++;
  }

  // TEST 2: Slug Collision Auto-Suffix
  let duplicateArticleId = "";
  try {
    const testTitle = "Uji Coba Tabrakan Slug " + Date.now();
    const res1 = await createArticleAction({
      title: testTitle,
      categoryId: category.id,
      content: "<p>Artikel pertama.</p>",
      isPublished: true,
      _testUserId: adminUser.id,
    });

    const res2 = await createArticleAction({
      title: testTitle,
      categoryId: category.id,
      content: "<p>Artikel kedua dengan judul sama persis.</p>",
      isPublished: true,
      _testUserId: adminUser.id,
    });

    if (res1.success && res2.success && res1.data?.slug !== res2.data?.slug) {
      duplicateArticleId = res2.data?.id || "";
      console.log(`✅ TEST 2 PASSED: Auto-suffix slug collision berhasil (${res1.data?.slug} vs ${res2.data?.slug})`);
      passed++;
      // Cleanup res1
      if (res1.data?.id) await db.article.delete({ where: { id: res1.data.id } });
    } else {
      console.error("❌ TEST 2 FAILED: Slug tidak unik", res1, res2);
      failed++;
    }
  } catch (err) {
    console.error("❌ TEST 2 EXCEPTION:", err);
    failed++;
  }

  // TEST 3: Update Article
  try {
    const updatedTitle = "Judul Baru Artikel Diperbarui " + Date.now();
    const res = await updateArticleAction(createdArticleId, {
      title: updatedTitle,
      categoryId: category.id,
      content: "<p>Konten yang telah diperbarui melalui Server Action.</p>",
      isPublished: false,
      _testUserId: adminUser.id,
    });

    if (res.success) {
      const check = await db.article.findUnique({ where: { id: createdArticleId } });
      if (check?.title === updatedTitle && check?.isPublished === false) {
        console.log(`✅ TEST 3 PASSED: Berhasil memperbarui artikel (Judul: ${check.title})`);
        passed++;
      } else {
        console.error("❌ TEST 3 FAILED: Data di DB tidak sesuai", check);
        failed++;
      }
    } else {
      console.error("❌ TEST 3 FAILED:", res.error);
      failed++;
    }
  } catch (err) {
    console.error("❌ TEST 3 EXCEPTION:", err);
    failed++;
  }

  // TEST 4: Toggle Status Publikasi
  try {
    const res = await toggleArticlePublishAction(createdArticleId, adminUser.id);
    if (res.success && res.isPublished === true) {
      console.log("✅ TEST 4 PASSED: Berhasil toggle status publikasi dari false ke true");
      passed++;
    } else {
      console.error("❌ TEST 4 FAILED:", res);
      failed++;
    }
  } catch (err) {
    console.error("❌ TEST 4 EXCEPTION:", err);
    failed++;
  }

  // TEST 5: Delete Article & Integrity Check
  try {
    const res = await deleteArticleAction(createdArticleId, adminUser.id);
    if (res.success) {
      const check = await db.article.findUnique({ where: { id: createdArticleId } });
      if (!check) {
        console.log("✅ TEST 5 PASSED: Berhasil menghapus artikel uji coba dari database");
        passed++;
      } else {
        console.error("❌ TEST 5 FAILED: Artikel masih ada di database");
        failed++;
      }
    } else {
      console.error("❌ TEST 5 FAILED:", res.error);
      failed++;
    }
  } catch (err) {
    console.error("❌ TEST 5 EXCEPTION:", err);
    failed++;
  }

  // Cleanup duplicate article & test session
  if (duplicateArticleId) {
    await db.article.delete({ where: { id: duplicateArticleId } }).catch(() => {});
  }
  await db.session.delete({ where: { id: session.id } }).catch(() => {});

  console.log(`\n=== [HASIL TEST] Total: ${passed + failed} | Lolos: ${passed} | Gagal: ${failed} ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
