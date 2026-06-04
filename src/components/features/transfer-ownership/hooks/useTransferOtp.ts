"use client";

import { useRef, useState, useEffect } from "react";

export function useTransferOtp(open: boolean, onResend?: () => Promise<void>) { // ✅ onResend add kiya
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);

  const ref0 = useRef<HTMLInputElement | null>(null);
  const ref1 = useRef<HTMLInputElement | null>(null);
  const ref2 = useRef<HTMLInputElement | null>(null);
  const ref3 = useRef<HTMLInputElement | null>(null);
  const otpRefs = [ref0, ref1, ref2, ref3];

  useEffect(() => {
    if (open) {
      setOtp(["", "", "", ""]);
      setTimer(30);
    }
  }, [open]);

  useEffect(() => {
    if (!open || timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [open, timer]);

  // ✅ API call + timer reset
  const handleResend = async () => {
    setTimer(30);
    setOtp(["", "", "", ""]);
    if (onResend) await onResend(); // ✅ actual API call
  };

  return { otp, setOtp, timer, otpRefs, handleResend };
}