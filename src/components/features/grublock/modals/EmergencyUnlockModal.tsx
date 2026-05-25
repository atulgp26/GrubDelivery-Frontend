"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import Modal from "@/components/ui/Modal";

interface EmergencyUnlockModalProps {
  open: boolean;
  onClose: () => void;
  onUnlock: (reason: string) => void;
  isSubmitting?: boolean;
  selectedCount?: number;
  top?: string;
  right?: string;
  left?: string;
  bottom?: string;
  positionClass?: string;
  noBlur?: boolean;
}

export default function EmergencyUnlockModal({
  open,
  onClose,
  onUnlock,
  isSubmitting = false,
  selectedCount = 1,
  top,
  right,
  left,
  bottom,
  positionClass,
  noBlur = false,
}: EmergencyUnlockModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleUnlock = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for emergency unlock.");
      return;
    }
    setError("");

    onUnlock(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  if (!open) return null;
  const resolvedPositionClass =
    positionClass || (top || right || bottom || left ? "items-start justify-end" : undefined);

  return (
    <Modal
      open={open}
      hideClose
      onClose={handleClose}
      positionClass={resolvedPositionClass}
      top={top}
      right={right}
      left={left}
      bottom={bottom}
      noBlur={noBlur}
      width="max-w-[400px]"
    >
      <div className="w-full flex flex-col gap-3 pt-7">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-primary)]">
          Facing an emergency?
        </h2>
        <p className="text-base text-[var(--color-neutral-secondary)]">
          This will immediately unlock the{" "}
          {selectedCount > 1 ? "boxes" : "box"} without any OTP verification.
          <br />
          Please confirm the reason for the override.
        </p>

        <TextArea
          placeholder="Add a reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {error && <div className="text-red-500 text-xs">{error}</div>}

        <Button
          variant="primary"
          appearance="solid"
          state="press"
          className={`w-full font-medium h-[40px] rounded-lg text-[16px] hover:underline ${!reason.trim()
              ? "bg-[#C1C7C4] border-[#C1C7C4] text-white cursor-not-allowed"
              : "bg-[#E44421] hover:bg-[#DC2807] text-white"
            }`}
          onClick={handleUnlock}
          disabled={!reason.trim() || isSubmitting}
        >
          {isSubmitting ? "UNLOCKING..." : "UNLOCK"}
        </Button>
        <Button
          variant="neutral"
          appearance="ghost"
          className="w-full font-medium py-2 !text-[16px] uppercase hover:underline h-[40px]"
          onClick={handleClose}
        >
          CANCEL
        </Button>
      </div>
    </Modal>
  );
}

