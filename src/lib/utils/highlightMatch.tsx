import type { ReactNode } from "react";

export function highlightMatch(
  text: string | null | undefined,
  query: string | null | undefined,
): ReactNode {
  const safeText = typeof text === "string" ? text : "";
  const safeQuery = typeof query === "string" ? query : "";

  if (!safeQuery.trim()) return safeText;
  const lowerText = safeText.toLowerCase();
  const lowerQuery = safeQuery.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return safeText;
  return (
    <>
      {safeText.slice(0, index)}
      <strong>{safeText.slice(index, index + safeQuery.length)}</strong>
      {safeText.slice(index + safeQuery.length)}
    </>
  );
}
