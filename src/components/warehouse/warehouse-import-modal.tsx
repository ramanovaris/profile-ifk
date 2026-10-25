"use client";

import React, { useState, useRef, useTransition } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, Loader2, CheckCircle2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { importWarehouseSpreadsheetAction } from "@/actions/warehouse";

interface WarehouseImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function WarehouseImportModal({
  open,
  onOpenChange,
  onImportSuccess,
}: WarehouseImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<
    Array<{
      code: string;
      name: string;
      unit: string;
      category?: string;
      rackId: string;
      levelCode: string;
      notes?: string;
    }>
  >([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ count: number; errors: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template CSV Download
  const handleDownloadTemplate = () => {
    const headers = "Kode;Nama;Satuan;Kategori;Kode Rak;Tingkat;Catatan";
    const sample1 = "OBT-001;Amoksisilin 500 mg Kaplet;Kotak/100;Antibiotik;SJ-R01;T2;Ambalan tengah";
    const sample2 = "ALK-001;Spuit 3cc Disposable;Kotak/100;Alkes;TD-R03;T1;Rak bawah steril";
    const sample3 = "VAK-001;Vaksin Hepatitis B;Vial;Vaksin;KT-R01;T1;Chiller 2-8C";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers, sample1, sample2, sample3].join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "template-denah-lokasi-ifk.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setParseError("File spreadsheet kosong atau hanya berisi baris judul.");
          return;
        }

        const delimiter = lines[0].includes(";") ? ";" : ",";
        const rows: typeof previewRows = [];

        // Lewati header baris 0
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
          if (cols.length >= 6) {
            rows.push({
              code: cols[0],
              name: cols[1],
              unit: cols[2] || "Pcs",
              category: cols[3] || undefined,
              rackId: cols[4],
              levelCode: cols[5],
              notes: cols[6] || undefined,
            });
          }
        }

        if (rows.length === 0) {
          setParseError("Format kolom tidak sesuai. Pastikan ada minimal 6 kolom (Kode;Nama;Satuan;Kategori;Kode Rak;Tingkat).");
          return;
        }

        setPreviewRows(rows);
      } catch {
        setParseError("Gagal membaca berkas. Pastikan file berformat CSV / UTF-8.");
      }
    };
    reader.readAsText(selected);
  };

  const handleExecuteImport = () => {
    if (previewRows.length === 0) return;

    startTransition(async () => {
      const res = await importWarehouseSpreadsheetAction(previewRows);
      if (res.success && res.data) {
        setImportResult({
          count: res.data.importedCount,
          errors: res.data.errors,
        });
        if (res.data.errors.length === 0) {
          onImportSuccess?.();
        }
      } else {
        setParseError(res.error || "Gagal melakukan impor data.");
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    setPreviewRows([]);
    setParseError(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileSpreadsheet className="w-5 h-5 text-[#455a26] dark:text-[#6e903c]" />
            Impor Pemetaan Lokasi Barang Gudang
          </DialogTitle>
          <DialogDescription className="text-xs">
            Unggah file spreadsheet CSV untuk menempatkan ratusan nama obat dan alkes ke rak fisik secara massal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Download Template Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                Belum punya format file?
              </span>
              <span className="text-slate-500 text-[11px]">
                Gunakan template standar agar pembacaan kolom akurat.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 transition-colors shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#455a26]" />
              Unduh Template
            </button>
          </div>

          {/* File Upload Drop Area */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#455a26] rounded-xl text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-zinc-900/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Pilih atau seret berkas CSV pemetaan ke sini
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Format file: CSV (dipisahkan titik koma atau koma)</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#455a26]" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{file.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {previewRows.length} baris barang terdeteksi
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Parse Error Notice */}
          {parseError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{parseError}</div>
            </div>
          )}

          {/* Import Success / Errors Result */}
          {importResult && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Berhasil mengimpor {importResult.count} pemetaan barang ke denah!
              </div>
              {importResult.errors.length > 0 && (
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-800/60 max-h-28 overflow-y-auto">
                  <div className="font-semibold mb-1">Catatan baris yang dilewati:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && !importResult && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Pratinjau Data (5 Baris Pertama):
              </div>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400">
                    <tr>
                      <th className="p-2">Kode</th>
                      <th className="p-2">Nama Barang</th>
                      <th className="p-2">Lokasi Rak</th>
                      <th className="p-2">Ambalan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {previewRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                        <td className="p-2 font-mono">{r.code}</td>
                        <td className="p-2 font-medium">{r.name}</td>
                        <td className="p-2 font-bold text-amber-600">{r.rackId}</td>
                        <td className="p-2 font-mono">{r.levelCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {importResult ? "Tutup" : "Batal"}
            </button>
            {previewRows.length > 0 && !importResult && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#455a26] text-white hover:bg-[#384a1e] transition-all shadow-sm disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Simpan {previewRows.length} Lokasi
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
