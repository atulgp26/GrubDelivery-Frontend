const AUTH_BASE = "/food/auth";

export const AUTH_URLS = {
  LOGIN: `${AUTH_BASE}/login`,
  SEND_OTP: `${AUTH_BASE}/send-otp`,
  RESEND_OTP: `${AUTH_BASE}/resend-otp`,
  VERIFY_OTP: `${AUTH_BASE}/verify-otp`,
  FORGOT_PASSWORD: `${AUTH_BASE}/forget-password/send`,
  RESET_PASSWORD: `${AUTH_BASE}/reset-password`,
  SET_PASSWORD: `${AUTH_BASE}/set-password`,
  LOGOUT: `${AUTH_BASE}/logout`,
} as const;
