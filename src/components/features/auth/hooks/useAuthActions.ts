"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { showError, showSuccess } from "@/components/ui/toast";
import { sanitizeEmail } from "@/lib/utils/email";
import { getApiErrorMessage, getContextualErrorMessage } from "@/lib/errors";
import { setAuthCookies } from "@/utils/cookies";
import authService from "@/services/auth";
import type { LoginFormValues } from "@/types";
import type { AuthModals } from "./useAuthModals";
import type { OtpState } from "./useOtpState";

interface UseAuthActionsParams {
	modals: AuthModals;
	otpState: OtpState;
	setAlertMessage?: (message: string | null) => void;
}

export function useAuthActions({
	modals,
	otpState,
	setAlertMessage,
}: UseAuthActionsParams) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [loginLoading, setLoginLoading] = useState(false);
	const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
	const [otpLoading, setOtpLoading] = useState(false);
	const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);

	const handleLogin = async (data: LoginFormValues, rememberMe = false) => {
		try {
			setLoginLoading(true);
			const normalizedEmail = sanitizeEmail(data.email);
			const response = await authService.login({
				email: normalizedEmail,
				password: data.password,
				remember_me: rememberMe,
			});

			if (!response.success || !response.data) {
				throw new Error(response.error || "Login failed. Please try again.");
			}

			const { auth_token, is_password_set, client_id } = response.data;
			setAuthCookies(auth_token, client_id, { rememberMe });
			queryClient.removeQueries({ queryKey: ["account", "profile"] });

			showSuccess("Login successful!", "");

			if (!is_password_set) {
				router.replace(
					`/dashboard?showPasswordModal=true&email=${encodeURIComponent(
						normalizedEmail,
					)}`,
				);
			} else {
				router.replace("/dashboard");
			}
		} catch (error) {
			const message = getApiErrorMessage(
				error,
				"Login failed. Please try again.",
			);

			setAlertMessage?.(message);
		} finally {
			setLoginLoading(false);
		}
	};

	const handleForgotPassword = async (email: string) => {
		try {
			setForgotPasswordLoading(true);
			const normalizedEmail = sanitizeEmail(email);

			const response = await authService.forgotPassword({ email: normalizedEmail });

			if (response.success) {
				showSuccess(
					"Password reset link has been sent",
					""
				);
				modals.setForgotPasswordModalOpen(false);
			} else {
				showError(response.error ?? "Failed to send reset link.");
			}
		} catch (error) {
			showError(getApiErrorMessage(error, "Failed to send reset link."));
		} finally {
			setForgotPasswordLoading(false);
		}
	};

	const handleOtpLogin = async (email: string) => {
		try {
			setOtpLoading(true);

			const normalizedEmail = sanitizeEmail(email);

			const response = await authService.sendOtp({ email: normalizedEmail });

			if (response.success) {
				showSuccess("OTP has been sent successfully", "");
				otpState.setOtpEmail(normalizedEmail);
				modals.setOtpModalOpen(false);
				modals.setOtpVerifyModalOpen(true);
				otpState.resetOtp();
			} else {
				showError(response.error ?? "Failed to send OTP");
			}
		} catch (error) {
			showError(getApiErrorMessage(error, "Failed to send OTP"));
		} finally {
			setOtpLoading(false);
		}
	};

	const handleResendOtp = async () => {
		try {
			setOtpLoading(true);

			const normalizedEmail = sanitizeEmail(otpState.otpEmail);
			otpState.resetOtp();
			otpState.otpRefs[0]?.current?.focus();

			const response = await authService.resendOtp({ email: normalizedEmail });

			if (response.success) {
				showSuccess("OTP has been sent successfully", "");
				otpState.setTimer(12);
			} else {
				showError(
					getContextualErrorMessage(
						"otp.resend",
						response,
						"Unable to resend OTP right now. Please try again.",
					),
				);
			}
		} catch (error) {
			showError(
				getContextualErrorMessage(
					"otp.resend",
					error,
					"Unable to resend OTP right now. Please try again.",
				),
			);
		} finally {
			setOtpLoading(false);
		}
	};

	const handleOtpVerify = async () => {
		const enteredOtp = otpState.otp.join("");

		if (enteredOtp.length !== 4) {
			showError("Please enter a valid 4 digit OTP");
			return;
		}

		try {
			setVerifyOtpLoading(true);

			const response = await authService.verifyOtp({
				email: otpState.otpEmail,
				otp: enteredOtp,
			});

			if (!response.success || !response.data) {
				showError(
					getContextualErrorMessage(
						"otp.verify.login",
						response,
						"We could not verify the OTP. Please try again.",
					),
				);
				return;
			}

			setAuthCookies(response.data.auth_token);
			queryClient.removeQueries({ queryKey: ["account", "profile"] });

			showSuccess("OTP verified successfully!", "");
			modals.setOtpVerifyModalOpen(false);

			if (!response.data.is_password_set) {
				router.replace(
					`/dashboard?showPasswordModal=true&email=${encodeURIComponent(
						otpState.otpEmail,
					)}`,
				);
			} else {
				router.replace("/dashboard");
			}
		} catch (error) {
			showError(
				getContextualErrorMessage(
					"otp.verify.login",
					error,
					"We could not verify the OTP. Please try again.",
				),
			);
		} finally {
			setVerifyOtpLoading(false);
		}
	};

	return {
		loginLoading,
		forgotPasswordLoading,
		otpLoading,
		verifyOtpLoading,
		handleLogin,
		handleOtpLogin,
		handleForgotPassword,
		handleResendOtp,
		handleOtpVerify,
	};
}
