import { sortArticles, type SortableArticle } from "../src/lib/article-sorting";

const mockArticles: SortableArticle[] = [
  {
    id: "art-1",
    title: "Vaksinasi Polio Serentak 2026",
    slug: "vaksinasi-polio-serentak-2026",
    isPublished: true,
    publishedAt: "2026-03-10T08:00:00.000Z",
    createdAt: "2026-03-01T08:00:00.000Z",
    category: { name: "Kegiatan" },
  },
  {
    id: "art-2",
    title: "Alur Distribusi Obat Puskesmas",
    slug: "alur-distribusi-obat-puskesmas",
    isPublished: false,
    publishedAt: "2026-01-15T09:00:00.000Z",
    createdAt: "2026-01-10T09:00:00.000Z",
    category: { name: "Farmasi" },
  },
  {
    id: "art-3",
    title: "Penyuluhan Pengelolaan Narkotika",
    slug: "penyuluhan-pengelolaan-narkotika",
    isPublished: true,
    publishedAt: "2026-05-20T10:00:00.000Z",
    createdAt: "2026-05-18T10:00:00.000Z",
    category: { name: "Edukasi" },
  },
  {
    id: "art-4",
    title: "Bimbingan Teknis Tenaga Kefarmasian",
    slug: "bimtek-tenaga-kefarmasian",
    isPublished: false,
    publishedAt: "2026-02-05T07:30:00.000Z",
    createdAt: "2026-02-01T07:30:00.000Z",
    category: { name: "Kegiatan" },
  },
];

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ LULUS: ${message}`);
}

async function runTests() {
  console.log("=== MEMULAI PENGUJIAN SORTING TABEL ARTIKEL ADMIN (ISSUE #60) ===\n");

  // 1. Uji Pengurutan Judul (A-Z)
  const byTitleAsc = sortArticles(mockArticles, "title", "asc");
  assert(
    byTitleAsc[0].title === "Alur Distribusi Obat Puskesmas" &&
      byTitleAsc[1].title === "Bimbingan Teknis Tenaga Kefarmasian" &&
      byTitleAsc[2].title === "Penyuluhan Pengelolaan Narkotika" &&
      byTitleAsc[3].title === "Vaksinasi Polio Serentak 2026",
    "Pengurutan Judul secara Ascending (A-Z)"
  );

  // 2. Uji Pengurutan Judul (Z-A)
  const byTitleDesc = sortArticles(mockArticles, "title", "desc");
  assert(
    byTitleDesc[0].title === "Vaksinasi Polio Serentak 2026" &&
      byTitleDesc[3].title === "Alur Distribusi Obat Puskesmas",
    "Pengurutan Judul secara Descending (Z-A)"
  );

  // 3. Uji Pengurutan Kategori (A-Z)
  const byCatAsc = sortArticles(mockArticles, "category", "asc");
  assert(
    byCatAsc[0].category.name === "Edukasi" &&
      byCatAsc[1].category.name === "Farmasi" &&
      byCatAsc[2].category.name === "Kegiatan" &&
      byCatAsc[3].category.name === "Kegiatan",
    "Pengurutan Kategori secara Ascending (A-Z)"
  );

  // 4. Uji Pengurutan Status (Terbit vs Draft)
  const byStatusAsc = sortArticles(mockArticles, "isPublished", "asc");
  assert(
    byStatusAsc[0].isPublished === true &&
      byStatusAsc[1].isPublished === true &&
      byStatusAsc[2].isPublished === false &&
      byStatusAsc[3].isPublished === false,
    "Pengurutan Status Publikasi secara Ascending (Terbit dahulu)"
  );

  const byStatusDesc = sortArticles(mockArticles, "isPublished", "desc");
  assert(
    byStatusDesc[0].isPublished === false &&
      byStatusDesc[1].isPublished === false &&
      byStatusDesc[2].isPublished === true &&
      byStatusDesc[3].isPublished === true,
    "Pengurutan Status Publikasi secara Descending (Draft dahulu)"
  );

  // 5. Uji Pengurutan Tanggal Terbit
  const byDateDesc = sortArticles(mockArticles, "publishedAt", "desc");
  assert(
    byDateDesc[0].id === "art-3" && // 2026-05-20 (terbaru)
      byDateDesc[1].id === "art-1" && // 2026-03-10
      byDateDesc[2].id === "art-4" && // 2026-02-05
      byDateDesc[3].id === "art-2", // 2026-01-15 (terlama)
    "Pengurutan Tanggal Terbit secara Descending (Terbaru dahulu)"
  );

  const byDateAsc = sortArticles(mockArticles, "publishedAt", "asc");
  assert(
    byDateAsc[0].id === "art-2" && // 2026-01-15 (terlama)
      byDateAsc[3].id === "art-3", // 2026-05-20 (terbaru)
    "Pengurutan Tanggal Terbit secara Ascending (Terlama dahulu)"
  );

  // 6. Uji Imutabilitas Array
  const originalSnapshot = JSON.stringify(mockArticles);
  sortArticles(mockArticles, "title", "asc");
  assert(
    JSON.stringify(mockArticles) === originalSnapshot,
    "Fungsi bersifat murni dan tidak memutasi array masukan asli"
  );

  console.log("\n✨ SELURUH 6 PENGUJIAN LOGIKA SORTING BERHASIL LULUS! ✨\n");
}

runTests().catch((err) => {
  console.error("Terjadi kesalahan:", err);
  process.exit(1);
});
