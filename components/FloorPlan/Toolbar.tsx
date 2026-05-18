"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DEVICE_CONFIGS,
  COLORS,
  FLOOR_PLANS,
  SIMULATION_EVENTS,
} from "./constants";
import type { SensorKind, FloorId, SimulationEvent } from "./types";

interface ToolbarProps {
  selectedKind: SensorKind;
  onKindChange: (kind: SensorKind) => void;
  activeFloor: FloorId;
  onFloorChange: (id: FloorId) => void;
  onClearAll: () => void;
  deviceCount: number;
  onSimulate: (event: SimulationEvent) => void;
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

const PILL_STYLE: React.CSSProperties = {
  background: "rgba(10, 14, 28, 0.88)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "40px",
  boxShadow: "0 6px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none" as React.CSSProperties["WebkitTouchCallout"],
};

export function FloatingToolbar({
  selectedKind,
  onKindChange,
  activeFloor,
  onFloorChange,
  onClearAll,
  deviceCount,
  onSimulate,
}: ToolbarProps) {
  const isMobile = useIsMobile();
  const isTouch = useIsTouch();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);

  const selectedCfg = DEVICE_CONFIGS[selectedKind];

  return (
    <>
      {/* ── Centre pill: floor switcher ── */}
      <div
        style={{
          ...PILL_STYLE,
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          padding: "4px",
          gap: "2px",
          maxWidth: "calc(100vw - 120px)",
        }}
      >
        {/* "All" dot indicator */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            fontSize: "12px",
            color: COLORS.textDim,
            fontFamily: "inherit",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#ff6b6b",
              display: "inline-block",
            }}
          />
          {!isMobile && "All"}
        </span>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        />

        {FLOOR_PLANS.map((f) => {
          const isActive = activeFloor === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFloorChange(f.id)}
              style={{
                padding: isMobile ? "7px 11px" : "7px 14px",
                borderRadius: "28px",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.16)"
                  : "1px solid transparent",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? COLORS.textPrimary : COLORS.textDim,
                cursor: isTouch ? "default" : "pointer",
                fontSize: isMobile ? "11px" : "12px",
                fontFamily: "inherit",
                fontWeight: isActive ? 500 : 400,
                transition: "all 0.15s",
                outline: "none",
                minHeight: "36px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isActive ? COLORS.textPrimary : COLORS.textDim,
                  flexShrink: 0,
                  opacity: isActive ? 1 : 0.4,
                }}
              />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Right FAB: sensor type menu ── */}
      <div
        ref={menuRef}
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          zIndex: 21,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        {/* Dropdown menu */}
        {menuOpen && (
          <div
            style={{
              ...PILL_STYLE,
              borderRadius: "14px",
              padding: "5px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              minWidth: "160px",
              animation: "fabMenuIn 0.15s ease",
            }}
          >
            <style>{`
              @keyframes fabMenuIn {
                from { opacity: 0; transform: scale(0.92) translateY(6px); }
                to   { opacity: 1; transform: scale(1)    translateY(0);   }
              }
            `}</style>

            {/* Device type options */}
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
                  onClick={() => {
                    onKindChange(kind);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: isActive
                      ? `1px solid ${cfg.color}44`
                      : "1px solid transparent",
                    background: isActive ? cfg.color + "18" : "transparent",
                    color: isActive ? cfg.color : COLORS.textMuted,
                    cursor: isTouch ? "default" : "pointer",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    fontWeight: isActive ? 500 : 400,
                    transition: "all 0.12s",
                    outline: "none",
                    width: "100%",
                    textAlign: "left",
                    minHeight: "44px",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      flexShrink: 0,
                      background: cfg.color + "20",
                      border: `1px solid ${cfg.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={cfg.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={cfg.iconPaths._default} />
                    </svg>
                  </span>
                  <span style={{ flex: 1 }}>{cfg.label}</span>
                  {isActive && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke={cfg.color}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Divider + simulate section */}
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.06)",
                margin: "2px 0",
              }}
            />
            <div
              style={{
                padding: "6px 12px 4px",
                fontSize: "9.5px",
                color: COLORS.textDim,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Simulate Events
            </div>
            {SIMULATION_EVENTS.map((evt) => (
              <button
                key={evt.id}
                onClick={() => {
                  onSimulate(evt);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid transparent",
                  background: "transparent",
                  color: COLORS.textMuted,
                  cursor: isTouch ? "default" : "pointer",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  transition: "all 0.12s",
                  outline: "none",
                  width: "100%",
                  textAlign: "left",
                  minHeight: "44px",
                }}
                onPointerEnter={(e) => {
                  e.currentTarget.style.background = evt.color + "14";
                  e.currentTarget.style.color = evt.color;
                  e.currentTarget.style.borderColor = evt.color + "33";
                }}
                onPointerLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = COLORS.textMuted;
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    flexShrink: 0,
                    background: evt.color + "18",
                    border: `1px solid ${evt.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={evt.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={evt.iconPath} />
                  </svg>
                </span>
                <span style={{ flex: 1, lineHeight: 1.3 }}>
                  <span style={{ display: "block" }}>{evt.label}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: COLORS.textDim,
                      display: "block",
                      marginTop: "1px",
                    }}
                  >
                    {evt.description}
                  </span>
                </span>
              </button>
            ))}

            {/* Divider + clear if devices exist */}
            {deviceCount > 0 && (
              <>
                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.06)",
                    margin: "2px 0",
                  }}
                />
                <button
                  onClick={() => {
                    onClearAll();
                    setMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid transparent",
                    background: "transparent",
                    color: "#ff6b6b88",
                    cursor: isTouch ? "default" : "pointer",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    transition: "all 0.12s",
                    outline: "none",
                    width: "100%",
                    textAlign: "left",
                    minHeight: "44px",
                  }}
                  onPointerEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,107,107,0.1)";
                    e.currentTarget.style.color = "#ff6b6b";
                  }}
                  onPointerLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ff6b6b88";
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      flexShrink: 0,
                      background: "rgba(255,107,107,0.1)",
                      border: "1px solid rgba(255,107,107,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 2L10 10M10 2L2 10"
                        stroke="#ff6b6b"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  Clear devices
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "10px",
                      background: "rgba(255,107,107,0.12)",
                      border: "1px solid rgba(255,107,107,0.2)",
                      borderRadius: "6px",
                      padding: "1px 6px",
                      color: "#ff6b6b88",
                    }}
                  >
                    {deviceCount}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: menuOpen
              ? `1px solid ${selectedCfg.color}66`
              : "1px solid rgba(255,255,255,0.1)",
            background: menuOpen
              ? selectedCfg.color + "22"
              : "rgba(10,14,28,0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            cursor: isTouch ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.18s ease",
            outline: "none",
            position: "relative",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={menuOpen ? selectedCfg.color : COLORS.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "stroke 0.15s" }}
          >
            <path d={selectedCfg.iconPaths._default} />
          </svg>

          {/* Active kind dot indicator */}
          {!menuOpen && (
            <span
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: selectedCfg.color,
                border: "1.5px solid rgba(10,14,28,0.88)",
              }}
            />
          )}
        </button>
      </div>
    </>
  );
}
