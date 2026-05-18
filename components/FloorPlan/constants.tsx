import type { DeviceConfig, SensorKind, FloorPlanDef } from "./types";

// All paths: viewBox 0 0 24 24, stroke-based, Lucide-style

// Door closed = locked padlock
const LOCK_CLOSED =
  "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4";

// Door open = unlocked padlock (shackle open on right)
const LOCK_OPEN =
  "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M17 11V7a5 5 0 0 0-9.9-1";

// Sensor ok = circle-check
const CHECK_OK = "M20 6 9 17l-5-5";

// Sensor alert = circle-x (something wrong)
const CHECK_ALERT =
  "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6";

export const DEVICE_CONFIGS: Record<SensorKind, DeviceConfig> = {
  lock: {
    kind: "lock",
    color: "#51cf66",
    alertColor: "#ff6b6b",
    label: "Lock",
    iconPaths: {
      _default: LOCK_CLOSED,
      closed: LOCK_CLOSED,
      open: LOCK_OPEN,
    },
    defaultStatus: "closed",
    statuses: [
      { value: "closed", label: "Locked", color: "#51cf66" },
      { value: "open", label: "Open", color: "#ff6b6b" },
    ],
  },
  sensor: {
    kind: "sensor",
    color: "#51cf66",
    alertColor: "#ff6b6b",
    label: "Sensor",
    iconPaths: {
      _default: CHECK_OK,
      ok: CHECK_OK,
      alert: CHECK_ALERT,
    },
    defaultStatus: "ok",
    statuses: [
      { value: "ok", label: "Normal", color: "#51cf66" },
      { value: "alert", label: "Alert", color: "#ff6b6b" },
    ],
  },
};

export const COLORS = {
  bg: "#111522",
  stageBg: "#1a1f2e",
  floorFill: "#252d42",
  roomFill: "#2d3650",
  roomStroke: "#3d4a6a",
  labelColor: "#6a7a9e",
  toolbarBg: "#0d1120",
  border: "#1e2540",
  textPrimary: "#c8cedf",
  textMuted: "#6b738f",
  textDim: "#3d4565",
  wallFill: "#1a2035",
  wallStroke: "#2a3355",
};

export const WALL_T = 8; // wall thickness in world units

// ─── SECOND FLOOR ────────────────────────────────────────────────────────────
const SF_ROOMS = [
  { id: "sf-master-bath", x: 68, y: 48, w: 116, h: 86, label: "Master Bath" },
  { id: "sf-morn-bar", x: 184, y: 48, w: 66, h: 46, label: "Morn. Bar" },
  { id: "sf-closet", x: 184, y: 94, w: 66, h: 40, label: "Closet" },
  {
    id: "sf-master-bed",
    x: 68,
    y: 134,
    w: 182,
    h: 96,
    label: "Master Bedroom",
  },
  {
    id: "sf-master-closet",
    x: 68,
    y: 230,
    w: 182,
    h: 104,
    label: "Master Closet",
  },
  { id: "sf-stairs", x: 68, y: 334, w: 182, h: 66, label: "Stairs" },
  { id: "sf-sofia-bed", x: 258, y: 48, w: 96, h: 76, label: "Sofia's Bedroom" },
  {
    id: "sf-sofia-closet",
    x: 258,
    y: 124,
    w: 58,
    h: 58,
    label: "Sofia's Closet",
  },
  { id: "sf-foyer", x: 258, y: 182, w: 154, h: 218, label: "Foyer" },
  { id: "sf-gallery-1", x: 316, y: 124, w: 96, h: 58, label: "Gallery" },
  { id: "sf-play-room", x: 354, y: 48, w: 96, h: 76, label: "Play Room" },
  { id: "sf-gallery-2", x: 412, y: 124, w: 154, h: 58, label: "Gallery" },
  { id: "sf-guest-bed", x: 412, y: 182, w: 66, h: 58, label: "Guest Bed. 2" },
  { id: "sf-guest-bath", x: 478, y: 182, w: 46, h: 58, label: "Guest Bath" },
  { id: "sf-elevator", x: 524, y: 182, w: 42, h: 58, label: "Elev." },
  { id: "sf-mech", x: 412, y: 240, w: 154, h: 76, label: "Mech / Linen" },
  { id: "sf-hollin-bed", x: 524, y: 48, w: 42, h: 76, label: "Hollin's Bed." },
  { id: "sf-roman-bath", x: 450, y: 48, w: 74, h: 54, label: "Roman's Bath" },
  {
    id: "sf-yana-closet",
    x: 450,
    y: 102,
    w: 74,
    h: 58,
    label: "Yana's Closet",
  },
  { id: "sf-yana-bed", x: 524, y: 124, w: 42, h: 90, label: "Yana's Bed." },
  { id: "sf-yana-bath", x: 524, y: 214, w: 42, h: 58, label: "Yana's Bath" },
];

// ─── FIRST FLOOR ─────────────────────────────────────────────────────────────
const FF_ROOMS = [
  { id: "ff-library", x: 68, y: 48, w: 110, h: 90, label: "Library" },
  { id: "ff-bar-lounge", x: 178, y: 48, w: 90, h: 56, label: "Bar / Lounge" },
  { id: "ff-gallery-1", x: 268, y: 48, w: 150, h: 56, label: "Gallery" },
  { id: "ff-gallery-2", x: 418, y: 48, w: 148, h: 56, label: "Gallery" },
  { id: "ff-family", x: 524, y: 48, w: 42, h: 130, label: "Family" },
  { id: "ff-bath", x: 68, y: 138, w: 78, h: 58, label: "Bath" },
  { id: "ff-guest", x: 146, y: 104, w: 122, h: 92, label: "Guest" },
  { id: "ff-foyer", x: 268, y: 104, w: 154, h: 92, label: "Foyer" },
  { id: "ff-dining", x: 422, y: 104, w: 100, h: 74, label: "Dining" },
  { id: "ff-coat", x: 268, y: 196, w: 74, h: 66, label: "Coat" },
  { id: "ff-entry", x: 342, y: 196, w: 78, h: 66, label: "Entry" },
  { id: "ff-powder", x: 420, y: 196, w: 100, h: 66, label: "Powder" },
  {
    id: "ff-covered-terr",
    x: 524,
    y: 178,
    w: 42,
    h: 84,
    label: "Covered Terrace",
  },
  { id: "ff-storage", x: 68, y: 196, w: 78, h: 66, label: "Storage" },
  { id: "ff-corridor", x: 146, y: 196, w: 122, h: 66, label: "Corridor" },
  { id: "ff-delivery", x: 520, y: 262, w: 46, h: 66, label: "Delivery" },
  { id: "ff-stairs", x: 268, y: 262, w: 154, h: 66, label: "Stairs" },
];

export const FLOOR_PLANS: FloorPlanDef[] = [
  {
    id: "first",
    label: "First Floor",
    rooms: FF_ROOMS,
    walls: [],
    windows: [],
    doorways: [],
  },
  {
    id: "second",
    label: "Second Floor",
    rooms: SF_ROOMS,
    walls: [],
    windows: [],
    doorways: [],
  },
];

export const STAGE_W = 640;
export const STAGE_H = 440;
