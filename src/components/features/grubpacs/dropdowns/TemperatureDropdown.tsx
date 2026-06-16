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

  const clampValue = (val: string): string => {
    const num = Number(val);
    if (val === "" || val === "-") return val;
    if (!Number.isFinite(num)) return "";
    if (num > 30) return "30";
    if (num < -20) return "-20";
    return val;
  };

  const handleZone1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZone1(clampValue(e.target.value));
  };

  const handleZone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZone2(clampValue(e.target.value));
  };

  const canConfirm = zone1.trim() !== "";

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm({ zone1, zone2, dualZone });
    }
  };

  return (
    <div className="bg-white border border-[var(--gp-color-stroke-neutral-secondary)] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-4 w-full min-w-0">
      {/* Header */}
      <p className="text-[14px] text-[var(--gp-color-text-neutral-secondary)] mb-3">
        Take action on selected boxes :
      </p>

      {/* Dual Zone Toggle */}
      <button
        onClick={() => setDualZone((prev) => !prev)}
        className="flex items-center gap-2 mb-3 w-full text-left"
      >
        {dualZone ? (
          <span className="inline-flex items-center justify-center w-4 h-4 flex-shrink-0 rounded-sm bg-[#59786A] text-white text-xs font-bold leading-none">
            −
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-4 h-4 flex-shrink-0 rounded-sm border border-[var(--gp-color-stroke-neutral-secondary)] bg-white" />
        )}

        <span className="text-[16px] font-medium text-[#44544B] whitespace-nowrap">
          Dual zone on
        </span>

        {dualZone && (
          <span className="text-[14px] text-[var(--gp-color-text-neutral-secondary)] whitespace-nowrap">
            (Mixed settings)
          </span>
        )}
      </button>

      {/* Divider */}
      <div className="border-t border-[var(--gp-color-stroke-neutral-secondary)] mb-3" />

      {/* Zone Inputs — always side by side, stack only on very small screens */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Zone 1 */}
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[var(--gp-color-text-neutral-secondary)] mb-1 whitespace-nowrap">
            Zone 1 (Primary)
          </p>
          <TextField
            size="sm"
            type="number"
            value={zone1}
            onChange={handleZone1Change}
            placeholder="Set temp"
            max={30}
            min={-20}
            trailingIcon={<span className="text-[13px]">(°C)</span>}
            className="text-right w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* Zone 2 */}
        <div className="min-w-0">
          <p className={`text-[12px] font-medium mb-1 whitespace-nowrap ${!dualZone ? "text-[var(--gp-color-text-neutral-tertiary)]" : "text-[var(--gp-color-text-neutral-secondary)]"}`}>
            Zone 2 (Secondary)
          </p>
          <TextField
            type="number"
            size="sm"
            value={dualZone ? zone2 : ""}
            onChange={handleZone2Change}
            disabled={!dualZone}
            max={30}
            min={-20}
            placeholder={dualZone ? "Set temp" : "-"}
            trailingIcon={<span className="text-[13px]">(°C)</span>}
            className="text-right w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            containerClassName={!dualZone ? "opacity-50" : ""}
          />
        </div>
      </div>

      {/* Range hint */}
      <p className="text-[11px] text-[var(--gp-color-text-neutral-tertiary)] text-center mb-2">
        Range: -20°C to 30°C
      </p>

      {/* Divider */}
      <div className="border-t border-[var(--gp-color-stroke-neutral-secondary)] my-3" />

      {/* Footer Buttons */}
      <div className="pt-1 flex items-center justify-between gap-2">
        <Button
          variant="neutral"
          appearance="ghost"
          onClick={onCancel}
          className="text-[13px] font-medium leading-[16px] uppercase"
        >
          <span>Cancel</span>
        </Button>
        <Button
          variant="neutral"
          appearance="ghost"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="flex items-center gap-1 text-[13px] font-medium leading-[16px] uppercase"
        >
          <Image
            src={
              canConfirm
                ? "/Employee/Multiselect/check.svg"
                : "/GrubPac/GrubPac/Multiselect/Multiselect/dropdown/check.svg"
            }
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