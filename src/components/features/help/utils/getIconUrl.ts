export function getIconUrl(bucketKey: string): string {
  const base = process.env.NEXT_PUBLIC_ICON_BASE_URL ?? "";
  return `${base}/${bucketKey}`;
}
