"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface SettingsApplyConfirmModalProps {
  open: boolean;
  boxName: string;
  onCloseAction: () => void;
  onConfirmAction: () => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function SettingsApplyConfirmModal({
  open,
  boxName,
  onCloseAction,
  onConfirmAction,
  isSubmitting = false,
}: SettingsApplyConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCloseAction} width="w-[604px] max-w-full" height="h-auto">
      <div className="flex flex-col gap-6 w-full text-center mt-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[24px] font-semibold leading-[32px] text-[var(--gp-color-text-neutral-primary)] w-full">
            Apply settings to {boxName}?
          </h2>
          <p className="text-[18px] font-normal leading-[28px] text-[var(--gp-color-text-neutral-secondary)] w-full">
            This action will update configuration immediately and may impact box features currently in use.
          </p>
        </div>

        <div className="bg-[var(--gp-color-bg-neutral-secondary)] border border-[var(--gp-color-stroke-neutral-primary)] rounded-lg p-4 flex items-center justify-center gap-2">
          <span className="text-[16px] font-semibold leading-[24px] text-[var(--gp-color-text-neutral-secondary)] whitespace-nowrap">
            Review completed. Ready to apply changes.
          </span>
        </div>

        <hr className="border-t border-[var(--gp-color-stroke-neutral-secondary)] w-full m-0" />

        <div className="flex flex-col gap-4">
          <Button
            variant="primary"
            appearance="outlined"
            size="xl"
            onClick={onConfirmAction}
            disabled={isSubmitting}
            className="w-full text-[20px] uppercase"
          >
            <span>{isSubmitting ? "Applying..." : "Yes, apply changes"}</span>
          </Button>

          <Button
            variant="neutral"
            appearance="ghost"
            onClick={onCloseAction}
            disabled={isSubmitting}
            className="w-full text-[20px] uppercase text-[var(--gp-color-text-neutral-tertiary)]"
          >
            <span>Cancel</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
