"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getContextualErrorMessage } from "@/lib/errors";
import grubpacService from "@/services/grubpacs";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import type {
  ApiGrubPac,
  GrubPacListData,
  GrubPacListGroupedResponse,
  GrubPacListFlatResponse,
  GrubPacListParams,
} from "@/types/domain/grubpacs";
import type { FilterState } from "@/components/features/shared/filter/BoxFilterModal";
import { formatDate } from "@/lib/utils/date";
import type { EmployeeBox } from "../types";

interface UseEmployeeBoxesOptions {
  employeeId?: string;
  fetchExcluded?: boolean;
  showOfflineBoxes?: boolean;
  enabled?: boolean;
  page?: number;
  limit?: number;
  searchTerm?: string;
  filters?: FilterState;
  restaurantId?: string;
}

interface UseEmployeeBoxesResult {
  boxes: EmployeeBox[];
  excludedBoxes: EmployeeBox[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function formatApiDate(isoDate: string): string {
  if (!isoDate) return "";
  return formatDate(isoDate);
}

function flattenGroups(data: GrubPacListData | undefined): ApiGrubPac[] {
  if (!data) return [];

  if ("boxes" in data && Array.isArray((data as GrubPacListFlatResponse).boxes)) {
    return (data as GrubPacListFlatResponse).boxes;
  }

  const grouped = data as GrubPacListGroupedResponse;
  const groups = grouped.groups ?? {};
  return flattenWrappedGroupRecord<ApiGrubPac>(groups as Record<string, unknown>);
}

function dedupeById(items: ApiGrubPac[]): ApiGrubPac[] {
  const byId = new Map<string, ApiGrubPac>();
  items.forEach((item) => {
    if (!item.id) return;
    byId.set(item.id, item);
  });
  return Array.from(byId.values());
}

function mapApiBoxToEmployeeBox(box: ApiGrubPac): EmployeeBox {
  const power = (box.power_status ?? "unknown").toLowerCase();
  const restaurantName =
    box.restaurants?.[0]?.name ?? box.restaurant_boxes?.[0]?.restaurant?.name;

  const detailsParts: string[] = [];
  if (box.box_display_id) detailsParts.push(`#${box.box_display_id}`);
  if (box.vehicle_number) detailsParts.push(box.vehicle_number);
  if (restaurantName) detailsParts.push(restaurantName);

  // A box is offline if its power_status is "off"
  const isOffline = power === "off";

  return {
    id: box.id,
    name: box.name,
    details: detailsParts.join(" | "),
    power: power === "on" ? "on" : power === "off" ? "off" : "warning",
    added: formatApiDate(box.created_at),
    isLocked: box.grublock_status === "locked" || box.lock?.lock_status === "locked",
    isOffline,
  };
}

function mapFiltersToListParams(filters?: FilterState): Partial<GrubPacListParams> {
  if (!filters) return {};

  const params: Partial<GrubPacListParams> = {};

  if (filters.power.length === 1) {
    const value = filters.power[0];
    if (value === "Powered on") params.power_status = "on";
    else if (value === "Powered off") params.power_status = "off";
    else if (value === "Unknown") params.power_status = "unknown";
  }

  if (filters.connection.length === 1) {
    const value = filters.connection[0];
    if (value === "Connected") params.connection_status = "connected";
    else if (value === "Disconnected") params.connection_status = "disconnected";
  }

  if (filters.health.length === 1) {
    const value = filters.health[0];
    if (value === "Critical") params.health_status = "critical";
    else if (value === "Healthy") params.health_status = "healthy";
    else if (value === "Needs attention") params.health_status = "attention";
  }

  if (filters.grubLockStatus.length === 1) {
    const value = filters.grubLockStatus[0];
    if (value === "Locked") params.grublock_status = "locked";
    else if (value === "Unlocked") params.grublock_status = "unlocked";
    else if (value === "No lock available") params.grublock_status = "not_available";
  }

  if (filters.restaurantAssigned) params.restaurant_assigned = "on";
  if (filters.vehicleAssigned) params.vehicle_assigned = "on";
  if (filters.ioniserOn) params.ioniser_status = "on";
  if (filters.dualZoneOn) params.dual_zone_status = "on";

  if (filters.zone1Min !== -20) params.zone1_min = filters.zone1Min;
  if (filters.zone1Max !== 30) params.zone1_max = filters.zone1Max;
  if (filters.zone2Min !== -20) params.zone2_min = filters.zone2Min;
  if (filters.zone2Max !== 30) params.zone2_max = filters.zone2Max;

  return params;
}

export function useEmployeeBoxes({
  employeeId,
  restaurantId,
  fetchExcluded = false,
  showOfflineBoxes = false,
  enabled = true,
  page = 1,
  limit = 50,
  searchTerm = "",
  filters,
}: UseEmployeeBoxesOptions): UseEmployeeBoxesResult {
  const [boxes, setBoxes] = useState<EmployeeBox[]>([]);
  const [excludedBoxes, setExcludedBoxes] = useState<EmployeeBox[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(async () => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const run = async () => {
if (!enabled || (!employeeId && !restaurantId)) {
        setBoxes([]);
        setExcludedBoxes([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const permissionStatus = fetchExcluded ? "blocked" : "shared";
        const apiFilterParams = mapFiltersToListParams(filters);
  const fallbackPowerStatus = showOfflineBoxes ? "off" : "on";
const listRes = await grubpacService.getList({
  ...(restaurantId 
    ? { restaurant_id: restaurantId } 
    : { employee_id: employeeId }),
          permission_status: restaurantId ? undefined : permissionStatus, 
          power_status: apiFilterParams.power_status ?? fallbackPowerStatus,
          connection_status: apiFilterParams.connection_status,
          health_status: apiFilterParams.health_status,
          grublock_status: apiFilterParams.grublock_status,
          restaurant_assigned: apiFilterParams.restaurant_assigned,
          vehicle_assigned: apiFilterParams.vehicle_assigned,
          ioniser_status: apiFilterParams.ioniser_status,
          dual_zone_status: apiFilterParams.dual_zone_status,
          zone1_min: apiFilterParams.zone1_min,
          zone1_max: apiFilterParams.zone1_max,
          zone2_min: apiFilterParams.zone2_min,
          zone2_max: apiFilterParams.zone2_max,
          page,
          limit,
          query: searchTerm.trim() || undefined,
        });

        if (!listRes.success) {
          const message = getContextualErrorMessage(
            "boxes.load",
            listRes,
            "Unable to load boxes right now. Please refresh and try again.",
          );
          setError(message);
        }

        const data = listRes.data as GrubPacListData & { count?: number };
        const listBoxes = dedupeById(flattenGroups(data));
        const mappedBoxes = listBoxes.map(mapApiBoxToEmployeeBox);

        const totalItems = listRes.pagination?.total_count ?? (typeof data?.count === 'number' ? data.count : mappedBoxes.length);
        setTotalCount(Number(totalItems));

        if (fetchExcluded) {
          setExcludedBoxes(mappedBoxes);
          setBoxes([]);
        } else {
          setBoxes(mappedBoxes);
          setExcludedBoxes([]);
        }
      } catch (err) {
        const message = getContextualErrorMessage(
          "boxes.load",
          err,
          "Unable to load boxes right now. Please refresh and try again.",
        );
        setError(message);
        setBoxes([]);
        setExcludedBoxes([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [employeeId, enabled, restaurantId, fetchExcluded, reloadToken, showOfflineBoxes, page, limit, searchTerm, filters]);

  return {
    boxes,
    excludedBoxes,
    totalCount,
    isLoading,
    error,
    refetch,
  };
}
