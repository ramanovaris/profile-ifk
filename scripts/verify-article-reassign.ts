import { strict as assert } from "assert";
import { db } from "../src/lib/db";
import * as bcrypt from "bcryptjs";
import {
  createArticleAction,
  updateArticleAction,
  bulkReassignArticlesAction,
} from "../src/actions/article";
import { deleteUserAction } from "../src/actions/user";

async function runTests() {
  console.log("=== Memulai Pengujian Fitur Alih Kepemilikan Penulis Artikel (#50) ===");

  // Persiapan data uji
  const hashedPassword = await bcrypt.hash("Password123!", 10);
  const testSuffix = Date.now().toString().slice(-4);

  // Cari atau buat kategori untuk artikel uji coba
  let testCat = await db.category.findFirst({ where: { status: "ACTIVE" } });
  if (!testCat) {
    testCat = await db.category.create({
      data: {
        name: `Kategori Uji ${testSuffix}`,
        slug: `kategori-uji-${testSuffix}`,
        status: "ACTIVE",
      },
    });
  }

  // Buat User A (Staf A) dan User B (Staf B)
  const userA = await db.user.create({
    data: {
      name: `Staf Penguji A ${testSuffix}`,
      username: `stafa_${testSuffix}`,
      password: hashedPassword,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  const userB = await db.user.create({
    data: {
      name: `Staf Penguji B ${testSuffix}`,
      username: `stafb_${testSuffix}`,
      password: hashedPassword,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  const userAdmin = await db.user.findFirst({
    where: { role: "SUPER_ADMIN", status: "ACTIVE" },
  });
  assert(userAdmin, "Akun Super Admin harus ada di database.");

  console.log(`✓ Data uji berhasil disiapkan: User A (${userA.username}), User B (${userB.username})`);

  let createdArticleIds: string[] = [];

  try {
    // 1. Uji Pembuatan Artikel oleh Super Admin dengan Atribusi ke User A
    console.log("1. Pengujian pembuatan artikel oleh Super Admin dengan penugasan ke staf lain...");
    const createRes1 = await createArticleAction({
      title: `Artikel Reassign Test 1 ${testSuffix}`,
      categoryId: testCat.id,
      content: "<p>Konten pengujian reassign author 1</p>",
      isPublished: true,
      authorId: userA.id,
      _testUserId: userAdmin.id,
      _testUserRole: "SUPER_ADMIN",
    });

    assert.strictEqual(createRes1.success, true, "Super Admin harus sukses membuat artikel.");
    assert(createRes1.data, "Data artikel harus dikembalikan.");
    assert.strictEqual(createRes1.data.authorId, userA.id, "Author ID artikel harus sesuai pilihan Super Admin (User A).");
    createdArticleIds.push(createRes1.data.id);
    console.log("   ✓ Super Admin berhasil membuat artikel atas nama staf lain (User A)");

    // 2. Uji Proteksi RBAC: Staf Biasa Tidak Dapat Menetapkan Author Lain
    console.log("2. Pengujian proteksi RBAC: Staf biasa tidak dapat menetapkan author lain...");
    const createRes2 = await createArticleAction({
      title: `Artikel Reassign Test 2 ${testSuffix}`,
      categoryId: testCat.id,
      content: "<p>Konten pengujian reassign author 2</p>",
      isPublished: true,
      authorId: userB.id, // Staf A mencoba mengeset author ke User B
      _testUserId: userA.id,
      _testUserRole: "STAFF",
    });

    assert.strictEqual(createRes2.success, true);
    assert(createRes2.data);
    assert.strictEqual(
      createRes2.data.authorId,
      userA.id,
      "Author ID harus tetap User A (upaya penetapan User B oleh staf harus diabaikan sistem)."
    );
    createdArticleIds.push(createRes2.data.id);
    console.log("   ✓ Upaya manipulasi authorId oleh staf berhasil dicegah oleh server");

    // 3. Uji Pembaruan Penulis Artikel oleh Super Admin (User A -> User B)
    console.log("3. Pengujian pembaruan kepemilikan artikel oleh Super Admin...");
    const updateRes = await updateArticleAction(createRes1.data.id, {
      title: createRes1.data.title,
      categoryId: testCat.id,
      content: "<p>Konten diperbarui</p>",
      authorId: userB.id,
      _testUserId: userAdmin.id,
      _testUserRole: "SUPER_ADMIN",
    });

    assert.strictEqual(updateRes.success, true, "Super Admin harus sukses memperbarui artikel.");
    assert(updateRes.data);
    assert.strictEqual(updateRes.data.authorId, userB.id, "Author ID artikel 1 sekarang harus menjadi User B.");
    console.log("   ✓ Super Admin berhasil mengalihkan kepemilikan artikel ke User B");

    // 4. Uji Pengalihan Massal (bulkReassignArticlesAction)
    console.log("4. Pengujian alih kepemilikan massal (bulkReassignArticlesAction)...");
    // Saat ini User A memiliki artikel 2, User B memiliki artikel 1.
    // Alihkan semua artikel milik User A ke User B secara massal.
    const bulkRes = await bulkReassignArticlesAction(userA.id, userB.id, {
      _testUserRole: "SUPER_ADMIN",
    });

    assert.strictEqual(bulkRes.success, true, "Bulk reassign harus berhasil.");
    assert.strictEqual(bulkRes.data?.count, 1, "Harus ada 1 artikel milik User A yang dialihkan.");

    const articlesAfterBulk = await db.article.count({
      where: { authorId: userA.id },
    });
    assert.strictEqual(articlesAfterBulk, 0, "User A sekarang tidak boleh memiliki artikel.");

    const userBArticlesCount = await db.article.count({
      where: { authorId: userB.id },
    });
    assert.strictEqual(userBArticlesCount, 2, "User B sekarang harus memiliki 2 artikel.");
    console.log("   ✓ Alih kepemilikan massal berhasil memindahkan seluruh artikel ke User B");

    // 5. Uji Hapus Akun dengan Transaksi Atomik (deleteUserAction)
    console.log("5. Pengujian penghapusan akun berartikel dengan alih kepemilikan atomik...");
    // Coba hapus User B tanpa reassignToUserId (harus ditolak)
    const deleteWithoutReassign = await deleteUserAction(userB.id, undefined, {
      _testUserId: userAdmin.id,
      _testUserRole: "SUPER_ADMIN",
    });
    assert.strictEqual(deleteWithoutReassign.success, false, "Penghapusan user berartikel tanpa target alih harus gagal.");
    assert(deleteWithoutReassign.error?.includes("pilih akun penerima"), "Pesan error harus memandu pemilihan penerima.");

    // Sekarang hapus User B dengan mengalihkan artikel ke User A
    const deleteWithReassign = await deleteUserAction(userB.id, userA.id, {
      _testUserId: userAdmin.id,
      _testUserRole: "SUPER_ADMIN",
    });
    assert.strictEqual(deleteWithReassign.success, true, "Penghapusan user dengan target alih harus berhasil.");

    // Verifikasi User B sudah terhapus
    const userBCheck = await db.user.findUnique({ where: { id: userB.id } });
    assert.strictEqual(userBCheck, null, "User B harus sudah terhapus dari tabel users.");

    // Verifikasi seluruh artikel milik User B sekarang berpindah ke User A
    const userAArticlesAfterDelete = await db.article.count({
      where: { authorId: userA.id },
    });
    assert.strictEqual(userAArticlesAfterDelete, 2, "Semua artikel User B harus berhasil dipindahkan ke User A.");
    console.log("   ✓ Transaksi atomik berhasil: artikel dialihkan ke User A dan User B terhapus bersih");

    // 6. Uji Integritas Relasional Basis Data (Zero Orphan Articles)
    console.log("6. Verifikasi integritas relasional basis data (Zero Orphan Articles)...");
    const allArticles = await db.article.findMany({ select: { id: true, authorId: true } });
    const allUserIds = new Set((await db.user.findMany({ select: { id: true } })).map((u) => u.id));
    const orphanArticles = allArticles.filter((art) => !allUserIds.has(art.authorId));
    assert.strictEqual(orphanArticles.length, 0, "Tidak boleh ada artikel yang kehilangan penulis (orphan).");
    console.log("   ✓ Integritas relasional foreign key terverifikasi 100% utuh");

  } finally {
    // Bersihkan data uji
    console.log("Membersihkan data uji...");
    if (createdArticleIds.length > 0) {
      await db.article.deleteMany({
        where: { id: { in: createdArticleIds } },
      });
    }
    await db.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
    console.log("✓ Data uji dibersihkan.");
  }

  console.log("=== SELURUH PENGUJIAN ISSUE #50 BERHASIL (100% PASS) ===");
}

runTests().catch((err) => {
  console.error("Gagal menjalankan pengujian:", err);
  process.exit(1);
});
