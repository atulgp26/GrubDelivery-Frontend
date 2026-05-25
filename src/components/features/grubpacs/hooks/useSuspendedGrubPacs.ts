import { useState, useCallback, useEffect } from "react";
import grubpacService from "@/services/grubpacs";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import {
  apiGrubPacToSuspendedItem,
  type ApiGrubPac,
  type GrubPacListData,
} from "@/types/domain/grubpacs";
import type { SuspendedGrubPacItem, Restaurant } from "@/types/domain/grubpacs";

export interface ActionResult {
  success: boolean;
  error: string | null;
}

interface UseSuspendedGrubPacsReturn {
  suspendedData: SuspendedGrubPacItem[];
  groupedData: Record<string, SuspendedGrubPacItem[]>;
  restaurants: Restaurant[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  activateGrubPac: (id: string) => Promise<ActionResult>;
  bulkActivateGrubPacs: (ids: string[]) => Promise<ActionResult>;
  reassignGrubPac: (id: string, restaurantId: string) => Promise<ActionResult>;
}

export const useSuspendedGrubPacs = (): UseSuspendedGrubPacsReturn => {
  const [suspendedData, setSuspendedData] = useState<SuspendedGrubPacItem[]>([]);
  const [restaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuspended = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await grubpacService.getList({ status: "suspended" });
      if (res.success && res.data) {
        const flat: GrubPacListData = res.data;
        const grouped = (flat as { groups?: Record<string, unknown> }).groups;

        const items = grouped && typeof grouped === "object"
          ? flattenWrappedGroupRecord<ApiGrubPac>(grouped).map(apiGrubPacToSuspendedItem)
          : ((flat as { boxes?: ApiGrubPac[] }).boxes ?? []).map(apiGrubPacToSuspendedItem);
        setSuspendedData(items);
      } else {
        setSuspendedData([]);
        console.error("[useSuspendedGrubPacs] fetch failed:", res.error);
      }
    } catch (err) {
      console.error("[useSuspendedGrubPacs] fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSuspended();
  }, [fetchSuspended]);

  // Build grouped data: key = group name (restaurant name or "Unassigned")
  const groupedData: Record<string, SuspendedGrubPacItem[]> = suspendedData.reduce<
    Record<string, SuspendedGrubPacItem[]>
  >((acc, item) => {
    const key = (item.group as string) || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const activateGrubPac = useCallback(async (id: string): Promise<ActionResult> => {
    try {
      const res = await grubpacService.reactivate([id]);
      if (res.success) {
        setSuspendedData((prev) => prev.filter((item) => item.id !== id));
      }
      const error = res.success ? null : (res.error ?? "Failed to activate grubpac");
      return { success: res.success, error };
    } catch (err) {
      console.error("[useSuspendedGrubPacs] activateGrubPac error:", err);
      const error = err instanceof Error ? err.message : "Failed to activate grubpac";
      return { success: false, error };
    }
  }, []);

  const bulkActivateGrubPacs = useCallback(
    async (ids: string[]): Promise<ActionResult> => {
      try {
        const res = await grubpacService.reactivate(ids);
        if (res.success) {
          setSuspendedData((prev) =>
            prev.filter((item) => !ids.includes(String(item.id))),
          );
        }
        const error = res.success ? null : (res.error ?? "Failed to activate grubpacs");
        return { success: res.success, error };
      } catch (err) {
        console.error("[useSuspendedGrubPacs] bulkActivateGrubPacs error:", err);
        const error = err instanceof Error ? err.message : "Failed to activate grubpacs";
        return { success: false, error };
      }
    },
    [],
  );

  const reassignGrubPac = useCallback(
    async (id: string, restaurantId: string): Promise<ActionResult> => {
      try {
        const res = await grubpacService.action({
          ids: [id],
          assign_restaurant_id: restaurantId,
        });
        if (res.success) {
          await fetchSuspended();
        }
        const error = res.success ? null : (res.error ?? "Failed to reassign grubpac");
        return { success: res.success, error };
      } catch (err) {
        console.error("[useSuspendedGrubPacs] reassignGrubPac error:", err);
        const error = err instanceof Error ? err.message : "Failed to reassign grubpac";
        return { success: false, error };
      }
    },
    [fetchSuspended],
  );

  return {
    suspendedData,
    groupedData,
    restaurants,
    isLoading,
    refetch: fetchSuspended,
    activateGrubPac,
    bulkActivateGrubPacs,
    reassignGrubPac,
  };
};

