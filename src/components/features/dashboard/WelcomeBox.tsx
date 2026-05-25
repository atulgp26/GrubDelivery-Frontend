import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { showSuccess } from "@/components/ui/toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

const STORAGE_KEY = "hasShownPasswordModal";

export default function WelcomeBox() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<
    "password" | "confirmPassword" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<SetPasswordForm>({
    mode: "onChange",
  });

  const passwordField = register("password", {
    required: "Password is required",
  });
  const confirmPasswordField = register("confirmPassword", {
    required: "Please confirm your password",
    validate: (value) =>
      value === watch("password") || "Passwords do not match",
  });

  const {
    ref: passwordRef,
    onBlur: passwordOnBlur,
    onChange: passwordOnChange,
    ...passwordFieldProps
  } = passwordField;
  const {
    ref: confirmPasswordRef,
    onBlur: confirmPasswordOnBlur,
    onChange: confirmPasswordOnChange,
    ...confirmPasswordFieldProps
  } = confirmPasswordField;

  useEffect(() => {
    const hasShown = window.localStorage.getItem(STORAGE_KEY);
    if (!hasShown) {
      setModalOpen(true);
    }
  }, []);

  const handleSkip = () => {
    setModalOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleSave = (data: SetPasswordForm) => {
    console.log("Password set", data);
    setModalOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
    showSuccess("Password set successfully!", "");
    reset();
  };

  const handleDismissError = useCallback(() => setErrorMessage(null), []);

  return (
    <Modal
      open={modalOpen}
      onClose={handleSkip}
      width="w-[504px] max-w-full"
      height="h-auto max-h-full"
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
      <form
        onSubmit={handleSubmit(handleSave)}
        className="flex flex-col items-center w-full max-w-md mx-auto p-6"
      >
        <Image
          src="/welcome-logo.png"
          alt="GrubPac"
          width={300}
          height={64}
          className="object-contain mb-4"
        />
        <h2 className="text-3xl font-semibold text-[var(--text-heading)] mb-2 text-center">
          Welcome Akash!
        </h2>
        <p className="text-[var(--dark-olive-gray)] mb-6 text-lg text-center">
          Add a password to make login easy
        </p>

        <div className="w-full space-y-4 mb-4">
          <div className="relative">
            <Input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              className={`w-full border placeholder:text-[var(--icon-color)] rounded-lg px-4 py-3 pr-12 text-lg ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter password"
              isFocused={focusedInput === "password"}
              onFocus={() => setFocusedInput("password")}
              onBlur={(event) => {
                passwordOnBlur(event);
                setFocusedInput(null);
              }}
              onChange={(e) => {
                if (e.target.value.includes(" ")) {
                  e.target.value = e.target.value.replace(/\s/g, "");
                  setErrorMessage("Spaces are not allowed in the password");
                }
                passwordOnChange(e);
              }}
              suppressHydrationWarning
              {...passwordFieldProps}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary)]"
              onClick={() => setShowPassword((value) => !value)}
              tabIndex={-1}
              suppressHydrationWarning
            >
              {showPassword ? (
                <FiEye className="w-5 h-5 text-[var(--primary)]" />
              ) : (
                <FiEyeOff className="w-5 h-5 text-[var(--primary)]" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}

          <div className="relative">
            <Input
              ref={confirmPasswordRef}
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full border placeholder:text-[var(--icon-color)] rounded-lg px-4 py-3 pr-12 text-lg ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Re-enter password"
              isFocused={focusedInput === "confirmPassword"}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={(event) => {
                confirmPasswordOnBlur(event);
                setFocusedInput(null);
              }}
              onChange={(e) => {
                if (e.target.value.includes(" ")) {
                  e.target.value = e.target.value.replace(/\s/g, "");
                  setErrorMessage("Spaces are not allowed in the password");
                }
                confirmPasswordOnChange(e);
              }}
              suppressHydrationWarning
              {...confirmPasswordFieldProps}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary)]"
              onClick={() => setShowConfirmPassword((value) => !value)}
              tabIndex={-1}
              suppressHydrationWarning
            >
              {showConfirmPassword ? (
                <FiEye className="w-5 h-5 text-[var(--primary)]" />
              ) : (
                <FiEyeOff className="w-5 h-5 text-[var(--primary)]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full py-3 rounded-lg font-medium text-xl mb-2 transition"
          disabled={!isValid}
        >
          SAVE PASSWORD
        </Button>
        <Button
          type="button"
          variant="neutral"
          size="lg"
          className="w-full py-2 rounded-lg text-xl font-medium text-[var(--primary-gray)] hover:underline"
          onClick={handleSkip}
        >
          SKIP FOR NOW
        </Button>
      </form>
    </Modal>
  );
}

