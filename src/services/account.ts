import type { AccountProfileData } from "@/components/features/account/types";
import httpClient from "./httpClient";
import { ACCOUNT_URLS } from "./urls/account";

export interface UpdateAccountRequest {
  full_name: string;
  country_code: string;
  phone: string;
  organization_name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdatePhoneRequest {
  country_code: string;
  phone: string;
}

export interface ConfirmOtpRequest {
  otp: string;
  otp_id?: string;
}

export interface DeleteAccountRequest {
  otp: string;
  otp_id?: string;
}

export interface AccountMyGrubPac {
  id: string;
  name: string;
  box_display_id?: string | null;
  power_status?: string | null;
  vehicle_number?: string | null;
  created_at?: string | null;
  status?: string;
}

export interface AccountMyGrubPacsData {
  boxes: AccountMyGrubPac[];
  count: number;
}

export interface GetMyGrubPacsParams {
  query?: string;
  power_status?: "on" | "off";
}

export interface TransferOwnershipRequest {
  transfer_mode: "all" | "selected";
  ids?: string[];
  name: string;
  organization_name: string;
  country_code: string;
  phone: string;
  email: string;
  country: string;
  state: string;
}

export interface TransferOwnershipResponseData {
  otp_id: string;
}

export interface VerifyTransferOwnershipRequest {
  otp: string;
  otp_id?: string;
}

const accountService = {
  async getProfile() {
    return httpClient.get<AccountProfileData>(ACCOUNT_URLS.ME);
  },

  async getMyGrubPacs(params?: GetMyGrubPacsParams) {
    const queryParams: Record<string, unknown> | undefined = params
      ? { ...params }
      : undefined;

    return httpClient.get<AccountMyGrubPacsData>(ACCOUNT_URLS.MY_GRUBPACS, queryParams);
  },

  async transferOwnership(body: TransferOwnershipRequest) {
    return httpClient.post<TransferOwnershipResponseData>(ACCOUNT_URLS.TRANSFER_OWNERSHIP, body);
  },

  async verifyTransferOwnership(body: VerifyTransferOwnershipRequest) {
    return httpClient.post<unknown>(ACCOUNT_URLS.TRANSFER_OWNERSHIP_VERIFY, body);
  },

  async updateProfile(body: UpdateAccountRequest) {
    return httpClient.put<unknown>(ACCOUNT_URLS.UPDATE, body);
  },

  async changePassword(body: ChangePasswordRequest) {
    return httpClient.put<unknown>(ACCOUNT_URLS.UPDATE, body);
  },

  async updateEmail(body: UpdateEmailRequest) {
    return httpClient.put<unknown>(ACCOUNT_URLS.UPDATE, body);
  },

  async updatePhone(body: UpdatePhoneRequest) {
    return httpClient.put<unknown>(ACCOUNT_URLS.UPDATE, body);
  },

  async confirmOtp(body: ConfirmOtpRequest) {
    return httpClient.patch<unknown>(ACCOUNT_URLS.CONFIRM, body);
  },

  async resendOtp() {
    return httpClient.patch<unknown>(ACCOUNT_URLS.RESEND_OTP, {});
  },

  async requestDeleteAccountOtp() {
    return httpClient.post<{ otp_id: string }>(ACCOUNT_URLS.DELETE_OTP, {});
  },

  async resendDeleteAccountOtp(otp_id?: string) {
    return httpClient.patch<{ otp_id: string }>(ACCOUNT_URLS.DELETE_RESEND_OTP, { otp_id });
  },

  async deleteAccount(body: DeleteAccountRequest) {
    return httpClient.delete<unknown>(ACCOUNT_URLS.DELETE, body);
  },
};

export default accountService;
