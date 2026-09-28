"use client";

import { useState, useRef, useTransition } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle,
  Loader2,
  CheckCircle2
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

interface StockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function StockForm({ open, onOpenChange, onImportSuccess }: StockFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Kode,Nama Obat,Kategori,Satuan,Jumlah Stok,Pemakaian Rata-Rata,MOS,ED,Nomenklatur\n" +
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

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await importStockFileAction(formData);
        if (!res.success) {
          toast.error(res.error || "Gagal mengimpor data stok.");
          return;
        }

        toast.success(
          `Impor berhasil: ${res.data?.inserted || 0} obat baru ditambahkan, ${res.data?.updated || 0} obat diperbarui.`
        );

        setSelectedFile(null);
        onOpenChange(false);
        if (onImportSuccess) {
          onImportSuccess();
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

        <div className="py-4">
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
              Format kolom yang didukung: <span className="font-medium text-zinc-300">Kode, Nama Obat, Kategori, Satuan, Jumlah Stok/Sisa, Pemakaian Rata-Rata, MOS, ED, Nomenklatur.</span>
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
