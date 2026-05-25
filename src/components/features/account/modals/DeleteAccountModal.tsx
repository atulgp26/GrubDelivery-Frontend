"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

type Props = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  onSupport: () => void;
};

export default function DeleteAccountModal({
  open,
  onClose,
  onDelete,
  onSupport,
}: Props) {
  return (
    <Modal open={open} width="w-[604px]" height="h-auto" onClose={onClose} noXPadding={true}>
      <div className="flex flex-col items-center gap-[var(--gp-space-xl,24px)] p-[var(--gp-padding-xl,24px)] relative">
        {/* Illustration */}
        <div className="flex items-center justify-center w-full mt-8">
          <Icon name="account_delete_profile" className="w-[200px] h-[200px]" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-[8px] w-full text-center">
          <h2
            className="text-[24px] font-semibold leading-[32px] text-[var(--gp-color-text-neutral-primary,#03130A)] w-full"
            style={{ fontFamily: "var(--gp-font-heading, Inter)", fontVariantNumeric: "stacked-fractions" }}
          >
            Delete your ownership account?
          </h2>
          <p
            className="text-[18px] font-normal leading-[28px] text-[var(--gp-color-text-neutral-secondary,#37493F)] w-full"
            style={{ fontFamily: "var(--gp-font-text, Inter)", fontVariantNumeric: "stacked-fractions" }}
          >
            Deleting your account will permanently remove your access to your boxes, data, and logs.
          </p>
          <p
            className="text-[18px] font-normal leading-[28px] text-[var(--gp-color-text-neutral-secondary,#37493F)] w-full"
            style={{ fontFamily: "var(--gp-font-text, Inter)", fontVariantNumeric: "stacked-fractions" }}
          >
            This action may disrupt operations tied to your account.
          </p>
        </div>

        {/* Delete Button */}
        <Button
          variant="error"
          appearance="solid"
          size="lg"
          state="press"
          onClick={onDelete}
          className="w-full uppercase text-[18px] !bg-[#79867E] !border-[#79867E]"
        >
          <span className="font-medium">I UNDERSTAND, DELETE MY ACCOUNT</span>
        </Button>

        {/* Divider */}
        <hr className="w-full border-t border-[var(--gp-color-border-neutral,#E0E3E1)] m-0" />

        {/* Help / Transfer Section */}
        <div className="w-full flex items-center gap-[var(--gp-space-m,16px)]">
          <p
            className="flex-1 text-[18px] font-normal leading-[28px] text-[var(--gp-color-text-neutral-secondary,#37493F)]"
            style={{ fontFamily: "var(--gp-font-text, Inter)", fontVariantNumeric: "stacked-fractions" }}
          >
            Need help or want to transfer ownership instead?
          </p>
          <Button
            variant="primary"
            appearance="outlined"
            size="lg"
            state="press"
            onClick={onSupport}
            className="flex-1 uppercase text-[18px]"
          >
            <span className="font-medium">TRANSFER OWNERSHIP</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
