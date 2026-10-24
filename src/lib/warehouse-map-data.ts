export interface RackCoordinates {
  id: string; // e.g. "SJ-R01"
  rackCode: string; // "R01"
  name: string;
  svgElementId: string; // "rect-sj-r01"
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  orientation: "horizontal" | "vertical";
  corridor: string;
  totalLevels: number;
}

export interface CorridorArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BuildingLayout {
  id: "SJ" | "TD" | "KT";
  name: string;
  subtitle: string;
  width: number;
  height: number;
  viewBox: string;
  entrance: { x: number; y: number; label: string };
  corridors: CorridorArea[];
  racks: RackCoordinates[];
}

// 1. Gedung Saijaan (SJ) - 12 Rak (6 Barat, 6 Timur)
// ViewBox: 1000 x 650
const SAIJAAN_RACKS: RackCoordinates[] = [];
// Lorong Barat: R01..R06 (vertikal sejajar)
const WEST_X = 140;
for (let i = 1; i <= 6; i++) {
  const code = `R${i.toString().padStart(2, "0")}`;
  const y = 80 + (i - 1) * 85;
  const w = 260;
  const h = 50;
  SAIJAAN_RACKS.push({
    id: `SJ-${code}`,
    rackCode: code,
    name: `Rak Saijaan ${code}`,
    svgElementId: `rect-sj-${code.toLowerCase()}`,
    x: WEST_X,
    y,
    width: w,
    height: h,
    centerX: WEST_X + w / 2,
    centerY: y + h / 2,
    orientation: "horizontal",
    corridor: "Lorong Barat (Obat Sediaan Padat)",
    totalLevels: 5,
  });
}

// Lorong Timur: R07..R12
const EAST_X = 580;
for (let i = 7; i <= 12; i++) {
  const code = `R${i.toString().padStart(2, "0")}`;
  const y = 80 + (i - 7) * 85;
  const w = 260;
  const h = 50;
  SAIJAAN_RACKS.push({
    id: `SJ-${code}`,
    rackCode: code,
    name: `Rak Saijaan ${code}`,
    svgElementId: `rect-sj-${code.toLowerCase()}`,
    x: EAST_X,
    y,
    width: w,
    height: h,
    centerX: EAST_X + w / 2,
    centerY: y + h / 2,
    orientation: "horizontal",
    corridor: "Lorong Timur (Obat Cair, Sirup & Salep)",
    totalLevels: 5,
  });
}

// 2. Gedung Todak (TD) - 8 Rak (Alkes, Cairan Infus)
// ViewBox: 900 x 600
const TODAK_RACKS: RackCoordinates[] = [];
// Baris Utara (R01..R04): Infus LVP & Cairan
for (let i = 1; i <= 4; i++) {
  const code = `R${i.toString().padStart(2, "0")}`;
  const x = 100 + (i - 1) * 190;
  const y = 110;
  const w = 150;
  const h = 160;
  TODAK_RACKS.push({
    id: `TD-${code}`,
    rackCode: code,
    name: `Rak Todak ${code}`,
    svgElementId: `rect-td-${code.toLowerCase()}`,
    x,
    y,
    width: w,
    height: h,
    centerX: x + w / 2,
    centerY: y + h / 2,
    orientation: "vertical",
    corridor: "Area Cairan Infus & LVP",
    totalLevels: 4,
  });
}

// Baris Selatan (R05..R08): Alkes & BMHP
for (let i = 5; i <= 8; i++) {
  const code = `R${i.toString().padStart(2, "0")}`;
  const x = 100 + (i - 5) * 190;
  const y = 350;
  const w = 150;
  const h = 160;
  TODAK_RACKS.push({
    id: `TD-${code}`,
    rackCode: code,
    name: `Rak Todak ${code}`,
    svgElementId: `rect-td-${code.toLowerCase()}`,
    x,
    y,
    width: w,
    height: h,
    centerX: x + w / 2,
    centerY: y + h / 2,
    orientation: "vertical",
    corridor: "Area Alkes Habis Pakai & BMHP",
    totalLevels: 4,
  });
}

