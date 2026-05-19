import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";
import Modal from "@/components/ui/Modal";
import FigIcon from "@/components/ui/FigIcon";

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

export default function SetNewPasswordModal({
  open,
  onClose,
  onSave,
  userName = "Akash",
}: SetNewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<
    "password" | "confirmPassword" | null
  >(null);

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
      value: 8,
      message: "Password must be at least 8 characters long",
    },
  });

  const confirmPasswordField = register("confirmPassword", {
    required: "Confirm password is required",
    validate: (value) =>
      value === watch("password") || "Passwords do not match",
  });

  const { onBlur: passwordOnBlur, ...passwordFieldProps } = passwordField;
  const { onBlur: confirmPasswordOnBlur, ...confirmPasswordProps } =
    confirmPasswordField;

  const onSubmit = handleSubmit(({ password }) => onSave(password));

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
