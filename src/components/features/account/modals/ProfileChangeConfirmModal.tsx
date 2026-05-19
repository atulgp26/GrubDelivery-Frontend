import { useState, useCallback } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import FigIcon from "@/components/ui/FigIcon";
import { Button } from "@/components/ui/Button";
import { showError } from "@/components/ui/toast";
import Modal from "@/components/ui/Modal";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import OtpInputs from "@/components/features/auth/components/OtpInputs";

export interface ProfileChangeConfirmModalProps {
  open: boolean;
  onClose: () => void;
  contactNumber: string;
  otp: string[];
  setOtp: Dispatch<SetStateAction<string[]>>;
  timer: number;
  onBack: () => void;
  onVerify: () => void;
  otpRefs: RefObject<HTMLInputElement | null>[];
  otpError?: boolean;
  onResend: () => void;
}

export default function ProfileChangeConfirmModal({
  open,
  onClose,
  contactNumber,
  otp,
  setOtp,
  timer,
  onBack,
  onVerify,
  otpRefs,
  otpError = false,
  onResend,
}: ProfileChangeConfirmModalProps) {
  const [showInvalidOtpAlert, setShowInvalidOtpAlert] = useState<boolean>(false);

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      showError("Please enter a valid 4-digit OTP");
      return;
    }
    if (otpString !== "1111") {
      setShowInvalidOtpAlert(true);
      return;
    }
    onVerify();
  };

  const isDisabled = otp.join("").length !== 4;

  const handleDismissError = useCallback(() => setShowInvalidOtpAlert(false), []);

  return (
    <>
      {showInvalidOtpAlert && (
        <div className="fixed top-3 left-3 right-3 z-[9999]">
          <Alert variant="error" appearance="solid" autoDismiss onDismiss={handleDismissError} dismissTime={5000}>
            <AlertTitle className="text-[18px]">Invalid OTP</AlertTitle>
            <AlertDescription className="text-[16px]">
              Please try again.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Modal
        open={open}
        onClose={onClose}
        width="w-[604px] max-w-full"
        height="h-auto max-h-full"
        closeOnOutsideClick={false}
      >
        <div className="flex flex-col items-center justify-center h-full w-full pt-8">
          <Button
            variant="neutral"
            appearance="ghost"
            className="absolute left-6 top-6 rounded-lg flex items-center justify-center gap-2"
            onClick={onBack}
            aria-label="Back"
          >
            <FigIcon name="left-arrow" size={20} />
            <span className="text-xl ml-1 font-medium">BACK</span>
          </Button>

          <h2
            className="text-2xl font-semibold text-[var(--gp-color-text-primary)] text-center"
            style={{
              marginTop: "var(--gp-space-xl)",
              marginBottom: "var(--gp-space-xl)",
            }}
          >
            Hold on!
          </h2>
          <p
            className="text-[var(--gp-color-text-neutral-secondary)] text-lg text-center"
            style={{ marginBottom: "var(--gp-space-xl)" }}
          >
            To confirm the change, enter the OTP sent to your updated contact
            number - {contactNumber}
          </p>

          <OtpInputs
            otp={otp}
            setOtp={setOtp}
            otpRefs={otpRefs}
            otpError={otpError}
          />

          <div className="w-full text-left text-[16px] font-medium mb-4 pl-1 text-[var(--gp-color-text-neutral-light)]">
            {timer > 0 ? (
              `RESEND IN 0:${timer.toString().padStart(2, "0")}`
            ) : (
              <Button
                variant="neutral"
                appearance="ghost"
                type="button"
                className="font-normal text-[16px] !py-1 !px-1 btn-size-md-lg focus:outline-none"
                onClick={onResend}
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
            <span>VERIFY</span>
          </Button>
        </div>
      </Modal>
    </>
  );
}
