import { useEffect, useRef, useState } from "react";
import { showError, showSuccess } from "@/components/ui/toast";
import { getApiErrorMessage, getContextualErrorMessage } from "@/lib/errors";
import { useOtpTimer } from "@/components/features/account/hooks/useOtpTimer";
import type { EditFields } from "@/components/features/account/types";

export type { EditFields };

export type PasswordFields = {
  current: string;
  new: string;
  confirm: string;
};

export type SendOtpFn = (
  field: "email" | "contact",
  value: string,
) => Promise<void>;

export type ConfirmOtpFn = (otp: string) => Promise<void>;

const isNameValid = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
};

const isEmailValid = (value: string): boolean => {
  const trimmed = value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return false;
  }
  const parts = trimmed.split(".");
  const tld = parts[parts.length - 1].toLowerCase();
  const domainPart = trimmed.split("@")[1]?.toLowerCase() || "";
  
  const isComTld = (tld === "com");
  const isYahooOrOutlook = domainPart.includes("yahoo") || domainPart.includes("outlook");
  
  return isComTld || isYahooOrOutlook;
};

const normalizeIndianContact = (value: string): string | null => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return null;
};

const isOrganisationValid = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
};

const getFieldValidationError = (
  fieldName: keyof EditFields,
  value: string,
): string | null => {
  if (fieldName === "name") {
    if (!isNameValid(value)) {
      return "Name must be between 1 and 50 characters";
    }
    return null;
  }

  if (fieldName === "email") {
    if (!value || value.trim().length === 0) {
      return "Email field must have at least 1 character";
    }
    if (!isEmailValid(value)) {
      return "Please enter a valid email address";
    }
    return null;
  }

  if (fieldName === "contact") {
    if (!value || value.trim().length === 0) {
      return "Contact field must have at least 1 character";
    }
    if (!normalizeIndianContact(value)) {
      return "Contact must include +91 country code and exactly 10 digits";
    }
    return null;
  }

  if (fieldName === "facility") {
    if (!isOrganisationValid(value)) {
      return "Organisation must be between 1 and 100 characters";
    }
    return null;
  }

  return null;
};

const hasFieldValueChanged = (
  fieldName: keyof EditFields,
  currentValue: string,
  nextValue: string,
): boolean => {
  if (fieldName === "contact") {
    return normalizeIndianContact(currentValue) !== normalizeIndianContact(nextValue);
  }
  return currentValue !== nextValue;
};

