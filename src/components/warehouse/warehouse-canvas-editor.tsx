"use client";

import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Plus, Minus, RotateCcw, RotateCw, Check, AlertCircle } from "lucide-react";

export interface EditableRackItem {
  id: string;
  rackCode: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  totalLevels: number;
  corridor?: string;
}

interface WarehouseCanvasEditorProps {
  buildingId?: string;
  buildingName: string;
  initialRacks: EditableRackItem[];
  canvasWidth?: number;
  canvasHeight?: number;
  onSaveLayout: (racks: EditableRackItem[]) => Promise<boolean>;
  onAddNewRack?: () => void;
  className?: string;
}

export function WarehouseCanvasEditor({
  buildingName,
  initialRacks,
  canvasWidth = 1000,
  canvasHeight = 650,
  onSaveLayout,
  onAddNewRack,
  className = "",
}: WarehouseCanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  const [racks, setRacks] = useState<EditableRackItem[]>(initialRacks);
  const [prevRacks, setPrevRacks] = useState<EditableRackItem[]>(initialRacks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Sinkronkan racks jika initialRacks berubah saat render
  if (initialRacks !== prevRacks) {
    setPrevRacks(initialRacks);
    setRacks(initialRacks);
    setIsDirty(false);
  }

  // Inisialisasi Konva Stage & Layers
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const stage = new Konva.Stage({
      container: containerRef.current,
      width: canvasWidth,
      height: canvasHeight,
      draggable: true, // Canvas bisa di-pan
    });

    const bgLayer = new Konva.Layer();
    const mainLayer = new Konva.Layer();

    // Gambar Garis Grid (20px)
    const gridSize = 20;
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      bgLayer.add(
        new Konva.Line({
          points: [x, 0, x, canvasHeight],
          stroke: "#e2e8f0",
          strokeWidth: 0.5,
          listening: false,
        })
      );
    }
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      bgLayer.add(
        new Konva.Line({
          points: [0, y, canvasWidth, y],
          stroke: "#e2e8f0",
          strokeWidth: 0.5,
          listening: false,
        })
      );
    }

    // Border batas bangunan gedung
    bgLayer.add(
      new Konva.Rect({
        x: 10,
        y: 10,
        width: canvasWidth - 20,
        height: canvasHeight - 20,
        stroke: "#94a3b8",
        strokeWidth: 3,
        cornerRadius: 16,
        listening: false,
      })
    );

    // Transformer untuk seleksi & resize
    const tr = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      boundBoxFunc: (oldBox, newBox) => {
        // Batasi ukuran minimum 40px
        if (Math.abs(newBox.width) < 40 || Math.abs(newBox.height) < 30) {
          return oldBox;
        }
        return newBox;
      },
    });

    mainLayer.add(tr);
    stage.add(bgLayer);
    stage.add(mainLayer);

    stageRef.current = stage;
    layerRef.current = mainLayer;
    trRef.current = tr;

    // Deselect saat klik area kosong canvas
    stage.on("click tap", (e) => {
      if (e.target === stage || e.target.getParent() === bgLayer) {
        setSelectedId(null);
        tr.nodes([]);
        mainLayer.draw();
      }
    });

    return () => {
      stage.destroy();
    };
  }, [canvasWidth, canvasHeight]);

  // Render balok-balok rak pada Konva Layer
  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const tr = trRef.current;
    if (!stage || !layer || !tr) return;

    // Hapus group rak yang lama (kecuali transformer)
    layer.getChildren().forEach((child) => {
      if (child !== tr) {
        child.destroy();
      }
    });

    racks.forEach((rack) => {
      const isSelected = rack.id === selectedId;

      const group = new Konva.Group({
        id: rack.id,
        x: rack.x,
        y: rack.y,
        width: rack.width,
        height: rack.height,
        rotation: rack.rotation || 0,
        draggable: true,
      });

      // Balok luar rak
      const rect = new Konva.Rect({
        width: rack.width,
        height: rack.height,
        fill: isSelected ? "#fef3c7" : "#f8fafc",
        stroke: isSelected ? "#f59e0b" : "#455a26",
        strokeWidth: isSelected ? 3 : 2,
        cornerRadius: 6,
        shadowColor: "black",
        shadowBlur: isSelected ? 8 : 2,
        shadowOpacity: isSelected ? 0.2 : 0.08,
      });

      // Label nomor rak
      const text = new Konva.Text({
        text: rack.rackCode,
        fontSize: 14,
        fontFamily: "monospace",
        fontStyle: "bold",
        fill: isSelected ? "#92400e" : "#1f2937",
        width: rack.width,
        align: "center",
        y: Math.max(6, rack.height / 2 - 12),
        listening: false,
      });

      // Sub-label nama rak
      const subText = new Konva.Text({
        text: rack.name,
        fontSize: 10,
        fontFamily: "sans-serif",
        fill: isSelected ? "#b45309" : "#64748b",
        width: rack.width,
        align: "center",
        y: Math.max(22, rack.height / 2 + 2),
        listening: false,
      });

      group.add(rect);
      group.add(text);
      if (rack.height >= 40) {
        group.add(subText);
      }

      // Snap-to-grid saat drag
      group.on("dragmove", () => {
        const snap = 10;
        const newX = Math.round(group.x() / snap) * snap;
        const newY = Math.round(group.y() / snap) * snap;
        group.position({ x: newX, y: newY });
      });

      // Update state saat drag selesai
      group.on("dragend", () => {
        setRacks((prev) =>
          prev.map((r) =>
            r.id === rack.id
              ? { ...r, x: Math.round(group.x()), y: Math.round(group.y()) }
              : r
          )
        );
        setIsDirty(true);
      });

      // Update state saat transform / resize / rotate selesai
      group.on("transformend", () => {
        const scaleX = group.scaleX();
        const scaleY = group.scaleY();

        // Reset scale dan perbarui width/height sesungguhnya
        group.scaleX(1);
        group.scaleY(1);

        const newWidth = Math.max(40, Math.round(group.width() * scaleX));
        const newHeight = Math.max(30, Math.round(group.height() * scaleY));
        const newRotation = Math.round(group.rotation());

        group.width(newWidth);
        group.height(newHeight);
        rect.width(newWidth);
        rect.height(newHeight);
        text.width(newWidth);
        subText.width(newWidth);

        setRacks((prev) =>
          prev.map((r) =>
            r.id === rack.id
              ? {
                  ...r,
                  x: Math.round(group.x()),
                  y: Math.round(group.y()),
                  width: newWidth,
                  height: newHeight,
                  rotation: newRotation,
                }
              : r
          )
        );
        setIsDirty(true);
      });

      // Seleksi saat rak diklik
      group.on("click tap", (e) => {
        e.cancelBubble = true;
        setSelectedId(rack.id);
        tr.nodes([group]);
        layer.draw();
      });

      layer.add(group);

      if (isSelected) {
        tr.nodes([group]);
      }
    });

    layer.draw();
  }, [racks, selectedId]);

  // Rotasi 90 derajat rak yang dipilih
  const handleRotateSelected = () => {
    if (!selectedId) return;
    setRacks((prev) =>
      prev.map((r) => {
        if (r.id === selectedId) {
          const nextRot = (r.rotation + 90) % 360;
          return { ...r, rotation: nextRot };
        }
        return r;
      })
    );
    setIsDirty(true);
  };

  // Simpan layout ke database
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    const ok = await onSaveLayout(racks);
    setIsSaving(false);
    if (ok) {
      setIsDirty(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
    }
  };

  // Reset zoom kanvas
  const handleResetZoom = () => {
    const stage = stageRef.current;
    if (stage) {
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      stage.draw();
    }
  };

  const handleZoom = (factor: number) => {
    const stage = stageRef.current;
    if (stage) {
      const oldScale = stage.scaleX();
      const newScale = Math.min(Math.max(oldScale * factor, 0.4), 2.5);
      stage.scale({ x: newScale, y: newScale });
      stage.draw();
    }
  };

  const selectedRack = racks.find((r) => r.id === selectedId);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Action Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            Editor Denah: <span className="text-[#455a26] dark:text-[#6e903c]">{buildingName}</span>
          </span>

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700 mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => handleZoom(1.2)}
              className="p-1 rounded text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Perbesar Canvas"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.8)}
              className="p-1 rounded text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Perkecil Canvas"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate control for selected rack */}
          {selectedRack && (
            <button
              type="button"
              onClick={handleRotateSelected}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-600" />
              Putar 90° ({selectedRack.rackCode})
            </button>
          )}

          {onAddNewRack && (
            <button
              type="button"
              onClick={onAddNewRack}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              + Balok Baru
            </button>
          )}
        </div>

        {/* Save button & status */}
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <Check className="w-3.5 h-3.5" /> Tersimpan!
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertCircle className="w-3.5 h-3.5" /> Gagal Simpan
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isDirty
                ? "bg-[#455a26] hover:bg-[#384a1e] text-white animate-pulse"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Menyimpan..." : "Simpan Tata Letak"}
          </button>
        </div>
      </div>

      {/* Konva Stage Container with Grid Background */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 shadow-inner h-[600px] flex items-center justify-center">
        <div ref={containerRef} className="cursor-crosshair shadow-md bg-white dark:bg-zinc-900 rounded-xl" />

        <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] text-slate-500 font-mono pointer-events-none">
          Tip: Geser balok rak untuk pindah lorong. Tarik sudut transformer untuk ubah ukuran.
        </div>
      </div>
    </div>
  );
}
