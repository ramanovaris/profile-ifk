import * as fs from "fs";
import * as path from "path";

/**
 * Skrip verifikasi statis & struktur komponen untuk src/app/(public)/error.tsx
 */
async function run() {
  const filePath = path.join(process.cwd(), "src/app/(public)/error.tsx");
  console.log(`[TEST] Memeriksa berkas Public Error Boundary di: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Berkas ${filePath} belum dibuat!`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  const checks = [
    { name: "Directive 'use client'", test: content.startsWith('"use client"') || content.startsWith("'use client'") },
    { name: "Default Export Function", test: /export\s+default\s+function/i.test(content) },
    { name: "Props { error, reset }", test: /error/i.test(content) && /reset/i.test(content) },
    { name: "Tombol 'Coba Lagi' (reset)", test: /Coba Lagi/i.test(content) && /reset\(\)/i.test(content) },
    { name: "Tombol 'Kembali ke Beranda'", test: /Kembali ke Beranda/i.test(content) && /href=["']\/["']/i.test(content) },
    { name: "Penanganan error.digest", test: /digest/i.test(content) },
    { name: "Ikon Peringatan (AlertTriangle/AlertCircle)", test: /AlertTriangle|AlertCircle/i.test(content) },
  ];

  let allPassed = true;
  for (const check of checks) {
    if (check.test) {
      console.log(`  ✅ LULUS: ${check.name}`);
    } else {
      console.error(`  ❌ GAGAL: ${check.name}`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    process.exit(1);
  }

  console.log("\n✨ SEMUA VERIFIKASI PUBLIC ERROR BOUNDARY BERHASIL!");
}

run();
