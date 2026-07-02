"use client"

import { useState, useRef, useEffect } from "react"
import type { RefObject } from "react"
import OtpVerifyModal from "@/components/features/auth/modals/OtpVerifyModal"

export default function TransferOtpModal({
  open,
  onClose,
  onBack,
  selectedCount = 3,
  transferType = "selected",
  ownerDetails,
  onVerify,
  onResend,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedCount?: number;
  transferType?: string;
  ownerDetails?: { phone?: string };
  onVerify: (otp: string) => void;
  onResend?: () => Promise<void>;
}) {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [timer, setTimer] = useState(0)
  const [otpError, setOtpError] = useState(false)
  const otpRefs: RefObject<HTMLInputElement | null>[] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (timer > 0 && open) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer, open])

  useEffect(() => {
    if (open) {
      setTimer(60)
      setOtp(["", "", "", ""])
      setOtpError(false)
    }
  }, [open])

  const handleVerify = () => {
    const otpString = otp.join("")
    if (otpString.length !== 4) return
    onVerify(otpString)
  }

  // ✅ Clean handleResend — sirf parent onResend call karo
  const handleResend = async () => {
    console.log("🔥 TransferOtpModal handleResend called")
    setTimer(60)
    setOtp(["", "", "", ""])
    setOtpError(false)
    otpRefs[0].current?.focus()
    if (onResend) await onResend()
  }

  const getOwnerPhone = () => {
    if (ownerDetails?.phone) {
      const phone = ownerDetails.phone
      return phone.replace(/\d(?=\d{4})/g, "X")
    }
    return "+91-XXXXXX1234"
  }

  const customMessage = `We've sent a 4-digit OTP to your registered mobile number (${getOwnerPhone()}). Enter it below to authorize the transfer.`

  return (
    <OtpVerifyModal
      open={open}
      onClose={onClose}
      onBack={onBack}
      email=""
      otp={otp}
      setOtp={setOtp}
      timer={timer}
      onVerify={handleVerify}
      otpRefs={otpRefs}
      otpError={otpError}
      onResend={handleResend}  // ✅ handleResend — not handleOtpResend
      title="OTP Verification"
      message={customMessage}
      showBackButton={true}
      buttonText={transferType === "account"
        ? "VERIFY AND TRANSFER ACCOUNT"
        : `VERIFY AND TRANSFER ${selectedCount} GRUBPACS`
      }
    />
  )
}