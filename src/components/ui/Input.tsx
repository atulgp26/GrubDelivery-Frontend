import { forwardRef, type FocusEvent, type ChangeEvent } from "react";

import type { InputProps } from "@/types";

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      placeholder,
      disabledClass = "",
      margin,
      width = "w-full",
      border = "",
      padding = "",
      className = "",
      value,
      onChange,
      loginprops = false,
      isFocused = false,
      onFocus,
      onBlur,
      suppressHydrationWarning = true,
      ...props
    },
    ref,
  ) => {
    const isTextLike = !["checkbox", "radio"].includes(type);

    const baseClasses = isTextLike
      ? `w-full px-3 py-2 ${padding} ${disabledClass} border-none outline-none focus:ring-0`
      : "";

    const loginStyles =
      loginprops && isTextLike
        ? "pl-10 pr-10 !text-lg text-[var(--gp-color-text-neutral-secondary)]"
        : "";

    return (
      <div
        className={`relative rounded-lg ${width} ${margin ?? ""} ${border} flex items-center transition-colors duration-150 input-wrapper ${
          isFocused ? "input-wrapper--focused" : ""
        }`}
      >
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`${baseClasses} ${loginStyles} ${className} text-[var(--gp-color-text-neutral-secondary)] placeholder:text-[var(--gp-color-text-neutral-light)]`}
          value={value}
          onChange={onChange as (event: ChangeEvent<HTMLInputElement>) => void}
          onFocus={onFocus as (event: FocusEvent<HTMLInputElement>) => void}
          onBlur={onBlur as (event: FocusEvent<HTMLInputElement>) => void}
          suppressHydrationWarning={suppressHydrationWarning}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
