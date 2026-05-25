"use client";

import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface DeleteRestaurantModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSuspend?: () => void;
  onManageResources?: () => void;
  restaurantName: string;
  restaurantCount?: number;
  hasAssignedResources?: boolean;
  isWithoutBoxesGroup?: boolean;
  loading?: boolean;
}

export default function DeleteRestaurantModal({
  open,
  onClose,
  onConfirm,
  onSuspend,
  onManageResources,
  restaurantName,
  restaurantCount = 1,
  hasAssignedResources = true,
  isWithoutBoxesGroup = false,
  loading = false,
}: DeleteRestaurantModalProps) {
  const isMultiple = restaurantCount > 1;
  const othersCount = Math.max(0, restaurantCount - 1);
  const truncatedName = restaurantName.length > 25 ? restaurantName.slice(0, 25) + "..." : restaurantName;

  const getTitle = (): string => {
    if (isMultiple) {
      return `Delete ${truncatedName} and ${othersCount} other restaurant${othersCount === 1 ? "" : "s"}?`;
    }
    return `Delete ${truncatedName}?`;
  };

  const getDescription = (): string => {
    if (isWithoutBoxesGroup || !hasAssignedResources) {
      return isMultiple
        ? "This will permanently delete the restaurants. This action cannot be undone. Your historical logs will remain."
        : "This will permanently delete the restaurant. This action cannot be undone. Your historical logs will remain.";
    }
    
    if (hasAssignedResources) {
      return isMultiple
        ? "This will permanently delete the restaurants. Since there are some assigned resources, you'll have to manage them first."
        : "This will permanently delete the restaurant. Since there are some assigned resources, you'll have to manage them first.";
    }

    return isMultiple
      ? "This will permanently delete the restaurants. None of the data or history will be lost. You can reactivate them anytime."
      : "This will permanently delete the restaurant. None of the data or history will be lost. You can reactivate it anytime.";
  };

  const getButtonText = (): string => {
    if (isWithoutBoxesGroup) {
      return isMultiple
        ? `I UNDERSTAND, DELETE ${restaurantCount} RESTAURANTS`
        : `I UNDERSTAND, DELETE ${truncatedName.toUpperCase()}`;
    }

    if (hasAssignedResources) {
      return "I UNDERSTAND, GO TO MANAGE RESOURCES";
    }
    return isMultiple
      ? `I UNDERSTAND, DELETE ${restaurantCount} RESTAURANTS`
      : `I UNDERSTAND, DELETE ${truncatedName.toUpperCase()}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[680px]"
      closeOnOutsideClick={false}
      noXPadding={true}
    >
      <div className="flex flex-col items-center text-center p-6">

        {/* Illustration */}
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/map_location.svg"
            alt="Location icon"
            width={120}
            height={120}
          />
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-2 items-center text-center w-full mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-neutral-primary)] leading-[32px]">
            {getTitle()}
          </h2>
          <p className="text-lg text-[#37493F] font-normal leading-[28px]">
            {getDescription()}
          </p>
          {hasAssignedResources && (
            <div className="flex gap-2 items-center justify-center text-lg text-[#37493F] font-normal leading-[28px]">
              <span>⚠</span>
              <span>This action cannot be undone. Your historical logs will remain.</span>
            </div>
          )}
        </div>

        {/* Primary Button */}
        <Button
          variant="neutral"
          appearance="solid"
          state="press"
          className="w-full h-[48px] !text-[18px] font-medium"
          onClick={hasAssignedResources && !isWithoutBoxesGroup && onManageResources ? onManageResources : onConfirm}
          disabled={loading}
        >
          <span>{getButtonText()}</span>
        </Button>

        {/* Suspend Option - Only show if onSuspend is provided */}
        {onSuspend && (
          <>
            <div className="w-full border-t border-[var(--color-box-border)] my-6"></div>
            <div className="flex gap-4 items-center justify-between w-full">
              <p className="flex-1 text-left text-lg text-[#37493F] font-normal leading-[28px]">
                Not sure? You can suspend the {isMultiple ? "restaurants" : "restaurant"} instead.
              </p>
              <Button
                variant="primary"
                appearance="outlined"
                state="press"
                onClick={onSuspend}
                className="flex-1 h-[48px] !text-[18px] font-medium "
                disabled={loading}
              >
                <span>
                  SUSPEND
                </span>
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

