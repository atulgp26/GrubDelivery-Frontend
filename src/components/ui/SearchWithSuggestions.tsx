import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent, RefObject } from "react";
import SearchInput from "./SearchInput";
import type { SearchWithSuggestionsProps } from "@/types";

export default function SearchWithSuggestions<T = Record<string, unknown>>({
  data = [],
  value = "",
  onChange,
  onSelect,
  getLabel = (item) => (item as Record<string, string>).name || "",
  getSubLabel = (item) => (item as Record<string, string>).code || "",
  placeholder = "Search...",
  clearable = false,
  onClear,
  className = "",
  subLabelClassName = "text-xs text-[var(--color-neutral-secondary)]",
  openOnFocus = true,
  minChars = 0,
}: SearchWithSuggestionsProps<T>) {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const ref = useRef<HTMLDivElement | null>(null);

  const suggestions = value
    ? data.filter(
        (item) =>
          getLabel(item).toLowerCase().includes(value.toLowerCase()) ||
          (getSubLabel(item) && getSubLabel(item).toLowerCase().includes(value.toLowerCase()))
      )
    : data;

  useEffect(() => {
    if (!showSuggestions) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlighted >= 0 && suggestions[highlighted]) {
        onSelect(suggestions[highlighted]);
        setShowSuggestions(false);
        setHighlighted(-1);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlighted(-1);
    }
  };

  const highlightText = (text: string | undefined) => {
    if (!value || !text) return text;
    
    const index = text.toLowerCase().indexOf(value.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + value.length);
    const after = text.slice(index + value.length);

    return (
      <>
        {before}
        <span className="text-[var(--color-neutral-secondary)] font-semibold">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div
      className={`relative w-auto transition-shadow rounded-lg border-[var(--color-stroke-neutral)] bg-white hover:border-[var(--info-panel-view-bg)] hover:bg-[var(--color-neutral-secondary-bg)] focus-within:border-[var(--info-panel-view-bg)] focus-within:bg-[var(--color-neutral-secondary-bg)] focus-within:shadow-[0_0_0_var(--Spread-50,_2px)_var(--Special-Effects-Ring---Colour,_rgba(254,87,32,0.40))] ${
        showSuggestions
          ? "border-[var(--info-panel-view-bg)] !bg-white shadow-[0_0_0_var(--Spread-50,_2px)_var(--Special-Effects-Ring---Colour,_rgba(254,87,32,0.40))]"
          : ""
      } ${className}`}
      ref={ref}
    >
      <SearchInput
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange(e);
          const nextVal = e.target?.value ?? "";
          setShowSuggestions(String(nextVal).trim().length >= minChars);
          setHighlighted(-1);
        }}
        onFocus={() => {
          const currentLen = String(value || "").trim().length;
          setShowSuggestions(openOnFocus && currentLen >= minChars);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        clearable={clearable}
        onClear={onClear}
        showSuggestions
      />

      {showSuggestions && String(value || "").trim().length >= minChars && (
        <div 
          className="absolute left-0 right-0 mt-2 bg-white  divide-y divide-[var(--color-stroke-neutral)] rounded-lg z-20 shadow-[4px_4px_8px_0_var(--color-notif-shadow-soft),0px_0px_4px_0_var(--color-notif-shadow-strong)] max-h-60 overflow-auto scrollbar-hide"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {value && suggestions.length === 0 && (
            <div className="px-4 py-2 text-[var(--color-neutral-light)] text-sm">No results found.</div>
          )}

          {suggestions.map((item, idx) => {
            const isActive = highlighted === idx;
            const label = getLabel(item);
            const subLabel = getSubLabel(item);

            return (
              <div
                key={idx}
                className={`px-4 py-2 cursor-pointer hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] ${
                  isActive ? "" : ""
                } `}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(item);
                  setShowSuggestions(false);
                  setHighlighted(-1);
                }}
                onMouseEnter={() => setHighlighted(idx)}
              >
                <div className="font-medium text-sm text-[var(--color-neutral-secondary)]">
                  {highlightText(label)}
                </div>
                {subLabel && (
                  <div className={subLabelClassName}>
                    {highlightText(subLabel)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
