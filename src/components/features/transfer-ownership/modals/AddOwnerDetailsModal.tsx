"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import FigIcon from "@/components/ui/FigIcon";
import { FaChevronRight } from "react-icons/fa6";
import { COUNTRIES } from "../data/regionData";
import RegionSelect from "../components/RegionSelect";
import { useTransferForm } from "../hooks/useTransferForm";
import type { NewOwnerFormData } from "../hooks/useTransferForm";

export type { NewOwnerFormData };

interface AddOwnerDetailsModalProps {
  open: boolean;
  onCloseAction: () => void;
  onBackAction: () => void;
  onNextAction: (data: NewOwnerFormData) => void;
}

export default function AddOwnerDetailsModal({
  open,
  onCloseAction,
  onBackAction,
  onNextAction,
}: AddOwnerDetailsModalProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const {
    form,
    set,
    setForm,
    handleCountryChange,
    handleStateChange,
    isValid,
    isFullNameValid,
    isEmailValid,
    stateOptions,
    reset,
  } = useTransferForm();

  const handleClose = () => {
    setSubmitAttempted(false);
    reset();
    onCloseAction();
  };

  const handleBack = () => {
    setSubmitAttempted(false);
    onBackAction();
  };

  const handleNext = () => {
    setSubmitAttempted(true);
    if (!isValid) return;
    onNextAction(form);
  };

  const missingFields: string[] = [];
  if (!form.fullName.trim()) missingFields.push("Full name");
  else if (!isFullNameValid) missingFields.push("Full name cannot contain numeric values");
  if (!form.organisationName.trim()) missingFields.push("Organisation name");
  if (form.phone.trim().length !== 10) missingFields.push("Valid phone number");
  if (!isEmailValid) missingFields.push("Valid email address");
  if (!form.country) missingFields.push("Country");
  if (!form.state) missingFields.push("State/Province");

  const backButton = (
    <Button
      variant="neutral"
      appearance="ghost"
      className="rounded-lg flex items-center justify-center gap-2"
      onClick={handleBack}
      aria-label="Back"
    >
      <FigIcon name="left-arrow" size={20} />
      <span className="text-xl ml-1 font-medium">BACK</span>
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[594px] max-w-full"
      height="h-auto max-h-[90vh]"
      noXPadding
      closeOnOutsideClick={false}
      headerLeft={backButton}
    >
      <div className="flex flex-col w-full overflow-hidden">
        {/* ── Scrollable form body ── */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-6 pb-6">
          {/* Title */}
          <h1
            className="font-semibold text-[var(--gp-color-text-neutral-primary)]"
            style={{ fontSize: "24px", lineHeight: "32px" }}
          >
            Add new owner details
          </h1>

          {/* Basic details */}
          <div className="flex flex-col gap-4">
            <Label className="text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] font-normal">
              Basic details
            </Label>
            <div className="flex gap-4 w-full">
              <div className="flex-1 min-w-0">
                <TextField
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) => set("fullName")(e.target.value)}
                  maxLength={50}
                  hasHoverEffect
                  state="press"
                />
              </div>
              <div className="flex-1 min-w-0">
                <TextField
                  placeholder="Organisation name"
                  value={form.organisationName}
                  onChange={(e) => set("organisationName")(e.target.value)}
                  maxLength={80}
                  hasHoverEffect
                  state="press"
                />
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-4">
            <Label className="text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] font-normal">
              Contact details
            </Label>
            <div className="flex gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--gp-color-border-neutral)] bg-white h-12 px-4 w-full">
                    <span className="text-sm font-medium text-[var(--gp-color-text-neutral-primary)] whitespace-nowrap">+91</span>
                    <div className="shrink-0 self-stretch w-px bg-[#e0e3e1]" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone")(e.target.value.replace(/\D/g, ""))}
                      placeholder="00000 00000"
                      className="flex-1 min-w-0 bg-transparent outline-none border-none text-[16px] leading-[24px] text-[#37493f] placeholder:text-[var(--gp-color-text-neutral-light)]"
                      style={{ fontFamily: "var(--gp-font-text)", fontWeight: 400 }}
                    />
                  </div>
                </div>
              <div className="flex-1 min-w-0">
                <TextField
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  trailingIcon={
                    <Image
                      src={isEmailValid ? "/Settings/Popup/check.svg" : "/x.svg"}
                      alt={isEmailValid ? "Valid email" : "Invalid email"}
                      width={20}
                      height={20}
                    />
                  }
                  trailingIconClassName="pointer-events-none"
                  hasHoverEffect
                  state="press"
                />
              </div>
            </div>
          </div>

          {/* Region */}
          <div className="flex flex-col gap-4">
            <Label className="text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] font-normal">
              Region
            </Label>
            <div className="flex gap-4 w-full">
              <div className="flex-1 min-w-0">
                <RegionSelect
                  value={form.country}
                  onValueChange={handleCountryChange}
                  placeholder="Select country"
                  options={COUNTRIES}
                />
              </div>
              <div className="flex-1 min-w-0">
                <RegionSelect
                  value={form.state}
                  onValueChange={handleStateChange}
                  placeholder="Select state/province"
                  options={stateOptions}
                  disabled={!form.country || stateOptions.length === 0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-[var(--gp-color-border-neutral)] px-6 py-4 shrink-0">
          <Button
            variant="primary"
            appearance="solid"
            state="press"
            size="xl"
            onClick={handleNext}
            disabled={false}
            className={cn(
              "w-full gap-3 flex items-center justify-center",
              true
                ? "bg-[var(--gp-color-brand-primary)] border-[var(--gp-color-brand-border)] text-white"
                : "!bg-[var(--gp-color-bg-button-primary-disabled)] !border-[var(--gp-color-border-neutral)] !text-[var(--gp-color-text-disabled)]"
            )}
          >
            <span>NEXT</span>
            <FaChevronRight className="w-5 h-5" />
          </Button>
          {submitAttempted && !isValid ? (
            <p className="mt-2 text-sm text-red-500">
              Please complete required fields: {missingFields.join(", ")}.
            </p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
