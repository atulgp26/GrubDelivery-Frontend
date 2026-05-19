import axios from "axios";
import api from "./request";
import { LOGS_URLS } from "./urls/logs";
import type {
  SystemLogsDropdownData,
  SystemLogsListData,
  SystemLogsListRequest,
} from "@/types/domain/system-logs";

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function getValidFilters(payload?: SystemLogsListRequest) {
  if (!payload?.filters) return [];

  return payload.filters.filter((item) => {
    return typeof item?.category === "string" && item.category.trim() !== "";
  });
}

function buildLogsPostBody(payload?: SystemLogsListRequest): SystemLogsListRequest {
  const filters = getValidFilters(payload);
  const searchValue = payload?.query ?? payload?.search;

  return {
    limit: payload?.limit,
    page: payload?.page,
    search: searchValue,
    filters: filters.length > 0 ? filters : undefined,
    start_date: payload?.start_date,
    end_date: payload?.end_date,
    actor_id: payload?.actor_id,
    subject_id: payload?.subject_id,
    log_id: payload?.log_id,
    category: payload?.category,
  };
}

function normalizeLogsListData(
  envelope: {
    data?: {
      logs?: SystemLogsListData["logs"];
      page?: number | string;
      limit?: number | string;
      total?: number | string;
      count?: number | string;
    };
    pagination?: { total_count?: number | string };
  },
  payload?: SystemLogsListRequest,
): SystemLogsListData {
  const logs = Array.isArray(envelope.data?.logs) ? envelope.data.logs : [];
  const page = toNumber(envelope.data?.page) ?? payload?.page ?? 1;
  const limit = toNumber(envelope.data?.limit) ?? payload?.limit ?? 50;
  const totalFromPagination = toNumber(envelope.pagination?.total_count);
  const totalFromData = toNumber(envelope.data?.total);
  const totalFromCount = toNumber(envelope.data?.count);
  const total = totalFromPagination ?? totalFromData ?? totalFromCount ?? logs.length;

  return {
    logs,
    page,
    limit,
    total,
  };
}

const logsService = {
  async getList(payload?: SystemLogsListRequest) {
    try {
      const response = await api.post(LOGS_URLS.LIST, buildLogsPostBody(payload));
      const envelope = response.data as {
        success?: boolean;
        code?: number;
        message?: string;
        error?: string;
        data?: {
          logs?: SystemLogsListData["logs"];
          page?: number | string;
          limit?: number | string;
          total?: number | string;
          count?: number | string;
        };
        pagination?: { total_count?: number | string };
      };

      if (!envelope?.success) {
        return {
          success: false,
          status: response.status,
          code: envelope?.code,
          message: envelope?.message,
          error: envelope?.error ?? envelope?.message ?? "Failed to fetch logs",
        };
      }

      return {
        success: true,
        status: response.status,
        code: envelope.code,
        message: envelope.message,
        data: normalizeLogsListData(envelope, payload),
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { error?: string; message?: string } | undefined)?.error ||
          (error.response?.data as { error?: string; message?: string } | undefined)?.message ||
          error.message;

        return {
          success: false,
          status: error.response?.status ?? 0,
          error: message || "Network request failed",
        };
      }

      return {
        success: false,
        status: 0,
        error: "Unexpected request failure",
      };
    }
  },

  async getDropdowns() {
    try {
      const response = await api.get(LOGS_URLS.DROPDOWNS);
      const envelope = response.data as {
        success?: boolean;
        code?: number;
        message?: string;
        error?: string;
        data?: {
          categories?: string[];
          types?: string[];
          mapping?: Record<string, string[]>;
        };
      };

      if (!envelope?.success) {
        return {
          success: false,
          status: response.status,
          code: envelope?.code,
          message: envelope?.message,
          error: envelope?.error ?? envelope?.message ?? "Failed to fetch log dropdowns",
        };
      }

      return {
        success: true,
        status: response.status,
        code: envelope.code,
        message: envelope.message,
        data: {
          categories: Array.isArray(envelope.data?.categories) ? envelope.data.categories : [],
          types: Array.isArray(envelope.data?.types) ? envelope.data.types : [],
          mapping: envelope.data?.mapping ?? {},
        } satisfies SystemLogsDropdownData,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { error?: string; message?: string } | undefined)?.error ||
          (error.response?.data as { error?: string; message?: string } | undefined)?.message ||
          error.message;

        return {
          success: false,
          status: error.response?.status ?? 0,
          error: message || "Network request failed",
        };
      }

      return {
        success: false,
        status: 0,
        error: "Unexpected request failure",
      };
    }
  },
};

export default logsService;
