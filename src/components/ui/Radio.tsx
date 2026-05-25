"use client";
import type { RadioProps } from "@/types";

const VARIANTS: Record<
  NonNullable<RadioProps["variant"]>,
  {
    border: string;
    hover: string;
    checkedBorder: string;
    bg: string;
    dot: string;
  }
> = {
  default: {
    border: "border-[var(--color-brand-primary-btn)]",
    hover: "hover:border-[var(--color-filter-text)] hover:bg-[var(--sidebar-active-bg)]",
    checkedBorder:
      "border-4 border-[var(--color-brand-primary-btn)] active:border-[var(--color-brand-primary-btn)] active:shadow-[0px_0px_0px_2px_var(--color-shadow-select)]",
    bg: "bg-white",
    dot: "bg-white",
  },
  gray: {
    border: "border-[var(--color-checkbox-bg)]",
    hover:
      "hover:border-[var(--notif-border)] hover:bg-[var(--color-neutral-secondary-bg)] active:border-[var(--notif-border)] active:bg-[var(--color-neutral-secondary-bg)] active:shadow-[0px_0px_0px_2px_var(--color-stroke-shadow)]",
    checkedBorder:
      "border-4 border-[var(--color-checkbox-bg)] hover:border-[var(--notif-border)] active:border-[var(--notif-border)] active:bg-[var(--color-neutral-secondary-bg)] active:shadow-[0px_0px_0px_2px_var(--color-stroke-shadow)]",
    bg: "bg-white",
    dot: "bg-white",
  },
};

export default function Radio({
  checked,
  onChange,
  label,
  name,
  value,
  description,
  className = "",
  variant = "default",
  ...props
}: RadioProps) {
  // Define color variants
  const style = VARIANTS[variant] ?? VARIANTS.default;

  return (
    <label className={`flex items-start gap-3 cursor-pointer select-none group ${className}`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        name={name}
        value={value}
        className="sr-only"
        {...props}
      />
      <span
        className={`
          relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 mt-0.5
          ${checked ? style.checkedBorder : style.border + " " + style.hover}
          ${style.bg}
        `}
      >
        {checked && <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`}></div>}
      </span>
      <div className="flex-1">
        {typeof label === "string" ? (
          <span className="text-[var(--color-neutral-secondary)] text-lg font-normal">
            {label}
          </span>
        ) : (
          label
        )}
        {description && (
          <p className="text-[var(--color-stroke-brand)] text-base font-normal mt-1">
            {description}
          </p>
        )}
      </div>
    </label>
  )
}
