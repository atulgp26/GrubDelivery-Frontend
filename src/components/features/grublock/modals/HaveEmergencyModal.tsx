"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface HaveEmergencyModalProps {
  open: boolean;
  onClose: () => void;
  onEmergencyUnlock: () => void;
  positionClass?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  isMultiSelect?: boolean;
  noBlur?: boolean;
}

export default function HaveEmergencyModal({
  open,
  onClose,
  onEmergencyUnlock,
  positionClass,
  top,
  right,
  bottom,
  left,
  isMultiSelect = false,
  noBlur = false,
}: HaveEmergencyModalProps) {
  const resolvedPositionClass =
    positionClass || (top || right || bottom || left ? "items-start justify-end" : undefined);

  return (
    <Modal
      open={open}
      onClose={onClose}
      positionClass={resolvedPositionClass}
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      hideClose
      noBlur={noBlur}
      width="max-w-[400px]"
    >
      <div className="w-full pt-6 ">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-primary)] mb-2">
          Have an emergency?
        </h2>
        <p className="text-base text-[var(--color-neutral-secondary)] mb-6">
          This will immediately unlock the {isMultiSelect ? "boxes" : "box"} without any OTP verification.
        </p>
        <Button
          variant="primary"
          appearance="solid"
          state="press"
          className="w-full bg-[#E44421] hover:bg-[#DC2807] text-white font-medium text-base py-3 rounded-lg h-[40px]"
          onClick={onEmergencyUnlock}
        >
          EMERGENCY UNLOCK
        </Button>
      </div>
    </Modal>
  );
}

