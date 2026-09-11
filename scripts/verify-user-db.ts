import { strict as assert } from "assert";
import { db } from "../src/lib/db";
import * as bcrypt from "bcryptjs";
import {
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  resetUserPasswordAction,
  deleteUserAction,
} from "../src/actions/user";

async function runTests() {
  console.log("=== Memulai Pengujian Modul Basis Data Pengguna (#48) ===");

  // 1. Uji Server Action Security Guard (Unauthenticated Rejection)
  console.log("1. Pengujian proteksi otentikasi Server Actions...");
  const createUnauth = await createUserAction({
    name: "Testing User",
    username: "testunauth",
    password: "Password123!",
    role: "STAFF",
  });
  assert.strictEqual(createUnauth.success, false);
  assert(createUnauth.error?.includes("Sesi tidak valid"));

  const updateUnauth = await updateUserAction("dummy-id", {
    name: "Testing User",
    username: "testunauth",
    role: "STAFF",
    status: "ACTIVE",
  });
  assert.strictEqual(updateUnauth.success, false);
  assert(updateUnauth.error?.includes("Sesi tidak valid"));

  const toggleUnauth = await toggleUserStatusAction("dummy-id");
  assert.strictEqual(toggleUnauth.success, false);
  assert(toggleUnauth.error?.includes("Sesi tidak valid"));

  const resetUnauth = await resetUserPasswordAction("dummy-id", "NewPassword123!");
  assert.strictEqual(resetUnauth.success, false);
  assert(resetUnauth.error?.includes("Sesi tidak valid"));

  const deleteUnauth = await deleteUserAction("dummy-id");
  assert.strictEqual(deleteUnauth.success, false);
  assert(deleteUnauth.error?.includes("Sesi tidak valid"));
  console.log("   ✓ Seluruh Server Actions menolak akses tanpa sesi aktif");

  // 2. Uji Query Data Pengguna Eksis di PostgreSQL
  console.log("2. Pengujian pembacaan pengguna dari PostgreSQL...");
  const existingUsers = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  assert(existingUsers.length >= 3, "Harus terdapat minimal 3 akun (admin, staff1, staff2)");
  const adminUser = existingUsers.find((u) => u.username === "admin");
  assert(adminUser !== undefined, "Akun 'admin' harus ditemukan di database");
  assert.strictEqual(adminUser?.role, "SUPER_ADMIN");
  assert.strictEqual(adminUser?.status, "ACTIVE");
  console.log(`   ✓ Ditemukan ${existingUsers.length} pengguna terdaftar di basis data.`);

  // 3. Uji Pembuatan Pengguna & Enkripsi Sandi bcrypt
  console.log("3. Pengujian pembuatan pengguna baru & hashing sandi...");
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = "PasswordTesting123!";
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  const createdUser = await db.user.create({
    data: {
      username: testUsername,
      name: "Pengguna Uji Coba",
      password: hashedPassword,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  assert(createdUser.id !== undefined);
  assert.strictEqual(createdUser.username, testUsername);
  assert.strictEqual(createdUser.role, "STAFF");
  assert.strictEqual(createdUser.status, "ACTIVE");

  // Verifikasi pencocokan sandi via bcrypt.compare
  const isMatch = await bcrypt.compare(testPassword, createdUser.password);
  assert.strictEqual(isMatch, true, "Sandi harus cocok dengan plain-text setelah di-compare");
  console.log(`   ✓ Akun '${createdUser.username}' berhasil dibuat dan sandi terverifikasi via bcrypt`);

  // 4. Uji Pembaruan Data Pengguna
  console.log("4. Pengujian update data pengguna...");
  const updatedUser = await db.user.update({
    where: { id: createdUser.id },
    data: {
      name: "Pengguna Uji Coba Diperbarui",
      role: "SUPER_ADMIN",
    },
  });
  assert.strictEqual(updatedUser.name, "Pengguna Uji Coba Diperbarui");
  assert.strictEqual(updatedUser.role, "SUPER_ADMIN");
  console.log("   ✓ Update nama dan peran pengguna berhasil disimpan");

  // 5. Uji Toggle Status Pengguna
  console.log("5. Pengujian toggle status pengguna...");
  const deactivatedUser = await db.user.update({
    where: { id: createdUser.id },
    data: { status: "INACTIVE" },
  });
  assert.strictEqual(deactivatedUser.status, "INACTIVE");
  console.log("   ✓ Status pengguna berhasil dinonaktifkan");

  // 6. Uji Reset Sandi Pengguna
  console.log("6. Pengujian reset kata sandi...");
  const newTestPassword = "NewSecretPassword2026!";
  const newHashed = await bcrypt.hash(newTestPassword, 10);
  await db.user.update({
    where: { id: createdUser.id },
    data: { password: newHashed },
  });
  const recheckUser = await db.user.findUniqueOrThrow({
    where: { id: createdUser.id },
  });
  const isNewMatch = await bcrypt.compare(newTestPassword, recheckUser.password);
  assert.strictEqual(isNewMatch, true, "Kata sandi baru harus cocok");
  console.log("   ✓ Kata sandi baru berhasil diperbarui dan diverifikasi");

  // 7. Pembersihan Akun Uji
  console.log("7. Pembersihan data pengujian...");
  await db.user.delete({
    where: { id: createdUser.id },
  });
  const deletedCheck = await db.user.findUnique({
    where: { id: createdUser.id },
  });
  assert.strictEqual(deletedCheck, null, "Pengguna harus sudah terhapus");
  console.log("   ✓ Data pengujian berhasil dibersihkan dari basis data");

  console.log("\n✅ SELURUH PENGUJIAN BASIS DATA MODUL PENGGUNA BERHASIL (100% PASS)!");
}

runTests()
  .catch((err) => {
    console.error("\n❌ PENGUJIAN GAGAL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
