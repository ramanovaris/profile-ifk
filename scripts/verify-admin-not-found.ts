/**
 * Skrip verifikasi HTTP untuk halaman 404 Kustom Admin bertema Dark Ethereal.
 */
export async function runAdminNotFoundVerification() {
  const targetUrl = "http://localhost:3003/profile-ifk/admin/halaman-tidak-ada-acak-999/";
  console.log(`[TEST] Menguji 404 Admin: ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Cookie: "ifk_session=test-mock-session-cookie",
      },
    });

    console.log(`[TEST] Status HTTP respons: ${res.status}`);
    const html = await res.text();

    const expectedPatterns = [
      { name: "Judul Halaman Admin Tidak Ditemukan", pattern: /Halaman Admin Tidak Ditemukan/i },
      { name: "Identitas Panel Administrasi", pattern: /Panel Administrasi IFK Kotabaru/i },
      { name: "Tombol Kembali ke Dashboard", pattern: /Kembali ke Dashboard/i },
      { name: "Tombol Menuju Beranda Publik", pattern: /Menuju Beranda Publik/i },
      { name: "Badge 404", pattern: /404/ },
    ];

    let allPassed = true;
    for (const { name, pattern } of expectedPatterns) {
      if (pattern.test(html)) {
        console.log(`  ✅ LULUS: ${name}`);
      } else {
        console.error(`  ❌ GAGAL: Pola '${name}' tidak ditemukan!`);
        allPassed = false;
      }
    }

    if (!allPassed) {
      process.exit(1);
    }

    console.log("\n✨ SEMUA VERIFIKASI ADMIN 404 (DARK ETHEREAL) BERHASIL!");
  } catch (err) {
    console.error("[ERROR] Gagal menguji admin 404:", err);
    process.exit(1);
  }
}

runAdminNotFoundVerification();
