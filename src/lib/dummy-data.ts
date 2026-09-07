import { placeholderImage } from "./placeholder";

// ── Types & Constants ────────────────────────────────────────────────────────

export const ARTICLE_CATEGORIES = ["Kegiatan", "Informasi", "Sosialisasi"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export type Article = {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  content: string; // HTML string
  coverImage: string;
  isPublished: boolean;
  authorId: string;
  authorName: string;
  publishedAt: string; // ISO date string
};

export type User = {
  id: string;
  username: string;
  name: string;
  role: "SUPER_ADMIN" | "STAFF";
  createdAt: string;
};

export type SiteConfig = {
  name: string;
  shortName: string;
  address: string;
  phone: string;
  email: string;
  whatsappLink: string;
  googleMapsEmbedUrl: string;
  operationalHours: string;
  sp4nLaporUrl: string;
  motto: string;
  tagline: string;
};

// ── Site Config ───────────────────────────────────────────────────────────────

export const siteConfig: SiteConfig = {
  name: "UPTD Instalasi Farmasi Kab. Kotabaru",
  shortName: "IFK Kotabaru",
  address:
    "Jl. Kenanga Desa Dirgahayu, Kotabaru 72116. Telp/Fax (0518) 21603",
  phone: "(0518) 21603",
  email: "instalasifarmasi4@gmail.com",
  whatsappLink: "https://wa.me/6281234567890",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.402205111195!2d116.22363550000001!3d-3.2497904999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2def302cb3e8dcff%3A0xb7c86d7dc7737d8c!2sInstalasi%20Farmasi!5e0!3m2!1sen!2sid!4v1788250580948!5m2!1sen!2sid",
  operationalHours:
    "Senin - Kamis: 08.00 - 16.30 WITA\nJumat: 08.00 - 11.00 WITA",
  sp4nLaporUrl: "https://www.lapor.go.id",
  motto:
    "Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat",
  tagline: "Stok Valid, Team Solid",
};

// ── Dummy Users ───────────────────────────────────────────────────────────────

export const dummyUsers: User[] = [
  {
    id: "usr-1",
    username: "admin",
    name: "Administrator",
    role: "SUPER_ADMIN",
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "usr-2",
    username: "staff1",
    name: "Siti Nurhaliza, S.Farm",
    role: "STAFF",
    createdAt: "2024-03-10T08:00:00.000Z",
  },
  {
    id: "usr-3",
    username: "staff2",
    name: "Ahmad Rizky, S.Farm",
    role: "STAFF",
    createdAt: "2024-06-01T08:00:00.000Z",
  },
];

// ── Dummy Articles ────────────────────────────────────────────────────────────

export const dummyArticles: Article[] = [
  {
    id: "art-1",
    title: "Sosialisasi Penggunaan Sistem Informasi Kefarmasian",
    slug: "sosialisasi-sistem-informasi-kefarmasian",
    category: "Kegiatan",
    content: `
      <p>UPTD Instalasi Farmasi Kab. Kotabaru mengadakan sosialisasi penggunaan sistem informasi kefarmasian kepada seluruh faskes binaan di wilayah Kabupaten Kotabaru.</p>
      <p>Kegiatan ini bertujuan untuk memastikan setiap faskes dapat menggunakan sistem dengan baik dalam pengelolaan distribusi dan pemantauan stok obat. Para peserta mendapatkan penjelasan lengkap mulai dari cara login, input data stok, hingga laporan penggunaan obat.</p>
      <p>Selain itu, sosialisasi ini juga menjadi wadah untuk menampung masukan dan kendala yang dihadapi oleh para apoteker faskes dalam penggunaan sistem informasi kefarmasian.</p>
    `,
    coverImage: placeholderImage(1200, 630, "Sosialisasi Sistem Informasi Kefarmasian", "Kegiatan"),
    isPublished: true,
    authorId: "usr-1",
    authorName: "Administrator",
    publishedAt: "2025-01-15T08:00:00.000Z",
  },
  {
    id: "art-2",
    title: "Evaluasi Kegiatan Distribusi Obat Triwulan IV 2024",
    slug: "evaluasi-distribusi-obat-triwulan-iv-2024",
    category: "Kegiatan",
    content: `
      <p>UPTD Instalasi Farmasi Kab. Kotabaru melaksanakan evaluasi kegiatan distribusi obat untuk triwulan IV tahun 2024.</p>
      <p>Evaluasi ini mencakup analisis ketersediaan obat di seluruh faskes binaan, tingkat pemenuhan permintaan, serta efektivitas proses distribusi yang telah dilaksanakan selama periode tersebut.</p>
      <p>Hasil evaluasi menunjukkan bahwa tingkat pemenuhan permintaan obat mencapai 95%, dengan beberapa catatan perbaikan untuk obat-obatan yang mengalami keterlambatan pengadaan dari pemasok.</p>
    `,
    coverImage: placeholderImage(1200, 630, "Evaluasi Distribusi Obat Triwulan IV", "Kegiatan"),
    isPublished: true,
    authorId: "usr-2",
    authorName: "Siti Nurhaliza, S.Farm",
    publishedAt: "2025-01-20T09:00:00.000Z",
  },
  {
    id: "art-3",
    title: "Pengumuman Jadwal Pelayanan Selama Libur Nasional",
    slug: "pengumuman-jadwal-pelayanan-libur-nasional",
    category: "Informasi",
    content: `
      <p>Berdasarkan surat edaran dari pimpinan, UPTD Instalasi Farmasi Kab. Kotabaru menginformasikan jadwal pelayanan selama masa libur nasional.</p>
      <p>Selama libur nasional, pelayanan distribusi obat akan dititipkan pada jadwal pengajuan sebelum masa libur. Faskes binaan diimbau untuk mengajuan permintaan obat paling lambat H-7 sebelum hari libur nasional dimulai.</p>
      <p>Pelayanan normal akan kembali beroperasi sesuai jam kerja yang berlaku setelah masa libur nasional berakhir.</p>
    `,
    coverImage: placeholderImage(1200, 630, "Jadwal Pelayanan Libur Nasional", "Informasi"),
    isPublished: true,
    authorId: "usr-1",
    authorName: "Administrator",
    publishedAt: "2025-02-01T08:00:00.000Z",
  },
  {
    id: "art-4",
    title: "Daftar Obat yang Diperbarui di Sistem e-Formularium",
    slug: "daftar-obat-pembaruan-e-formularium",
    category: "Informasi",
    content: `
      <p>Telah terjadi pembaruan daftar obat dalam sistem e-Formularium Nasional yang berlaku efektif bulan Februari 2025.</p>
      <p>Beberapa obat yang mengalami perubahan meliputi penambahan obat generik baru, penghapusan obat yang sudah tidak diproduksi, serta penyesuaian harga obat berdasarkan keputusan terbaru dari Kementerian Kesehatan.</p>
      <p>Faskes binaan diimbau untuk memperbarui referensi formularium di masing-masing institusi agar sesuai dengan daftar terbaru yang berlaku.</p>
    `,
    coverImage: placeholderImage(1200, 630, "Pembaruan e-Formularium Nasional", "Informasi"),
    isPublished: true,
    authorId: "usr-2",
    authorName: "Siti Nurhaliza, S.Farm",
    publishedAt: "2025-02-10T10:00:00.000Z",
  },
  {
    id: "art-5",
    title: "Pelibatan Masyarakat dalam Pengawasan Obat dan Makanan",
    slug: "pelibatan-masyarakat-pengawasan-obat",
    category: "Sosialisasi",
    content: `
      <p>UPTD Instalasi Farmasi Kab. Kotabaru mengadakan kegiatan sosialisasi pelibatan masyarakat dalam pengawasan obat dan makanan di wilayah Kabupaten Kotabaru.</p>
      <p>Kegiatan ini bertujuan untuk meningkatkan kesadaran masyarakat tentang pentingnya menggunakan obat yang aman, berkhasiat, dan berkualitas. Masyarakat diedukasi untuk mengenali obat-obatan yang tidak memiliki izin edar dari BPOM.</p>
      <p>Sosialisasi dilakukan melalui pertemuan langsung dengan warga di beberapa kecamatan, serta penyebaran brosur dan materi edukasi tentang penggunaan obat yang bijak.</p>
    `,
    coverImage: placeholderImage(1200, 630, "Pelibatan Masyarakat Pengawasan Obat", "Sosialisasi"),
    isPublished: true,
    authorId: "usr-3",
    authorName: "Ahmad Rizky, S.Farm",
    publishedAt: "2025-02-15T08:00:00.000Z",
  },
  {
    id: "art-6",
    title: "Kampanye Penggunaan Antibiotik yang Bijak",
    slug: "kampanye-penggunaan-antibiotik-bijak",
    category: "Sosialisasi",
    content: `
      <p>Dalam rangka meningkatkan pemahaman masyarakat tentang penggunaan antibiotik yang tepat, UPTD Instalasi Farmasi Kab. Kotabaru menggelar kampanye penggunaan antibiotik yang bijak.</p>
      <p>Kampanye ini menekankan pentingnya tidak menggunakan antibiotik tanpa resep dokter, serta bahaya resistensi antibiotik yang dapat mengancam kesehatan masyarakat secara luas.</p>
      <p>Pesan utama kampanye: "Gunakan Antibiotik Sesuai Resep Dokter, Selamatkan Masa Depan Kesehatan Kita." Kegiatan ini mendapat sambutan positif dari masyarakat dan tenaga kesehatan di Kabupaten Kotabaru.</p>
    `,
    coverImage: placeholderImage(1200, 630, "Kampanye Antibiotik Bijak", "Sosialisasi"),
    isPublished: false,
    authorId: "usr-1",
    authorName: "Administrator",
    publishedAt: "2025-02-20T08:00:00.000Z",
  },
];

// ── Dummy Stats ───────────────────────────────────────────────────────────────

export const dummyStats = {
  totalArticles: dummyArticles.length,
  published: dummyArticles.filter((a) => a.isPublished).length,
  draft: dummyArticles.filter((a) => !a.isPublished).length,
  totalUsers: dummyUsers.length,
};