// 3. Gedung Kantor (KT) - 4 Rak (Ruang Chiller Vaksin & Transit)
// ViewBox: 800 x 500
const KANTOR_RACKS: RackCoordinates[] = [
  {
    id: "KT-R01",
    rackCode: "R01",
    name: "Chiller Vaksin 1 (2-8°C)",
    svgElementId: "rect-kt-r01",
    x: 120,
    y: 110,
    width: 240,
    height: 120,
    centerX: 240,
    centerY: 170,
    orientation: "horizontal",
    corridor: "Ruang Cold Chain / Rantai Dingin",
    totalLevels: 4,
  },
  {
    id: "KT-R02",
    rackCode: "R02",
    name: "Freezer Vaksin 2 (-20°C)",
    svgElementId: "rect-kt-r02",
    x: 440,
    y: 110,
    width: 240,
    height: 120,
    centerX: 560,
    centerY: 170,
    orientation: "horizontal",
    corridor: "Ruang Cold Chain / Rantai Dingin",
    totalLevels: 4,
  },
  {
    id: "KT-R03",
    rackCode: "R03",
    name: "Rak Transit Penerimaan",
    svgElementId: "rect-kt-r03",
    x: 120,
    y: 290,
    width: 240,
    height: 120,
    centerX: 240,
    centerY: 350,
    orientation: "horizontal",
    corridor: "Area Penerimaan & Karantina Barang Masuk",
    totalLevels: 4,
  },
  {
    id: "KT-R04",
    rackCode: "R04",
    name: "Rak Siap Distribusi Faskes",
    svgElementId: "rect-kt-r04",
    x: 440,
    y: 290,
    width: 240,
    height: 120,
    centerX: 560,
    centerY: 350,
    orientation: "horizontal",
    corridor: "Area Staging & Pengepakan Distribusi",
    totalLevels: 4,
  },
];

export const BUILDING_LAYOUTS: Record<"SJ" | "TD" | "KT", BuildingLayout> = {
  SJ: {
    id: "SJ",
    name: "Gedung Saijaan",
    subtitle: "Gudang Utama Obat Oral, Tablet, Kapsul, Sirup & Salep",
    width: 1000,
    height: 650,
    viewBox: "0 0 1000 650",
    entrance: { x: 500, y: 620, label: "Pintu Masuk Utama" },
    corridors: [
      { id: "c-west", name: "Lorong Barat", x: 80, y: 50, width: 380, height: 550 },
      { id: "c-east", name: "Lorong Timur", x: 520, y: 50, width: 380, height: 550 },
      { id: "c-main", name: "Gang Utama Tengah", x: 460, y: 50, width: 60, height: 550 },
    ],
    racks: SAIJAAN_RACKS,
  },
  TD: {
    id: "TD",
    name: "Gedung Todak",
    subtitle: "Gudang Cairan Infus (LVP), Alkes Habis Pakai & PKRT",
    width: 900,
    height: 600,
    viewBox: "0 0 900 600",
    entrance: { x: 450, y: 570, label: "Pintu Bongkar Muat" },
    corridors: [
      { id: "c-north", name: "Lorong Utara (Infus)", x: 60, y: 80, width: 780, height: 210 },
      { id: "c-south", name: "Lorong Selatan (Alkes)", x: 60, y: 320, width: 780, height: 210 },
    ],
    racks: TODAK_RACKS,
  },
  KT: {
    id: "KT",
    name: "Gedung Kantor",
    subtitle: "Ruang Cold Chain Vaksin, Penerimaan & Staging Distribusi",
    width: 800,
    height: 500,
    viewBox: "0 0 800 500",
    entrance: { x: 400, y: 470, label: "Akses Petugas & Gudang" },
    corridors: [
      { id: "c-cold", name: "Zona Rantai Dingin", x: 80, y: 70, width: 640, height: 180 },
      { id: "c-transit", name: "Zona Transit & Staging", x: 80, y: 260, width: 640, height: 180 },
    ],
    racks: KANTOR_RACKS,
  },
};

/**
 * Menghitung koordinat translasi (pan) agar titik target berada tepat di tengah container layar.
 */
export function calculatePanToCenter(params: {
  targetX: number;
  targetY: number;
  containerWidth: number;
  containerHeight: number;
  scale: number;
}): { x: number; y: number } {
  const { targetX, targetY, containerWidth, containerHeight, scale } = params;
  return {
    x: containerWidth / 2 - targetX * scale,
    y: containerHeight / 2 - targetY * scale,
  };
}

/**
 * Membatasi skala zoom dan translasi agar denah tidak hilang keluar layar.
 */
export function clampPanZoom(
  state: { x: number; y: number; scale: number },
  container: { width: number; height: number },
  layout: BuildingLayout,
  minScale = 0.6,
  maxScale = 3.5
): { x: number; y: number; scale: number } {
  const clampedScale = Math.min(Math.max(state.scale, minScale), maxScale);

  // Batas toleransi pan (200px dari tepi gambar)
  const contentWidth = layout.width * clampedScale;
  const contentHeight = layout.height * clampedScale;

  const minX = container.width - contentWidth - 150;
  const maxX = 150;
  const minY = container.height - contentHeight - 150;
  const maxY = 150;

  return {
    scale: clampedScale,
    x: Math.min(Math.max(state.x, minX), maxX),
    y: Math.min(Math.max(state.y, minY), maxY),
  };
}
