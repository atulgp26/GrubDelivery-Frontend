"use client";

import { useState } from "react";
import HelpSearchBar from "@/components/ui/HelpSearchBar";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import type { HelpSearchSuggestion } from "@/types";

interface HelpSearchInputProps {
  data?: HelpSearchSuggestion[];
  isSearching?: boolean;
  onSelect?: (item: HelpSearchSuggestion) => void;
  onSearchChange?: (term: string) => void;
}

export default function HelpSearchInput({ data = [], isSearching = false, onSelect, onSearchChange }: HelpSearchInputProps) {
  const [value, setValue] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const term = event.target.value;
    setValue(term);
    onSearchChange?.(term);
  }

  function handleClear() {
    setValue("");
    onSearchChange?.("");
  }

  return (
    <div className="relative w-full">
      <HelpSearchBar
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search support"
        className="w-full"
        clearable
        onClear={handleClear}
      />
      {focused && value.trim().length > 0 && !isSearching && (
        <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-lg z-20">
          {data.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">
              No results found
            </div>
          ) : data.map((item, index) => (
            <button
              key={item.faqId ?? item.href ?? `${item.title}-${item.subtitle}-${index}`}
              type="button"
              className="w-full px-4 py-3 flex flex-col items-start justify-center gap-0.5 text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-stroke-neutral)] last:border-b-0 transition-colors"
              onMouseDown={() => {
                onSelect?.(item);
                setValue("");
                onSearchChange?.("");
              }}
            >
              <div className="w-full text-base font-medium text-[#37493F]">
                {highlightMatch(item.title, value)}
              </div>
              {item.subtitle && (
                <div className="w-full text-sm text-[#7E8982]">
                  {item.subtitle}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
