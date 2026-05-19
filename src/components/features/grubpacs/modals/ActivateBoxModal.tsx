"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface ActivateBoxModalProps {
  open: boolean;
  onClose: () => void;
  onReassign?: () => void;
  onActivate: () => void;
  boxNames: string[];
  hasRestaurantAssignment?: boolean;
  loading?: boolean;
  isActivateAll?: boolean;
  totalCount?: number;
  firstBoxName?: string;
}

export default function ActivateBoxModal({
  open,
  onClose,
  onReassign,
  onActivate,
  boxNames,
  hasRestaurantAssignment = false,
  loading = false,
  isActivateAll = false,
  totalCount = 0,
  firstBoxName = "",
}: ActivateBoxModalProps) {
  const getTitle = () => {
    if (isActivateAll) {
      if (totalCount <= 1) return `Activate ${firstBoxName || "box"}?`;
      return `Activate ${firstBoxName} and ${totalCount - 1} other box${totalCount - 1 > 1 ? "es" : ""}?`;
    }
    if (boxNames.length === 0) return "Activate box?";
    if (boxNames.length === 1) {
      return `Activate ${boxNames[0]}?`;
    }
    const firstBox = boxNames[0];
    const otherCount = boxNames.length - 1;
    return `Activate ${firstBox} and ${otherCount} other box${otherCount > 1 ? "es" : ""}?`;
  };

  const getDescription = () => {
    if (hasRestaurantAssignment && onReassign) {
      if (isActivateAll || boxNames.length > 1) {
        return "Some of these boxes were previously assigned to specific locations. Would you like to reassign them to the same?";
      }
      return "This box was previously assigned to a specific location. Would you like to reassign it to the same?";
    }
    if (isActivateAll) {
      return `The action will reactivate all ${totalCount} suspended boxes and they will show up in your list.`;
    }
    if (boxNames.length === 1) {
      return "The action will reactivate the box and it will show up in your list.";
    }
    return "The action will reactivate the selected box" + (boxNames.length > 1 ? "es" : "") + " and they will show up in your list.";
  };

  const getButtonText = () => {
    if (isActivateAll) {
      return `YES, ACTIVATE ${totalCount} BOXES`;
    }
    if (boxNames.length === 1) {
      return "YES, ACTIVATE THE BOX";
    }
    return `YES, ACTIVATE ${boxNames.length} BOXES`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px]"
      height="h-auto"
      closeOnOutsideClick={false}
    >
      {/* Content */}
      <div className="flex flex-col gap-6 px-6 pb-6">
        {/* Text content */}
        <div className="flex flex-col gap-2 items-start text-center w-full">
          <h2 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)] w-full">
            {getTitle()}
          </h2>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] font-normal text-[var(--gp-color-text-neutral-secondary)] w-full">
            {getDescription()}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 items-center w-full">
          {hasRestaurantAssignment && onReassign ? (
            <>
              <Button
                variant="primary"
                state="press"
                onClick={onReassign}
                disabled={loading}
                className="w-full h-[48px] flex items-center justify-center gap-3"
              >
                <span className="font-[var(--gp-font-interactive)] text-[18px] leading-[22px] font-medium uppercase">
                  {boxNames.length === 1 ? "YES, REASSIGN TO THE SAME RESTAURANT" : "YES, REASSIGN TO THE SAME RESTAURANTS"}
                </span>
              </Button>
              <Button
                variant="primary"
                appearance="outlined"
                state="press"
                onClick={onActivate}
                disabled={loading}
                className="w-full h-[48px] flex items-center justify-center gap-3"
              >
                <span className="font-[var(--gp-font-interactive)] text-[18px] leading-[22px] font-medium uppercase">
                  NO, ACTIVATE THEM AS UNASSIGNED
                </span>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              state="press"
              onClick={onActivate}
              disabled={loading}
              className="w-full h-[48px] flex items-center justify-center gap-3 hover:underline"
            >
              <span className="font-[var(--gp-font-interactive)] text-[18px] leading-[22px] font-medium uppercase">
                {getButtonText()}
              </span>
            </Button>
          )}
          <Button
            variant="neutral"
            appearance="ghost"
            onClick={onClose}
            disabled={loading}
            className="h-9 flex items-center justify-center gap-2 min-w-16 overflow-hidden rounded-[4px] p-[2px] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
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