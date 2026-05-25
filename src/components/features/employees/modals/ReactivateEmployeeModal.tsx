"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ReactivateEmployeeModalProps } from "../types";

export type { ReactivateEmployeeModalProps };

export default function ReactivateEmployeeModal({
  open,
  onClose,
  onReassign,
  onActivate,
  employeeNames,
  hasRestaurantAssignment = false,
  loading = false,
  isActivateAll = false,
  totalManagers = 0,
  totalDrivers = 0,
}: ReactivateEmployeeModalProps) {
  const totalCount = isActivateAll ? (totalManagers + totalDrivers) : employeeNames.length;

  const getTitle = () => {
    const displayCount = totalCount;
    if (displayCount === 0) return "Activate employee?";
    if (displayCount === 1) {
      return `Reactivate ${employeeNames[0] || "employee"}?`;
    }
    
    if (employeeNames.length > 0) {
      const firstEmployee = employeeNames[0];
      const otherCount = displayCount - 1;
      return `Activate ${firstEmployee} and ${otherCount} other${otherCount > 1 ? "s" : ""}?`;
    }

    return `Activate all ${displayCount} employees?`;
  };

  const getDescription = () => {
    if (isActivateAll) {
      return "Some of them were previously assigned to specific locations. Would you like to reassign them to the same?";
    }
    if (hasRestaurantAssignment && onReassign) {
      if (employeeNames.length === 1) {
        return "This employee was previously assigned to a location. Would you like to reassign them to the same?";
      }
      return "Some of them were previously assigned to specific locations. Would you like to reassign them to the same?";
    }
    if (employeeNames.length === 1) {
      return "The action will reactivate them and they will show up in your list.";
    }
    return "The action will reactivate the selected employees and they will show up in your list.";
  };

  const getButtonText = () => {
    if (isActivateAll) return "YES, ACTIVATE ALL";
    if (totalCount === 1) return "YES, ACTIVATE THE EMPLOYEE";
    return `YES, ACTIVATE ${totalCount} EMPLOYEES`;
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
      <div className="flex flex-col gap-6 px-6 pb-6 mt-8">
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
                  {employeeNames.length === 1 ? "YES, REASSIGN TO THE SAME RESTAURANT" : "YES, REASSIGN THEM TO THE SAME RESTAURANTS"}
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

