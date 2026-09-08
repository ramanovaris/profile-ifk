"use client";

import { useState } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface StockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockForm({ open, onOpenChange }: StockFormProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileInteraction = () => {
    toast.info("Fitur parsing file akan segera hadir pada tahap integrasi backend.");
  };

  const handleDownloadTemplate = () => {
    toast.info("Template unduhan akan tersedia setelah integrasi backend.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-brand-400" />
            Import Data Stok Bulanan
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Unggah file spreadsheet (.xlsx, .xls, atau .csv) berisi data stok fisik per akhir bulan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div 
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
              isDragging 
                ? "border-brand-500 bg-brand-500/10" 
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
              handleFileInteraction();
            }}
            onClick={handleFileInteraction}
          >
            <FileSpreadsheet className="mb-4 h-10 w-10 text-zinc-400" />
            <p className="mb-2 text-sm text-zinc-300">
              <span className="font-semibold text-brand-400">Klik untuk unggah</span> atau seret dan lepas
            </p>
            <p className="text-xs text-zinc-500">.xlsx, .xls, atau .csv (Maks. 5MB)</p>
          </div>
          
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-800/50 p-3 text-sm text-zinc-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
            <p>
              Format kolom yang dibutuhkan: <span className="font-medium text-zinc-300">Kode, Nama Obat, Kategori, Satuan, Jumlah Stok.</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate}
            className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Unduh Template
          </Button>
          <Button onClick={handleFileInteraction} className="bg-brand-600 hover:bg-brand-700 text-white">
            Proses File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
