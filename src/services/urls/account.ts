const ACCOUNT_BASE = "/delivery/account";

export const ACCOUNT_URLS = {
	ME: `${ACCOUNT_BASE}/me`,
	MY_GRUBPACS: `${ACCOUNT_BASE}/mygrubpacs`,
	TRANSFER_OWNERSHIP: `${ACCOUNT_BASE}/transfer-ownership`,
	TRANSFER_OWNERSHIP_VERIFY: `${ACCOUNT_BASE}/transfer-ownership/verify`,
	UPDATE: ACCOUNT_BASE,
	CONFIRM: `${ACCOUNT_BASE}/confirm`,
	RESEND_OTP: `${ACCOUNT_BASE}/update/resend-otp`,
	DELETE_OTP: `${ACCOUNT_BASE}/delete/otp`,
	DELETE_RESEND_OTP: `${ACCOUNT_BASE}/delete/resend-otp`,
	DELETE: ACCOUNT_BASE,
} as const;
