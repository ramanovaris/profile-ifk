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
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
}

export function useSvgPanZoom({
  layout,
  initialScale = 1.0,
  minScale = 0.6,
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

  // Active pointers map for pinch-zoom and drag
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartTransform = useRef<TransformState>({ x: 0, y: 0, scale: 1.0 });
  const pinchStartDist = useRef<number>(0);
  const pinchStartScale = useRef<number>(1.0);

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
  const reset = useCallback(() => {
    setIsTransitioning(true);
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

    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [containerSize, layout, minScale, maxScale]);

  // Reset saat layout berganti
  useEffect(() => {
    const timer = setTimeout(() => {
      reset();
    }, 0);
    return () => clearTimeout(timer);
  }, [layout.id, reset]);

  // Fokus ke target rak (Auto-Pan & Auto-Zoom)
  const focusOnTarget = useCallback(
    (targetCenterX: number, targetCenterY: number, targetScale = 2.0) => {
      setIsTransitioning(true);
      const centered = calculatePanToCenter({
        targetX: targetCenterX,
        targetY: targetCenterY,
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
        scale: targetScale,
      });

      const clamped = clampPanZoom(
        { x: centered.x, y: centered.y, scale: targetScale },
        containerSize,
        layout,
        minScale,
        maxScale
      );

      setTransform(clamped);
      setTimeout(() => setIsTransitioning(false), 350);
    },
    [containerSize, layout, minScale, maxScale]
  );

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
        dragStartTransform.current = { ...transform };
      } else if (activePointers.current.size === 2) {
        const pts = Array.from(activePointers.current.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchStartDist.current = dist > 0 ? dist : 1;
        pinchStartScale.current = transform.scale;
        dragStartTransform.current = { ...transform };
      }
    },
    [transform]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activePointers.current.has(e.pointerId)) return;
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size === 1) {
        // Drag Pan 1 Jari
        // Hitung perpindahan dari pointer saat down
        const pts = Array.from(activePointers.current.values())[0];
        const dx = e.clientX - pts.x;
        const dy = e.clientY - pts.y;

        setTransform((prev) => {
          const nextX = prev.x + dx;
          const nextY = prev.y + dy;
          return clampPanZoom({ x: nextX, y: nextY, scale: prev.scale }, containerSize, layout, minScale, maxScale);
        });
      } else if (activePointers.current.size === 2) {
        // Pinch Zoom 2 Jari
        const pts = Array.from(activePointers.current.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (pinchStartDist.current > 0) {
          const factor = currentDist / pinchStartDist.current;
          const targetScale = Math.min(Math.max(pinchStartScale.current * factor, minScale), maxScale);
          setTransform((prev) => {
            return clampPanZoom({ ...prev, scale: targetScale }, containerSize, layout, minScale, maxScale);
          });
        }
      }
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
      style: {
        touchAction: "none",
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      },
    },
  };
}
