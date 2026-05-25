export const sanitizeEmail = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

