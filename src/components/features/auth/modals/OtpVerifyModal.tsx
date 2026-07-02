import type { Dispatch, RefObject, SetStateAction } from "react";
import FigIcon from "@/components/ui/FigIcon";
import { Button } from "@/components/ui/Button";
import { showError } from "@/components/ui/toast";
import Modal from "@/components/ui/Modal";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import OtpInputs from "@/components/features/auth/components/OtpInputs";

export interface OtpVerifyModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  otp: string[];
  setOtp: Dispatch<SetStateAction<string[]>>;
  timer: number;
  onBack: () => void;
  onVerify: () => void;
  otpRefs: RefObject<HTMLInputElement | null>[];
  otpError?: boolean;
  onResend: () => void;
  title?: string;
  message?: string | null;
  showBackButton?: boolean;
  buttonText?: string;
  errorMessage?: string | null;
  onDismissError?: () => void;
}

export default function OtpVerifyModal({
  open,
  onClose,
  email,
  otp,
  setOtp,
  timer,
  onBack,
  onVerify,
  otpRefs,
  otpError = false,
  onResend,
  title = "OTP Verification",
  message = null,
  showBackButton = true,
  buttonText = "VERIFY",
  errorMessage = null,
  onDismissError,
}: OtpVerifyModalProps) {
  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      showError("Please enter a valid 4-digit OTP");
      return;
    }
    onVerify();
  };

  // ✅ Change 1: Added handleResend
  const handleResend = () => {
     console.log("🔥 OtpVerifyModal handleResend called")
      console.log("🔥 onResend value:", onResend)
    setOtp(["", "", "", ""]);
    onResend();
  };

  const isDisabled = otp.join("").length !== 4;
  const defaultMessage = `Enter the OTP sent to ${email || "your email"}`;
  const displayMessage = message ?? defaultMessage;

  const backButton = showBackButton ? (
    <Button
      variant="neutral"
      appearance="ghost"
      className="rounded-lg flex items-center justify-center gap-2"
      onClick={onBack}
      aria-label="Back"
    >
      <FigIcon name="left-arrow" size={20} />
      <span className="text-xl ml-1 font-medium">BACK</span>
    </Button>
  ) : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px] max-w-full"
      height="h-auto max-h-full"
      closeOnOutsideClick={false}
      headerLeft={backButton}
    >
      {errorMessage && onDismissError && (
        <div className="fixed top-[10px] left-0 right-0 z-[9999] flex justify-center w-full pointer-events-none">
          <Alert
            variant="error"
            appearance="solid"
            autoDismiss
            onDismiss={onDismissError}
            dismissTime={3000}
            className="rounded cursor-pointer shadow-md w-[95vw] pointer-events-auto"
          >
            <AlertTitle className="text-[18px]">Error</AlertTitle>
            <AlertDescription className="text-[16px]">
              {errorMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="flex flex-col items-center justify-center h-full w-full pt-8">
        <h2
          className="text-2xl font-semibold text-[var(--gp-color-text-primary)] text-center"
          style={{ marginTop: "var(--gp-space-xl)", marginBottom: "var(--gp-space-xl)" }}
        >
          {title}
        </h2>
        <p
          className="text-[var(--gp-color-text-neutral-secondary)] text-lg text-center"
          style={{ marginBottom: "var(--gp-space-xl)" }}
        >
          {displayMessage}
        </p>
        <OtpInputs otp={otp} setOtp={setOtp} otpRefs={otpRefs} otpError={otpError} />
        <div className="w-full text-left text-[16px] font-medium mb-4 pl-1 text-[var(--gp-color-text-neutral-light)]">
          {timer > 0 ? (
            `RESEND IN ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`
          ) : (
            <Button
              variant="neutral"
              appearance="ghost"
              type="button"
              className="font-normal text-[16px] !py-1 !px-1 btn-size-md-lg focus:outline-none"
              onClick={handleResend} // ✅ Change 2: onClick updated
            >
              <span>RESEND OTP</span>
            </Button>
          )}
        </div>
        <Button
          variant="primary"
          appearance="outlined"
          type="button"
          disabled={isDisabled}
          onClick={handleVerify}
          size="xl"
          state="press"
          className="w-full uppercase text-[20px]"
        >
          <span>{buttonText}</span>
        </Button>
      </div>
    </Modal>
  );
}