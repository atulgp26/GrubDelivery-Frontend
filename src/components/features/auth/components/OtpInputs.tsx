"use client";

import { useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

export interface OtpInputsProps {
  otp: string[];
  setOtp: Dispatch<SetStateAction<string[]>>;
  otpRefs: RefObject<HTMLInputElement | null>[];
  otpError?: boolean;
}

export default function OtpInputs({ otp, setOtp, otpRefs, otpError }: OtpInputsProps) {
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  return (
    <div className="flex gap-4 mb-4 w-full justify-center items-center">
      {otp.map((digit, idx) => (
        <div
          key={idx}
          className={`group relative flex items-center rounded-lg border bg-white transition-all duration-200 hover:border-[var(--gp-color-brand-primary)] hover:bg-[var(--gp-color-bg-neutral-secondary)] ${
            focusedIdx === idx || otpError
              ? "border-[var(--gp-color-brand-primary)] bg-[var(--gp-color-bg-neutral-secondary)] shadow-[0_0_0_2px_rgba(var(--theme-450)_/_0.40)]"
              : "border-[var(--gp-color-border-neutral)]"
          }`}
          style={{ overflow: "visible", width: "105px", height: "58px" }}
        >
          <input
            ref={otpRefs[idx]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            placeholder="0"
            className="w-full h-full rounded-lg bg-transparent text-center text-base text-[var(--gp-color-text-primary)] placeholder:text-[var(--gp-color-text-neutral-light)] border-none outline-none focus:ring-0 group-hover:text-[var(--gp-color-text-primary)] focus:text-[var(--gp-color-brand-primary)]"
            value={digit}
            onFocus={() => setFocusedIdx(idx)}
            onBlur={() => setFocusedIdx(null)}
            onPaste={(event) => {
              const pastedData = event.clipboardData.getData("text").replace(/[^0-9]/g, "");
              if (pastedData) {
                event.preventDefault();
                const newOtp = [...otp];
                let charIdx = 0;
                for (let i = idx; i < otp.length; i++) {
                  if (charIdx < pastedData.length) {
                    newOtp[i] = pastedData[charIdx];
                    charIdx++;
                  }
                }
                setOtp(newOtp);
                const nextFocus = Math.min(idx + pastedData.length, otp.length) - 1;
                otpRefs[Math.max(nextFocus, 0)].current?.focus();
              }
            }}
            onChange={(event) => {
              const val = event.target.value.replace(/[^0-9]/g, "");
              const newOtp = [...otp];
              newOtp[idx] = val;
              setOtp(newOtp);
              if (val && idx < otpRefs.length - 1) {
                otpRefs[idx + 1].current?.focus();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !otp[idx] && idx > 0) {
                otpRefs[idx - 1].current?.focus();
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}
