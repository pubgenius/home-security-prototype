"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Group, Circle, Path, Arc } from "react-konva";
import Konva from "konva";
import type { Device } from "./types";
import { DEVICE_CONFIGS } from "./constants";

interface SensorNodeProps {
  device: Device;
  scale: number;
  stageZoom: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onMouseEnter: (device: Device, x: number, y: number) => void;
  onMouseLeave: () => void;
  onLongPress: (device: Device, x: number, y: number) => void;
}

const LONG_PRESS_MS = 500;
// Lucide Lock path viewBox 0 0 24 24 → centered on 0,0 by offsetting -12,-12
const ICON_OFFSET = -12;

export function SensorNode({
  device,
  scale,
  stageZoom,
  isSelected,
  onSelect,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
  onLongPress,
}: SensorNodeProps) {
  const cfg = DEVICE_CONFIGS[device.kind];

  const pulseRef = useRef<Konva.Circle>(null);
  const glowRef = useRef<Konva.Circle>(null);
  const animRef = useRef<Konva.Animation | null>(null);
  const glowAnim = useRef<Konva.Animation | null>(null);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLong = useRef(false);
  const dragMoved = useRef(false);

  // Sizes compensated for zoom so icons stay constant screen-size
  const R = (14 * scale) / stageZoom;
  const PULSE_MAX = (26 * scale) / stageZoom;
  const PULSE_MIN = R + (3 * scale) / stageZoom;
  const ICON_S = (R * 1.1) / 12; // scale factor: Lucide 24→ fit in R*1.1 radius

  const isAlert =
    (device.kind === "door" && device.status === "open") ||
    (device.kind === "sensor" && device.status === "alert");

  const activeColor = isAlert ? cfg.alertColor : cfg.color;

  // ── Pulse animation (ring expanding)
  useEffect(() => {
    const node = pulseRef.current;
    if (!node) return;
    animRef.current?.stop();

    if (isAlert) {
      let growing = true;
      animRef.current = new Konva.Animation((frame) => {
        if (!frame) return;
        const r = node.radius();
        const speed = (0.025 * scale) / stageZoom;
        if (growing) {
          node.radius(Math.min(r + speed * frame.timeDiff, PULSE_MAX));
          node.opacity(
            Math.max(
              0.05,
              0.55 - ((r - PULSE_MIN) / (PULSE_MAX - PULSE_MIN)) * 0.5,
            ),
          );
          if (r >= PULSE_MAX) growing = false;
        } else {
          node.radius(Math.max(r - speed * frame.timeDiff, PULSE_MIN));
          node.opacity(0.1);
          if (r <= PULSE_MIN) growing = true;
        }
      }, node.getLayer());
      animRef.current.start();
    } else {
      node.radius(PULSE_MIN);
      node.opacity(0.15);
    }
    return () => {
      animRef.current?.stop();
    };
  }, [isAlert, PULSE_MIN, PULSE_MAX, scale, stageZoom]);

  // ── Radial glow animation (sensor alert only — "glass break" style)
  useEffect(() => {
    const node = glowRef.current;
    if (!node) return;
    glowAnim.current?.stop();

    if (device.kind === "sensor" && isAlert) {
      let t = 0;
      glowAnim.current = new Konva.Animation((frame) => {
        if (!frame) return;
        t += frame.timeDiff / 900;
        const wave = (Math.sin(t * Math.PI * 2) + 1) / 2; // 0..1
        node.radius(R * (1.4 + wave * 2.2));
        node.opacity(0.18 * (1 - wave * 0.7));
      }, node.getLayer());
      glowAnim.current.start();
    } else {
      node.radius(0);
      node.opacity(0);
    }
    return () => {
      glowAnim.current?.stop();
    };
  }, [device.kind, isAlert, R]);

  // ── Long press detection
  const startLong = useCallback(
    (screenX: number, screenY: number) => {
      didLong.current = false;
      dragMoved.current = false;
      longTimer.current = setTimeout(() => {
        didLong.current = true;
        onLongPress(device, screenX, screenY);
      }, LONG_PRESS_MS);
    },
    [device, onLongPress],
  );

  const cancelLong = useCallback(() => {
    if (longTimer.current) clearTimeout(longTimer.current);
  }, []);

  return (
    <Group
      x={device.x}
      y={device.y}
      draggable
      onClick={() => {
        if (!didLong.current && !dragMoved.current) onSelect(device.id);
      }}
      onTap={() => {
        if (!didLong.current) onSelect(device.id);
      }}
      onDragStart={() => {
        dragMoved.current = true;
        cancelLong();
      }}
      onDragEnd={(e) => onDragEnd(device.id, e.target.x(), e.target.y())}
      onMouseDown={(e) => {
        const abs = e.target.getAbsolutePosition();
        startLong(abs.x, abs.y);
      }}
      onMouseUp={cancelLong}
      onTouchStart={(e) => {
        const abs = e.target.getAbsolutePosition();
        startLong(abs.x, abs.y);
      }}
      onTouchEnd={cancelLong}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "grab";
        const abs = e.target.getAbsolutePosition();
        onMouseEnter(device, abs.x, abs.y);
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "crosshair";
        onMouseLeave();
        cancelLong();
      }}
    >
      {/* Radial glow — sensor alert only */}
      <Circle
        ref={glowRef}
        radius={0}
        fill={cfg.alertColor}
        opacity={0}
        listening={false}
      />

      {/* Expanding pulse ring */}
      <Circle
        ref={pulseRef}
        radius={PULSE_MIN}
        fill={activeColor}
        opacity={0.15}
        listening={false}
      />

      {/* Selection ring */}
      {isSelected && (
        <Circle
          radius={R + 4 / stageZoom}
          fill="transparent"
          stroke="#ffffff"
          strokeWidth={1.5 / stageZoom}
          dash={[4 / stageZoom, 3 / stageZoom]}
          listening={false}
        />
      )}

      {/* Main badge circle */}
      <Circle
        radius={R}
        fill={activeColor}
        stroke={isSelected ? "#ffffff" : activeColor + "88"}
        strokeWidth={1.5 / stageZoom}
      />

      {/* ── Icon rendered via SVG Path data ── */}
      <Path
        data={cfg.iconPath}
        stroke="#ffffff"
        strokeWidth={1.8 / (stageZoom * ICON_S)}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        scaleX={ICON_S}
        scaleY={ICON_S}
        x={ICON_OFFSET * ICON_S}
        y={ICON_OFFSET * ICON_S}
        listening={false}
        opacity={0.92}
      />

      {/* Door "open" sweep arc indicator */}
      {device.kind === "door" && device.status === "open" && (
        <Arc
          innerRadius={R * 0.55}
          outerRadius={R * 0.55 + 1.5 / stageZoom}
          angle={80}
          rotation={-100}
          stroke="#ff9f43"
          strokeWidth={1.5 / stageZoom}
          fill="transparent"
          listening={false}
          opacity={0.7}
        />
      )}
    </Group>
  );
}
