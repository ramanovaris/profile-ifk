/**
 * Utilitas pencarian nama obat cerdas berbasis normalisasi fonetik dan alias sinonim farmasi.
 * Dirancang ringan, deterministik, dan tanpa dependensi eksternal (Issue #137).
 */

export interface StockSearchableItem {
  name: string;
  code?: string;
  category?: string;
  nomenklatur?: string | null;
}

/**
 * Kamus relasi alias dan akronim istilah farmasi lazim (Puskesmas / IFK).
 * Disusun dua arah atau dipetakan ke istilah resminya.
 */
export const MEDICINE_SYNONYMS: Record<string, string[]> = {
  // Singkatan Apotek Populer
  pct: ["parasetamol", "paracetamol", "panadol", "acetaminophen"],
  ctm: ["klorfeniramin", "chlorpheniramine", "chlorpheniramin"],
  gg: ["gliseril guaiakolat", "guaifenesin", "glyceryl guaiacolate"],
  inh: ["isoniazid", "isoniazidum"],
  oat: [
    "antituberkulosis",
    "tuberkulosis",
    "isoniazid",
    "rifampisin",
    "pirazinamid",
    "etambutol",
  ],
  obh: ["obat batuk hitam", "succus liquiritiae"],
  oralit: ["garam oralit", "rehidrasi oral"],

  // Vitamin & Suplemen
  "vit c": ["vitamin c", "asam askorbat", "ascorbic acid"],
  vitc: ["vitamin c", "asam askorbat", "ascorbic acid"],
  "vit b1": ["vitamin b1", "tiamin", "thiamine"],
  vitb1: ["vitamin b1", "tiamin", "thiamine"],
  "vit b6": ["vitamin b6", "piridoksin", "pyridoxine"],
  vitb6: ["vitamin b6", "piridoksin", "pyridoxine"],
  "vit b12": ["vitamin b12", "sianokobalamin", "cyanocobalamin"],
  vitb12: ["vitamin b12", "sianokobalamin", "cyanocobalamin"],
  "vit b complex": ["vitamin b kompleks", "b-kompleks"],
  "vit b kompleks": ["vitamin b kompleks", "b-complex"],
  "vit a": ["vitamin a", "retinol"],
  vita: ["vitamin a", "retinol"],

  // Variasi Ejaan Populer / Latin
  amoksilin: ["amoksisilin", "amoxicillin", "amoxan"],
  amoksisilin: ["amoxicillin", "amoksilin"],
  amoxicillin: ["amoksisilin", "amoksilin"],

  paraset: ["parasetamol", "paracetamol"],
  parasetamol: ["paracetamol", "pct", "panadol"],
  paracetamol: ["parasetamol", "pct"],

  antasid: ["antasida", "antasida doen", "antacid"],
  antacid: ["antasida", "antasida doen"],
  antasida: ["antacid", "antasida doen"],

  klorfeniramin: ["chlorpheniramine", "ctm"],
  chlorpheniramine: ["klorfeniramin", "ctm"],

  siprofloksasin: ["ciprofloxacin"],
  ciprofloxacin: ["siprofloksasin"],

  doksisiklin: ["doxycycline"],
  doxycycline: ["doksisiklin"],

  tiamin: ["thiamine", "vitamin b1"],
  thiamine: ["tiamin", "vitamin b1"],

  "asam mefenamat": ["mefenamic acid"],
  "mefenamic acid": ["asam mefenamat"],

  hcl: ["hidroklorida", "hydrochloride"],
  hidroklorida: ["hydrochloride", "hcl"],
};

/**
 * Normalisasi teks ke bentuk fonetik representasi kanonikal farmasi (EN/ID).
 * Contoh:
 * - "amoxicillin" -> "amoksisilin"
 * - "thiamine" -> "tiamin"
 * - "phosphate" -> "fosfat"
 * - "chlorpheniramine" -> "klorfeniramin"
 */
