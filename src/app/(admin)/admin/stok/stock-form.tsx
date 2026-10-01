"use client";

import { useState, useRef, useTransition } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { importStockFileAction } from "@/actions/stock";
import { formatStockPeriodLabel } from "@/lib/dummy-data";

const MONTH_OPTIONS = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const YEAR_OPTIONS = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

interface StockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: (importedPeriod: string) => void;
  defaultPeriod?: string;
  availablePeriods?: string[];
}

export function StockForm({ 
  open, 
  onOpenChange, 
  onImportSuccess,
  defaultPeriod = "2026-08",
  availablePeriods = ["2026-08", "2026-07", "2026-06"],
}: StockFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetPeriod, setTargetPeriod] = useState<string>(defaultPeriod);
  const [prevDefaultPeriod, setPrevDefaultPeriod] = useState<string>(defaultPeriod);
  const [customMonth, setCustomMonth] = useState<string>(() => {
    const parts = defaultPeriod.split("-");
    return parts[1] || "09";
  });
  const [customYear, setCustomYear] = useState<string>(() => {
    const parts = defaultPeriod.split("-");
    return parts[0] || "2026";
  });
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (defaultPeriod !== prevDefaultPeriod) {
    setPrevDefaultPeriod(defaultPeriod);
    setTargetPeriod(defaultPeriod);
  }

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Kode,Nama Obat,Kategori,Satuan,Jumlah Stok,Pemakaian Rata-Rata,Kecukupan Stok (Bulan),ED,Nomenklatur\n" +
      "OBG-001,Paracetamol 500 mg,Obat Generik,Tablet,15000,1200,12.5,2028-06,Analgesik & Antipiretik\n" +
      "OBG-002,Amoxicillin 500 mg,Obat Generik,Kaplet,12000,2500,4.8,2027-12,Antibakteri Beta-Laktam\n" +
      "BMH-001,Infus Cairan Ringer Laktat (RL) 500 ml,BMHP / Alkes,Botol,4500,800,5.6,2028-01,Larutan Elektrolit Intravena\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_stok_ifk_kotabaru.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template CSV berhasil diunduh.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
        toast.error("Format file harus berupa Excel (.xlsx, .xls) atau CSV (.csv).");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImportFile = () => {
    if (!selectedFile) {
      toast.error("Silakan pilih file Excel atau CSV terlebih dahulu.");
      return;
    }

    const effectivePeriod = (
      targetPeriod === "custom" ? `${customYear}-${customMonth}` : targetPeriod
    ).trim();
    if (!effectivePeriod || !/^\d{4}-\d{2}$/.test(effectivePeriod)) {
      toast.error("Format periode tidak valid.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("period", effectivePeriod);

        const res = await importStockFileAction(formData);
        if (!res.success) {
          toast.error(res.error || "Gagal mengimpor data stok.");
          return;
        }

        const resolvedPeriod = res.data?.period || effectivePeriod;
        toast.success(
          `Impor berhasil: ${res.data?.inserted || 0} obat baru ditambahkan, ${res.data?.updated || 0} obat diperbarui pada periode ${formatStockPeriodLabel(resolvedPeriod)}.`
        );

        setSelectedFile(null);
        onOpenChange(false);
        if (onImportSuccess) {
          onImportSuccess(resolvedPeriod);
        }
      } catch (err: unknown) {
        console.error("Error import stock file:", err);
        toast.error("Gagal memproses berkas impor.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-50 sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-brand-400" />
            Import Data Stok Bulanan
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Unggah file spreadsheet Excel (.xlsx, .xls) atau CSV (.csv) data stok fisik per akhir bulan.
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="pt-3 pb-1 space-y-2">
          <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-400" />
              <span>Periode Target Impor</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">Otomatis sinkron ke tabel</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            <select
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value)}
              className="w-full h-9.5 rounded-xl border border-white/10 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 cursor-pointer"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p} className="bg-zinc-900 text-white">
                  {formatStockPeriodLabel(p)} ({p})
                </option>
              ))}
              <option value="custom" className="bg-zinc-900 text-brand-300">
                + Pilih Periode Baru...
              </option>
            </select>
            {targetPeriod === "custom" && (
              <div className="space-y-1.5 rounded-xl border border-white/10 bg-zinc-950/60 p-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 mb-1 block font-medium">Bulan</label>
                    <select
                      value={customMonth}
                      onChange={(e) => setCustomMonth(e.target.value)}
                      className="w-full h-9 rounded-xl border border-brand-500/40 bg-zinc-900 px-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-brand-500/40 cursor-pointer"
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value} className="bg-zinc-900 text-white">
                          {m.label} ({m.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 mb-1 block font-medium">Tahun</label>
                    <select
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      className="w-full h-9 rounded-xl border border-brand-500/40 bg-zinc-900 px-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-brand-500/40 cursor-pointer"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y} className="bg-zinc-900 text-white">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-zinc-400">Periode target:</span>
                  <span className="font-medium text-brand-300">
                    {MONTH_OPTIONS.find((m) => m.value === customMonth)?.label} {customYear}{" "}
                    <span className="font-mono text-[10px] text-zinc-500">({customYear}-{customMonth})</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="py-3">
          <div 
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
              isDragging 
                ? "border-brand-500 bg-brand-500/10" 
                : selectedFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const name = file.name.toLowerCase();
                if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
                  toast.error("Format file harus berupa Excel (.xlsx, .xls) atau CSV (.csv).");
                  return;
                }
                setSelectedFile(file);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <>
                <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-400" />
                <p className="mb-1 text-sm font-semibold text-zinc-100">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB — Klik untuk ganti file
                </p>
              </>
            ) : (
              <>
                <FileSpreadsheet className="mb-4 h-10 w-10 text-zinc-400" />
                <p className="mb-2 text-sm text-zinc-300">
                  <span className="font-semibold text-brand-400">Klik untuk unggah</span> atau seret dan lepas
                </p>
                <p className="text-xs text-zinc-500">File format Excel (.xlsx, .xls) atau CSV (Maks. 5MB)</p>
              </>
            )}
          </div>
          
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-800/50 p-3 text-sm text-zinc-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
            <p>
              Format kolom yang didukung: <span className="font-medium text-zinc-300">Kode, Nama Obat, Kategori, Satuan, Jumlah Stok/Sisa, Pemakaian Rata-Rata, Kecukupan Stok (Bulan), ED, Nomenklatur.</span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4 text-zinc-400" />
            <span>Unduh Template</span>
          </button>
          <button 
            type="button"
            onClick={handleImportFile}
            disabled={isPending || !selectedFile}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{isPending ? "Memproses..." : "Proses File"}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
