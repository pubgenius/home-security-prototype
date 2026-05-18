"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FloatingToolbar } from "./Toolbar";
import { FloorPlanStage } from "./FloorPlanStage";
import { SideModal } from "./SideModal";
import { ToastContainer } from "./Toast";
import { COLORS, STAGE_W, STAGE_H } from "./constants";
import type {
  Device,
  SensorKind,
  DeviceStatus,
  TooltipState,
  FloorId,
  ToastState,
  SimulationEvent,
} from "./types";

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: STAGE_W, height: STAGE_H });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
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
  const [selectedKind, setSelectedKind] = useState<SensorKind>("lock");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<FloorId>("first");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [sideModal, setSideModal] = useState<Device | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const toastIdRef = useRef(0);

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
  const handleRemove = useCallback((id: string) => {
    setDevices((p) => p.filter((d) => d.id !== id));
    setSelectedDevice((p) => (p === id ? null : p));
    setTooltip(null);
    setSideModal((m) => (m?.id === id ? null : m));
  }, []);

  const handleStatusChange = useCallback((id: string, status: DeviceStatus) => {
    setDevices((p) => p.map((d) => (d.id === id ? { ...d, status } : d)));
    setSideModal((m) => (m?.id === id ? { ...m, status } : m));
  }, []);

  const handleClearAll = useCallback(() => {
    setDevices([]);
    setSelectedDevice(null);
    setTooltip(null);
    setSideModal(null);
  }, []);

  const handleLongPress = useCallback((device: Device) => {
    setSideModal(device);
    setTooltip(null);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const handleSimulate = useCallback(
    (event: SimulationEvent) => {
      setDevices((prev) => {
        const targets = prev.filter(
          (d) => d.floorId === activeFloor && d.kind === event.targetKind,
        );

        if (targets.length === 0) {
          const id = ++toastIdRef.current;
          setToasts(() => [
            {
              id,
              message: `No ${event.targetKind === "lock" ? "doors" : "sensors"} on this floor`,
              subtext: "Add devices before simulating",
              color: "#6b738f",
              iconPath:
                "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
            },
          ]);
          return prev;
        }

        const updated = prev.map((d) =>
          targets.find((t) => t.id === d.id)
            ? { ...d, status: event.triggersStatus }
            : d,
        );

        const id = ++toastIdRef.current;
        setToasts(() => [
          {
            id,
            message: event.label,
            subtext: `${targets.length} device${targets.length !== 1 ? "s" : ""} affected`,
            color: event.color,
            iconPath: event.iconPath,
          },
        ]);

        return updated;
      });
    },
    [activeFloor],
  );

  // Keep sideModal in sync with live device state
  useEffect(() => {
    if (!sideModal) return;
    const live = devices.find((d) => d.id === sideModal.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (live) setSideModal(live);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, sideModal?.id]);

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
          onSimulate={handleSimulate}
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
          />
        )}

        {tooltip && !sideModal && (
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

        {sideModal && (
          <SideModal
            device={sideModal}
            onClose={() => setSideModal(null)}
            onStatusChange={handleStatusChange}
            onRemove={handleRemove}
          />
        )}

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
