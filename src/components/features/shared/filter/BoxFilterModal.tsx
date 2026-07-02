"use client";

import { useState, forwardRef, useEffect } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import FilterSection from "./FilterSection";
import AdvancedFilters from "./AdvancedFilters";
import FilterModalFooter from "./FilterModalFooter";
import {
  connectionStatuses,
  healthStatuses,
  grubLockStatuses,
  getConnectionColorVar,
  getHealthColorVar,
  getGrubLockStatusColorVar,
  powerStatuses,
  getPowerStatusColorVar,
} from "./filterConstants";

export interface FilterState {
  power: string[];
  connection: string[];
  health: string[];
  grubLockStatus: string[];
  restaurantAssigned: boolean;
  vehicleAssigned: boolean;
  ioniserOn: boolean;
  dualZoneOn: boolean;
  zone1Min: number;
  zone1Max: number;
  zone2Min: number;
  zone2Max: number;
}

export const defaultBoxFilters: FilterState = {
  power: [],
  connection: [],
  health: [],
  grubLockStatus: [],
  restaurantAssigned: false,
  vehicleAssigned: false,
  ioniserOn: false,
  dualZoneOn: false,
  zone1Min: -20,
  zone1Max: 30,
  zone2Min: -20,
  zone2Max: 30,
};

interface BoxFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
  showPowerStatus?: boolean;
  embedded?: boolean;
  wrapperClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
}

const BoxFilterModal = forwardRef<HTMLDivElement, BoxFilterModalProps>(
  ({
    open,
    onClose,
    onApply,
    initialFilters = defaultBoxFilters,
    showPowerStatus = true,
    embedded = false,
    wrapperClassName,
    panelClassName,
    panelStyle,
  }, ref) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    useEffect(() => {
      if (open) {
        setFilters(initialFilters);
      }
    }, [open, initialFilters]);

    if (!open) return null;

    const handlePowerToggle = (statusName: string) => {
      setFilters((prev) => ({
        ...prev,
        power: prev.power.includes(statusName)
          ? prev.power.filter((s) => s !== statusName)
          : [...prev.power, statusName],
      }));
    };

    const handleConnectionToggle = (statusName: string) => {
      setFilters((prev) => ({
        ...prev,
        connection: prev.connection.includes(statusName)
          ? prev.connection.filter((s) => s !== statusName)
          : [...prev.connection, statusName],
      }));
    };

    const handleHealthToggle = (statusName: string) => {
      setFilters((prev) => ({
        ...prev,
        health: prev.health.includes(statusName)
          ? prev.health.filter((s) => s !== statusName)
          : [...prev.health, statusName],
      }));
    };

    const handleGrubLockStatusToggle = (statusName: string) => {
      setFilters((prev) => ({
        ...prev,
        grubLockStatus: prev.grubLockStatus.includes(statusName)
          ? prev.grubLockStatus.filter((s) => s !== statusName)
          : [...prev.grubLockStatus, statusName],
      }));
    };

    return (
      <div
        className={cn(
          embedded
            ? "absolute inset-0 z-50 animate-fadeIn"
            : "fixed inset-0 z-50 flex items-start justify-end pt-[200px] pr-6 animate-fadeIn",
          wrapperClassName,
        )}
      >
        <div className="absolute inset-0" onClick={onClose} />
        <div
          ref={ref}
          style={panelStyle}
          className={cn(
            "bg-white rounded-lg border border-[var(--color-stroke-neutral)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] relative z-10 flex flex-col overflow-hidden",
            embedded
              ? "absolute right-2 top-2 w-[min(600px,calc(100%-1rem))] max-h-[calc(100%-1rem)]"
              : "w-[600px] max-h-[calc(100vh-220px)]",
            panelClassName,
          )}
        >
          <div className="flex flex-col overflow-y-auto flex-1">
            {showPowerStatus && (
              <FilterSection
                title="Power status"
                options={powerStatuses}
                selected={filters.power}
                onToggle={handlePowerToggle}
                gridCols="3"
                getColorVar={getPowerStatusColorVar}
              />
            )}

            <FilterSection
              title="Connection status"
              options={connectionStatuses}
              selected={filters.connection}
              onToggle={handleConnectionToggle}
              gridCols="3"
              getColorVar={getConnectionColorVar}
            />

            <FilterSection
              title="Health status"
              options={healthStatuses}
              selected={filters.health}
              onToggle={handleHealthToggle}
              gridCols="3"
              getColorVar={getHealthColorVar}
            />

            <FilterSection
              title="GrubLock status"
              options={grubLockStatuses}
              selected={filters.grubLockStatus}
              onToggle={handleGrubLockStatusToggle}
              gridCols="3"
              getColorVar={getGrubLockStatusColorVar}
            />

            <AdvancedFilters
              restaurantAssigned={filters.restaurantAssigned}
              vehicleAssigned={filters.vehicleAssigned}
              ioniserOn={filters.ioniserOn}
              dualZoneOn={filters.dualZoneOn}
              zone1Min={filters.zone1Min}
              zone1Max={filters.zone1Max}
              zone2Min={filters.zone2Min}
              zone2Max={filters.zone2Max}
              onRestaurantAssignedChange={(checked) =>
                setFilters((prev) => ({ ...prev, restaurantAssigned: checked }))
              }
              onVehicleAssignedChange={(checked) =>
                setFilters((prev) => ({ ...prev, vehicleAssigned: checked }))
              }
              onIoniserOnChange={(checked) =>
                setFilters((prev) => ({ ...prev, ioniserOn: checked }))
              }
              onDualZoneOnChange={(checked) =>
                setFilters((prev) => ({ ...prev, dualZoneOn: checked }))
              }
              onZone1MinChange={(value) =>
                setFilters((prev) => ({ ...prev, zone1Min: value }))
              }
              onZone1MaxChange={(value) =>
                setFilters((prev) => ({ ...prev, zone1Max: value }))
              }
              onZone2MinChange={(value) =>
                setFilters((prev) => ({ ...prev, zone2Min: value }))
              }
              onZone2MaxChange={(value) =>
                setFilters((prev) => ({ ...prev, zone2Max: value }))
              }
            />
          </div>

          <FilterModalFooter onCancel={onClose} onApply={() => onApply(filters)} />
        </div>
      </div>
    );
  },
);

BoxFilterModal.displayName = "BoxFilterModal";

export default BoxFilterModal;
