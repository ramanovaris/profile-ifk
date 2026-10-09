import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

async function generateSnapshot() {
  console.log("📸 Memulai pembuatan snapshot data operasional dari basis data...");

  const dataDir = path.join(process.cwd(), "prisma", "data");
  await fs.mkdir(dataDir, { recursive: true });

  // 1. Ekstraksi Pengaturan Profil Instansi (SiteSetting)
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });
  if (siteSetting) {
    const { updatedAt, ...cleanSetting } = siteSetting;
    await fs.writeFile(
      path.join(dataDir, "site-settings.json"),
      JSON.stringify(cleanSetting, null, 2),
      "utf-8"
    );
    console.log("✅ Snapshot SiteSetting tersimpan.");
  }

  // 2. Ekstraksi Akun Pengguna (User)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });
  const cleanUsers = users.map(({ id, createdAt, updatedAt, ...rest }) => rest);
  await fs.writeFile(
    path.join(dataDir, "users.json"),
    JSON.stringify(cleanUsers, null, 2),
    "utf-8"
  );
  console.log(`✅ Snapshot ${users.length} User tersimpan.`);

  // 3. Ekstraksi Kategori Berita (Category)
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });
  const cleanCategories = categories.map(({ id, createdAt, updatedAt, ...rest }) => rest);
  await fs.writeFile(
    path.join(dataDir, "categories.json"),
    JSON.stringify(cleanCategories, null, 2),
    "utf-8"
  );
  console.log(`✅ Snapshot ${categories.length} Category tersimpan.`);

  // 4. Ekstraksi Artikel Berita (Article) dengan referensi slug kategori & username penulis
  const articles = await prisma.article.findMany({
    include: {
      category: { select: { slug: true } },
      author: { select: { username: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const cleanArticles = articles.map((article) => ({
    title: article.title,
    slug: article.slug,
    content: article.content,
    coverImage: article.coverImage,
    isPublished: article.isPublished,
    publishedAt: article.publishedAt.toISOString(),
    categorySlug: article.category.slug,
    authorUsername: article.author.username,
  }));
  await fs.writeFile(
    path.join(dataDir, "articles.json"),
    JSON.stringify(cleanArticles, null, 2),
    "utf-8"
  );
  console.log(`✅ Snapshot ${articles.length} Article tersimpan.`);

  // 5. Ekstraksi Periode Stok (StockPeriod)
  const stockPeriods = await prisma.stockPeriod.findMany({
    orderBy: { period: "asc" },
  });
  const cleanPeriods = stockPeriods.map(({ id, createdAt, ...rest }) => rest);
  await fs.writeFile(
    path.join(dataDir, "stock-periods.json"),
    JSON.stringify(cleanPeriods, null, 2),
    "utf-8"
  );
  console.log(`✅ Snapshot ${stockPeriods.length} StockPeriod tersimpan.`);

  // 6. Ekstraksi Master Stok Obat (MedicineStock)
  const medicineStocks = await prisma.medicineStock.findMany({
    orderBy: [{ period: "asc" }, { code: "asc" }],
  });
  const cleanStocks = medicineStocks.map(
    ({ id, createdAt, updatedAt, ...rest }) => rest
  );
  await fs.writeFile(
    path.join(dataDir, "medicine-stocks.json"),
    JSON.stringify(cleanStocks, null, 2),
    "utf-8"
  );
  console.log(`✅ Snapshot ${medicineStocks.length} MedicineStock tersimpan.`);

  console.log("🎉 Snapshot data operasional berhasil dibuat di prisma/data/!");
}

generateSnapshot()
  .catch((err) => {
    console.error("❌ Gagal membuat snapshot:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
