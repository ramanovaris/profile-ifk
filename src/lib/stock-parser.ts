import * as XLSX from "xlsx";
import { calculateStockStatus, type StockStatus } from "./dummy-data";

export type StockItemInput = {
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  status?: StockStatus;
  avgUsage?: number | null;
  mos?: number | null;
  expiryDate?: string | null;
  nomenklatur?: string | null;
  source?: string | null;
  period?: string;
  _testUserId?: string;
};

export function detectPeriodFromWorkbook(wb: XLSX.WorkBook): string | null {
  const monthMap: Record<string, string> = {
    january: "01", januari: "01", jan: "01",
    february: "02", februari: "02", feb: "02",
    march: "03", maret: "03", mar: "03",
    april: "04", apr: "04",
    may: "05", mei: "05",
    june: "06", juni: "06", jun: "06",
    july: "07", juli: "07", jul: "07",
    august: "08", agustus: "08", aug: "08", agt: "08",
    september: "09", sep: "09",
    october: "10", oktober: "10", okt: "10",
    november: "11", nopember: "11", nov: "11",
    december: "12", desember: "12", des: "12",
  };

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
    for (let r = 0; r < Math.min(5, rows.length); r++) {
      const row = rows[r] || [];
      for (const cell of row) {
        if (typeof cell !== "string") continue;
        const text = cell.toLowerCase();

        const matchIso = text.match(/\b(20\d{2})[-_/\s](0[1-9]|1[0-2])\b/);
        if (matchIso) return `${matchIso[1]}-${matchIso[2]}`;

        const matchYearMonth = text.match(/\b(20\d{2})\s+([a-z]+)\b/);
        if (matchYearMonth && monthMap[matchYearMonth[2]]) {
          return `${matchYearMonth[1]}-${monthMap[matchYearMonth[2]]}`;
        }
        const matchMonthYear = text.match(/\b([a-z]+)\s+(20\d{2})\b/);
        if (matchMonthYear && monthMap[matchMonthYear[1]]) {
          return `${matchMonthYear[2]}-${monthMap[matchMonthYear[1]]}`;
        }
      }
    }
  }
  return null;
}

/**
 * Parser pintar untuk file Excel (.xlsx, .xls) / CSV (.csv).
 * Mampu mendeteksi secara otomatis:
 * 1. Format Laporan Obat Indikator (Kemenkes)
 * 2. Format Laporan Obat Program (Kemenkes dengan sheet Detil Stok)
 * 3. Format CSV/Excel Standar (Kode, Nama, Kategori, Satuan, Stok, dll.)
 */
