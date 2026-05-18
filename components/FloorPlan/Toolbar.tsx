"use client";

import React, { useState, useEffect } from "react";
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

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return touch;
}

export function FloatingToolbar({
  selectedKind,
  onKindChange,
  activeFloor,
  onFloorChange,
  onClearAll,
  deviceCount,
}: ToolbarProps) {
  const isMobile = useIsMobile();
  const isTouch = useIsTouch();

  // On mobile: floor label shortened
  const floorLabel = (label: string) =>
    isMobile ? label.replace("First ", "1F ").replace("Second ", "2F ") : label;

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "3px" : "6px",
        padding: "4px",
        background: "rgba(10, 14, 28, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "40px",
        boxShadow:
          "0 6px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        userSelect: "none",
        WebkitUserSelect: "none",
        maxWidth: "calc(100vw - 24px)",
        // Prevent long-press context menu on touch
        WebkitTouchCallout: "none" as React.CSSProperties["WebkitTouchCallout"],
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
          flexShrink: 0,
        }}
      >
        {FLOOR_PLANS.map((f) => {
          const isActive = activeFloor === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFloorChange(f.id)}
              style={{
                padding: isMobile ? "7px 10px" : "6px 13px",
                borderRadius: "28px",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.14)"
                  : "1px solid transparent",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                color: isActive ? COLORS.textPrimary : COLORS.textDim,
                cursor: isTouch ? "default" : "pointer",
                fontSize: isMobile ? "11px" : "12px",
                fontFamily: "inherit",
                fontWeight: isActive ? 500 : 400,
                transition: "all 0.15s",
                outline: "none",
                // Minimum 44px touch target height via padding
                minHeight: "36px",
                whiteSpace: "nowrap",
              }}
            >
              {floorLabel(f.label)}
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
                gap: "5px",
                padding: isMobile ? "7px 10px" : "6px 13px",
                borderRadius: "28px",
                border: isActive
                  ? `1px solid ${cfg.color}55`
                  : "1px solid transparent",
                background: isActive ? cfg.color + "1a" : "transparent",
                color: isActive ? cfg.color : COLORS.textMuted,
                cursor: isTouch ? "default" : "pointer",
                fontSize: isMobile ? "11px" : "12px",
                fontFamily: "inherit",
                fontWeight: isActive ? 500 : 400,
                transition: "all 0.16s",
                outline: "none",
                minHeight: "36px",
                whiteSpace: "nowrap",
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
                style={{ flexShrink: 0 }}
              >
                <path d={cfg.iconPaths._default} />
              </svg>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Clear — only when there are devices */}
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
              gap: "4px",
              padding: isMobile ? "7px 10px" : "6px 13px",
              borderRadius: "28px",
              border: "1px solid transparent",
              background: "transparent",
              color: COLORS.textDim,
              cursor: isTouch ? "default" : "pointer",
              fontSize: isMobile ? "11px" : "12px",
              fontFamily: "inherit",
              transition: "all 0.15s",
              outline: "none",
              minHeight: "36px",
            }}
            onPointerEnter={(e) => {
              e.currentTarget.style.color = "#ff6b6b";
              e.currentTarget.style.background = "rgba(255,107,107,0.1)";
            }}
            onPointerLeave={(e) => {
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
            {!isMobile && (
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
            )}
          </button>
        </>
      )}
    </div>
  );
}
