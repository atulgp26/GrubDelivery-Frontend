"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";
import { cn } from "@/lib/utils";
import FigIcon from "@/components/ui/FigIcon";
import { FaChevronRight } from "react-icons/fa6";
import type { NewOwnerFormData } from "../hooks/useTransferForm";
import { getTransferLabel } from "../constants/transfer-labels";

interface ReviewConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  onViewList: () => void;
  transferType: "selected" | "all";
  selectedCount: number;
  ownerData: NewOwnerFormData | null;
}

export default function ReviewConfirmModal({
  open,
  onClose,
  onBack,
  onContinue,
  onViewList,
  transferType,
  selectedCount,
  ownerData,
}: ReviewConfirmModalProps) {
  const [understood, setUnderstood] = useState(false);

  const handleClose = () => {
    setUnderstood(false);
    onClose();
  };

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    if (understood) onContinue();
  };

  const nameRow = ownerData
    ? [ownerData.fullName, ownerData.organisationName].filter(Boolean).join(" | ")
    : "—";

  const contactRow = ownerData
    ? [
        ownerData.dialCode && ownerData.phone
          ? `${ownerData.dialCode} ${ownerData.phone}`
          : ownerData.phone || null,
        ownerData.email || null,
      ]
        .filter(Boolean)
        .join(" | ")
    : "—";

  const locationRow = ownerData
    ? [ownerData.stateLabel, ownerData.countryLabel].filter(Boolean).join(", ")
    : "—";

  const transferLabel = getTransferLabel(transferType, selectedCount);

  const backButton = (
    <Button
      variant="neutral"
      appearance="ghost"
      className="rounded-lg flex items-center justify-center gap-2"
      onClick={handleBack}
      aria-label="Back"
    >
      <FigIcon name="left-arrow" size={20} />
      <span className="text-xl ml-1 font-medium">BACK</span>
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[604px] max-w-full"
      height="h-auto max-h-[90vh]"
      noXPadding
      closeOnOutsideClick={false}
      headerLeft={backButton}
    >
      <div className="flex flex-col w-full gap-6">
        {/* ── Title ── */}
        <div className="px-6">
          <h1
            className="font-semibold text-[var(--gp-color-text-neutral-primary)]"
            style={{ fontSize: "24px", lineHeight: "32px" }}
          >
            Review and confirm
          </h1>
        </div>

        {/* ── Details ── */}
        <div className="flex flex-col px-6 gap-0">
          {/* Transfer includes row */}
          <div className="flex gap-4 items-start">
            <span
              className="font-normal text-[var(--gp-color-text-neutral-secondary)] shrink-0 w-[140px] py-3"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            >
              Transfer includes :
            </span>
            <div className="flex flex-1 items-center justify-between py-3 px-4">
              <span
                className="font-normal text-[var(--gp-color-text-neutral-secondary)]"
                style={{ fontSize: "16px", lineHeight: "24px" }}
              >
                {transferLabel}
              </span>
              {(transferType === "selected" ? selectedCount > 0 : true) && (
                <Button
                  variant="neutral"
                  appearance="ghost"
                  className="!p-0.5 gap-1 flex items-center group"
                  onClick={onViewList}
                >
                  <span
                    className="font-medium uppercase text-[var(--gp-color-text-brand)] group-hover:underline"
                    style={{ fontSize: "16px", lineHeight: "20px" }}
                  >
                    View list
                  </span>
                  <FaChevronRight className="w-4 h-4 text-[var(--gp-color-text-brand)]" />
                </Button>
              )}
            </div>
          </div>

          {/* Transferring to row */}
          <div className="flex gap-4 items-start">
            <span
              className="font-normal text-[var(--gp-color-text-neutral-secondary)] shrink-0 w-[140px] py-3"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            >
              Transferring to :
            </span>
            <div className="flex flex-1 flex-col">
              {[nameRow, contactRow, locationRow].map((row, i) => (
                <div key={i} className="px-4 py-3 min-h-[48px] flex items-center">
                  <span
                    className="font-normal text-[var(--gp-color-text-neutral-secondary)] truncate"
                    style={{ fontSize: "16px", lineHeight: "24px" }}
                  >
                    {row}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Checkbox ── */}
        <div className="flex gap-3 items-start px-6 pb-2">
          <CheckBox
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
          />
          <span
            className="font-normal text-[var(--gp-color-text-neutral-secondary)] cursor-pointer select-none"
            style={{ fontSize: "16px", lineHeight: "24px" }}
            onClick={() => setUnderstood((v) => !v)}
          >
            I understand that I will lose access to my GrubPacs after the transfer.
          </span>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-[var(--gp-color-border-neutral)] px-6 py-4 shrink-0">
          <Button
            variant="primary"
            appearance="solid"
            size="xl"
            onClick={handleContinue}
            disabled={!understood}
            className={cn(
              "w-full gap-3 flex items-center justify-center",
              understood
                ? "bg-[var(--gp-color-brand-primary)] border-[var(--gp-color-brand-border)] text-white"
                : "!bg-[var(--gp-color-bg-button-primary-disabled)] !border-[var(--gp-color-border-neutral)] !text-[var(--gp-color-text-disabled)]"
            )}
          >
            CONTINUE TO OTP VERIFICATION
            <FaChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
