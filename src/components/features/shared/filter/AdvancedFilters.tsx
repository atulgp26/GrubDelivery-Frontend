import { useState } from "react";
import Switch from "@/components/ui/Switch";
import DetailsCollapse from "@/components/ui/DetailsCollapse";
import TemperatureInput from "./TemperatureInput";

interface AdvancedFiltersProps {
  restaurantAssigned: boolean;
  vehicleAssigned: boolean;
  ioniserOn: boolean;
  dualZoneOn: boolean;
  zone1Min: number;
  zone1Max: number;
  zone2Min: number;
  zone2Max: number;
  onRestaurantAssignedChange: (checked: boolean) => void;
  onVehicleAssignedChange: (checked: boolean) => void;
  onIoniserOnChange: (checked: boolean) => void;
  onDualZoneOnChange: (checked: boolean) => void;
  onZone1MinChange: (value: number) => void;
  onZone1MaxChange: (value: number) => void;
  onZone2MinChange: (value: number) => void;
  onZone2MaxChange: (value: number) => void;
}

export default function AdvancedFilters({
  restaurantAssigned,
  vehicleAssigned,
  ioniserOn,
  dualZoneOn,
  zone1Min,
  zone1Max,
  zone2Min,
  zone2Max,
  onRestaurantAssignedChange,
  onVehicleAssignedChange,
  onIoniserOnChange,
  onDualZoneOnChange,
  onZone1MinChange,
  onZone1MaxChange,
  onZone2MinChange,
  onZone2MaxChange,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)]">
      <DetailsCollapse
        align="!justify-center gap-2"
        title="Advanced filters"
        open={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        grubpacsFilter={true}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 px-6 items-center py-4 gap-4 text-[var(--color-neutral-secondary)]">
          <span className="flex items-center gap-2 text-[var(--color-neutral-secondary)] min-w-0">
            <Switch
              checked={restaurantAssigned}
              onChange={onRestaurantAssignedChange}
              variant="neutral"
            />
            Restaurant assigned
          </span>
          <span className="flex items-center gap-2 text-[var(--color-neutral-secondary)] min-w-0">
            <Switch
              checked={vehicleAssigned}
              onChange={onVehicleAssignedChange}
              variant="neutral"
            />
            Vehicle assigned
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 mx-4 sm:mx-6 mb-4 p-4 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] rounded-lg gap-4 overflow-hidden">
          <div className="flex flex-col gap-4 min-w-0">
            <span className="flex items-center gap-2">
              <Switch
                checked={ioniserOn}
                onChange={onIoniserOnChange}
              />
              Ioniser ON
            </span>
            <span className="flex items-center gap-2">
              <Switch
                checked={dualZoneOn}
                onChange={onDualZoneOnChange}
              />
              Dual Zone ON
            </span>
          </div>
          <div className="flex flex-col gap-4 min-w-0">
            <TemperatureInput
              label="Zone 1"
              subtitle="(Primary)"
              minValue={zone1Min}
              maxValue={zone1Max}
              onMinChange={onZone1MinChange}
              onMaxChange={onZone1MaxChange}
            />
            <TemperatureInput
              label="Zone 2"
              subtitle="(Secondary)"
              minValue={zone2Min}
              maxValue={zone2Max}
              onMinChange={onZone2MinChange}
              onMaxChange={onZone2MaxChange}
            />
          </div>
        </div>
      </DetailsCollapse>
    </div>
  );
}
