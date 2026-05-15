export type SensorKind = "door" | "sensor";
export type DoorStatus = "closed" | "open";
export type SensorStatus = "ok" | "alert";
export type DeviceStatus = DoorStatus | SensorStatus;
export type FloorId = "first" | "second";

export interface DeviceConfig {
  kind: SensorKind;
  color: string;
  alertColor: string;
  label: string;
  statuses: { value: DeviceStatus; label: string; color: string }[];
  defaultStatus: DeviceStatus;
  iconPath: string;
}

export interface Device {
  id: string;
  kind: SensorKind;
  floorId: FloorId;
  x: number;
  y: number;
  status: DeviceStatus;
  label: string;
}

export interface Room {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface FloorPlanDef {
  id: FloorId;
  label: string;
  rooms: Room[];
  walls: WallDef[];
  windows: WindowDef[];
  doorways: DoorwayDef[];
}

export interface WallDef {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface WindowDef {
  x: number;
  y: number;
  w: number;
  h: number;
  horiz: boolean;
}
export interface DoorwayDef {
  x: number;
  y: number;
  w: number;
  h: number;
  hingeSide: "left" | "right" | "top" | "bottom";
  openDir: 1 | -1;
}

export interface TooltipState {
  x: number;
  y: number;
  label: string;
  color: string;
  deviceId: string;
}

export interface SideModalState {
  device: Device;
  screenX: number;
  screenY: number;
}
