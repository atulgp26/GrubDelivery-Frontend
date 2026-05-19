export function getTransferLabel(type: "selected" | "all", count: number): string {
  return type === "all"
    ? "All GrubPacs"
    : `${count} GrubPac${count !== 1 ? "s" : ""}`;
}

export function getOtpButtonLabel(type: "selected" | "all", count: number): string {
  const countLabel =
    type === "all"
      ? "ALL GRUBPACS"
      : `${count} GRUBPAC${count !== 1 ? "S" : ""}`;
  return `VERIFY AND TRANSFER ${countLabel}`;
}
