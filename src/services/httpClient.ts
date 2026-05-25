import { makeRequest } from "./request";
import type { ApiResponse } from "./request";

function isQueryValueEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) {
    return value.every((item) => isQueryValueEmpty(item));
  }
  return false;
}

function buildQueryString(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (isQueryValueEmpty(value)) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (!isQueryValueEmpty(v)) {
          search.append(key, String(v).trim());
        }
      });
    } else {
      const serialized =
        typeof value === "string" ? value.trim() : String(value);
      search.append(key, serialized);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

const httpClient = {
  async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${url}${buildQueryString(params ?? {})}`;
    return makeRequest<T>({ method: "GET", url: fullUrl });
  },

  async post<T = unknown>(
    url: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return makeRequest<T>({
      method: "POST",
      url,
      ...(data !== undefined ? { data } : {}),
    });
  },

  async put<T = unknown>(
    url: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return makeRequest<T>({
      method: "PUT",
      url,
      ...(data !== undefined ? { data } : {}),
    });
  },

  async patch<T = unknown>(
    url: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return makeRequest<T>({
      method: "PATCH",
      url,
      ...(data !== undefined ? { data } : {}),
    });
  },

  async delete<T = unknown>(
    url: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return makeRequest<T>({
      method: "DELETE",
      url,
      ...(data ? { data } : {}),
    });
  },
};

export default httpClient;
