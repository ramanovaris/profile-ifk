import { PrismaClient, Role, UserStatus, CategoryStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.INITIAL_ADMIN_USERNAME || "admin";
  const password = process.env.INITIAL_ADMIN_PASSWORD || "AdminIFK2026!";
  const name = process.env.INITIAL_ADMIN_NAME || "Administrator IFK Kotabaru";

  console.log(`[Seed] Inisialisasi akun Super Admin: '${username}'...`);

  // 1. Akun Super Admin Pertama
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`[Seed] Akun Super Admin '${username}' berhasil dibuat.`);
  } else {
    console.log(`[Seed] Akun Super Admin '${username}' sudah ada.`);
  }

  // 2. Kategori Berita Default
  const defaultCategories = [
    { name: "Kegiatan", slug: "kegiatan" },
    { name: "Informasi", slug: "informasi" },
    { name: "Sosialisasi", slug: "sosialisasi" },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        status: CategoryStatus.ACTIVE,
      },
    });
  }
  console.log(`[Seed] Kategori berita awal berhasil disinkronkan.`);

  // 3. Konfigurasi Situs Default (SiteSetting)
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "UPTD Instalasi Farmasi Kab. Kotabaru",
      shortName: "IFK Kotabaru",
      address: "Jl. Kenanga Desa Dirgahayu, Kotabaru 72116. Telp/Fax (0518) 21603",
      phone: "(0518) 21603",
      email: "instalasifarmasi4@gmail.com",
      whatsappLink: "https://wa.me/6281234567890",
      googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.402205111195!2d116.22363550000001!3d-3.2497904999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2def302cb3e8dcff%3A0xb7c86d7dc7737d8c!2sInstalasi%20Farmasi!5e0!3m2!1sen!2sid!4v1788250580948!5m2!1sen!2sid",
      operationalHours: "Senin - Kamis: 08.00 - 16.30 WITA\nJumat: 08.00 - 11.00 WITA",
      sp4nLaporUrl: "https://www.lapor.go.id",
      motto: "Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat",
      tagline: "Stok Valid, Team Solid",
    },
  });
  console.log(`[Seed] Konfigurasi profil instansi default berhasil disinkronkan.`);
}

main()
  .catch((e) => {
    console.error("[Seed] Terjadi kesalahan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
