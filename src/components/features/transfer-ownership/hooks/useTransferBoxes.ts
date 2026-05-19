"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/lib/hooks";
import { getContextualErrorMessage } from "@/lib/errors";
import accountService, {
  type AccountMyGrubPac,
  type AccountMyGrubPacsData,
} from "@/services/account";
import type { GrubPacBoxRow } from "../table/transfer-ownership-table";

interface UseTransferBoxesOptions {
  search: string;
  showOffline: boolean;
  enabled?: boolean;
}

interface UseTransferBoxesResult {
  rows: GrubPacBoxRow[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function formatAddedDate(isoDate?: string | null): string {
  if (!isoDate) return "-";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function mapBoxToRow(box: AccountMyGrubPac): GrubPacBoxRow {
  const code = box.box_display_id?.trim();
  const vehicle = box.vehicle_number?.trim();

  const identifierParts: string[] = [];
  if (code) identifierParts.push(`#${code}`);
  if (vehicle) identifierParts.push(vehicle);

  return {
    id: box.id,
    name: box.name,
    identifier: identifierParts.length > 0 ? identifierParts.join(" | ") : undefined,
    power: box.power_status?.toLowerCase() === "on" ? "ON" : "OFF",
    added: formatAddedDate(box.created_at),
  };
}

function extractPayload(data: unknown): AccountMyGrubPacsData {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const boxes = Array.isArray(record.boxes) ? (record.boxes as AccountMyGrubPac[]) : [];
    const rawCount = typeof record.count === "number" ? record.count : boxes.length;
    return { boxes, count: rawCount };
  }

  return { boxes: [], count: 0 };
}

export function useTransferBoxes({
  search,
  showOffline,
  enabled = true,
}: UseTransferBoxesOptions): UseTransferBoxesResult {
  const [rows, setRows] = useState<GrubPacBoxRow[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const params = useMemo(
    () => ({
      ...(debouncedSearch ? { query: debouncedSearch } : {}),
      ...(!showOffline ? { power_status: "on" as const } : {}),
    }),
    [debouncedSearch, showOffline],
  );

  const fetchBoxes = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await accountService.getMyGrubPacs(params);
      if (!response.success) {
        setRows([]);
        setCount(0);
        setError(
          getContextualErrorMessage(
            "boxes.load",
            response,
            "Unable to load boxes right now. Please refresh and try again.",
          ),
        );
        return;
      }

      const payload = extractPayload(response.data);
      setRows(payload.boxes.map(mapBoxToRow));
      setCount(payload.count);
    } catch (err) {
      setRows([]);
      setCount(0);
      setError(
        getContextualErrorMessage(
          "boxes.load",
          err,
          "Unable to load boxes right now. Please refresh and try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled, params]);

  useEffect(() => {
    void fetchBoxes();
  }, [fetchBoxes]);

  return {
    rows,
    count,
    isLoading,
    error,
    refetch: fetchBoxes,
  };
}
