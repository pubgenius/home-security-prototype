"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import type Konva from "konva";
import { SensorNode } from "./SensorNode";
import {
  FLOOR_PLANS,
  COLORS,
  STAGE_W,
  STAGE_H,
  DEVICE_CONFIGS,
} from "./constants";
import type { Device, SensorKind, TooltipState, FloorId } from "./types";

interface FloorPlanStageProps {
  width: number;
  height: number;
  scale: number;
  devices: Device[];
  selectedKind: SensorKind;
  selectedDevice: string | null;
  activeFloor: FloorId;
  onDeviceAdd: (device: Device) => void;
  onDeviceSelect: (id: string | null) => void;
  onDeviceDragEnd: (id: string, x: number, y: number) => void;
  onTooltipChange: (tooltip: TooltipState | null) => void;
  onLongPress: (device: Device, screenX: number, screenY: number) => void;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 8;
const ZOOM_STEP = 1.1;
let idCounter = 1;

export function FloorPlanStage({
  width,
  height,
  scale,
  devices,
  selectedKind,
  selectedDevice,
  activeFloor,
  onDeviceAdd,
  onDeviceSelect,
  onDeviceDragEnd,
  onTooltipChange,
  onLongPress,
}: FloorPlanStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isPanning, setPanning] = useState(false);

  const floor = FLOOR_PLANS.find((f) => f.id === activeFloor) ?? FLOOR_PLANS[0];

  // The floor plan content size at scale=1 (rooms go from ~60,40 to ~640,430 world units)
  // Center it inside the stage on first render and on reset
  const centeredPos = useCallback(() => {
    const contentW = STAGE_W * scale;
    const contentH = STAGE_H * scale;
    return {
      x: (width - contentW) / 2,
      y: (height - contentH) / 2,
    };
  }, [width, height, scale]);

  // Set centered position when dimensions first become available
  const didInit = useRef(false);
  useEffect(() => {
    if (width > 0 && height > 0 && !didInit.current) {
      didInit.current = true;
      setPos(centeredPos());
    }
  }, [width, height, centeredPos]);

  const clamp = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

