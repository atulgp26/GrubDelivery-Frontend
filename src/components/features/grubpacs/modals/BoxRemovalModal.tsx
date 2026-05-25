"use client";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

type BoxRemovalModalVariant = "active" | "suspended";

export default function BoxRemovalModal({
  open,
  onClose,
  selectedCount = 5,
  handleRemoveBoxes,
  onTransferOwnership,
  description,
  variant = "active",
}: {
  open: boolean;
  onClose: () => void;
  selectedCount?: number;
  handleRemoveBoxes?: () => void;
  onTransferOwnership?: () => void;
  description?: string;
  variant?: BoxRemovalModalVariant;
}) {
  const isSuspendedVariant = variant === "suspended";
  const isSingleSelection = selectedCount <= 1;

  const titleText = "Box removal not allowed";

  const activePrimaryText = isSingleSelection
    ? "You cannot remove this GrubPac from your account as it is a purchased device and part of your active inventory."
    : "Since these are purchased devices, the selected GrubPacs cannot be removed from your account.";

  const activeSecondaryText = isSingleSelection
    ? "If you're not using it currently, you can suspend the box to avoid accidental usage or assignment."
    : "If they are not currently in use, consider suspending them to prevent accidental usage or assignment.";

  const suspendedPrimaryText =
    "You cannot remove this GrubPac from your account as it is a purchased device and part of your active inventory.";

  const primaryMessage = description || (isSuspendedVariant ? suspendedPrimaryText : activePrimaryText);

  const buttonText = isSuspendedVariant
    ? "I UNDERSTAND"
    : isSingleSelection
    ? "I UNDERSTAND, SUSPEND THE BOX"
    : `I UNDERSTAND, SUSPEND THE ${selectedCount} BOXES`;

  const transferOwnershipText = isSingleSelection || isSuspendedVariant
    ? "Transferring ownership? Assign this box to a new owner."
    : "Transferring ownership? Assign these boxes to a new owner.";

  return (
    <Modal open={open} onClose={onClose} width="w-[654px] max-w-full" height="max-h-full">
      <div className="flex flex-col items-center justify-center h-full w-full text-center mt-8">
        {/* Warning Icon */}
        <div className="mb-6">
          <Image src="/exclamation-triangle.svg" width={120} height={120} alt="warning_image" />
        </div>

        <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-4">
          {titleText}
        </h2>

        <p className={` text-[var(--color-neutral-secondary)] text-lg mb-2 px-4`}>
          {primaryMessage}
        </p>

        {!isSuspendedVariant && (
          <p className="text-[var(--color-neutral-secondary)] text-lg mb-8 px-4">
            {activeSecondaryText}
          </p>
        )}

        {isSuspendedVariant && <div className="mb-8" />}

        <Button
          variant="primary"
          appearance="solid"
          state="press"
          className="w-full h-12 bg-[#6b7971] border-[#6b7971] hover:bg-[#5a6660] hover:underline active:bg-[#5a6660] text-white font-medium text-[18px] leading-[22px] uppercase rounded-lg transition"
          onClick={() => {
            if (handleRemoveBoxes) {
              void handleRemoveBoxes();
              return;
            }
            onClose();
          }}
        >
          {buttonText}
        </Button>
        <div className="border-t border-[var(--color-box-border)] w-full my-6"></div>
        <div className="w-full flex items-center justify-between gap-4">
          <span className="text-lg text-[var(--color-neutral-secondary)] text-left">
            {transferOwnershipText}
          </span>
          {onTransferOwnership ? (
            <Button
              variant="primary"
              appearance="outlined"
              state="press"
              size="lg"
              className="h-[48px] px-16"
              onClick={onTransferOwnership}
            >
              TRANSFER OWNERSHIP
            </Button>
          ) : (
            <Link href="/transfer-ownership">
              <Button
                variant="primary"
                appearance="outlined"
                state="press"
                size="lg"
                className="h-[48px] px-16"
              >
                TRANSFER OWNERSHIP
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Modal>
  );
}