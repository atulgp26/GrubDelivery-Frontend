"use client";

import { useState } from "react";
import Image from "next/image";
import { TextField } from "@/components/ui/text-field";
import Button from "@/components/ui/Button";

export interface TemperatureSettings {
  zone1: string;
  zone2: string;
  dualZone: boolean;
}

interface TemperatureDropdownProps {
  onConfirm: (settings: TemperatureSettings) => void;
  onCancel: () => void;
  /** Initial dual-zone state: true = on (mixed), false = off */
  initialDualZone?: boolean;
}

export default function TemperatureDropdown({
  onConfirm,
  onCancel,
  initialDualZone = true,
}: TemperatureDropdownProps) {
  const [dualZone, setDualZone] = useState(initialDualZone);
  const [zone1, setZone1] = useState("");
  const [zone2, setZone2] = useState("");

  const canConfirm = zone1.trim() !== "";

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm({ zone1, zone2, dualZone });
    }
  };

  return (
    <div className="bg-white border border-[var(--gp-color-stroke-neutral-secondary)] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-4 w-[520px]">
      {/* Header */}
      <p className="text-[14px] text-[var(--gp-color-text-neutral-secondary)] mb-3">
        Take action on selected boxes :
      </p>

      {/* Dual Zone Toggle */}
      <button
        onClick={() => setDualZone((prev) => !prev)}
        className="flex items-center gap-2 mb-3 w-full text-left"
      >
        {/* Toggle indicator */}
        {dualZone ? (
          /* ON / mixed state: filled gray-green square with "−" */
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-[#59786A] text-white text-xs font-bold leading-none flex-shrink-0">
            −
          </span>
        ) : (
          /* OFF state: empty checkbox */
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm border border-[var(--gp-color-stroke-neutral-secondary)] bg-white flex-shrink-0" />
        )}

        <span className="text-[18px] font-medium text-[#44544B]">
          Dual zone on
        </span>

        {dualZone && (
          <span className="text-[18px] text-[var(--gp-color-text-neutral-secondary)]">
            (Mixed settings)
          </span>
        )}
      </button>

      {/* Divider */}
      <div className="border-t border-[var(--gp-color-stroke-neutral-secondary)] mb-3" />

      {/* Zone Inputs */}
      <div className="flex gap-3 mb-4">
        {/* Zone 1 */}
        <div className="flex-1">
          <TextField
            label="Zone 1 (Primary)"
            size="sm"
            type="number"
            value={zone1}
            onChange={(e) => setZone1(e.target.value)}
            placeholder="Set temperature"
            trailingIcon={<span className="text-[16px]">(°C)</span>}
            className="text-right pl-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* Zone 2 */}
        <div className="flex-1">
          <TextField
            label="Zone 2 (Secondary)"
            type="number"
            size="sm"
            value={dualZone ? zone2 : ""}
            onChange={(e) => dualZone && setZone2(e.target.value)}
            disabled={!dualZone}
            placeholder={dualZone ? "Set temperature" : "-"}
            trailingIcon={<span className="text-[16px]">(°C)</span>}
            className="text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            containerClassName={!dualZone ? "opacity-50" : ""}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--gp-color-stroke-neutral-secondary)] my-3" />

      {/* Footer Buttons */}
      <div className="border-t border-[var(--gp-color-stroke-neutral-secondary)] pt-3 flex items-center justify-between">
        <Button
          variant="neutral"
          appearance="ghost"
          onClick={onCancel}
          className="text-[14px] font-medium leading-[16px] uppercase"
        >
          <span>Cancel</span>
        </Button>
        <Button
          variant="neutral"
          appearance="ghost"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="flex items-center gap-1 text-[14px] font-medium leading-[16px] uppercase"
        >
          <Image
            src={canConfirm ? "/Employee/Multiselect/check.svg" : "/GrubPac/GrubPac/Multiselect/Multiselect/dropdown/check.svg"}
            alt=""
            width={16}
            height={16}
          />
          <span className={canConfirm ? "text-[var(--gp-color-text-brand-primary)]" : ""}>
            Confirm
          </span>
        </Button>
      </div>
    </div>
  );
}
