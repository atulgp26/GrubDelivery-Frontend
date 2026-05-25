import type { GrubPacItem } from "@/components/features/grubpacs/hooks/useGrubPacsListState";
import type { GrubPacDataRow } from "@/components/features/grubpacs/table/grubpac-data-table";
import {
  normalizeGlobalStatus,
  normalizeHandlerStatus,
  normalizePowerStatus,
} from "@/lib/utils/grubpacStatus";

/**
 * Maps GrubPacItem to GrubPacDataRow for the new grubpac-data-table component
 */
export function mapGrubPacItemToDataRow(item: GrubPacItem): GrubPacDataRow {
  const powerStatusValue = normalizePowerStatus(item.powerStatus);

  // Determine health status based on battery and power
  let healthStatus: "good" | "warning" | "critical" | "unknown" = "unknown";
  if (powerStatusValue === "on") {
    if (item.battery && item.battery > 50) {
      healthStatus = "good";
    } else if (item.battery && item.battery > 20) {
      healthStatus = "warning";
    } else if (item.battery !== null && item.battery !== undefined) {
      healthStatus = "critical";
    }
  }

  // Determine battery status
  let batteryStatus: "good" | "warning" | "critical" | "unknown" = "unknown";
  if (item.battery !== null && item.battery !== undefined) {
    if (item.battery > 50) {
      batteryStatus = "good";
    } else if (item.battery > 20) {
      batteryStatus = "warning";
    } else {
      batteryStatus = "critical";
    }
  }

  // Build identifier (code + location if available)
  const identifierParts: string[] = [];
  if (item.code) identifierParts.push(`#${item.code}`);
  if (item.location) identifierParts.push(item.location);
  const identifier = identifierParts.join(" | ") || undefined;

  // Build zone temp string (only if powered on)
  let zoneTemp: string | undefined;
  if (powerStatusValue === "on" && (item.zone1Temp || item.zone2Temp)) {
    const zoneParts: string[] = [];
    if (item.zone1Temp) zoneParts.push(`Zone 1 : ${item.zone1Temp}`);
    if (item.zone2Temp) zoneParts.push(`Zone 2 : ${item.zone2Temp}`);
    zoneTemp = zoneParts.join(" | ");
  }

  // Ioniser status (only if powered on)
  const ioniserStatus = powerStatusValue === "on" ? (item.ioniser || undefined) : undefined;

  const inferredGrublockStatus: "locked" | "unlocked" | "not_available" | "offline" =
    powerStatusValue === "off"
      ? "offline"
      : item.hasLock === false
      ? "not_available"
      : item.locked === false
      ? "unlocked"
      : "locked";

  const grublockStatus = item.grublockStatus ?? inferredGrublockStatus;

  const globalStatus = normalizeGlobalStatus(item.globalStatus);
  const handlerStatus = normalizeHandlerStatus(item.handlerStatus);

  return {
    id: String(item.id),
    name: item.name || `Box ${item.id}`,
    identifier,
    isLocked: item.locked,
    hasLock: item.hasLock,
    grublockStatus,
    globalStatus,
    powerStatus: powerStatusValue,
    healthStatus,
    batteryPercent: item.battery ?? undefined,
    batteryStatus,
    ioniserStatus,
    zoneTemp,
    hasHandler: Boolean(item.handler),
    handlerStatus,
    handlerName: item.handlerDetails?.name ?? undefined,
    handlerPhone: item.handlerDetails?.phone ?? undefined,
    accessMode: item.accessMode ?? "public",
    blockedEmployeeIds: item.blockedEmployeeIds ?? [],
    added: item.added || item.addedDate || undefined,
  };
}

/**
 * Maps an array of GrubPacItems to GrubPacDataRows
 */
export function mapGrubPacItemsToDataRows(items: GrubPacItem[]): GrubPacDataRow[] {
  return items.map(mapGrubPacItemToDataRow);
}
