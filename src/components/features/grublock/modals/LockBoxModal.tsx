"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";

import Modal from "@/components/ui/Modal";
import { getContextualErrorMessage } from "@/lib/errors";

const INDIA_LOCAL_DIGITS = 10;
const FULL_NAME_MAX_LENGTH = 50;
const NAME_SANITIZE_REGEX = /[^\p{L}\s'-]/gu;
const NAME_INVALID_CHAR_REGEX = /[^\p{L}\s'-]/u;

const toDigits = (value: string): string => value.replace(/\D/g, "");

const sanitizeContactInput = (value: string): string => {
  let digits = toDigits(value);
  digits = digits.replace(/^0+/, "");
  return digits.slice(0, INDIA_LOCAL_DIGITS);
};

const sanitizeNameInput = (value: string): string =>
  value.replace(NAME_SANITIZE_REGEX, "").slice(0, FULL_NAME_MAX_LENGTH);

const normalizeIndianContact = (value: string): string | null => {
  const digits = toDigits(value);
  if (digits.length === INDIA_LOCAL_DIGITS) return digits;
  return null;
};

interface Recipient {
  name?: string;
  phone?: string;
  countryCode?: string;
}

interface LockBoxModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (recipient: Recipient) => void;
  isSubmitting?: boolean;
  mode?: "lock" | "edit";
  initialValues?: Recipient;
  positionClass?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  noBlur?: boolean;
}

export default function LockBoxModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  mode = "lock",
  initialValues = {},
  positionClass,
  top,
  right,
  bottom,
  left,
  noBlur = false,
}: LockBoxModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState(initialValues.countryCode || "IN");
  const [error, setError] = useState("");

  const trimmedName = name.trim();
  const normalizedPhone = normalizeIndianContact(phone);
  const isNameCharacterValid = !NAME_INVALID_CHAR_REGEX.test(trimmedName);
  const isNameValid = trimmedName !== "" && isNameCharacterValid;
  const isPhoneValid = normalizedPhone !== null;
  const isValid = isNameValid && isPhoneValid;

  useEffect(() => {
    if (open) {
      if (mode === "edit") {
        setName(initialValues.name || "");
        setPhone(initialValues.phone || "");
      } else {
        setName("");
        setPhone("");
      }
      setCountryCode(initialValues.countryCode || "IN");
      setError("");
    }
  }, [open, initialValues, mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmedName || !phone.trim()) {
      setError("Please enter recipient's name and phone number.");
      return;
    }

    if (!isNameCharacterValid) {
      setError("Name can only include letters, spaces, apostrophes, and hyphens.");
      return;
    }

    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        name: trimmedName,
        phone: normalizedPhone,
        countryCode,
      });
    } catch (submitError) {
      setError(
        getContextualErrorMessage(
          "box.lock",
          submitError,
          "Could not lock box. Please try again.",
        ),
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      positionClass={positionClass}
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      noBlur={noBlur}
      hideClose
    >
     <form
  className="max-w-[340px] w-full pt-3 mx-auto flex flex-col gap-2"
  onSubmit={handleSubmit}
>
        <div className="font-semibold text-lg text-[var(--color-neutral-primary)]">
          Ready to lock the box?
        </div>
        <div className="text-[var(--color-neutral-secondary)] text-base mb-4">
          Enter the recipient’s details. An OTP will be sent to the number you provide when the handler initiates the drop-off.
        </div>

        <div className="flex flex-col gap-4">
          <TextField
            type="text"
            value={name}
            placeholder="Full name"
            leadingIcon={
              <img
                src="/user.svg"
                alt="User"
                className="w-5 h-5"
              />
            }
            onChange={(e) => {
              setName(sanitizeNameInput(e.target.value));
              if (error) setError("");
            }}
            maxLength={FULL_NAME_MAX_LENGTH}
            state="press"
            hasHoverEffect
          />

          <div>
            <div className="flex items-center gap-3 rounded-lg border border-[var(--gp-color-border-neutral)] bg-white h-12 px-4 w-full">
              <img src="/Settings/phone.svg" alt="Phone" className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium text-[var(--gp-color-text-neutral-primary)] whitespace-nowrap">+91</span>
              <div className="shrink-0 self-stretch w-px bg-[#e0e3e1]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(sanitizeContactInput(e.target.value));
                  if (error) setError("");
                }}
                placeholder="00000 00000"
                className="flex-1 min-w-0 bg-transparent outline-none border-none text-[16px] leading-[24px] text-[#37493f] placeholder:text-[var(--gp-color-text-neutral-light)]"
                style={{ fontFamily: "var(--gp-font-text)", fontWeight: 400 }}
              />
            </div>
          </div>
        </div>

        {error && <div className="text-red-500 text-xs mb-2">{error}</div>}

     <div className="flex flex-row items-center justify-center gap-2 mt-2">
  <Button
    variant="primary"
    appearance="outlined"
    state="press"
    className="flex-1 h-[40px] text-xs"
    type="submit"
    disabled={!isValid || isSubmitting}
  >
    {isSubmitting ? "SAVING..." : mode === "edit" ? "SAVE" : "SAVE AND LOCK"}
  </Button>
  <Button
    variant="neutral"
    appearance="ghost"
    state="press"
    className="flex-1 h-[40px] text-xs"
    type="button"
    onClick={onClose}
  >
    CANCEL
  </Button>
</div>
      </form>
    </Modal>
  );
}

