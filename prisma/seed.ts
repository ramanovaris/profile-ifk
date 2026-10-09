import { PrismaClient, Prisma, Role, UserStatus, CategoryStatus, StockStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function loadJsonSnapshot<T>(fileName: string): T | null {
  try {
    const filePath = path.join(__dirname, "data", fileName);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err) {
    console.warn(`[Seed] Peringatan: Gagal memuat snapshot ${fileName}:`, err);
    return null;
  }
}

async function main() {
  console.log("🌱 Memulai proses seeding data operasional idempoten...");

  // 1. Sinkronisasi Pengaturan Profil Instansi (SiteSetting)
  const siteSettingData = loadJsonSnapshot<Record<string, unknown>>("site-settings.json");
  if (siteSettingData) {
    const { id: _ignoredId, ...settingFields } = siteSettingData;
    await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: settingFields as Prisma.SiteSettingUpdateInput,
      create: { id: "default", ...(settingFields as Prisma.SiteSettingCreateInput) },
    });
    console.log("✅ SiteSetting berhasil disinkronkan dari snapshot.");
  }

  // 2. Sinkronisasi Akun Pengguna (User)
  const usersSnapshot = loadJsonSnapshot<
    Array<{
      username: string;
      password: string;
      name: string;
      email?: string | null;
      avatar?: string | null;
      role: Role;
      status: UserStatus;
    }>
  >("users.json");

  const userMap: Record<string, string> = {};

  if (usersSnapshot && usersSnapshot.length > 0) {
    for (const u of usersSnapshot) {
      const user = await prisma.user.upsert({
        where: { username: u.username },
        update: {
          name: u.name,
          email: u.email ?? null,
          avatar: u.avatar ?? null,
          role: u.role,
          status: u.status,
        },
        create: {
          username: u.username,
          password: u.password,
          name: u.name,
          email: u.email ?? null,
          avatar: u.avatar ?? null,
          role: u.role,
          status: u.status,
        },
      });
      userMap[u.username] = user.id;
    }
    console.log(`✅ ${usersSnapshot.length} Akun pengguna berhasil disinkronkan.`);
  } else {
    // Fallback minimal jika berkas snapshot tidak ditemukan
    const fallbackPassword = await bcrypt.hash("AdminIFK2026!", 10);
    const admin = await prisma.user.upsert({
      where: { username: "admin" },
      update: {},
      create: {
        username: "admin",
        password: fallbackPassword,
        name: "Administrator IFK Kotabaru",
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    userMap["admin"] = admin.id;
  }

  // 3. Sinkronisasi Kategori Berita (Category)
  const categoriesSnapshot = loadJsonSnapshot<
    Array<{
      name: string;
      slug: string;
      status: CategoryStatus;
    }>
  >("categories.json");

  const categoryMap: Record<string, string> = {};

  if (categoriesSnapshot && categoriesSnapshot.length > 0) {
    for (const cat of categoriesSnapshot) {
      const record = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          status: cat.status,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          status: cat.status,
        },
      });
      categoryMap[cat.slug] = record.id;
    }
    console.log(`✅ ${categoriesSnapshot.length} Kategori berita berhasil disinkronkan.`);
  }

  // 4. Sinkronisasi Artikel Berita (Article)
  const articlesSnapshot = loadJsonSnapshot<
    Array<{
      title: string;
      slug: string;
      content: string;
      coverImage?: string | null;
      isPublished: boolean;
      publishedAt: string;
      categorySlug: string;
      authorUsername: string;
    }>
  >("articles.json");

  if (articlesSnapshot && articlesSnapshot.length > 0) {
    const fallbackUserId = Object.values(userMap)[0];
    const fallbackCategoryId = Object.values(categoryMap)[0];

    for (const a of articlesSnapshot) {
      const categoryId = categoryMap[a.categorySlug] || fallbackCategoryId;
      const authorId = userMap[a.authorUsername] || fallbackUserId;

      if (!categoryId || !authorId) {
        continue;
      }

      await prisma.article.upsert({
        where: { slug: a.slug },
        update: {
          title: a.title,
          content: a.content,
          coverImage: a.coverImage ?? null,
          isPublished: a.isPublished,
          publishedAt: new Date(a.publishedAt),
          categoryId,
          authorId,
        },
        create: {
          title: a.title,
          slug: a.slug,
          content: a.content,
          coverImage: a.coverImage ?? null,
          isPublished: a.isPublished,
          publishedAt: new Date(a.publishedAt),
          categoryId,
          authorId,
        },
      });
    }
    console.log(`✅ ${articlesSnapshot.length} Artikel berita berhasil disinkronkan.`);
  }

  // 5. Sinkronisasi Periode Stok (StockPeriod)
  const periodsSnapshot = loadJsonSnapshot<Array<{ period: string }>>("stock-periods.json");
  if (periodsSnapshot && periodsSnapshot.length > 0) {
    for (const p of periodsSnapshot) {
      await prisma.stockPeriod.upsert({
        where: { period: p.period },
        update: {},
        create: { period: p.period },
      });
    }
    console.log(`✅ ${periodsSnapshot.length} Periode stok berhasil disinkronkan.`);
  }

  // 6. Sinkronisasi Master Stok Obat Aktual (MedicineStock)
  const stocksSnapshot = loadJsonSnapshot<
    Array<{
      period: string;
      code: string;
      name: string;
      category: string;
      unit: string;
      quantity: number;
      status: StockStatus;
      avgUsage?: number | null;
      mos?: number | null;
      expiryDate?: string | null;
      nomenklatur?: string | null;
      source?: string | null;
    }>
  >("medicine-stocks.json");

  if (stocksSnapshot && stocksSnapshot.length > 0) {
    console.log(`📦 Menyinkronkan ${stocksSnapshot.length} item stok obat aktual...`);
    const chunkSize = 50;
    for (let i = 0; i < stocksSnapshot.length; i += chunkSize) {
      const chunk = stocksSnapshot.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((item) =>
          prisma.medicineStock.upsert({
            where: {
              period_code: {
                period: item.period,
                code: item.code,
              },
            },
            update: {
              name: item.name,
              category: item.category,
              unit: item.unit,
              quantity: item.quantity,
              status: item.status,
              avgUsage: item.avgUsage ?? 0,
              mos: item.mos ?? null,
              expiryDate: item.expiryDate ?? null,
              nomenklatur: item.nomenklatur ?? null,
              source: item.source ?? "MANUAL",
            },
            create: {
              period: item.period,
              code: item.code,
              name: item.name,
              category: item.category,
              unit: item.unit,
              quantity: item.quantity,
              status: item.status,
              avgUsage: item.avgUsage ?? 0,
              mos: item.mos ?? null,
              expiryDate: item.expiryDate ?? null,
              nomenklatur: item.nomenklatur ?? null,
              source: item.source ?? "MANUAL",
            },
          })
        )
      );
    }
    console.log(`✅ ${stocksSnapshot.length} Stok obat berhasil disinkronkan.`);
  }

  console.log("🎉 Seeding data operasional idempoten selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("[Seed] Terjadi galat saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
