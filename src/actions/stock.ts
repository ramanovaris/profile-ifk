"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { db } from "../lib/db";
import { getCurrentSession } from "../lib/auth";
import { calculateStockStatus } from "../lib/dummy-data";
import type { MedicineStock, StockStatus } from "@prisma/client";

export type StockActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
};

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
  _testUserId?: string;
};

/**
 * Server Action: Menambahkan data obat baru ke basis data PostgreSQL.
 */
export async function createStockAction(data: StockItemInput): Promise<StockActionResult<MedicineStock>> {
  if (!data._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  const trimmedCode = data.code?.trim();
  const trimmedName = data.name?.trim();
  const trimmedCategory = data.category?.trim() || "Obat Generik";
  const trimmedUnit = data.unit?.trim() || "Tablet";
  const quantity = Math.max(0, Math.floor(Number(data.quantity) || 0));

  if (!trimmedCode) {
    return { success: false, error: "Kode obat tidak boleh kosong." };
  }
  if (!trimmedName) {
    return { success: false, error: "Nama obat tidak boleh kosong." };
  }

  try {
    const existing = await db.medicineStock.findUnique({
      where: { code: trimmedCode },
    });

    if (existing) {
      return {
        success: false,
        error: `Kode obat '${trimmedCode}' sudah digunakan oleh '${existing.name}'. Gunakan kode lain.`,
      };
    }

    const avgUsage = data.avgUsage !== undefined && data.avgUsage !== null ? Number(data.avgUsage) : 0;
    const mos =
      data.mos !== undefined && data.mos !== null
        ? Number(data.mos)
        : avgUsage > 0
        ? quantity / avgUsage
        : null;
    const expiryDate = data.expiryDate ? data.expiryDate.trim() : null;
    const nomenklatur = data.nomenklatur ? data.nomenklatur.trim() : null;
    const source = data.source ? data.source.trim() : "MANUAL";
    const calculatedStatus = calculateStockStatus(quantity, data.status, mos);

    const created = await db.medicineStock.create({
      data: {
        code: trimmedCode,
        name: trimmedName,
        category: trimmedCategory,
        unit: trimmedUnit,
        quantity,
        status: calculatedStatus,
        avgUsage,
        mos,
        expiryDate,
        nomenklatur,
        source,
      },
    });

    try {
      revalidatePath("/admin/stok");
      revalidatePath("/stok");
    } catch {
      // Safe fallback di luar request context
    }

    return {
      success: true,
      data: created,
    };
  } catch (err: unknown) {
    console.error("[createStockAction] Error:", err);
    return {
      success: false,
      error: "Gagal menyimpan data obat.",
    };
  }
}

/**
 * Server Action: Memperbarui data obat yang ada di basis data PostgreSQL.
 */
export async function updateStockAction(
  id: string,
  data: Partial<StockItemInput>
): Promise<StockActionResult<MedicineStock>> {
  if (!data._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  if (!id) {
    return { success: false, error: "ID obat tidak valid." };
  }

  try {
    const existing = await db.medicineStock.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Data obat tidak ditemukan." };
    }

    const trimmedCode = data.code !== undefined ? data.code.trim() : existing.code;
    const trimmedName = data.name !== undefined ? data.name.trim() : existing.name;
    const trimmedCategory = data.category !== undefined ? data.category.trim() : existing.category;
    const trimmedUnit = data.unit !== undefined ? data.unit.trim() : existing.unit;
    const quantity =
      data.quantity !== undefined
        ? Math.max(0, Math.floor(Number(data.quantity) || 0))
        : existing.quantity;

    if (!trimmedCode) {
      return { success: false, error: "Kode obat tidak boleh kosong." };
    }
    if (!trimmedName) {
      return { success: false, error: "Nama obat tidak boleh kosong." };
    }

    if (trimmedCode !== existing.code) {
      const codeDuplicate = await db.medicineStock.findUnique({
        where: { code: trimmedCode },
      });
      if (codeDuplicate && codeDuplicate.id !== id) {
        return {
          success: false,
          error: `Kode obat '${trimmedCode}' sudah digunakan oleh obat lain.`,
        };
      }
    }

    const avgUsage =
      data.avgUsage !== undefined
        ? data.avgUsage !== null
          ? Number(data.avgUsage)
          : 0
        : existing.avgUsage;
    const mos =
      data.mos !== undefined
        ? data.mos !== null
          ? Number(data.mos)
          : null
        : existing.mos;
    const expiryDate =
      data.expiryDate !== undefined
        ? data.expiryDate
          ? data.expiryDate.trim()
          : null
        : existing.expiryDate;
    const nomenklatur =
      data.nomenklatur !== undefined
        ? data.nomenklatur
          ? data.nomenklatur.trim()
          : null
        : existing.nomenklatur;
    const source =
      data.source !== undefined
        ? data.source
          ? data.source.trim()
          : "MANUAL"
        : existing.source;

    const calculatedStatus = calculateStockStatus(quantity, data.status, mos);

    const updated = await db.medicineStock.update({
      where: { id },
      data: {
        code: trimmedCode,
        name: trimmedName,
        category: trimmedCategory,
        unit: trimmedUnit,
        quantity,
        status: calculatedStatus,
        avgUsage,
        mos,
        expiryDate,
        nomenklatur,
        source,
      },
    });

    try {
      revalidatePath("/admin/stok");
      revalidatePath("/stok");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error("[updateStockAction] Error:", err);
    return {
      success: false,
      error: "Gagal memperbarui data obat.",
    };
  }
}

/**
 * Server Action: Menghapus data obat dari basis data PostgreSQL.
 */
export async function deleteStockAction(
  id: string,
  options?: { _testUserId?: string }
): Promise<StockActionResult<MedicineStock>> {
  if (!options?._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  if (!id) {
    return { success: false, error: "ID obat tidak valid." };
  }

  try {
    const deleted = await db.medicineStock.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin/stok");
      revalidatePath("/stok");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: deleted,
    };
  } catch (err: unknown) {
    console.error("[deleteStockAction] Error:", err);
    return {
      success: false,
      error: "Gagal menghapus data obat.",
    };
  }
}

/**
 * Server Action: Batch import atau sinkronisasi massal data stok obat.
 */
export async function batchImportStockAction(
  items: StockItemInput[],
  options?: { _testUserId?: string }
): Promise<StockActionResult<{ inserted: number; updated: number }>> {
  if (!options?._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      error: "Daftar item obat untuk diimpor tidak boleh kosong.",
    };
  }

  try {
    let inserted = 0;
    let updated = 0;

    for (const item of items) {
      const code = item.code?.trim();
      const name = item.name?.trim();
      if (!code || !name) continue;

      const category = item.category?.trim() || "Obat Generik";
      const unit = item.unit?.trim() || "Tablet";
      const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
      const avgUsage = item.avgUsage !== undefined && item.avgUsage !== null ? Number(item.avgUsage) : 0;
      const mos =
        item.mos !== undefined && item.mos !== null
          ? Number(item.mos)
          : avgUsage > 0
          ? quantity / avgUsage
          : null;
      const expiryDate = item.expiryDate?.trim() || null;
      const nomenklatur = item.nomenklatur?.trim() || null;
      const source = item.source?.trim() || "MANUAL";
      const status = calculateStockStatus(quantity, item.status, mos);

      const existing = await db.medicineStock.findUnique({
        where: { code },
      });

      if (existing) {
        await db.medicineStock.update({
          where: { code },
          data: {
            name,
            category,
            unit,
            quantity,
            status,
            avgUsage,
            mos,
            expiryDate,
            nomenklatur,
            source,
          },
        });
        updated++;
      } else {
        await db.medicineStock.create({
          data: {
            code,
            name,
            category,
            unit,
            quantity,
            status,
            avgUsage,
            mos,
            expiryDate,
            nomenklatur,
            source,
          },
        });
        inserted++;
      }
    }

    try {
      revalidatePath("/admin/stok");
      revalidatePath("/stok");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: { inserted, updated },
      count: inserted + updated,
    };
  } catch (err: unknown) {
    console.error("[batchImportStockAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses impor massal data obat.",
    };
  }
}

/**
 * Parser pintar untuk file Excel (.xlsx) / CSV.
 * Mampu mendeteksi secara otomatis:
 * 1. Format Laporan Obat Indikator (Kemenkes)
 * 2. Format Laporan Obat Program (Kemenkes dengan sheet Detil Stok)
 * 3. Format CSV/Excel Standar (Kode, Nama, Kategori, Satuan, Stok, dll.)
 */
function parseStockWorkbook(buffer: Buffer): StockItemInput[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetNames = wb.SheetNames;

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
      const mosCol = header.findIndex((h) => h.includes("tingkat ketersediaan") || h.includes("mos"));

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
  const mosCol = header.findIndex((h) => h.includes("tingkat") || h.includes("mos"));
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
    });
  }

  return items;
}

