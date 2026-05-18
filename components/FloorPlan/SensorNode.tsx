"use client";

import { useRef, useEffect, useCallback } from "react";
import { Group, Circle, Path, Arc } from "react-konva";
import Konva from "konva";
import type { Device } from "./types";
import { DEVICE_CONFIGS } from "./constants";

interface SensorNodeProps {
  device: Device;
  stageZoom: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onMouseEnter: (device: Device, x: number, y: number) => void;
  onMouseLeave: () => void;
  onLongPress: (device: Device, x: number, y: number) => void;
}

const LONG_PRESS_MS = 500;

export function SensorNode({
  device,
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
  // Fixed screen-pixel size — same on desktop and mobile regardless of scale/zoom.
  // Dividing by stageZoom converts screen-px → Konva world-units (zoom is applied on top).
  const zoomFactor = Math.pow(stageZoom, 0.5);

  const SCREEN_R = 14;
  const R = SCREEN_R / zoomFactor;
  const PULSE_MAX = (SCREEN_R * 2.2) / zoomFactor;
  const PULSE_MIN = R + 3 / zoomFactor;

  // Icon: fill ~80% of badge diameter in screen pixels
  const ICON_SIZE = (SCREEN_R * 1.6) / zoomFactor;
  const ICON_S = ICON_SIZE / 24;
  const ICON_X = -(ICON_SIZE / 2);
  const ICON_Y = -(ICON_SIZE / 2);

  const isAlert =
    (device.kind === "lock" && device.status === "open") ||
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
        const speed = 0.02 / zoomFactor;
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
  }, [isAlert, PULSE_MIN, PULSE_MAX, zoomFactor]);

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
      <Circle
        ref={glowRef}
        radius={0}
        fill={cfg.alertColor}
        opacity={0}
        listening={false}
      />

      <Circle
        ref={pulseRef}
        radius={PULSE_MIN}
        fill={activeColor}
        opacity={0.15}
        listening={false}
      />

      {isSelected && (
        <Circle
          radius={R + 3 / zoomFactor}
          fill="transparent"
          stroke="#ffffff"
          strokeWidth={1.2 / zoomFactor}
          dash={[3 / zoomFactor, 2.5 / zoomFactor]}
          listening={false}
        />
      )}

      <Circle
        radius={R}
        fill={activeColor}
        stroke={isSelected ? "#ffffff" : activeColor + "88"}
        strokeWidth={1.2 / zoomFactor}
      />

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

      {device.kind === "lock" && device.status === "open" && (
        <Arc
          innerRadius={R * 0.6}
          outerRadius={R * 0.6 + 1.2 / zoomFactor}
          angle={75}
          rotation={-105}
          stroke="#ff9f43"
          strokeWidth={1.2 / zoomFactor}
          fill="transparent"
          listening={false}
          opacity={0.7}
        />
      )}
    </Group>
  );
}
