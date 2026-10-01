import * as XLSX from "xlsx";
import {
  type MedicineStockItem,
  formatStockCutoffDate,
  formatStockPeriodLabel,
  getItemEffectiveStatus,
} from "./dummy-data";

export interface StockExportOptions {
  filterSummary?: string;
  fileName?: string;
}

/**
 * Format tanggal sekarang dalam bahasa Indonesia
 */
function getIndonesianDateString(date: Date = new Date()): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

/**
 * Membangun objek Workbook Excel (SheetJS) untuk rekap data ketersediaan stok obat.
 * Dibuat sebagai pure function agar mudah diuji secara otomatis dan dipakai di lingkungan browser/node.
 */
export function buildStockExcelWorkbook(
  items: MedicineStockItem[],
  period: string,
  options?: StockExportOptions
): XLSX.WorkBook {
  const periodLabel = formatStockPeriodLabel(period);
  const cutoffLabel = formatStockCutoffDate(period);
  const exportDate = getIndonesianDateString();
  const filterDesc = options?.filterSummary || "Semua Data (Tanpa Filter)";

  // Status mapping
  const statusLabels: Record<string, string> = {
    AVAILABLE: "Aman",
    LOW: "Menipis",
    EMPTY: "Kosong",
  };

  // Header dan Metadata
  const rows: (string | number | null | undefined)[][] = [
    ["PEMERINTAH KABUPATEN KOTABARU"],
    ["DINAS KESEHATAN — UPTD INSTALASI FARMASI"],
    ["REKAPITULASI KETERSEDIAAN OBAT & BMHP"],
    [`Periode Data: ${periodLabel} (${cutoffLabel}) | Tanggal Ekspor: ${exportDate}`],
    [`Filter Diterapkan: ${filterDesc}`],
    [], // Baris kosong pemisah
    [
      "No",
      "Kode Barang",
      "Nama Obat / BMHP",
      "Satuan",
      "Kategori",
      "Sisa Stok Fisik",
      "Rata-rata Pemakaian (RPB)",
      "Kecukupan Stok (Bulan)",
      "Status Ketersediaan",
    ],
  ];

  // Baris Data
  items.forEach((item, index) => {
    const effectiveStatus = getItemEffectiveStatus(item);
    const statusText = statusLabels[effectiveStatus] || effectiveStatus;
    const mosVal =
      item.mos !== undefined && item.mos !== null
        ? Number(Number(item.mos).toFixed(1))
        : "-";
    const rpbVal =
      item.avgUsage !== undefined && item.avgUsage !== null
        ? Number(Number(item.avgUsage).toFixed(2))
        : 0;

    rows.push([
      index + 1,
      item.code,
      item.name,
      item.unit,
      item.category,
      item.quantity,
      rpbVal,
      mosVal,
      statusText,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Lebar Kolom Otomatis yang Proporsional
  ws["!cols"] = [
    { wch: 6 }, // No
    { wch: 16 }, // Kode Barang
    { wch: 45 }, // Nama Obat
    { wch: 14 }, // Satuan
    { wch: 22 }, // Kategori
    { wch: 18 }, // Sisa Stok Fisik
    { wch: 26 }, // RPB
    { wch: 18 }, // MOS
    { wch: 20 }, // Status
  ];

  const wb = XLSX.utils.book_new();
  const safeSheetName = `Stok ${period.replace(/[^a-zA-Z0-9]/g, "-")}`.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

  return wb;
}

/**
 * Memicu pengunduhan langsung file Excel (.xlsx) di sisi browser.
 */
export function exportStockToExcel(
  items: MedicineStockItem[],
  period: string,
  options?: StockExportOptions
): void {
  if (!items || items.length === 0) {
    if (typeof window !== "undefined") {
      alert("Tidak ada data obat untuk diekspor pada filter yang dipilih.");
    }
    return;
  }

  const wb = buildStockExcelWorkbook(items, period, options);
  const fileName =
    options?.fileName || `Rekap-Stok-IFK-Kotabaru-${period}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
