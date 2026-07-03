import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";
import Modal from "@/components/ui/Modal";
import FigIcon from "@/components/ui/FigIcon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { showError } from "@/components/ui/toast";
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN, PASSWORD_RULES_MESSAGE } from "@/components/features/auth/validation";

export interface SetNewPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (password: string) => void;
  userName?: string;
}

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

// Version 1:OTP Login Flow (with logo and welcome message)
export function SetNewPasswordModal({
  open,
  onClose,
  onSave,
  userName = "Akash",
}: SetNewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<
    "password" | "confirmPassword" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SetPasswordForm>({
    mode: "onChange",
  });

  const passwordField = register("password", {
    required: "Password is required",
    minLength: {
      value: PASSWORD_MIN_LENGTH,
      message: PASSWORD_RULES_MESSAGE,
    },
    pattern: {
      value: PASSWORD_PATTERN,
      message: PASSWORD_RULES_MESSAGE,
    },
  });

  const confirmPasswordField = register("confirmPassword", {
    required: "Confirm password is required",
    validate: (value) =>
      value === watch("password") || "Passwords do not match",
  });

  const { onBlur: passwordOnBlur, onChange: passwordOnChange, ...passwordFieldProps } = passwordField;
  const { onBlur: confirmPasswordOnBlur, onChange: confirmPasswordOnChange, ...confirmPasswordProps } =
    confirmPasswordField;

  const onSubmit = handleSubmit(({ password }) => onSave(password));

  const handleDismissError = useCallback(() => setErrorMessage(null), []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px] max-w-full"
      height="h-auto"
      noXPadding={true}
      closeOnOutsideClick={false}
      hideClose={true}
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
        {/* Logo Section */}
        <div className="flex justify-center items-center w-full gap-2">
          <Image
            src="/logomark.svg"
            alt="Logo"
            width={68.755}
            height={36.554}
          />
          <Image
            src="/grubpac.svg"
            alt="GrubPac"
            width={182.532}
            height={24.52}
          />
        </div>

        {/* Text Section */}
        <div className="text-center w-full">
          <h2 className="font-semibold text-[32px] leading-[32px] text-[var(--gp-color-text-primary)] mb-[8px]">
            Welcome {userName}!
          </h2>
          <p className="text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
            Add a password to make login easy
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="flex flex-col gap-[16px]">
          {/* Password Input */}
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            size="xl"
            state="press"
            hasHoverEffect={true}
            trailingIcon={<FigIcon name={showPassword ? "eye" : "eye-slash"} size={24} />}
            onTrailingIconClick={() => setShowPassword((value) => !value)}
            error={errors.password?.message}
            onFocus={() => setFocusedInput("password")}
            onBlur={(event) => {
              passwordOnBlur(event);
              setFocusedInput(null);
            }}
            onChange={(e) => {
              if (e.target.value.includes(" ")) {
                e.target.value = e.target.value.replace(/\s/g, "");
                showError("Spaces are not allowed in the password");
              }
              passwordOnChange(e);
            }}
            {...passwordFieldProps}
          />

          {/* Confirm Password Input */}
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter password"
            size="xl"
            state="press"
            hasHoverEffect={true}
            trailingIcon={<FigIcon name={showPassword ? "eye" : "eye-slash"} size={24} />}
            onTrailingIconClick={() => setShowPassword((value) => !value)}
            error={errors.confirmPassword?.message}
            onFocus={() => setFocusedInput("confirmPassword")}
            onBlur={(event) => {
              confirmPasswordOnBlur(event);
              setFocusedInput(null);
            }}
            onChange={(e) => {
              if (e.target.value.includes(" ")) {
                e.target.value = e.target.value.replace(/\s/g, "");
                showError("Spaces are not allowed in the password");
              }
              confirmPasswordOnChange(e);
            }}
            {...confirmPasswordProps}
          />

          {/* Button Section */}
          <div className="flex flex-col gap-[12px] w-full pt-[8px]">
            <Button
              type="submit"
              disabled={!isValid}
              variant="primary"
              appearance="outlined"
              size="xl"
              state="press"
              className="w-full uppercase text-[20px]"
            >
              <span>SAVE PASSWORD</span>
            </Button>

            <Button
              type="button"
              onClick={onClose}
              variant="neutral"
              appearance="ghost"
              size="lg"
              state="press"
              className="w-full uppercase text-[20px]"
            >
              <span>SKIP FOR NOW</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Version 2: Forgot Password Flow (reset password after email)
export function SetNewPasswordForgotModal({
  open,
  onClose,
  onSave,
}: SetNewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<
    "password" | "confirmPassword" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const body = document.body;
    const html = document.documentElement;
    const prevBodyBg = body.style.backgroundColor;
    const prevHtmlBg = html.style.backgroundColor;

    body.style.backgroundColor = "#ffffff";
    html.style.backgroundColor = "#ffffff";

    return () => {
      body.style.backgroundColor = prevBodyBg;
      html.style.backgroundColor = prevHtmlBg;
    };
  }, [open]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SetPasswordForm>({
    mode: "onChange",
  });

  const passwordField = register("password", {
    required: "Password is required",
    minLength: {
      value: PASSWORD_MIN_LENGTH,
      message: PASSWORD_RULES_MESSAGE,
    },
    pattern: {
      value: PASSWORD_PATTERN,
      message: PASSWORD_RULES_MESSAGE,
    },
  });

  const confirmPasswordField = register("confirmPassword", {
    required: "Confirm password is required",
    validate: (value) =>
      value === watch("password") || "Passwords do not match",
  });

  const { onBlur: passwordOnBlur, onChange: passwordOnChange, ...passwordFieldProps } = passwordField;
  const { onBlur: confirmPasswordOnBlur, onChange: confirmPasswordOnChange, ...confirmPasswordProps } =
    confirmPasswordField;

  const onSubmit = handleSubmit(({ password }) => onSave(password));

  const handleDismissError = useCallback(() => setErrorMessage(null), []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px] max-w-full"
      height="h-auto"
      customClass="bg-white"
      noBlur={true}
      hideClose={true}
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
      <div className="bg-white rounded-[var(--gp-radius-base)] p-[48px] flex flex-col gap-[32px]">
        {/* Header Section */}
        <div className="text-center w-full">
          <h1 className="font-semibold text-[24px] leading-[32px] text-[var(--gp-color-text-primary)] mb-[16px]">
            Set new password
          </h1>
          <p className="text-[18px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
            Enter and confirm your new password below. Choose a strong password
            you haven't used before.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="flex flex-col gap-[20px]">
          {/* Password Input */}
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            size="xl"
            state="press"
            hasHoverEffect={true}
            trailingIcon={<FigIcon name={showPassword ? "eye" : "eye-slash"} size={24} />}
            onTrailingIconClick={() => setShowPassword((value) => !value)}
            error={errors.password?.message}
            onFocus={() => setFocusedInput("password")}
            onBlur={(event) => {
              passwordOnBlur(event);
              setFocusedInput(null);
            }}
            onChange={(e) => {
              if (e.target.value.includes(" ")) {
                e.target.value = e.target.value.replace(/\s/g, "");
                showError("Spaces are not allowed in the password");
              }
              passwordOnChange(e);
            }}
            {...passwordFieldProps}
          />

          {/* Confirm Password Input */}
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            size="xl"
            state="press"
            hasHoverEffect={true}
            trailingIcon={<FigIcon name={showPassword ? "eye" : "eye-slash"} size={24} />}
            onTrailingIconClick={() => setShowPassword((value) => !value)}
            error={errors.confirmPassword?.message}
            onFocus={() => setFocusedInput("confirmPassword")}
            onBlur={(event) => {
              confirmPasswordOnBlur(event);
              setFocusedInput(null);
            }}
            onChange={(e) => {
              if (e.target.value.includes(" ")) {
                e.target.value = e.target.value.replace(/\s/g, "");
                showError("Spaces are not allowed in the password");
              }
              confirmPasswordOnChange(e);
            }}
            {...confirmPasswordProps}
          />

          {/* Button Section */}
          <Button
            type="submit"
            disabled={!isValid}
            variant="primary"
            appearance="solid"
            size="xl"
            state="press"
            className="w-full uppercase mt-[8px] text-[20px]"
          >
            SAVE PASSWORD
          </Button>
        </form>
      </div>
    </Modal>
  );
}

export default SetNewPasswordModal;
