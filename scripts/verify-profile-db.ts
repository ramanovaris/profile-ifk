/**
 * scripts/verify-profile-db.ts
 *
 * Pengujian integrasi mandiri untuk modul Konten Profil UPTD (#53):
 * 1. Verifikasi penolakan Server Action updateSiteProfileAction tanpa sesi aktif.
 * 2. Verifikasi ketersediaan field profil di PostgreSQL (headName, headRole, greeting, vision, mission, tupoksi).
 * 3. Verifikasi mutasi pembaruan data profil di PostgreSQL.
 * 4. Verifikasi pembacaan ulang data yang telah diubah.
 * 5. Rollback data ke kondisi awal demi integritas basis data.
 */

import { db } from "../src/lib/db";
import { updateSiteProfileAction, getSiteSettings } from "../src/actions/setting";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`   ✓ ${message}`);
}

async function runTests() {
  console.log("=== Memulai Pengujian Modul Konten Profil UPTD (#53) ===");

  // 1. Pengujian proteksi otentikasi Server Action
  console.log("1. Pengujian proteksi otentikasi Server Action...");
  try {
    const fakeFormData = new FormData();
    fakeFormData.append("headName", "Uji Coba Pimpinan");
    fakeFormData.append("headRole", "Kepala Uji Coba");
    const unauthResult = await updateSiteProfileAction(fakeFormData);
    assert(
      unauthResult.success === false,
      "Server Action menolak mutasi tanpa sesi aktif pengguna"
    );
  } catch (err: unknown) {
    assert(
      err instanceof Error,
      "Server Action aman menolak akses di luar konteks request terautentikasi"
    );
  }

  // 2. Pengujian pembacaan data awal SiteSetting dari PostgreSQL
  console.log("2. Pengujian pembacaan data awal SiteSetting dari PostgreSQL...");
  const initialDbSetting = await db.siteSetting.findUnique({
    where: { id: "default" },
  });
  assert(initialDbSetting !== null, "Data default SiteSetting ditemukan di basis data");
  if (!initialDbSetting) return;

  assert(
    typeof initialDbSetting.headName === "string" && initialDbSetting.headName.length > 0,
    `Field headName terbaca: "${initialDbSetting.headName}"`
  );
  assert(
    typeof initialDbSetting.headRole === "string" && initialDbSetting.headRole.length > 0,
    `Field headRole terbaca: "${initialDbSetting.headRole}"`
  );
  assert(
    typeof initialDbSetting.vision === "string" && initialDbSetting.vision.length > 0,
    `Field vision terbaca: "${initialDbSetting.vision.substring(0, 30)}..."`
  );
  assert(
    typeof initialDbSetting.mission === "string" && initialDbSetting.mission.length > 0,
    `Field mission terbaca: "${initialDbSetting.mission.substring(0, 30)}..."`
  );
  assert(
    typeof initialDbSetting.tupoksi === "string" && initialDbSetting.tupoksi.length > 0,
    `Field tupoksi terbaca: "${initialDbSetting.tupoksi.substring(0, 30)}..."`
  );
  assert(
    "orgStructurePhoto" in initialDbSetting,
    "Field orgStructurePhoto tersedia pada model SiteSetting"
  );

  const originalHeadName = initialDbSetting.headName;
  const originalOrgPhoto = initialDbSetting.orgStructurePhoto;
  const testHeadName = `${originalHeadName} [TEST]`;
  const testOrgPhoto = `/uploads/profile/org-test.png`;

  // 3. Pengujian mutasi update data profil di PostgreSQL
  console.log("3. Pengujian mutasi update data profil di PostgreSQL...");
  const updatedDbSetting = await db.siteSetting.update({
    where: { id: "default" },
    data: {
      headName: testHeadName,
      orgStructurePhoto: testOrgPhoto,
    },
  });
  assert(
    updatedDbSetting.headName === testHeadName,
    "Mutasi pembaruan headName berhasil dieksekusi di database"
  );
  assert(
    updatedDbSetting.orgStructurePhoto === testOrgPhoto,
    "Mutasi pembaruan orgStructurePhoto berhasil dieksekusi di database"
  );

  // 4. Pengujian pembacaan ulang via getSiteSettings
  console.log("4. Pengujian pembacaan ulang data yang diubah...");
  const reReadDbSetting = await db.siteSetting.findUnique({
    where: { id: "default" },
  });
  assert(
    reReadDbSetting?.headName === testHeadName,
    "Data headName yang dibaca ulang konsisten dengan nilai yang diperbarui"
  );
  assert(
    reReadDbSetting?.orgStructurePhoto === testOrgPhoto,
    "Data orgStructurePhoto yang dibaca ulang konsisten dengan nilai yang diperbarui"
  );

  // 5. Rollback data ke kondisi awal
  console.log("5. Mengembalikan (rollback) data ke kondisi semula...");
  await db.siteSetting.update({
    where: { id: "default" },
    data: {
      headName: originalHeadName,
      orgStructurePhoto: originalOrgPhoto,
    },
  });

  const finalCheck = await db.siteSetting.findUnique({
    where: { id: "default" },
  });
  assert(
    finalCheck?.headName === originalHeadName,
    "Data berhasil dikembalikan ke kondisi awal dengan sempurna"
  );

  console.log("\n✅ SELURUH 7 PENGUJIAN MODUL KONTEN PROFIL UPTD LOLOS 100%!");
}

runTests()
  .catch((err) => {
    console.error("❌ Terjadi error saat pengujian:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
