export interface FilterOption {
  name: string;
  bgColor: string;
  textColor: string;
}

export const powerStatuses: FilterOption[] = [
  {
    name: "Powered off",
    bgColor: "bg-[var(--color-alert-warm)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "Powered on",
    bgColor: "bg-[var(--color-success)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "Unknown",
    bgColor: "bg-[var(--color-neutral-light)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
];

export const connectionStatuses: FilterOption[] = [
  {
    name: "Disconnected",
    bgColor: "bg-[var(--color-alert-warm)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "Connected",
    bgColor: "bg-[var(--color-success)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
];

export const healthStatuses: FilterOption[] = [
  {
    name: "Critical",
    bgColor: "bg-[var(--color-alert-warm)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "Healthy",
    bgColor: "bg-[var(--color-success)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "Needs attention",
    bgColor: "bg-[var(--color-helpwrite-btn)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
];

export const grubLockStatuses: FilterOption[] = [
  {
    name: "Unlocked",
    bgColor: "bg-[var(--color-alert-warm)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "Locked",
    bgColor: "bg-[var(--color-success)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "No lock available",
    bgColor: "bg-[var(--color-neutral-light)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
];

export function getConnectionColorVar(name: string): string {
  return name === "Disconnected"
    ? "--color-alert-warm"
    : name === "Connected"
    ? "--color-success"
    : "--color-checkbox-bg";
}

export function getHealthColorVar(name: string): string {
  return name === "Critical"
    ? "--color-alert-warm"
    : name === "Healthy"
    ? "--color-success"
    : "--color-helpwrite-btn";
}

export function getGrubLockStatusColorVar(name: string): string {
  return name === "Unlocked"
    ? "--color-alert-warm"
    : name === "Locked"
    ? "--color-success"
    : "--color-neutral-light";
}

export function getPowerStatusColorVar(name: string): string {
  return name === "Powered off"
    ? "--color-alert-warm"
    : name === "Powered on"
    ? "--color-success"
    : "--color-neutral-light";
}

export const suspendedGrubLockStatuses: FilterOption[] = [
  {
    name: "Lock available",
    bgColor: "bg-[var(--color-success)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
  {
    name: "No lock available",
    bgColor: "bg-[var(--color-neutral-light)]",
    textColor: "text-[var(--color-neutral-secondary)]",
  },
];

export function getSuspendedGrubLockColorVar(name: string): string {
  return name === "Lock available" ? "--color-success" : "--color-neutral-light";
}
