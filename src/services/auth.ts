import type {
  LoginRequest,
  LoginResponse,
  SendOtpRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SetPasswordRequest,
} from "@/types/domain/auth";
import httpClient from "./httpClient";
import { AUTH_URLS } from "./urls/auth";

const authService = {
  async login(data: LoginRequest) {
    return httpClient.post<LoginResponse>(AUTH_URLS.LOGIN, data);
  },

  async sendOtp(data: SendOtpRequest) {
    return httpClient.post(AUTH_URLS.SEND_OTP, data);
  },

  async resendOtp(data: SendOtpRequest) {
    return httpClient.post(AUTH_URLS.RESEND_OTP, data);
  },

  async verifyOtp(data: VerifyOtpRequest) {
    return httpClient.post<VerifyOtpResponse>(AUTH_URLS.VERIFY_OTP, data);
  },

  async forgotPassword(data: ForgotPasswordRequest) {
    return httpClient.post(AUTH_URLS.FORGOT_PASSWORD, data);
  },

  async resetPassword(data: ResetPasswordRequest) {
    return httpClient.post(AUTH_URLS.RESET_PASSWORD, data);
  },

  async setPassword(data: SetPasswordRequest) {
    return httpClient.post(AUTH_URLS.SET_PASSWORD, data);
  },

  async logout() {
    return httpClient.post(AUTH_URLS.LOGOUT);
  },
};

export default authService;
