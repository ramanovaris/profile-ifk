import * as fs from "fs";
import * as path from "path";

/**
 * Skrip verifikasi statis & struktur komponen untuk src/app/(admin)/admin/error.tsx
 */
export async function runAdminErrorBoundaryVerification() {
  const filePath = path.join(process.cwd(), "src/app/(admin)/admin/error.tsx");
  console.log(`[TEST] Memeriksa berkas Admin Error Boundary di: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Berkas ${filePath} belum dibuat!`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  const checks = [
    { name: "Directive 'use client'", test: content.startsWith('"use client"') || content.startsWith("'use client'") },
    { name: "Default Export Function", test: /export\s+default\s+function/i.test(content) },
    { name: "Props { error, reset }", test: /error/i.test(content) && /reset/i.test(content) },
    { name: "Tombol 'Coba Muat Ulang' (reset)", test: /Coba Muat Ulang/i.test(content) && /reset\(\)/i.test(content) },
    { name: "Tombol 'Kembali ke Dashboard'", test: /Dashboard/i.test(content) && /href=["']\/admin\/dashboard["']/i.test(content) },
    { name: "Tema Dark Ethereal (bg-zinc-950 atau bg-slate-950)", test: /bg-zinc-950|bg-slate-950/i.test(content) },
    { name: "Ikon Peringatan/Keamanan (ShieldAlert/AlertCircle)", test: /ShieldAlert|AlertCircle|AlertTriangle/i.test(content) },
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

  console.log("\n✨ SEMUA VERIFIKASI ADMIN ERROR BOUNDARY BERHASIL!");
}

runAdminErrorBoundaryVerification();
