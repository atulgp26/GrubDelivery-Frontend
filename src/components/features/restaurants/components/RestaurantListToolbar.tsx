import { useState } from "react";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import type { RestaurantData } from "@/types/domain/restaurants";

interface RestaurantListToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  totalEntries: number;
  onFilterClick?: () => void;
  isFilterModalOpen?: boolean;
  isLoading?: boolean;
  searchSuggestions?: RestaurantData[];
  isSearching?: boolean;
  searchError?: string | null;
}

export default function RestaurantListToolbar({
  searchTerm,
  onSearchChange,
  onSearchClear,
  totalEntries,
  onFilterClick,
  isFilterModalOpen = false,
  isLoading = false,
  searchSuggestions = [],
  isSearching = false,
  searchError = null,
}: RestaurantListToolbarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const showDropdown = isFocused && searchTerm.trim().length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 relative z-10 w-full">
      <div className="relative w-[280px]">
        <SearchInput
          value={searchTerm}
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
          onClear={onSearchClear}
          placeholder="Search restaurant"
          className="w-full"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        />
        {showDropdown && !isSearching && (
          <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-lg z-50">
            {searchError ? (
              <div className="px-4 py-3 text-sm text-red-500">
                Search failed. Please try again.....
              </div>
            ) : searchSuggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">
                No restaurants found
              </div>
            ) : (
              searchSuggestions.slice(0, 6).map((res) => (
                <button
                  key={res.id}
                  type="button"
                  className="w-full px-4 py-2.5 flex items-center text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-stroke-neutral)] last:border-b-0 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSearchChange(res.name);
                    setIsFocused(false);
                  }}
                >
                  <div className="w-full text-base font-medium text-[#37493F]">
                    {highlightMatch(res.name, searchTerm)}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="font-normal text-[14px] leading-[22px] text-[#6B7971]">
          {isLoading ? "Searching..." : `${totalEntries} entries`}
        </span>
        <FilterButton 
          open={isFilterModalOpen} 
          handleFilterClick={onFilterClick || (() => undefined)} 
        />
      </div>
    </div>
  );
}

