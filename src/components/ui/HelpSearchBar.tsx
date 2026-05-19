import { useRef, useState } from "react";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import type { HelpSearchBarProps } from "@/types";
import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils/cn";

export default function HelpSearchBar({
  value,
  onChange,
  placeholder = "Search FAQs, guidelines, etc.",
  className = "",
  clearable,
  onClear,
  onFocus,
  onBlur,
  ...props
}: HelpSearchBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "relative flex items-center bg-white transition-all duration-150 rounded-none",
        isFocused
          ? "border border-[var(--info-panel-view-bg)] shadow-[0_0_0_var(--Spread-100,_4px)_var(--Special-Effects-Ring---Colour,_rgba(254,87,32,0.40))]"
          : "border-b border-b-[var(--color-stroke-neutral)]",
        className,
      )}
    >
      <Image src="/Support/Search/search.svg" alt="" width={24} height={24} className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 shrink-0 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event)
        }
        placeholder={placeholder}
        className="form-input h-12 placeholder:text-[var(--color-neutral-light)] text-[var(--color-neutral-secondary)] text-base font-normal pl-12 pr-10 bg-transparent border-0 focus:ring-0 focus:outline-none rounded-none hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-white"
        style={{ width: '-webkit-fill-available' }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...props}
      />
      {clearable && value && value.length > 0 && (
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 rounded-none hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear?.();
            inputRef.current?.focus();
          }}
          tabIndex={-1}
        >
          <MdClose className="w-5 h-5 text-[var(--info-panel-view-bg)]" />
        </button>
      )}
    </div>
  );
}
