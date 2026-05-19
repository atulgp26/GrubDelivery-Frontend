"use client";

import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { DeleteEmployeeModalProps } from "../types";

export type { DeleteEmployeeModalProps };

export default function DeleteEmployeeModal({
  open,
  onClose,
  onConfirm,
  onSuspend,
  employeeName,
  employeeCount = 1,
  loading = false,
}: DeleteEmployeeModalProps) {
  const isMultiple = employeeCount > 1;
  const othersCount = Math.max(0, employeeCount - 1);

  const getTitle = (): string => {
    if (isMultiple) {
      return `Delete ${employeeName} and ${othersCount} other account${othersCount === 1 ? "" : "s"}?`;
    }
    return `Delete ${employeeName}'s account?`;
  };

  const getButtonText = (): string => {
    if (isMultiple) {
      return `I UNDERSTAND, DELETE ${employeeCount} ACCOUNTS`;
    }
    return `I UNDERSTAND, DELETE THEIR ACCOUNT`;
  };

  const getSuspendButtonText = (): string => {
    return isMultiple ? "SUSPEND EMPLOYEES" : "SUSPEND EMPLOYEE";
  };

  const getSuspendHelpText = (): string => {
    return isMultiple
      ? "Not sure? You can suspend the employees instead."
      : "Not sure? You can suspend the employee instead.";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[640px]"
      height="h-auto"
      closeOnOutsideClick={false}
    >
      <div className="flex flex-col gap-6 p-6 relative">
        {/* Illustration */}
        <div className="flex items-center justify-center w-full">
          <Image
            src="/account_delete_profile.svg"
            alt="Delete employee icon"
            width={120}
            height={120}
            className="shrink-0 mt-6"
          />
        </div>

        {/* Text content */}
        <div className="flex flex-col gap-2 text-center w-full">
          <h2 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)] break-words [overflow-wrap:anywhere]">
            {getTitle()}
          </h2>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)]">
            This will permanently remove their account, including login access, profile data, and any active assignments.
          </p>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)]">
            ⚠ This action cannot be undone. Your historical logs will remain.
          </p>
        </div>

        {/* Delete button */}
        <Button
          variant="primary"
          appearance="solid"
          state="press"
          className="w-full h-12 bg-[#6b7971] border-[#6b7971] hover:bg-[#5a6660] hover:underline active:bg-[#5a6660] text-white font-medium text-[18px] leading-[22px] uppercase rounded-lg transition"
          onClick={onConfirm}
          disabled={loading}
        >
          {getButtonText()}
        </Button>

        {/* Divider + help section with suspend option */}
        {onSuspend && (
          <>
            <div className="h-px w-full bg-[var(--gp-color-border-neutral)]" />
            <div className="flex gap-4 items-center w-full">
              <p className="flex-1 text-left font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)]">
                {getSuspendHelpText()}
              </p>
              <Button
                variant="primary"
                appearance="outlined"
                state="press"
                onClick={onSuspend}
                className="flex-1 h-12 min-w-[64px] text-[18px] leading-[22px] font-medium uppercase"
                disabled={loading}
              >
                <span>{getSuspendButtonText()}</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

