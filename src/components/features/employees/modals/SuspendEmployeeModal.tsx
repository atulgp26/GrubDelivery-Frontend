"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { SuspendEmployeeModalProps } from "../types";

export type { SuspendEmployeeModalProps };

export default function SuspendEmployeeModal({
  open,
  onClose,
  onConfirm,
  employeeName,
  employeeCount = 1,
  loading = false,
}: SuspendEmployeeModalProps) {
  const isMultiple = employeeCount > 1;
  const othersCount = Math.max(0, employeeCount - 1);

  useEffect(() => {
    if (!open) {
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    onClose();
  };

  const getTitle = (): string => {
    if (isMultiple) {
      return `Suspend ${employeeName} and ${othersCount} other${othersCount === 1 ? "" : "s"}?`;
    }
    return `Suspend ${employeeName}?`;
  };

  const getButtonText = (): string => {
    if (isMultiple) {
      return `YES, SUSPEND ${employeeCount} EMPLOYEES`;
    }
    return "YES, SUSPEND EMPLOYEE";
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[600px]"
      height="h-auto"
      closeOnOutsideClick={true}
    >
      {/* Content */}
      <div className="flex flex-col gap-6 px-6 pb-6 mt-8">
        {/* Text content */}
        <div className="flex flex-col gap-2 items-start text-center w-full">
          <h2 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)] w-full break-words [overflow-wrap:anywhere]">
            {getTitle()}
          </h2>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)] w-full">
            This will temporarily deactivate their account. They will not be able to access the app or be assigned to any tasks until reactivated.
          </p>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)] w-full">
            No data will be lost. Suspension helps avoid accidental activity or assignment.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 items-center w-full">
          <Button
            variant="primary"
            state="press"
            onClick={handleConfirm}
            disabled={loading}
            className="w-full h-[48px] flex items-center justify-center gap-3"
          >
            <span className="font-[var(--gp-font-interactive)] text-[18px] leading-[22px] font-medium text-white uppercase text-center break-words [overflow-wrap:anywhere]">
              {getButtonText()}
            </span>
          </Button>
          <Button
            variant="neutral"
            appearance="ghost"
            onClick={handleClose}
            disabled={loading}
            className="h-9 flex items-center justify-center gap-2 min-w-16 overflow-hidden rounded-[4px] p-[2px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase">
              CANCEL
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

