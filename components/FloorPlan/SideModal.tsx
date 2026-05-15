"use client";

import React, { useEffect, useRef } from "react";
import { DEVICE_CONFIGS, COLORS } from "./constants";
import type { Device, DeviceStatus } from "./types";

interface SideModalProps {
  device: Device;
  onClose: () => void;
  onStatusChange: (id: string, status: DeviceStatus) => void;
  onRemove: (id: string) => void;
}

export function SideModal({
  device,
  onClose,
  onStatusChange,
  onRemove,
}: SideModalProps) {
  const cfg = DEVICE_CONFIGS[device.kind];
  const currentStatus =
    cfg.statuses.find((s) => s.value === device.status) ?? cfg.statuses[0];
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isAlert = device.status === "open" || device.status === "alert";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "flex-end",
        width: "100%",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "min(320px, 88vw)",
          background: "#0f1528",
          borderLeft: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.2s ease",
        }}
      >
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: currentStatus.color + "20",
                border: `1px solid ${currentStatus.color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={currentStatus.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={cfg.iconPaths._default} />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: COLORS.textPrimary,
                }}
              >
                {device.label}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: COLORS.textMuted,
                  marginTop: "2px",
                }}
              >
                {cfg.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: COLORS.textDim,
              fontSize: "20px",
              lineHeight: 1,
              padding: "2px",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Status indicator */}
        <div style={{ padding: "20px" }}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: currentStatus.color + "12",
              border: `1px solid ${currentStatus.color}30`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: currentStatus.color,
                flexShrink: 0,
                animation: isAlert ? "pulse-dot 1.2s ease infinite" : "none",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: currentStatus.color,
                }}
              >
                {currentStatus.label}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: COLORS.textMuted,
                  marginTop: "2px",
                }}
              >
                {device.kind === "door"
                  ? device.status === "open"
                    ? "The lock is open"
                    : "The lock is closed and locked"
                  : device.status === "alert"
                    ? "Anomaly detected in the sensor"
                    : "Sensor operating normally"}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              fontSize: "11px",
              color: COLORS.textDim,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            {device.kind === "door" ? "Lock control" : "Sensor Status"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {cfg.statuses.map((s) => {
              const isCurrentStatus = device.status === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => {
                    onStatusChange(device.id, s.value);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${isCurrentStatus ? s.color + "66" : COLORS.border}`,
                    background: isCurrentStatus
                      ? s.color + "18"
                      : "transparent",
                    cursor: isCurrentStatus ? "default" : "pointer",
                    textAlign: "left",
                    width: "100%",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: s.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: isCurrentStatus ? s.color : COLORS.textMuted,
                      fontWeight: isCurrentStatus ? 500 : 400,
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: COLORS.border,
              margin: "20px 0",
            }}
          />

          {/* Info row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "ID", value: device.id.split("-")[1] ?? device.id },
              { label: "Type", value: cfg.label },
              { label: "Position X", value: Math.round(device.x).toString() },
              { label: "Position Y", value: Math.round(device.y).toString() },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "10px 12px",
                  background: COLORS.border + "44",
                  borderRadius: "7px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: COLORS.textDim,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: COLORS.textMuted,
                    marginTop: "3px",
                    fontFamily: "monospace",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Remove */}
          <button
            onClick={() => {
              onRemove(device.id);
              onClose();
            }}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ff6b6b33",
              borderRadius: "8px",
              background: "transparent",
              color: "#ff6b6b88",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff6b6b18";
              e.currentTarget.style.color = "#ff6b6b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#ff6b6b88";
            }}
          >
            Remove device
          </button>
        </div>
      </div>
    </div>
  );
}
