export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  auth_token: string;
  is_account_found: boolean;
  is_password_set: boolean;
  client_id: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  auth_token: string;
  otp_for_what: string;
  is_password_set?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export interface SetPasswordRequest {
  email: string;
  password: string;
  confirm_password: string;
  auth_token: string;
}
