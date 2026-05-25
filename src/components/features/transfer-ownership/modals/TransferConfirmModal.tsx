"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import FigIcon from "@/components/ui/FigIcon";
import { IoIosWarning } from "react-icons/io";

interface TransferConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedCount?: number;
  transferType?: "selected" | "all";
  onConfirm: () => void;
}

export default function TransferConfirmModal({
  open,
  onClose,
  onBack,
  selectedCount = 3,
  transferType = "selected",
  onConfirm,
}: TransferConfirmModalProps) {
  const backButton = (
    <Button
      variant="neutral"
      appearance="ghost"
      className="rounded-lg flex items-center justify-center gap-2"
      onClick={onBack}
      aria-label="Back"
    >
      <FigIcon name="left-arrow" size={20} />
      <span className="text-xl ml-1 font-medium">BACK</span>
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[594px] max-w-full"
      height="h-auto"
      headerLeft={backButton}
    >
      <div className="flex flex-col items-center w-full gap-6 py-2">
        {/* Warning illustration */}
        <div className="flex items-center justify-center w-full">
          <IoIosWarning className="text-[var(--notif-error)]" style={{ width: 120, height: 120 }} />
        </div>

        {/* Text content */}
        <div className="flex flex-col gap-2 text-center w-full">
          <h2
            className="font-semibold text-[var(--color-neutral-primary)]"
            style={{ fontSize: "24px", lineHeight: "32px" }}
          >
            {transferType === "all"
              ? "You're about to transfer all your GrubPacs."
              : `You're about to transfer ${selectedCount} selected GrubPacs.`}
          </h2>
          <p
            className="font-normal text-[var(--color-neutral-secondary)]"
            style={{ fontSize: "18px", lineHeight: "28px" }}
          >
            You will retain your account but lose ownership of these units.
            Remember, this action is irreversible.
          </p>
        </div>

        {/* Confirm button */}
        <Button
          variant="neutral"
          appearance="solid"
          state="press"
          className="w-full h-12 !bg-[var(--color-checkbox-bg)] !border-[var(--color-checkbox-bg)] hover:!bg-[#5a6660] !text-white font-medium uppercase rounded-lg transition"
          style={{ fontSize: "18px", lineHeight: "22px" }}
          onClick={onConfirm}
        >
          <span>I UNDERSTAND, CONTINUE WITH THE TRANSFER</span>
        </Button>
      </div>
    </Modal>
  );
}
