"use client";

import React, { useEffect, useState } from "react";
import type { ToastState } from "./types";

interface ToastProps {
  toast: ToastState;
  onDismiss: (id: number) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3.5s
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3500);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        background: "rgba(13,17,32,0.95)",
        border: `1px solid ${toast.color}44`,
        borderRadius: "12px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${toast.color}22`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        minWidth: "260px",
        maxWidth: "calc(100vw - 48px)",
        transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(16px) scale(0.96)",
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "9px",
          flexShrink: 0,
          background: toast.color + "20",
          border: `1px solid ${toast.color}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={toast.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={toast.iconPath} />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#c8cedf",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {toast.message}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#6b738f",
            marginTop: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {toast.subtext}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          borderRadius: "0 0 12px 12px",
          background: toast.color,
          opacity: 0.5,
          animation: "toastProgress 3.5s linear forwards",
        }}
      />
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastState[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
