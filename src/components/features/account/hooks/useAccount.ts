import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/components/ui/toast";
import { getApiErrorMessage, getContextualErrorMessage } from "@/lib/errors";
import {
  ACCOUNT_ROLE_KEYS,
  normalizeAccountRoleKey,
  type AccountRoleKey,
} from "@/lib/constants/account";
import { clearAuthCookies, getAuthToken, getClientId } from "@/utils/cookies";
import accountService, {
  type ChangePasswordRequest,
  type UpdateAccountRequest,
} from "@/services/account";
import type {
  AccountProfileData,
  FieldsState,
  UserDataState,
} from "@/components/features/account/types";

const DEFAULT_FIELDS: FieldsState = {
  name: "",
  email: "",
  contact: "",
  password: "**********",
  facility: "",
};

function formatDate(dateString?: string): string {
  if (!dateString) return "Not specified";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Not specified";
  }
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function transformProfileData(data: AccountProfileData): {
  userData: UserDataState;
  fields: FieldsState;
  roleKey: AccountRoleKey;
} {
  const { employee, role } = data;
  const roleKey = normalizeAccountRoleKey(role);

  const formattedContact = employee.mobile_number
    ? `${employee.country_code || "+91"} ${employee.mobile_number}`
    : "Not provided";

  const userData: UserDataState = {
    name: employee.full_name || "Unknown",
    id: employee.client_id || employee.id,
    employeeDisplayId: employee.employee_display_id,
    basicDetails: {
      email: employee.email || "Not provided",
      contact: formattedContact,
      password: "**********",
    },
    professionalDetails: {
      role: formatRole(role || "No role assigned"),
      facility: employee.organization_name || "Not specified",
      joiningDate: formatDate(employee.created_at),
    },
    createdAt: formatDate(employee.created_at),
  };

  const fields: FieldsState = {
    name: employee.full_name || "",
    email: employee.email || "",
    contact: formattedContact,
    password: "**********",
    facility: employee.organization_name || "",
    joiningDate: employee.created_at || "",
  };

  return { userData, fields, roleKey };
}

