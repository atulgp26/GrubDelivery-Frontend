import { useState, useRef } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import type { SearchInputProps } from "@/types";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
  clearable = true,
  onfocus,
  help = false,
  icon,
  height = "",
  padding = "",
  searchIconHidden = false,
  searchText = "",
  onClear,
  borderType = "full",
  showSuggestions,
  ...props
}: SearchInputProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const showActive = focused || (value && value.length > 0);

  return (
    <div
      className={`relative bg-white rounded-lg flex items-center transition-colors duration-150 input-wrapper ${className}`}
    >
      {
        icon?icon:
        <IoSearchOutline className={`${searchIconHidden?"hidden":""} absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-4 text-[var(--color-neutral-light)] pointer-events-none`} />
      }
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event)}
        placeholder={placeholder}
        className={`form-input ${height} h-8 placeholder:text-[var(--color-neutral-light)] text-[var(--color-neutral-secondary)] ${searchText} text-sm ${padding} pl-10 pr-10 bg-transparent ${
          borderType === "bottom"
            ? "border-0 border-b-2 border-b-[var(--color-box-border)] hover:border-b-[var(--color-brand-default)] focus:border-b-[var(--color-brand-default)] border-solid":
                       help?"border-b border-[var(--color-box-border)] focus:ring-0 focus:outline-none focus:shadow-[0_0_0_2px_var(--color-shadow-select)] focus:border-[var(--color-brand-default)]" : "focus:ring-0 focus:outline-none focus:shadow-[0_0_0_2px_var(--color-shadow-select)] border rounded-lg border-[var(--color-box-border)] hover:bg-[var(--color-neutral-secondary-bg)] focus:border-[var(--info-panel-view-bg)] border-solid"
        } `}
        style={{ width: '-webkit-fill-available' }}
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          setFocused(true);
          onfocus?.();
          props.onFocus?.(event);
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        {...props}
      />
      {clearable && value && value.length > 0 && (
        <button
          type="button"
          className="absolute right-3 mr-1 top-1/2 transform -translate-y-1/2 flex h-5 w-5 items-center justify-center cursor-pointer rounded-sm transition-colors duration-150 hover:bg-[#FFECE6]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear?.();
            // Optionally focus back to input
            inputRef.current?.focus();
          }}
          tabIndex={-1}
        >
          <Image src="/Group/Section filter/Search/x.svg" alt="Clear" width={24} height={24} />
        </button>
      )}
    </div>
  );
}
