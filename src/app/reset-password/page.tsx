"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordModal } from "@/components/features/auth/modals/ResetPasswordModal";
import { showSuccess, showError } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/errors";
import authService from "@/services/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidParams, setIsValidParams] = useState<boolean | null>(null);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token && email) {
      setIsValidParams(true);
    } else {
      setIsValidParams(false);
    }
  }, [token, email]);

  const handleSavePassword = async (password: string) => {
    if (!token || !email) {
      showError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    try {
      await authService.resetPassword({
        email: decodeURIComponent(email),
        token,
        password,
      });

      showSuccess("Password has been reset successfully", "");
      router.push("/auth");
    } catch (error) {
      showError(
        getApiErrorMessage(error, "Failed to reset password. Please try again."),
      );
    }
  };

  const handleClose = () => {
    router.push("/auth");
  };

  if (isValidParams === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-[var(--gp-color-text-neutral-secondary)]">
          Loading...
        </div>
      </div>
    );
  }

  if (isValidParams === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white p-6">
        <h1 className="text-xl font-semibold text-[var(--gp-color-text-primary)]">
          Invalid or expired link
        </h1>
        <p className="text-[var(--gp-color-text-neutral-secondary)] text-center max-w-md">
          This password reset link is invalid or has expired. Please request a
          new one from the login page.
        </p>
        <a
          href="/auth"
          className="text-[var(--gp-color-brand-primary)] font-medium hover:underline"
        >
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <ResetPasswordModal
        open={true}
        onClose={handleClose}
        onSave={handleSavePassword}
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-pulse text-[var(--gp-color-text-neutral-secondary)]">
            Loading...
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
