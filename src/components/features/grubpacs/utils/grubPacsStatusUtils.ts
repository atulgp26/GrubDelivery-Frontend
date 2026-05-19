import type { GrubPacItem } from "@/types/domain/grubpacs";

export function getStatusIcon(item: GrubPacItem): string {
  if (item.status === "ERROR" || item.status === "CRITICAL") {
    return "warning";
  }
  if (item.status === "WARNING" || item.status === "ALERT") {
    return "warning_yellow";
  }
  if (item.status === "OFFLINE" || item.status === "OFF") {
    return "minus";
  }
  if (
    item.status === "ONLINE" ||
    item.status === "CONNECTED" ||
    item.status === "HEALTHY"
  ) {
    return "check";
  }
  return "check";
}

export function getStatusColor(item: GrubPacItem): string {
  if (item.status === "ERROR" || item.status === "CRITICAL") {
    return "text-red-500";
  }
  if (item.status === "WARNING" || item.status === "ALERT") {
    return "text-orange-500";
  }
  return "text-green-500";
}

export function getStatusTooltip(item: GrubPacItem): string {
  if (item.status === "ERROR" || item.status === "CRITICAL") {
    return "Check the box!";
  }
  if (item.status === "WARNING" || item.status === "ALERT") {
    return "Check the box!";
  }
  if (
    item.status === "ONLINE" ||
    item.status === "CONNECTED" ||
    item.status === "HEALTHY"
  ) {
    return "Box turned ON";
  }
  return "Box is ready to go :)";
}

export function getTooltipBorderColor(item: GrubPacItem): string {
  if (item.status === "ERROR" || item.status === "CRITICAL") {
    return "border-red-500";
  }
  if (item.status === "WARNING" || item.status === "ALERT") {
    return "border-orange-500";
  }
  if (item.status === "OFFLINE" || item.status === "OFF") {
    return "border-gray-400";
  }
  return "border-green-500";
}

export function getBatteryColor(battery: number | null | undefined): string {
  if (!battery && battery !== 0) {
    return "bg-[var(--color-stroke-neutral)] border-[var(--color-checkbox-bg)] text-[var(--color-stroke-brand)]";
  }
  if (battery >= 80) {
    return "bg-[var(--toast-success-bg)] border-[var(--color-success)] text-[var(--notif-success)]";
  }
  if (battery >= 20) {
    return "bg-orange-100 border-orange-500 text-orange-600";
  }
  return "bg-red-100 border-red-500 text-red-600";
}

export function getBatteryTooltip(battery: number | null | undefined): string {
  if (!battery && battery !== 0) {
    return "Battery data not available";
  }
  if (battery >= 80) {
    return "Battery level is good";
  }
  if (battery >= 20) {
    return "Battery level is moderate";
  }
  return "Battery level is low - please charge";
}

export function getLockIcon(item: GrubPacItem): string {
  if (item.locked === false) {
    return "lock_unlocked";
  }
  return "lock";
}

export function getLockIconColor(item: GrubPacItem): string {
  if (item.locked === false) {
    return "";
  }
  if (item.status === "OFFLINE" || item.status === "OFF") {
    return "text-[var(--color-admin-profile-border)]";
  }
  return "";
}

export function getLockTooltip(item: GrubPacItem): { title: string; subtitle?: string } {
  const fallbackStatus: "locked" | "unlocked" | "not_available" | "offline" =
    item.status === "OFFLINE" || item.status === "OFF"
      ? "offline"
      : item.hasLock === false
      ? "not_available"
      : item.locked === false
      ? "unlocked"
      : "locked";

  const lockStatus = item.grublockStatus ?? fallbackStatus;

  if (lockStatus === "unlocked") {
    return {
      title: "Box is unlocked.",
      subtitle: "Visit GrubLock for details >>",
    };
  }
  if (lockStatus === "offline") {
    return {
      title: "Switch on the box to access",
    };
  }
  if (lockStatus === "not_available") {
    return {
      title: "Feature not available",
    };
  }
  return {
    title: "Box is locked.",
    subtitle: "Visit GrubLock for details >>",
  };
}
