1|import { placeholderImage } from "./placeholder";
2|
3|// ── Types & Constants ────────────────────────────────────────────────────────
4|
5|export const ARTICLE_CATEGORIES = ["Kegiatan", "Informasi", "Sosialisasi"] as const;
6|export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
7|
8|// Simulasi data master kategori dengan status aktif/non-aktif
9|export type CategoryStatus = "ACTIVE" | "INACTIVE";
10|
11|export type Category = {
12|  id: string;
13|  name: ArticleCategory;
14|  slug: string;
15|  status: CategoryStatus;
16|};
17|
18|export const initialCategories: Category[] = [
19|  { id: "cat-1", name: "Kegiatan", slug: "kegiatan", status: "ACTIVE" },
20|  { id: "cat-2", name: "Informasi", slug: "informasi", status: "ACTIVE" },
21|  { id: "cat-3", name: "Sosialisasi", slug: "sosialisasi", status: "ACTIVE" },
22|];
23|
24|export function getArticleCountByCategory(categoryName: ArticleCategory, articles: Article[]): number {
25|  return articles.filter((a) => a.category === categoryName).length;
26|}
27|
28|export type Article = {
29|  id: string;
30|  title: string;
31|  slug: string;
32|  category: ArticleCategory;
33|  content: string; // HTML string
34|  coverImage: string;
35|  isPublished: boolean;
36|  authorId: string;
37|  authorName: string;
38|  publishedAt: string; // ISO date string
39|};
40|
41|export type User = {
42|  id: string;
43|  username: string;
44|  name: string;
45|  role: "SUPER_ADMIN" | "STAFF";
46|  status: "ACTIVE" | "INACTIVE";
47|  createdAt: string;
48|};
49|
50|export type SiteConfig = {
51|  name: string;
52|  shortName: string;
53|  address: string;
54|  phone: string;
55|  email: string;
56|  whatsappLink: string;
57|  googleMapsEmbedUrl: string;
58|  operationalHours: string;
59|  sp4nLaporUrl: string;
60|  motto: string;
61|  tagline: string;
62|};
63|
64|// ── Site Config ───────────────────────────────────────────────────────────────
65|
66|export const siteConfig: SiteConfig = {
67|  name: "UPTD Instalasi Farmasi Kab. Kotabaru",
68|  shortName: "IFK Kotabaru",
69|  address:
70|    "Jl. Kenanga Desa Dirgahayu, Kotabaru 72116. Telp/Fax (0518) 21603",
71|  phone: "(0518) 21603",
72|  email: "instalasifarmasi4@gmail.com",
73|  whatsappLink: "https://wa.me/6281234567890",
74|  googleMapsEmbedUrl:
75|    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.402205111195!2d116.22363550000001!3d-3.2497904999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2def302cb3e8dcff%3A0xb7c86d7dc7737d8c!2sInstalasi%20Farmasi!5e0!3m2!1sen!2sid!4v1788250580948!5m2!1sen!2sid",
76|  operationalHours:
77|    "Senin - Kamis: 08.00 - 16.30 WITA\nJumat: 08.00 - 11.00 WITA",
78|  sp4nLaporUrl: "https://www.lapor.go.id",
79|  motto:
80|    "Melayani dengan Integritas, Menjamin Mutu Obat untuk Kesehatan Masyarakat",
81|  tagline: "Stok Valid, Team Solid",
82|};
83|
84|// ── Dummy Users ───────────────────────────────────────────────────────────────
85|
86|export const dummyUsers: User[] = [
87|  {
88|    id: "usr-1",
89|    username: "admin",
90|    name: "Administrator",
91|    role: "SUPER_ADMIN",
92|    status: "ACTIVE",
93|    createdAt: "2024-01-15T08:00:00.000Z",
94|  },
95|  {
96|    id: "usr-2",
97|    username: "staff1",
98|    name: "Siti Nurhaliza, S.Farm",
99|    role: "STAFF",
100|    status: "ACTIVE",
101|    createdAt: "2024-03-10T08:00:00.000Z",
102|  },
103|  {
104|    id: "usr-3",
105|    username: "staff2",
106|    name: "Ahmad Rizky, S.Farm",
107|    role: "STAFF",
108|    status: "ACTIVE",
109|    createdAt: "2024-06-01T08:00:00.000Z",
110|  },
111|];
112|
113|// ── Dummy Articles ────────────────────────────────────────────────────────────
114|
115|export const dummyArticles: Article[] = [
116|  {
117|    id: "art-1",
118|    title: "Sosialisasi Penggunaan Sistem Informasi Kefarmasian",
119|    slug: "sosialisasi-sistem-informasi-kefarmasian",
120|    category: "Kegiatan",
121|    content: `
122|      <p>UPTD Instalasi Farmasi Kab. Kotabaru mengadakan sosialisasi penggunaan sistem informasi kefarmasian kepada seluruh faskes binaan di wilayah Kabupaten Kotabaru.</p>
123|      <p>Kegiatan ini bertujuan untuk memastikan setiap faskes dapat menggunakan sistem dengan baik dalam pengelolaan distribusi dan pemantauan stok obat. Para peserta mendapatkan penjelasan lengkap mulai dari cara login, input data stok, hingga laporan penggunaan obat.</p>
124|      <p>Selain itu, sosialisasi ini juga menjadi wadah untuk menampung masukan dan kendala yang dihadapi oleh para apoteker faskes dalam penggunaan sistem informasi kefarmasian.</p>
125|    `,
126|    coverImage: placeholderImage(1200, 630, "Sosialisasi Sistem Informasi Kefarmasian", "Kegiatan"),
127|    isPublished: true,
128|    authorId: "usr-1",
129|    authorName: "Administrator",
130|    publishedAt: "2025-01-15T08:00:00.000Z",
131|  },
132|  {
133|    id: "art-2",
134|    title: "Evaluasi Kegiatan Distribusi Obat Triwulan IV 2024",
135|    slug: "evaluasi-distribusi-obat-triwulan-iv-2024",
136|    category: "Kegiatan",
137|    content: `
138|      <p>UPTD Instalasi Farmasi Kab. Kotabaru melaksanakan evaluasi kegiatan distribusi obat untuk triwulan IV tahun 2024.</p>
139|      <p>Evaluasi ini mencakup analisis ketersediaan obat di seluruh faskes binaan, tingkat pemenuhan permintaan, serta efektivitas proses distribusi yang telah dilaksanakan selama periode tersebut.</p>
140|      <p>Hasil evaluasi menunjukkan bahwa tingkat pemenuhan permintaan obat mencapai 95%, dengan beberapa catatan perbaikan untuk obat-obatan yang mengalami keterlambatan pengadaan dari pemasok.</p>
141|    `,
142|    coverImage: placeholderImage(1200, 630, "Evaluasi Distribusi Obat Triwulan IV", "Kegiatan"),
143|    isPublished: true,
144|    authorId: "usr-2",
145|    authorName: "Siti Nurhaliza, S.Farm",
146|    publishedAt: "2025-01-20T09:00:00.000Z",
147|  },
148|  {
149|    id: "art-3",
150|    title: "Pengumuman Jadwal Pelayanan Selama Libur Nasional",
151|    slug: "pengumuman-jadwal-pelayanan-libur-nasional",
152|    category: "Informasi",
153|    content: `
154|      <p>Berdasarkan surat edaran dari pimpinan, UPTD Instalasi Farmasi Kab. Kotabaru menginformasikan jadwal pelayanan selama masa libur nasional.</p>
155|      <p>Selama libur nasional, pelayanan distribusi obat akan dititipkan pada jadwal pengajuan sebelum masa libur. Faskes binaan diimbau untuk mengajuan permintaan obat paling lambat H-7 sebelum hari libur nasional dimulai.</p>
156|      <p>Pelayanan normal akan kembali beroperasi sesuai jam kerja yang berlaku setelah masa libur nasional berakhir.</p>
157|    `,
158|    coverImage: placeholderImage(1200, 630, "Jadwal Pelayanan Libur Nasional", "Informasi"),
159|    isPublished: true,
160|    authorId: "usr-1",
161|    authorName: "Administrator",
162|    publishedAt: "2025-02-01T08:00:00.000Z",
163|  },
164|  {
165|    id: "art-4",
166|    title: "Daftar Obat yang Diperbarui di Sistem e-Formularium",
167|    slug: "daftar-obat-pembaruan-e-formularium",
168|    category: "Informasi",
169|    content: `
170|      <p>Telah terjadi pembaruan daftar obat dalam sistem e-Formularium Nasional yang berlaku efektif bulan Februari 2025.</p>
171|      <p>Beberapa obat yang mengalami perubahan meliputi penambahan obat generik baru, penghapusan obat yang sudah tidak diproduksi, serta penyesuaian harga obat berdasarkan keputusan terbaru dari Kementerian Kesehatan.</p>
172|      <p>Faskes binaan diimbau untuk memperbarui referensi formularium di masing-masing institusi agar sesuai dengan daftar terbaru yang berlaku.</p>
173|    `,
174|    coverImage: placeholderImage(1200, 630, "Pembaruan e-Formularium Nasional", "Informasi"),
175|    isPublished: true,
176|    authorId: "usr-2",
177|    authorName: "Siti Nurhaliza, S.Farm",
178|    publishedAt: "2025-02-10T10:00:00.000Z",
179|  },
180|  {
181|    id: "art-5",
182|    title: "Pelibatan Masyarakat dalam Pengawasan Obat dan Makanan",
183|    slug: "pelibatan-masyarakat-pengawasan-obat",
184|    category: "Sosialisasi",
185|    content: `
186|      <p>UPTD Instalasi Farmasi Kab. Kotabaru mengadakan kegiatan sosialisasi pelibatan masyarakat dalam pengawasan obat dan makanan di wilayah Kabupaten Kotabaru.</p>
187|      <p>Kegiatan ini bertujuan untuk meningkatkan kesadaran masyarakat tentang pentingnya menggunakan obat yang aman, berkhasiat, dan berkualitas. Masyarakat diedukasi untuk mengenali obat-obatan yang tidak memiliki izin edar dari BPOM.</p>
188|      <p>Sosialisasi dilakukan melalui pertemuan langsung dengan warga di beberapa kecamatan, serta penyebaran brosur dan materi edukasi tentang penggunaan obat yang bijak.</p>
189|    `,
190|    coverImage: placeholderImage(1200, 630, "Pelibatan Masyarakat Pengawasan Obat", "Sosialisasi"),
191|    isPublished: true,
192|    authorId: "usr-3",
193|    authorName: "Ahmad Rizky, S.Farm",
194|    publishedAt: "2025-02-15T08:00:00.000Z",
195|  },
196|  {
197|    id: "art-6",
198|    title: "Kampanye Penggunaan Antibiotik yang Bijak",
199|    slug: "kampanye-penggunaan-antibiotik-bijak",
200|    category: "Sosialisasi",
201|    content: `
202|      <p>Dalam rangka meningkatkan pemahaman masyarakat tentang penggunaan antibiotik yang tepat, UPTD Instalasi Farmasi Kab. Kotabaru menggelar kampanye penggunaan antibiotik yang bijak.</p>
203|      <p>Kampanye ini menekankan pentingnya tidak menggunakan antibiotik tanpa resep dokter, serta bahaya resistensi antibiotik yang dapat mengancam kesehatan masyarakat secara luas.</p>
204|      <p>Pesan utama kampanye: "Gunakan Antibiotik Sesuai Resep Dokter, Selamatkan Masa Depan Kesehatan Kita." Kegiatan ini mendapat sambutan positif dari masyarakat dan tenaga kesehatan di Kabupaten Kotabaru.</p>
205|    `,
206|    coverImage: placeholderImage(1200, 630, "Kampanye Antibiotik Bijak", "Sosialisasi"),
207|    isPublished: false,
208|    authorId: "usr-1",
209|    authorName: "Administrator",
210|    publishedAt: "2025-02-20T08:00:00.000Z",
211|  },
212|];
213|
214|// ── Types & Constants: Medicine Stock ──────────────────────────────────────────
215|export type StockStatus = "AVAILABLE" | "LOW" | "EMPTY";
216|
217|export type MedicineCategory =
218|  | "Obat Generik"
219|  | "Obat Program"
220|  | "Obat Emergensi"
221|  | "BMHP / Alkes"
222|  | "Vaksin & Serum";
223|
224|export type MedicineStockItem = {
225|  id: string;
226|  code: string;
227|  name: string;
228|  category: MedicineCategory;
229|  unit: string;
230|  quantity: number;
231|  status: StockStatus;
232|  updatedAt: string; // ISO date string
233|};
234|
235|export type StockSummary = {
236|  totalItems: number;
237|  availableItems: number;
238|  lowItems: number;
239|  emptyItems: number;
240|  lastUpdated: string;
241|};
242|
243|export function getStockSummary(items: MedicineStockItem[]): StockSummary {
244|  return {
245|    totalItems: items.length,
246|    availableItems: items.filter((i) => i.status === "AVAILABLE").length,
247|    lowItems: items.filter((i) => i.status === "LOW").length,
248|    emptyItems: items.filter((i) => i.status === "EMPTY").length,
249|    lastUpdated: items.length > 0 ? items[0].updatedAt : "-",
250|  };
251|}
252|
253|// ── Dummy Stats ───────────────────────────────────────────────────────────────
254|
255|export const dummyStats = {
256|  totalArticles: dummyArticles.length,
257|  published: dummyArticles.filter((a) => a.isPublished).length,
258|  draft: dummyArticles.filter((a) => !a.isPublished).length,
259|  totalUsers: dummyUsers.length,
260|};
261|
262|// ── Mock Data: Medicine Stock (Representatif IFK Kotabaru) ────────────────────
263|export const initialMedicineStock: MedicineStockItem[] = [
  { id: "stk-001", code: "OBG-001", name: "Paracetamol 500 mg", category: "Obat Generik", unit: "Tablet", quantity: 18500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-002", code: "OBG-002", name: "Paracetamol Sirup 120 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 1240, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-003", code: "OBG-003", name: "Paracetamol Drop 100 mg/ml", category: "Obat Generik", unit: "Botol", quantity: 450, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-004", code: "OBG-004", name: "Amoxicillin 500 mg", category: "Obat Generik", unit: "Kaplet", quantity: 14200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-005", code: "OBG-005", name: "Amoxicillin Sirup Kering 125 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 980, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-006", code: "OBG-006", name: "Amoxicillin Sirup Forte 250 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 720, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-007", code: "OBG-007", name: "Cefixime 100 mg", category: "Obat Generik", unit: "Kapsul", quantity: 3500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-008", code: "OBG-008", name: "Cefixime 200 mg", category: "Obat Generik", unit: "Kapsul", quantity: 2100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-009", code: "OBG-009", name: "Ciprofloxacin 500 mg", category: "Obat Generik", unit: "Tablet", quantity: 5400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-010", code: "OBG-010", name: "Cotrimoxazole 480 mg Dewasa", category: "Obat Generik", unit: "Tablet", quantity: 8900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-011", code: "OBG-011", name: "Cotrimoxazole Suspensi 60 ml", category: "Obat Generik", unit: "Botol", quantity: 640, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-012", code: "OBG-012", name: "Metronidazole 500 mg", category: "Obat Generik", unit: "Tablet", quantity: 6200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-013", code: "OBG-013", name: "Erythromycin 500 mg", category: "Obat Generik", unit: "Kapsul", quantity: 2800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-014", code: "OBG-014", name: "Azythromycin 500 mg", category: "Obat Generik", unit: "Kaplet", quantity: 1950, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-015", code: "OBG-015", name: "Doxycycline 100 mg", category: "Obat Generik", unit: "Kapsul", quantity: 4100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-016", code: "OBG-016", name: "Antasida Doen I Tablet Kunyah", category: "Obat Generik", unit: "Tablet", quantity: 22000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-017", code: "OBG-017", name: "Antasida Doen II Suspensi 60 ml", category: "Obat Generik", unit: "Botol", quantity: 1850, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-018", code: "OBG-018", name: "Omeprazole 20 mg", category: "Obat Generik", unit: "Kapsul", quantity: 16500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-019", code: "OBG-019", name: "Lansoprazole 30 mg", category: "Obat Generik", unit: "Kapsul", quantity: 7800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-020", code: "OBG-020", name: "Ranitidine 150 mg", category: "Obat Generik", unit: "Tablet", quantity: 9200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-021", code: "OBG-021", name: "Sucralfate Suspensi 100 ml", category: "Obat Generik", unit: "Botol", quantity: 530, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-022", code: "OBG-022", name: "Domperidone 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 6700, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-023", code: "OBG-023", name: "Domperidone Sirup 5 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 820, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-024", code: "OBG-024", name: "Metoclopramide 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 4300, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-025", code: "OBG-025", name: "Ondansetron 4 mg", category: "Obat Generik", unit: "Tablet", quantity: 3100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-026", code: "OBG-026", name: "Ondansetron 8 mg", category: "Obat Generik", unit: "Tablet", quantity: 1800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-027", code: "OBG-027", name: "Ibuprofen 200 mg", category: "Obat Generik", unit: "Tablet", quantity: 11400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-028", code: "OBG-028", name: "Ibuprofen 400 mg", category: "Obat Generik", unit: "Tablet", quantity: 13200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-029", code: "OBG-029", name: "Ibuprofen Suspensi 100 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 1150, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-030", code: "OBG-030", name: "Asam Mefenamat 500 mg", category: "Obat Generik", unit: "Kaplet", quantity: 14500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-031", code: "OBG-031", name: "Natrium Diklofenak 50 mg", category: "Obat Generik", unit: "Tablet", quantity: 9600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-032", code: "OBG-032", name: "Meloxicam 7.5 mg", category: "Obat Generik", unit: "Tablet", quantity: 5200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-033", code: "OBG-033", name: "Meloxicam 15 mg", category: "Obat Generik", unit: "Tablet", quantity: 4800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-034", code: "OBG-034", name: "Piroxicam 20 mg", category: "Obat Generik", unit: "Kapsul", quantity: 3600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-035", code: "OBG-035", name: "Ketorolac Injeksi 30 mg/ml", category: "Obat Generik", unit: "Ampul", quantity: 420, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-036", code: "OBG-036", name: "Tramadol 50 mg", category: "Obat Generik", unit: "Kapsul", quantity: 1800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-037", code: "OBG-037", name: "Allopurinol 100 mg", category: "Obat Generik", unit: "Tablet", quantity: 8400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-038", code: "OBG-038", name: "Allopurinol 300 mg", category: "Obat Generik", unit: "Tablet", quantity: 3900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-039", code: "OBG-039", name: "Kolkisina 0.5 mg", category: "Obat Generik", unit: "Tablet", quantity: 1200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-040", code: "OBG-040", name: "Amlodipine 5 mg", category: "Obat Generik", unit: "Tablet", quantity: 26000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-041", code: "OBG-041", name: "Amlodipine 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 24000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-042", code: "OBG-042", name: "Captopril 12.5 mg", category: "Obat Generik", unit: "Tablet", quantity: 9500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-043", code: "OBG-043", name: "Captopril 25 mg", category: "Obat Generik", unit: "Tablet", quantity: 11200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-044", code: "OBG-044", name: "Captopril 50 mg", category: "Obat Generik", unit: "Tablet", quantity: 4200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-045", code: "OBG-045", name: "Candersartan 8 mg", category: "Obat Generik", unit: "Tablet", quantity: 6100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-046", code: "OBG-046", name: "Candesartan 16 mg", category: "Obat Generik", unit: "Tablet", quantity: 4700, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-047", code: "OBG-047", name: "Valsartan 80 mg", category: "Obat Generik", unit: "Tablet", quantity: 2300, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-048", code: "OBG-048", name: "Bisoprolol 2.5 mg", category: "Obat Generik", unit: "Tablet", quantity: 5800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-049", code: "OBG-049", name: "Bisoprolol 5 mg", category: "Obat Generik", unit: "Tablet", quantity: 6900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-050", code: "OBG-050", name: "Furosemide 40 mg", category: "Obat Generik", unit: "Tablet", quantity: 7600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-051", code: "OBG-051", name: "Spironolactone 25 mg", category: "Obat Generik", unit: "Tablet", quantity: 3400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-052", code: "OBG-052", name: "Hidroklorotiazid (HCT) 25 mg", category: "Obat Generik", unit: "Tablet", quantity: 5100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-053", code: "OBG-053", name: "Metformin 500 mg", category: "Obat Generik", unit: "Tablet", quantity: 31000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-054", code: "OBG-054", name: "Metformin 850 mg", category: "Obat Generik", unit: "Tablet", quantity: 12500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-055", code: "OBG-055", name: "Glimepiride 1 mg", category: "Obat Generik", unit: "Tablet", quantity: 8200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-056", code: "OBG-056", name: "Glimepiride 2 mg", category: "Obat Generik", unit: "Tablet", quantity: 14600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-057", code: "OBG-057", name: "Glimepiride 3 mg", category: "Obat Generik", unit: "Tablet", quantity: 5400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-058", code: "OBG-058", name: "Glimepiride 4 mg", category: "Obat Generik", unit: "Tablet", quantity: 3200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-059", code: "OBG-059", name: "Glibenclamide 5 mg", category: "Obat Generik", unit: "Tablet", quantity: 6800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-060", code: "OBG-060", name: "Acarbose 50 mg", category: "Obat Generik", unit: "Tablet", quantity: 4900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-061", code: "OBG-061", name: "Acarbose 100 mg", category: "Obat Generik", unit: "Tablet", quantity: 3100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-062", code: "OBG-062", name: "Simvastatin 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 16800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-063", code: "OBG-063", name: "Simvastatin 20 mg", category: "Obat Generik", unit: "Tablet", quantity: 18200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-064", code: "OBG-064", name: "Atorvastatin 20 mg", category: "Obat Generik", unit: "Tablet", quantity: 5900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-065", code: "OBG-065", name: "Fenofibrate 100 mg", category: "Obat Generik", unit: "Kapsul", quantity: 2900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-066", code: "OBG-066", name: "Fenofibrate 300 mg", category: "Obat Generik", unit: "Kapsul", quantity: 2100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-067", code: "OBG-067", name: "Gemfibrozil 300 mg", category: "Obat Generik", unit: "Kapsul", quantity: 3500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-068", code: "OBG-068", name: "Cetirizine 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 19500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-069", code: "OBG-069", name: "Cetirizine Sirup 5 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 1420, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-070", code: "OBG-070", name: "Loratadine 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 7600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-071", code: "OBG-071", name: "Chlorpheniramine Maleate (CTM) 4 mg", category: "Obat Generik", unit: "Tablet", quantity: 28000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-072", code: "OBG-072", name: "Dexamethasone 0.5 mg", category: "Obat Generik", unit: "Tablet", quantity: 24500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-073", code: "OBG-073", name: "Prednisone 5 mg", category: "Obat Generik", unit: "Tablet", quantity: 13800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-074", code: "OBG-074", name: "Methylprednisolone 4 mg", category: "Obat Generik", unit: "Tablet", quantity: 17500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-075", code: "OBG-075", name: "Methylprednisolone 8 mg", category: "Obat Generik", unit: "Tablet", quantity: 6400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-076", code: "OBG-076", name: "Methylprednisolone 16 mg", category: "Obat Generik", unit: "Tablet", quantity: 4100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-077", code: "OBG-077", name: "Salbutamol 2 mg", category: "Obat Generik", unit: "Tablet", quantity: 12300, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-078", code: "OBG-078", name: "Salbutamol 4 mg", category: "Obat Generik", unit: "Tablet", quantity: 14800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-079", code: "OBG-079", name: "Salbutamol Nebules 2.5 mg", category: "Obat Generik", unit: "Ampul", quantity: 850, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-080", code: "OBG-080", name: "Ambroxol 30 mg", category: "Obat Generik", unit: "Tablet", quantity: 21000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-081", code: "OBG-081", name: "Ambroxol Sirup 15 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 1680, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-082", code: "OBG-082", name: "Glyceril Guaiacolate (GG) 100 mg", category: "Obat Generik", unit: "Tablet", quantity: 23500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-083", code: "OBG-083", name: "OBH Sirup 100 ml", category: "Obat Generik", unit: "Botol", quantity: 2200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-084", code: "OBG-084", name: "Dextromethorphan 15 mg", category: "Obat Generik", unit: "Tablet", quantity: 6500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-085", code: "OBG-085", name: "Aminophylline 200 mg", category: "Obat Generik", unit: "Tablet", quantity: 4200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-086", code: "OBG-086", name: "Oralit Sachet 200 ml", category: "Obat Generik", unit: "Sachet", quantity: 14500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-087", code: "OBG-087", name: "Zinc Sulfat 20 mg Dispersible", category: "Obat Generik", unit: "Tablet", quantity: 9800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-088", code: "OBG-088", name: "Zinc Sirup 20 mg/5 ml", category: "Obat Generik", unit: "Botol", quantity: 1100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-089", code: "OBG-089", name: "Attapulgite 600 mg", category: "Obat Generik", unit: "Tablet", quantity: 8400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-090", code: "OBG-090", name: "Loperamide 2 mg", category: "Obat Generik", unit: "Tablet", quantity: 6100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-091", code: "OBG-091", name: "Bisacodyl 5 mg", category: "Obat Generik", unit: "Tablet", quantity: 3200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-092", code: "OBG-092", name: "Microlax Enema 5 ml", category: "Obat Generik", unit: "Tube", quantity: 240, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-093", code: "OBG-093", name: "Asam Traneksamat 500 mg", category: "Obat Generik", unit: "Tablet", quantity: 5200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-094", code: "OBG-094", name: "Fitomenadion (Vitamin K1) 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 2100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-095", code: "OBG-095", name: "Vitamin B Kompleks", category: "Obat Generik", unit: "Tablet", quantity: 35000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-096", code: "OBG-096", name: "Vitamin B1 (Thiamine) 50 mg", category: "Obat Generik", unit: "Tablet", quantity: 18500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-097", code: "OBG-097", name: "Vitamin B6 (Pyridoxine) 10 mg", category: "Obat Generik", unit: "Tablet", quantity: 19200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-098", code: "OBG-098", name: "Vitamin B12 (Cyanocobalamin) 50 mcg", category: "Obat Generik", unit: "Tablet", quantity: 22000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-099", code: "OBG-099", name: "Vitamin C 50 mg", category: "Obat Generik", unit: "Tablet", quantity: 28000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-100", code: "OBG-100", name: "Vitamin C 250 mg", category: "Obat Generik", unit: "Tablet", quantity: 15400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-101", code: "OBG-101", name: "Vitamin C 500 mg", category: "Obat Generik", unit: "Tablet", quantity: 12300, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-102", code: "OBG-102", name: "Kalsium Laktat (Kalk) 500 mg", category: "Obat Generik", unit: "Tablet", quantity: 26000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-103", code: "OBG-103", name: "Asam Folat 1 mg", category: "Obat Generik", unit: "Tablet", quantity: 17500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-104", code: "OBG-104", name: "Betahistine Mesilate 6 mg", category: "Obat Generik", unit: "Tablet", quantity: 8300, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-105", code: "OBG-105", name: "Piracetam 800 mg", category: "Obat Generik", unit: "Kaplet", quantity: 4100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-106", code: "OBG-106", name: "Diazepam 2 mg", category: "Obat Generik", unit: "Tablet", quantity: 3400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-107", code: "OBG-107", name: "Diazepam 5 mg", category: "Obat Generik", unit: "Tablet", quantity: 2800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-108", code: "OBG-108", name: "Haloperidol 1.5 mg", category: "Obat Generik", unit: "Tablet", quantity: 2600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-109", code: "OBG-109", name: "Haloperidol 5 mg", category: "Obat Generik", unit: "Tablet", quantity: 3100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-110", code: "OBG-110", name: "Trihexyphenidyl 2 mg", category: "Obat Generik", unit: "Tablet", quantity: 4600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-111", code: "OBG-111", name: "Chlorpromazine 100 mg", category: "Obat Generik", unit: "Tablet", quantity: 2900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-112", code: "OBG-112", name: "Carbamazepine 200 mg", category: "Obat Generik", unit: "Tablet", quantity: 3200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-113", code: "OBG-113", name: "Fenitoin Natrium 100 mg", category: "Obat Generik", unit: "Kapsul", quantity: 2700, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-114", code: "OBG-114", name: "Griseofulvin 125 mg", category: "Obat Generik", unit: "Tablet", quantity: 3800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-115", code: "OBG-115", name: "Ketoconazole 200 mg", category: "Obat Generik", unit: "Tablet", quantity: 5600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-116", code: "OBG-116", name: "Nystatin Drop 100.000 IU/ml", category: "Obat Generik", unit: "Botol", quantity: 480, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-117", code: "OBG-117", name: "Salep Kulit Hidrokortison 2.5%", category: "Obat Generik", unit: "Tube", quantity: 1450, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-118", code: "OBG-118", name: "Salep Kulit Betametason 0.1%", category: "Obat Generik", unit: "Tube", quantity: 1320, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-119", code: "OBG-119", name: "Salep Kulit Gentamisin 0.1%", category: "Obat Generik", unit: "Tube", quantity: 1680, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-120", code: "OBG-120", name: "Salep Kulit Ketokonazol 2%", category: "Obat Generik", unit: "Tube", quantity: 1850, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-121", code: "OBG-121", name: "Salep Kulit Oksitetrasiklin 3%", category: "Obat Generik", unit: "Tube", quantity: 920, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-122", code: "OBG-122", name: "Tetes Mata Kloramfenikol 0.5%", category: "Obat Generik", unit: "Botol", quantity: 640, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-123", code: "OBG-123", name: "Salep Mata Kloramfenikol 1%", category: "Obat Generik", unit: "Tube", quantity: 510, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-124", code: "OBG-124", name: "Tetes Telinga Kloramfenikol 3%", category: "Obat Generik", unit: "Botol", quantity: 580, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-125", code: "OBR-001", name: "Vitamin A 100.000 IU (Biru - Bayi 6-11 Bln)", category: "Obat Program", unit: "Kapsul", quantity: 8500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-126", code: "OBR-002", name: "Vitamin A 200.000 IU (Merah - Balita & Nifas)", category: "Obat Program", unit: "Kapsul", quantity: 32000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-127", code: "OBR-003", name: "Tablet Tambah Darah (TTD) Ibu Hamil", category: "Obat Program", unit: "Tablet", quantity: 45000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-128", code: "OBR-004", name: "Tablet Tambah Darah (TTD) Remaja Putri", category: "Obat Program", unit: "Tablet", quantity: 38000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-129", code: "OBR-005", name: "OAT Kategori 1 Dewasa (FDC)", category: "Obat Program", unit: "Paket", quantity: 140, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-130", code: "OBR-006", name: "OAT Kategori Anak (FDC)", category: "Obat Program", unit: "Paket", quantity: 85, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-131", code: "OBR-007", name: "Rifampisin 300 mg (Kusta PB)", category: "Obat Program", unit: "Kapsul", quantity: 620, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-132", code: "OBR-008", name: "MDT Kusta Dewasa MB", category: "Obat Program", unit: "Blister", quantity: 45, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-133", code: "OBR-009", name: "MDT Kusta Anak MB", category: "Obat Program", unit: "Blister", quantity: 28, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-134", code: "OBR-010", name: "DHP (Dihydroartemisinin-Piperaquine) Malaria", category: "Obat Program", unit: "Tablet", quantity: 750, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-135", code: "OBR-011", name: "Primaquine 15 mg Malaria", category: "Obat Program", unit: "Tablet", quantity: 2400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-136", code: "OBR-012", name: "Albendazole 400 mg (Program Cacingan)", category: "Obat Program", unit: "Tablet Kunyah", quantity: 18000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-137", code: "OBR-013", name: "Diethylcarbamazine (DEC) 100 mg Filariasis", category: "Obat Program", unit: "Tablet", quantity: 5600, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-138", code: "OBR-014", name: "Pil KB Kombinasi (Levonorgestrel/Etinilestradiol)", category: "Obat Program", unit: "Siklus", quantity: 4200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-139", code: "OBR-015", name: "Pil KB Progestin (Ibu Menyusui)", category: "Obat Program", unit: "Siklus", quantity: 2800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-140", code: "OBR-016", name: "KB Suntik 3 Bulan (DMPA 150 mg)", category: "Obat Program", unit: "Vial", quantity: 3100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-141", code: "OBR-017", name: "KB Suntik 1 Bulan (Kombinasi)", category: "Obat Program", unit: "Vial", quantity: 1950, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-142", code: "OBR-018", name: "Implan KB 2 Batang (Levonorgestrel)", category: "Obat Program", unit: "Set", quantity: 180, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-143", code: "OBR-019", name: "IUD Copper T (Alat Kontrasepsi Dalam Rahim)", category: "Obat Program", unit: "Set", quantity: 220, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-144", code: "OBR-020", name: "Kondom Lateks Program KB", category: "Obat Program", unit: "Gross", quantity: 110, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-145", code: "OBR-021", name: "PMT Biskuit Ibu Hamil KEK", category: "Obat Program", unit: "Kardus", quantity: 75, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-146", code: "OBR-022", name: "PMT Biskuit Balita Kurang Gizi", category: "Obat Program", unit: "Kardus", quantity: 90, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-147", code: "OBR-023", name: "Obat ARV TLD (Tenofovir/Lamivudine/Dolutegravir)", category: "Obat Program", unit: "Botol", quantity: 160, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-148", code: "OBR-024", name: "Kotrimoksasol Profilaksis HIV 960 mg", category: "Obat Program", unit: "Tablet", quantity: 3200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-149", code: "OBR-025", name: "Reagen HIV 1 Rapid Test", category: "Obat Program", unit: "Kit", quantity: 15, status: "EMPTY", updatedAt: "2026-08-31" },
  { id: "stk-150", code: "OBE-001", name: "Epinefrin (Adrenalin) Injeksi 1 mg/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 350, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-151", code: "OBE-002", name: "Atropin Sulfat Injeksi 0.25 mg/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 420, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-152", code: "OBE-003", name: "Lidokain Injeksi 2% 2 ml", category: "Obat Emergensi", unit: "Ampul", quantity: 1850, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-153", code: "OBE-004", name: "Dexamethasone Injeksi 5 mg/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 2400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-154", code: "OBE-005", name: "Diphenhydramine Injeksi 10 mg/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 890, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-155", code: "OBE-006", name: "Furosemide Injeksi 10 mg/ml 2 ml", category: "Obat Emergensi", unit: "Ampul", quantity: 640, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-156", code: "OBE-007", name: "Diazepam Injeksi 5 mg/ml 2 ml", category: "Obat Emergensi", unit: "Ampul", quantity: 380, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-157", code: "OBE-008", name: "Diazepam Rektal Tube 5 mg", category: "Obat Emergensi", unit: "Tube", quantity: 140, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-158", code: "OBE-009", name: "Diazepam Rektal Tube 10 mg", category: "Obat Emergensi", unit: "Tube", quantity: 120, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-159", code: "OBE-010", name: "Oksitosin Injeksi 10 IU/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 1950, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-160", code: "OBE-011", name: "Metilergometrin Injeksi 0.2 mg/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 520, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-161", code: "OBE-012", name: "Magnesium Sulfat (MgSO4) 20% 25 ml", category: "Obat Emergensi", unit: "Vial", quantity: 280, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-162", code: "OBE-013", name: "Magnesium Sulfat (MgSO4) 40% 25 ml", category: "Obat Emergensi", unit: "Vial", quantity: 340, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-163", code: "OBE-014", name: "Kalsium Glukonat Injeksi 10% 10 ml", category: "Obat Emergensi", unit: "Ampul", quantity: 95, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-164", code: "OBE-015", name: "Naloxone Injeksi 0.4 mg/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 40, status: "EMPTY", updatedAt: "2026-08-31" },
  { id: "stk-165", code: "OBE-016", name: "Aminofilin Injeksi 24 mg/ml 10 ml", category: "Obat Emergensi", unit: "Ampul", quantity: 210, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-166", code: "OBE-017", name: "Asam Traneksamat Injeksi 100 mg/ml 5 ml", category: "Obat Emergensi", unit: "Ampul", quantity: 480, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-167", code: "OBE-018", name: "Fitomenadion (Vit K1) Injeksi 2 mg/ml", category: "Obat Emergensi", unit: "Ampul", quantity: 850, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-168", code: "OBE-019", name: "Natrium Bikarbonat (Meylon) 8.4% 25 ml", category: "Obat Emergensi", unit: "Vial", quantity: 60, status: "EMPTY", updatedAt: "2026-08-31" },
  { id: "stk-169", code: "OBE-020", name: "Dextrose 40% Injeksi 25 ml", category: "Obat Emergensi", unit: "Flakon", quantity: 320, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-170", code: "VAK-001", name: "Vaksin Hepatitis B Rekombinan (HB0)", category: "Vaksin & Serum", unit: "Uniject", quantity: 1450, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-171", code: "VAK-002", name: "Vaksin BCG 0.05 mg", category: "Vaksin & Serum", unit: "Ampul", quantity: 620, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-172", code: "VAK-003", name: "Pelarut Vaksin BCG", category: "Vaksin & Serum", unit: "Ampul", quantity: 620, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-173", code: "VAK-004", name: "Vaksin Polio Tetes (bOPV)", category: "Vaksin & Serum", unit: "Vial", quantity: 840, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-174", code: "VAK-005", name: "Vaksin Polio Suntik (IPV)", category: "Vaksin & Serum", unit: "Vial", quantity: 530, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-175", code: "VAK-006", name: "Vaksin DPT-HB-Hib (Pentabio)", category: "Vaksin & Serum", unit: "Vial", quantity: 1120, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-176", code: "VAK-007", name: "Vaksin Campak Rubella (MR)", category: "Vaksin & Serum", unit: "Vial", quantity: 780, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-177", code: "VAK-008", name: "Pelarut Vaksin Campak Rubella (MR)", category: "Vaksin & Serum", unit: "Ampul", quantity: 780, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-178", code: "VAK-009", name: "Vaksin Rotavirus", category: "Vaksin & Serum", unit: "Tube", quantity: 490, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-179", code: "VAK-010", name: "Vaksin PCV (Pneumokokus Konyugasi)", category: "Vaksin & Serum", unit: "Vial", quantity: 640, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-180", code: "VAK-011", name: "Vaksin HPV (Human Papillomavirus)", category: "Vaksin & Serum", unit: "Vial", quantity: 310, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-181", code: "VAK-012", name: "Vaksin Tetanus Toksoid (Td)", category: "Vaksin & Serum", unit: "Vial", quantity: 890, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-182", code: "VAK-013", name: "Vaksin Difteri Tetanus (DT)", category: "Vaksin & Serum", unit: "Vial", quantity: 460, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-183", code: "VAK-014", name: "Serum Anti Bisa Ular (SABU) Polivalen", category: "Vaksin & Serum", unit: "Vial", quantity: 18, status: "EMPTY", updatedAt: "2026-08-31" },
  { id: "stk-184", code: "VAK-015", name: "Serum Anti Tetanus (ATS) 1500 IU", category: "Vaksin & Serum", unit: "Ampul", quantity: 75, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-185", code: "BMH-001", name: "Spuit / Alat Suntik 1 ml", category: "BMHP / Alkes", unit: "Pcs", quantity: 18500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-186", code: "BMH-002", name: "Spuit / Alat Suntik 3 ml", category: "BMHP / Alkes", unit: "Pcs", quantity: 24000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-187", code: "BMH-003", name: "Spuit / Alat Suntik 5 ml", category: "BMHP / Alkes", unit: "Pcs", quantity: 16000, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-188", code: "BMH-004", name: "Spuit / Alat Suntik 10 ml", category: "BMHP / Alkes", unit: "Pcs", quantity: 7800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-189", code: "BMH-005", name: "Spuit / Alat Suntik 20 ml", category: "BMHP / Alkes", unit: "Pcs", quantity: 2400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-190", code: "BMH-006", name: "Spuit / Alat Suntik 50 ml Catheter Tip", category: "BMHP / Alkes", unit: "Pcs", quantity: 850, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-191", code: "BMH-007", name: "Infus Set Dewasa (Macro Dropper)", category: "BMHP / Alkes", unit: "Pcs", quantity: 4200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-192", code: "BMH-008", name: "Infus Set Anak (Micro Dropper)", category: "BMHP / Alkes", unit: "Pcs", quantity: 2100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-193", code: "BMH-009", name: "Abocath / IV Catheter No. 18", category: "BMHP / Alkes", unit: "Pcs", quantity: 1950, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-194", code: "BMH-010", name: "Abocath / IV Catheter No. 20", category: "BMHP / Alkes", unit: "Pcs", quantity: 3400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-195", code: "BMH-011", name: "Abocath / IV Catheter No. 22", category: "BMHP / Alkes", unit: "Pcs", quantity: 4100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-196", code: "BMH-012", name: "Abocath / IV Catheter No. 24 (Pediatrik)", category: "BMHP / Alkes", unit: "Pcs", quantity: 2800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-197", code: "BMH-013", name: "Infus Cairan Ringer Laktat (RL) 500 ml", category: "BMHP / Alkes", unit: "Botol", quantity: 4500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-198", code: "BMH-014", name: "Infus Cairan NaCl 0.9% 500 ml", category: "BMHP / Alkes", unit: "Botol", quantity: 5200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-199", code: "BMH-015", name: "Infus Cairan Dextrose 5% 500 ml", category: "BMHP / Alkes", unit: "Botol", quantity: 2800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-200", code: "BMH-016", name: "Infus Cairan D5 1/4 NS 500 ml", category: "BMHP / Alkes", unit: "Botol", quantity: 1400, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-201", code: "BMH-017", name: "Water for Injection (Pelarut) 25 ml", category: "BMHP / Alkes", unit: "Flakon", quantity: 1800, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-202", code: "BMH-018", name: "Kasa Hidrofil Steril 16x16 cm", category: "BMHP / Alkes", unit: "Kotak", quantity: 1200, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-203", code: "BMH-019", name: "Kasa Gulung Perban 4 meter x 5 cm", category: "BMHP / Alkes", unit: "Rol", quantity: 3500, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-204", code: "BMH-020", name: "Kasa Gulung Perban 4 meter x 10 cm", category: "BMHP / Alkes", unit: "Rol", quantity: 2900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-205", code: "BMH-021", name: "Kapas Pembalut Medis 250 gram", category: "BMHP / Alkes", unit: "Rol", quantity: 850, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-206", code: "BMH-022", name: "Plester Medis Roll Kain 5 yard x 2 inch", category: "BMHP / Alkes", unit: "Rol", quantity: 620, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-207", code: "BMH-023", name: "Micropore / Plester Kertas 1 inch", category: "BMHP / Alkes", unit: "Rol", quantity: 740, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-208", code: "BMH-024", name: "Povidone Iodine 10% Larutan 300 ml", category: "BMHP / Alkes", unit: "Botol", quantity: 430, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-209", code: "BMH-025", name: "Alkohol 70% 1000 ml", category: "BMHP / Alkes", unit: "Botol", quantity: 680, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-210", code: "BMH-026", name: "Sarung Tangan Medis Non-Steril Size M", category: "BMHP / Alkes", unit: "Kotak", quantity: 1850, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-211", code: "BMH-027", name: "Sarung Tangan Medis Non-Steril Size L", category: "BMHP / Alkes", unit: "Kotak", quantity: 1420, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-212", code: "BMH-028", name: "Sarung Tangan Steril No. 7.5", category: "BMHP / Alkes", unit: "Pasang", quantity: 2100, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-213", code: "BMH-029", name: "Masker Bedah 3-Ply Earloop", category: "BMHP / Alkes", unit: "Kotak", quantity: 2900, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-214", code: "BMH-030", name: "Urine Bag 2000 ml dengan T-Valve", category: "BMHP / Alkes", unit: "Pcs", quantity: 820, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-215", code: "BMH-031", name: "Foley Catheter 2-Way No. 16", category: "BMHP / Alkes", unit: "Pcs", quantity: 450, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-216", code: "BMH-032", name: "Foley Catheter 2-Way No. 18", category: "BMHP / Alkes", unit: "Pcs", quantity: 380, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-217", code: "BMH-033", name: "Feeding Tube / NGT No. 16 Dewasa", category: "BMHP / Alkes", unit: "Pcs", quantity: 290, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-218", code: "BMH-034", name: "Feeding Tube / NGT No. 8 Bayi/Anak", category: "BMHP / Alkes", unit: "Pcs", quantity: 240, status: "LOW", updatedAt: "2026-08-31" },
  { id: "stk-219", code: "BMH-035", name: "Benang Bedah Silk 3/0 dengan Jarum", category: "BMHP / Alkes", unit: "Sachet", quantity: 950, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-220", code: "BMH-036", name: "Benang Bedah Chromic Catgut 3/0", category: "BMHP / Alkes", unit: "Sachet", quantity: 880, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-221", code: "BMH-037", name: "Jarum Kulit / Surgical Needles", category: "BMHP / Alkes", unit: "Lusin", quantity: 110, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-222", code: "BMH-038", name: "Bilah Pisau Bedah (Scalpel Blade) No. 11", category: "BMHP / Alkes", unit: "Kotak", quantity: 140, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-223", code: "BMH-039", name: "Safety Box Pengolah Limbah Jarum 5L", category: "BMHP / Alkes", unit: "Pcs", quantity: 320, status: "AVAILABLE", updatedAt: "2026-08-31" },
  { id: "stk-224", code: "BMH-040", name: "Kantong Plastik Kuning Limbah Medis", category: "BMHP / Alkes", unit: "Pak", quantity: 210, status: "AVAILABLE", updatedAt: "2026-08-31" },
];
