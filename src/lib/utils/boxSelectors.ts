import type { Employee } from "@/types/domain/employees";

export interface BoxItem {
  id: string;
  name: string;
  displayId?: string;
  vehicleNumber?: string;
  powerStatus?: string;
}

/** Extract direct boxes assigned to the employee's restaurant */
export function getDirectBoxes(employee: Employee): BoxItem[] {
  const direct = [];
  if (employee.handlerBox) {
    direct.push({
      id: employee.handlerBox.id,
      name: employee.handlerBox.name,
      displayId: employee.handlerBox.displayId,
    });
  }
  if (employee.boxDetails?.boxId && !direct.some((b) => b.displayId === employee.boxDetails?.boxId)) {
    direct.push({
      id: employee.boxDetails.settingsId || employee.boxDetails.boxId,
      name: employee.boxDetails.boxId,
      displayId: employee.boxDetails.boxId,
      vehicleNumber: employee.boxDetails.licenseNumber,
    });
  }
  return direct;
}

/** Extract shared boxes */
export function getSharedBoxes(employee: Employee): BoxItem[] {
  return (employee.sharedBoxes ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    displayId: b.displayId,
    vehicleNumber: b.vehicleNumber,
    powerStatus: b.powerStatus,
  }));
}

/** Get all accessible boxes (direct + shared) */
export function getAccessibleBoxes(employee: Employee): BoxItem[] {
  return [...getDirectBoxes(employee), ...getSharedBoxes(employee)];
}

/** Count of direct boxes only */
export function getDirectBoxesCount(employee: Employee): number {
  return getDirectBoxes(employee).length;
}

/** Count of shared boxes only */
export function getSharedBoxesCount(employee: Employee): number {
  return getSharedBoxes(employee).length;
}

/** Total accessible boxes count */
export function getAccessibleBoxesCount(employee: Employee): number {
  return getDirectBoxesCount(employee) + getSharedBoxesCount(employee);
}

/** Deduplicate an array of items by `id` */
export function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

/** Search within a list of BoxItems */
export function searchBoxes(boxes: BoxItem[], query: string): BoxItem[] {
  if (!query.trim()) return boxes;
  const q = query.toLowerCase();
  return boxes.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      (b.displayId && b.displayId.toLowerCase().includes(q)) ||
      (b.vehicleNumber && b.vehicleNumber.toLowerCase().includes(q)),
  );
}
