import { useState, useRef, useEffect, useCallback } from "react";

export function useOtpTimer(initialSeconds = 60) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (duration = initialSeconds) => {
      clear();
      setSeconds(duration);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [initialSeconds, clear],
  );

  const reset = useCallback(() => {
    clear();
    setSeconds(0);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { seconds, start, reset, isExpired: seconds === 0 };
}
