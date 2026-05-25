import { useCallback, useEffect, useState } from "react";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import type { RestaurantGroup, Restaurant, RestaurantData } from "@/types/domain/restaurants";
import foodService from "@/services/food";

export interface UseRestaurantGroupsOptions {
  searchTerm?: string;
  status?: "active" | "suspended" | "all";
  initialData?: RestaurantGroup[];
  autoLoad?: boolean;
  manager?: boolean;
  driver?: boolean;
  boxFilter?: boolean;
  groupByBoxes?: boolean;
  limit?: number;
}

export interface UseRestaurantGroupsResult {
  groups: RestaurantGroup[];
  isLoading: boolean;
  isPageLoading: boolean;
  isDebouncing: boolean;
  reload: () => Promise<void>;
  totalEntries: number;
  isInitialized: boolean;
  refetchGroup: (group: RestaurantGroup, page: number) => Promise<void>;
}

function getManagerName(manager: unknown): string | undefined {
  if (!manager) return undefined;
  if (typeof manager === "string") {
    const trimmed = manager.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof manager === "object") {
    const record = manager as Record<string, unknown>;
    const fullName = typeof record.full_name === "string" ? record.full_name.trim() : "";
    if (fullName) return fullName;
    const firstName = typeof record.first_name === "string" ? record.first_name.trim() : "";
    const lastName = typeof record.last_name === "string" ? record.last_name.trim() : "";
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (combined) return combined;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (name) return name;
  }
  return undefined;
}

function normalizePincode(pincode: unknown): string | undefined {
  if (typeof pincode !== "string") return undefined;
  const trimmed = pincode.trim();
  if (!trimmed) return undefined;
  if (/^0+$/.test(trimmed)) return undefined;
  return trimmed;
}

function buildRestaurantAddress(data: RestaurantData): string {
  const normalizedPincode = normalizePincode(data.pincode);
  const stateAndPincode = [data.state, normalizedPincode].filter(Boolean).join(" ").trim();
  const composed = [data.line_one, data.line_two, data.city, stateAndPincode]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");

  if (composed) return composed;

  const fullAddress = typeof data.full_address === "string" ? data.full_address.trim() : "";
  if (!fullAddress) return "";

  if (!normalizedPincode) {
    return fullAddress
      .replace(/,\s*0+\b/g, "")
      .replace(/\b0+\b$/g, "")
      .replace(/,\s*,/g, ",")
      .replace(/,\s*$/g, "")
      .trim();
  }

  return fullAddress;
}

