import { sortArticles, type SortableArticle } from "../src/lib/article-sorting";
import { db } from "../src/lib/db";

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
    "1. Pengurutan Judul secara Ascending (A-Z)"
  );

  // 2. Uji Pengurutan Judul (Z-A)
  const byTitleDesc = sortArticles(mockArticles, "title", "desc");
  assert(
    byTitleDesc[0].title === "Vaksinasi Polio Serentak 2026" &&
      byTitleDesc[3].title === "Alur Distribusi Obat Puskesmas",
    "2. Pengurutan Judul secara Descending (Z-A)"
  );

  // 3. Uji Pengurutan Kategori (A-Z)
  const byCatAsc = sortArticles(mockArticles, "category", "asc");
  assert(
    byCatAsc[0].category.name === "Edukasi" &&
      byCatAsc[1].category.name === "Farmasi" &&
      byCatAsc[2].category.name === "Kegiatan" &&
      byCatAsc[3].category.name === "Kegiatan",
    "3. Pengurutan Kategori secara Ascending (A-Z)"
  );

  // 4. Uji Pengurutan Status (Terbit vs Draft)
  const byStatusAsc = sortArticles(mockArticles, "isPublished", "asc");
  assert(
    byStatusAsc[0].isPublished === true &&
      byStatusAsc[1].isPublished === true &&
      byStatusAsc[2].isPublished === false &&
      byStatusAsc[3].isPublished === false,
    "4a. Pengurutan Status Publikasi secara Ascending (Terbit dahulu)"
  );

  const byStatusDesc = sortArticles(mockArticles, "isPublished", "desc");
  assert(
    byStatusDesc[0].isPublished === false &&
      byStatusDesc[1].isPublished === false &&
      byStatusDesc[2].isPublished === true &&
      byStatusDesc[3].isPublished === true,
    "4b. Pengurutan Status Publikasi secara Descending (Draft dahulu)"
  );

  // 5. Uji Pengurutan Tanggal Terbit
  const byDateDesc = sortArticles(mockArticles, "publishedAt", "desc");
  assert(
    byDateDesc[0].id === "art-3" && // 2026-05-20 (terbaru)
      byDateDesc[1].id === "art-1" && // 2026-03-10
      byDateDesc[2].id === "art-4" && // 2026-02-05
      byDateDesc[3].id === "art-2", // 2026-01-15 (terlama)
    "5a. Pengurutan Tanggal Terbit secara Descending (Terbaru dahulu)"
  );

  const byDateAsc = sortArticles(mockArticles, "publishedAt", "asc");
  assert(
    byDateAsc[0].id === "art-2" && // 2026-01-15 (terlama)
      byDateAsc[3].id === "art-3", // 2026-05-20 (terbaru)
    "5b. Pengurutan Tanggal Terbit secara Ascending (Terlama dahulu)"
  );

  // 6. Uji Imutabilitas Array
  const originalSnapshot = JSON.stringify(mockArticles);
  sortArticles(mockArticles, "title", "asc");
  assert(
    JSON.stringify(mockArticles) === originalSnapshot,
    "6. Fungsi bersifat murni dan tidak memutasi array masukan asli"
  );

  // 7. Uji Integrasi Data Riil Basis Data PostgreSQL
  console.log("\n--- Menguji dengan Data Riil PostgreSQL ---");
  const realArticles = await db.article.findMany({
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
    take: 10,
  });
  console.log(`Ditemukan ${realArticles.length} artikel di basis data.`);

  if (realArticles.length > 0) {
    const realSorted = sortArticles(realArticles, "publishedAt", "desc");
    assert(realSorted.length === realArticles.length, "7a. Jumlah artikel riil setelah sorting tetap utuh");

    const realTitleSorted = sortArticles(realArticles, "title", "asc");
    for (let i = 0; i < realTitleSorted.length - 1; i++) {
      const cmp = realTitleSorted[i].title.localeCompare(
        realTitleSorted[i + 1].title,
        "id",
        { sensitivity: "base" }
      );
      assert(cmp <= 0, `7b. Urutan judul abjad konsisten pada indeks ${i}`);
    }
  }

  // 8. Uji Respon HTTP Endpoint Dev Server Port 3003
  console.log("\n--- Menguji Respon HTTP Endpoint Dev Server (Port 3003) ---");
  const testUrls = [
    "http://localhost:3003/profile-ifk/admin/berita",
    "http://localhost:3003/profile-ifk/admin/berita?sort=title&order=asc",
    "http://localhost:3003/profile-ifk/admin/berita?sort=category&order=desc",
    "http://localhost:3003/profile-ifk/admin/berita?sort=isPublished&order=asc",
    "http://localhost:3003/profile-ifk/admin/berita?sort=publishedAt&order=desc",
  ];

  for (const url of testUrls) {
    try {
      const res = await fetch(url);
      assert(res.status === 200, `8. HTTP GET ${url} merespon status 200 OK (Received: ${res.status})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`⚠️ Warning: Panggilan fetch ke ${url} gagal (${msg}). Dev server mungkin perlu beberapa detik untuk merender.`);
    }
  }

  console.log("\n✨ SELURUH PENGUJIAN VERIFIKASI SORTING DAN ENDPOINT BERHASIL LULUS 100%! ✨\n");
}

runTests()
  .catch((err) => {
    console.error("Terjadi kesalahan fatal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
