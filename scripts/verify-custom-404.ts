/**
 * Skrip verifikasi HTTP untuk halaman 404 Kustom IFK Kotabaru.
 * Menjalankan pengecekan GET request pada dev server (port 3003).
 */
async function run() {
  const targetUrl = "http://localhost:3003/profile-ifk/halaman-uji-coba-pasti-tidak-ada-12345/";
  console.log(`[TEST] Menguji URL rute tidak ditemukan: ${targetUrl}`);

  try {
    const res = await fetch(targetUrl);
    console.log(`[TEST] Status HTTP respons: ${res.status} (diharapkan: 404)`);

    if (res.status !== 404) {
      console.error(`[FAIL] Status bukan 404! Mendapatkan ${res.status}`);
      process.exit(1);
    }

    const html = await res.text();

    const expectedPatterns = [
      { name: "Status 404", pattern: /404/ },
      { name: "Judul Halaman Tidak Ditemukan", pattern: /Halaman Tidak Ditemukan/i },
      { name: "Pesan Ramah Pengguna", pattern: /tidak dapat ditemukan|pindah|tersedia/i },
      { name: "Tombol Kembali ke Beranda", pattern: /Kembali ke Beranda/i },
      { name: "Tombol Cek Stok Obat", pattern: /Ketersediaan Obat|Stok Obat/i },
      { name: "Identitas IFK", pattern: /Instalasi Farmasi/i },
    ];

    let allPassed = true;
    for (const { name, pattern } of expectedPatterns) {
      if (pattern.test(html)) {
        console.log(`  ✅ LULUS: ${name}`);
      } else {
        console.error(`  ❌ GAGAL: Pola '${name}' tidak ditemukan dalam respons HTML!`);
        allPassed = false;
      }
    }

    if (!allPassed) {
      process.exit(1);
    }

    console.log("\n✨ SEMUA VERIFIKASI HALAMAN 404 KUSTOM BERHASIL!");
  } catch (err) {
    console.error("[ERROR] Gagal mengirim permintaan ke dev server:", err);
    process.exit(1);
  }
}

run();
