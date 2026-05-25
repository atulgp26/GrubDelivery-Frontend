import type { CheckBoxProps } from "@/types";

const CheckBox = ({
  checked,
  onChange,
  indeterminate = false,
  checkedBgColor,
  ...props
}: CheckBoxProps) => {
  const checkedBgClass = checkedBgColor
    ? ""
    : "bg-[var(--color-brand-primary-btn)] peer-hover:bg-[var(--color-filter-text)] peer-hover:border-[var(--color-filter-text)] peer-active:bg-[var(--color-brand-primary-btn)] peer-active:border-[var(--color-brand-primary-btn)]";

  return (
    <label className="inline-flex items-center justify-center w-6 h-6 cursor-pointer relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-0 h-0 peer"
        {...props}
      />
      <span
        className={`w-5 h-5 flex items-center justify-center rounded-sm border border-[var(--color-brand-primary-btn)] hover:border-[var(--color-filter-text)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] peer-active:scale-95 ${(checked || indeterminate) ? `border border-none ${checkedBgClass} peer-active:shadow-[0px_0px_0px_2px_var(--color-shadow-select)]` : "bg-white hover:bg-[var(--sidebar-active-bg)]"}`}
        style={(checked || indeterminate) && checkedBgColor ? { backgroundColor: checkedBgColor, borderColor: checkedBgColor } : undefined}
      >
        {checked && !indeterminate && (
          <img
            src="/dropdown/Filter item/check.svg"
            alt=""
            width={14}
            height={14}
            className="shrink-0"
            aria-hidden
          />
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
  )
}

export default CheckBox
