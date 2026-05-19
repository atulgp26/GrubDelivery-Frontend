"use client";

import { useEffect, useRef } from "react";

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Detects clicks outside the referenced element and invokes the handler.
 *
 * @example
 * const { ref } = useOutsideClick(() => setOpen(false));
 * return <div ref={ref}>...</div>;
 */
export function useOutsideClick<T extends HTMLElement>(handler: Handler) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleEvent(event: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    }

    document.addEventListener("mousedown", handleEvent);
    document.addEventListener("touchstart", handleEvent);

    return () => {
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("touchstart", handleEvent);
    };
  }, [handler]);

  return { ref };
}

