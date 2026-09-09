import { strict as assert } from "assert";
import { db } from "../src/lib/db";
import { verifyPassword } from "../src/lib/auth";

async function runTests() {
  console.log("Memulai pengujian modul autentikasi database...");

  // 1. Verifikasi Super Admin hasil seed ada di DB
  const admin = await db.user.findUnique({
    where: { username: "admin" },
  });
  assert(admin !== null, "User 'admin' harus terdaftar di basis data");
  assert.strictEqual(admin.role, "SUPER_ADMIN", "Role admin harus SUPER_ADMIN");
  assert.strictEqual(admin.status, "ACTIVE", "Status admin harus ACTIVE");

  // 2. Verifikasi Password Hash
  const isValidPassword = await verifyPassword("AdminIFK2026!", admin.password);
  assert.strictEqual(isValidPassword, true, "Password 'AdminIFK2026!' harus valid terhadap bcrypt hash");

  const isInvalidPassword = await verifyPassword("WrongPassword123", admin.password);
  assert.strictEqual(isInvalidPassword, false, "Password salah harus ditolak");

  // 3. Verifikasi Pembuatan Sesi di Database
  const session = await db.session.create({
    data: {
      sessionToken: "test_token_" + Date.now(),
      userId: admin.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  assert(session.id !== undefined, "Record sesi harus berhasil dibuat di DB");

  // 4. Verifikasi Hubungan Relasional Sesi -> User
  const foundSession = await db.session.findUnique({
    where: { sessionToken: session.sessionToken },
    include: { user: true },
  });
  assert(foundSession !== null, "Sesi harus dapat ditemukan di DB");
  assert.strictEqual(foundSession.user.username, "admin", "Sesi harus terhubung ke user 'admin'");

  // 5. Cleanup Sesi Uji
  await db.session.delete({ where: { id: session.id } });
  const deletedSession = await db.session.findUnique({
    where: { sessionToken: session.sessionToken },
  });
  assert.strictEqual(deletedSession, null, "Sesi uji harus berhasil dihapus");

  console.log("Seluruh 5 pengujian autentikasi database & seeder PASSED! ✅");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
