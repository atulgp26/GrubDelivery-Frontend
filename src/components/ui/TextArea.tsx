import { forwardRef, useState, type FocusEvent, type ChangeEvent } from "react";

import type { TextAreaProps } from "@/types";

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      placeholder,
      value,
      onChange,
      className = "",
      onFocus,
      onBlur,
      suppressHydrationWarning = true,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div
        className={`relative rounded-lg w-full flex items-start transition-colors duration-150 input-wrapper ${
          isFocused ? "input-wrapper--focused" : ""
        }`}
      >
        <textarea
          ref={ref}
          placeholder={placeholder}
          className={`w-full px-3 py-3 min-h-[60px] border-none outline-none focus:ring-0 resize-none ${className} text-base text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)]`}
          value={value}
          onChange={onChange as (event: ChangeEvent<HTMLTextAreaElement>) => void}
          onFocus={handleFocus}
          onBlur={handleBlur}
          suppressHydrationWarning={suppressHydrationWarning}
          {...props}
        />
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
