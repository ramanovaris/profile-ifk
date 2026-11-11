"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  MapPin,
  FileSpreadsheet,
  Plus,
  Trash2,
  Search,
  Building2,
  ArrowLeft,
  Package,
  Layers,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { WarehouseImportModal } from "@/components/warehouse/warehouse-import-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  upsertWarehouseItemAction,
  placeWarehouseItemAction,
  removeWarehousePlacementAction,
} from "@/actions/warehouse";

interface ManagementClientViewProps {
  initialBuildings: Array<{
    id: string;
    name: string;
    racks: Array<{
      id: string;
      rackCode: string;
      name: string;
      totalLevels: number;
      notes: string | null;
      placements: Array<{
        id: string;
        levelCode: string;
        locationCode: string;
        notes: string | null;
        item: {
          id: string;
          code: string;
          name: string;
          unit: string;
          category: string | null;
        };
      }>;
    }>;
  }>;
}

export function ManagementClientView({ initialBuildings }: ManagementClientViewProps) {
  const [activeBuildingId, setActiveBuildingId] = useState<string>("SJ");
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlacementToDelete, setSelectedPlacementToDelete] = useState<{ id: string; name: string; location: string } | null>(null);

  // Form State Tambah Barang
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formUnit, setFormUnit] = useState("Tablet");
  const [formCategory, setFormCategory] = useState("Obat Generik");
  const [formRackId, setFormRackId] = useState("SJ-R01");
  const [formLevel, setFormLevel] = useState("T1");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const currentBuilding = initialBuildings.find((b) => b.id === activeBuildingId) || initialBuildings[0];

  // Seluruh placements di gedung ini
  const allPlacements = React.useMemo(() => {
    if (!currentBuilding) return [];
    const list: Array<{
      id: string;
      rackId: string;
      rackName: string;
      levelCode: string;
      locationCode: string;
      notes: string | null;
      item: { id: string; code: string; name: string; unit: string; category: string | null };
    }> = [];

    for (const r of currentBuilding.racks) {
      for (const p of r.placements) {
        list.push({
          ...p,
          rackId: r.id,
          rackName: r.name,
        });
      }
    }
    return list;
  }, [currentBuilding]);

  // Filtered placements
  const filteredPlacements = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allPlacements;
    return allPlacements.filter(
      (p) =>
        p.item.name.toLowerCase().includes(q) ||
        p.item.code.toLowerCase().includes(q) ||
        p.locationCode.toLowerCase().includes(q)
    );
  }, [allPlacements, searchQuery]);

  const handleOpenAddModal = (defaultRackId?: string) => {
    if (defaultRackId) setFormRackId(defaultRackId);
    setFormCode("");
    setFormName("");
    setFormNotes("");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || !formUnit) {
      setFormError("Kode, Nama, dan Satuan wajib diisi.");
      return;
    }

    startTransition(async () => {
      // 1. Simpan item
      const itemRes = await upsertWarehouseItemAction({
        code: formCode,
        name: formName,
        unit: formUnit,
        category: formCategory,
      });

      if (!itemRes.success || !itemRes.data) {
        setFormError(itemRes.error || "Gagal menyimpan item");
        return;
      }

      // 2. Tempatkan ke rak
      const placeRes = await placeWarehouseItemAction({
        itemId: itemRes.data.id,
        rackId: formRackId,
        levelCode: formLevel,
        notes: formNotes,
      });

      if (!placeRes.success) {
        setFormError(placeRes.error || "Gagal menempatkan item ke rak");
        return;
      }

      setIsAddModalOpen(false);
      window.location.reload();
    });
  };

  const handleDeletePlacement = () => {
    if (!selectedPlacementToDelete) return;
    startTransition(async () => {
      await removeWarehousePlacementAction(selectedPlacementToDelete.id);
      setIsDeleteModalOpen(false);
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/gudang"
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
            title="Kembali ke Peta Denah"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#455a26] dark:text-[#6e903c]" />
              Meja Kerja Penempatan Rak Fisik
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Kelola daftar baris rak, jumlah ambalan, dan pemetaan posisi obat di gudang IFK.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#455a26]" />
            Impor CSV / Excel
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#455a26] hover:bg-[#384a1e] text-white transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Barang
          </button>
        </div>
      </div>

      {/* Building Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 max-w-fit">
        {initialBuildings.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveBuildingId(b.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeBuildingId === b.id
                ? "bg-[#455a26] text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {b.name} ({b.racks.length} Rak)
          </button>
        ))}
      </div>

      {/* Grid Ringkasan Rak Fisik */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#455a26]" />
          Daftar Baris Rak di {currentBuilding?.name}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {currentBuilding?.racks.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between gap-2 hover:border-[#455a26] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                    {r.rackCode}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    {r.totalLevels} Ambalan
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                  {r.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {r.notes || "Lorong Gudang"}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">{r.placements.length} Barang</span>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(r.id)}
                  className="text-[#455a26] dark:text-[#6e903c] font-bold hover:underline"
                >
                  + Isi Rak
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Master Pemetaan Barang */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-[#455a26]" />
            Daftar Barang Terpetakan ({filteredPlacements.length} Posisi)
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang / kode..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-[#455a26]"
            />
          </div>
        </div>

        <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Kategori & Satuan</th>
                  <th className="p-3">Lokasi Ambalan</th>
                  <th className="p-3">Catatan Posisi</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filteredPlacements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                      Tidak ada barang fisik yang cocok dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredPlacements.map((plc) => (
                    <tr key={plc.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3 font-mono text-slate-600 dark:text-zinc-400">{plc.item.code}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-zinc-100">{plc.item.name}</td>
                      <td className="p-3">
                        <span className="text-slate-600 dark:text-zinc-300">{plc.item.category || "-"}</span>
                        <span className="text-slate-400 ml-1.5">({plc.item.unit})</span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {plc.locationCode}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-zinc-400">{plc.notes || "-"}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlacementToDelete({
                              id: plc.id,
                              name: plc.item.name,
                              location: plc.locationCode,
                            });
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Hapus dari rak"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah Barang & Penempatan */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#455a26]" />
              Tambah & Petakan Barang Fisik
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan master barang fisik dan tentukan alamat rak dan ambalannya di gudang.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-3 pt-2">
            {formError && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Kode Barang *
                </label>
                <input
                  type="text"
                  required
                  placeholder="OBT-001"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Satuan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kotak/100"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Nama Barang Lengkap *
              </label>
              <input
                type="text"
                required
                placeholder="Amoksisilin 500 mg Kaplet"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Kategori
              </label>
              <input
                type="text"
                placeholder="Antibiotik / Alkes / Cairan"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Pilih Rak Fisik *
                </label>
                <select
                  value={formRackId}
                  onChange={(e) => setFormRackId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800"
                >
                  {currentBuilding?.racks.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.rackCode} - {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Tingkat Ambalan *
                </label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800"
                >
                  <option value="T1">Tingkat 1 (Dasar/Bawah)</option>
                  <option value="T2">Tingkat 2</option>
                  <option value="T3">Tingkat 3</option>
                  <option value="T4">Tingkat 4</option>
                  <option value="T5">Tingkat 5 (Atas)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Catatan Posisi Wadah / Box (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Kotak hijau sisi kanan, wadah no 3"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#455a26] text-white hover:bg-[#384a1e] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Simpan Penempatan
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus Penempatan */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Hapus Posisi Barang dari Rak?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Barang <strong>{selectedPlacementToDelete?.name}</strong> akan dilepas dari lokasi{" "}
              <strong>{selectedPlacementToDelete?.location}</strong>. Master barang tidak terhapus.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeletePlacement}
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Lokasi"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spreadsheet Import Modal */}
      <WarehouseImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImportSuccess={() => window.location.reload()}
      />
    </div>
  );
}
