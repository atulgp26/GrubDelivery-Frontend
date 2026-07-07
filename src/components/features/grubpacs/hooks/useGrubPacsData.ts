import { useCallback, useEffect, useMemo, useState } from "react";
import { getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import grubpacService from "@/services/grubpacs";
import { apiGrubPacToItem, type ApiGrubPac, type GrubPacItem, type GrubPacListData, type GrubPacListParams } from "@/types/domain/grubpacs";
import { showError } from "@/components/ui/toast";

interface UseGrubPacsDataReturn {
  grubpacsData: GrubPacItem[];
  groups: Array<{ name: string; items: GrubPacItem[]; pagination?: any; groupTableKey?: string }>;
  isLoading: boolean;
  isPageLoading: boolean;
  refetch: () => Promise<void>;
  refetchGroup: (group: { name: string; groupTableKey?: string }, page: number) => Promise<void>;
  setGrubPacsData: React.Dispatch<React.SetStateAction<GrubPacItem[]>>;
  totalEntries: number;
}

export const useGrubPacsData = (apiParams?: GrubPacListParams): UseGrubPacsDataReturn => {
  const [data, setData] = useState<GrubPacItem[]>([]);
  const [serverGroups, setServerGroups] = useState<Array<{ name: string; items: GrubPacItem[]; pagination?: any; groupTableKey?: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);

  // Stable key so useCallback only re-creates when params actually change
  const paramsKey = JSON.stringify(apiParams);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const isGrouped = !!apiParams?.group_by;
      // Match other list pages: grouped mode uses backend paging (limit 10); ungrouped keeps wider first page.
      const res = await grubpacService.getList({
        status: "active",
        limit: 50,
        page: 1,
        ...apiParams,
      });

      if (res.success && res.data) {
        const flat: GrubPacListData = res.data;
        const responseGroups = (flat as { groups?: Record<string, unknown> }).groups;
        if (responseGroups && typeof responseGroups === "object") {
          const mappedGroups = Object.entries(responseGroups)
            .filter(([key]) => !key.endsWith("_name")) // Filter out metadata keys
            .map(([groupKey, groupValue]) => {
              const value = groupValue as any;
              const items = getWrappedGroupArray<ApiGrubPac>(value).map((item) => apiGrubPacToItem(item));
              const nameKey = `${groupKey}_name`;
              const nameValue = (responseGroups as any)[nameKey];
              const fallbackName =
                groupKey === "unassigned"
                  ? "Unassigned"
                  : groupKey === "on"
                  ? "Powered on"
                  : groupKey === "off"
                  ? "Powered off"
                  : groupKey === "locked"
                  ? "Box locked"
                  : groupKey === "unlocked"
                  ? "Box unlocked"
                  : items[0]?.restaurantName ?? groupKey;

              return {
                name: (value.name && typeof value.name === "string") ? value.name : (typeof nameValue === "string" && nameValue.trim().length > 0 ? nameValue : fallbackName),
                groupTableKey: groupKey,
                items,
                pagination: value.pagination ? {
                  currentPage: value.pagination.page,
                  pageSize: value.pagination.limit,
                  totalItems: value.pagination.total_count,
                  totalPages: value.pagination.last_page,
                } : undefined,
              };
            })
            .filter(({ items, pagination }) => items.length > 0 || (pagination && pagination.totalItems > 0));

          if (mappedGroups.length > 0) {
            setServerGroups(mappedGroups);
            setData(mappedGroups.flatMap((group) => group.items));
            setTotalEntries((flat as any).total_count ?? (flat as any).count ?? mappedGroups.reduce((acc, g) => acc + g.items.length, 0));
          } else {
            setServerGroups(null);
            const items = ((flat as { boxes?: ApiGrubPac[] }).boxes ?? []).map((item) => apiGrubPacToItem(item));
            setData(items);
            setTotalEntries((flat as any).total_count ?? items.length);
          }
        } else {
          setServerGroups(null);
          const items = ((flat as { boxes?: ApiGrubPac[] }).boxes ?? []).map((item) => apiGrubPacToItem(item));
          setData(items);
          setTotalEntries((flat as any).total_count ?? items.length);
        }
      } else {
        setServerGroups(null);
        setData([]);
        if (res.error) {
          showError(res.error);
        }
      }
    } catch (err) {
      console.error("[useGrubPacsData] fetch error:", err);
      setServerGroups(null);
      showError("Failed to load GrubPacs.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const groups = useMemo(() => {
    // Always prefer server groups: they carry per-group pagination metadata and
    // the backend group key (groupTableKey) needed to page a single group via the
    // API. Re-grouping client-side (groupByRestaurant) silently dropped that,
    // capping every restaurant group at the first fetched page. Fall back to
    // client grouping only when the server returned an ungrouped/flat payload.
    if (serverGroups && serverGroups.length > 0) {
      return serverGroups;
    }

    return groupByRestaurant(data);
  }, [data, serverGroups]);

  function groupByRestaurant(items: GrubPacItem[]): Array<{ name: string; items: GrubPacItem[] }> {
    const groupMap = new Map<string, GrubPacItem[]>();
    for (const item of items) {
      const key = item.restaurantName ?? "Unassigned";
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    }
    const sorted = [...groupMap.entries()].sort(([a], [b]) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    });
    return sorted.map(([name, items]) => ({ name, items }));
  }

  const refetchGroup = useCallback(async (group: { name: string; groupTableKey?: string }, page: number) => {
    setIsPageLoading(true);
    try {
      const params: GrubPacListParams = { 
        ...apiParams,
        group_by_selected_table: group.groupTableKey ?? group.name,
        page,
        limit: 50,
        status: "active"
      };

      const res = await grubpacService.getList(params);
      if (res.success && res.data) {
        const flat: GrubPacListData = res.data;
        const responseGroups = (flat as { groups?: Record<string, unknown> }).groups;
        if (responseGroups && typeof responseGroups === "object") {
           const updatedGroupEntry = group.groupTableKey
             ? [group.groupTableKey, (responseGroups as Record<string, unknown>)[group.groupTableKey]]
             : Object.entries(responseGroups).find(([k, v]) => {
                 const items = getWrappedGroupArray<ApiGrubPac>(v);
                 const nameValue = (responseGroups as any)[`${k}_name`];
                 const firstItem = items[0] ? apiGrubPacToItem(items[0]) : null;
                 const groupName = (v as any)?.name ?? (typeof nameValue === "string" && nameValue.trim().length > 0 ? nameValue : (firstItem?.restaurantName ?? (k === "unassigned" ? "Unassigned" : k)));
                 return groupName === group.name;
               });

           if (updatedGroupEntry) {
             const [updatedGroupKey, value] = updatedGroupEntry;
             if (!value) return;
             const normalizedGroupKey = String(updatedGroupKey);
             const items = getWrappedGroupArray<ApiGrubPac>(value).map((item) => apiGrubPacToItem(item));
             setServerGroups((prev) => 
                prev ? prev.map(g => (g.groupTableKey === normalizedGroupKey || g.name === group.name) ? { 
                  ...g, 
                  groupTableKey: normalizedGroupKey,
                  items, 
                  pagination: (value as any).pagination ? {
                    currentPage: (value as any).pagination.page,
                    pageSize: (value as any).pagination.limit,
                    totalItems: (value as any).pagination.total_count,
                    totalPages: (value as any).pagination.last_page,
                  } : undefined 
                } : g) : null
             );
           }
        }
      }
    } catch (err) {
      console.error("[useGrubPacsData] refetchGroup error:", err);
    } finally {
      setIsPageLoading(false);
    }
  }, [paramsKey, apiParams]);

  return {
    grubpacsData: data,
    groups,
    isLoading,
    isPageLoading,
    refetch: fetchData,
    refetchGroup,
    setGrubPacsData: setData,
    totalEntries,
  };
};
