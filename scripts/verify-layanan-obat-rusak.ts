import * as assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";

const layananPath = path.resolve(__dirname, "../src/app/(public)/layanan/page.tsx");
const content = fs.readFileSync(layananPath, "utf-8");

console.log("Checking src/app/(public)/layanan/page.tsx content...");

// 1. Check eyebrow
assert.ok(
  content.includes("Karantina &amp; Pemusnahan"),
  "Must include eyebrow 'Karantina &amp; Pemusnahan'"
);

// 2. Check card title
assert.ok(
  content.includes("Prosedur Penanganan Obat Rusak / Kedaluwarsa"),
  "Must include 'Prosedur Penanganan Obat Rusak / Kedaluwarsa'"
);

// 3. Ensure no occurrence of 'retur' or 'Retur'
const returMatches = content.match(/\bretur\b/i);
assert.strictEqual(
  returMatches,
  null,
  `Found unexpected 'retur' occurrence: ${returMatches}`
);

// 4. Ensure no occurrence of 'pengembalian'
const pengembalianMatches = content.match(/\bpengembalian\b/i);
assert.strictEqual(
  pengembalianMatches,
  null,
  `Found unexpected 'pengembalian' occurrence: ${pengembalianMatches}`
);

// 5. Check item with 'berat'
assert.ok(
  content.includes("Rincian nama, jumlah, berat, batch, ED"),
  "Must include 'Rincian nama, jumlah, berat, batch, ED'"
);

// 6. Check Mei & H-1 mechanism
assert.ok(
  content.includes("Periode &amp; Konfirmasi"),
  "Must include 'Periode &amp; Konfirmasi'"
);
assert.ok(
  content.includes("bulan Mei"),
  "Must mention 'bulan Mei'"
);
assert.ok(
  content.includes("minimal H-1"),
  "Must mention 'minimal H-1'"
);

console.log("✓ All content assertions passed: section is clean of 'retur' & 'pengembalian', includes 'berat', 'bulan Mei', and 'H-1'.");
