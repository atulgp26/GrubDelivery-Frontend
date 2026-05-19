import { SearchInputWithDropdown, type SearchResult } from "@/components/ui/SearchInputWithDropdown";
import CheckBox from "@/components/ui/CheckBox";
import FilterButton from "@/components/ui/FilterButton";

interface GrubLockListToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  totalEntries: number;
  isGrouped: boolean;
  onGroupedChange: (checked: boolean) => void;
  showUnlockedBoxes?: boolean;
  onShowUnlockedBoxesChange?: (checked: boolean) => void;
  onFilterClick?: () => void;
  isFilterModalOpen?: boolean;
  searchResults?: SearchResult[];
  onSearchResultClick?: (result: SearchResult) => void;
}

export default function GrubLockListToolbar({
  searchTerm,
  onSearchChange,
  onSearchClear,
  totalEntries,
  isGrouped,
  onGroupedChange,
  showUnlockedBoxes,
  onShowUnlockedBoxesChange,
  onFilterClick,
  isFilterModalOpen = false,
  searchResults = [],
  onSearchResultClick,
}: GrubLockListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <SearchInputWithDropdown
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={onSearchClear}
        placeholder="Search box"
        className="w-[240px]"
        searchResults={searchResults}
        onResultClick={onSearchResultClick}
      />
      <div className="flex items-center gap-4">
        <span className="font-normal text-[14px] leading-[22px] text-[var(--content-neutral-tertiary,#6b7971)]">
          {totalEntries} entries
        </span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <CheckBox
            checked={isGrouped}
            onChange={(e) => onGroupedChange(e.target.checked)}
          />
          <span className="text-lg text-[var(--color-neutral-secondary)]">
            Grouped
          </span>
        </label>
        {isGrouped && showUnlockedBoxes !== undefined && onShowUnlockedBoxesChange && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <CheckBox
              checked={showUnlockedBoxes}
              onChange={(e) => onShowUnlockedBoxesChange(e.target.checked)}
            />
            <span className="text-lg text-[var(--color-neutral-secondary)]">
              Show unlocked boxes
            </span>
          </label>
        )}
        <FilterButton
          open={isFilterModalOpen}
          handleFilterClick={onFilterClick || (() => undefined)}
        />
      </div>
    </div>
  );
}

