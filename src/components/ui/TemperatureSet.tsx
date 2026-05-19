import { cn } from "@/lib/utils";
import type { TemperatureLevel, TemperatureSetProps } from "@/types";

const LEVEL_STYLES: Record<
  TemperatureLevel,
  { container: string; icon: string }
> = {
  low: {
    container: [
      "bg-(--gp-color-temp-low-bg)",
      "border-(--gp-color-temp-low-border)",
      "text-(--gp-color-temp-low-text)",
    ].join(" "),
    icon: "text-(--gp-color-temp-low-text)",
  },
  mid: {
    container: [
      "bg-(--gp-color-temp-mid-bg)",
      "border-(--gp-color-temp-mid-border)",
      "text-(--gp-color-temp-mid-text)",
    ].join(" "),
    icon: "text-(--gp-color-temp-mid-text)",
  },
  high: {
    container: [
      "bg-(--gp-color-temp-high-bg)",
      "border-(--gp-color-temp-high-border)",
      "text-(--gp-color-temp-high-text)",
    ].join(" "),
    icon: "text-(--gp-color-temp-high-text)",
  },
};

function ThermometerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Thermometer tube */}
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

export function TemperatureSet({
  value,
  unit = "°C",
  level = "mid",
  showIcon = true,
  label,
  className,
  ...props
}: TemperatureSetProps) {
  const styles = LEVEL_STYLES[level];

  return (
    <span
      className={cn(
        // base pill layout
        "inline-flex items-center gap-1",
        "border rounded-(--gp-radius-round)",
        "px-(--gp-padding-s) py-[3px]",
        "text-xs font-medium leading-[18px] whitespace-nowrap",
        // level-specific colors
        styles.container,
        className,
      )}
      {...props}
    >
      {showIcon && <ThermometerIcon />}
      {label && (
        <span className="font-normal opacity-80">{label}:&nbsp;</span>
      )}
      <span>
        {value}
        {unit}
      </span>
    </span>
  );
}

export default TemperatureSet;
