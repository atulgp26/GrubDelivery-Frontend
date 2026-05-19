"use client";

import { useRef } from "react";
import { useAuthModals } from "./useAuthModals";
import { useOtpState } from "./useOtpState";
import { useAuthActions } from "./useAuthActions";

export function useAuthFlow({
	setAlertMessage,
	onAlert,
}: {
	setAlertMessage?: (message: string | null) => void;
	onAlert?: (message: string) => void;
} = {}) {
	const formRef = useRef<HTMLFormElement | null>(null);
	const modals = useAuthModals();
	const otpState = useOtpState(modals.otpVerifyModalOpen);
	const actions = useAuthActions({
		modals,
		otpState,
		setAlertMessage,
	});

	return {
		formRef,
		...modals,
		...otpState,
		...actions,
	};
}
