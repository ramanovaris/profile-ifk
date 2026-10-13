import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import * as assert from "assert";

const prisma = new PrismaClient();

async function getStats() {
  const [users, categories, articles, periods, stocks, setting] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.article.count(),
      prisma.stockPeriod.count(),
      prisma.medicineStock.count(),
      prisma.siteSetting.findUnique({ where: { id: "default" } }),
    ]);

  return { users, categories, articles, periods, stocks, setting };
}

async function runVerification() {
  console.log("🧪 Memulai Verifikasi Idempotensi & Integritas Seeder...");

  // 1. Ambil kondisi awal
  console.log("📊 1. Mengambil data awal sebelum siklus seeder kedua...");
  const initial = await getStats();
  console.log("Data awal:", {
    users: initial.users,
    categories: initial.categories,
    articles: initial.articles,
    periods: initial.periods,
    stocks: initial.stocks,
    headName: initial.setting?.headName,
  });

  // 2. Jalankan seeder putaran pertama
  console.log("\n🔄 2. Menjalankan seeder putaran 1...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  const round1 = await getStats();

  // 3. Jalankan seeder putaran kedua (Uji Idempotensi)
  console.log("\n🔄 3. Menjalankan seeder putaran 2 (Uji Idempotensi)...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  const round2 = await getStats();

  console.log("\n🔍 4. Memverifikasi konsistensi & integritas data...");

  // Asersi jumlah baris tidak berubah (idempoten 100%)
  assert.strictEqual(
    round2.users,
    round1.users,
    `Jumlah pengguna berubah! Putaran 1: ${round1.users}, Putaran 2: ${round2.users}`
  );
  assert.strictEqual(
    round2.categories,
    round1.categories,
    `Jumlah kategori berubah! Putaran 1: ${round1.categories}, Putaran 2: ${round2.categories}`
  );
  assert.strictEqual(
    round2.articles,
    round1.articles,
    `Jumlah artikel berubah! Putaran 1: ${round1.articles}, Putaran 2: ${round2.articles}`
  );
  assert.strictEqual(
    round2.periods,
    round1.periods,
    `Jumlah periode berubah! Putaran 1: ${round1.periods}, Putaran 2: ${round2.periods}`
  );
  assert.strictEqual(
    round2.stocks,
    round1.stocks,
    `Jumlah stok obat berubah! Putaran 1: ${round1.stocks}, Putaran 2: ${round2.stocks}`
  );

  // Asersi kecocokan data snapshot
  assert.strictEqual(round2.users, 4, "Harus terdapat tepat 4 pengguna operasional.");
  assert.strictEqual(round2.categories, 3, "Harus terdapat tepat 3 kategori.");
  assert.strictEqual(round2.articles, 8, "Harus terdapat tepat 8 artikel.");
  assert.strictEqual(round2.periods, 2, "Harus terdapat tepat 2 periode stok.");
  assert.strictEqual(round2.stocks, 269, "Harus terdapat tepat 269 item stok obat aktual.");
  assert.strictEqual(
    round2.setting?.headName,
    "Zainal Abidin, S.Farm., Apt",
    "Nama Kepala UPTD harus sesuai profil aktual."
  );

  console.log("\n✨ Seluruh asersi berhasil dilewati!");
  console.log("=========================================");
  console.log("✅ Seeder 100% Idempoten (aman dijalankan berulang)");
  console.log("✅ Data operasional riil (269 obat, profil, berita) terjaga utuh");
  console.log("=========================================\n");
}

runVerification()
  .catch((err) => {
    console.error("❌ Verifikasi gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
