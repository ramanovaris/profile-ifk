"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  X,
  Copy,
  Check,
  Building2,
  Info,
} from "lucide-react";

const emptySubscribe = () => () => {};

const TEMPLATE_SURAT_TEXT = `PEMERINTAH KABUPATEN KOTABARU
DINAS KESEHATAN
UPTD PUSKESMAS [NAMA PUSKESMAS]
Jl. [Alamat Lengkap], Kode Pos 721xx, Kab. Kotabaru
Email: puskesmas@[email].go.id | Telp/WA: [Nomor Kontak]
========================================================================

Nomor    : 440 / [Nomor] / PKM-[KODE] / [Bulan] / 2026
Sifat    : Penting / Biasa
Lampiran : 1 (satu) Berkas
Perihal  : Permohonan Permintaan Perbekalan Farmasi (LPLPO / Sewaktu)

Kotabaru, [Tanggal Bulan Tahun]

Kepada Yth.
Kepala Dinas Kesehatan Kabupaten Kotabaru
Cq. Kepala UPTD Instalasi Farmasi Kabupaten Kotabaru
di -
    Tempat

Dengan hormat,

Sehubungan dengan upaya menjamin kesinambungan pelayanan kesehatan serta ketersediaan obat esensial, Bahan Medis Habis Pakai (BMHP), dan vaksin bagi masyarakat di wilayah kerja UPTD Puskesmas [Nama Puskesmas], bersama ini kami mengajukan permohonan penyaluran perbekalan farmasi dengan dokumen terlampir:

1. Lembar Permintaan dan Lembar Pemakaian Obat (LPLPO) Periode [Bulan / Triwulan]
2. Formulir Permintaan Sewaktu (Program / Non-Program) *) bila ada kebutuhan cito
3. Laporan Mutasi & Penggunaan Obat Terkait

Demikian surat pengantar ini kami sampaikan. Atas perhatian, arahan, dan kerja sama yang baik kami ucapkan terima kasih.


Mengetahui,
Kepala UPTD Puskesmas [Nama Puskesmas]



[NAMA KEPALA PUSKESMAS / DOKTER]
NIP. [Nomor Induk Pegawai]`;

