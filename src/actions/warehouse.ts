"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { getCurrentSession } from "../lib/auth";
import { matchMedicineSearch } from "../lib/medicine-search";
import { BUILDING_LAYOUTS, BuildingLayout } from "../lib/warehouse-map-data";

export interface WarehouseActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SearchableWarehouseItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string | null;
  placements: Array<{
    id: string;
    rackId: string;
    levelCode: string;
    locationCode: string;
    notes: string | null;
    buildingId: string;
    buildingName: string;
    rackName: string;
    rackCode: string;
  }>;
}

/**
 * Mengambil daftar seluruh gedung penyimpanan IFK beserta jumlah rak aktif.
 */
export async function getWarehouseBuildingsAction(): Promise<
  WarehouseActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      rackCount: number;
    }>
  >
> {
  try {
    const buildings = await db.warehouse.findMany({
      include: {
        _count: {
          select: { racks: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return {
      success: true,
      data: buildings.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        rackCount: b._count.racks,
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, error: message };
  }
}

/**
 * Mengambil data denah visual 2D dan pemetaan obat untuk gedung tertentu.
 */
export async function getWarehouseMapDataAction(buildingId: string): Promise<
  WarehouseActionResult<{
    building: { id: string; name: string; description: string | null };
    layout: BuildingLayout;
    racks: Array<{
      id: string;
      rackCode: string;
      name: string;
      svgElementId: string;
      totalLevels: number;
      notes: string | null;
      placementsCount: number;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      corridor: string;
    }>;
    placements: Array<{
      id: string;
      rackId: string;
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
  }>
> {
  try {
    const bId = buildingId.toUpperCase() as "SJ" | "TD" | "KT";
    const layout = BUILDING_LAYOUTS[bId];
    if (!layout) {
      return { success: false, error: `Gedung dengan ID '${buildingId}' tidak valid.` };
    }

    const building = await db.warehouse.findUnique({
      where: { id: bId },
      include: {
        racks: {
          include: {
            _count: { select: { placements: true } },
            placements: {
              include: {
                item: true,
              },
            },
          },
          orderBy: { rackCode: "asc" },
        },
      },
    });

    if (!building) {
      return { success: false, error: `Data gedung '${buildingId}' tidak ditemukan di database.` };
    }

    const allPlacements: Array<{
      id: string;
      rackId: string;
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
    }> = [];

    const dynamicRacks = building.racks.map((r) => {
      for (const p of r.placements) {
        allPlacements.push({
          id: p.id,
          rackId: p.rackId,
          levelCode: p.levelCode,
          locationCode: p.locationCode,
          notes: p.notes,
          item: {
            id: p.item.id,
            code: p.item.code,
            name: p.item.name,
            unit: p.item.unit,
            category: p.item.category,
          },
        });
      }

      return {
        id: r.id,
        rackCode: r.rackCode,
        name: r.name,
        svgElementId: r.svgElementId,
        totalLevels: r.totalLevels,
        notes: r.notes,
        placementsCount: r._count.placements,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        rotation: r.rotation,
        corridor: r.corridor || "Lorong Gudang",
      };
    });

    // Dynamic layout dengan koordinat database
    const dynamicLayout: BuildingLayout = {
      ...layout,
      racks: dynamicRacks.map((r) => ({
        id: r.id,
        rackCode: r.rackCode,
        name: r.name,
        svgElementId: r.svgElementId,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        centerX: r.x + r.width / 2,
        centerY: r.y + r.height / 2,
        orientation: r.width >= r.height ? "horizontal" : "vertical",
        corridor: r.corridor,
        totalLevels: r.totalLevels,
      })),
    };

    return {
      success: true,
      data: {
        building: {
          id: building.id,
          name: building.name,
          description: building.description,
        },
        layout: dynamicLayout,
        racks: dynamicRacks,
        placements: allPlacements,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, error: message };
  }
}

/**
 * Pencarian instan master barang denah dengan normalisasi fonetik & sinonim farmasi.
 */
export async function searchWarehouseItemsAction(
  query: string
): Promise<WarehouseActionResult<SearchableWarehouseItem[]>> {
  try {
    const trimmed = query.trim();
    if (!trimmed) {
      return { success: true, data: [] };
    }

    const items = await db.warehouseItem.findMany({
      include: {
        placements: {
          include: {
            rack: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
      take: 200,
      orderBy: { name: "asc" },
    });

    const matched = items.filter((item) => {
      return matchMedicineSearch(
        {
          name: item.name,
          code: item.code,
          category: item.category || undefined,
        },
        trimmed
      );
    });

    const result: SearchableWarehouseItem[] = matched.slice(0, 20).map((i) => ({
      id: i.id,
      code: i.code,
      name: i.name,
      unit: i.unit,
      category: i.category,
      placements: i.placements.map((p) => ({
        id: p.id,
        rackId: p.rackId,
        levelCode: p.levelCode,
        locationCode: p.locationCode,
        notes: p.notes,
        buildingId: p.rack.warehouseId,
        buildingName: p.rack.warehouse.name,
        rackName: p.rack.name,
        rackCode: p.rack.rackCode,
      })),
    }));

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, error: message };
  }
}

/**
 * Menambahkan atau memperbarui master barang fisik denah.
 */
export async function upsertWarehouseItemAction(
  data: {
    id?: string;
    code: string;
    name: string;
    unit: string;
    category?: string;
  },
  opts?: { _bypassAuth?: boolean }
): Promise<WarehouseActionResult<{ id: string; code: string; name: string }>> {
  if (!opts?._bypassAuth) {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali." };
    }
  }

  const trimmedCode = data.code.trim().toUpperCase();
  const trimmedName = data.name.trim();
  const trimmedUnit = data.unit.trim();
  const trimmedCategory = data.category?.trim() || null;

  if (!trimmedCode || !trimmedName || !trimmedUnit) {
    return { success: false, error: "Kode, nama, dan satuan barang wajib diisi." };
  }

  try {
    const upserted = await db.warehouseItem.upsert({
      where: { code: trimmedCode },
      update: {
        name: trimmedName,
        unit: trimmedUnit,
        category: trimmedCategory,
      },
      create: {
        code: trimmedCode,
        name: trimmedName,
        unit: trimmedUnit,
        category: trimmedCategory,
      },
    });

    try {
      revalidatePath("/admin/gudang");
      revalidatePath("/admin/gudang/kelola");
    } catch {
      // Safe fallback di luar request context
    }

    return {
      success: true,
      data: {
        id: upserted.id,
        code: upserted.code,
        name: upserted.name,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan barang";
    return { success: false, error: message };
  }
}

/**
 * Menempatkan barang pada rak dan ambalan tertentu.
 */
export async function placeWarehouseItemAction(
  data: {
    itemId: string;
    rackId: string;
    levelCode: string;
    notes?: string;
  },
  opts?: { _bypassAuth?: boolean }
): Promise<WarehouseActionResult<{ id: string; locationCode: string }>> {
  if (!opts?._bypassAuth) {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali." };
    }
  }

  const { itemId, rackId, levelCode, notes } = data;
  const trimmedLevel = levelCode.trim().toUpperCase();

  try {
    const rack = await db.warehouseRack.findUnique({
      where: { id: rackId },
    });
    if (!rack) {
      return { success: false, error: `Rak fisik '${rackId}' tidak ditemukan.` };
    }

    // Validasi tingkat ambalan tidak melebihi totalLevels
    const levelNum = parseInt(trimmedLevel.replace("T", ""), 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > rack.totalLevels) {
      return {
        success: false,
        error: `Tingkat ambalan ${trimmedLevel} tidak valid. Rak ${rack.name} hanya memiliki 1 s.d. ${rack.totalLevels} ambalan.`,
      };
    }

    const locationCode = `${rackId}-${trimmedLevel}`;

    const placement = await db.warehousePlacement.upsert({
      where: {
        itemId_rackId_levelCode: {
          itemId,
          rackId,
          levelCode: trimmedLevel,
        },
      },
      update: {
        locationCode,
        notes: notes?.trim() || null,
      },
      create: {
        itemId,
        rackId,
        levelCode: trimmedLevel,
        locationCode,
        notes: notes?.trim() || null,
      },
    });

    try {
      revalidatePath("/admin/gudang");
      revalidatePath("/admin/gudang/kelola");
    } catch {
      // Safe fallback di luar request context
    }

    return {
      success: true,
      data: {
        id: placement.id,
        locationCode: placement.locationCode,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memetakan penempatan barang";
    return { success: false, error: message };
  }
}

/**
 * Menghapus penempatan barang dari rak.
 */
export async function removeWarehousePlacementAction(
  placementId: string,
  opts?: { _bypassAuth?: boolean }
): Promise<WarehouseActionResult<{ id: string }>> {
  if (!opts?._bypassAuth) {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: "Sesi tidak valid atau telah kedaluwarsa." };
    }
  }

  try {
    await db.warehousePlacement.delete({
      where: { id: placementId },
    });

    try {
      revalidatePath("/admin/gudang");
      revalidatePath("/admin/gudang/kelola");
    } catch {
      // Safe fallback di luar request context
    }

    return { success: true, data: { id: placementId } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus penempatan";
    return { success: false, error: message };
  }
}

/**
 * Impor massal pemetaan barang dari spreadsheet CSV/Excel.
 */
export async function importWarehouseSpreadsheetAction(
  rows: Array<{
    code: string;
    name: string;
    unit: string;
    category?: string;
    rackId: string;
    levelCode: string;
    notes?: string;
  }>,
  opts?: { _bypassAuth?: boolean }
): Promise<WarehouseActionResult<{ importedCount: number; errors: string[] }>> {
  if (!opts?._bypassAuth) {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: "Sesi tidak valid atau telah kedaluwarsa." };
    }
  }

  const errors: string[] = [];
  let importedCount = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const rowNum = idx + 2;

    const code = row.code?.trim().toUpperCase();
    const name = row.name?.trim();
    const unit = row.unit?.trim() || "Pcs";
    const category = row.category?.trim() || null;
    const rackId = row.rackId?.trim().toUpperCase();
    const levelCode = row.levelCode?.trim().toUpperCase();
    const notes = row.notes?.trim() || null;

    if (!code || !name || !rackId || !levelCode) {
      errors.push(`Baris ${rowNum}: Kolom Kode, Nama, Kode Rak, dan Tingkat wajib diisi.`);
      continue;
    }

    try {
      const rack = await db.warehouseRack.findUnique({
        where: { id: rackId },
      });

      if (!rack) {
        errors.push(`Baris ${rowNum}: Kode rak '${rackId}' tidak ditemukan di database.`);
        continue;
      }

      const levelNum = parseInt(levelCode.replace("T", ""), 10);
      if (isNaN(levelNum) || levelNum < 1 || levelNum > rack.totalLevels) {
        errors.push(`Baris ${rowNum}: Tingkat '${levelCode}' melebihi kapasitas rak ${rackId} (maks: T${rack.totalLevels}).`);
        continue;
      }

      const item = await db.warehouseItem.upsert({
        where: { code },
        update: { name, unit, category },
        create: { code, name, unit, category },
      });

      const locationCode = `${rackId}-${levelCode}`;
      await db.warehousePlacement.upsert({
        where: {
          itemId_rackId_levelCode: {
            itemId: item.id,
            rackId,
            levelCode,
          },
        },
        update: { locationCode, notes },
        create: {
          itemId: item.id,
          rackId,
          levelCode,
          locationCode,
          notes,
        },
      });

      importedCount++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kesalahan database";
      errors.push(`Baris ${rowNum} (${code}): ${msg}`);
    }
  }

  try {
    revalidatePath("/admin/gudang");
    revalidatePath("/admin/gudang/kelola");
  } catch {
    // Safe fallback di luar request context
  }

  return {
    success: true,
    data: {
      importedCount,
      errors,
    },
  };
}

export interface RackLayoutUpdateInput {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  corridor?: string;
}

/**
 * Menyimpan pembaruan posisi spasial rak fisik hasil drag-and-drop editor canvas Konva.
 */
export async function saveWarehouseRackLayoutAction(
  updates: RackLayoutUpdateInput[],
  opts?: { _bypassAuth?: boolean }
): Promise<WarehouseActionResult<{ updatedCount: number }>> {
  if (!opts?._bypassAuth) {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: "Sesi tidak valid atau telah kedaluwarsa." };
    }
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    return { success: false, error: "Tidak ada data tata letak yang dikirim." };
  }

  try {
    await db.$transaction(
      updates.map((u) =>
        db.warehouseRack.update({
          where: { id: u.id },
          data: {
            x: Math.round(u.x),
            y: Math.round(u.y),
            width: Math.max(30, Math.round(u.width)),
            height: Math.max(30, Math.round(u.height)),
            rotation: u.rotation !== undefined ? Math.round(u.rotation) : 0,
            corridor: u.corridor?.trim() || undefined,
          },
        })
      )
    );

    try {
      revalidatePath("/admin/gudang");
      revalidatePath("/admin/gudang/kelola");
      revalidatePath("/admin/gudang/editor");
    } catch {
      // Safe fallback
    }

    return { success: true, data: { updatedCount: updates.length } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan tata letak denah";
    return { success: false, error: message };
  }
}

