"use client";

import OtpVerifyModal from "@/components/features/auth/modals/OtpVerifyModal";
import { useTransferOtp } from "../hooks/useTransferOtp";
import { getOtpButtonLabel } from "../constants/transfer-labels";

interface TransferOtpModalProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onVerify: (otp: string) => void;
  transferType: "selected" | "all";
  selectedCount: number;
  onResend?: () => Promise<void>;
}

export default function TransferOtpModal({
  open,
  onClose,
  onBack,
  onVerify,
  transferType,
  selectedCount,
  onResend,
}: TransferOtpModalProps) {
  const { otp, setOtp, timer, otpRefs, handleResend } = useTransferOtp(open, onResend);

  const handleVerify = () => {
    onVerify(otp.join(""));
  };

  return (
    <OtpVerifyModal
      open={open}
      onClose={onClose}
      email=""
      otp={otp}
      setOtp={setOtp}
      timer={timer}
      onBack={onBack}
      onVerify={handleVerify}
      otpRefs={otpRefs}
      onResend={handleResend}
      title="OTP Verification"
      message="We've sent a 4-digit OTP to your registered email. Enter it below to authorize the transfer."
      buttonText={getOtpButtonLabel(transferType, selectedCount)}
    />
  );
}
