import { useMemo } from "react";
import type { GrubLockGroup } from "@/types/domain/grublock";

interface UseGrubLockFiltersProps {
  groups: GrubLockGroup[];
  searchTerm: string;
}

export function useGrubLockFilters({
  groups,
  searchTerm,
}: UseGrubLockFiltersProps) {
  const filteredGroups = useMemo(() => {
    if (!searchTerm) {
      return groups;
    }

    const searchLower = searchTerm.toLowerCase();
    return groups.map((group) => ({
      ...group,
      items: group.items?.filter(
        (box) =>
          box.name?.toLowerCase().includes(searchLower) ||
          box.boxId.toLowerCase().includes(searchLower) ||
          box.restaurantName?.toLowerCase().includes(searchLower)
      ),
    }));
  }, [groups, searchTerm]);

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

