"use client";

import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { COUNTRIES } from "@/components/ui/phone-dropdown";

interface Recipient {
  name?: string;
  phone?: string;
  countryCode?: string;
}

interface UnlockBoxModalProps {
  open: boolean;
  onClose: () => void;
  recipient?: Recipient;
  onEdit?: () => void;
  onEmergencyUnlock?: () => void;
  positionClass?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  isMultiSelect?: boolean;
  noBlur?: boolean;
}

export default function UnlockBoxModal({
  open,
  onClose,
  recipient,
  onEdit,
  onEmergencyUnlock,
  positionClass,
  top,
  right,
  bottom,
  left,
  isMultiSelect = false,
  noBlur = false,
}: UnlockBoxModalProps) {
  const getDialCode = (code?: string) => {
    if (!code) return "";
    // If it already contains a '+', it might be a dial code instead of country code
    if (code.includes("+")) return code;
    const country = COUNTRIES.find((c) => c.code === code);
    return country ? country.dialCode : "";
  };

  return (
    <Modal
      open={open}
      hideClose
      onClose={onClose}
      positionClass={positionClass}
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      noBlur={noBlur}
    >
      <div className="max-w-[350px] w-full mx-auto pt-7 ">
        <div className="font-semibold text-lg text-[var(--color-neutral-primary)] mb-1">
          Box secured!
        </div>
        <div className="text-[var(--color-neutral-secondary)] text-base">
          An OTP will be sent to the recipient when the handler starts the delivery.
        </div>

        <div className="flex flex-col gap-2  pt-8 pb-6 pl-4">
          <div className="flex items-center gap-2 text-[var(--color-neutral-secondary)] text-base">
            <img src="/user.svg" alt="User" className="w-4 h-4" />
            {recipient?.name || "-"}
          </div>
          <div className="flex items-center gap-2 text-[var(--color-neutral-secondary)] text-base">
            <img src="/Settings/phone.svg" alt="Phone" className="w-4 h-4" />
            {recipient?.phone ? `${getDialCode(recipient.countryCode)}${getDialCode(recipient.countryCode) ? " " : ""}${recipient.phone}` : "-"}
          </div>
        </div>

        <Button
          variant="primary"
          appearance="outlined"
          state="press"
          className="w-full font-medium h-[40px]"
          onClick={onEdit}
        >
          <span>EDIT DETAILS</span>
        </Button>

        <div className="border-t border-gray-200 my-6" />

        <div className="font-semibold text-lg text-[var(--color-neutral-primary)] mb-1">
          Have an emergency?
        </div>
        <div className="text-[var(--color-neutral-secondary)] text-base mb-4">
          This will immediately unlock the box without any OTP verification.
        </div>

        <Button
          variant="primary"
          appearance="solid"
          state="press"
          className="w-full font-medium h-[40px]"
          onClick={onEmergencyUnlock}
        >
          <span>EMERGENCY UNLOCK</span>
        </Button>
      </div>
    </Modal>
  );
}

