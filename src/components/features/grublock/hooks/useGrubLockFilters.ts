import { useMemo } from "react";
import type { GrubLockBox, GrubLockGroup, GrubLockSearchItem } from "@/types/domain/grublock";

interface UseGrubLockFiltersProps {
  groups: GrubLockGroup[];
  searchTerm: string;
  searchResults?: GrubLockSearchItem[];
}

function searchItemToBox(item: GrubLockSearchItem): GrubLockBox {
  const code = item.box_display_id ?? String(item.id);
  return {
    id: String(item.id),
    name: item.name,
    boxId: code,
    boxDisplayId: item.box_display_id,
    status: "unlocked",
  };
}

export function useGrubLockFilters({
  groups,
  searchTerm,
  searchResults = [],
}: UseGrubLockFiltersProps) {
  const isSearchMode = searchTerm.trim().length > 0;

  const searchResultIds = useMemo(
    () => new Set(searchResults.map((result) => String(result.id))),
    [searchResults],
  );

  const filteredGroups = useMemo(() => {
    if (!isSearchMode) {
      return groups;
    }

    const groupedMatches = groups
      .map((group) => ({
        ...group,
        items: (group.items ?? []).filter((box) =>
          searchResultIds.has(String(box.id)),
        ),
      }))
      .filter((group) => (group.items?.length ?? 0) > 0);

    if (groupedMatches.length === 0 && searchResults.length > 0) {
      return [
        {
          name: "Search results",
          items: searchResults.map(searchItemToBox),
        },
      ];
    }

    return groupedMatches;
  }, [groups, isSearchMode, searchResultIds, searchResults]);

  const totalEntries = useMemo(
    () =>
      filteredGroups.reduce(
        (acc, group) => acc + (group.items?.length ?? 0),
        0
      ),
    [filteredGroups]
  );

  return { filteredGroups, totalEntries };
}
