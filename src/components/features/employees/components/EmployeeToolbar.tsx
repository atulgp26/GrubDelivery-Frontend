import { useState } from "react";
import SearchInput from "@/components/ui/SearchInput";
import CheckBox from "@/components/ui/CheckBox";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import type { ApiEmployeeSearchResult } from "@/types/domain/employees";

interface EmployeeToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  totalEntries: number;
  isGrouped: boolean;
  onGroupedChange: (checked: boolean) => void;
  selectedRoles: Array<string | number>;
  onRolesChange: (roles: Array<string | number>) => void;
  showAvailableDriversOnly: boolean;
  onAvailableDriversOnlyChange: (checked: boolean) => void;
  roleOptions: Array<{ id: string | number; label: string }>;
  searchSuggestions?: ApiEmployeeSearchResult[];
  isSearching?: boolean;
  searchError?: string | null;
  /** Show the "Available drivers only" filter checkbox (active list only). */
  showAvailableDriversFilter?: boolean;
  /** Force role dropdown visibility irrespective of grouped mode. */
  showRoleFilter?: boolean;
  onSuggestionSelect?: (emp: ApiEmployeeSearchResult) => void;
}

export default function EmployeeToolbar({
  searchTerm,
  onSearchChange,
  onSearchClear,
  totalEntries,
  isGrouped,
  onGroupedChange,
  selectedRoles,
  onRolesChange,
  showAvailableDriversOnly,
  onAvailableDriversOnlyChange,
  roleOptions,
  searchSuggestions = [],
  isSearching = false,
  searchError = null,
  showAvailableDriversFilter = false,
  showRoleFilter,
  onSuggestionSelect,
}: EmployeeToolbarProps) {
  const [isFocused, setIsFocused] = useState(false);

const showDropdown = isFocused && searchTerm.trim().length >= 3;
  const shouldShowRoleFilter = showRoleFilter ?? isGrouped;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="relative w-[240px]">
        <SearchInput
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={() => {
            onSearchClear();
          }}
          placeholder="Search employee"
          className="w-full"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        />
        {showDropdown && !isSearching && (
          <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-lg z-50">
            {searchError ? (
              <div className="px-4 py-3 text-sm text-red-500">
                Search failed. Please try again.
              </div>
            ) : searchSuggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">
                No employees found
              </div>
            ) : (
              searchSuggestions.slice(0, 6).map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  className="w-full px-4 py-3 flex flex-col items-start justify-center gap-0.5 text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-stroke-neutral)] last:border-b-0 transition-colors"
                  onMouseDown={() => {
                    if (onSuggestionSelect) {
                      onSuggestionSelect(emp);
                    } else {
                      onSearchChange(emp.name);
                    }
                    setIsFocused(false);
                  }}
                >
                  <div className="w-full text-base font-medium text-[#37493F]">
                    {highlightMatch(emp.name, searchTerm)}
                  </div>
                  <div className="w-full text-sm text-[#7E8982]">
                    {emp.employee_id ? `(${emp.employee_id})` : ""}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="font-normal text-[14px] leading-[22px] text-[var(--content-neutral-tertiary,#6b7971)]">
          {totalEntries} entries
        </span>
        {shouldShowRoleFilter && (
          <div className="w-[200px]">
            <MultiSelectDropdown
              options={roleOptions}
              selected={selectedRoles}
              setSelected={onRolesChange}
              placeholder="Manager and Driver"
              placeholderColor="!text-[var(--color-neutral-secondary)]"
              hideSearch={true}
            />
          </div>
        )}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <CheckBox
            checked={isGrouped}
            onChange={(e) => onGroupedChange(e.target.checked)}
          />
          <span className="text-[18px] leading-[28px] font-normal text-[var(--content-neutral-secondary,#37493f)]">
            Grouped
          </span>
        </label>
        {showAvailableDriversFilter && isGrouped && (
          <label className="flex items-center gap-3 cursor-pointer select-none whitespace-nowrap">
            <CustomCheckbox
              checked={showAvailableDriversOnly}
              onChange={(e) => onAvailableDriversOnlyChange(e?.target.checked ?? false)}
              colorVar="--color-brand-default"
              hoverState="peer-hover:bg-[var(--sidebar-active-bg)] peer-hover:border-[var(--color-brand-default)]"
              checkedHoverState="peer-hover:!bg-[var(--color-brand-default)] peer-hover:!border-[var(--color-brand-default)]"
            />
            <span className="text-[18px] leading-[28px] font-normal text-[var(--content-neutral-secondary,#37493f)]">
              Available drivers only
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
