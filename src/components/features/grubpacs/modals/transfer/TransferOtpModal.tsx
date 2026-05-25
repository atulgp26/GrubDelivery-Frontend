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
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedCount?: number;
  transferType?: string;
  ownerDetails?: { phone?: string };
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [timer, setTimer] = useState(12)
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

  // Reset timer and OTP when modal opens
  useEffect(() => {
    if (open) {
      setTimer(12)
      setOtp(["", "", "", ""])
      setOtpError(false)
    }
  }, [open])

  const handleVerify = () => {
    const otpString = otp.join("")
    if (otpString === "2222") { // Demo OTP
      onSuccess()
    } else {
      setOtpError(true)
      // Reset OTP on error
      setOtp(["", "", "", ""])
      otpRefs[0].current?.focus()
    }
  }

  const handleResend = () => {
    setTimer(12)
    setOtp(["", "", "", ""])
    setOtpError(false)
    otpRefs[0].current?.focus()
  }

  const getOwnerPhone = () => {
    if (ownerDetails?.phone) {
      // Mask the phone number for security
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
      onResend={handleResend}
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