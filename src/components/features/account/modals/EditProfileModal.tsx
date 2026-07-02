"use client";
import { useCallback } from "react";
import { showError } from "@/components/ui/toast";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import OtpVerifyModal from "@/components/features/auth/modals/OtpVerifyModal";
import PasswordChangeModal from "@/components/features/account/modals/PasswordChangeModal";
import FieldRow from "@/components/features/account/components/FieldRow";
import ContactFieldRow from "@/components/features/account/components/ContactFieldRow";
import { useEditProfile } from "@/components/features/account/hooks/useEditProfile";
import { ACCOUNT_EDITABLE_FIELDS_BY_ROLE } from "@/lib/constants/account";
import type { AccountRoleKey, EditFields } from "@/components/features/account/types";


type PasswordFields = {
  current: string;
  new: string;
  confirm: string;
};

type SendOtpFn = (field: "email" | "contact", value: string) => Promise<void>;
type ConfirmOtpFn = (otp: string) => Promise<void>;

type EditProfileModalProps = {
  open: boolean;
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
  fields?: EditFields;
  roleKey?: AccountRoleKey;
};

const canEditField = (roleKey: AccountRoleKey, field: keyof EditFields): boolean => {
  return ACCOUNT_EDITABLE_FIELDS_BY_ROLE[roleKey].includes(field);
};

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

const isContactValid = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return true;
  }
  return digits.length === 12 && digits.startsWith("91");
};

const isOrganisationValid = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
};

export default function EditProfileModal({
  open,
  onClose,
  onSave,
  onPasswordChange,
  onSendOtp,
  onConfirmOtp,
  onResendOtp,
  fields,
  roleKey = "unknown",
}: EditProfileModalProps) {
  const {
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
      isSaving,
    },
    setTempValue,
    setShowPasswordModal,
    setOtp,
    setApiError,
    handleFieldEdit,
    handleFieldSave,
    handleSaveChanges: handleSaveChangesHook,
    handleOtpVerify,
    handleOtpBack,
    handleOtpResend,
    handlePasswordSave,
    handlePasswordBack,
  } = useEditProfile({
    open,
    initialFields: fields as EditFields,
    onClose,
    onSave,
    onPasswordChange,
    onSendOtp,
    onConfirmOtp,
    onResendOtp,
  });

  const attemptEdit = (field: keyof EditFields) => {
    if (!canEditField(roleKey, field)) {
      showError("You can only edit your password for this role.");
      return;
    }
    handleFieldEdit(field);
  };

  const handleDismissApiError = useCallback(() => setApiError(null), [setApiError]);

  const handleFieldSaveWithAlert = (fieldName: keyof EditFields) => {
    handleFieldSave(fieldName);
  };

  const nameValidity = editingField === "name" ? isNameValid(tempValue) : true;
  const emailValidity = editingField === "email" ? isEmailValid(tempValue) : true;
  const contactValidity = editingField === "contact" ? isContactValid(tempValue) : true;
  const organisationValidity = editingField === "facility" ? isOrganisationValid(tempValue) : true;

  return (
    <>
      <Modal
        open={open && !showOtpModal && !showPasswordModal}
        onClose={onClose}
      >
        <div className="flex flex-col w-[604px] max-h-[600px] p-6 relative">
          <h2
            className="text-[24px] font-semibold leading-[32px] mt-8 text-center text-[var(--color-neutral-primary)] mb-2"
            style={{ fontVariantNumeric: "stacked-fractions" }}
          >
            Edit your profile
          </h2>
          <p
            className="text-[18px] font-normal leading-[28px] text-center text-[var(--color-neutral-secondary)] mb-6"
            style={{ fontVariantNumeric: "stacked-fractions" }}
          >
            Changes will be saved to your account and used across the app.
          </p>
          <div className="flex flex-col items-center flex-1 overflow-y-auto">
            <div className="w-full">
              <FieldRow
                label="Name"
                value={currentFields.name}
                onEdit={() => attemptEdit("name")}
                isEditing={editingField === "name"}
                tempValue={tempValue}
                onTempValueChange={setTempValue}
                onSave={() => handleFieldSaveWithAlert("name")}
                type="text"
                isValid={nameValidity}
              />
              <FieldRow
                label="Email"
                value={currentFields.email}
                onEdit={() => attemptEdit("email")}
                isEditing={editingField === "email"}
                tempValue={tempValue}
                onTempValueChange={setTempValue}
                onSave={() => handleFieldSave("email")}
                type="email"
                isValid={emailValidity}
              />
              <ContactFieldRow
                label="Contact"
                value={currentFields.contact}
                onEdit={() => attemptEdit("contact")}
                isEditing={editingField === "contact"}
                tempValue={tempValue}
                onTempValueChange={setTempValue}
                onSave={() => handleFieldSave("contact")}
                isValid={contactValidity}
              />
              <FieldRow
                label="Password"
                value={currentFields.password}
                onEdit={() => setShowPasswordModal(true)}
                isEditing={editingField === "password"}
                tempValue={tempValue}
                onTempValueChange={setTempValue}
                onSave={() => handleFieldSave("password")}
                type="password"
                disabledEdit={hasChanges && !editedFields.has("password") && editingField !== "password"}
              />
              <FieldRow
                label="Organisation"
                value={currentFields.facility}
                onEdit={() => attemptEdit("facility")}
                isEditing={editingField === "facility"}
                tempValue={tempValue}
                onTempValueChange={setTempValue}
                onSave={() => handleFieldSaveWithAlert("facility")}
                type="text"
                isValid={organisationValidity}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-col mt-6">
            <Button
              onClick={handleSaveChangesHook}
              variant="primary"
              appearance="outlined"
              state="press"
              disabled={!hasChanges || isSaving}
              className="w-[556px] h-[56px]"
            >
              <span>{isSaving ? "SAVING..." : "SAVE CHANGES"}</span>
            </Button>
            <Button
              onClick={onClose}
              variant="neutral"
              appearance="ghost"
              className="w-[556px] h-[56px]"
            >
              <span>CANCEL</span>
            </Button>
          </div>
        </div>
      </Modal>

      <OtpVerifyModal
        open={showOtpModal}
        onClose={handleOtpBack}
        email={otpEmail}
        otp={otp}
        setOtp={setOtp}
        timer={timer}
        onBack={handleOtpBack}
        onVerify={handleOtpVerify}
        otpRefs={otpRefs}
        otpError={otpError}
        onResend={handleOtpResend}
        title={title}
        message={description}
        showBackButton={true}
        errorMessage={apiError}
        onDismissError={handleDismissApiError}
      />

      <PasswordChangeModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onBack={handlePasswordBack}
        onSave={handlePasswordSave}
      />

    </>
  );
}
