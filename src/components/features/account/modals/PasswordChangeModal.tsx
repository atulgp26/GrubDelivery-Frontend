import type React from "react";
import { useState, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";
import FigIcon from "@/components/ui/FigIcon";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type PasswordFields = {
  current: string;
  new: string;
  confirm: string;
};

type PasswordChangeModalProps = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onSave: (passwords: PasswordFields) => void;
};

export default function PasswordChangeModal({
  open,
  onClose,
  onBack,
  onSave,
}: PasswordChangeModalProps): React.ReactElement {
  const [passwords, setPasswords] = useState<PasswordFields>({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState<{ current: boolean; new: boolean; confirm: boolean }>({
    current: false,
    new: false,
    confirm: false,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [hasVisitedConfirm, setHasVisitedConfirm] = useState(false);

  const handlePasswordChange = (field: keyof PasswordFields, value: string): void => {
    if (value.includes(" ")) {
      setErrorMessage("Spaces are not allowed in the password");
      value = value.replace(/\s/g, "");
    }
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const hasAnyShortPassword =
    (passwords.current.length > 0 && passwords.current.length < 8) ||
    (passwords.new.length > 0 && passwords.new.length < 8) ||
    (passwords.confirm.length > 0 && passwords.confirm.length < 8);

  const confirmMismatchError =
    (submitAttempted || hasVisitedConfirm) &&
    passwords.confirm.length >= 8 &&
    passwords.new.length >= 8 &&
    passwords.new !== passwords.confirm
      ? "New password and confirm password must match"
      : undefined;

  const isFormValid =
    passwords.current.length >= 8 &&
    passwords.new.length >= 8 &&
    passwords.confirm.length >= 8 &&
    passwords.new === passwords.confirm;

  const handleSave = (): void => {
    setSubmitAttempted(true);
    if (isFormValid) {
      onSave(passwords);
    }
  };

  const handleDismissError = useCallback(() => setErrorMessage(null), []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px] max-w-full"
      height="h-auto"
      noXPadding={true}
      closeOnOutsideClick={false}
    >
      {errorMessage && (
        <div className="fixed top-3 left-3 right-3 z-[9999]">
          <Alert variant="error" appearance="solid" autoDismiss onDismiss={handleDismissError} dismissTime={3000}>
            <AlertTitle className="text-[18px]">Error</AlertTitle>
            <AlertDescription className="text-[16px]">
              {errorMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="bg-white rounded-[var(--gp-radius-base)] p-[var(--gp-space-xl)] flex flex-col gap-[24px]">
        <div>
          <Button
            variant="neutral"
            appearance="ghost"
            className="absolute left-6 top-6 rounded-lg flex items-center justify-center gap-2"
            onClick={onBack}
            aria-label="Back"
          >
            <FigIcon name="left-arrow" size={20} />

          </Button>
        </div>

        {/* Text Section */}
        <div className="text-center w-full">
          <h2 className="font-semibold text-[24px] leading-[32px] text-[var(--gp-color-text-primary)] mb-[8px]">
            Hold on!
          </h2>
          <p className="text-[18px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
            To change your password, enter your current password, then your new password and hit save!
          </p>
        </div>

        {/* Form Section */}
        <div className="flex flex-col gap-[16px]">
          <TextField
            type={showPassword.current ? "text" : "password"}
            placeholder="Enter current password"
            value={passwords.current}
            onChange={(e) => handlePasswordChange("current", e.target.value)}
            size="xl"
            state="press"
            hasHoverEffect={true}
            trailingIcon={<FigIcon name={showPassword.current ? "eye" : "eye-slash"} size={24} />}
            onTrailingIconClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
          />

          <TextField
            type={showPassword.new ? "text" : "password"}
            placeholder="Enter new password"
            value={passwords.new}
            onChange={(e) => handlePasswordChange("new", e.target.value)}
            size="xl"
            state="press"
            hasHoverEffect={true}
            trailingIcon={<FigIcon name={showPassword.new ? "eye" : "eye-slash"} size={24} />}
            onTrailingIconClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
          />

          <TextField
            type={showPassword.confirm ? "text" : "password"}
            placeholder="Re-enter new password"
            value={passwords.confirm}
            onChange={(e) => handlePasswordChange("confirm", e.target.value)}
            onFocus={() => setHasVisitedConfirm(true)}
            onBlur={() => setSubmitAttempted(true)}
            size="xl"
            state="press"
            hasHoverEffect={true}
            error={confirmMismatchError}
            trailingIcon={<FigIcon name={showPassword.confirm ? "eye" : "eye-slash"} size={24} />}
            onTrailingIconClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
          />

          {hasVisitedConfirm && hasAnyShortPassword && (
            <p className="text-sm text-red-600" role="alert">
              Must be at least 8 characters
            </p>
          )}
        </div>

        {/* Button Section */}
        <div className="flex flex-col gap-[12px] w-full pt-[8px]">
          <Button
            type="button"
            disabled={!isFormValid}
            onClick={handleSave}
            variant="primary"
            appearance="outlined"
            size="xl"
            state="press"
            className="w-full uppercase text-[20px]"
          >
            <span>SAVE PASSWORD</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
} 