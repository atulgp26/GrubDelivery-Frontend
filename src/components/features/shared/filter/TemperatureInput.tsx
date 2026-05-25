interface TemperatureInputProps {
  label: string;
  subtitle?: string;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export default function TemperatureInput({
  label,
  subtitle,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: TemperatureInputProps) {
  return (
    <div className="space-y-3 min-w-0">
      <h2>
        {label}
        {subtitle && <span className="font-normal text-xs"> {subtitle}</span>}
      </h2>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
        <div className="relative min-w-0">
          <input
            type="number"
            value={minValue}
            onChange={(e) => onMinChange(Number(e.target.value))}
            className="w-20 sm:w-24 pr-9 sm:pr-10 pl-3 sm:pl-4 py-1 rounded-lg border border-[var(--color-stroke-neutral)] bg-white text-sm font-medium shadow-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
            °C
          </span>
        </div>
        <span className="font-medium">to</span>
        <div className="relative min-w-0">
          <input
            type="number"
            value={maxValue}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            className="w-20 sm:w-24 pr-9 sm:pr-10 pl-3 sm:pl-4 py-1 rounded-lg border border-[var(--color-stroke-neutral)] bg-white text-[var(--color-neutral-secondary)] text-sm font-medium shadow-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
            °C
          </span>
        </div>
      </div>
    </div>
  );
}
