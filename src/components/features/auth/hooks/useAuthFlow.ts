"use client";

import { useRef } from "react";
import { useAuthModals } from "./useAuthModals";
import { useOtpState } from "./useOtpState";
import { useAuthActions } from "./useAuthActions";

export function useAuthFlow({
	setAlertMessage,
	onAlert,
	rememberMe = false,
}: {
	setAlertMessage?: (message: string | null) => void;
	onAlert?: (message: string) => void;
	rememberMe?: boolean;
} = {}) {
	const formRef = useRef<HTMLFormElement | null>(null);
	const modals = useAuthModals();
	const otpState = useOtpState(modals.otpVerifyModalOpen);
	const actions = useAuthActions({
		modals,
		otpState,
		setAlertMessage,
		rememberMe,
	});

	return {
		formRef,
		...modals,
		...otpState,
		...actions,
	};
}
