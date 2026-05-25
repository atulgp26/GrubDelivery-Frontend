import type { TableCheckboxProps } from "@/types";

export default function TableCheckbox({
  checked,
  onChange,
  indeterminate = false,
  colorVar = "--color-checkbox-bg",
  tone = "default",
  ...props
}: TableCheckboxProps) {
  const checkedStyle =
    checked || indeterminate
      ? {
          background: `var(${colorVar})`,
          borderColor: `var(${colorVar})`,
        }
      : {};

  const isNeutralTone = tone === "neutral";
  const neutralBase =
    "w-5 h-5 flex items-center justify-center rounded-sm border border-[var(--color-checkbox-bg)] bg-white peer-active:scale-95";
  const neutralUncheckedStates =
    "peer-hover:border-[var(--dark-sage)] peer-hover:bg-[var(--color-neutral-secondary-bg)] peer-active:border-[var(--notif-border)] peer-active:bg-[var(--color-neutral-secondary-bg)] peer-active:shadow-[0_0_0_var(--Spread-50,_2px)_var(--Special-Effects-Ring---Colour,_rgba(121,134,126,0.40))] peer-focus-visible:border-[var(--notif-border)] peer-focus-visible:bg-[var(--color-neutral-secondary-bg)] peer-focus-visible:shadow-[0_0_0_var(--Spread-50,_2px)_var(--Special-Effects-Ring---Colour,_rgba(121,134,126,0.40))]";
  const neutralCheckedStates =
    "peer-hover:!bg-[var(--dark-sage)] peer-hover:!border-[var(--dark-sage)] peer-active:!bg-[var(--color-checkbox-bg)] peer-active:!border-[var(--color-checkbox-bg)] peer-active:shadow-[0_0_0_var(--Spread-50,_2px)_var(--Special-Effects-Ring---Colour,_rgba(121,134,126,0.40))] peer-focus-visible:!bg-[var(--color-checkbox-bg)] peer-focus-visible:!border-[var(--color-checkbox-bg)] peer-focus-visible:shadow-[0_0_0_var(--Spread-50,_2px)_var(--Special-Effects-Ring---Colour,_rgba(121,134,126,0.40))]";
  const defaultBase =
    "w-5 h-5 flex items-center justify-center rounded-sm border border-[rgb(var(--neutral-500))] bg-white peer-hover:border-[var(--color-filter-text)] peer-hover:bg-[var(--action-btn-bg)] peer-active:border-[var(--color-filter-text)] peer-active:bg-[var(--action-btn-bg)] peer-active:shadow-[0_0_0_2px_var(--color-filter-shadow)] peer-active:scale-95 mb-2";

  const baseClassName = isNeutralTone
    ? `${neutralBase} ${checked || indeterminate ? neutralCheckedStates : neutralUncheckedStates}`
    : defaultBase;

  return (
    <label className="inline-flex items-center justify-center w-6 h-6 cursor-pointer relative z-10">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-full h-full cursor-pointer peer z-10"
        suppressHydrationWarning
        {...props}
      />
      <span
        className={`${baseClassName} pointer-events-none`}
        style={checkedStyle}
      >
        {checked && !indeterminate && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 10.5L9 14L15 7"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {indeterminate && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 10H15"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </label>
  );
}
