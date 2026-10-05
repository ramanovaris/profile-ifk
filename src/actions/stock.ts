"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { getCurrentSession } from "../lib/auth";
import { calculateStockStatus } from "../lib/dummy-data";
import { calculateMos, determineStockStatus, aggregateHistoricalUsage } from "../lib/stock-calc";
import { parseStockWorkbook, type StockItemInput } from "../lib/stock-parser";
import type { MedicineStock, StockStatus } from "@prisma/client";

export type { StockItemInput };

export type StockActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
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
    let period = data.period?.trim();
    if (!period) {
      const latest = await db.medicineStock.findFirst({
        select: { period: true },
        orderBy: { period: "desc" },
      });
      period = latest?.period || "2026-06";
    }
    const existing = await db.medicineStock.findFirst({
      where: { period, code: trimmedCode },
    });

    if (existing) {
      return {
        success: false,
        error: `Kode obat '${trimmedCode}' sudah digunakan oleh '${existing.name}' pada periode ${period}. Gunakan kode lain.`,
      };
    }

    const avgUsage = data.avgUsage !== undefined && data.avgUsage !== null ? Number(data.avgUsage) : 0;
    const mos =
      data.mos !== undefined && data.mos !== null
        ? Number(data.mos)
        : calculateMos(quantity, avgUsage);
    const expiryDate = data.expiryDate ? data.expiryDate.trim() : null;
    const nomenklatur = data.nomenklatur ? data.nomenklatur.trim() : null;
    const source = data.source ? data.source.trim() : "MANUAL";
    const calculatedStatus = determineStockStatus(quantity, mos, data.status as StockStatus | undefined);

    const created = await db.medicineStock.create({
      data: {
        period,
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
      const codeDuplicate = await db.medicineStock.findFirst({
        where: { period: existing.period, code: trimmedCode },
      });
      if (codeDuplicate && codeDuplicate.id !== id) {
        return {
          success: false,
          error: `Kode obat '${trimmedCode}' sudah digunakan oleh obat lain pada periode ${existing.period}.`,
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
      data.mos !== undefined && data.mos !== null
        ? Number(data.mos)
        : calculateMos(quantity, avgUsage);
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

    const calculatedStatus = determineStockStatus(quantity, mos, data.status as StockStatus | undefined);

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
 * Server Action: Menghapus atau mereset seluruh data stok obat pada satu periode tertentu (Issue #111).
 */
export async function deleteStockPeriodAction(
  period: string,
  options?: { _testUserId?: string }
): Promise<StockActionResult<{ period: string; count: number }>> {
  if (!options?._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  const trimmed = period?.trim();
  if (!trimmed || !/^\d{4}-\d{2}$/.test(trimmed)) {
    return {
      success: false,
      error: "Format periode tidak valid (harus YYYY-MM).",
    };
  }

  try {
    const result = await db.medicineStock.deleteMany({
      where: { period: trimmed },
    });

    try {
      await db.stockPeriod.deleteMany({
        where: { period: trimmed },
      });
    } catch {
      // Safe fallback jika model stock_periods belum ada
    }

    try {
      revalidatePath("/admin/stok");
      revalidatePath("/stok");
    } catch {
      // Safe fallback di luar request context
    }

    return {
      success: true,
      data: {
        period: trimmed,
        count: result.count,
      },
      count: result.count,
    };
  } catch (err: unknown) {
    console.error("[deleteStockPeriodAction] Error:", err);
    return {
      success: false,
      error: "Gagal menghapus data periode obat.",
    };
  }
}

/**
 * Server Action: Batch import atau sinkronisasi massal data stok obat.
 */
export async function batchImportStockAction(
  items: StockItemInput[],
  options?: { _testUserId?: string; defaultPeriod?: string }
): Promise<StockActionResult<{ inserted: number; updated: number; period: string }>> {
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

    // Ambil seluruh data obat eksisting untuk pencocokan cerdas berbasis nama & pencegahan bentrok kode
    const existingRecords = await db.medicineStock.findMany();

    const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

    // Peta nama obat -> kode yang pernah dipakai di periode mana pun (agar kodenya konsisten antar periode)
    const globalCodeByName = new Map<string, string>();
    for (const record of existingRecords) {
      const norm = normalizeName(record.name);
      if (!globalCodeByName.has(norm)) {
        globalCodeByName.set(norm, record.code);
      }
    }

    // Peta per periode:
    const byPeriodAndName = new Map<string, (typeof existingRecords)[number]>();
    const byPeriodAndCode = new Map<string, (typeof existingRecords)[number]>();
    const periodCounters = new Map<string, { ind: number; prg: number; stk: number }>();

    for (const record of existingRecords) {
      const p = record.period;
      byPeriodAndName.set(`${p}::${normalizeName(record.name)}`, record);
      byPeriodAndCode.set(`${p}::${record.code.trim().toLowerCase()}`, record);

      if (!periodCounters.has(p)) {
        periodCounters.set(p, { ind: 0, prg: 0, stk: 0 });
      }
      const c = periodCounters.get(p)!;
      const indMatch = record.code.match(/^IND-(\d+)$/i);
      if (indMatch) c.ind = Math.max(c.ind, parseInt(indMatch[1], 10));
      const prgMatch = record.code.match(/^PRG-(\d+)$/i);
      if (prgMatch) c.prg = Math.max(c.prg, parseInt(prgMatch[1], 10));
      const stkMatch = record.code.match(/^STK-(\d+)$/i);
      if (stkMatch) c.stk = Math.max(c.stk, parseInt(stkMatch[1], 10));
    }

    let primaryPeriod = options?.defaultPeriod || "2026-06";

    for (const item of items) {
      const name = item.name?.trim();
      const code = item.code?.trim();
      if (!name) continue;

      const targetPeriod = item.period || options?.defaultPeriod || "2026-06";
      primaryPeriod = targetPeriod;

      if (!periodCounters.has(targetPeriod)) {
        periodCounters.set(targetPeriod, { ind: 0, prg: 0, stk: 0 });
      }
      const counters = periodCounters.get(targetPeriod)!;

      const normName = normalizeName(name);
      const matchedInPeriod = byPeriodAndName.get(`${targetPeriod}::${normName}`);

      let targetId: string | null = null;
      let finalCode = code || "";

      if (matchedInPeriod) {
        // Obat dengan nama yang sama sudah ada di periode ini: perbarui data dan pertahankan kode
        targetId = matchedInPeriod.id;
        finalCode = matchedInPeriod.code;
      } else {
        // Obat baru di periode ini:
        // Cek apakah obat ini pernah punya kode di periode lain agar konsisten
        const existingCode = globalCodeByName.get(normName);
        if (existingCode) {
          finalCode = existingCode;
        } else if (!code) {
          counters.stk++;
          finalCode = `STK-${String(counters.stk).padStart(3, "0")}`;
        }

        // Pastikan finalCode belum terpakai oleh obat LAIN di periode ini
        const codeTaken = byPeriodAndCode.get(`${targetPeriod}::${finalCode.toLowerCase()}`);
        if (codeTaken && normalizeName(codeTaken.name) !== normName) {
          if (finalCode.toUpperCase().startsWith("IND-")) {
            counters.ind++;
            finalCode = `IND-${String(counters.ind).padStart(3, "0")}`;
          } else if (finalCode.toUpperCase().startsWith("PRG-")) {
            counters.prg++;
            finalCode = `PRG-${String(counters.prg).padStart(3, "0")}`;
          } else {
            counters.stk++;
            finalCode = `STK-${String(counters.stk).padStart(3, "0")}`;
          }
        }
      }

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

      if (targetId) {
        const updatedRecord = await db.medicineStock.update({
          where: { id: targetId },
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
        byPeriodAndName.set(`${targetPeriod}::${normName}`, updatedRecord);
        byPeriodAndCode.set(`${targetPeriod}::${updatedRecord.code.toLowerCase()}`, updatedRecord);
        globalCodeByName.set(normName, updatedRecord.code);
        updated++;
      } else {
        const createdRecord = await db.medicineStock.create({
          data: {
            period: targetPeriod,
            code: finalCode,
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
        byPeriodAndName.set(`${targetPeriod}::${normName}`, createdRecord);
        byPeriodAndCode.set(`${targetPeriod}::${createdRecord.code.toLowerCase()}`, createdRecord);
        globalCodeByName.set(normName, createdRecord.code);
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
      data: { inserted, updated, period: primaryPeriod },
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
 * Server Action: Mengunggah dan mengimpor file Excel (.xlsx, .xls) atau CSV (.csv).
 */
export async function importStockFileAction(
  formData: FormData,
  options?: { _testUserId?: string; defaultPeriod?: string }
): Promise<StockActionResult<{ inserted: number; updated: number; total: number; period: string }>> {
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
    const periodFromForm = formData.get("period") as string | null;
    const defaultPeriod = periodFromForm?.trim() || options?.defaultPeriod;
    const items = parseStockWorkbook(buffer, defaultPeriod);

    if (items.length === 0) {
      return {
        success: false,
        error: "Tidak ada baris data obat yang dapat diurai dari file tersebut. Pastikan format file sesuai.",
      };
    }

    const res = await batchImportStockAction(items, { ...options, defaultPeriod });
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
        period: res.data?.period || "2026-06",
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

/**
 * Server Action: Mengambil daftar periode pelaporan unik yang tersedia di basis data.
 */
export async function getStockPeriodsAction(): Promise<string[]> {
  try {
    const [periodsFromStock, periodsFromList] = await Promise.all([
      db.medicineStock.findMany({
        select: { period: true },
        distinct: ["period"],
        orderBy: { period: "desc" },
      }),
      db.stockPeriod.findMany({
        select: { period: true },
        orderBy: { period: "desc" },
      }),
    ]);
    const merged = Array.from(
      new Set([
        ...periodsFromList.map((r) => r.period),
        ...periodsFromStock.map((r) => r.period),
      ])
    ).sort().reverse();
    return merged.length > 0 ? merged : ["2026-06"];
  } catch (err) {
    console.error("[getStockPeriodsAction] Error:", err);
    return ["2026-06"];
  }
}

export interface MedicineHistoryItem {
  code: string;
  name: string;
  category: string;
  unit: string;
  nomenklatur?: string | null;
  historicalAvgUsage: number;
  sampleCount: number;
  recentPeriods: string[];
}

/**
 * Server Action: Mencari riwayat obat dari periode sebelumnya (hingga 12 bulan terakhir)
 * untuk mengagregasikan nilai Rata-rata Pemakaian (RPB) dan menyajikan saran master data.
 */
export async function searchMedicineHistoryAction(params: {
  query: string;
  currentPeriod?: string;
}): Promise<StockActionResult<MedicineHistoryItem[]>> {
  const trimmed = params.query?.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: true, data: [] };
  }

  try {
    const whereClause: Record<string, unknown> = {
      OR: [
        { code: { contains: trimmed, mode: "insensitive" } },
        { name: { contains: trimmed, mode: "insensitive" } },
      ],
    };

    if (params.currentPeriod) {
      whereClause.period = { not: params.currentPeriod };
    }

    const matches = await db.medicineStock.findMany({
      where: whereClause,
      orderBy: { period: "desc" },
      take: 100,
    });

    // Kelompokkan per kode obat
    const grouped = new Map<string, typeof matches>();
    for (const item of matches) {
      const key = item.code.trim().toUpperCase();
      const existing = grouped.get(key) || [];
      existing.push(item);
      grouped.set(key, existing);
    }

    const results: MedicineHistoryItem[] = [];
    grouped.forEach((items) => {
      items.sort((a, b) => b.period.localeCompare(a.period));
      const latest = items[0];
      const last12Items = items.slice(0, 12);
      const agg = aggregateHistoricalUsage(last12Items);

      results.push({
        code: latest.code,
        name: latest.name,
        category: latest.category,
        unit: latest.unit,
        nomenklatur: latest.nomenklatur,
        historicalAvgUsage: agg.avgUsage,
        sampleCount: agg.count,
        recentPeriods: last12Items.map((i) => i.period),
      });
    });

    return { success: true, data: results.slice(0, 10) };
  } catch (err) {
    console.error("[searchMedicineHistoryAction] Error:", err);
    return {
      success: false,
      error: "Gagal menelusuri riwayat obat dari database.",
      data: [],
    };
  }
}

export interface CreateStockPeriodInput {
  targetPeriod: string;
  mode: "COPY" | "BLANK";
  sourcePeriod?: string;
  _testUserId?: string;
}

/**
 * Server Action: Membuat/menginisialisasi periode pelaporan stok baru secara manual.
 * - Mode 'COPY': Menyalin seluruh master data obat dari sourcePeriod dengan kuantitas = 0, status = EMPTY.
 * - Mode 'BLANK': Menginisialisasi periode kosong untuk input mandiri bertahap.
 */
export async function createStockPeriodAction(
  data: CreateStockPeriodInput
): Promise<StockActionResult<{ period: string; count: number }>> {
  if (!data._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  const targetPeriod = data.targetPeriod?.trim();
  if (!targetPeriod || !/^\d{4}-\d{2}$/.test(targetPeriod)) {
    return {
      success: false,
      error: "Format periode tidak valid (harus YYYY-MM, contoh: 2026-08).",
    };
  }

  try {
    // 1. Cek apakah targetPeriod sudah terdaftar di database
    const [periodRecord, existingCount] = await Promise.all([
      db.stockPeriod.findUnique({
        where: { period: targetPeriod },
      }),
      db.medicineStock.count({
        where: { period: targetPeriod },
      }),
    ]);

    if (periodRecord || existingCount > 0) {
      return {
        success: false,
        error: `Periode '${targetPeriod}' sudah terdaftar di sistem. Gunakan periode lain.`,
      };
    }

    // Daftarkan periode secara permanen
    await db.stockPeriod.create({
      data: { period: targetPeriod },
    });

    if (data.mode === "COPY") {
      const sourcePeriod = data.sourcePeriod?.trim();
      if (!sourcePeriod) {
        return {
          success: false,
          error: "Periode sumber harus dipilih untuk menyalin master data obat.",
        };
      }

      const sourceMedicines = await db.medicineStock.findMany({
        where: { period: sourcePeriod },
        orderBy: { name: "asc" },
      });

      if (sourceMedicines.length === 0) {
        return {
          success: false,
          error: `Tidak ada data obat pada periode sumber '${sourcePeriod}' untuk disalin.`,
        };
      }

      // Hindari duplikasi kode jika pada sumber terdapat kode yang sama
      const seenCodes = new Set<string>();
      const recordsToInsert = [];

      for (const med of sourceMedicines) {
        const normalizedCode = med.code.trim().toUpperCase();
        if (seenCodes.has(normalizedCode)) continue;
        seenCodes.add(normalizedCode);

        recordsToInsert.push({
          period: targetPeriod,
          code: med.code,
          name: med.name,
          category: med.category,
          unit: med.unit,
          quantity: 0,
          status: "EMPTY" as const,
          avgUsage: med.avgUsage || 0,
          mos: null,
          expiryDate: null,
          nomenklatur: med.nomenklatur || null,
          source: "MANUAL",
        });
      }

      const batchResult = await db.medicineStock.createMany({
        data: recordsToInsert,
      });

      try {
        revalidatePath("/admin/stok");
        revalidatePath("/stok");
      } catch {
        // Safe fallback di luar request context
      }

      return {
        success: true,
        data: {
          period: targetPeriod,
          count: batchResult.count,
        },
      };
    }

    // Mode BLANK: Mengesahkan periode baru kosong
    try {
      revalidatePath("/admin/stok");
      revalidatePath("/stok");
    } catch {
      // Safe fallback di luar request context
    }

    return {
      success: true,
      data: {
        period: targetPeriod,
        count: 0,
      },
    };
  } catch (err) {
    console.error("[createStockPeriodAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan pada basis data saat membuat periode baru.",
    };
  }
}

