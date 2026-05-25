"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches.
 *
 * @example
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = () => window.matchMedia(query).matches;
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return getMatches();
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

