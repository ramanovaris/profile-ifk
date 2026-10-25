import { BUILDING_LAYOUTS, calculatePanToCenter, clampPanZoom } from "../src/lib/warehouse-map-data";

async function main() {
  console.log("=== Verifikasi Logika Spasial Denah & Pan-Zoom Gudang IFK ===");

  // 1. Cek Layout Gedung
  const buildings = ["SJ", "TD", "KT"] as const;
  for (const b of buildings) {
    const layout = BUILDING_LAYOUTS[b];
    if (!layout) {
      throw new Error(`Layout gedung '${b}' tidak ditemukan!`);
    }
    if (!layout.viewBox || !layout.width || !layout.height) {
      throw new Error(`Dimensi viewBox gedung '${b}' tidak valid!`);
    }
    console.log(`- Layout Gedung ${layout.name}: ${layout.racks.length} rak fisik`);
  }

  // 2. Cek integritas rak Saijaan (12 rak)
  const sj = BUILDING_LAYOUTS.SJ;
  if (sj.racks.length !== 12) {
    throw new Error(`Saijaan harus punya 12 rak, ditemukan: ${sj.racks.length}`);
  }
  for (const r of sj.racks) {
    if (r.width <= 0 || r.height <= 0) {
      throw new Error(`Dimensi rak ${r.id} tidak valid.`);
    }
    if (r.centerX !== r.x + r.width / 2 || r.centerY !== r.y + r.height / 2) {
      throw new Error(`Titik pusat centerX/Y rak ${r.id} tidak akurat.`);
    }
  }

  // 3. Cek integritas Todak (8 rak) & Kantor (4 rak)
  if (BUILDING_LAYOUTS.TD.racks.length !== 8) {
    throw new Error(`Todak harus punya 8 rak!`);
  }
  if (BUILDING_LAYOUTS.KT.racks.length !== 4) {
    throw new Error(`Kantor harus punya 4 rak!`);
  }

  // 4. Uji kalkulasi fokus kamera denah (auto-pan to center)
  const container = { width: 400, height: 600 }; // Simulasi layar smartphone
  const targetRack = sj.racks[0]; // R01
  const targetScale = 2.0;

  const panResult = calculatePanToCenter({
    targetX: targetRack.centerX,
    targetY: targetRack.centerY,
    containerWidth: container.width,
    containerHeight: container.height,
    scale: targetScale,
  });

  // Ekspektasi: targetX * scale + pan.x = containerWidth / 2
  const expectedCenterX = container.width / 2 - targetRack.centerX * targetScale;
  const expectedCenterY = container.height / 2 - targetRack.centerY * targetScale;

  if (Math.abs(panResult.x - expectedCenterX) > 0.01 || Math.abs(panResult.y - expectedCenterY) > 0.01) {
    throw new Error(`Perhitungan panToCenter tidak presisi! Expected: (${expectedCenterX}, ${expectedCenterY}), Got: (${panResult.x}, ${panResult.y})`);
  }
  console.log(`- Kalkulasi fokus kamera auto-pan: PRESISI (${panResult.x.toFixed(1)}, ${panResult.y.toFixed(1)})`);

  // 5. Uji clamping pan & zoom batas aman
  const clampedScaleMin = clampPanZoom({ x: 0, y: 0, scale: 0.2 }, container, sj);
  if (clampedScaleMin.scale < 0.6) {
    throw new Error(`Zoom minimum harus dibatasi >= 0.6, got: ${clampedScaleMin.scale}`);
  }

  const clampedScaleMax = clampPanZoom({ x: 0, y: 0, scale: 10.0 }, container, sj);
  if (clampedScaleMax.scale > 3.5) {
    throw new Error(`Zoom maksimum harus dibatasi <= 3.5, got: ${clampedScaleMax.scale}`);
  }
  console.log(`- Clamping batas aman zoom min/max: LULUS (min 0.6x, max 3.5x)`);

  console.log("Semua pengujian tata letak spasial dan pan-zoom denah: LULUS (100% PASS)\n");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