function buildUpdateProfileBody(fields: {
  name: string;
  contact: string;
  facility?: string;
  email?: string;
}): UpdateAccountRequest {
  const full_name = (fields.name || "").trim();

  let country_code = "+91";
  let phone = "";
  const contact = (fields.contact || "").trim();
  const plusMatch = contact.match(/^(\+\d{1,4})\s*(.*)$/);
  if (plusMatch) {
    country_code = plusMatch[1];
    phone = (plusMatch[2] || "").replace(/\D/g, "");
  } else {
    phone = contact.replace(/\D/g, "");
  }

  const body: UpdateAccountRequest = {
    full_name,
    country_code,
    phone,
  };
  if (fields.facility !== undefined && fields.facility !== "") {
    body.organization_name = fields.facility.trim();
  }
  if (fields.email !== undefined && fields.email !== "") {
    body.email = fields.email.trim();
  }
  return body;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const deleteEligibilityStub = async (_email: string, _otp: string) => {
  return { success: true, code: 200 } as const;
};

const deleteAccountStub = async () => {
  return { success: true, code: 200 } as const;
};

export function useAccount() {
  const [modalState, setModalState] = useState({
    editOpen: false,
    deleteOpen: false,
    otpModalOpen: false,
    otpError: false,
  });

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [otpRefs] = useState<Array<React.RefObject<HTMLInputElement | null>>>([
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ]);

  const queryClient = useQueryClient();
  const authToken = getAuthToken();
  const clientId = getClientId();
  const updateModalState = (updates: Partial<typeof modalState>) =>
    setModalState((prev) => ({ ...prev, ...updates }));

  const profileQuery = useQuery({
    queryKey: ["account", "profile", clientId || "no-client", authToken || "no-token"],
    queryFn: () => accountService.getProfile(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profileData = useMemo(() => {
    const response = profileQuery.data;
    if (!response?.success || !response.data) return null;
    return transformProfileData(response.data);
  }, [profileQuery.data]);

  const userData = profileData?.userData ?? null;
  const fields = profileData?.fields ?? DEFAULT_FIELDS;
  const roleKey = profileData?.roleKey ?? ACCOUNT_ROLE_KEYS.unknown;
  const isLoading = profileQuery.isLoading;

  const updateProfileMutation = useMutation({
    mutationFn: (vars: { name: string; contact: string; facility?: string; email?: string }) =>
      accountService.updateProfile(buildUpdateProfileBody(vars)),
    onSuccess: async (res: any, variables) => {
      if (res.success) {
        if (!res.is_otp) {
          const nameChanged = variables.name !== fields.name;
          const facilityChanged = variables.facility !== undefined && variables.facility !== fields.facility && variables.facility !== "";

          if (facilityChanged && !nameChanged) {
            showSuccess("Organization updated", "");
          } else if (nameChanged && !facilityChanged) {
            showSuccess("Name has been updated", "");
          } else {
            showSuccess("Profile has been updated", "");
          }
          updateModalState({ editOpen: false });
          await queryClient.invalidateQueries({ queryKey: ["account", "profile"] });
        }
      } else {
        showError(res.error || "Failed to update profile");
      }
    },
    onError: (err: unknown) =>
      showError(getApiErrorMessage(err, "Failed to update profile")),
  });

  // TODO: Replace with real API when endpoint is available
  const eligibilityMutation = useMutation({
    mutationFn: (vars: { email: string; otp: string }) =>
      deleteEligibilityStub(vars.email, vars.otp),
  });

  // TODO: Replace with real API when endpoint is available
  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccountStub(),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (vars: ChangePasswordRequest) =>
      accountService.changePassword(vars),
  });

  const handleEditSave = async (payload?: {
    name?: string;
    contact?: string;
    facility?: string;
    email?: string;
  }) => {
    const toUse = {
      name: payload?.name ?? fields.name,
      contact: payload?.contact ?? fields.contact,
      facility: payload?.facility ?? fields.facility,
      email: payload?.email ?? fields.email,
    };
    return updateProfileMutation.mutateAsync(toUse);
  };

  const handlePasswordChange = async (passwords: {
    current: string;
    new: string;
    confirm: string;
  }): Promise<void> => {
    const res = await changePasswordMutation.mutateAsync({
      old_password: passwords.current,
      new_password: passwords.new,
      confirm_new_password: passwords.confirm,
    });
    if (!res.success) {
      throw new Error(res.error ?? "Failed to change password");
    }
    showSuccess("Password changed successfully!", "");
    await queryClient.invalidateQueries({ queryKey: ["account", "profile"] });
  };

  const handleSendOtp = async (
    field: "email" | "contact",
    value: string,
  ): Promise<void> => {
    let res;
    if (field === "email") {
      res = await accountService.updateEmail({ email: value });
    } else {
      const contact = value.trim();
      let country_code = "+91";
      let phone = "";
      const plusMatch = contact.match(/^(\+\d{1,4})\s*(.*)$/);
      if (plusMatch) {
        country_code = plusMatch[1];
        phone = (plusMatch[2] || "").replace(/\D/g, "");
      } else {
        phone = contact.replace(/\D/g, "");
      }
      res = await accountService.updatePhone({ country_code, phone });
    }
    if (!res.success) {
      throw new Error(res.error ?? "Failed to send OTP");
    }
    showSuccess("OTP has been sent successfully", "");
  };

  const handleConfirmOtp = async (otpCode: string): Promise<any> => {
    const res = await accountService.confirmOtp({ otp: otpCode });
    if (!res.success) {
      throw new Error(
        getContextualErrorMessage(
          "otp.verify.profile",
          res,
          "We could not verify the OTP. Please try again.",
        ),
      );
    }
    await queryClient.invalidateQueries({ queryKey: ["account", "profile"] });
    return res;
  };

  const handleResendOtp = async (): Promise<void> => {
    const res = await accountService.resendOtp();
    if (!res.success) {
      throw new Error(
        getContextualErrorMessage(
          "otp.resend",
          res,
          "Unable to resend OTP right now. Please try again.",
        ),
      );
    }
    showSuccess("OTP has been sent successfully", "");
  };

  const handleDelete = () => updateModalState({ deleteOpen: true });

  const handleDeleteAccount = () => {
    updateModalState({ deleteOpen: false, otpModalOpen: true, otpError: false });
    setOtp(["", "", "", ""]);
  };

  const handleOtpVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) {
      showError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      const email = userData?.basicDetails?.email || "";
      if (!email || !email.trim()) {
        showError("Email not found. Cannot proceed with account deletion.");
        return;
      }

      const eligibilityResponse = await eligibilityMutation.mutateAsync({
        email,
        otp: enteredOtp,
      });
      if (eligibilityResponse?.success && eligibilityResponse?.code === 200) {
        const deleteResponse = await deleteAccountMutation.mutateAsync();
        if (deleteResponse?.success && deleteResponse?.code === 200) {
          showSuccess("Account deleted successfully!", "");
          updateModalState({ otpModalOpen: false });
          clearAuthCookies();
          window.location.href = "/auth";
        } else {
          showError("Failed to delete account");
        }
      } else {
        updateModalState({ otpModalOpen: false });
      }
    } catch (error) {
      showError(
        getContextualErrorMessage(
          "otp.verify.account-delete",
          error,
          "We could not verify the OTP. Please try again.",
        ),
      );
      updateModalState({ otpError: true });
      setOtp(["", "", "", ""]);
      if (otpRefs.length > 0 && otpRefs[0].current) {
        otpRefs[0].current.focus();
      }
    }
  };

  return {
    state: modalState,
    updateState: updateModalState,
    profileQuery,
    fields,
    roleKey,
    userData,
    isLoading,
    otp,
    otpRefs,
    setOtp,
    handleEditSave,
    handlePasswordChange,
    handleSendOtp,
    handleConfirmOtp,
    handleResendOtp,
    handleDelete,
    handleDeleteAccount,
    handleOtpVerify,
  };
}
