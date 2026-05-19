import React from "react";

interface PermissionRadioIconProps {
  checked: boolean;
  disabled?: boolean;
}

export default function PermissionRadioIcon({ checked, disabled = false }: PermissionRadioIconProps) {
  if (disabled) {
    return (
      <span className="shrink-0 w-5 h-5 rounded-full border-2 border-[var(--gp-color-stroke-neutral-primary)] bg-[var(--gp-color-bg-neutral-secondary)]" />
    );
  }

  return (
    <span
      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        checked
          ? "border-[var(--gp-color-brand-primary)] bg-[var(--gp-color-brand-primary)]"
          : "border-[var(--gp-color-brand-primary)] bg-white"
      }`}
    >
      {checked && <span className="w-[12px] h-[12px] rounded-full bg-white" />}
    </span>
  );
}
