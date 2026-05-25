"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface EmployeeActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  deleteLabel?: string;
  activateLabel?: string;
}

export default function EmployeeActionBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onActivate,
  deleteLabel = "DELETE SELECTION",
  activateLabel = "ACTIVATE SELECTION",
}: EmployeeActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-3 bg-[#eff1f0] border border-[#c1c7c4] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] flex items-center gap-4 px-4 py-3 z-50"
      style={{ left: "var(--table-action-bar-left, 1rem)", right: "1rem" }}
    >
      {/* Selection count button */}
      <Button
        variant="neutral"
        appearance="outlined"
        state="press"
        className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg !bg-white"
        onClick={onClearSelection}
      >
        <Image src="/Employee/Multiselect/x.svg" alt="Clear" width={20} height={20} />
        <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase">
          {selectedCount} SELECTED
        </span>
      </Button>

      {/* Actions */}
      <div className="flex-1 flex items-center justify-end gap-4">
        {onDelete && (
          <Button
            onClick={onDelete}
            className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg hover:bg-[rgba(254,72,11,0.08)] transition-colors"
            variant="neutral"
        appearance="ghost"
          >
            <Image src="/Employee/Multiselect/trash.svg" alt="Delete" width={16}  height={16} />
            <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
              {deleteLabel}
            </span>
          </Button>
        )}
        {onActivate && (
          <button
            onClick={onActivate}
            className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg hover:bg-[rgba(254,72,11,0.08)] transition-colors"
          >
            <Image src="/Employee/Multiselect/check.svg" alt="Activate" width={16} height={16} />
            <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-brand)]">
              {activateLabel}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

