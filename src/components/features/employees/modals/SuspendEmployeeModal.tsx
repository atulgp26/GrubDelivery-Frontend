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
  <Modal open={open} onClose={handleClose} width="w-[600px]" height="h-auto" closeOnOutsideClick={true}>
    
    {/* Fixed title — stays put */}
    <div className="flex-shrink-0 pb-2">
      <h2 className="font-[var(--gp-font-heading)] text-center text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)] break-words [overflow-wrap:anywhere]">
        {getTitle()}
      </h2>
    </div>

    {/* Scrollable body */}
    <div className="flex flex-col text-center gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
      <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)]">
        This will temporarily deactivate their account. They will not be able to access the app or be assigned to any tasks until reactivated.
      </p>
      <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)]">
        No data will be lost. Suspension helps avoid accidental activity or assignment.
      </p>
    </div>

    {/* Fixed footer — buttons always visible */}
    <div className="flex flex-col gap-4 items-center flex-shrink-0 pt-4">
      <Button
        variant="primary"
        state="press"
        onClick={handleConfirm}
        disabled={loading}
        className="w-full h-[48px] flex items-center justify-center gap-3"
      >
        <span className="font-[var(--gp-font-interactive)] text-[18px] leading-[22px] font-medium text-white uppercase break-words [overflow-wrap:anywhere]">
          {getButtonText()}
        </span>
      </Button>
      <Button
        variant="neutral"
        appearance="ghost"
        onClick={handleClose}
        disabled={loading}
        className="h-9 flex items-center justify-center gap-2 min-w-16 rounded-[4px] p-[2px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase">
          CANCEL
        </span>
      </Button>
    </div>
  </Modal>
);
}

