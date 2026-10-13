/**
 * Skrip pengujian mandiri pencarian obat cerdas berbasis fonetik dan alias sinonim (Issue #137)
 * Jalankan: npx tsx scripts/verify-medicine-search.ts
 */

import {
  matchMedicineSearch,
  normalizeMedicinePhonetic,
  expandMedicineSearchQueries,
} from "../src/lib/medicine-search";

interface TestItem {
  id: string;
  name: string;
  code: string;
  category: string;
  nomenklatur?: string | null;
}

const mockDatabase: TestItem[] = [
  {
    id: "1",
    code: "OBT-001",
    name: "Amoksisilin Kaplet 500 mg",
    category: "Antibiotik",
    nomenklatur: "Amoxicillin 500 mg",
  },
  {
    id: "2",
    code: "OBT-002",
    name: "Parasetamol Tablet 500 mg",
    category: "Analgesik - Antipiretik",
    nomenklatur: "Paracetamol 500 mg",
  },
  {
    id: "3",
    code: "OBT-003",
    name: "Klorfeniramin Maleat Tablet 4 mg",
    category: "Antihistamin",
    nomenklatur: "Chlorpheniramine Maleate 4 mg",
  },
  {
    id: "4",
    code: "OBT-004",
    name: "Gliseril Guaiakolat Tablet 100 mg",
    category: "Ekspektoran",
    nomenklatur: "Guaifenesin 100 mg",
  },
  {
    id: "5",
    code: "OBT-005",
    name: "Isoniazid Tablet 300 mg",
    category: "Antituberkulosis",
    nomenklatur: "Isoniazidum",
  },
  {
    id: "6",
    code: "OBT-006",
    name: "Tiamin HCl (Vitamin B1) Tablet 50 mg",
    category: "Vitamin dan Mineral",
    nomenklatur: "Thiamine Hydrochloride 50 mg",
  },
  {
    id: "7",
    code: "OBT-007",
    name: "Siprofloksasin Tablet 500 mg",
    category: "Antibiotik",
    nomenklatur: "Ciprofloxacin 500 mg",
  },
  {
    id: "8",
    code: "OBT-008",
    name: "Doksisiklin Kapsul 100 mg",
    category: "Antibiotik",
    nomenklatur: "Doxycycline 100 mg",
  },
  {
    id: "9",
    code: "OBT-009",
    name: "Asam Askorbat (Vitamin C) Tablet 50 mg",
    category: "Vitamin dan Mineral",
    nomenklatur: "Ascorbic Acid 50 mg",
  },
  {
    id: "10",
    code: "OBT-010",
    name: "Antasida Doen Tablet Kunyah",
    category: "Antasida",
    nomenklatur: "Antasida Doen",
  },
];

interface TestCase {
  query: string;
  expectedIds: string[];
  description: string;
}

