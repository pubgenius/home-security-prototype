"use client";

import React from "react";
import { DEVICE_CONFIGS, COLORS } from "./constants";
import type { Device, DeviceStatus, FloorId } from "./types";

interface SensorPanelProps {
  devices: Device[];
  activeFloor: FloorId;
  selectedDevice: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onStatusChange: (id: string, status: DeviceStatus) => void;
}

export function SensorPanel({
  devices,
  activeFloor,
  selectedDevice,
  onSelect,
  onRemove,
  onStatusChange,
}: SensorPanelProps) {
  const floorDevices = devices.filter((d) => d.floorId === activeFloor);

  if (floorDevices.length === 0) {
    return (
      <div
        style={{
          padding: "11px 16px",
          background: COLORS.toolbarBg,
          borderTop: `1px solid ${COLORS.border}`,
          fontSize: "12px",
          color: COLORS.textDim,
        }}
      >
        Click the floor plan to add devices · Long-press a device to configure
      </div>
    );
  }

  const doors = floorDevices.filter((d) => d.kind === "door");
  const sensors = floorDevices.filter((d) => d.kind === "sensor");

  return (
    <div
      style={{
        background: COLORS.toolbarBg,
        borderTop: `1px solid ${COLORS.border}`,
        maxHeight: "160px",
        overflowY: "auto",
        padding: "10px 16px 12px",
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <DeviceGroup
        title="Portas"
        devices={doors}
        selectedDevice={selectedDevice}
        onSelect={onSelect}
        onRemove={onRemove}
        onStatusChange={onStatusChange}
      />
      <DeviceGroup
        title="Sensores"
        devices={sensors}
        selectedDevice={selectedDevice}
        onSelect={onSelect}
        onRemove={onRemove}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}

function DeviceGroup({
  title,
  devices,
  selectedDevice,
  onSelect,
  onRemove,
  onStatusChange,
}: {
  title: string;
  devices: Device[];
  selectedDevice: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onStatusChange: (id: string, status: DeviceStatus) => void;
}) {
  if (devices.length === 0) return null;
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: "10px",
          color: COLORS.textDim,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 500,
          marginBottom: "7px",
        }}
      >
        {title} — {devices.length}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {devices.map((device) => {
          const cfg = DEVICE_CONFIGS[device.kind];
          const statusCfg =
            cfg.statuses.find((s) => s.value === device.status) ??
            cfg.statuses[0];
          const isSelected = selectedDevice === device.id;
          const isAlert = device.status === "open" || device.status === "alert";
          return (
            <div
              key={device.id}
              onClick={() => onSelect(isSelected ? null : device.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "5px 8px 5px 10px",
                border: `1px solid ${isSelected ? cfg.color + "88" : COLORS.border}`,
                borderRadius: "7px",
                background: isSelected ? cfg.color + "12" : "#141828",
                cursor: "pointer",
                fontSize: "12px",
                color: COLORS.textPrimary,
                transition: "all 0.15s",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: statusCfg.color,
                  flexShrink: 0,
                  boxShadow: isAlert ? `0 0 5px ${statusCfg.color}` : "none",
                }}
              />
              <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
                {device.label}
              </span>
              <div style={{ display: "flex", gap: "3px" }}>
                {cfg.statuses.map((s) => {
                  const isCurrent = device.status === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(device.id, s.value);
                      }}
                      style={{
                        padding: "2px 7px",
                        fontSize: "10px",
                        borderRadius: "5px",
                        border: `1px solid ${isCurrent ? s.color + "88" : COLORS.border}`,
                        background: isCurrent ? s.color + "22" : "transparent",
                        color: isCurrent ? s.color : COLORS.textDim,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        outline: "none",
                        fontWeight: isCurrent ? 500 : 400,
                        transition: "all 0.12s",
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(device.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textDim,
                  cursor: "pointer",
                  fontSize: "15px",
                  lineHeight: 1,
                  padding: "0 2px",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = COLORS.textDim)
                }
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
