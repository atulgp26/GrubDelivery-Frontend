"use client";

import { useState, forwardRef } from "react";
import Switch from "@/components/ui/Switch";
import FilterSection from "./FilterSection";
import FilterModalFooter from "./FilterModalFooter";
import {
  suspendedGrubLockStatuses,
  getSuspendedGrubLockColorVar,
} from "./filterConstants";

export interface SuspendedFilterState {
  grubLockStatus: string[];
  restaurantAssigned: boolean;
  vehicleAssigned: boolean;
}

export const defaultSuspendedFilters: SuspendedFilterState = {
  grubLockStatus: [],
  restaurantAssigned: false,
  vehicleAssigned: false,
};

interface SuspendedBoxFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: SuspendedFilterState) => void;
  initialFilters?: SuspendedFilterState;
}

const SuspendedBoxFilterModal = forwardRef<HTMLDivElement, SuspendedBoxFilterModalProps>(
  ({ open, onClose, onApply, initialFilters = defaultSuspendedFilters }, ref) => {
    const [filters, setFilters] = useState<SuspendedFilterState>(initialFilters);

    if (!open) return null;

    const handleGrubLockToggle = (name: string) => {
      setFilters((prev) => ({
        ...prev,
        grubLockStatus: prev.grubLockStatus.includes(name)
          ? prev.grubLockStatus.filter((s) => s !== name)
          : [...prev.grubLockStatus, name],
      }));
    };

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-end pt-[230px] pr-10 animate-fadeIn">
        <div className="absolute inset-0" onClick={onClose} />
        <div
          ref={ref}
          className="bg-white rounded-lg border border-[var(--color-stroke-neutral)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] w-[600px] max-h-[calc(100vh-220px)] relative z-10 flex flex-col overflow-hidden"
        >
          <div className="flex flex-col overflow-y-auto flex-1">
            <FilterSection
              title="GrubLock"
              options={suspendedGrubLockStatuses}
              selected={filters.grubLockStatus}
              onToggle={handleGrubLockToggle}
              gridCols="3"
              getColorVar={getSuspendedGrubLockColorVar}
            />

            {/* Linked information */}
            <div className="border-t border-[var(--color-stroke-neutral)] px-6 py-4 flex flex-col gap-3">
              <p className="font-normal text-[var(--color-neutral-secondary)] text-sm leading-[22px]">
                Linked information
              </p>
              <div className="grid grid-cols-2 gap-4">
                <span className="flex items-center gap-2 text-[var(--color-neutral-secondary)]">
                  <Switch
                    checked={filters.restaurantAssigned}
                    onChange={(checked) =>
                      setFilters((prev) => ({ ...prev, restaurantAssigned: checked }))
                    }
                    variant="neutral"
                  />
                  Restaurant assigned
                </span>
                <span className="flex items-center gap-2 text-[var(--color-neutral-secondary)]">
                  <Switch
                    checked={filters.vehicleAssigned}
                    onChange={(checked) =>
                      setFilters((prev) => ({ ...prev, vehicleAssigned: checked }))
                    }
                    variant="neutral"
                  />
                  Vehicle assigned
                </span>
              </div>
            </div>
          </div>

          <FilterModalFooter onCancel={onClose} onApply={() => onApply(filters)} />
        </div>
      </div>
    );
  },
);

SuspendedBoxFilterModal.displayName = "SuspendedBoxFilterModal";

export default SuspendedBoxFilterModal;
