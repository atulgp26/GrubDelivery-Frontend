import { useCallback, useEffect, useRef, useState } from "react";
import grubpacService from "@/services/grubpacs";
import type {
  ApiGrubPacSearchResult,
  GrubPacSearchParams,
} from "@/types/domain/grubpacs";

interface UseGrubPacSearchReturn {
  results: ApiGrubPacSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  reset: () => void;
}

export function useGrubPacSearch({
  query,
  limit = 50,
  status,
}: GrubPacSearchParams): UseGrubPacSearchReturn {
  const [results, setResults] = useState<ApiGrubPacSearchResult[]>([]);
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
      s: GrubPacSearchParams["status"],
      requestId: number,
    ) => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const res = await grubpacService.search({ query: q, limit: l, status: s });
        if (requestId !== requestIdRef.current) return;

        if (res.success) {
          const payload = res.data as unknown;
          let list: ApiGrubPacSearchResult[] = [];

          if (Array.isArray(payload)) {
            list = payload as ApiGrubPacSearchResult[];
          } else if (payload && typeof payload === "object") {
            const record = payload as {
              boxes?: ApiGrubPacSearchResult[];
              grubpacs?: ApiGrubPacSearchResult[];
              items?: ApiGrubPacSearchResult[];
            };

            if (Array.isArray(record.boxes)) {
              list = record.boxes;
            } else if (Array.isArray(record.grubpacs)) {
              list = record.grubpacs;
            } else if (Array.isArray(record.items)) {
              list = record.items;
            }
          }

          setResults(list);
        } else {
          setSearchError(res.error ?? "Search failed");
          setResults([]);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("[useGrubPacSearch] search error:", err);
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