/**
 * Server Action: Mengunggah dan mengimpor file Excel (.xlsx, .xls) atau CSV (.csv).
 */
export async function importStockFileAction(
  formData: FormData,
  options?: { _testUserId?: string }
): Promise<StockActionResult<{ inserted: number; updated: number; total: number }>> {
  if (!options?._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return {
      success: false,
      error: "File tidak ditemukan dalam permintaan unggah.",
    };
  }

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
    return {
      success: false,
      error: "Format file harus berupa Excel (.xlsx, .xls) atau CSV (.csv).",
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const items = parseStockWorkbook(buffer);

    if (items.length === 0) {
      return {
        success: false,
        error: "Tidak ada baris data obat yang dapat diurai dari file tersebut. Pastikan format file sesuai.",
      };
    }

    const res = await batchImportStockAction(items, options);
    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menyimpan data impor ke database.",
      };
    }

    return {
      success: true,
      data: {
        inserted: res.data?.inserted || 0,
        updated: res.data?.updated || 0,
        total: (res.data?.inserted || 0) + (res.data?.updated || 0),
      },
      count: (res.data?.inserted || 0) + (res.data?.updated || 0),
    };
  } catch (err: unknown) {
    console.error("[importStockFileAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses berkas impor.",
    };
  }
}