export function normalizeMedicinePhonetic(input: string): string {
  if (!input || typeof input !== "string") return "";

  let text = input.toLowerCase().trim();

  // 1. Hapus tanda baca/simbol non-alfanumerik kecuali spasi
  text = text.replace(/[^a-z0-9\s]/g, " ");

  // 2. Normalisasi sufiks farmasi lazim EN -> ID
  text = text
    .replace(/ine\b/g, "in") // thiamine -> tiamin, doxycycline -> doksisiklin
    .replace(/ate\b/g, "at") // phosphate -> fosfat, maleate -> maleat
    .replace(/ide\b/g, "id") // chloride -> klorid
    .replace(/ic\b/g, "at"); // ascorbic -> askorbat (konteks asam)

  // 3. Normalisasi digraf & konsonan spesifik fonetik farmasi
  text = text
    .replace(/ph/g, "f") // phosphate -> fosfat
    .replace(/th/g, "t") // thiamine -> tiamin
    .replace(/ch/g, "k") // chlorpheniramine -> klorfeniramin
    .replace(/x/g, "ks") // amoxicillin -> amoksisilin
    .replace(/y/g, "i") // doxycycline -> doksisiklin
    .replace(/q/g, "k");

  // 4. Huruf 'c' lunak (sebelum e, i) menjadi 's', selebihnya menjadi 'k'
  text = text
    .replace(/c(?=[ei])/g, "s") // cefixime -> sefiksim, ciprofloxacin -> siprofloksasin
    .replace(/c/g, "k"); // curcuma -> kurkuma

  // 5. Reduksi konsonan ganda berulang (ll -> l, ss -> s, mm -> m, dll)
  text = text.replace(/([b-df-hj-np-tv-z])\1+/g, "$1");

  // 6. Kompresi spasi
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Memperluas query pencarian dengan sinonim/alias dari kamus farmasi.
 * Berguna untuk pencarian cepat dan query database Server Actions.
 */
export function expandMedicineSearchQueries(rawQuery: string): string[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results = new Set<string>();
  results.add(query);

  // Cek kecocokan langsung di kamus
  if (MEDICINE_SYNONYMS[query]) {
    for (const syn of MEDICINE_SYNONYMS[query]) {
      results.add(syn);
    }
  }

  // Cek apakah query ada di salah satu kata dalam entri kamus
  for (const [key, synonyms] of Object.entries(MEDICINE_SYNONYMS)) {
    if (query === key || synonyms.includes(query)) {
      results.add(key);
      for (const syn of synonyms) {
        results.add(syn);
      }
    }
  }

  return Array.from(results);
}

/**
 * Evaluator utama pencocokan obat cerdas 3 tingkat:
 * 1. Substring exact
 * 2. Ekspansi alias/sinonim farmasi
 * 3. Transliterasi fonetik kanonikal
 */
export function matchMedicineSearch(
  item: StockSearchableItem,
  rawQuery: string
): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const targetName = (item.name || "").toLowerCase();
  const targetCode = (item.code || "").toLowerCase();
  const targetCategory = (item.category || "").toLowerCase();
  const targetNomenklatur = (item.nomenklatur || "").toLowerCase();

  // Lapis 1: Exact substring match (paling cepat)
  if (
    targetName.includes(query) ||
    targetCode.includes(query) ||
    targetCategory.includes(query) ||
    targetNomenklatur.includes(query)
  ) {
    return true;
  }

  // Lapis 2: Kamus alias / sinonim farmasi
  const expandedQueries = expandMedicineSearchQueries(query);
  for (const q of expandedQueries) {
    if (
      targetName.includes(q) ||
      targetCode.includes(q) ||
      targetCategory.includes(q) ||
      targetNomenklatur.includes(q)
    ) {
      return true;
    }
  }

  // Lapis 3: Penyetaraan fonetik kanonikal
  const phoneticQuery = normalizeMedicinePhonetic(query);
  if (phoneticQuery.length >= 3) {
    const phoneticName = normalizeMedicinePhonetic(targetName);
    const phoneticNomenklatur = normalizeMedicinePhonetic(targetNomenklatur);

    if (
      phoneticName.includes(phoneticQuery) ||
      phoneticNomenklatur.includes(phoneticQuery)
    ) {
      return true;
    }

    // Periksa juga bentuk fonetik dari ekspansi alias
    for (const q of expandedQueries) {
      const qPhonetic = normalizeMedicinePhonetic(q);
      if (
        qPhonetic.length >= 3 &&
        (phoneticName.includes(qPhonetic) ||
          phoneticNomenklatur.includes(qPhonetic))
      ) {
        return true;
      }
    }
  }

  return false;
}
