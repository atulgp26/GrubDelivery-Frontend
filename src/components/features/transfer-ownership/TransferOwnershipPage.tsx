"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FaChevronRight } from "react-icons/fa6";
import { showError } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";
import accountService from "@/services/account";
import TransferSelectModal from "./modals/TransferSelectModal";
import TransferConfirmModal from "./modals/TransferConfirmModal";
import AddOwnerDetailsModal from "./modals/AddOwnerDetailsModal";
import ReviewConfirmModal from "./modals/ReviewConfirmModal";
import TransferOtpModal from "./modals/TransferOtpModal";
import ViewAllBoxesModal from "./modals/ViewAllBoxesModal";
import type { NewOwnerFormData } from "./hooks/useTransferForm";
import type { GrubPacBoxRow } from "./table/transfer-ownership-table";

type TransferType = "selected" | "all";

interface PageState {
  selectOpen: boolean;
  confirmOpen: boolean;
  ownerDetailsOpen: boolean;
  reviewOpen: boolean;
  otpOpen: boolean;
  transferType: TransferType;
  selectedCount: number;
  selectedIds: string[];
  selectedRows: GrubPacBoxRow[];
  ownerData: NewOwnerFormData | null;
}

export default function TransferOwnershipPage() {
  const router = useRouter();
  const [successVisible, setSuccessVisible] = useState(false);
  const [viewListOpen, setViewListOpen] = useState(false);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [state, setState] = useState<PageState>({
    selectOpen: false,
    confirmOpen: false,
    ownerDetailsOpen: false,
    reviewOpen: false,
    otpOpen: false,
    transferType: "selected",
    selectedCount: 0,
    selectedIds: [],
    selectedRows: [],
    ownerData: null,
  });

  // Card 1: open the selection table modal
  const handleOpenSelect = () =>
    setState((s) => ({ ...s, selectOpen: true, transferType: "selected" }));

  // Card 2: skip selection, go straight to confirm for "all"
  const handleOpenConfirmAll = () =>
    setState((s) => ({
      ...s,
      confirmOpen: true,
      transferType: "all",
      selectedCount: 0,
      selectedIds: [],
      selectedRows: [],
    }));

    
const handleOtpResend = async () => {
  if (!state.ownerData || isSubmittingTransfer) return;

  const numericCountryCode =
    state.ownerData.dialCode.replace(/\D/g, "") || state.ownerData.countryCode.replace(/\D/g, "");

  const payload = {
    transfer_mode: state.transferType,
    ...(state.transferType === "selected" ? { ids: state.selectedIds } : {}),
    name: state.ownerData.fullName.trim(),
    organization_name: state.ownerData.organisationName.trim(),
    country_code: numericCountryCode,
    phone: state.ownerData.phone.trim(),
    email: state.ownerData.email.trim(),
    country: state.ownerData.country.trim(),
    state: (state.ownerData.stateLabel || state.ownerData.state).trim(),
  };

  setIsSubmittingTransfer(true);
  try {
    const response = await accountService.transferOwnership(payload);
    if (!response.success) {
      showError(response.error ?? "Failed to resend OTP.");
      return;
    }
    setOtpId(response.data?.otp_id ?? null); // ✅ update otpId with new one
  } catch (error) {
    showError(error instanceof Error ? error.message : "Failed to resend OTP.");
  } finally {
    setIsSubmittingTransfer(false);
  }
};

  // NEXT pressed in TransferSelectModal
  const handleSelectNext = ({
    selectedIds,
    selectedRows,
  }: {
    selectedIds: string[];
    selectedRows: GrubPacBoxRow[];
  }) =>
    setState((s) => ({
      ...s,
      selectOpen: false,
      confirmOpen: true,
      transferType: "selected",
      selectedCount: selectedIds.length,
      selectedIds,
      selectedRows,
    }));

  // BACK pressed inside the confirm modal
  const handleConfirmBack = () =>
    setState((s) => ({
      ...s,
      confirmOpen: false,
      // re-open select if we came from selected flow, otherwise just close
      selectOpen: s.transferType === "selected",
    }));

  const closeAll = () =>
    setState((s) => ({
      ...s,
      selectOpen: false,
      confirmOpen: false,
      ownerDetailsOpen: false,
      reviewOpen: false,
      otpOpen: false,
    }));

  const handleConfirm = () =>
    setState((s) => ({ ...s, confirmOpen: false, ownerDetailsOpen: true }));

  const handleOwnerDetailsBack = () =>
    setState((s) => ({ ...s, ownerDetailsOpen: false, confirmOpen: true }));

  const handleOwnerDetailsNext = (data: NewOwnerFormData) =>
    setState((s) => ({ ...s, ownerDetailsOpen: false, reviewOpen: true, ownerData: data }));

  const handleReviewBack = () =>
    setState((s) => ({ ...s, reviewOpen: false, ownerDetailsOpen: true }));

  const handleReviewContinue = async () => {
    if (!state.ownerData || isSubmittingTransfer) return;

    const numericCountryCode =
      state.ownerData.dialCode.replace(/\D/g, "") || state.ownerData.countryCode.replace(/\D/g, "");

    const payload = {
      transfer_mode: state.transferType,
      ...(state.transferType === "selected" ? { ids: state.selectedIds } : {}),
      name: state.ownerData.fullName.trim(),
      organization_name: state.ownerData.organisationName.trim(),
      country_code: numericCountryCode,
      phone: state.ownerData.phone.trim(),
      email: state.ownerData.email.trim(),
      country: state.ownerData.country.trim(),
      state: (state.ownerData.stateLabel || state.ownerData.state).trim(),
    };

    setIsSubmittingTransfer(true);
    try {
      const response = await accountService.transferOwnership(payload);
      if (!response.success) {
        showError(response.error ?? "Failed to submit transfer details.");
        return;
      }

      setOtpId(response.data?.otp_id ?? null);
      setState((s) => ({ ...s, reviewOpen: false, otpOpen: true }));
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to submit transfer details.");
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleViewList = () => setViewListOpen(true);
  const handleViewListClose = () => setViewListOpen(false);

  const handleOtpBack = () =>
    setState((s) => ({ ...s, otpOpen: false, reviewOpen: true }));

  const handleOtpVerify = async (otp: string) => {
    if (isVerifyingOtp) return;

    const normalizedOtp = typeof otp === "string" ? otp.trim() : "";
    if (!normalizedOtp) {
      showError("Please enter a valid OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await accountService.verifyTransferOwnership({
        otp: normalizedOtp,
        ...(otpId ? { otp_id: otpId } : {}),
      });
      if (!response.success) {
        showError(
          getContextualErrorMessage(
            "otp.verify.transfer",
            response,
            "We could not verify the OTP. Please try again.",
          ),
        );
        return;
      }

      closeAll();
      setOtpId(null);
      setSuccessVisible(true);
    } catch (error) {
      showError(
        getContextualErrorMessage(
          "otp.verify.transfer",
          error,
          "We could not verify the OTP. Please try again.",
        ),
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <>
      {/* ── Success banner ── */}
      {successVisible && (
        <div className="fixed top-2 left-2 right-2 z-[9999]">
          <Alert variant="success" appearance="solid" className="px-6 py-3">
            <AlertTitle className="text-[18px] font-semibold whitespace-nowrap">
              GrubPacs transferred successfully.
            </AlertTitle>
            <AlertDescription className="text-[16px] flex-1">
              The new owner now has access and control.
            </AlertDescription>
            <Button
              variant="neutral"
              appearance="ghost"
              className="ml-auto flex items-center gap-1 shrink-0 !p-0 text-green-700 hover:text-green-800"
              onClick={() => router.push("/grublock/details")}
            >
              <span className="font-medium text-[16px] uppercase">View Details</span>
            </Button>
          </Alert>
        </div>
      )}
    <div className="flex flex-col gap-6 p-6 w-full h-full bg-white">
      {/* Section title */}
      <div className="flex gap-4 items-start w-full">
        <div className="flex flex-col flex-1 min-w-0">
          <h1
            className="font-semibold text-[var(--color-neutral-primary)] w-full"
            style={{ fontSize: "24px", lineHeight: "32px" }}
          >
            Transfer ownership of your GrubPacs
          </h1>
          <p
            className="font-normal text-[var(--color-neutral-secondary)] w-full"
            style={{ fontSize: "18px", lineHeight: "28px" }}
          >
            Choose what you&apos;d like to transfer. The new owner will receive access and full
            control over the selected items.
          </p>
        </div>
      </div>

      {/* Option cards */}
      <div className="flex flex-1 flex-col gap-6 items-center justify-center px-6 py-12 w-full">
        {/* Card 1 — Transfer selected GrubPacs */}
        <button
          onClick={handleOpenSelect}
          className="bg-white border border-[var(--color-stroke-neutral)] flex flex-1 gap-6 items-center max-h-[200px] min-h-[80px] overflow-hidden p-6 rounded-lg w-full hover:bg-[var(--very-light-gray)] transition-colors text-left"
        >
          <span
            className="font-semibold text-[var(--color-admin-profile-border)] w-16 text-center shrink-0"
            style={{ fontSize: "64px", lineHeight: "64px" }}
          >
            1
          </span>
          <div className="flex flex-col flex-1 gap-2 min-w-0" style={{ fontSize: "18px" }}>
            <p
              className="font-semibold text-[var(--color-neutral-primary)]"
              style={{ lineHeight: "28px" }}
            >
              Transfer selected GrubPacs
            </p>
            <p
              className="font-normal text-[var(--color-neutral-secondary)]"
              style={{ lineHeight: "28px" }}
            >
              Choose specific boxes to transfer to another owner.
            </p>
          </div>
        </button>

        {/* Card 2 — Transfer all GrubPacs */}
        <button
          onClick={handleOpenConfirmAll}
          className="bg-white border border-[var(--color-stroke-neutral)] flex flex-1 gap-6 items-center max-h-[200px] min-h-[80px] overflow-hidden p-6 rounded-lg w-full hover:bg-[var(--very-light-gray)] transition-colors text-left"
        >
          <span
            className="font-semibold text-[var(--color-admin-profile-border)] w-16 text-center shrink-0"
            style={{ fontSize: "64px", lineHeight: "64px" }}
          >
            2
          </span>
          <div className="flex flex-col flex-1 gap-2 min-w-0" style={{ fontSize: "18px" }}>
            <p
              className="font-semibold text-[var(--color-neutral-primary)]"
              style={{ lineHeight: "28px" }}
            >
              Transfer all GrubPacs
            </p>
            <p
              className="font-normal text-[var(--color-neutral-secondary)]"
              style={{ lineHeight: "28px" }}
            >
              Move all your boxes to a new owner. Your account stays active.
            </p>
          </div>
        </button>
      </div>

      {/* Note */}
      <p
        className="italic text-[var(--color-neutral-secondary)] w-full"
        style={{ fontSize: "16px", lineHeight: "20px" }}
      >
        Note: To transfer your entire account, including all boxes, employee details, settings,
        and restaurant assignments, you can update your profile credentials with new information.
      </p>

      {/* Select boxes modal */}
      <TransferSelectModal
        open={state.selectOpen}
        onCloseAction={closeAll}
        onNextAction={handleSelectNext}
      />

      {/* Confirm transfer modal */}
      <TransferConfirmModal
        open={state.confirmOpen}
        onClose={closeAll}
        onBack={handleConfirmBack}
        transferType={state.transferType}
        selectedCount={state.selectedCount}
        onConfirm={handleConfirm}
      />

      {/* Add new owner details modal */}
      <AddOwnerDetailsModal
        open={state.ownerDetailsOpen}
        onCloseAction={closeAll}
        onBackAction={handleOwnerDetailsBack}
        onNextAction={handleOwnerDetailsNext}
      />

      {/* Review and confirm modal */}
      <ReviewConfirmModal
        open={state.reviewOpen}
        onClose={closeAll}
        onBack={handleReviewBack}
        onContinue={handleReviewContinue}
        onViewList={handleViewList}
        transferType={state.transferType}
        selectedCount={state.selectedCount}
        ownerData={state.ownerData}
      />

      {/* View all boxes (read-only) */}
      <ViewAllBoxesModal
        open={viewListOpen}
        onClose={handleViewListClose}
        data={state.transferType === "selected" ? state.selectedRows : undefined}
      />

      {/* OTP verification modal */}
      <TransferOtpModal
        open={state.otpOpen}
        onClose={closeAll}
        onBack={handleOtpBack}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        transferType={state.transferType}
        selectedCount={state.selectedCount}
      />
    </div>
    </>
  );
}