export function SuratPengantarModalButton() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TEMPLATE_SURAT_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback jika clipboard permission terbatas
    }
  };

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 active:scale-[0.98] cursor-pointer"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>Lihat Format Surat</span>
      </button>

      {isOpen && isClient && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Format Surat Pengantar Puskesmas"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in-0 duration-150"
        >
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative z-10 flex w-full max-w-2xl flex-col max-h-[92vh] rounded-2xl border border-border bg-white shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 shadow-xs">
                  <Building2 className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-heading sm:text-lg">
                    Format Surat Pengantar Puskesmas
                  </h3>
                  <p className="text-xs text-muted">
                    Standar tata naskah dinas resmi pengajuan perbekalan farmasi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-heading active:scale-95 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* Petunjuk Singkat */}
              <div className="flex items-start gap-3 rounded-xl border border-brand-200/70 bg-brand-50/50 p-4 text-xs sm:text-sm text-brand-900">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-brand-700" />
                <div className="space-y-1">
                  <p className="font-semibold text-brand-900">Petunjuk Administrasi Puskesmas:</p>
                  <p className="text-brand-800 text-xs leading-relaxed">
                    Surat pengantar dicetak menggunakan kop resmi Puskesmas, ditandatangani oleh pimpinan faskes, serta dilampirkan bersama dokumen LPLPO atau formulir permintaan sewaktu.
                  </p>
                </div>
              </div>

              {/* Tampilan Lembar Surat (Paper Effect) */}
              <div className="rounded-xl border border-border bg-surface/70 p-5 sm:p-7 shadow-2xs font-sans text-xs sm:text-sm leading-relaxed text-zinc-800 space-y-4">
                {/* Kop Puskesmas */}
                <div className="text-center space-y-0.5 pb-2">
                  <p className="font-bold text-xs uppercase tracking-wider text-muted">Pemerintah Kabupaten Kotabaru</p>
                  <p className="font-bold text-sm uppercase tracking-wide text-heading">Dinas Kesehatan</p>
                  <p className="font-bold text-base sm:text-lg text-brand-700">UPTD PUSKESMAS [NAMA PUSKESMAS]</p>
                  <p className="text-[11px] text-muted">
                    Jl. [Alamat Lengkap Puskesmas], Kab. Kotabaru, Kalimantan Selatan 721xx
                  </p>
                  <p className="text-[11px] text-muted">
                    Email: puskesmas@[email].go.id | Kontak/WA: [Nomor Resmi]
                  </p>
                  <div className="pt-2 border-b-2 border-zinc-900 border-t border-t-zinc-900 mt-1" />
                </div>

                {/* Nomor & Tanggal */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
                  <div className="space-y-0.5 text-xs">
                    <p><strong className="inline-block w-20">Nomor</strong>: 440 / [No. Surat] / PKM-[KODE] / [Bulan] / 2026</p>
                    <p><strong className="inline-block w-20">Sifat</strong>: Biasa / Penting</p>
                    <p><strong className="inline-block w-20">Lampiran</strong>: 1 (satu) Berkas</p>
                    <p><strong className="inline-block w-20">Perihal</strong>: Permohonan Permintaan Perbekalan Farmasi</p>
                  </div>
                  <div className="text-xs sm:text-right">
                    <p className="text-muted">Kotabaru, [Tanggal Bulan 2026]</p>
                    <div className="mt-2 text-left sm:text-right">
                      <p className="font-semibold text-heading">Kepada Yth.</p>
                      <p>Kepala Dinas Kesehatan Kab. Kotabaru</p>
                      <p className="text-muted">Cq. Kepala UPTD Instalasi Farmasi</p>
                      <p className="text-muted">di - Tempat</p>
                    </div>
                  </div>
                </div>

                {/* Paragraf Pembuka */}
                <div className="space-y-2 pt-2">
                  <p>Dengan hormat,</p>
                  <p className="text-justify leading-relaxed">
                    Sehubungan dengan upaya pemenuhan kebutuhan pelayanan kesehatan masyarakat serta menjaga kontinuitas ketersediaan obat esensial, Bahan Medis Habis Pakai (BMHP), dan vaksin di UPTD Puskesmas [Nama Puskesmas], bersama ini kami sampaikan permohonan penyaluran perbekalan farmasi dengan rincian berkas terlampir:
                  </p>
                  <ul className="list-inside list-decimal pl-2 space-y-1 text-zinc-700">
                    <li>Lembar Permintaan dan Lembar Pemakaian Obat (LPLPO) Periode Berjalan</li>
                    <li>Formulir Permintaan Sewaktu (Program &amp; Non-Program) <em>*) bila ada kebutuhan cito</em></li>
                    <li>Data Rincian Kebutuhan Vaksin &amp; Obat Program Nasional Terkait</li>
                  </ul>
                  <p className="text-justify leading-relaxed pt-1">
                    Demikian surat pengantar ini kami sampaikan. Atas perhatian, arahan, dan kerja sama yang baik, kami ucapkan terima kasih.
                  </p>
                </div>

                {/* Tanda Tangan */}
                <div className="pt-4 flex justify-end">
                  <div className="w-56 text-center text-xs space-y-1">
                    <p className="font-semibold text-heading">Kepala UPTD Puskesmas [Nama],</p>
                    <div className="h-14 flex items-center justify-center text-[11px] text-muted italic border border-dashed border-border rounded my-1 bg-white">
                      (Tanda Tangan &amp; Stempel Basah/Elektronik)
                    </div>
                    <p className="font-bold underline text-heading">[Nama Kepala Puskesmas / Dokter]</p>
                    <p className="text-muted text-[11px]">NIP. 19xxxxxxxxxxxxxx</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons 50/50 Sesuai Preferensi */}
            <div className="shrink-0 border-t border-border bg-surface/50 p-4 sm:px-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 active:scale-[0.98] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span>Format Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Kerangka Teks</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-semibold text-heading shadow-xs transition-colors hover:bg-surface active:scale-[0.98] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
