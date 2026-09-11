import { PrismaClient, Role, UserStatus, CategoryStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.INITIAL_ADMIN_USERNAME || "admin";
  const password = process.env.INITIAL_ADMIN_PASSWORD || "AdminIFK2026!";
  const name = process.env.INITIAL_ADMIN_NAME || "Administrator IFK Kotabaru";

  console.log(`[Seed] Inisialisasi akun Super Admin: '${username}'...`);

  // 1. Akun Super Admin Pertama
  let superAdmin = await prisma.user.findUnique({
    where: { username },
  });

  if (!superAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    superAdmin = await prisma.user.create({
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

  // 1b. Akun Staf Operasional Awal
  const defaultStaff = [
    {
      username: "staff1",
      password: "StaffIFK2026!",
      name: "Siti Nurhaliza, S.Farm",
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
    },
    {
      username: "staff2",
      password: "StaffIFK2026!",
      name: "Ahmad Rizky, S.Farm",
      role: Role.STAFF,
      status: UserStatus.ACTIVE,
    },
  ];

  for (const staff of defaultStaff) {
    const existing = await prisma.user.findUnique({
      where: { username: staff.username },
    });
    if (!existing) {
      const hashedStaffPassword = await bcrypt.hash(staff.password, 10);
      await prisma.user.create({
        data: {
          username: staff.username,
          password: hashedStaffPassword,
          name: staff.name,
          role: staff.role,
          status: staff.status,
        },
      });
      console.log(`[Seed] Akun Staf '${staff.username}' berhasil dibuat.`);
    } else {
      console.log(`[Seed] Akun Staf '${staff.username}' sudah ada.`);
    }
  }

  // 2. Kategori Berita Default
  const defaultCategories = [
    { name: "Kegiatan", slug: "kegiatan" },
    { name: "Informasi", slug: "informasi" },
    { name: "Sosialisasi", slug: "sosialisasi" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of defaultCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        status: CategoryStatus.ACTIVE,
      },
    });
    categoryMap[cat.name] = record.id;
  }
  console.log(`[Seed] Kategori berita awal berhasil disinkronkan.`);

  // 3. Artikel Berita Awal (Idempoten)
  const defaultArticles = [
    {
      title: "Sosialisasi Penggunaan Sistem Informasi Kefarmasian",
      slug: "sosialisasi-sistem-informasi-kefarmasian",
      categoryName: "Kegiatan",
      content:
        "<p>UPTD Instalasi Farmasi Kab. Kotabaru mengadakan sosialisasi penggunaan sistem informasi kefarmasian kepada seluruh faskes binaan di wilayah Kabupaten Kotabaru.</p><p>Kegiatan ini bertujuan untuk memastikan setiap faskes dapat menggunakan sistem dengan baik dalam pengelolaan distribusi dan pemantauan stok obat. Para peserta mendapatkan penjelasan lengkap mulai dari cara login, input data stok, hingga laporan penggunaan obat.</p><p>Selain itu, sosialisasi ini juga menjadi wadah untuk menampung masukan dan kendala yang dihadapi oleh para apoteker faskes dalam penggunaan sistem informasi kefarmasian.</p>",
      coverImage: "https://picsum.photos/seed/kegiatan-1/1200/630",
      isPublished: true,
      publishedAt: new Date("2025-01-15T08:00:00.000Z"),
    },
    {
      title: "Evaluasi Kegiatan Distribusi Obat Triwulan IV 2024",
      slug: "evaluasi-distribusi-obat-triwulan-iv-2024",
      categoryName: "Kegiatan",
      content:
        "<p>UPTD Instalasi Farmasi Kab. Kotabaru melaksanakan evaluasi kegiatan distribusi obat untuk triwulan IV tahun 2024.</p><p>Evaluasi ini mencakup analisis ketersediaan obat di seluruh faskes binaan, tingkat pemenuhan permintaan, serta efektivitas proses distribusi yang telah dilaksanakan selama periode tersebut.</p><p>Hasil evaluasi menunjukkan bahwa tingkat pemenuhan permintaan obat mencapai 95%, dengan beberapa catatan perbaikan untuk obat-obatan yang mengalami keterlambatan pengadaan dari pemasok.</p>",
      coverImage: "https://picsum.photos/seed/kegiatan-2/1200/630",
      isPublished: true,
      publishedAt: new Date("2025-01-20T09:00:00.000Z"),
    },
    {
      title: "Pengumuman Jadwal Pelayanan Selama Libur Nasional",
      slug: "pengumuman-jadwal-pelayanan-libur-nasional",
      categoryName: "Informasi",
      content:
        "<p>Berdasarkan surat edaran dari pimpinan, UPTD Instalasi Farmasi Kab. Kotabaru menginformasikan jadwal pelayanan selama masa libur nasional.</p><p>Selama libur nasional, pelayanan distribusi obat akan dititipkan pada jadwal pengajuan sebelum masa libur. Faskes binaan diimbau untuk mengajuan permintaan obat paling lambat H-7 sebelum hari libur nasional dimulai.</p><p>Pelayanan normal akan kembali beroperasi sesuai jam kerja yang berlaku setelah masa libur nasional berakhir.</p>",
      coverImage: "https://picsum.photos/seed/informasi-1/1200/630",
      isPublished: true,
      publishedAt: new Date("2025-02-01T08:00:00.000Z"),
    },
    {
      title: "Daftar Obat yang Diperbarui di Sistem e-Formularium",
      slug: "daftar-obat-pembaruan-e-formularium",
      categoryName: "Informasi",
      content:
        "<p>Telah terjadi pembaruan daftar obat dalam sistem e-Formularium Nasional yang berlaku efektif bulan Februari 2025.</p><p>Beberapa obat yang mengalami perubahan meliputi penambahan obat generik baru, penghapusan obat yang sudah tidak diproduksi, serta penyesuaian harga obat berdasarkan keputusan terbaru dari Kementerian Kesehatan.</p><p>Faskes binaan diimbau untuk memperbarui referensi formularium di masing-masing institusi agar sesuai dengan daftar terbaru yang berlaku.</p>",
      coverImage: "https://picsum.photos/seed/informasi-2/1200/630",
      isPublished: true,
      publishedAt: new Date("2025-02-10T10:00:00.000Z"),
    },
    {
      title: "Pelibatan Masyarakat dalam Pengawasan Obat dan Makanan",
      slug: "pelibatan-masyarakat-pengawasan-obat",
      categoryName: "Sosialisasi",
      content:
        "<p>UPTD Instalasi Farmasi Kab. Kotabaru mengadakan kegiatan sosialisasi pelibatan masyarakat dalam pengawasan obat dan makanan di wilayah Kabupaten Kotabaru.</p><p>Kegiatan ini bertujuan untuk meningkatkan kesadaran masyarakat tentang pentingnya menggunakan obat yang aman, berkhasiat, dan berkualitas. Masyarakat diedukasi untuk mengenali obat-obatan yang tidak memiliki izin edar dari BPOM.</p><p>Sosialisasi dilakukan melalui pertemuan langsung dengan warga di beberapa kecamatan, serta penyebaran brosur dan materi edukasi tentang penggunaan obat yang bijak.</p>",
      coverImage: "https://picsum.photos/seed/sosialisasi-1/1200/630",
      isPublished: true,
      publishedAt: new Date("2025-02-15T08:00:00.000Z"),
    },
    {
      title: "Kampanye Penggunaan Antibiotik yang Bijak",
      slug: "kampanye-penggunaan-antibiotik-bijak",
      categoryName: "Sosialisasi",
      content:
        '<p>Dalam rangka meningkatkan pemahaman masyarakat tentang penggunaan antibiotik yang tepat, UPTD Instalasi Farmasi Kab. Kotabaru menggelar kampanye penggunaan antibiotik yang bijak.</p><p>Kampanye ini menekankan pentingnya tidak menggunakan antibiotik tanpa resep dokter, serta bahaya resistensi antibiotik yang dapat mengancam kesehatan masyarakat secara luas.</p><p>Pesan utama kampanye: "Gunakan Antibiotik Sesuai Resep Dokter, Selamatkan Masa Depan Kesehatan Kita." Kegiatan ini mendapat sambutan positif dari masyarakat dan tenaga kesehatan di Kabupaten Kotabaru.</p>',
      coverImage: "https://picsum.photos/seed/sosialisasi-2/1200/630",
      isPublished: false,
      publishedAt: new Date("2025-02-20T08:00:00.000Z"),
    },
  ];

  for (const article of defaultArticles) {
    const categoryId = categoryMap[article.categoryName];
    if (!categoryId) continue;

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        coverImage: article.coverImage,
        isPublished: article.isPublished,
        publishedAt: article.publishedAt,
        categoryId,
      },
      create: {
        title: article.title,
        slug: article.slug,
        content: article.content,
        coverImage: article.coverImage,
        isPublished: article.isPublished,
        publishedAt: article.publishedAt,
        categoryId,
        authorId: superAdmin.id,
      },
    });
  }
  console.log(`[Seed] Data awal ${defaultArticles.length} artikel berita berhasil disinkronkan.`);

  // 4. Konfigurasi Situs Default (SiteSetting)
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
      googleMapsEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.402205111195!2d116.22363550000001!3d-3.2497904999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2def302cb3e8dcff%3A0xb7c86d7dc7737d8c!2sInstalasi%20Farmasi!5e0!3m2!1sen!2sid!4v1788250580948!5m2!1sen!2sid",
      operationalHours: "Senin - Kamis: 08.00 - 16.30 WITA\nJumat: 08.00 - 11.00 WITA",
      sp4nLaporUrl: "https://www.lapor.go.id",
      motto: "Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat",
      tagline: "Stok Valid, Team Solid",
      headName: "apt. H. Muhammad Yusuf, S.Farm",
      headRole: "Kepala UPTD Instalasi Farmasi Kab. Kotabaru",
      headPhoto: null,
      greeting:
        "Assalamualaikum Warahmatullahi Wabarakatuh.\n\nPuji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga UPTD Instalasi Farmasi Kabupaten Kotabaru dapat terus memberikan pelayanan terbaik di bidang kefarmasian bagi masyarakat Kabupaten Kotabaru.\n\nKami berkomitmen untuk terus meningkatkan kualitas distribusi obat dan farmasi, menjaga mutu pelayanan, serta memastikan ketersediaan obat yang aman, berkhasiat, dan berkualitas di seluruh fasilitas kesehatan binaan.\n\nSemoga website ini dapat menjadi sarana informasi yang bermanfaat bagi seluruh masyarakat.\n\nWassalamualaikum Warahmatullahi Wabarakatuh.",
      vision:
        "Terwujudnya Pelayanan Kefarmasian yang Bermutu, Merata, dan Terjangkau Menuju Masyarakat Kabupaten Kotabaru yang Sehat dan Mandiri.",
      mission:
        "1. Menjamin ketersediaan, pemerataan, dan keterjangkauan obat dan perbekalan kesehatan di seluruh fasilitas kesehatan binaan.\n2. Meningkatkan mutu pengelolaan dan pengawasan obat secara transparan dan akuntabel.\n3. Mengembangkan kapasitas sumber daya manusia dan pemanfaatan teknologi informasi dalam pengelolaan kefarmasian.\n4. Mendorong pemberdayaan masyarakat dalam penggunaan obat yang rasional dan bijak.",
      tupoksi:
        "UPTD Instalasi Farmasi mempunyai tugas melaksanakan kegiatan teknis operasional dinas dalam pengelolaan obat, alat kesehatan, dan perbekalan kesehatan lainnya yang meliputi perencanaan kebutuhan, penerimaan, penyimpanan, pemeliharaan, pendistribusian, pemantauan, serta evaluasi.",
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
