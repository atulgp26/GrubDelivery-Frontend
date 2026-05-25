import { useCallback, useEffect, useRef, useState } from "react";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import foodService from "@/services/food";
import type { RestaurantData, RestaurantListParams } from "@/types/domain/restaurants";

interface UseRestaurantSearchReturn {
  results: RestaurantData[];
  isSearching: boolean;
  searchError: string | null;
  reset: () => void;
}

export function useRestaurantSearch({
  query = "",
  limit = 50,
  status = "all",
}: RestaurantListParams): UseRestaurantSearchReturn {
  const [results, setResults] = useState<RestaurantData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    requestIdRef.current += 1;
    setResults([]);
    setIsSearching(false);
    setSearchError(null);
  }, []);

  const runSearch = useCallback(async (
    q: string,
    l: number,
    s: RestaurantListParams["status"],
    requestId: number,
  ) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const params: any = { query: q, limit: l };
      if (s && s !== "all") {
        params.status = s;
      }
      const res = await foodService.getRestaurants(params);
      if (requestId !== requestIdRef.current) return;
      if (res.success && res.data) {
        let list: RestaurantData[] = [];
        if (res.data.restaurants) {
            list = res.data.restaurants;
        } else if (res.data.groups) {
          list = flattenWrappedGroupRecord<RestaurantData>(res.data.groups as Record<string, unknown>);
        }
        setResults(list);
      } else {
        setSearchError(res.error ?? "Search failed");
        setResults([]);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("[useRestaurantSearch] search error:", err);
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      if (requestId === requestIdRef.current) setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query || !query.trim()) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    timeoutRef.current = setTimeout(() => {
      void runSearch(query, limit, status, requestId);
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, limit, status, runSearch]);

  return { results, isSearching, searchError, reset };
}
