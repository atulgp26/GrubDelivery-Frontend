export interface GroupArrayWrapper<T> {
  array?: T[];
}

export function getWrappedGroupArray<T>(value: unknown): T[] {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "array" in value &&
    Array.isArray((value as { array?: unknown }).array)
  ) {
    return (value as { array: T[] }).array;
  }

  return [];
}

export function flattenWrappedGroupRecord<T>(
  groups: Record<string, unknown> | undefined,
): T[] {
  if (!groups) return [];

  const items: T[] = [];
  for (const [key, value] of Object.entries(groups)) {
    if (key.endsWith("_name") || key.endsWith("_count")) continue;
    items.push(...getWrappedGroupArray<T>(value));
  }

  return items;
}
