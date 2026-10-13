import { strict as assert } from "assert";
import { db } from "../src/lib/db";
import { slugify } from "../src/lib/utils";
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryStatusAction,
  deleteCategoryAction,
} from "../src/actions/category";

async function runTests() {
  console.log("=== Memulai Pengujian Modul Basis Data Master Kategori ===");

  // 1. Uji Helper slugify
  console.log("1. Pengujian slugify helper...");
  assert.strictEqual(slugify("Obat & Vaksinasi"), "obat-vaksinasi");
  assert.strictEqual(slugify("Berita Terbaru 2026!"), "berita-terbaru-2026");
  assert.strictEqual(slugify("   Kategori   Banyak   Spasi   "), "kategori-banyak-spasi");
  assert.strictEqual(slugify("---Tanda---Hubung---"), "tanda-hubung");
  console.log("   ✓ slugify lolos semua variasi karakter");

  // 2. Uji Server Action Security Guard (Unauthenticated Rejection)
  console.log("2. Pengujian proteksi otentikasi Server Actions...");
  const createUnauth = await createCategoryAction({ name: "Testing Unauth" });
  assert.strictEqual(createUnauth.success, false);
  assert(createUnauth.error?.includes("Sesi tidak valid"));

  const updateUnauth = await updateCategoryAction("dummy-id", {
    name: "Testing Unauth",
    status: "ACTIVE",
  });
  assert.strictEqual(updateUnauth.success, false);
  assert(updateUnauth.error?.includes("Sesi tidak valid"));

  const toggleUnauth = await toggleCategoryStatusAction("dummy-id");
  assert.strictEqual(toggleUnauth.success, false);
  assert(toggleUnauth.error?.includes("Sesi tidak valid"));

  const deleteUnauth = await deleteCategoryAction("dummy-id");
  assert.strictEqual(deleteUnauth.success, false);
  assert(deleteUnauth.error?.includes("Sesi tidak valid"));
  console.log("   ✓ Seluruh Server Actions menolak akses tanpa sesi aktif");

  // 3. Uji Basis Data PostgreSQL: Pembuatan Kategori
  console.log("3. Pengujian Create Category di PostgreSQL...");
  const testName = `Uji Kategori ${Date.now()}`;
  const testSlug = slugify(testName);

  const created = await db.category.create({
    data: {
      name: testName,
      slug: testSlug,
      status: "ACTIVE",
    },
  });
  assert(created.id !== undefined, "ID kategori harus digenerate CUID");
  assert.strictEqual(created.name, testName);
  assert.strictEqual(created.slug, testSlug);
  assert.strictEqual(created.status, "ACTIVE");
  console.log(`   ✓ Kategori "${created.name}" berhasil dibuat (ID: ${created.id})`);

  // 4. Uji Constraint Unik (P2002) di PostgreSQL
  console.log("4. Pengujian Unique Constraint PostgreSQL...");
  try {
    await db.category.create({
      data: {
        name: testName,
        slug: `slug-berbeda-${Date.now()}`,
        status: "ACTIVE",
      },
    });
    assert.fail("Harusnya melempar error P2002 karena nama duplikat");
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err) {
      assert.strictEqual(err.code, "P2002", "Error code harus P2002 (Unique constraint failed)");
      console.log("   ✓ Constraint keunikan nama berhasil memblokir duplikasi (P2002)");
    } else {
      throw err;
    }
  }

  // 5. Uji Pembaruan Kategori (Update)
  console.log("5. Pengujian Update Category...");
  const updatedName = `${testName} Terupdate`;
  const updatedSlug = slugify(updatedName);

  const updated = await db.category.update({
    where: { id: created.id },
    data: {
      name: updatedName,
      slug: updatedSlug,
    },
  });
  assert.strictEqual(updated.name, updatedName);
  assert.strictEqual(updated.slug, updatedSlug);
  console.log("   ✓ Nama dan slug kategori berhasil diperbarui");

  // 6. Uji Toggle Status Kategori
  console.log("6. Pengujian Toggle Status Category...");
  const toggledToInactive = await db.category.update({
    where: { id: created.id },
    data: { status: "INACTIVE" },
  });
  assert.strictEqual(toggledToInactive.status, "INACTIVE");

  const toggledToActive = await db.category.update({
    where: { id: created.id },
    data: { status: "ACTIVE" },
  });
  assert.strictEqual(toggledToActive.status, "ACTIVE");
  console.log("   ✓ Status kategori berhasil di-toggle (ACTIVE -> INACTIVE -> ACTIVE)");

  // 7. Uji Relasi & Agregasi Artikel
  console.log("7. Pengujian Relasi dan Agregasi Artikel...");
  const categoryWithCount = await db.category.findUnique({
    where: { id: created.id },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
  assert(categoryWithCount !== null);
  assert.strictEqual(categoryWithCount._count.articles, 0, "Kategori baru belum memiliki artikel");
  console.log("   ✓ Agregasi relasi _count.articles terbaca 0 secara akurat");

  // 8. Uji Penghapusan (Cleanup)
  console.log("8. Pengujian Delete Category & Cleanup...");
  await db.category.delete({
    where: { id: created.id },
  });

  const checkDeleted = await db.category.findUnique({
    where: { id: created.id },
  });
  assert.strictEqual(checkDeleted, null, "Kategori uji harus sudah terhapus dari basis data");
  console.log("   ✓ Kategori uji berhasil dihapus dan dibersihkan dari basis data");

  console.log("\n=======================================================");
  console.log("🎉 SELURUH 8 PENGUJIAN BASIS DATA & SERVER ACTIONS PASSED! ✅");
  console.log("=======================================================");
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
