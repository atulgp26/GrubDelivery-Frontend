"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const OTP_LENGTH = 4;
const OTP_TIMER_SECONDS = 60;
const EMPTY_OTP: string[] = Array(OTP_LENGTH).fill("");

export function useOtpState(otpVerifyModalOpen: boolean) {
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState<string[]>([...EMPTY_OTP]);
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [otpError, setOtpError] = useState(false);

  const otpRefs: RefObject<HTMLInputElement | null>[] = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (otpVerifyModalOpen && timer > 0) {
      interval = setInterval(() => setTimer((v) => v - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpVerifyModalOpen, timer]);

  const resetOtp = () => {
    setOtp([...EMPTY_OTP]);
    setTimer(OTP_TIMER_SECONDS);
  };

  return {
    otpEmail,
    setOtpEmail,
    otp,
    setOtp,
    timer,
    setTimer,
    otpError,
    setOtpError,
    otpRefs,
    resetOtp,
  };
}

export type OtpState = ReturnType<typeof useOtpState>;
