"use client";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { showSuccess } from "@/components/ui/toast";

export default function DeleteBoxModal({
  open,
  onClose,
  onDelete,
  boxName = "BOX-2456",
}: {
  open: boolean;
  onClose: () => void;
  onDelete?: () => void;
  boxName?: string;
}) {
  const handleDelete = () => {
    showSuccess(
      `${boxName} deleted successfully!`,
      "The GrubPac box has been permanently removed from the system."
    );
    setTimeout(() => {
      onDelete?.();
      onClose();
    }, 1000);
  };

  return (
    <Modal open={open} onClose={onClose} width="w-[600px]" height="h-auto" closeOnOutsideClick={true}>
      <div className="flex flex-col gap-6 px-6 mt-8">
        {/* Warning icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[var(--gp-color-bg-error-secondary)] flex items-center justify-center">
            <Image
              src="/GrubPac/Box-settings/trash.svg"
              alt=""
              width={28}
              height={28}
            />
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col gap-2 items-start w-full">
          <h2 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)] w-full">
            Delete {boxName}?
          </h2>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)] w-full">
            This action is permanent and cannot be undone. All data associated with this GrubPac box including settings, logs, and history will be permanently removed.
          </p>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-error-primary)] w-full">
            Are you sure you want to delete this box?
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 items-center w-full">
          <button
            onClick={handleDelete}
            className="w-full h-[48px] flex items-center justify-center gap-3 rounded-lg bg-[var(--gp-color-bg-error-primary)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src="/GrubPac/Box-settings/trash.svg"
              alt=""
              width={20}
              height={20}
              className="invert"
            />
            <span className="font-[var(--gp-font-interactive)] text-[18px] leading-[22px] font-medium text-white uppercase">
              YES, DELETE THE BOX
            </span>
          </button>
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
