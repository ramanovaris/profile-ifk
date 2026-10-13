import { calculateMos, determineStockStatus } from "./stock-calc";
import type { StockStatus, MedicineCategory } from "./dummy-data";

export interface AddStockFormData {
  code: string;
  name: string;
  category: MedicineCategory;
  unit: string;
  quantity: string;
  status: StockStatus;
  avgUsage: string;
  mos: string;
  expiryDate: string;
  nomenklatur: string;
}

export interface AutofilledSource {
  code: string;
  name: string;
  category: MedicineCategory;
  unit: string;
  nomenklatur: string;
  avgUsage: string;
}

export interface HistoryHint {
  message: string;
  type: "match" | "new" | "warning";
}

/**
 * Memetakan item riwayat obat ke state form dan menyimpan referensi sumber autofill.
 */
export function applyAutofillSelection(
  item: {
    code: string;
    name: string;
    category?: string;
    unit?: string;
    nomenklatur?: string | null;
    historicalAvgUsage?: number;
  },
  currentForm: AddStockFormData
): {
  form: AddStockFormData;
  autofilledSource: AutofilledSource;
} {
  const qty = Number(currentForm.quantity) || 0;
  const usage =
    item.historicalAvgUsage && item.historicalAvgUsage > 0
      ? item.historicalAvgUsage
      : 0;
  const newMos = calculateMos(qty, usage);
  const newStatus = determineStockStatus(qty, newMos, currentForm.status);

  const category = (item.category as MedicineCategory) || currentForm.category;
  const unit = item.unit || currentForm.unit;
  const nomenklatur = item.nomenklatur || "";
  const avgUsageStr = usage > 0 ? String(usage) : "";

  return {
    form: {
      ...currentForm,
      code: item.code,
      name: item.name,
      category,
      unit,
      nomenklatur,
      avgUsage: avgUsageStr,
      mos: newMos !== null && avgUsageStr !== "" ? String(newMos) : "",
      status: newStatus,
    },
    autofilledSource: {
      code: item.code,
      name: item.name,
      category,
      unit,
      nomenklatur,
      avgUsage: avgUsageStr,
    },
  };
}

/**
 * Dipanggil saat input nama obat berubah (onChange).
 * Jika pengguna mengetik nama yang berbeda dari asal autofill:
 * 1. Hapus status hint (historyHint = null).
 * 2. Reset field turunan yang identik dengan data autofill sebelumnya (code, avgUsage, mos, status, category, unit, nomenklatur).
 * 3. Bersihkan pelacak autofilledSource.
 */
export function handleNameInputChange(
  newName: string,
  currentForm: AddStockFormData,
  autofilledSource: AutofilledSource | null
): {
  form: AddStockFormData;
  autofilledSource: AutofilledSource | null;
  resetHint: boolean;
} {
  const isDifferentFromAutofill =
    autofilledSource !== null &&
    newName.trim().toLowerCase() !== autofilledSource.name.trim().toLowerCase();

  if (!isDifferentFromAutofill || !autofilledSource) {
    return {
      form: { ...currentForm, name: newName },
      autofilledSource,
      resetHint: false,
    };
  }

  // Nama berubah menjauhi data autofill -> reset field yang terasosiasi
  const qty = Number(currentForm.quantity) || 0;
  const isCodeFromAutofill =
    currentForm.code.trim().toUpperCase() ===
    autofilledSource.code.trim().toUpperCase();
  const isUsageFromAutofill =
    currentForm.avgUsage.trim() === autofilledSource.avgUsage.trim();
  const isNomenklaturFromAutofill =
    currentForm.nomenklatur.trim() === autofilledSource.nomenklatur.trim();
  const isCategoryFromAutofill =
    currentForm.category === autofilledSource.category;
  const isUnitFromAutofill = currentForm.unit === autofilledSource.unit;

  const nextAvgUsage = isUsageFromAutofill ? "" : currentForm.avgUsage;
  const nextUsageNum = nextAvgUsage !== "" ? Number(nextAvgUsage) : 0;
  const nextMos = calculateMos(qty, nextUsageNum);
  const nextStatus = determineStockStatus(qty, nextMos, currentForm.status);

  return {
    form: {
      ...currentForm,
      name: newName,
      code: isCodeFromAutofill ? "" : currentForm.code,
      category: isCategoryFromAutofill ? "Obat Generik" : currentForm.category,
      unit: isUnitFromAutofill ? "Tablet" : currentForm.unit,
      nomenklatur: isNomenklaturFromAutofill ? "" : currentForm.nomenklatur,
      avgUsage: nextAvgUsage,
      mos: nextMos !== null && nextAvgUsage !== "" ? String(nextMos) : "",
      status: nextStatus,
    },
    autofilledSource: null,
    resetHint: true,
  };
}

/**
 * Dipanggil saat input kode obat berubah (onChange).
 * Jika pengguna mengetik kode yang berbeda dari asal autofill:
 * 1. Hapus status hint.
 * 2. Reset field turunan yang terikat.
 * 3. Bersihkan pelacak autofilledSource.
 */
export function handleCodeInputChange(
  newCode: string,
  currentForm: AddStockFormData,
  autofilledSource: AutofilledSource | null
): {
  form: AddStockFormData;
  autofilledSource: AutofilledSource | null;
  resetHint: boolean;
} {
  const isDifferentFromAutofill =
    autofilledSource !== null &&
    newCode.trim().toUpperCase() !== autofilledSource.code.trim().toUpperCase();

  if (!isDifferentFromAutofill || !autofilledSource) {
    return {
      form: { ...currentForm, code: newCode },
      autofilledSource,
      resetHint: false,
    };
  }

  const qty = Number(currentForm.quantity) || 0;
  const isNameFromAutofill =
    currentForm.name.trim().toLowerCase() ===
    autofilledSource.name.trim().toLowerCase();
  const isUsageFromAutofill =
    currentForm.avgUsage.trim() === autofilledSource.avgUsage.trim();
  const isNomenklaturFromAutofill =
    currentForm.nomenklatur.trim() === autofilledSource.nomenklatur.trim();

  const nextAvgUsage = isUsageFromAutofill ? "" : currentForm.avgUsage;
  const nextUsageNum = nextAvgUsage !== "" ? Number(nextAvgUsage) : 0;
  const nextMos = calculateMos(qty, nextUsageNum);
  const nextStatus = determineStockStatus(qty, nextMos, currentForm.status);

  return {
    form: {
      ...currentForm,
      code: newCode,
      name: isNameFromAutofill ? "" : currentForm.name,
      nomenklatur: isNomenklaturFromAutofill ? "" : currentForm.nomenklatur,
      avgUsage: nextAvgUsage,
      mos: nextMos !== null && nextAvgUsage !== "" ? String(nextMos) : "",
      status: nextStatus,
    },
    autofilledSource: null,
    resetHint: true,
  };
}
