"use client";

import React, { useEffect, useState } from "react";
import { DEVICE_CONFIGS, COLORS } from "./constants";
import type { Device, DeviceStatus } from "./types";

interface SideModalProps {
  device: Device;
  onClose: () => void;
  onStatusChange: (id: string, status: DeviceStatus) => void;
  onRemove: (id: string) => void;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
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
  const isAlert = device.status === "open" || device.status === "alert";
  const isMobile = useIsMobile();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll on iOS while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on backdrop click (desktop only)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!isMobile && e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
      <div
        onClick={handleBackdropClick}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 100,
          touchAction: isMobile ? "none" : "auto",
          // Desktop: dimmed backdrop
          background: isMobile ? "#0d1120" : "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: isMobile ? "stretch" : "flex-start",
          justifyContent: isMobile ? "stretch" : "flex-end",
          animation: isMobile ? "none" : "modalFadeIn 0.18s ease",
          overflowY: isMobile ? "auto" : "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          style={{
            width: isMobile ? "100%" : "320px",
            height: isMobile ? "100%" : "100%",
            maxHeight: "100%",
            background: "#0d1120",
            borderLeft: isMobile ? "none" : `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            animation: isMobile
              ? "modalSlideUp 0.22s ease"
              : "modalSlideIn 0.22s ease",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              position: "sticky",
              top: 0,
              background: "#0d1120",
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  flexShrink: 0,
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
                  <path
                    d={cfg.iconPaths[device.status] ?? cfg.iconPaths._default}
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
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
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                color: COLORS.textMuted,
                fontSize: "18px",
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onPointerEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
              onPointerLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
              }
            >
              ✕
            </button>
          </div>

          <div
            style={{
              padding: "20px",
              flex: 1,
              maxWidth: "480px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: currentStatus.color + "12",
                border: `1px solid ${currentStatus.color}30`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: currentStatus.color,
                  flexShrink: 0,
                  animation: isAlert ? "pulse-dot 1.2s ease infinite" : "none",
                  boxShadow: isAlert
                    ? `0 0 8px ${currentStatus.color}`
                    : "none",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: currentStatus.color,
                  }}
                >
                  {currentStatus.label}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: COLORS.textMuted,
                    marginTop: "3px",
                  }}
                >
                  {device.kind === "lock"
                    ? device.status === "open"
                      ? "Lock is unlocked"
                      : "Lock is secured"
                    : device.status === "alert"
                      ? "Sensor anomaly detected"
                      : "Sensor operating normally"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "11px",
                color: COLORS.textDim,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: "10px",
              }}
            >
              {device.kind === "lock" ? "Lock Controls" : "Sensor Status"}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              {cfg.statuses.map((s) => {
                const isCurrent = device.status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => onStatusChange(device.id, s.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px",
                      borderRadius: "10px",
                      border: `1px solid ${isCurrent ? s.color + "66" : COLORS.border}`,
                      background: isCurrent
                        ? s.color + "18"
                        : "rgba(255,255,255,0.02)",
                      cursor: isCurrent ? "default" : "pointer",
                      textAlign: "left",
                      width: "100%",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "50%",
                        background: s.color,
                        flexShrink: 0,
                        boxShadow: isCurrent ? `0 0 6px ${s.color}88` : "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: isCurrent ? s.color : COLORS.textMuted,
                        fontWeight: isCurrent ? 500 : 400,
                        flex: 1,
                      }}
                    >
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: s.color,
                          background: s.color + "18",
                          border: `1px solid ${s.color}33`,
                          borderRadius: "6px",
                          padding: "2px 8px",
                        }}
                      >
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                height: "1px",
                background: COLORS.border,
                marginBottom: "24px",
              }}
            />

            <div
              style={{
                fontSize: "11px",
                color: COLORS.textDim,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: "10px",
              }}
            >
              Information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "24px",
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
                    padding: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: COLORS.textDim,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: COLORS.textMuted,
                      fontFamily: "monospace",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                onRemove(device.id);
                onClose();
              }}
              style={{
                width: "100%",
                padding: "16px",
                border: "1px solid #ff6b6b33",
                borderRadius: "10px",
                background: "transparent",
                color: "#ff6b6b66",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onPointerEnter={(e) => {
                e.currentTarget.style.background = "#ff6b6b18";
                e.currentTarget.style.color = "#ff6b6b";
                e.currentTarget.style.borderColor = "#ff6b6b55";
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ff6b6b66";
                e.currentTarget.style.borderColor = "#ff6b6b33";
              }}
            >
              Remove device
            </button>
          </div>
        </div>{" "}
      </div>{" "}
    </>
  );
}
