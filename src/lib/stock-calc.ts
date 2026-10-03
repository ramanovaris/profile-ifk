import type { StockStatus } from "./dummy-data";

/**
 * Menghitung Months of Supply (MOS) / Kecukupan Stok dalam satuan bulan:
 * MOS = Stok Fisik / Rata-rata Pemakaian Bulanan (RPB)
 *
 * Mengembalikan:
 * - 0.0 jika stok fisik <= 0
 * - null jika RPB kosong, nol, atau tidak valid (mencegah pembagian nol)
 * - number presisi 1 desimal jika valid
 */
export function calculateMos(
  quantity: number,
  avgUsage: number | null | undefined
): number | null {
  const safeQty = Number(quantity);
  if (isNaN(safeQty) || safeQty <= 0) {
    return 0.0;
  }

  if (
    avgUsage === null ||
    avgUsage === undefined ||
    isNaN(Number(avgUsage)) ||
    Number(avgUsage) <= 0
  ) {
    return null;
  }

  const mos = safeQty / Number(avgUsage);
  return Number(mos.toFixed(1));
}

/**
 * Menentukan status ketersediaan obat berdasarkan stok fisik dan nilai MOS:
 * - Kuantitas fisik <= 0 => "EMPTY" (Kosong)
 * - Jika MOS tersedia:
 *   - MOS < 3.0 => "LOW" (Menipis / Perlu Pengadaan)
 *   - MOS >= 3.0 => "AVAILABLE" (Tersedia / Aman)
 * - Jika MOS tidak tersedia (RPB belum diinput/kosong):
 *   - Menghormati manualStatus jika diberikan
 *   - Fallback: kuantitas < 500 => "LOW", kuantitas >= 500 => "AVAILABLE"
 */
export function determineStockStatus(
  quantity: number,
  mos: number | null | undefined,
  manualStatus?: StockStatus
): StockStatus {
  const safeQty = Number(quantity) || 0;
  if (safeQty <= 0) {
    return "EMPTY";
  }

  if (mos !== null && mos !== undefined && !isNaN(Number(mos))) {
    return Number(mos) < 3.0 ? "LOW" : "AVAILABLE";
  }

  if (manualStatus && manualStatus !== "EMPTY") {
    return manualStatus;
  }

  return safeQty < 500 ? "LOW" : "AVAILABLE";
}

/**
 * Menghitung nilai agregasi Rata-rata Pemakaian Bulanan (RPB)
 * dari periode-periode historis sebelumnya (hingga 12 bulan terakhir).
 */
export function aggregateHistoricalUsage(
  records: Array<{ period?: string; avgUsage?: number | null }>
): { avgUsage: number; count: number } {
  if (!records || records.length === 0) {
    return { avgUsage: 0, count: 0 };
  }

  const validUsage = records
    .map((r) => Number(r.avgUsage))
    .filter((u) => !isNaN(u) && u > 0);

  if (validUsage.length === 0) {
    return { avgUsage: 0, count: 0 };
  }

  const total = validUsage.reduce((acc, curr) => acc + curr, 0);
  const avg = total / validUsage.length;

  return {
    avgUsage: Number(avg.toFixed(1)),
    count: validUsage.length,
  };
}
