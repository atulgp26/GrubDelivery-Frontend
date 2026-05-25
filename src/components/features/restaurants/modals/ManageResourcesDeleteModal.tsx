"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import Radio from "@/components/ui/Radio";
import Image from "next/image";

export type DeleteResourceAction = "reassign" | "unassign";

export interface ManageResourcesDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: (action: DeleteResourceAction) => void;
  onSuspend?: () => void;
  restaurantName: string;
  restaurantCount?: number;
  loading?: boolean;
}

const RESOURCE_OPTIONS: Array<{
  value: DeleteResourceAction;
  label: string;
  description: string;
}> = [
  {
    value: "reassign",
    label: "Reassign them",
    description: "You can assign them to a different restaurant",
  },
  {
    value: "unassign",
    label: "Unassign them",
    description: "You can mark them as unassigned",
  },
];

const getButtonText = (action: DeleteResourceAction | null, isMultiple: boolean, restaurantCount: number): string => {
  if (!action) return "";
  const restaurantText = isMultiple ? `${restaurantCount} RESTAURANTS` : "RESTAURANT";
  switch (action) {
    case "reassign":
      return `DELETE ${restaurantText} & REASSIGN RESOURCES`;
    case "unassign":
      return `DELETE ${restaurantText} & UNASSIGN RESOURCES`;
    default:
      return "";
  }
};

export default function ManageResourcesDeleteModal({
  open,
  onClose,
  onBack,
  onConfirm,
  onSuspend,
  restaurantName,
  restaurantCount = 1,
  loading = false,
}: ManageResourcesDeleteModalProps) {
  const [selectedAction, setSelectedAction] = useState<DeleteResourceAction | null>(null);
  const isMultiple = restaurantCount > 1;
  const truncatedName = restaurantName.length > 25 ? restaurantName.slice(0, 25) + "..." : restaurantName;

  useEffect(() => {
    if (!open) {
      setSelectedAction(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedAction) {
      onConfirm(selectedAction);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    onClose();
  };

  const backButton = (
    <Button
      variant="neutral"
      appearance="ghost"
      className="flex gap-2 items-center rounded-[4px] hover:underline text-[var(--color-neutral-secondary)] -ml-2"
      onClick={onBack}
    >
      <Image src="/left-arrow.svg" alt="Back" width={20} height={20} />
      <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase mt-0.5">
        BACK
      </span>
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[604px]"
      closeOnOutsideClick={false}
      noXPadding={true}
      headerLeft={backButton}
    >
      
      <div className="flex flex-col gap-6 px-6 pb-6 pt-2">
        {/* Title */}
        <div className="text-center">
          <h2 className="mx-auto max-w-[520px] text-2xl font-semibold leading-[42px] border-b border-[var(--color-box-border)] text-[var(--color-neutral-primary)] text-center">
            {isMultiple 
              ? `Manage resources before deleting these ${restaurantCount} restaurants.` 
              : `Manage resources before deleting ${truncatedName}.`
            }
          </h2>
        </div>

        {/* Radio Options */}
        <div className="flex flex-col gap-4 items-start">
          <h3 className="text-lg font-semibold text-[#37493F] text-center w-full">
            What do you want to do with the assigned resources?
          </h3>
          <div className="space-y-2 w-full pl-12">
            {RESOURCE_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                checked={selectedAction === option.value}
                onChange={() => setSelectedAction(option.value)}
                label={
                  <div>
                    <div className="text-[#37493F] text-lg font-normal leading-[28px]">
                      {option.label}
                    </div>
                    <div className="text-[#6B7971] text-base font-normal leading-[24px] mt-1">
                      {option.description}
                    </div>
                  </div>
                }
                name="delete-resource-action"
                value={option.value}
                variant="default"
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        {selectedAction ? (
          <div className="flex flex-col gap-4 pt-4 border-t border-[var(--color-box-border)]">
            <Button
              variant="primary"
              appearance="solid"
              state="press"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full h-[56px] !text-[20px] font-medium hover:underline"
            >
              <span>{getButtonText(selectedAction, isMultiple, restaurantCount)}</span>
            </Button>
            <Button
              variant="neutral"
              appearance="ghost"
              onClick={handleClose}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-9 p-[2px] rounded-[4px] hover:underline text-[var(--color-neutral-secondary)]"
            >
              <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase">
                CANCEL
              </span>
            </Button>
          </div>
        ) : onSuspend ? (
          <div className="flex items-start justify-between gap-4 w-full pt-4 border-t border-[var(--color-box-border)]">
            <p className="text-left text-lg text-[#37493F] font-normal leading-[28px]">
              Not sure? You can suspend the {isMultiple ? "restaurants" : "restaurant"} instead.
            </p>
            <Button
              variant="primary"
              appearance="outlined"
              state="press"
              onClick={onSuspend}
              className="min-w-[180px] h-[48px] !text-[18px] font-medium hover:underline"
              disabled={loading}
            >
              <span className="uppercase">SUSPEND</span>
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

