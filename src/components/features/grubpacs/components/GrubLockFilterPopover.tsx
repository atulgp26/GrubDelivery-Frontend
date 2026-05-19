"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import ToggleButton from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";

export default function GrubLockFilterPopover({
  open,
  onClose,
  onApply,
  initialFilters = defaultFilters,
  positionClass = "items-center justify-end",
  top="pb-56",
  noBlur,
  noPaddingX="!px-0"
}: {
  open: boolean;
  onClose: () => void;
  onApply: (filters: typeof defaultFilters) => void;
  initialFilters?: typeof defaultFilters;
  positionClass?: string;
  top?: string;
  noBlur?: boolean;
  noPaddingX?: string;
}) {
  const [filters, setFilters] = useState(initialFilters);  

  return (
    <Modal open={open} onClose={onClose} positionClass={positionClass} top={top} noBlur={noBlur}>
      <div className=" max-w-full  bg-white rounded-lg">
        <div className="font-medium text-[var(--color-neutral-secondary)] text-sm px-6 mb-6">GrubLock</div>
        <div className="grid grid-cols-2 space-x-4 pb-3 px-6 border-b border-[var(--color-stroke-neutral)]">
          {grublockStatuses.map((status: { name: string; value: string; bgColor: string; textColor: string; border: string }) => (
            <label
              key={status.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center ${
                  filters.grublock.includes(status.value)
                    ? status.bgColor
                    : status.border
                }`}
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    grublock: prev.grublock.includes(status.value)
                      ? prev.grublock.filter((s) => s !== status.value)
                      : [...prev.grublock, status.value],
                  }));
                }}
              >
                {filters.grublock.includes(status.value) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className={`${status.textColor} mr-16 text-lg`}>
                {status.name}
              </span>
            </label>
          ))}
        </div>
        <div className="font-medium text-[var(--color-neutral-secondary)] px-6 text-sm py-4">Linked information</div>
                  <div className="flex items-center gap-2 py-3 px-6 border-b border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)]">
            <ToggleButton
              label="Group assigned"
              checked={filters.groupAssigned}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, groupAssigned: val }))
              }
            />Department assigned</div>

        <div className="flex items-center justify-between px-6 pt-3 gap-4">
          <Button
          variant="neutral"
            className=" text-[var(--primary-gray)] btn-size-filter-md-lg bg-white font-medium py-3 hover:text-[var(--gray-400)] px-3 rounded-lg text-base"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
          variant="primary"
            className="group text-[var(--primary)] btn-size-filter-md-lg border border-[var(--primary)] hover:bg-[var(--primary-hover)] hover:text-white font-medium py-2 px-4 rounded-lg text-base flex items-center justify-center"
            onClick={() => onApply(filters)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 hover:text-white"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span className="whitespace-nowrap">
            <span>FILTER BOXES</span>
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const grublockStatuses = [
  {
    name: "Lock available",
    value: "Locked",
    bgColor: "bg-[var(--color-success)]",
    textColor: "text-[var(--color-neutral-secondary)]",
    border:"border border-[var(--color-success)]",
  },
  {
    name: "No lock available",
    value: "No lock available",
    bgColor: "bg-[var(--color-checkbox-bg)]",
    textColor: "text-[var(--color-neutral-secondary)]",
    border:"border border-[var(--color-checkbox-bg)]",
  },
];

const defaultFilters = {
  grublock: ["Locked", "No lock available"],
  groupAssigned: false,
};