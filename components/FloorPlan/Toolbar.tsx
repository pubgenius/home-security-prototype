"use client";

import React from "react";
import { DEVICE_CONFIGS, COLORS, FLOOR_PLANS } from "./constants";
import type { SensorKind, FloorId } from "./types";

interface ToolbarProps {
  selectedKind: SensorKind;
  onKindChange: (kind: SensorKind) => void;
  activeFloor: FloorId;
  onFloorChange: (id: FloorId) => void;
  onClearAll: () => void;
  deviceCount: number;
}

const DOOR_PATH =
  "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4";
const SENSOR_PATH =
  "M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01";

const ICON_PATHS: Record<SensorKind, string> = {
  door: DOOR_PATH,
  sensor: SENSOR_PATH,
};

export function FloatingToolbar({
  selectedKind,
  onKindChange,
  activeFloor,
  onFloorChange,
  onClearAll,
  deviceCount,
}: ToolbarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 4px 4px 4px",
        background: "rgba(10, 14, 28, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "40px",
        boxShadow:
          "0 6px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        whiteSpace: "nowrap",
        userSelect: "none",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {/* Floor switcher */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "32px",
          padding: "3px",
          gap: "2px",
        }}
      >
        {FLOOR_PLANS.map((f) => {
          const isActive = activeFloor === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFloorChange(f.id)}
              style={{
                padding: "6px 13px",
                borderRadius: "28px",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.14)"
                  : "1px solid transparent",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                color: isActive ? COLORS.textPrimary : COLORS.textDim,
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: isActive ? 500 : 400,
                transition: "all 0.15s",
                outline: "none",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div
        style={{
          width: "1px",
          height: "22px",
          background: "rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      />

      {/* Device kind selector */}
      <div style={{ display: "flex", gap: "2px", padding: "2px" }}>
        {(
          Object.entries(DEVICE_CONFIGS) as [
            SensorKind,
            (typeof DEVICE_CONFIGS)[SensorKind],
          ][]
        ).map(([kind, cfg]) => {
          const isActive = selectedKind === kind;
          return (
            <button
              key={kind}
              onClick={() => onKindChange(kind)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 13px",
                borderRadius: "28px",
                border: isActive
                  ? `1px solid ${cfg.color}55`
                  : "1px solid transparent",
                background: isActive ? cfg.color + "1a" : "transparent",
                color: isActive ? cfg.color : COLORS.textMuted,
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
                fontWeight: isActive ? 500 : 400,
                transition: "all 0.16s",
                outline: "none",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={ICON_PATHS[kind]} />
              </svg>
              {cfg.label}
              {isActive && (
                <span style={{ display: "flex", gap: "3px" }}>
                  {cfg.statuses.map((s) => (
                    <span
                      key={s.value}
                      style={{
                        fontSize: "9.5px",
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: s.color + "18",
                        color: s.color,
                        border: `1px solid ${s.color}30`,
                      }}
                    >
                      {s.label}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Separator + clear */}
      {deviceCount > 0 && (
        <>
          <div
            style={{
              width: "1px",
              height: "22px",
              background: "rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          />
          <button
            onClick={onClearAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 13px 6px 10px",
              borderRadius: "28px",
              border: "1px solid transparent",
              background: "transparent",
              color: COLORS.textDim,
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "inherit",
              transition: "all 0.15s",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff6b6b";
              e.currentTarget.style.background = "rgba(255,107,107,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.textDim;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 2L10 10M10 2L2 10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontSize: "10px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "0 6px",
                color: COLORS.textMuted,
              }}
            >
              {deviceCount}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
