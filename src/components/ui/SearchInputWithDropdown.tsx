"use client";

import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { highlightMatch } from "@/lib/utils/highlightMatch";

export interface SearchResult {
  id: string;
  name: string;
  identifier?: string;
}

interface SearchInputWithDropdownProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  searchResults?: SearchResult[];
  onResultClick?: (result: SearchResult) => void;
  maxResults?: number;
}

export function SearchInputWithDropdown({
  value,
  onChange,
  onClear,
  placeholder = "Search",
  className = "",
  searchResults = [],
  onResultClick,
  maxResults = 10,
}: SearchInputWithDropdownProps) {
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const displayResults = searchResults.slice(0, maxResults);
  const shouldShowDropdown = focused && !!value && value.length > 0;

  useEffect(() => {
    setShowDropdown(shouldShowDropdown);
  }, [shouldShowDropdown]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onClear();
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-white rounded-lg flex items-center transition-colors duration-150">
        <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-4 text-[var(--color-neutral-light)] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event)}
          placeholder={placeholder}
          className="form-input h-8 w-full placeholder:text-[var(--color-neutral-light)] text-[var(--color-neutral-secondary)] text-sm pl-10 pr-10 bg-transparent focus:ring-0 focus:outline-none focus:shadow-[0_0_0_2px_var(--color-shadow-select)] border rounded-lg border-[var(--color-box-border)] hover:bg-[var(--color-neutral-secondary-bg)] focus:border-[var(--info-panel-view-bg)] border-solid"
          onFocus={() => setFocused(true)}
          onBlur={(e: FocusEvent<HTMLInputElement>) => {
            // Delay blur to allow click on dropdown items
            setTimeout(() => setFocused(false), 200);
          }}
        />
        {value && value.length > 0 && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex h-5 w-5 items-center justify-center cursor-pointer rounded-sm transition-colors duration-150 hover:bg-[#FFECE6]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            tabIndex={-1}
          >
            <Image src="/Group/Section filter/Search/x.svg" alt="Clear" width={24} height={24} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[var(--color-box-border)] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] max-h-[300px] overflow-y-auto z-50"
        >
          {displayResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">
              No results found
            </div>
          ) : (
            displayResults.map((result) => (
              <button
                key={result.id}
                type="button"
                className="w-full px-4 py-3 flex flex-col items-start justify-center gap-0.5 text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-box-border)] last:border-b-0 transition-colors"
                onMouseDown={() => handleResultClick(result)}
              >
                <span className="w-full text-[16px] leading-[24px] font-medium text-[#37493F]">
                  {highlightMatch(result.name, value)}
                </span>
                {result.identifier && (
                  <span className="w-full text-[14px] leading-[20px] text-[#7E8982]">
                    {highlightMatch(result.identifier, value)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
