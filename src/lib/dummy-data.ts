import { placeholderImage } from "./placeholder";

// ── Types & Constants ────────────────────────────────────────────────────────

export const ARTICLE_CATEGORIES = ["Kegiatan", "Informasi", "Sosialisasi"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

// Simulasi data master kategori dengan status aktif/non-aktif
export type CategoryStatus = "ACTIVE" | "INACTIVE";

export type Category = {
  id: string;
  name: ArticleCategory;
  slug: string;
  status: CategoryStatus;
};

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Kegiatan", slug: "kegiatan", status: "ACTIVE" },
  { id: "cat-2", name: "Informasi", slug: "informasi", status: "ACTIVE" },
  { id: "cat-3", name: "Sosialisasi", slug: "sosialisasi", status: "ACTIVE" },
];

export function getArticleCountByCategory(categoryName: ArticleCategory, articles: Article[]): number {
  return articles.filter((a) => a.category === categoryName).length;
}

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
  status: "ACTIVE" | "INACTIVE";
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
    status: "ACTIVE",
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "usr-2",
    username: "staff1",
    name: "Siti Nurhaliza, S.Farm",
    role: "STAFF",
    status: "ACTIVE",
    createdAt: "2024-03-10T08:00:00.000Z",
  },
  {
    id: "usr-3",
    username: "staff2",
    name: "Ahmad Rizky, S.Farm",
    role: "STAFF",
    status: "ACTIVE",
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

// ── Types & Constants: Medicine Stock ──────────────────────────────────────────
export type StockStatus = "AVAILABLE" | "LOW" | "EMPTY";

export type MedicineCategory =
  | "Obat Generik"
  | "Obat Program"
  | "Obat Emergensi"
  | "BMHP / Alkes"
  | "Vaksin & Serum";

export type MedicineStockItem = {
  id: string;
  code: string;
  name: string;
  category: MedicineCategory;
  unit: string;
  quantity: number;
  status: StockStatus;
  updatedAt: string; // ISO date string
};

export type StockSummary = {
  totalItems: number;
  availableItems: number;
  lowItems: number;
  emptyItems: number;
  lastUpdated: string;
};

export function getStockSummary(items: MedicineStockItem[]): StockSummary {
  return {
    totalItems: items.length,
    availableItems: items.filter((i) => i.status === "AVAILABLE").length,
    lowItems: items.filter((i) => i.status === "LOW").length,
    emptyItems: items.filter((i) => i.status === "EMPTY").length,
    lastUpdated: items.length > 0 ? items[0].updatedAt : "-",
  };
}

// ── Dummy Stats ───────────────────────────────────────────────────────────────

export const dummyStats = {
  totalArticles: dummyArticles.length,
  published: dummyArticles.filter((a) => a.isPublished).length,
  draft: dummyArticles.filter((a) => !a.isPublished).length,
  totalUsers: dummyUsers.length,
};

// ── Mock Data: Medicine Stock (Representatif IFK Kotabaru) ────────────────────
export const initialMedicineStock: MedicineStockItem[] = [
  { id: "med-001", code: "OBG-001", name: "Paracetamol 500mg Tablet", category: "Obat Generik", unit: "Tablet", quantity: 15000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-002", code: "OBG-002", name: "Amoxicillin 500mg Kaplet", category: "Obat Generik", unit: "Kaplet", quantity: 8500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-003", code: "OBG-003", name: "Cotrimoxazole Tablet", category: "Obat Generik", unit: "Tablet", quantity: 12000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-004", code: "OBG-004", name: "Metformin 500mg Tablet", category: "Obat Generik", unit: "Tablet", quantity: 9800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-005", code: "OBG-005", name: "Amlodipine 10mg Tablet", category: "Obat Generik", unit: "Tablet", quantity: 11000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-006", code: "OBG-006", name: "Salbutamol Nebules 2.5mg", category: "Obat Generik", unit: "Kantong", quantity: 450, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-007", code: "OBG-007", name: "Promethazine Sirup 60ml", category: "Obat Generik", unit: "Botol", quantity: 750, status: "LOW", updatedAt: "2026-08-31" },
  { id: "med-008", code: "OBR-001", name: "Vitamin A 200.000 IU (Program Balita)", category: "Obat Program", unit: "Kapsul", quantity: 25000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-009", code: "OBR-002", name: "Vitamin A 500.000 IU (Program Ibu Hamil)", category: "Obat Program", unit: "Kapsul", quantity: 12000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-010", code: "OBR-003", name: "Fe (Zat Besi) Tablet Ibu Hamil", category: "Obat Program", unit: "Tablet", quantity: 1000, status: "LOW", updatedAt: "2026-08-31" },
  { id: "med-011", code: "OBR-004", name: "Eisen Fumarate Tablet", category: "Obat Program", unit: "Tablet", quantity: 8500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-012", code: "OBE-001", name: "Naloxone Injeksi 0.4mg", category: "Obat Emergensi", unit: "Ampul", quantity: 150, status: "EMPTY", updatedAt: "2026-08-31" },
  { id: "med-013", code: "OBE-002", name: "Adrenalin Injeksi 1mg", category: "Obat Emergensi", unit: "Ampul", quantity: 280, status: "LOW", updatedAt: "2026-08-31" },
  { id: "med-014", code: "BMH-001", name: "Spuit Suntik 3ml", category: "BMHP / Alkes", unit: "Pcs", quantity: 18000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-015", code: "BMH-002", name: "Kasa Steril 10x10cm", category: "BMHP / Alkes", unit: "Bungkus", quantity: 4500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-016", code: "VAK-001", name: "Vaksin DPT-HB-Hib", category: "Vaksin & Serum", unit: "Vial", quantity: 900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "med-017", code: "VAK-002", name: "Vaksin Campak MR", category: "Vaksin & Serum", unit: "Vial", quantity: 320, status: "LOW", updatedAt: "2026-08-31" },
  { id: "med-018", code: "BMH-003", name: "Infus NaCl 0.9% 500ml", category: "BMHP / Alkes", unit: "Botol", quantity: 2400, status: "AVAILABLE", updatedAt: "2026-08-31" }
];
