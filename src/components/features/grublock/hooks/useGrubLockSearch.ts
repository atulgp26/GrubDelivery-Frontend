import { useCallback, useEffect, useRef, useState } from "react";
import grublockService from "@/services/grublock";
import type {
  GrubLockSearchItem,
  GrubLockSearchParams,
} from "@/types/domain/grublock";

interface UseGrubLockSearchReturn {
  results: GrubLockSearchItem[];
  isSearching: boolean;
  searchError: string | null;
  reset: () => void;
}

export function useGrubLockSearch({
  query,
  limit = 50,
  status,
}: GrubLockSearchParams): UseGrubLockSearchReturn {
  const [results, setResults] = useState<GrubLockSearchItem[]>([]);
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

  const runSearch = useCallback(
    async (
      q: string,
      l: number,
      s: GrubLockSearchParams["status"],
      requestId: number,
    ) => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const res = await grublockService.search({ query: q, limit: l, status: s });
        if (requestId !== requestIdRef.current) return;

        if (res.success) {
          const payload = res.data as unknown;
          let list: GrubLockSearchItem[] = [];

          if (Array.isArray(payload)) {
            list = payload as GrubLockSearchItem[];
          } else if (payload && typeof payload === "object") {
            const record = payload as { items?: GrubLockSearchItem[]; boxes?: GrubLockSearchItem[] };
            if (Array.isArray(record.items)) {
              list = record.items;
            } else if (Array.isArray(record.boxes)) {
              list = record.boxes;
            }
          }

          setResults(list);
        } else {
          setSearchError(res.error ?? "Search failed");
          setResults([]);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("[useGrubLockSearch] search error:", err);
        setSearchError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setIsSearching(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query.trim()) {
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

  return {
    results,
    isSearching,
    searchError,
    reset,
  };
}
