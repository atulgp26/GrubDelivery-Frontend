"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FigIcon from "@/components/ui/FigIcon";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";
import Modal from "@/components/ui/Modal";
import { EMAIL_RULES } from "@/components/features/auth/validation";

export interface OtpLoginModalProps {
  open: boolean;
  onCloseAction: () => void;
  onNextAction: (email: string) => void;
  otpLoading: boolean;
}

interface OtpLoginForm {
  email: string;
}

export default function OtpLoginModal({
  open,
  onCloseAction,
  onNextAction,
  otpLoading,
}: OtpLoginModalProps) {
  const [focusedInput, setFocusedInput] = useState<"email" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<OtpLoginForm>({
    mode: "onChange",
  });

  const emailField = register("email", EMAIL_RULES);

  const { onBlur: emailOnBlur, ...emailFieldProps } = emailField;

  const onSubmit = handleSubmit(({ email }) =>
    onNextAction(email.trim().toLowerCase())
  );

  return (
    <Modal
      open={open}
      onClose={onCloseAction}
      width="w-[604px] max-w-full"
      height="h-auto"
      noXPadding={true}
      showLogo
      closeOnOutsideClick={false}
    >
      <div className="bg-white rounded-lg p-[24px] flex flex-col gap-[24px]">
        {/* Text Section */}
        <div className="text-center w-full">
          <h2 className="font-semibold text-[24px] leading-[32px] text-[var(--color-neutral-950)] mb-[8px]">
            OTP Login
          </h2>
          <p className="text-[18px] leading-[28px] text-[var(--color-neutral-700)]">
            Enter your registered email ID
          </p>
        </div>

        {/* Email Input */}
        <div className="w-full">
          <TextField
            type="email"
            placeholder="Email ID"
            size="xl"
            state="press"
            hasHoverEffect={true}
            leadingIcon={<FigIcon name="user" size={24} />}
            error={errors.email?.message}
            onFocus={() => setFocusedInput("email")}
            onBlur={(event) => {
              emailOnBlur(event);
              setFocusedInput(null);
            }}
            {...emailFieldProps}
          />
        </div>

        {/* Button Section */}
        <div className="flex flex-col gap-0 mt-[24px] w-full">
          <Button
            type="submit"
            disabled={!isValid || otpLoading}
            onClick={onSubmit}
            variant="primary"
            appearance="outlined"
            size="xl"
            state="press"
            className="w-full uppercase text-[20px]"
            suppressHydrationWarning
          >
            <span>{otpLoading ? "SENDING OTP..." : "NEXT"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
