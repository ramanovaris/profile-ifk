"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { BuildingLayout, calculatePanToCenter, clampPanZoom } from "./warehouse-map-data";

export interface TransformState {
  x: number;
  y: number;
  scale: number;
}

interface UseSvgPanZoomOptions {
  layout: BuildingLayout;
  activeRackId?: string | null;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
}

export function useSvgPanZoom({
  layout,
  activeRackId,
  initialScale = 1.0,
  minScale = 0.35,
  maxScale = 3.5,
}: UseSvgPanZoomOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 600,
  });

  const [transform, setTransform] = useState<TransformState>({
    x: 0,
    y: 0,
    scale: initialScale,
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasInitializedRef = useRef(false);
  const lastBuildingIdRef = useRef(layout.id);
  const lastActiveRackIdRef = useRef(activeRackId);
  const prevSizeRef = useRef({ width: 0, height: 0 });

  // Active pointers map for pinch-zoom and drag
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartTransform = useRef<TransformState>({ x: 0, y: 0, scale: 1.0 });
  const pinchStartDist = useRef<number>(0);
  const pinchStartScale = useRef<number>(1.0);
  const pinchStartFocal = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentTransformRef = useRef<TransformState>(transform);
  currentTransformRef.current = transform;

  // ResizeObserver untuk menyesuaikan batas container dinamis
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Inisialisasi posisi awal agar denah berada di tengah layar
  const reset = useCallback(
    (withTransition = true) => {
      if (withTransition) setIsTransitioning(true);
      const fitScaleX = containerSize.width / layout.width;
      const fitScaleY = containerSize.height / layout.height;
      const initialFit = Math.max(minScale, Math.min(fitScaleX, fitScaleY) * 0.92);

      const centered = calculatePanToCenter({
        targetX: layout.width / 2,
        targetY: layout.height / 2,
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
        scale: initialFit,
      });

      setTransform(
        clampPanZoom(
          { x: centered.x, y: centered.y, scale: initialFit },
          containerSize,
          layout,
          minScale,
          maxScale
        )
      );

      if (withTransition) {
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    [containerSize, layout, minScale, maxScale]
  );

  // Fokus ke target rak (Auto-Pan & Auto-Zoom): presisi horizontal center dan vertikal center
  const focusOnTarget = useCallback(
    (targetCenterX: number, targetCenterY: number, targetScale?: number, withTransition = true) => {
      if (withTransition) setIsTransitioning(true);
      // Skala 0.5x di mobile agar orientasi seluruh ruangan terlihat luas & jelas
      const effectiveScale =
        targetScale ?? (containerSize.width < 500 ? 0.5 : 0.9);

      const centered = calculatePanToCenter({
        targetX: targetCenterX,
        targetY: targetCenterY,
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
        scale: effectiveScale,
      });

      const clamped = clampPanZoom(
        { x: centered.x, y: centered.y, scale: effectiveScale },
        containerSize,
        layout,
        minScale,
        maxScale
      );

      setTransform(clamped);
      if (withTransition) {
        setTimeout(() => setIsTransitioning(false), 350);
      }
    },
    [containerSize, layout, minScale, maxScale]
  );

  // Sinkronisasi posisi kamera:
  // 1. Saat inisialisasi awal (mount & ukuran container terukur)
  // 2. Saat activeRackId berubah (sorot rak target ke tengah horizontal & vertikal)
  // 3. Saat gedung/layout.id berganti (jika tidak ada activeRackId, reset kamera)
  useEffect(() => {
    const isBuildingChanged = lastBuildingIdRef.current !== layout.id;
    const isRackChanged = lastActiveRackIdRef.current !== activeRackId;
    const isFirstMeasurement =
      prevSizeRef.current.width !== containerSize.width ||
      prevSizeRef.current.height !== containerSize.height;

    if (!hasInitializedRef.current || isBuildingChanged || isRackChanged || isFirstMeasurement) {
      prevSizeRef.current = containerSize;
      lastBuildingIdRef.current = layout.id;
      lastActiveRackIdRef.current = activeRackId;

      if (activeRackId) {
        const target = layout.racks.find((r) => r.id === activeRackId);
        if (target) {
          const mobileScale = containerSize.width < 500 ? 0.5 : 0.9;
          // Sorot ke tengah horizontal dan vertikal dengan skala 0.5x
          focusOnTarget(
            target.centerX,
            target.centerY,
            mobileScale,
            hasInitializedRef.current && !isFirstMeasurement
          );
          hasInitializedRef.current = true;
          return;
        }
      }

      reset(hasInitializedRef.current && !isFirstMeasurement);
      hasInitializedRef.current = true;
    }
  }, [layout.id, layout.racks, activeRackId, containerSize, focusOnTarget, reset]);

  const zoomIn = useCallback(() => {
    setIsTransitioning(true);
    setTransform((prev) => {
      const nextScale = Math.min(prev.scale * 1.3, maxScale);
      // Zoom ke titik tengah container
      const nextX = containerSize.width / 2 - ((containerSize.width / 2 - prev.x) * nextScale) / prev.scale;
      const nextY = containerSize.height / 2 - ((containerSize.height / 2 - prev.y) * nextScale) / prev.scale;
      return clampPanZoom({ x: nextX, y: nextY, scale: nextScale }, containerSize, layout, minScale, maxScale);
    });
    setTimeout(() => setIsTransitioning(false), 250);
  }, [containerSize, layout, minScale, maxScale]);

  const zoomOut = useCallback(() => {
    setIsTransitioning(true);
    setTransform((prev) => {
      const nextScale = Math.max(prev.scale / 1.3, minScale);
      const nextX = containerSize.width / 2 - ((containerSize.width / 2 - prev.x) * nextScale) / prev.scale;
      const nextY = containerSize.height / 2 - ((containerSize.height / 2 - prev.y) * nextScale) / prev.scale;
      return clampPanZoom({ x: nextX, y: nextY, scale: nextScale }, containerSize, layout, minScale, maxScale);
    });
    setTimeout(() => setIsTransitioning(false), 250);
  }, [containerSize, layout, minScale, maxScale]);

  // Pointer event handlers
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const targetEl = e.currentTarget;
      targetEl.setPointerCapture(e.pointerId);
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      setIsTransitioning(false);

      if (activePointers.current.size === 1) {
        dragStartTransform.current = { ...currentTransformRef.current };
      } else if (activePointers.current.size === 2) {
        const pts = Array.from(activePointers.current.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchStartDist.current = dist > 0 ? dist : 1;
        pinchStartScale.current = currentTransformRef.current.scale;
        dragStartTransform.current = { ...currentTransformRef.current };

        const rect = targetEl.getBoundingClientRect();
        pinchStartFocal.current = {
          x: (pts[0].x + pts[1].x) / 2 - rect.left,
          y: (pts[0].y + pts[1].y) / 2 - rect.top,
        };
      }
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const prevPos = activePointers.current.get(e.pointerId);
      if (!prevPos) return;

      if (activePointers.current.size === 1) {
        // Drag Pan 1 Jari / Mouse Drag
        const dx = e.clientX - prevPos.x;
        const dy = e.clientY - prevPos.y;
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        setTransform((prev) => {
          const nextX = prev.x + dx;
          const nextY = prev.y + dy;
          return clampPanZoom({ x: nextX, y: nextY, scale: prev.scale }, containerSize, layout, minScale, maxScale);
        });
      } else if (activePointers.current.size === 2) {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        // Pinch Zoom 2 Jari dengan Focal Point di antara kedua jari
        const pts = Array.from(activePointers.current.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

        if (pinchStartDist.current > 0 && pinchStartScale.current > 0) {
          const factor = currentDist / pinchStartDist.current;
          const targetScale = Math.min(Math.max(pinchStartScale.current * factor, minScale), maxScale);

          const rect = containerRef.current?.getBoundingClientRect();
          const currFocalX = rect ? (pts[0].x + pts[1].x) / 2 - rect.left : containerSize.width / 2;
          const currFocalY = rect ? (pts[0].y + pts[1].y) / 2 - rect.top : containerSize.height / 2;

          const worldX = (pinchStartFocal.current.x - dragStartTransform.current.x) / pinchStartScale.current;
          const worldY = (pinchStartFocal.current.y - dragStartTransform.current.y) / pinchStartScale.current;

          const nextX = currFocalX - worldX * targetScale;
          const nextY = currFocalY - worldY * targetScale;

          setTransform(
            clampPanZoom(
              { x: nextX, y: nextY, scale: targetScale },
              containerSize,
              layout,
              minScale,
              maxScale
            )
          );
        }
      }
    },
    [containerSize, layout, minScale, maxScale]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      setTransform((prev) => {
        const nextScale = Math.min(Math.max(prev.scale * zoomFactor, minScale), maxScale);
        const rect = containerRef.current?.getBoundingClientRect();
        const cursorX = rect ? e.clientX - rect.left : containerSize.width / 2;
        const cursorY = rect ? e.clientY - rect.top : containerSize.height / 2;
        const nextX = cursorX - ((cursorX - prev.x) * nextScale) / prev.scale;
        const nextY = cursorY - ((cursorY - prev.y) * nextScale) / prev.scale;
        return clampPanZoom({ x: nextX, y: nextY, scale: nextScale }, containerSize, layout, minScale, maxScale);
      });
    },
    [containerSize, layout, minScale, maxScale]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Abaikan jika pointer capture telah dilepas
    }
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size === 0) {
      pinchStartDist.current = 0;
    }
  }, []);

  return {
    containerRef,
    transform,
    isTransitioning,
    reset,
    zoomIn,
    zoomOut,
    focusOnTarget,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onWheel,
      style: {
        touchAction: "none",
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      },
    },
  };
}
