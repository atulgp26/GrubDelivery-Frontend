import httpClient from "./httpClient";
import { GRUBLOCK_URLS } from "./urls/grublock";
import type { ApiResponse } from "./request";
import type {
  GrubLockActionBody,
  GrubLockActionResult,
  GrubLockListParams,
  GrubLockListData,
  GrubLockRecipientPayload,
  GrubLockSearchItem,
  GrubLockSearchParams,
  GrubLockUnlockOtpResult,
  GrubLockUnlockVerifyBody,
  GrubLockUnlockVerifyResult,
} from "@/types/domain/grublock";

function sanitizeIds(ids: string[]): string[] {
  return ids
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

function failResponse<T = unknown>(error: string, status = 400): ApiResponse<T> {
  return {
    success: false,
    status,
    error,
  };
}

const grublockService = {
  async getList(params?: GrubLockListParams) {
    return httpClient.get<GrubLockListData>(
      GRUBLOCK_URLS.LIST,
      params as Record<string, unknown>,
    );
  },

  async search(params: GrubLockSearchParams) {
    return httpClient.get<GrubLockSearchItem[]>(
      GRUBLOCK_URLS.SEARCH,
      params as unknown as Record<string, unknown>,
    );
  },

  async lock(ids: string[]) {
    const sanitizedIds = sanitizeIds(ids);
    if (sanitizedIds.length === 0) {
      return failResponse<GrubLockActionResult>("Please provide valid box ids");
    }
    return httpClient.patch<GrubLockActionResult>(GRUBLOCK_URLS.LOCK, { ids: sanitizedIds });
  },

  async unlock(ids: string[]) {
    const sanitizedIds = sanitizeIds(ids);
    if (sanitizedIds.length === 0) {
      return failResponse<GrubLockUnlockOtpResult>("Please provide valid box ids");
    }
    return httpClient.patch<GrubLockUnlockOtpResult>(GRUBLOCK_URLS.UNLOCK, { ids: sanitizedIds });
  },

  async verifyUnlockOtp(data: GrubLockUnlockVerifyBody) {
    if (!data.otp_id?.trim() || !data.otp?.trim()) {
      return failResponse<GrubLockUnlockVerifyResult>("Please provide a valid otp and otp id");
    }

    return httpClient.patch<GrubLockUnlockVerifyResult>(GRUBLOCK_URLS.UNLOCK_VERIFY, {
      otp_id: data.otp_id.trim(),
      otp: data.otp.trim(),
    });
  },

  async emergencyUnlock(data: GrubLockActionBody) {
    const sanitizedIds = sanitizeIds(data.ids);
    const reason = data.reason?.trim();

    if (sanitizedIds.length === 0) {
      return failResponse<GrubLockActionResult>("Please provide valid box ids");
    }

    if (!reason) {
      return failResponse<GrubLockActionResult>("Please provide a reason for emergency unlock");
    }

    return httpClient.patch<GrubLockActionResult>(GRUBLOCK_URLS.EMERGENCY_UNLOCK, {
      ids: sanitizedIds,
      reason,
    });
  },

  async lockBox(id: string, payload: GrubLockRecipientPayload) {
    const sanitizedIds = sanitizeIds([id]);
    const consumer_full_name = payload.name?.trim();
    const consumer_phone = payload.phone?.trim();
    const consumer_country_code = payload.countryCode?.trim();

    if (
      sanitizedIds.length === 0 ||
      !consumer_full_name ||
      !consumer_phone ||
      !consumer_country_code
    ) {
      return failResponse<GrubLockActionResult>("Please provide valid recipient details");
    }

    return httpClient.patch<GrubLockActionResult>(GRUBLOCK_URLS.LOCK, {
      ids: sanitizedIds,
      consumer_full_name,
      consumer_phone,
      consumer_country_code,
    });
  },

  async unlockBox(id: string) {
    return this.unlock([id]);
  },

  async emergencyUnlockBox(id: string, reason: string) {
    return this.emergencyUnlock({ ids: [id], reason });
  },

  async updateRecipient(
    id: string,
    payload: { name: string; phone: string; countryCode: string; keepLocked?: boolean },
  ) {
    return this.lockBox(id, {
      name: payload.name,
      phone: payload.phone,
      countryCode: payload.countryCode,
    });
  },
};

export default grublockService;
