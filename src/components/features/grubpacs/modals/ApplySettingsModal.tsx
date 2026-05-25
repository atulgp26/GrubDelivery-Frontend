"use client";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function ApplySettingsModal({
  open,
  onClose,
  selectedCount = 5,
  settingType = "REMOVE ANY ROOM ASSIGNED",
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  selectedCount?: number;
  settingType?: string;
  onApply: () => void | Promise<void>;
}) {
  const handleApply = () => {
    void onApply();
  };

  return (
    <>
      <Modal open={open} onClose={onClose} width="w-[604px] max-w-full" height="h-auto">
        <div className="flex flex-col gap-6 w-full text-center">
          {/* Text */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[24px] font-semibold leading-[32px] text-[var(--gp-color-text-neutral-primary)] w-full mt-6">
              Apply settings to {selectedCount} boxes?
            </h2>
            <p className="text-[18px] font-normal leading-[28px] text-[var(--gp-color-text-neutral-secondary)] w-full">
              This action will update their configuration immediately and may impact contents currently inside.
            </p>
          </div>

          {/* Setting box */}
          <div className="bg-[var(--gp-color-bg-neutral-secondary)] border border-[var(--gp-color-stroke-neutral-primary)] rounded-lg p-4 flex items-center justify-center gap-2">
            <span className="text-[16px] font-semibold leading-[24px] text-[var(--gp-color-text-neutral-secondary)] whitespace-nowrap">
              Change to be applied :
            </span>
            {settingType.toLowerCase().includes("temperature") ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full border border-[#79867e] bg-[var(--gp-color-stroke-neutral-secondary)] text-[var(--gp-color-text-neutral-tertiary)] text-[14px] font-medium leading-[16px] uppercase whitespace-nowrap">
                {settingType}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full border border-[var(--gp-color-stroke-error-border)] bg-[var(--gp-color-bg-colored-secondary)] text-[var(--gp-color-text-error-primary)] text-[14px] font-medium leading-[16px] uppercase whitespace-nowrap">
                {settingType}
              </span>
            )}
          </div>

          {/* Divider */}
          <hr className="border-t border-[var(--gp-color-stroke-neutral-secondary)] w-full m-0" />

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              variant="primary"
              appearance="outlined"
              size="xl"
              onClick={handleApply}
              className="w-full text-[20px] uppercase"
            >
              <span>Yes, apply changes</span>
            </Button>

            <Button
              variant="neutral"
              appearance="ghost"
              onClick={onClose}
              className="w-full text-[20px] uppercase text-[var(--gp-color-text-neutral-tertiary)]"
            >
              <span>Cancel</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