export function parseStockWorkbook(buffer: Buffer, defaultPeriod?: string): StockItemInput[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetNames = wb.SheetNames;
  const detectedPeriod = detectPeriodFromWorkbook(wb) || defaultPeriod || "2026-06";

  // 1. Format: Obat Indikator
  if (sheetNames.includes("Obat Indikator")) {
    const ws = wb.Sheets["Obat Indikator"];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
    let headerIdx = -1;
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = (rows[i] as unknown[]) || [];
      if (row.some((c) => typeof c === "string" && c.toLowerCase().includes("nama obat"))) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx !== -1) {
      const rawHeader = (rows[headerIdx] as unknown[]) || [];
      const header: string[] = [];
      for (let c = 0; c < rawHeader.length; c++) {
        header.push(String(rawHeader[c] ?? "").trim().toLowerCase());
      }

      const nomCol = header.findIndex((h) => h.includes("nomenklatur"));
      const nameCol = header.findIndex((h) => h.includes("nama obat"));
      const stockCol = header.findIndex((h) => h.includes("sisa stok") || h.includes("stok"));
      const avgCol = header.findIndex((h) => h.includes("rata-rata") || h.includes("pemakaian"));
      const mosCol = header.findIndex((h) => h.includes("tingkat ketersediaan") || h.includes("mos") || h.includes("kecukupan"));

      const items: StockItemInput[] = [];
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i] as unknown[];
        if (!r || !r[nameCol]) continue;
        const name = String(r[nameCol]).trim().replace(/\r?\n/g, " ");
        if (!name) continue;

        const no = typeof r[0] === "number" ? r[0] : items.length + 1;
        const quantity = Math.max(0, Math.floor(Number(r[stockCol]) || 0));
        const avgUsage = avgCol !== -1 && r[avgCol] !== undefined ? Number(r[avgCol]) : 0;
        const mos =
          mosCol !== -1 && r[mosCol] !== undefined
            ? Number(r[mosCol])
            : avgUsage > 0
            ? quantity / avgUsage
            : null;
        const nomenklatur = nomCol !== -1 && r[nomCol] ? String(r[nomCol]).trim() : "Obat Esensial Dasar";

        const nLow = name.toLowerCase();
        let unit = "Tablet";
        if (nLow.includes("kaps")) unit = "Kapsul";
        else if (nLow.includes("krim") || nLow.includes("salep")) unit = "Tube";
        else if (nLow.includes("inj") || nLow.includes("infus"))
          unit = nLow.includes("amp") || nLow.includes("inj") ? "Ampul" : "Vial";
        else if (nLow.includes("susp") || nLow.includes("lar") || nLow.includes("tetes")) unit = "Botol";
        else if (nLow.includes("paket")) unit = "Paket";

        const code = `IND-${String(no).padStart(3, "0")}`;
        const status = calculateStockStatus(quantity, undefined, mos);

        items.push({
          code,
          name,
          category: "Obat Generik",
          unit,
          quantity,
          status,
          avgUsage: Number(avgUsage.toFixed(2)),
          mos: mos !== null && !isNaN(mos) ? Number(mos.toFixed(2)) : null,
          nomenklatur,
          source: "INDIKATOR",
          period: detectedPeriod,
        });
      }
      return items;
    }
  }

  // 2. Format: Laporan Obat Program
  if (sheetNames.includes("Laporan Obat Program")) {
    const wsProg = wb.Sheets["Laporan Obat Program"];
    const rowsProg = XLSX.utils.sheet_to_json<unknown[]>(wsProg, { header: 1 });

    const expMap: Record<number, string> = {};
    if (sheetNames.includes("Detil Stok")) {
      const wsDet = wb.Sheets["Detil Stok"];
      const rowsDet = XLSX.utils.sheet_to_json<unknown[]>(wsDet, { header: 1 });
      for (let i = 8; i < rowsDet.length; i++) {
        const r = rowsDet[i] as unknown[];
        if (r && typeof r[0] === "number" && r[4]) {
          const itemNo = r[0] as number;
          const expVal = String(r[4]).split(" ")[0];
          if (!expMap[itemNo]) {
            expMap[itemNo] = expVal;
          }
        }
      }
    }

    let headerIdx = -1;
    for (let i = 0; i < Math.min(10, rowsProg.length); i++) {
      const row = (rowsProg[i] as unknown[]) || [];
      if (row.some((c) => typeof c === "string" && c.toLowerCase().includes("nama obat"))) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx !== -1) {
      const rawHeader = (rowsProg[headerIdx] as unknown[]) || [];
      const header: string[] = [];
      for (let c = 0; c < rawHeader.length; c++) {
        header.push(String(rawHeader[c] ?? "").trim().toLowerCase());
      }

      const nameCol = header.findIndex((h) => h.includes("nama obat"));
      const unitCol = header.findIndex((h) => h.includes("satuan"));
      const stockCol = header.findIndex((h) => h.includes("sisa stok") || h.includes("stok"));
      const distCol = header.findIndex((h) => h.includes("distribusi") || h.includes("pemakaian"));

      const items: StockItemInput[] = [];
      for (let i = headerIdx + 1; i < rowsProg.length; i++) {
        const r = rowsProg[i] as unknown[];
        if (!r || !r[nameCol]) continue;
        const name = String(r[nameCol]).trim().replace(/\r?\n/g, " ");
        if (!name) continue;

        const itemNo =
          typeof r[1] === "number" ? r[1] : typeof r[0] === "number" ? r[0] : items.length + 1;
        const unit = unitCol !== -1 && r[unitCol] ? String(r[unitCol]).trim() : "Tablet";
        const quantity = Math.max(0, Math.floor(Number(r[stockCol]) || 0));
        const dist = distCol !== -1 && r[distCol] !== undefined ? Number(r[distCol]) : 0;
        const mos = dist > 0 ? quantity / dist : quantity === 0 ? 0 : null;
        const expiryDate = expMap[itemNo as number] || null;

        const code = `PRG-${String(itemNo).padStart(3, "0")}`;
        const status = calculateStockStatus(quantity, undefined, mos);

        let nom = "Obat Program Prioritas";
        const nLow = name.toLowerCase();
        if (nLow.includes("oralit") || nLow.includes("zinc")) nom = "Diare & Rehidrasi";
        else if (nLow.includes("albendazol") || nLow.includes("dec")) nom = "Filariasis & Cacingan";
        else if (
          nLow.includes("formula") ||
          nLow.includes("rutf") ||
          nLow.includes("mineral") ||
          nLow.includes("retinol") ||
          nLow.includes("anemi")
        )
          nom = "Gizi & Mikronutrien";
        else if (nLow.includes("sofosbuvir") || nLow.includes("daklatavir") || nLow.includes("elbasvir"))
          nom = "Hepatitis C";
        else if (nLow.includes("tenofovir") || nLow.includes("arv") || nLow.includes("kdt")) nom = "HIV / AIDS";
        else if (nLow.includes("oat")) nom = "Tuberkulosis (TBC)";
        else if (
          nLow.includes("mdt") ||
          nLow.includes("klofazimin") ||
          nLow.includes("dapson") ||
          nLow.includes("rifampisin")
        )
          nom = "Kusta (Lepra)";
        else if (nLow.includes("dhp") || nLow.includes("primakuin")) nom = "Malaria";
        else if (
          nLow.includes("diazepam") ||
          nLow.includes("haloperidol") ||
          nLow.includes("risperidon") ||
          nLow.includes("flufenazine") ||
          nLow.includes("amitriptilin") ||
          nLow.includes("triheksifenidil")
        )
          nom = "Kesehatan Jiwa";
        else if (
          nLow.includes("oksitosin") ||
          nLow.includes("metil ergometrin") ||
          nLow.includes("magnesium") ||
          nLow.includes("kalsium glukonat")
        )
          nom = "Kesehatan Ibu & Anak";

        items.push({
          code,
          name,
          category: "Obat Program",
          unit,
          quantity,
          status,
          avgUsage: Number(dist.toFixed(2)),
          mos: mos !== null && !isNaN(mos) ? Number(mos.toFixed(2)) : null,
          expiryDate,
          nomenklatur: nom,
          source: "PROGRAM",
          period: detectedPeriod,
        });
      }
      return items;
    }
  }

  // 3. Fallback: Format Standar (Sheet pertama / CSV)
  const firstSheet = wb.Sheets[sheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1 });
  if (rows.length < 2) return [];

  let headerIdx = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = (rows[i] as unknown[]) || [];
    if (row.some((c) => typeof c === "string" && c.toLowerCase().includes("nama"))) {
      headerIdx = i;
      break;
    }
  }

  const rawHeader = (rows[headerIdx] as unknown[]) || [];
  const header: string[] = [];
  for (let c = 0; c < rawHeader.length; c++) {
    header.push(String(rawHeader[c] ?? "").trim().toLowerCase());
  }

  const codeCol = header.findIndex((h) => h.includes("kode") || h.includes("code"));
  const nameCol = header.findIndex((h) => h.includes("nama") || h.includes("name"));
  const catCol = header.findIndex((h) => h.includes("kategori") || h.includes("category"));
  const unitCol = header.findIndex((h) => h.includes("satuan") || h.includes("unit"));
  const stockCol = header.findIndex(
    (h) => h.includes("stok") || h.includes("jumlah") || h.includes("quantity")
  );
  const avgCol = header.findIndex((h) => h.includes("rata") || h.includes("avg"));
  const mosCol = header.findIndex((h) => h.includes("tingkat") || h.includes("mos") || h.includes("kecukupan"));
  const expCol = header.findIndex((h) => h.includes("ed") || h.includes("kedaluwarsa") || h.includes("exp"));

  const items: StockItemInput[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    if (!r || nameCol === -1 || !r[nameCol]) continue;
    const name = String(r[nameCol]).trim();
    if (!name) continue;

    const code =
      codeCol !== -1 && r[codeCol]
        ? String(r[codeCol]).trim()
        : `STK-${String(items.length + 1).padStart(3, "0")}`;
    const category = catCol !== -1 && r[catCol] ? String(r[catCol]).trim() : "Obat Generik";
    const unit = unitCol !== -1 && r[unitCol] ? String(r[unitCol]).trim() : "Tablet";
    const quantity = stockCol !== -1 ? Math.max(0, Math.floor(Number(r[stockCol]) || 0)) : 0;
    const avgUsage = avgCol !== -1 && r[avgCol] !== undefined ? Number(r[avgCol]) : 0;
    const mos =
      mosCol !== -1 && r[mosCol] !== undefined
        ? Number(r[mosCol])
        : avgUsage > 0
        ? quantity / avgUsage
        : null;
    const expiryDate = expCol !== -1 && r[expCol] ? String(r[expCol]).trim() : null;

    items.push({
      code,
      name,
      category,
      unit,
      quantity,
      status: calculateStockStatus(quantity, undefined, mos),
      avgUsage: Number(avgUsage.toFixed(2)),
      mos: mos !== null && !isNaN(mos) ? Number(mos.toFixed(2)) : null,
      expiryDate,
      source: "MANUAL",
      period: detectedPeriod,
    });
  }

  return items;
}
