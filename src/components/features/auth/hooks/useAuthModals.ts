"use client";

import { useState } from "react";

export function useAuthModals() {
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpVerifyModalOpen, setOtpVerifyModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [newPasswordModalOpen, setNewPasswordModalOpen] = useState(false);
  const [isForgotPasswordFlow, setIsForgotPasswordFlow] = useState(false);

  return {
    otpModalOpen,
    setOtpModalOpen,
    otpVerifyModalOpen,
    setOtpVerifyModalOpen,
    forgotPasswordModalOpen,
    setForgotPasswordModalOpen,
    newPasswordModalOpen,
    setNewPasswordModalOpen,
    isForgotPasswordFlow,
    setIsForgotPasswordFlow,
  };
}

export type AuthModals = ReturnType<typeof useAuthModals>;
