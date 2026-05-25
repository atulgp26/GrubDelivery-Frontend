"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { showSuccess } from "@/components/ui/toast";

export default function SuspendBoxModal({ 
  open, 
  onClose, 
  onSuspend, 
  selectedCount = 1,
  boxName = "BOX-2456",
  employees,
  employeeName
}: {
  open: boolean;
  onClose: () => void;
  onSuspend?: () => Promise<void> | void;
  selectedCount?: number;
  boxName?: string;
  employees?: boolean;
  employeeName?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTitle = () => {
    if (selectedCount === 1) {
      return `Suspend ${boxName}?`;
    } else {
      const otherCount = selectedCount - 1;
      return `Suspend ${boxName} and ${otherCount} other boxes?`;
    }
  };

  const getButtonText = () => {
    if (employees) {
      return `YES, SUSPEND ${selectedCount} ${selectedCount === 1 ? "EMPLOYEE" : "EMPLOYEES"}`;
    }
    return `YES, SUSPEND ${selectedCount} ${selectedCount === 1 ? "BOX" : "BOXES"}`;
  };

  const handleSuspend = async () => {
    if (isSubmitting) return;

    if (!onSuspend) {
      setIsSubmitting(true);
      showSuccess(
        `${selectedCount} ${selectedCount === 1 ? "box" : "boxes"} suspended successfully!`,
        "Boxes have been temporarily deactivated and will not be available for guest use."
      );

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1000);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSuspend();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} width="w-[600px]" height="h-auto" closeOnOutsideClick={true}>
      <div className="flex flex-col gap-6 px-6 mt-8">
        {/* Text content */}
        <div className="flex flex-col gap-2 items-start text-center w-full">
          <h2 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)] w-full">
            {employeeName
              ? `Suspend ${selectedCount === 1 ? employeeName : `${employeeName} and ${selectedCount - 1} others`}`
              : getTitle()}
          </h2>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)] w-full">
            This will temporarily deactivate the boxes. They will not be available for deliveries until reactivated. You can resume use at any time.
          </p>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)] w-full">
            No data will be lost. Suspension helps avoid accidental usage or assignment.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 items-center w-full">
          <Button
            variant="primary"
            state={isSubmitting ? "disabled" : "press"}
            onClick={handleSuspend}
            disabled={isSubmitting}
            className="w-full h-[48px] flex items-center justify-center gap-3"
          >
            <span className="font-[var(--gp-font-interactive)] text-[18px] leading-[22px] font-medium text-white uppercase">
              {getButtonText()}
            </span>
          </Button>
          <Button
            variant="neutral"
            appearance="ghost"
            onClick={onClose}
            className="h-9 flex items-center justify-center gap-2 min-w-16 overflow-hidden rounded-[4px] p-[2px] cursor-pointer hover:opacity-80 transition-opacity"
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