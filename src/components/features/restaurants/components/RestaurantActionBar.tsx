import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FiCheck, FiX } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";

interface RestaurantActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  deleteLabel?: string;
  activateLabel?: string;
}

export default function RestaurantActionBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onActivate,
  deleteLabel = "DELETE SELECTION",
  activateLabel = "ACTIVATE SELECTION",
}: RestaurantActionBarProps) {
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
        type="button"
        variant="neutral"
        appearance="outlined"
        state="press"
        className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg bg-white border-[#c1c7c4]"
        onClick={onClearSelection}
      >
        <FiX className="w-5 h-5 text-[#37493f]" />
        <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[#37493f]">
          {selectedCount} SELECTED
        </span>
      </Button>

      {/* Actions */}
      <div className="flex-1 flex items-center justify-end gap-4">
        {onDelete && (
          <Button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg"
            variant="neutral"
            appearance="ghost"
          >
            <RiDeleteBinLine className="w-5 h-5 text-[var(--gp-color-text-neutral-tertiary)]" />
            <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
              <span>{deleteLabel}</span>
            </span>
          </Button>
        )}
        {onActivate && (
          <Button
            type="button"
            variant="neutral"
            appearance="ghost"
            onClick={onActivate}
            className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg hover:bg-[rgba(254,72,11,0.08)] transition-colors group"
          >
            <FiCheck className="w-5 h-5 text-[var(--gp-color-text-brand)]" />
            <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-brand)]">
              <span>{activateLabel}</span>
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}