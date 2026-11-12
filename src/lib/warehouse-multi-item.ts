/**
 * Utilitas pengelompokan dan pemetaan penempatan multi-item per ambalan rak gudang
 */

export interface RawRackPlacement {
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
}

export interface TierItemPlacement {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemUnit: string;
  itemCategory: string | null;
  locationCode: string;
  levelCode: string;
  notes: string | null;
  isTarget?: boolean;
}

export interface GroupedRackPlacements {
  itemsByLevel: Record<string, TierItemPlacement[]>;
  countsByLevel: Record<string, number>;
  totalCount: number;
  activeLevelCode: string;
  activeItem?: TierItemPlacement;
}

export interface GroupOptions {
  levelCode?: string | null;
  targetItemId?: string | null;
  targetItemName?: string | null;
}

/**
 * Mengelompokkan daftar penempatan rak mentah ke dalam struktur bertingkat (T1..Tn)
 */
export function groupRackPlacementsByLevel(
  placements: RawRackPlacement[],
  totalLevels: number = 5,
  options?: GroupOptions
): GroupedRackPlacements {
  const itemsByLevel: Record<string, TierItemPlacement[]> = {};
  const countsByLevel: Record<string, number> = {};

  // Inisialisasi ambalan T1 s/d T{totalLevels}
  for (let i = 1; i <= totalLevels; i++) {
    const lvl = `T${i}`;
    itemsByLevel[lvl] = [];
    countsByLevel[lvl] = 0;
  }

  let matchedTargetItem: TierItemPlacement | undefined;

  const targetItemId = options?.targetItemId?.trim();
  const targetItemName = options?.targetItemName?.trim().toLowerCase();

  // Petakan penempatan ke ambalan masing-masing
  for (const p of placements) {
    const lvl = (p.levelCode || "T1").toUpperCase();
    if (!itemsByLevel[lvl]) {
      itemsByLevel[lvl] = [];
      countsByLevel[lvl] = 0;
    }

    const isMatch = Boolean(
      (targetItemId && p.item.id === targetItemId) ||
      (targetItemName && p.item.name.toLowerCase().includes(targetItemName))
    );

    const tierPlacement: TierItemPlacement = {
      id: p.id,
      itemId: p.item.id,
      itemCode: p.item.code,
      itemName: p.item.name,
      itemUnit: p.item.unit,
      itemCategory: p.item.category,
      locationCode: p.locationCode || `${p.rackId}-${lvl}`,
      levelCode: lvl,
      notes: p.notes,
      isTarget: isMatch,
    };

    if (isMatch && !matchedTargetItem) {
      matchedTargetItem = tierPlacement;
    }

    itemsByLevel[lvl].push(tierPlacement);
    countsByLevel[lvl] = (countsByLevel[lvl] || 0) + 1;
  }

  // Tentukan activeLevelCode
  let resolvedActiveLevel: string = "T1";

  if (options?.levelCode && itemsByLevel[options.levelCode.toUpperCase()]) {
    resolvedActiveLevel = options.levelCode.toUpperCase();
  } else if (matchedTargetItem) {
    resolvedActiveLevel = matchedTargetItem.levelCode;
  } else {
    // Cari level terisi pertama (dari T1 ke atas)
    const firstFilledLevel = Object.keys(itemsByLevel).find((lvl) => itemsByLevel[lvl].length > 0);
    resolvedActiveLevel = firstFilledLevel || "T1";
  }

  // Tentukan activeItem
  let resolvedActiveItem: TierItemPlacement | undefined;
  if (matchedTargetItem && matchedTargetItem.levelCode === resolvedActiveLevel) {
    resolvedActiveItem = matchedTargetItem;
  } else if (itemsByLevel[resolvedActiveLevel] && itemsByLevel[resolvedActiveLevel].length > 0) {
    resolvedActiveItem = itemsByLevel[resolvedActiveLevel][0];
  } else if (matchedTargetItem) {
    resolvedActiveItem = matchedTargetItem;
  }

  return {
    itemsByLevel,
    countsByLevel,
    totalCount: placements.length,
    activeLevelCode: resolvedActiveLevel,
    activeItem: resolvedActiveItem,
  };
}
