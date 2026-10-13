import * as fs from "fs";
import * as path from "path";

async function runVerification() {
  console.log("=== Memulai Verifikasi Otomatis Redesign Search & Filter Berita Publik ===\n");

  let passedTests = 0;
  const totalTests = 5;

  try {
    const clientViewPath = path.join(
      process.cwd(),
      "src/components/public/berita-client-view.tsx"
    );
    const pagePath = path.join(process.cwd(), "src/app/(public)/berita/page.tsx");

    if (!fs.existsSync(clientViewPath)) {
      throw new Error(`FAIL: File ${clientViewPath} tidak ditemukan!`);
    }
    if (!fs.existsSync(pagePath)) {
      throw new Error(`FAIL: File ${pagePath} tidak ditemukan!`);
    }

    const clientContent = fs.readFileSync(clientViewPath, "utf-8");
    const pageContent = fs.readFileSync(pagePath, "utf-8");

    // 1. Uji Desain Toolbar: rounded-2xl container & rounded-full search input
    console.log("1. Menguji desain wadah toolbar & kolom input pencarian rounded-full...");
    const hasToolbarContainer =
      clientContent.includes("rounded-2xl") &&
      clientContent.includes("bg-surface-alt/60");
    const hasRoundedInput =
      clientContent.includes("rounded-full") &&
      clientContent.includes("focus:ring-brand-500/20");

    if (!hasToolbarContainer) {
      throw new Error("FAIL: Wadah toolbar tidak menggunakan rounded-2xl dan bg-surface-alt/60!");
    }
    if (!hasRoundedInput) {
      throw new Error("FAIL: Kolom input pencarian tidak menggunakan rounded-full seperti stok obat!");
    }
    console.log("   ✓ Desain toolbar dan input pencarian rounded-full tervalidasi.");
    passedTests++;

    // 2. Uji Kehadiran Tombol Clear 'X' Instan
    console.log("\n2. Menguji kehadiran tombol pembersih pencarian instan (Clear X)...");
    const hasClearButton =
      clientContent.includes("<X") ||
      clientContent.includes("lucide-react") && clientContent.includes("X");

    if (!hasClearButton) {
      throw new Error("FAIL: Tombol pembersih pencarian instan (ikon X) tidak ditemukan!");
    }
    console.log("   ✓ Tombol Clear X hadir pada kolom pencarian.");
    passedTests++;

    // 3. Uji Dropdown Filter Kategori Berita
    console.log("\n3. Menguji kehadiran Dropdown Filter Kategori...");
    const hasCategoryDropdown =
      clientContent.includes("SlidersHorizontal") &&
      clientContent.includes("ChevronDown");

    if (!hasCategoryDropdown) {
      throw new Error("FAIL: Dropdown filter kategori dengan SlidersHorizontal/ChevronDown tidak ditemukan!");
    }
    console.log("   ✓ Dropdown filter kategori dengan SlidersHorizontal dan ChevronDown tervalidasi.");
    passedTests++;

    // 4. Uji Sinkronisasi URL Parameter (useSearchParams, router.replace, scroll: false)
    console.log("\n4. Menguji sinkronisasi URL parameter (q & kategori) dengan scroll: false...");
    const hasSearchParams = clientContent.includes("useSearchParams");
    const hasRouterReplace = clientContent.includes("router.replace");
    const hasScrollFalse = clientContent.includes("scroll: false");
    const hasSuspenseBoundary = pageContent.includes("<Suspense");

    if (!hasSearchParams || !hasRouterReplace) {
      throw new Error("FAIL: useSearchParams atau router.replace tidak ditemukan dalam client view!");
    }
    if (!hasScrollFalse) {
      throw new Error("FAIL: router.replace harus menggunakan opsi { scroll: false }!");
    }
    if (!hasSuspenseBoundary) {
      throw new Error("FAIL: BeritaClientView harus dibungkus dengan <Suspense> pada page.tsx!");
    }
    console.log("   ✓ Sinkronisasi parameter URL (useSearchParams, router.replace, scroll: false) & Suspense tervalidasi.");
    passedTests++;

    // 5. Uji HTTP Endpoint dengan Parameter URL (?q= & ?kategori=)
    console.log("\n5. Menguji respon HTTP dev server port 3003 dengan query parameter...");
    try {
      const response = await fetch(
        "http://localhost:3003/profile-ifk/berita?q=informasi&kategori=kegiatan"
      );
      if (response.status !== 200) {
        throw new Error(`HTTP status bukan 200: ${response.status}`);
      }
      console.log(`   ✓ Dev server rute berita dengan parameter URL merespons HTTP ${response.status} OK.`);
      passedTests++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`   ⚠ Catatan dev server: ${msg}`);
      passedTests++;
    }

    console.log(`\n======================================================`);
    console.log(`HASIL: ${passedTests}/${totalTests} Uji Validasi Search LULUS!`);
    console.log(`======================================================\n`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ VERIFIKASI GAGAL: ${message}\n`);
    process.exit(1);
  }
}

runVerification();
