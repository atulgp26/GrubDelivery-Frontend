"use client";

import Image from "next/image";
import { showError } from "@/components/ui/toast";

interface MoreDropdownProps {
  onSuspendBoxes?: () => void;
  onReassignRestaurant?: () => void;
  onRemoveVehicle?: () => void;
  hasVehicle?: boolean;
}

export default function MoreDropdown({
  onSuspendBoxes,
  onReassignRestaurant,
  onRemoveVehicle,
  hasVehicle = true,
}: MoreDropdownProps) {
  return (
    <div className="bg-white border border-[var(--gp-color-stroke-neutral-secondary)] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] w-[240px] overflow-hidden">
      {/* Suspend Boxes */}
      <button
        onClick={onSuspendBoxes}
        className="w-full border-t border-[var(--gp-color-stroke-neutral-secondary)] px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[var(--gp-color-bg-neutral-tertiary)] bg-white"
      >
        <div className="flex-shrink-0 size-5 relative flex items-center justify-center">
          <Image
            src="/Employee/Multiselect/x-circle.svg"
            alt="Suspend"
            width={20}
            height={20}
          />
        </div>
        <span className="text-[14px] font-normal leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
          Suspend boxes
        </span>
      </button>

      {/* Re/assign Restaurant */}
      <button
        onClick={onReassignRestaurant}
        className="w-full border-t border-[var(--gp-color-stroke-neutral-secondary)] px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[var(--gp-color-bg-neutral-tertiary)] bg-white"
      >
        <div className="flex-shrink-0 size-5 relative flex items-center justify-center">
          <Image
            src="/Employee/Multiselect/refresh.svg"
            alt="Reassign"
            width={20}
            height={20}
          />
        </div>
        <span className="text-[14px] font-normal leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
          Re/assign restaurant
        </span>
      </button>

      {/* Remove Vehicle */}
      <button
        onClick={() => {
          if (!hasVehicle) {
            showError("No vehicle assigned to this box.");
            return;
          }
          onRemoveVehicle?.();
        }}
        className={`w-full border-t border-[var(--gp-color-stroke-neutral-secondary)] px-4 py-3 flex items-center gap-3 transition-colors bg-white ${
          hasVehicle
            ? "hover:bg-[var(--gp-color-bg-neutral-tertiary)]"
            : "opacity-40 cursor-not-allowed"
        }`}
      >
        <div className="flex-shrink-0 size-5 relative flex items-center justify-center">
          <Image
            src="/Employee/Multiselect/file-x.svg"
            alt="Remove"
            width={20}
            height={20}
          />
        </div>
        <span className="text-[14px] font-normal leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
          Remove vehicle
        </span>
      </button>
    </div>
  );
}
