import React from "react";

interface PermissionRadioIconProps {
  checked: boolean;
  disabled?: boolean;
}

export default function PermissionRadioIcon({ checked, disabled = false }: PermissionRadioIconProps) {
  if (disabled) {
    return (
      <span className="shrink-0 w-5 h-5 rounded-[4px] border-2 border-[var(--gp-color-stroke-neutral-primary)] bg-[var(--gp-color-bg-neutral-secondary)]" />
    );
  }

  return (
    <span
      className={`shrink-0 w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors ${
        checked
          ? "border-[var(--gp-color-brand-primary)] bg-[var(--gp-color-brand-primary)]"
          : "border-[var(--gp-color-brand-primary)] bg-white"
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 10.5L9 14L15 7"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
