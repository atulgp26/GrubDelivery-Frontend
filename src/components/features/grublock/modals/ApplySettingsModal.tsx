"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ApplySettingsModalProps {
  open: boolean;
  onClose: () => void;
  selectedCount?: number;
  settingType?: string;
  onApply: () => void;
}

export default function ApplySettingsModal({
  open,
  onClose,
  selectedCount = 5,
  settingType = "TURN POWER OFF",
  onApply,
}: ApplySettingsModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} width="max-w-[604px]">
      <div className="flex flex-col w-full">
        <div className="text-center mt-8">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
            Apply settings to {selectedCount} boxes?
          </h2>
          <p className="text-lg text-[var(--color-neutral-secondary)] mb-6">
            This action will update their configuration immediately and may impact contents currently inside.
          </p>

          <div className="bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[var(--color-neutral-secondary)] font-semibold text-base">
                Change to be applied :
              </span>
              <span className="inline-flex items-center bg-[#FFD8CB] text-[#DC2807] border border-[#E44421] px-3 py-1 rounded-full text-sm font-medium uppercase">
                {settingType}
              </span>
            </div>
          </div>

          <div className="border-t border-[var(--color-box-border)] mb-6"></div>

          <div className="flex flex-col gap-4">
            <Button
              variant="primary"
              appearance="outlined"
              state="press"
              onClick={onApply}
              className="w-full text-xl font-medium h-[56px] hover:underline"
            >
              YES, APPLY CHANGES
            </Button>
            <Button
              variant="neutral"
              appearance="ghost"
              onClick={onClose}
              className="w-full font-medium text-xl uppercase hover:underline"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

