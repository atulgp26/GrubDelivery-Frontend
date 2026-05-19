import type { ChangeEvent } from "react";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (event?: ChangeEvent<HTMLInputElement>) => void;
  colorVar: string;
  hoverState?: string;
  checkedHoverState?: string;
}

export default function CustomCheckbox({
  checked,
  onChange,
  colorVar,
  hoverState = "",
  checkedHoverState = "",
}: CustomCheckboxProps) {
  const checkedStyle = checked
    ? {
        background: `var(${colorVar})`,
        borderColor: `var(${colorVar})`,
      }
    : {
        borderColor: `var(${colorVar})`,
      };

  return (
    <label className="inline-flex items-center justify-center w-6 h-6 cursor-pointer relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-0 h-0 peer"
      />
      <span
        className={`w-5 h-5 flex items-center justify-center rounded-sm border transition-all duration-150 ${hoverState} peer-active:scale-95 ${
          checked ? `${checkedHoverState}` : "bg-white"
        }`}
        style={checkedStyle}
      >
        {checked && (
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
      </span>
    </label>
  );
}