const testCases: TestCase[] = [
  // 1. Exact match & substring
  {
    query: "Parasetamol",
    expectedIds: ["2"],
    description: "Exact substring nama resmi",
  },
  {
    query: "OBT-001",
    expectedIds: ["1"],
    description: "Pencarian berdasarkan kode obat",
  },
  {
    query: "Antibiotik",
    expectedIds: ["1", "7", "8"],
    description: "Pencarian berdasarkan kategori",
  },

  // 2. Transliterasi Fonetik Ejaan Inggris (EN)
  {
    query: "amoxicillin",
    expectedIds: ["1"],
    description: "Ejaan Inggris: 'amoxicillin' cocok dengan 'Amoksisilin'",
  },
  {
    query: "paracetamol",
    expectedIds: ["2"],
    description: "Ejaan Inggris: 'paracetamol' cocok dengan 'Parasetamol'",
  },
  {
    query: "thiamine",
    expectedIds: ["6"],
    description: "Ejaan Inggris: 'thiamine' cocok dengan 'Tiamin'",
  },
  {
    query: "ciprofloxacin",
    expectedIds: ["7"],
    description: "Ejaan Inggris: 'ciprofloxacin' cocok dengan 'Siprofloksasin'",
  },
  {
    query: "doxycycline",
    expectedIds: ["8"],
    description: "Ejaan Inggris: 'doxycycline' cocok dengan 'Doksisiklin'",
  },

  // 3. Ejaan Populer / Variasi Ketikan
  {
    query: "amoksilin",
    expectedIds: ["1"],
    description: "Variasi populer: 'amoksilin' cocok dengan 'Amoksisilin'",
  },
  {
    query: "paraset",
    expectedIds: ["2"],
    description: "Potongan awalan nama: 'paraset' cocok dengan 'Parasetamol'",
  },

  // 4. Akronim & Singkatan Apotek / Medis
  {
    query: "pct",
    expectedIds: ["2"],
    description: "Akronim apotek: 'pct' cocok dengan 'Parasetamol'",
  },
  {
    query: "ctm",
    expectedIds: ["3"],
    description: "Akronim apotek: 'ctm' cocok dengan 'Klorfeniramin Maleat'",
  },
  {
    query: "gg",
    expectedIds: ["4"],
    description: "Akronim apotek: 'gg' cocok dengan 'Gliseril Guaiakolat'",
  },
  {
    query: "inh",
    expectedIds: ["5"],
    description: "Akronim apotek: 'inh' cocok dengan 'Isoniazid'",
  },
  {
    query: "vit c",
    expectedIds: ["9"],
    description: "Variasi vitamin: 'vit c' cocok dengan 'Vitamin C'",
  },
  {
    query: "antasid",
    expectedIds: ["10"],
    description: "Variasi antasid: 'antasid' cocok dengan 'Antasida Doen'",
  },
];

console.log("=== MEMULAI PENGUJIAN PENCARIAN OBAT CERDAS (ISSUE #137) ===\n");

let passedCount = 0;
let failedCount = 0;

for (const tc of testCases) {
  const matches = mockDatabase.filter((item) =>
    matchMedicineSearch(item, tc.query)
  );
  const matchedIds = matches.map((m) => m.id);

  const isSuccess =
    tc.expectedIds.every((id) => matchedIds.includes(id)) &&
    matchedIds.length >= tc.expectedIds.length;

  if (isSuccess) {
    console.log(`✅ [PASS] "${tc.query}" -> ${tc.description} (Ditemukan: ${matchedIds.join(", ")})`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] "${tc.query}" -> ${tc.description}`);
    console.error(`   Ekspektasi mengandung ID: [${tc.expectedIds.join(", ")}]`);
    console.error(`   Hasil didapat:           [${matchedIds.join(", ")}]`);
    failedCount++;
  }
}

// Uji helper expandMedicineSearchQueries untuk Server Action
console.log("\n--- Menguji Helper Server Action expandMedicineSearchQueries ---");
const expandedPct = expandMedicineSearchQueries("pct");
const expandedAmox = expandMedicineSearchQueries("amoxicillin");

if (expandedPct.some((q) => q.toLowerCase().includes("parasetamol"))) {
  console.log(`✅ [PASS] expandMedicineSearchQueries("pct") mencakup "parasetamol"`);
  passedCount++;
} else {
  console.error(`❌ [FAIL] expandMedicineSearchQueries("pct") tidak mencakup "parasetamol"`);
  failedCount++;
}

if (expandedAmox.some((q) => q.toLowerCase().includes("amoksisilin"))) {
  console.log(`✅ [PASS] expandMedicineSearchQueries("amoxicillin") mencakup "amoksisilin"`);
  passedCount++;
} else {
  console.error(`❌ [FAIL] expandMedicineSearchQueries("amoxicillin") tidak mencakup "amoksisilin"`);
  failedCount++;
}

console.log(`\n========================================`);
console.log(`HASIL: ${passedCount} LULUS, ${failedCount} GAGAL`);
console.log(`========================================`);

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
