import type { GrubPacItem } from "@/types/domain/grubpacs";
import type { BoxSettingsData } from "@/components/features/grubpacs/data/mockBoxSettingsData";
import type { BoxState, BadgeVariant } from "../details/types";

export function getBoxState(status?: string): BoxState {
  if (status === "OFFLINE") return "offline";
  if (status === "ONLINE") return "online";
  return "unreachable";
}

export function getLockSrc(item: GrubPacItem): string {
  if (item.locked) return "/GrubPac/Box-settings/grublock-brand-close.svg";
  if (item.status === "OFFLINE") return "/GrubPac/Box-settings/grublock-offline-open.svg";
  if (item.status === "WARNING" || item.status === "ERROR")
    return "/GrubPac/Box-settings/grublock-warning-open.svg";
  return "/GrubPac/Box-settings/grublock-open.svg";
}

export function getStatusIconSrc(item: GrubPacItem): string {
  const power = String(item.power ?? item.powerStatus ?? "").toUpperCase();
  const globalStatus = String(item.globalStatus ?? "").toLowerCase();

  if (globalStatus === "critical") {
    return "/GrubPac/Box-settings/exclamation-triangle-critical.svg";
  }
  if (globalStatus === "attention") {
    return "/GrubPac/Box-settings/exclamation-triangle.svg";
  }

  if (power === "ON" || item.status === "ONLINE") {
    return "/GrubPac/Box-settings/check-circle.svg";
  }
  if (item.status === "WARNING" || item.status === "ERROR")
    return "/GrubPac/Box-settings/exclamation-triangle.svg";
  return "/GrubPac/Box-settings/minus-circle.svg";
}

export function getBadgeVariant(value: string): BadgeVariant {
  const v = value.toUpperCase();
  if (["ON", "STRONG", "DETECTED", "CONNECTED", "LOCKED"].includes(v)) return "green";
  if (["WEAK", "UNREACHABLE"].includes(v)) return "orange";
  if (["NO SIGNAL", "OFF", "UNLOCKED", "NOT DETECTED"].includes(v)) return "red";
  return "gray";
}

export function getDefaultSettings(boxId: number | string): BoxSettingsData {
  return {
    boxId,
    hardware: {
      power: { status: "OFF", connected: false },
      grublock: { status: "LOCKED" },
      ioniser: { status: "OFF" },
      dualZone: { status: "OFF" },
      extThermostat: { temp: "—" },
      gyrosensor: { status: "NOT DETECTED" },
    },
    connections: {
      wifi: { status: "NO SIGNAL" },
      bluetooth: { status: "NO SIGNAL" },
      signal4g: { status: "WEAK" },
      gps: { status: "OFF" },
    },
    zone1: { set: "—", actual: "—" },
    zone2: { set: "—", actual: "—" },
    driver: null,
  };
}
