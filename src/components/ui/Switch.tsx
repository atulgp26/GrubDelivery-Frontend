// app/components/ToggleButton.tsx or any component path
"use client";
import { useState } from "react";
import type { SwitchProps } from "@/types";

export default function ToggleButton({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
  variant = "default",
  ...props
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState<boolean>(checked ?? false);
  const isOn = checked ?? internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOn;
    onChange?.(next);
    if (checked === undefined) {
      setInternalChecked(next);
    }
  };

  const bgColors = variant === "neutral"
    ? { on: "bg-[#757A79]", off: "bg-[#D0D4D2]" }
    : { on: "bg-[#6CB56C]", off: "bg-[#757A79]" };

  return (
    <button
      type="button"
      aria-pressed={isOn}
      onClick={handleToggle}
      disabled={disabled}
      className={`w-9 h-5 flex items-center rounded-full p-[2px] transition-colors duration-300 ${
        isOn ? bgColors.on : bgColors.off
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      {...props}
    >
      <span
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
          isOn ? "translate-x-4" : "translate-x-0"
        }`}
      />
      {label && (
        <span className="ml-2 text-sm text-[var(--color-neutral-secondary)]">{label}</span>
      )}
    </button>
  );
}
