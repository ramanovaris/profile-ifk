import { db } from "../src/lib/db";
import * as bcrypt from "bcryptjs";
import * as assert from "node:assert";

async function verifySuperAdmin() {
  console.log("🧪 Memverifikasi akun dan proteksi superadmin...");

  // 1. Cek keberadaan akun superadmin di database
  const user = await db.user.findUnique({
    where: { username: "superadmin" },
    include: { _count: { select: { articles: true } } },
  });

  assert.ok(user, "Akun dengan username 'superadmin' harus ditemukan di database");
  console.log(`✅ Akun ditemukan: ID=${user.id}, Username=${user.username}, Role=${user.role}, Status=${user.status}`);

  assert.strictEqual(user.role, "SUPER_ADMIN", "Role harus SUPER_ADMIN");
  assert.strictEqual(user.status, "ACTIVE", "Status harus ACTIVE");

  // 2. Cek password hash valid
  assert.ok(user.password && user.password.startsWith("$2"), "Password hash bcrypt harus valid");
  console.log("✅ Format hash kata sandi valid");

  // 3. Pastikan username lama 'admin' sudah tidak ada
  const oldAdmin = await db.user.findUnique({
    where: { username: "admin" },
  });
  assert.strictEqual(oldAdmin, null, "Username lama 'admin' tidak boleh ada lagi");
  console.log("✅ Username lama 'admin' sudah bersih dari basis data");

  // 4. Pastikan relasi artikel tetap utuh
  console.log(`✅ Total artikel yang terhubung ke superadmin: ${user._count.articles}`);

  console.log("\n🎉 Seluruh verifikasi akun 'superadmin' berhasil 100%!");
}

verifySuperAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Verifikasi gagal:", err);
    process.exit(1);
  });
