"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import Radio from "@/components/ui/Radio";

export type ResourceAction = "reassign" | "suspend" | "unassign";

export interface SuspendRestaurantModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (action: ResourceAction) => void;
  restaurantName: string;
  restaurantCount?: number;
  loading?: boolean;
  isWithoutBoxesGroup?: boolean;
  hasAssignedResources?: boolean;
}

const RESOURCE_OPTIONS: Array<{
  value: ResourceAction;
  label: string;
  description: string;
}> = [
    {
      value: "reassign",
      label: "Reassign them",
      description: "You can assign them to a different group",
    },
    {
      value: "suspend",
      label: "Suspend them",
      description: "You can activate them later with their restaurants",
    },
    {
      value: "unassign",
      label: "Unassign them",
      description: "You can mark them as unassigned",
    },
  ];

const getButtonText = (action: ResourceAction | null, isMultiple: boolean): string => {
  if (!action) return "";
  const restaurantText = isMultiple ? "RESTAURANTS" : "RESTAURANT";
  switch (action) {
    case "reassign":
      return `SUSPEND ${restaurantText} & REASSIGN RESOURCES`;
    case "suspend":
      return `SUSPEND ${restaurantText} & RESOURCES`;
    case "unassign":
      return `SUSPEND ${restaurantText} & UNASSIGN RESOURCES`;
    default:
      return "";
  }
};

export default function SuspendRestaurantModal({
  open,
  onClose,
  onConfirm,
  restaurantName,
  restaurantCount = 1,
  loading = false,
  isWithoutBoxesGroup = false,
  hasAssignedResources = true,
}: SuspendRestaurantModalProps) {
  const [selectedAction, setSelectedAction] = useState<ResourceAction | null>(null);
  const isMultiple = restaurantCount > 1;
  const truncatedName = restaurantName.length > 25 ? restaurantName.slice(0, 25) + "..." : restaurantName;

  useEffect(() => {
    if (!open) {
      setSelectedAction(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (isWithoutBoxesGroup || !hasAssignedResources) {
      onConfirm("suspend");
    } else if (selectedAction) {
      onConfirm(selectedAction);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    onClose();
  };

  const getSimpleButtonText = (): string => {
    if (isMultiple) {
      return `YES, SUSPEND ${restaurantCount} RESTAURANTS`;
    }
    return `YES, SUSPEND ${truncatedName.toUpperCase()}`;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[600px]"
      height="h-auto"
      closeOnOutsideClick={true}
    >
      <div className="flex flex-col gap-6 mt-2">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-3 text-center">
            {isMultiple 
              ? `Suspend ${truncatedName} and ${restaurantCount - 1} other restaurant${restaurantCount - 1 > 1 ? 's' : ''}?`
              : `Suspend ${truncatedName}?`
            }
          </h2>
          <p className="text-lg text-[var(--color-neutral-secondary)] font-normal text-center">
            {isMultiple
              ? "This will temporarily disable the restaurants. None of the data or history will be lost. You can reactivate them anytime."
              : "This will temporarily disable the restaurant. None of the data or history will be lost. You can reactivate it anytime."
            }
          </p>
        </div>

        {(isWithoutBoxesGroup || !hasAssignedResources) ? (
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="primary"
              appearance="solid"
              state="press"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full !text-xl h-[48px] hover:underline font-medium"
            >
              {getSimpleButtonText()}
            </Button>
            <Button
              variant="neutral"
              appearance="ghost"
              size="lg"
              onClick={handleClose}
              disabled={loading}
              className="h-9 flex items-center justify-center gap-2 min-w-16 overflow-hidden rounded-[4px] p-[2px]"
          >
            <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase">
              CANCEL
            </span>
            </Button>
          </div>
        ) : (
          <>
            <hr className="border-t border-[var(--color-box-border)]" />

            <div>
              <h3 className="text-lg font-semibold text-[var(--color-neutral-secondary)] mb-4 text-center">
                What do you want to do with the assigned resources?
              </h3>
              <div className="space-y-4 ml-12">
                {RESOURCE_OPTIONS.map((option) => (
                  <Radio
                    key={option.value}
                    checked={selectedAction === option.value}
                    onChange={() => setSelectedAction(option.value)}
                    label={
                      <div>
                        <div className="text-[#37493F] text-lg font-normal">
                          {option.label}
                        </div>
                        <div className="text-[#6B7971] text-base font-normal mt-1">
                          {option.description}
                        </div>
                      </div>
                    }
                    name="resource-action"
                    value={option.value}
                    variant="default"
                  />
                ))}
              </div>
            </div>

            {selectedAction && (
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="primary"
                  appearance="solid"
                  state="press"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full !text-xl h-[48px] font-medium"
                >
                  <span>{getButtonText(selectedAction, isMultiple)}</span>
                </Button>
                <Button
                  variant="neutral"
                  appearance="ghost"
                  size="lg"
                  onClick={handleClose}
                  disabled={loading}
                  className="h-9 flex items-center justify-center gap-2 min-w-16 overflow-hidden rounded-[4px] p-[2px]"
          >
            <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase">
              CANCEL
            </span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

