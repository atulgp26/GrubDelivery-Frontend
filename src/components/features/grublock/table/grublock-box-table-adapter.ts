import type { GrubPacBoxRow } from "@/components/ui/grublock-box-table";
import type { GrubLockBox } from "@/types/domain/grublock";

/**
 * Converts a GrubLock box into the row shape used by GrubLock table UI.
 */
export function convertGrubLockBoxToTableRow(box: GrubLockBox): GrubPacBoxRow {
  const displayName =
    box.name?.trim() ||
    box.boxDisplayId?.trim() ||
    box.boxId?.trim() ||
    `Box ${box.id}`;

  const identifierParts: string[] = [];
  const displayId = box.boxDisplayId || box.boxId;
  if (displayId) {
    identifierParts.push(`#${displayId}`);
  }

  const locationParts: string[] = [];
  const secondaryId = box.boxCode || box.boxId;
  if (secondaryId) locationParts.push(secondaryId);
  if (box.restaurantName) locationParts.push(box.restaurantName);
  if (locationParts.length > 0) {
    identifierParts.push(locationParts.join(" | "));
  }

  const identifier = identifierParts.length > 0 ? identifierParts.join(" | ") : undefined;

  const batteryPercent = box.battery !== undefined ? `${box.battery}%` : undefined;
  const battery =
    box.battery !== undefined
      ? box.battery > 50
        ? "good"
        : box.battery > 20
          ? "warning"
          : "critical"
      : undefined;

  return {
    id: box.id,
    name: displayName,
    identifier,
    globalStatus: box.globalStatus,
    powerStatus: box.powerStatus,
    battery,
    batteryPercent,
    hasHandler: !!box.handler,
    handlerName: box.handler,
    handlerPhone: box.handlerPhone,
    handlerStatus: box.handlerStatus,
    grublockStatus: box.status,
    lockStatus: box.status === "locked" ? "locked" : "unlocked",
    isLocked: box.status === "locked",
  };
}

/**
 * Converts GrubLock boxes into table rows.
 */
export function convertGrubLockBoxesToTableRows(boxes: GrubLockBox[]): GrubPacBoxRow[] {
  return boxes.map(convertGrubLockBoxToTableRow);
}