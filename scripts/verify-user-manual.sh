#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "🧪 UJI INTEGRITAS DOKUMEN PANDUAN PENGGUNAAN APLIKASI"
echo "========================================================"

TARGET_FILE="docs/PANDUAN_PENGGUNAAN.md"
README_FILE="README.md"
ERRORS=0

# 1. Cek keberadaan berkas
if [[ ! -f "$TARGET_FILE" ]]; then
  echo "❌ FAIL: Berkas $TARGET_FILE tidak ditemukan!"
  exit 1
fi
echo "✅ PASS: Berkas $TARGET_FILE ditemukan."

# 2. Cek jumlah baris berkas (harus komprehensif > 150 baris)
LINE_COUNT=$(wc -l < "$TARGET_FILE")
if [[ "$LINE_COUNT" -lt 150 ]]; then
  echo "❌ FAIL: Berkas panduan terlalu singkat ($LINE_COUNT baris). Minimal 150 baris!"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Panjang berkas memadai ($LINE_COUNT baris)."
fi

# 3. Cek keberadaan 4 Bab Utama
for BAB in "Bab I: Pengenalan Aplikasi" \
           "Bab II: Panduan Pengguna Publik dan Fasilitas Kesehatan" \
           "Bab III: Petunjuk Operasional Administrator IFK" \
           "Bab IV: Tanya Jawab Umum dan Solusi Kendala"; do
  if grep -q "$BAB" "$TARGET_FILE"; then
    echo "✅ PASS: Bab terverifikasi -> $BAB"
  else
    echo "❌ FAIL: Bab tidak ditemukan -> $BAB"
    ERRORS=$((ERRORS + 1))
  fi
done

# 4. Cek tautan di README.md
if grep -q "docs/PANDUAN_PENGGUNAAN.md" "$README_FILE"; then
  echo "✅ PASS: Berkas $README_FILE telah menautkan $TARGET_FILE secara benar."
else
  echo "❌ FAIL: $README_FILE belum menautkan $TARGET_FILE!"
  ERRORS=$((ERRORS + 1))
fi

# 5. Cek string placeholder yang tidak tuntas
for PLACEHOLDER in "TODO" "TBD" "FIXME" "PLACEHOLDER"; do
  if grep -qi "$PLACEHOLDER" "$TARGET_FILE"; then
    echo "❌ FAIL: Ditemukan teks placeholder '$PLACEHOLDER' pada berkas panduan!"
    ERRORS=$((ERRORS + 1))
  fi
done
echo "✅ PASS: Bebas dari teks placeholder (TODO/TBD/FIXME)."

# 6. Validasi integritas anchor links pada Daftar Isi
echo "🔍 Memeriksa keabsahan seluruh tautan anchor Daftar Isi..."
node -e '
const fs = require("fs");
const content = fs.readFileSync("docs/PANDUAN_PENGGUNAAN.md", "utf8");

// Ekstrak semua heading
const headingRegex = /^#{1,6}\s+(.+)$/gm;
const headings = [];
let match;
while ((match = headingRegex.exec(content)) !== null) {
  headings.push(match[1].trim());
}

// Fungsi konversi heading ke github markdown anchor slug
function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // hapus tanda baca kecuali dash dan spasi
    .replace(/\s+/g, "-")      // ganti spasi dengan strip
    .replace(/-+/g, "-");      // normalkan multi strip
}

const slugSet = new Set(headings.map(h => toSlug(h)));

// Ekstrak semua link anchor format [Title](#slug)
const anchorRegex = /\[([^\]]+)\]\(#([^\)]+)\)/g;
let anchorMatch;
let missing = 0;
while ((anchorMatch = anchorRegex.exec(content)) !== null) {
  const title = anchorMatch[1];
  const slug = anchorMatch[2];
  if (!slugSet.has(slug)) {
    console.error(`❌ Anchor tidak cocok: [${title}](#${slug})`);
    missing++;
  }
}

if (missing > 0) {
  console.error(`❌ Total anchor rusak: ${missing}`);
  process.exit(1);
} else {
  console.log("✅ PASS: Seluruh tautan anchor Daftar Isi valid dan cocok 100%!");
}
' || ERRORS=$((ERRORS + 1))

echo "--------------------------------------------------------"
if [[ "$ERRORS" -eq 0 ]]; then
  echo "🎉 SELURUH PENGUJIAN DOKUMEN PANDUAN LULUS (ALL PASS)!"
  exit 0
else
  echo "💥 DITEMUKAN $ERRORS KESALAHAN PADA VERIFIKASI DOKUMEN!"
  exit 1
fi