export function useRestaurantGroups({
  searchTerm = "",
  status,
  initialData = [],
  autoLoad = true,
  manager = undefined,
  driver = undefined,
  boxFilter = undefined,
  groupByBoxes = true,
  limit: limitProp = 50,
}: UseRestaurantGroupsOptions = {}): UseRestaurantGroupsResult {
  const [groups, setGroups] = useState<RestaurantGroup[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [isInitialized, setIsInitialized] = useState<boolean>(!autoLoad);
  const isDebouncing = searchTerm !== debouncedSearch;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        query: debouncedSearch,
        limit: limitProp,
        page: 1,
      };

      if (status) {
        params.status = status;
      }

      if (groupByBoxes) {
        params.group_by = "boxes";
      }

      const response = await foodService.getRestaurants({
        ...(params as any),
      });

      if (response.success && response.data) {
        const mapRestaurantData = (r: RestaurantData): Restaurant => ({
          id: r.id,
          name: r.name,
          address: buildRestaurantAddress(r),
          manager: getManagerName(r.manager),
          drivers: r._count?.drivers || 0,
          boxes: r._count?.boxes || 0,
          suspended_boxes: r._count?.suspended_boxes || 0,
          updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
          }).replace(/ (\d{2})$/, "'$1") : "",
          status: r.status as any,
          city: r.city,
          state: r.state,
          pincode: r.pincode,
          line_one: r.line_one,
          line_two: r.line_two,
          latitude: r.latitude,
          longitude: r.longitude,
          google_place_id: r.google_place_id,
        });

        const applyFilters = (items: Restaurant[]) => {
          let filtered = items;
          if (manager) filtered = filtered.filter(r => !!r.manager);
          if (driver) filtered = filtered.filter(r => (r.drivers || 0) > 0);
          if (boxFilter) filtered = filtered.filter(r => (r.boxes || 0) > 0);
          return filtered;
        };

        if (response.data.groups && groupByBoxes) {
          const apiGroups = response.data.groups;

          let withBoxesGroup = apiGroups.with_boxes?.array ?? [];
          let withoutBoxesGroup = apiGroups.without_boxes?.array ?? [];

          let withBoxesMapped = applyFilters(withBoxesGroup.map(mapRestaurantData));
          let withoutBoxesMapped = applyFilters(withoutBoxesGroup.map(mapRestaurantData));

          setTotalEntries((response.data as any).total_count ?? response.data.count ?? (withBoxesMapped.length + withoutBoxesMapped.length));

              setGroups([
                {
                  name: "Restaurants with boxes",
                  items: withBoxesMapped,
                  pagination: (apiGroups.with_boxes as any).pagination ? {
                    currentPage: (apiGroups.with_boxes as any).pagination.page,
                    pageSize: (apiGroups.with_boxes as any).pagination.limit,
                    totalItems: (apiGroups.with_boxes as any).pagination.total_count,
                    totalPages: (apiGroups.with_boxes as any).pagination.last_page,
                  } : undefined,
                  emptyMessage: "Assign boxes to your restaurants to see the list here.",
                },
                {
                  name: "Restaurants without boxes",
                  items: withoutBoxesMapped,
                  pagination: (apiGroups.without_boxes as any).pagination ? {
                    currentPage: (apiGroups.without_boxes as any).pagination.page,
                    pageSize: (apiGroups.without_boxes as any).pagination.limit,
                    totalItems: (apiGroups.without_boxes as any).pagination.total_count,
                    totalPages: (apiGroups.without_boxes as any).pagination.last_page,
                  } : undefined,
                  emptyMessage: "All restaurants have assigned boxes.",
                },
              ]);
        } else if (response.data.restaurants) {
          const rawRestaurants = response.data.restaurants;
          const restaurants = applyFilters(rawRestaurants.map(mapRestaurantData));

          setTotalEntries(restaurants.length);

          if (groupByBoxes) {
            const withBoxes = restaurants.filter((r: Restaurant) => (r.boxes || 0) > 0);
            const withoutBoxes = restaurants.filter((r: Restaurant) => (r.boxes || 0) === 0);

            setGroups([
              {
                name: "Restaurants with boxes",
                items: withBoxes,
                emptyMessage: "Assign boxes to your restaurants to see the list here.",
              },
              {
                name: "Restaurants without boxes",
                items: withoutBoxes,
                emptyMessage: "All restaurants have assigned boxes.",
              },
            ]);
          } else {
            setGroups([
              {
                name: "All Restaurants",
                items: restaurants,
                emptyMessage: "No restaurants found.",
              }
            ]);
          }
        } else if (response.data.groups && !groupByBoxes) {
          // If backend returns groups but we asked for flat, flatten it gracefully
          const groupedRestaurants = flattenWrappedGroupRecord<RestaurantData>(response.data.groups as Record<string, unknown>);
          const allRestaurants = applyFilters(groupedRestaurants.map(mapRestaurantData));
          setTotalEntries(allRestaurants.length);
          setGroups([
            {
              name: "All Restaurants",
              items: allRestaurants,
              emptyMessage: "No restaurants found.",
            }
          ]);
        } else {
           setTotalEntries(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [debouncedSearch, status, manager, driver, boxFilter, groupByBoxes]);

  useEffect(() => {
    if (autoLoad) {
      void load();
    }
  }, [autoLoad, load]);

  const refetchGroup = useCallback(async (group: RestaurantGroup, page: number) => {
    setIsPageLoading(true);
    try {
      const groupName = typeof group.name === "string" ? group.name : "";
      if (!groupName) return;

      const selectedTable = groupName === "Restaurants with boxes" ? "with_boxes" : "without_boxes";

      const params: Record<string, unknown> = {
        query: debouncedSearch,
        limit: 50,
        page,
        group_by: "boxes",
        group_by_selected_table: selectedTable
      };

      if (status) params.status = status;

      const response = await foodService.getRestaurants(params as any);

      if (response.success && response.data) {
        // Find the group in the response
        const apiGroups = response.data.groups as any;
        const targetGroup = apiGroups?.[selectedTable];

        if (targetGroup) {
          const mappedItems = (targetGroup.array ?? []).map((r: RestaurantData) => ({
            id: r.id,
            name: r.name,
            address: buildRestaurantAddress(r),
            manager: getManagerName(r.manager),
            drivers: r._count?.drivers || 0,
            boxes: r._count?.boxes || 0,
            suspended_boxes: r._count?.suspended_boxes || 0,
            updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: '2-digit'
            }).replace(/ (\d{2})$/, "'$1") : "",
            status: r.status as any,
            city: r.city,
            state: r.state,
            pincode: r.pincode,
            line_one: r.line_one,
            line_two: r.line_two,
            latitude: r.latitude,
            longitude: r.longitude,
            google_place_id: r.google_place_id,
          }));

          setGroups((prev) => 
            prev.map(g => g.name === group.name ? { 
              ...g, 
              items: mappedItems, 
              pagination: targetGroup.pagination ? {
                currentPage: targetGroup.pagination.page,
                pageSize: targetGroup.pagination.limit,
                totalItems: targetGroup.pagination.total_count,
                totalPages: targetGroup.pagination.last_page,
              } : undefined 
            } : g)
          );
        }
      }
    } catch (error) {
      console.error("Failed to refetch restaurant group:", error);
    } finally {
      setIsPageLoading(false);
    }
  }, [debouncedSearch, status, manager, driver, boxFilter, groupByBoxes]);

  return {
    groups,
    isLoading,
    isPageLoading,
    isDebouncing: searchTerm !== debouncedSearch,
    reload: load,
    totalEntries,
    isInitialized,
    refetchGroup,
  };
}
