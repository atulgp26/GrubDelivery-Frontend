import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { getAuthToken, clearAuthCookies } from "@/utils/cookies";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
	headers: { "Content-Type": "application/json" },
	timeout: 30000,
});

api.interceptors.request.use((config) => {
	const token = getAuthToken();
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		const url = error.config?.url;

		// Don't redirect for login request
		if (status === 401 && !url?.includes("/login")) {
			clearAuthCookies();
			window.location.href = "/auth";
		}
		return Promise.reject(error);
	},
);

interface ApiEnvelope<T = unknown> {
  success?: boolean;
  is_otp?: boolean;
  code?: number;
  data?: T;
  pagination?: Record<string, unknown>;
  message?: string;
  error?: string;
  message_toast_title?: string;
  message_toast_description?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  is_otp?: boolean;
  data?: T;
  pagination?: Record<string, unknown>;
  status: number;
  code?: number;
  message?: string;
  error?: string;
  message_toast_title?: string;
  message_toast_description?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractErrorMessage(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;

  const error = value.error;
  if (typeof error === "string" && error.trim()) return error;

  const message = value.message;
  if (typeof message === "string" && message.trim()) return message;

  return undefined;
}

export async function makeRequest<T = unknown>(
	config: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<unknown> = await api(config);
    const rawEnvelope = response.data;

    if (!isRecord(rawEnvelope) || typeof rawEnvelope.success !== "boolean") {
      return {
        success: false,
        status: response.status,
        error: "Unexpected API response format",
      };
    }

    const envelope = rawEnvelope as ApiEnvelope<T>;

    const message =
      typeof envelope.message === "string" ? envelope.message : undefined;
    const error =
      typeof envelope.error === "string" ? envelope.error : undefined;

    if (!envelope.success) {
      return {
        success: false,
        is_otp: envelope.is_otp,
        status: response.status,
        code: typeof envelope.code === "number" ? envelope.code : undefined,
        message,
        error: error ?? message ?? "Request failed",
        message_toast_title: envelope.message_toast_title,
        message_toast_description: envelope.message_toast_description,
      };
    }

    return {
      success: true,
      is_otp: envelope.is_otp,
      data: envelope.data as T | undefined,
      pagination: isRecord(envelope.pagination) ? envelope.pagination : undefined,
      status: response.status,
      code: typeof envelope.code === "number" ? envelope.code : undefined,
      message,
      error,
      message_toast_title: envelope.message_toast_title,
      message_toast_description: envelope.message_toast_description,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const responseBody = error.response?.data;
      const responseMessage = extractErrorMessage(responseBody);

      return {
        success: false,
        status,
        error:
          responseMessage ??
          (typeof error.message === "string" && error.message
            ? error.message
            : "Network request failed"),
      };
    }

    return {
      success: false,
      status: 0,
      error: "Unexpected request failure",
    };
  }
}

export default api;
