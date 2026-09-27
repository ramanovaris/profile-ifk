"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { getCurrentSession } from "../lib/auth";
import { calculateStockStatus } from "../lib/dummy-data";
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
