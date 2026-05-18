"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Group, Circle, Path, Arc } from "react-konva";
import Konva from "konva";
import type { Device, DeviceStatus } from "./types";
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
  onToggleStatus: (id: string, status: DeviceStatus) => void;
}

const LONG_PRESS_MS = 500;

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
  onToggleStatus,
}: SensorNodeProps) {
  const cfg = DEVICE_CONFIGS[device.kind];

  const pulseRef = useRef<Konva.Circle>(null);
  const glowRef = useRef<Konva.Circle>(null);
  const pathRef = useRef<Konva.Path>(null);
  const animRef = useRef<Konva.Animation | null>(null);
  const glowAnim = useRef<Konva.Animation | null>(null);
  const popAnim = useRef<Konva.Animation | null>(null);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLong = useRef(false);
  const dragMoved = useRef(false);
  const prevStatus = useRef(device.status);

  const iconPath = cfg.iconPaths[device.status] ?? cfg.iconPaths._default;

  // ── Sizes — all derived from R, compensated for zoom
  const R = (8 * scale) / stageZoom; // ← badge radius (smaller)
  const PULSE_MAX = (16 * scale) / stageZoom;
  const PULSE_MIN = R + (2 * scale) / stageZoom;

  // Icon scaling: Lucide viewBox is 0 0 24 24, center at 12,12
  // We want the icon to fill ~80% of the badge diameter (2R * 0.8)
  const ICON_SIZE = R * 1.5; // desired rendered size in canvas units
  const ICON_S = ICON_SIZE / 24; // scale factor applied to the Path
  const ICON_X = -(ICON_SIZE / 2); // offset to center the 24x24 viewBox
  const ICON_Y = -(ICON_SIZE / 2);

  const isAlert =
    (device.kind === "door" && device.status === "open") ||
    (device.kind === "sensor" && device.status === "alert");

  const activeColor = isAlert ? cfg.alertColor : cfg.color;

  // ── Pulse animation
  useEffect(() => {
    const node = pulseRef.current;
    if (!node) return;
    animRef.current?.stop();

    if (isAlert) {
      let growing = true;
      animRef.current = new Konva.Animation((frame) => {
        if (!frame) return;
        const r = node.radius();
        const speed = (0.02 * scale) / stageZoom;
        if (growing) {
          node.radius(Math.min(r + speed * frame.timeDiff, PULSE_MAX));
          node.opacity(
            Math.max(
              0.05,
              0.5 - ((r - PULSE_MIN) / (PULSE_MAX - PULSE_MIN)) * 0.45,
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

  // ── Radial glow (sensor alert only)
  useEffect(() => {
    const node = glowRef.current;
    if (!node) return;
    glowAnim.current?.stop();

    if (device.kind === "sensor" && isAlert) {
      let t = 0;
      glowAnim.current = new Konva.Animation((frame) => {
        if (!frame) return;
        t += frame.timeDiff / 900;
        const wave = (Math.sin(t * Math.PI * 2) + 1) / 2;
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

  // ── Pop animation when status changes
  useEffect(() => {
    if (prevStatus.current === device.status) return;
    prevStatus.current = device.status;

    const node = pathRef.current;
    if (!node) return;
    popAnim.current?.stop();

    let elapsed = 0;
    const duration = 280;
    popAnim.current = new Konva.Animation((frame) => {
      if (!frame) return;
      elapsed += frame.timeDiff;
      const t = Math.min(elapsed / duration, 1);
      const s =
        t < 0.5
          ? ICON_S * (1 + 0.35 * Math.sin(t * Math.PI * 2))
          : ICON_S * (1 + 0.08 * Math.sin(t * Math.PI * 4) * (1 - t));
      node.scaleX(s);
      node.scaleY(s);
      node.x(-(ICON_SIZE / 2) * (s / ICON_S));
      node.y(-(ICON_SIZE / 2) * (s / ICON_S));
      if (elapsed >= duration) {
        node.scaleX(ICON_S);
        node.scaleY(ICON_S);
        node.x(ICON_X);
        node.y(ICON_Y);
        popAnim.current?.stop();
      }
    }, node.getLayer());
    popAnim.current.start();
    return () => {
      popAnim.current?.stop();
    };
  }, [device.status, ICON_S, ICON_SIZE, ICON_X, ICON_Y]);

  // ── Long press
  const startLong = useCallback(
    (screenX: number, screenY: number) => {
      didLong.current = false;
      dragMoved.current = false;
      longTimer.current = setTimeout(() => {
        didLong.current = true;

        // Toggle status immediately on long press
        const nextStatus: DeviceStatus =
          device.kind === "door"
            ? device.status === "closed"
              ? "open"
              : "closed"
            : device.status === "ok"
              ? "alert"
              : "ok";

        onToggleStatus(device.id, nextStatus);
        onLongPress(device, screenX, screenY);
      }, LONG_PRESS_MS);
    },
    [device, onLongPress, onToggleStatus],
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
      {/* Radial glow */}
      <Circle
        ref={glowRef}
        radius={0}
        fill={cfg.alertColor}
        opacity={0}
        listening={false}
      />

      {/* Pulse ring */}
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
          radius={R + 3 / stageZoom}
          fill="transparent"
          stroke="#ffffff"
          strokeWidth={1.2 / stageZoom}
          dash={[3 / stageZoom, 2.5 / stageZoom]}
          listening={false}
        />
      )}

      {/* Badge */}
      <Circle
        radius={R}
        fill={activeColor}
        stroke={isSelected ? "#ffffff" : activeColor + "88"}
        strokeWidth={1.2 / stageZoom}
      />

      {/* Icon — SVG path scaled + centered */}
      <Path
        ref={pathRef}
        data={iconPath}
        stroke="#ffffff"
        strokeWidth={2 / ICON_S}
        fill="transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        scaleX={ICON_S}
        scaleY={ICON_S}
        x={ICON_X}
        y={ICON_Y}
        listening={false}
        opacity={0.95}
      />

      {/* Door open arc indicator */}
      {device.kind === "door" && device.status === "open" && (
        <Arc
          innerRadius={R * 0.6}
          outerRadius={R * 0.6 + 1.2 / stageZoom}
          angle={75}
          rotation={-105}
          stroke="#ff9f43"
          strokeWidth={1.2 / stageZoom}
          fill="transparent"
          listening={false}
          opacity={0.7}
        />
      )}
    </Group>
  );
}
