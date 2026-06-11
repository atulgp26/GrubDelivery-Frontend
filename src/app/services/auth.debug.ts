// Add this to your auth service file
import { makeRequest } from "@/services/request";

const DEBUG = true;

export default {
  login: async (data: { email: string; password: string }) => {
    console.log("🔐 authService.login called with:", { email: data.email, passwordLength: data.password.length });
    console.log("🌐 Making request to /login endpoint");

    try {
      const response = await makeRequest({
        method: "POST",
        url: "/login",
        data,
      });

      console.log("📥 authService.login response:", response);
      return response;
    } catch (error) {
      console.error("💥 authService.login error:", error);
      throw error;
    }
  },

  forgotPassword: async (data: { email: string }) => {
    console.log("🔐 authService.forgotPassword called with:", data);
    const response = await makeRequest({
      method: "POST",
      url: "/forgot-password",
      data,
    });
    console.log("📥 authService.forgotPassword response:", response);
    return response;
  },

  sendOtp: async (data: { email: string }) => {
    console.log("📱 authService.sendOtp called with:", data);
    const response = await makeRequest({
      method: "POST",
      url: "/send-otp",
      data,
    });
    console.log("📥 authService.sendOtp response:", response);
    return response;
  },

  resendOtp: async (data: { email: string }) => {
    console.log("🔄 authService.resendOtp called with:", data);
    const response = await makeRequest({
      method: "POST",
      url: "/resend-otp",
      data,
    });
    console.log("📥 authService.resendOtp response:", response);
    return response;
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    console.log("🔢 authService.verifyOtp called with:", { email: data.email, otpLength: data.otp.length });
    const response = await makeRequest({
      method: "POST",
      url: "/verify-otp",
      data,
    });
    console.log("📥 authService.verifyOtp response:", response);
    return response;
  },
};