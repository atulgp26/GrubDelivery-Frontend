import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import FilterButton from "@/components/ui/FilterButton";
import type {
  MultiSelectOption,
  NotificationGroupOption,
  NotificationSuggestion,
} from "@/types";

interface NotificationFilterBarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  boxOptions: MultiSelectOption[];
  selectedBoxes: MultiSelectOption["id"][];
  setSelectedBoxes: Dispatch<SetStateAction<MultiSelectOption["id"][]>>;
  restaurantOptions?: NotificationGroupOption[];
  selectedRestaurants?: NotificationGroupOption["id"][];
  setSelectedRestaurants?: Dispatch<SetStateAction<NotificationGroupOption["id"][]>>;
  notificationSuggestions?: NotificationSuggestion[];
  setShowFilterModal: (value: boolean) => void;
  isFilterModalOpen: boolean;
}

export default function NotificationFilterBar({
  search,
  setSearch,
  boxOptions,
  selectedBoxes,
  setSelectedBoxes,
  restaurantOptions = [],
  selectedRestaurants = [],
  setSelectedRestaurants = () => {},
  notificationSuggestions = [],
  setShowFilterModal,
  isFilterModalOpen,
}: NotificationFilterBarProps) {
  const restaurantSelectOptions = useMemo<MultiSelectOption[]>(() => {
    return restaurantOptions.map((restaurant) => ({
      id: restaurant.id,
      label: restaurant.label,
    }));
  }, [restaurantOptions]);

  return (
    <div className="flex flex-wrap items-center !pl-3 justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="flex">
        <div className="relative max-w-xs h-8 w-full">
          <SearchWithSuggestions
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSelect={(item) => setSearch(item.title)}
            data={notificationSuggestions}
            getLabel={(n) => n.title}
            getSubLabel={(n) => n.category}
            placeholder="Search notification"
            clearable={true}
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      {/* Right: Select Type + Filter Button */}
      <div className="flex items-center gap-4">
        {/* Restaurant Dropdown */}
        <div className="w-[200px]">
          <MultiSelectDropdown
            options={restaurantSelectOptions}
            selected={selectedRestaurants}
            setSelected={(ids) =>
              setSelectedRestaurants(ids as NotificationGroupOption["id"][])
            }
            placeholder="Select restaurant"
            placeholderColor="!text-[var(--color-neutral-light)]"
          />
        </div>

        {/* Box Dropdown */}
        <div className="w-[200px]">
          <MultiSelectDropdown
            options={boxOptions}
            selected={selectedBoxes}
            setSelected={(ids) => setSelectedBoxes(ids)}
            placeholder="Select box"
            placeholderColor="!text-[var(--color-neutral-light)]"
          />
        </div>

        <div>
          <FilterButton
            open={isFilterModalOpen}
            handleFilterClick={() => setShowFilterModal(true)}
          />
        </div>
      </div>
    </div>
  );
}