export function useEditProfile({
  open,
  initialFields,
  onClose,
  onSave,
  onPasswordChange,
  onSendOtp,
  onConfirmOtp,
  onResendOtp,
  onAlert,
  onAlertError,
}: {
  open: boolean;
  initialFields: EditFields;
  onClose: () => void;
  onSave: (payload?: {
    name?: string;
    contact?: string;
    facility?: string;
    email?: string;
  }) => Promise<any> | void;
  onPasswordChange?: (passwords: PasswordFields) => Promise<void>;
  onSendOtp?: SendOtpFn;
  onConfirmOtp?: ConfirmOtpFn;
  onResendOtp?: () => Promise<void>;
  onAlert?: (message: string) => void;
  onAlertError?: (message: string) => void;
}) {
  const [editedFields, setEditedFields] = useState<Set<keyof EditFields>>(
    new Set(),
  );
  const [currentFields, setCurrentFields] = useState<EditFields>(initialFields);
  const [editingField, setEditingField] = useState<keyof EditFields | null>(
    null,
  );
  const [tempValue, setTempValue] = useState<string>("");
  const [fieldAwaitingVerification, setFieldAwaitingVerification] =
    useState<keyof EditFields | null>(null);
  const [pendingProfilePayload, setPendingProfilePayload] = useState<{
    name?: string;
    contact?: string;
    facility?: string;
  } | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<Array<"email" | "contact">>([]);
  const otpRefs: Array<React.RefObject<HTMLInputElement | null>> = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    seconds: timer,
    start: startOtpTimer,
    reset: resetOtpTimer,
  } = useOtpTimer(60);

  useEffect(() => {
    if (open && initialFields) {
      let formattedContact = initialFields.contact || "";
      if (formattedContact && !formattedContact.startsWith("+")) {
        const digits = formattedContact.replace(/\D/g, "");
        if (digits.length === 10) {
          formattedContact = `+91 ${digits}`;
        } else if (digits.length > 10) {
          formattedContact = `+${digits}`;
        }
      }

      setCurrentFields({
        name: initialFields.name || "",
        email: initialFields.email || "",
        contact: formattedContact,
        password: initialFields.password || "**********",
        facility: initialFields.facility || "",
      });

      setEditedFields(new Set());
      setEditingField(null);
      setTempValue("");
    } else if (!open) {
      setOtpError(false);
      setApiError(null);
      setOtp(["", "", "", ""]);
      resetOtpTimer();
    }
  }, [open, initialFields, resetOtpTimer]);

  const sendOtpForField = async (
    field: "email" | "contact",
    value: string,
    previousValue?: string,
  ) => {
    if (!onSendOtp) return;
    setIsSendingOtp(true);
    try {
      await onSendOtp(field, value);
      setFieldAwaitingVerification(field);
      setPendingVerifications([field]);
      setShowOtpModal(true);
      setOtp(["", "", "", ""]);
      startOtpTimer();
    } catch (err) {
      if (previousValue !== undefined) {
        setCurrentFields((prev) => ({ ...prev, [field]: previousValue }));
        setEditedFields((prev) => {
          const next = new Set(prev);
          next.delete(field);
          return next;
        });
      }
      showError(
        getContextualErrorMessage(
          "otp.resend",
          err,
          "Unable to send OTP right now. Please try again.",
        ),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleFieldEdit = (fieldName: keyof EditFields) => {
    if (editingField && editingField !== fieldName) {
      if (commitPendingEdits() === "ERROR") return;
    }

    setEditingField(fieldName);
    if (fieldName === "contact") {
      const normalized = normalizeIndianContact(currentFields.contact);
      setTempValue(normalized ?? "");
      return;
    }
    setTempValue(currentFields[fieldName]);
  };

  const handleFieldSave = (fieldName: keyof EditFields) => {
    if (hasFieldValueChanged(fieldName, currentFields[fieldName], tempValue)) {
      const validationError = getFieldValidationError(fieldName, tempValue);
      if (validationError) {
        showError(validationError);
        onAlertError?.(validationError);
        return false;
      }

      const newValue =
        fieldName === "contact"
          ? `+91 ${normalizeIndianContact(tempValue) ?? ""}`
          : tempValue;
      setCurrentFields((prev) => ({ ...prev, [fieldName]: newValue }));
      setEditedFields((prev) => new Set([...prev, fieldName]));

      if (fieldName === "email" || fieldName === "contact") {
        setEditingField(null);
        setTempValue("");
        return true;
      }
    }
    setEditingField(null);
    setTempValue("");
    return true;
  };

  const commitPendingEdits = ():
    | { field: keyof EditFields; value: string }
    | "ERROR"
    | null => {
    if (
      editingField &&
      hasFieldValueChanged(editingField, currentFields[editingField], tempValue)
    ) {
      const validationError = getFieldValidationError(editingField, tempValue);
      if (validationError) {
        showError(validationError);
        onAlertError?.(validationError);
        return "ERROR";
      }

      const committedValue =
        editingField === "contact"
          ? `+91 ${normalizeIndianContact(tempValue) ?? ""}`
          : tempValue;

      setCurrentFields((prev) => ({ ...prev, [editingField]: committedValue }));
      setEditedFields((prev) => new Set([...prev, editingField]));
      const committedField = editingField;
      setEditingField(null);
      setTempValue("");
      return { field: committedField, value: committedValue };
    }
    setEditingField(null);
    setTempValue("");
    return null;
  };

  const handleSaveChanges = async () => {
    const justCommitted = commitPendingEdits();
    if (justCommitted === "ERROR") return;

    const nextFields =
      justCommitted
        ? { ...currentFields, [justCommitted.field]: justCommitted.value }
        : currentFields;

    const allChanged = new Set([
      ...Array.from(editedFields),
      ...(justCommitted ? [justCommitted.field] : []),
    ]);

    for (const field of Array.from(allChanged)) {
      const val = nextFields[field];
      const err = getFieldValidationError(field, val);
      if (err) {
        showError(err);
        return;
      }
    }

    if (allChanged.has("password")) {
      setShowPasswordModal(true);
      return;
    }

    if (allChanged.size > 0) {
      setIsSaving(true);
      try {
        const response: any = await onSave({
          name: nextFields.name,
          contact: nextFields.contact,
          facility: nextFields.facility,
          email: nextFields.email,
        });

        if (response?.success && response?.is_otp) {
          const otpType = response.data?.otp_details?.type;
          
          let queue: Array<"email" | "contact"> = [];
          if (otpType === "email") queue = ["email"];
          else if (otpType === "phone" || otpType === "contact") queue = ["contact"];
          else if (otpType === "both") queue = ["contact", "email"];
          
          if (queue.length > 0) {
            setPendingVerifications(queue);
            setShowOtpModal(true);
            setOtp(["", "", "", ""]);
            startOtpTimer();
          }
        }
      } catch (err) {
        // Error handling is managed by useAccount.ts toasts.
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleOtpVerify = async () => {
    setApiError(null);
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) {
      showError("Please enter a valid 4-digit OTP");
      setOtpError(true);
      return;
    }

    try {
      let res: any;
      if (onConfirmOtp) {
        res = await onConfirmOtp(enteredOtp);
      }
      
      const nextPending = pendingVerifications.slice(1);
      if (nextPending.length > 0) {
        setPendingVerifications(nextPending);
        setOtp(["", "", "", ""]);
        setOtpError(false);
        setApiError(null);
        resetOtpTimer();
        startOtpTimer();
        return; // wait for next OTP
      }

      resetOtpTimer();
      const title = res?.message_toast_title ?? "Profile updated!";
      const description = res?.message_toast_description ?? "Your profile information has been updated successfully.";
      
      showSuccess(title, description);
      
      setShowOtpModal(false);
      setPendingVerifications([]);

      if (fieldAwaitingVerification) {
        setEditedFields((prev) => {
          const next = new Set(prev);
          next.delete(fieldAwaitingVerification);
          return next;
        });
      }
      setFieldAwaitingVerification(null);
      setPendingProfilePayload(null);
      setOtp(["", "", "", ""]);
      onClose();
    } catch (err) {
      const msg = getContextualErrorMessage(
        "otp.verify.profile",
        err,
        "We could not verify the OTP. Please try again.",
      );
      setApiError(msg);
      setOtpError(true);
      setOtp(["", "", "", ""]);
      if (otpRefs.length > 0 && otpRefs[0].current) {
        otpRefs[0].current.focus();
      }
    }
  };

  const handleOtpBack = () => {
    resetOtpTimer();
    setShowOtpModal(false);
    setOtp(["", "", "", ""]);
    setOtpError(false);
    setApiError(null);
    setPendingVerifications([]);

    if (fieldAwaitingVerification) {
      setCurrentFields((prev) => ({
        ...prev,
        [fieldAwaitingVerification]: initialFields[fieldAwaitingVerification] || "",
      }));
      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete(fieldAwaitingVerification);
        return next;
      });
    }
    setFieldAwaitingVerification(null);
    setPendingProfilePayload(null);
  };

  const handleOtpResend = async () => {
    if (!onResendOtp) return;
    try {
      await onResendOtp();
      startOtpTimer();
      setOtp(["", "", "", ""]);
      setOtpError(false);
      if (otpRefs.length > 0 && otpRefs[0].current) {
        otpRefs[0].current.focus();
      }
    } catch (err) {
      showError(
        getContextualErrorMessage(
          "otp.resend",
          err,
          "Unable to resend OTP right now. Please try again.",
        ),
      );
    }
  };

  const handlePasswordSave = async (passwords: PasswordFields) => {
    try {
      if (onPasswordChange) {
        await onPasswordChange(passwords);
      }
      setShowPasswordModal(false);
      onClose();
      setFieldAwaitingVerification(null);
      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete("password");
        return next;
      });
    } catch (err) {
      showError(
        getApiErrorMessage(err, "Failed to change password"),
      );
    }
  };

  const handlePasswordBack = () => {
    setShowPasswordModal(false);
    setFieldAwaitingVerification(null);
  };

  const hasChanges =
    editedFields.size > 0 ||
    (editingField !== null &&
      hasFieldValueChanged(editingField, currentFields[editingField], tempValue));

  const currentVerification = pendingVerifications[0];
  const title = "Hold on!";
  let description = "To confirm your changes, enter the OTP sent to your updated details.";
  let otpEmail = "";
  
  if (currentVerification === "email") {
    description = `To confirm the change, enter the OTP sent to your updated email address - ${currentFields.email}`;
    otpEmail = currentFields.email;
  } else if (currentVerification === "contact") {
    description = `To confirm the change, enter the OTP sent to your updated contact number - ${currentFields.contact}`;
    otpEmail = currentFields.contact;
  }

  return {
    state: {
      editedFields,
      currentFields,
      editingField,
      tempValue,
      showOtpModal,
      otpEmail,
      otp,
      timer,
      otpError,
      apiError,
      otpRefs,
      title,
      description,
      showPasswordModal,
      hasChanges,
      isSendingOtp,
      isSaving,
    },
    setTempValue,
    setShowOtpModal,
    setShowPasswordModal,
    setOtp,
    setApiError,
    handleFieldEdit,
    handleFieldSave,
    handleSaveChanges,
    handleOtpVerify,
    handleOtpBack,
    handleOtpResend,
    handlePasswordSave,
    handlePasswordBack,
  };
}
