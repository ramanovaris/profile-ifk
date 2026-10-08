/**
 * Skrip verifikasi integrasi end-to-end menyeluruh untuk seluruh penanganan rute galat / 404.
 */
async function run() {
  const testEndpoints = [
    {
      name: "Rute Statis Tidak Ada",
      url: "http://localhost:3003/profile-ifk/rute-sembarang-pasti-tidak-ada-999/",
      expectedStatus: 404,
      keywords: ["Halaman Tidak Ditemukan", "Kembali ke Beranda", "Cek Ketersediaan Obat", "404"],
    },
    {
      name: "Rute Dinamis Berita Tidak Ada (notFound() trigger)",
      url: "http://localhost:3003/profile-ifk/berita/artikel-fiktif-sama-sekali-tidak-ada-xyz-777/",
      expectedStatus: 404,
      keywords: ["Halaman Tidak Ditemukan", "Kembali ke Beranda", "Cek Ketersediaan Obat", "404"],
    },
  ];

  console.log("=== PENGUJIAN INTEGRASI PENANGANAN ERROR & 404 ===\n");

  let allPassed = true;

  for (const test of testEndpoints) {
    console.log(`[TEST] ${test.name}`);
    console.log(`       Target: ${test.url}`);

    try {
      const res = await fetch(test.url);
      console.log(`       Status: ${res.status} (diharapkan: ${test.expectedStatus})`);

      if (res.status !== test.expectedStatus) {
        console.error(`       ❌ GAGAL: Status kode tidak sesuai!`);
        allPassed = false;
        continue;
      }

      const html = await res.text();
      let keywordsOk = true;

      for (const kw of test.keywords) {
        if (!html.includes(kw)) {
          console.error(`       ❌ GAGAL: Kata kunci '${kw}' tidak ditemukan dalam respons.`);
          keywordsOk = false;
          allPassed = false;
        }
      }

      if (keywordsOk) {
        console.log(`       ✅ LULUS: Respons 404 dan seluruh elemen antarmuka kustom terverifikasi!\n`);
      }
    } catch (err) {
      console.error(`       ❌ ERROR: Gagal menghubungi target:`, err);
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.error("❌ BEBERAPA PENGUJIAN INTEGRASI GAGAL!");
    process.exit(1);
  }

  console.log("🎉 SELURUH PENGUJIAN INTEGRASI 404 & ERROR PAGES BERHASIL 100%!");
}

run();
