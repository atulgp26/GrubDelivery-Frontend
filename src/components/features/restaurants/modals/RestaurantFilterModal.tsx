"use client";

import { forwardRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";

export type ResourceFilterType = "manager" | "driver" | "box";

const RESOURCE_OPTIONS: Array<{ label: string; value: ResourceFilterType }> = [
  { label: "Manager", value: "manager" },
  { label: "Driver", value: "driver" },
  { label: "Box", value: "box" },
];

interface RestaurantFilterModalProps {
  open: boolean;
  onClose: () => void;
  selectedResources: ResourceFilterType[];
  setSelectedResources: Dispatch<SetStateAction<ResourceFilterType[]>>;
  onFilter: (resources: ResourceFilterType[]) => void;
}

const RestaurantFilterModal = forwardRef<HTMLDivElement, RestaurantFilterModalProps>(
  (
    {
      open,
      onClose,
      selectedResources = [],
      setSelectedResources,
      onFilter,
    },
    ref,
  ) => {
    if (!open) return null;

    const handleResourceChange = (value: ResourceFilterType) => {
      setSelectedResources((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-right justify-end right-6 animate-fadeIn">
        <div className="absolute inset-0" onClick={onClose} />
        <div
          ref={ref}
          className="bg-white rounded-lg divide-y divide-[var(--color-stroke-neutral)] py-4 border border-[var(--color-stroke-neutral)] shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] w-full max-w-xl h-fit relative top-52 left-4 z-10"
        >
          <div className="px-6 pb-4">
            <div className="font-normal text-sm mb-3 text-[var(--color-neutral-secondary)]">
              Resources assigned
            </div>
            <div className="flex gap-20 items-center">
              {RESOURCE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <CheckBox
                    checked={selectedResources.includes(opt.value)}
                    onChange={() => handleResourceChange(opt.value)}
                    checkedBgColor="#79867E"
                  />
                  <span className="font-normal text-base text-[var(--color-neutral-secondary)]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center px-6 pt-4">
            <Button
            variant="neutral"
              appearance="ghost"
              type="button"
              onClick={onClose}
              className="text-base font-medium uppercase hover:underline cursor-pointer"
            >
              CANCEL
            </Button>
            <Button
              variant="primary"
              appearance="outlined"
              state="press"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-base h-[40px] hover:underline"
              onClick={() => onFilter(selectedResources)}
              type="button"
            >
              <Image src="/Dashboard/check.svg" alt="" width={20} height={20} className="shrink-0" />
              FILTER RESTAURANTS
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

RestaurantFilterModal.displayName = "RestaurantFilterModal";

export default RestaurantFilterModal;
