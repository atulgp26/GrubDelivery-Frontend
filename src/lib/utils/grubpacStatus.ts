export type NormalizedGlobalStatus = "power_off" | "ready" | "critical" | "attention" | "unknown";
export type NormalizedPowerStatus = "on" | "off" | "unknown";
export type NormalizedHandlerStatus = "connected" | "disconnected" | "not_shared" | "offline" | "unknown";

export function normalizeGlobalStatus(value: unknown): NormalizedGlobalStatus {
  if (typeof value !== "string") return "unknown";

  const normalized = value.trim().toLowerCase();
  if (normalized === "power_off") return "power_off";
  if (normalized === "ready") return "ready";
  if (normalized === "critical") return "critical";
  if (normalized === "attention") return "attention";

  return "unknown";
}

export function normalizePowerStatus(value: unknown): NormalizedPowerStatus {
  if (typeof value !== "string") return "unknown";

  const normalized = value.trim().toLowerCase();
  if (normalized === "on") return "on";
  if (normalized === "off") return "off";

  return "unknown";
}

export function normalizeHandlerStatus(value: unknown): NormalizedHandlerStatus {
  if (typeof value !== "string") return "unknown";

  const normalized = value.trim().toLowerCase();
  if (normalized === "connected") return "connected";
  if (normalized === "disconnected") return "disconnected";
  if (normalized === "not_shared") return "not_shared";
  if (normalized === "offline") return "offline";

  return "unknown";
}