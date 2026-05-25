"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface IoniserDropdownProps {
  onConfirm: (action: "on" | "off") => void;
  onCancel: () => void;
}

export default function IoniserDropdown({ onConfirm, onCancel }: IoniserDropdownProps) {
  const [selectedAction, setSelectedAction] = useState<"on" | "off" | null>(null);

  const handleConfirm = () => {
    if (selectedAction) {
      onConfirm(selectedAction);
    }
  };

  return (
    <div className="bg-white border border-[var(--gp-color-stroke-neutral-secondary)] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] w-[240px] overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2">
        <p className="text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
          Take action on selected boxes :
        </p>
      </div>

      {/* Turn Ioniser OFF */}
      <button
        onClick={() => setSelectedAction("off")}
        className={`w-full border-t border-[var(--gp-color-stroke-neutral-secondary)] px-4 py-3 flex items-center transition-colors hover:bg-[var(--gp-color-bg-brand-tertiary)] ${
          selectedAction === "off" ? "bg-[var(--gp-color-bg-brand-tertiary)]" : "bg-white"
        }`}
      >
        <span className="inline-flex items-center px-2 py-1 rounded-full border border-[var(--gp-color-stroke-error-border)] bg-[var(--gp-color-bg-colored-secondary)] text-[var(--gp-color-text-error-primary)] text-[14px] font-medium leading-[16px] uppercase whitespace-nowrap">
          Turn ioniser off
        </span>
      </button>

      {/* Turn Ioniser ON */}
      <button
        onClick={() => setSelectedAction("on")}
        className={`w-full border-t border-[var(--gp-color-stroke-neutral-secondary)] px-4 py-3 flex items-center transition-colors hover:bg-[var(--gp-color-bg-success-tertiary)] ${
          selectedAction === "on" ? "bg-[var(--gp-color-bg-success-tertiary)]" : "bg-white"
        }`}
      >
        <span className="inline-flex items-center px-2 py-1 rounded-full border border-[var(--gp-color-stroke-success-primary)] bg-[var(--gp-color-bg-success-secondary)] text-[var(--gp-color-text-success-primary)] text-[14px] font-medium leading-[16px] uppercase whitespace-nowrap">
          Turn ioniser on
        </span>
      </button>

      {/* Footer */}
      <div className="border-t border-[var(--gp-color-stroke-neutral-secondary)] px-4 py-3 flex items-center justify-between">
        <Button
          variant="neutral"
          appearance="ghost"
          onClick={onCancel}
          className="text-[14px] font-medium leading-[16px] uppercase"
        >
          <span>Cancel</span>
        </Button>
        <Button
          variant="neutral"
          appearance="ghost"
          onClick={handleConfirm}
          disabled={!selectedAction}
          className="flex items-center gap-1 text-[14px] font-medium leading-[16px] uppercase"
        >
          <Image
            src={selectedAction ? "/Employee/Multiselect/check.svg" : "/GrubPac/GrubPac/Multiselect/Multiselect/dropdown/check.svg"}
            alt=""
            width={16}
            height={16}
          />
          <span className={selectedAction ? "text-[var(--gp-color-text-brand-primary)]" : ""}>
            Confirm
          </span>
        </Button>
      </div>
    </div>
  );
}

