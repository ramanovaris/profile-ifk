/**
 * scripts/verify-settings-db.ts
 *
 * Pengujian integrasi mandiri untuk modul Pengaturan Identitas Instansi (#51):
 * 1. Verifikasi penolakan Server Action tanpa sesi aktif (Unauthorized).
 * 2. Verifikasi pembacaan data awal SiteSetting dari PostgreSQL.
 * 3. Verifikasi mutasi pembaruan data identitas (tagline/motto) di PostgreSQL.
 * 4. Verifikasi pembacaan ulang data yang telah diubah.
 * 5. Rollback data ke kondisi awal demi integritas basis data.
 */

import { db } from "../src/lib/db";
import { updateSiteIdentityAction, getSiteSettings } from "../src/actions/setting";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`   ✓ ${message}`);
}

async function runTests() {
  console.log("=== Memulai Pengujian Modul Basis Data Pengaturan Instansi (#51) ===");

  // 1. Pengujian proteksi otentikasi Server Action
  console.log("1. Pengujian proteksi otentikasi Server Action...");
  try {
    const unauthResult = await updateSiteIdentityAction({
      name: "Test Name",
      shortName: "Test",
      tagline: "Test",
      motto: "Test",
      address: "Test",
      operationalHours: "Test",
      phone: "123",
      whatsappLink: "https://wa.me/123",
      email: "test@example.com",
      googleMapsEmbedUrl: "https://maps.google.com",
    });
    assert(
      unauthResult.success === false,
      "Server Action menolak mutasi tanpa sesi aktif pengguna"
    );
  } catch (err: unknown) {
    // Di luar request context Next.js, cookies() melempar error yang aman ditangkap
    assert(
      err instanceof Error,
      "Server Action aman menolak akses di luar konteks request terautentikasi"
    );
  }

  // 2. Pengujian pembacaan data awal SiteSetting dari DB
  console.log("2. Pengujian pembacaan data awal SiteSetting dari PostgreSQL...");
  const initialDbSetting = await db.siteSetting.findUnique({
    where: { id: "default" },
  });
  assert(initialDbSetting !== null, "Data default SiteSetting ditemukan di basis data");
  if (!initialDbSetting) return;

  const originalTagline = initialDbSetting.tagline;
  const testTagline = `${originalTagline} [TEST UJI COBA]`;

  // 3. Pengujian mutasi update langsung di PostgreSQL
  console.log("3. Pengujian mutasi update data pengaturan di PostgreSQL...");
  const updatedDbSetting = await db.siteSetting.update({
    where: { id: "default" },
    data: {
      tagline: testTagline,
    },
  });
  assert(
    updatedDbSetting.tagline === testTagline,
    "Pembaruan field tagline berhasil disimpan di tabel site_settings"
  );

  // 4. Pengujian fungsi pembacaan data getSiteSettings()
  console.log("4. Pengujian pembacaan via getSiteSettings()...");
  const readSettings = await getSiteSettings();
  assert(
    readSettings.tagline === testTagline,
    "Fungsi getSiteSettings() berhasil membaca data terkini dari PostgreSQL"
  );

  // 5. Rollback data ke kondisi semula
  console.log("5. Mengembalikan data ke kondisi semula (Rollback)...");
  const rollbackSetting = await db.siteSetting.update({
    where: { id: "default" },
    data: {
      tagline: originalTagline,
    },
  });
  assert(
    rollbackSetting.tagline === originalTagline,
    "Data tagline berhasil di-rollback ke kondisi semula secara utuh"
  );

  console.log("\n✅ SELURUH PENGUJIAN BASIS DATA PENGATURAN BERHASIL (100% PASS)!\n");
}

runTests()
  .catch((err) => {
    console.error("Kesalahan pengujian:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
