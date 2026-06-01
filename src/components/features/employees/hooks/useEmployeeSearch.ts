import { useCallback, useEffect, useRef, useState } from "react";
import employeeService from "@/services/employees";
import type { ApiEmployeeSearchResult, EmployeeSearchParams } from "@/types/domain/employees";

interface UseEmployeeSearchReturn {
  results: ApiEmployeeSearchResult[];
  isSearching: boolean;
  searchError: string | null;
  reset: () => void;
}

export function useEmployeeSearch({
  query,
  limit = 50,
  status = "all",
}: EmployeeSearchParams): UseEmployeeSearchReturn {
  const [results, setResults] = useState<ApiEmployeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks the latest request; stale responses from older requests are ignored.
  const requestIdRef = useRef(0);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    requestIdRef.current += 1;
    setResults([]);
    setIsSearching(false);
    setSearchError(null);
  }, []);

  // runSearch is decoupled from the timer – the timer just calls this function.
  const runSearch = useCallback(async (
    q: string,
    l: number,
    s: EmployeeSearchParams["status"],
    requestId: number,
  ) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await employeeService.search({ query: q, limit: l, status: s });
      if (requestId !== requestIdRef.current) return;
      if (res.success) {
        const list: ApiEmployeeSearchResult[] =
          (res.data as { employees?: ApiEmployeeSearchResult[] })?.employees ?? [];
        setResults(list);
      } else {
        setSearchError(res.error ?? "Search failed");
        setResults([]);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("[useEmployeeSearch] search error:", err);
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      if (requestId === requestIdRef.current) setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

if (query.trim().length < 3) {
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
