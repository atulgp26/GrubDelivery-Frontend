import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContextualErrorMessage } from "@/lib/errors";
import { getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import grublockService from "@/services/grublock";
import type { GrubLockBox, GrubLockGroup, GrubLockListData, GrubLockListParams } from "@/types/domain/grublock";
import type { ApiGrubPac } from "@/types/domain/grubpacs";
import { apiGrubLockToBox, splitByLockStatus } from "../api/mappers";

export interface GrubLockQueryResult {
  groups: GrubLockGroup[];
  totalEntries?: number;
}

interface UseGrubLockQueryOptions {
  params?: GrubLockListParams;
  isGrouped?: boolean;
  showUnlockedBoxes?: boolean;
}

function mapRestaurantGroups(flat: GrubLockListData): GrubLockGroup[] {
  const rawGroups = flat.groups;
  if (!rawGroups) {
    return [];
  }

  return Object.entries(rawGroups)
    .map(([groupKey, value]) => {
      const groupValue = value as { array: ApiGrubPac[]; pagination?: any };
      if (!groupValue || typeof groupValue !== "object" || !("array" in groupValue)) return null;

      const items = (groupValue.array ?? []).map(apiGrubLockToBox);
      if (items.length === 0 && !groupValue.pagination) return null;
      
      const nameKey = `${groupKey}_name`;
      const nameValue = rawGroups[nameKey];
      const fallbackName =
        groupKey === "unassigned"
          ? "Unassigned"
          : items[0]?.restaurantName ?? groupKey;

      return {
        name: (groupValue as any).name || (typeof nameValue === "string" && nameValue.trim().length > 0 ? nameValue : fallbackName),
        items,
        pagination: groupValue.pagination ? {
          currentPage: groupValue.pagination.page,
          pageSize: groupValue.pagination.limit,
          totalItems: groupValue.pagination.total_count,
          totalPages: groupValue.pagination.last_page,
        } : undefined,
        groupTableKey: groupKey,
        emptyMessage: "All active GrubLock boxes are assigned :)",
      } as GrubLockGroup;
    })
    .filter((group): group is GrubLockGroup => group !== null);
}

async function fetchGrubLockGroups({
  params,
  isGrouped = false,
  showUnlockedBoxes = true,
}: UseGrubLockQueryOptions): Promise<GrubLockQueryResult> {
  const groupedStatus = showUnlockedBoxes ? undefined : "locked";
  const requestParams: GrubLockListParams = {
    status: "active",
    limit: 50,
    page: 1,
    ...params,
    group_by: isGrouped ? "restaurants" : "lock_status",
    ...(isGrouped && groupedStatus ? { grublock_status: groupedStatus } : {}),
  };

  const res = await grublockService.getList(requestParams);
  if (!res.success || !res.data) {
    throw new Error(
      getContextualErrorMessage(
        "grublock.load",
        res,
        "Unable to load GrubLock boxes right now. Please refresh and try again.",
      ),
    );
  }

  const flat = res.data as GrubLockListData;

  if (isGrouped) {
    return {
      groups: mapRestaurantGroups(flat),
      totalEntries: (flat as any).total_count ?? flat.count,
    };
  }

  const lockedBoxes = getWrappedGroupArray<ApiGrubPac>(flat.groups?.locked).map(apiGrubLockToBox);
  const unlockedBoxes = getWrappedGroupArray<ApiGrubPac>(flat.groups?.unlocked).map(apiGrubLockToBox);

  const hasGroupedPayload = lockedBoxes.length > 0 || unlockedBoxes.length > 0;
  const boxes = hasGroupedPayload
    ? [...lockedBoxes, ...unlockedBoxes]
    : (flat.boxes ?? []).map(apiGrubLockToBox);

  const groups = hasGroupedPayload
      ? [
          {
            name: "Box locked",
            items: lockedBoxes,
            pagination: flat.groups?.locked?.pagination ? {
              currentPage: (flat.groups.locked.pagination as any).page,
              pageSize: (flat.groups.locked.pagination as any).limit,
              totalItems: (flat.groups.locked.pagination as any).total_count,
              totalPages: (flat.groups.locked.pagination as any).last_page,
            } : undefined,
            emptyMessage: "Set GrubLock for your boxes to see the list here!",
          },
          {
            name: "Box unlocked",
            items: unlockedBoxes,
            pagination: flat.groups?.unlocked?.pagination ? {
              currentPage: (flat.groups.unlocked.pagination as any).page,
              pageSize: (flat.groups.unlocked.pagination as any).limit,
              totalItems: (flat.groups.unlocked.pagination as any).total_count,
              totalPages: (flat.groups.unlocked.pagination as any).last_page,
            } : undefined,
            emptyMessage: "All boxes are locked! :)",
          },
        ]
    : splitByLockStatus(boxes);

  return {
    groups: groups.map(g => ({ ...g, groupTableKey: (g.name === "Box locked" ? "locked" : "unlocked") })),
    totalEntries: (flat as any).total_count ?? flat.count,
  };
}

export function useGrubLockQuery({
  params,
  isGrouped = false,
  showUnlockedBoxes = true,
}: UseGrubLockQueryOptions) {
  const queryClient = useQueryClient();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const queryKey = ["grublock", "groups", params, isGrouped, showUnlockedBoxes];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchGrubLockGroups({ params, isGrouped, showUnlockedBoxes }),
    staleTime: isGrouped ? 0 : 5 * 60 * 1000,
  });

  const refetchGroup = async (group: GrubLockGroup, page: number) => {
    setIsPageLoading(true);
    try {
      const groupedStatus = showUnlockedBoxes ? undefined : "locked";
      const selectedTable = isGrouped 
        ? (group.name === "Unassigned" ? "unassigned" : "restaurants")
        : (group.name === "Box locked" ? "locked" : "unlocked");

      const requestParams: GrubLockListParams = {
        status: "active",
        limit: 50,
        page,
        ...params,
        group_by: isGrouped ? "restaurants" : "lock_status",
        group_by_selected_table: (group as any).groupTableKey ?? selectedTable,
        ...(isGrouped && groupedStatus ? { grublock_status: groupedStatus } : {}),
      };

      const res = await grublockService.getList(requestParams);
      if (res.success && res.data) {
        const flat = res.data as GrubLockListData;
        let newItems: GrubLockBox[] = [];
        let pagination: any;

        if (isGrouped) {
          const apiGroups = flat.groups || {};
          const groupData = Object.values(apiGroups).find(g => 
            typeof g === "object" && g !== null && "array" in g && 
            (g.array.length > 0 ? apiGrubLockToBox(g.array[0]).restaurantName === String(group.name) : false)
          ) as { array: ApiGrubPac[]; pagination?: any } | undefined;

          if (groupData) {
            newItems = groupData.array.map(apiGrubLockToBox);
            pagination = groupData.pagination;
          } else if (apiGroups.unassigned && group.name === "Unassigned") {
            const unassigned = apiGroups.unassigned as { array: ApiGrubPac[]; pagination?: any };
            newItems = unassigned.array.map(apiGrubLockToBox);
            pagination = unassigned.pagination;
          }
        } else {
          const apiGroups = flat.groups || {};
          const target = selectedTable === "locked" ? apiGroups.locked : apiGroups.unlocked;
          if (target && typeof target === "object" && "array" in target) {
            newItems = target.array.map(apiGrubLockToBox);
            pagination = target.pagination;
          }
        }

        if (newItems.length > 0 || pagination) {
          const mappedPagination = pagination ? {
            currentPage: pagination.page,
            pageSize: pagination.limit,
            totalItems: pagination.total_count,
            totalPages: pagination.last_page,
          } : undefined;

          queryClient.setQueryData(queryKey, (old: GrubLockQueryResult | undefined) => {
            if (!old) return old;
            return {
              ...old,
              groups: old.groups.map(g => g.name === group.name ? { ...g, items: newItems, pagination: mappedPagination } : g)
            };
          });
        }
      }
    } catch (err) {
      console.error("Failed to refetch grublock group:", err);
    } finally {
      setIsPageLoading(false);
    }
  };

  return { ...query, totalEntries: query.data?.totalEntries, isPageLoading, refetchGroup };
}