  const zoomTo = useCallback(
    (
      newZ: number,
      px: number,
      py: number,
      curZ: number,
      curPos: { x: number; y: number },
    ) => {
      const z = clamp(newZ);
      const mpt = { x: (px - curPos.x) / curZ, y: (py - curPos.y) / curZ };
      return { z, pos: { x: px - mpt.x * z, y: py - mpt.y * z } };
    },
    [],
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const ptr = stage.getPointerPosition();
      if (!ptr) return;
      const dir = e.evt.deltaY < 0 ? 1 : -1;
      const { z, pos: p } = zoomTo(
        zoom * (dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP),
        ptr.x,
        ptr.y,
        zoom,
        pos,
      );
      setZoom(z);
      setPos(p);
    },
    [zoom, pos, zoomTo],
  );

  const lastDist = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      e.evt.preventDefault();
      const touches = e.evt.touches;
      if (touches.length !== 2) return;
      const [t1, t2] = [touches[0], touches[1]];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const center = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      if (lastDist.current !== null && lastCenter.current !== null) {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.container().getBoundingClientRect();
        const ptr = { x: center.x - rect.left, y: center.y - rect.top };
        const factor = dist / lastDist.current;
        const { z, pos: p } = zoomTo(zoom * factor, ptr.x, ptr.y, zoom, pos);
        const dx = center.x - lastCenter.current.x;
        const dy = center.y - lastCenter.current.y;
        setZoom(z);
        setPos({ x: p.x + dx, y: p.y + dy });
      }
      lastDist.current = dist;
      lastCenter.current = center;
    },
    [zoom, pos, zoomTo],
  );

  const handleTouchEnd = useCallback(() => {
    lastDist.current = null;
    lastCenter.current = null;
  }, []);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const handleDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target !== e.target.getStage()) return;
      dragStart.current = { x: e.target.x(), y: e.target.y() };
    },
    [],
  );
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return;
    const np = { x: e.target.x(), y: e.target.y() };
    setPos(np);
    const moved =
      dragStart.current &&
      (Math.abs(np.x - dragStart.current.x) > 3 ||
        Math.abs(np.y - dragStart.current.y) > 3);
    if (moved) setPanning(true);
    setTimeout(() => setPanning(false), 60);
  }, []);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning) return;
      const isBackground =
        e.target === e.target.getStage() ||
        ["room-rect", "room-label", "floor-bg", "stage-bg"].includes(
          e.target.name(),
        );
      if (!isBackground) return;

      const stage = stageRef.current;
      if (!stage) return;
      const p = stage.getRelativePointerPosition();
      if (!p) return;

      const cfg = DEVICE_CONFIGS[selectedKind];
      const id = `dev-${idCounter++}`;
      onDeviceAdd({
        id,
        kind: selectedKind,
        floorId: activeFloor,
        x: p.x,
        y: p.y,
        status: cfg.defaultStatus,
        label: `${cfg.label} ${idCounter - 1}`,
      });
      onDeviceSelect(id);
    },
    [selectedKind, activeFloor, onDeviceAdd, onDeviceSelect, isPanning],
  );

  const applyZoom = useCallback(
    (factor: number) => {
      const { z, pos: p } = zoomTo(
        zoom * factor,
        width / 2,
        height / 2,
        zoom,
        pos,
      );
      setZoom(z);
      setPos(p);
    },
    [zoom, pos, width, height, zoomTo],
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPos(centeredPos());
  }, [centeredPos]);

  const zoomPercent = Math.round(zoom * 100);
  const floorDevices = devices.filter((d) => d.floorId === activeFloor);

  return (
    <div
      style={{
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        width: "100%",
        height: "100%",
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={zoom}
        scaleY={zoom}
        x={pos.x}
        y={pos.y}
        draggable
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleStageClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onContextMenu={(e) => e.evt.preventDefault()}
        style={{ display: "block" }}
      >
        <Layer>
          <Rect
            name="stage-bg"
            x={-pos.x / zoom - 4000}
            y={-pos.y / zoom - 4000}
            width={width / zoom + 8000}
            height={height / zoom + 8000}
            fill={COLORS.stageBg}
            listening={false}
          />

          <Rect
            name="floor-bg"
            x={60 * scale}
            y={40 * scale}
            width={520 * scale}
            height={380 * scale}
            fill={COLORS.floorFill}
            stroke={COLORS.roomStroke}
            strokeWidth={1.5 / zoom}
            cornerRadius={4}
            listening={false}
          />
        </Layer>

        <Layer>
          {floor.rooms.map((room) => (
            <React.Fragment key={room.id}>
              <Rect
                name="room-rect"
                x={room.x * scale}
                y={room.y * scale}
                width={room.w * scale}
                height={room.h * scale}
                fill={COLORS.roomFill}
                stroke={COLORS.roomStroke}
                strokeWidth={0.8 / zoom}
              />
              <Text
                name="room-label"
                x={room.x * scale}
                y={(room.y + room.h / 2 - 5) * scale}
                width={room.w * scale}
                text={room.label.toUpperCase()}
                fontSize={Math.max(6, 7 * scale)}
                fill={COLORS.labelColor}
                align="center"
                letterSpacing={0.5}
                listening={false}
              />
            </React.Fragment>
          ))}

          <Text
            x={60 * scale}
            y={31 * scale}
            text={floor.label.toUpperCase()}
            fontSize={7 * scale}
            fill={COLORS.textMuted}
            letterSpacing={1.2}
            listening={false}
          />
        </Layer>

        <Layer>
          {floorDevices.map((device) => (
            <SensorNode
              key={device.id}
              device={device}
              scale={scale}
              stageZoom={zoom}
              isSelected={selectedDevice === device.id}
              onSelect={onDeviceSelect}
              onDragEnd={onDeviceDragEnd}
              onMouseEnter={(d) => {
                const cfg = DEVICE_CONFIGS[d.kind];
                const isAlert =
                  (d.kind === "lock" && d.status === "open") ||
                  (d.kind === "sensor" && d.status === "alert");
                onTooltipChange({
                  x: d.x * zoom + pos.x,
                  y: d.y * zoom + pos.y,
                  label: d.label,
                  color: isAlert ? cfg.alertColor : cfg.color,
                  deviceId: d.id,
                });
              }}
              onMouseLeave={() => onTooltipChange(null)}
              onLongPress={onLongPress}
            />
          ))}
        </Layer>
      </Stage>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          zIndex: 20,
        }}
      >
        <ZBtn onClick={() => applyZoom(ZOOM_STEP * 2.5)}>+</ZBtn>
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            fontFamily: "monospace",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {zoomPercent}%
        </span>
        <ZBtn onClick={() => applyZoom(1 / (ZOOM_STEP * 2.5))}>−</ZBtn>
        <div style={{ height: 4 }} />
        <ZBtn onClick={resetView} style={{ fontSize: 10 }}>
          1:1
        </ZBtn>
      </div>

      {zoom !== 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            fontSize: 11,
            color: COLORS.textMuted,
            fontFamily: "system-ui",
            background: "rgba(13,17,32,0.75)",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            padding: "4px 10px",
            pointerEvents: "none",
          }}
        >
          Scroll / pinch to zoom · Drag to pan
        </div>
      )}
    </div>
  );
}

function ZBtn({
  onClick,
  children,
  style,
}: {
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        // 44×44 minimum touch target (Apple HIG / Material)
        width: 44,
        height: 44,
        border: "1px solid #1e2540",
        borderRadius: 10,
        background: "rgba(13,17,32,0.85)",
        color: "#8a93b0",
        cursor: "pointer",
        fontSize: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        lineHeight: 1,
        padding: 0,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: "background 0.15s, color 0.15s",
        WebkitTouchCallout: "none" as React.CSSProperties["WebkitTouchCallout"],
        userSelect: "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
