import { useMemo } from "react";
import type { EmployeeGroup } from "@/types";
import type { GroupCollapseTableGroup } from "@/types/ui";
import type { SuspendedEmployee } from "../types";
import {
  filterEmployeesBySearch,
  filterEmployeesByRole,
  filterAvailableDrivers,
  groupEmployeesByRestaurant,
} from "../utils/filterUtils";

// ── Active employees ──────────────────────────────────────────────────────────

interface UseEmployeeFiltersProps {
  groups: EmployeeGroup[];
  searchTerm?: string;
  isGrouped?: boolean;
  selectedRoles?: Array<string | number>;
  showAvailableDriversOnly?: boolean;
}

export function useEmployeeTableFilters({
  groups,
  searchTerm = "",
  selectedRoles = [],
  showAvailableDriversOnly = false,
}: UseEmployeeFiltersProps): { filteredGroups: EmployeeGroup[]; totalEntries: number } {
  const filteredGroups = useMemo<EmployeeGroup[]>(() => {
    return groups.map((group) => ({
      ...group,
      items: (() => {
        let items = group.items ?? [];
        items = filterEmployeesBySearch(items, searchTerm);
        if (selectedRoles.length > 0) {
          items = filterEmployeesByRole(items, selectedRoles);
        }
        if (showAvailableDriversOnly) {
          items = filterAvailableDrivers(items);
        }
        return items;
      })(),
      emptyMessage: "No employees match your search.",
    }));
  }, [groups, searchTerm, selectedRoles, showAvailableDriversOnly]);

  const totalEntries = useMemo(
    () => filteredGroups.reduce((acc, group) => acc + (group.items?.length ?? 0), 0),
    [filteredGroups]
  );

  return { filteredGroups, totalEntries };
}

// ── Suspended employees ───────────────────────────────────────────────────────

interface UseSuspendedEmployeeFiltersProps {
  employees: SuspendedEmployee[];
  groupedEmployees?: GroupCollapseTableGroup<SuspendedEmployee>[];
  searchTerm: string;
  isGrouped: boolean;
  selectedRoles: Array<string | number>;
  showAvailableDriversOnly: boolean;
  totalItems?: number;
}

export function useSuspendedEmployeeTableFilters({
  employees,
  groupedEmployees,
  searchTerm,
  isGrouped,
  selectedRoles,
  showAvailableDriversOnly,
  totalItems,
}: UseSuspendedEmployeeFiltersProps): {
  filteredGroups: GroupCollapseTableGroup<SuspendedEmployee>[];
  totalEntries: number;
} {
  const filteredGroups = useMemo<GroupCollapseTableGroup<SuspendedEmployee>[]>(() => {
    if (isGrouped && Array.isArray(groupedEmployees) && groupedEmployees.length > 0) {
      return groupedEmployees.map((group) => {
        let filteredItems = group.items ?? [];

        filteredItems = filterEmployeesBySearch(filteredItems, searchTerm);

        if (selectedRoles.length > 0) {
          filteredItems = filterEmployeesByRole(filteredItems, selectedRoles);
        }

        if (showAvailableDriversOnly) {
          filteredItems = filterAvailableDrivers(filteredItems);
        }

        return {
          ...group,
          items: filteredItems,
          emptyMessage: searchTerm
            ? "No employees match your search."
            : "No suspended employees found.",
        };
      });
    }

    let filteredEmployees = filterEmployeesBySearch(employees, searchTerm);

    if (selectedRoles.length > 0) {
      filteredEmployees = filterEmployeesByRole(filteredEmployees, selectedRoles);
    }

    if (!isGrouped) {
      return [
        {
          name: "All Suspended Employees",
          items: filteredEmployees as SuspendedEmployee[],
          pagination: totalItems ? { totalItems } as any : undefined,
          emptyMessage: searchTerm
            ? "No employees match your search."
            : "No suspended employees found.",
        },
      ];
    }

    if (showAvailableDriversOnly) {
      filteredEmployees = filterAvailableDrivers(filteredEmployees);
    }

    return groupEmployeesByRestaurant(filteredEmployees) as GroupCollapseTableGroup<SuspendedEmployee>[];
  }, [employees, groupedEmployees, searchTerm, isGrouped, selectedRoles, showAvailableDriversOnly]);

  const totalEntries = useMemo(
    () => filteredGroups.reduce(
      (acc, group) => acc + (group.pagination?.totalItems ?? group.items?.length ?? 0),
      0,
    ),
    [filteredGroups]
  );

  return { filteredGroups, totalEntries };
}
