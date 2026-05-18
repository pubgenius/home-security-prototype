"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FloatingToolbar } from "./Toolbar";
import { FloorPlanStage } from "./FloorPlanStage";
import { COLORS, STAGE_W, STAGE_H } from "./constants";
import type {
  Device,
  SensorKind,
  DeviceStatus,
  TooltipState,
  FloorId,
} from "./types";

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: STAGE_W, height: STAGE_H });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // Use the real container dimensions — no forced aspect ratio
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

function fitScale(stageW: number, stageH: number, padding = 64): number {
  const scaleX = (stageW - padding) / STAGE_W;
  const scaleY = (stageH - padding) / STAGE_H;
  return Math.min(scaleX, scaleY);
}

export function FloorPlan() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const scale = width > 0 && height > 0 ? fitScale(width, height) : 1;

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedKind, setSelectedKind] = useState<SensorKind>("door");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<FloorId>("first");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleDeviceAdd = useCallback(
    (d: Device) => setDevices((p) => [...p, d]),
    [],
  );
  const handleDeviceSelect = useCallback(
    (id: string | null) => setSelectedDevice(id),
    [],
  );
  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) =>
      setDevices((p) => p.map((d) => (d.id === id ? { ...d, x, y } : d))),
    [],
  );

  const handleStatusChange = useCallback((id: string, status: DeviceStatus) => {
    setDevices((p) => p.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);
  const handleClearAll = useCallback(() => {
    setDevices([]);
    setSelectedDevice(null);
    setTooltip(null);
  }, []);
  const handleLongPress = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
        overscrollBehavior: "none",
      }}
    >
      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", flex: 1, minHeight: 0 }}
      >
        <FloatingToolbar
          selectedKind={selectedKind}
          onKindChange={setSelectedKind}
          activeFloor={activeFloor}
          onFloorChange={setActiveFloor}
          onClearAll={handleClearAll}
          deviceCount={devices.length}
        />

        {width > 0 && (
          <FloorPlanStage
            width={width}
            height={height}
            scale={scale}
            devices={devices}
            selectedKind={selectedKind}
            selectedDevice={selectedDevice}
            activeFloor={activeFloor}
            onDeviceAdd={handleDeviceAdd}
            onDeviceSelect={handleDeviceSelect}
            onDeviceDragEnd={handleDragEnd}
            onTooltipChange={setTooltip}
            onLongPress={handleLongPress}
            onToggleStatus={handleStatusChange}
          />
        )}

        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y - 40,
              transform: "translateX(-50%)",
              background: "rgba(10,14,28,0.92)",
              border: `1px solid ${tooltip.color}44`,
              borderRadius: "6px",
              padding: "4px 11px",
              fontSize: "11px",
              color: tooltip.color,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 15,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {tooltip.label}
          </div>
        )}
      </div>
    </div>
  );
}
