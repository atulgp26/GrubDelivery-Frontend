"use client";

import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import PowerDropdown from "@/components/features/grubpacs/dropdowns/PowerDropdown";
import IoniserDropdown from "@/components/features/grubpacs/dropdowns/IoniserDropdown";
import TemperatureDropdown, { TemperatureSettings } from "@/components/features/grubpacs/dropdowns/TemperatureDropdown";
import MoreDropdown from "@/components/features/grubpacs/dropdowns/MoreDropdown";

export interface GrubPacActionBarProps {
  selectedCount: number;
  isGrouped?: boolean;
  initialDualZone?: boolean;
  currentPowerState?: "on" | "off";
  currentIoniserState?: "on" | "off";
  onClearSelection: () => void;
  onPower?: (action: "on" | "off") => void;
  onIoniser?: (action: "on" | "off") => void;
  onTemperature?: (settings: TemperatureSettings) => void;
  onSuspendBoxes?: () => void;
  onReassignRestaurant?: () => void;
  onRemoveVehicle?: () => void;
  onDelete?: () => void;
  onActivateBoxes?: () => void;
}

export default function GrubPacActionBar({
  selectedCount,
  isGrouped = false,
  initialDualZone = false,
  currentPowerState,
  currentIoniserState,
  onClearSelection,
  onPower,
  onIoniser,
  onTemperature,
  onSuspendBoxes,
  onReassignRestaurant,
  onRemoveVehicle,
  onDelete,
  onActivateBoxes,
}: GrubPacActionBarProps) {
  const [isPowerDropdownOpen, setIsPowerDropdownOpen] = useState(false);
  const powerButtonContainerRef = useRef<HTMLDivElement>(null);
  const [isIoniserDropdownOpen, setIsIoniserDropdownOpen] = useState(false);
  const ioniserButtonContainerRef = useRef<HTMLDivElement>(null);
  const [isTemperatureDropdownOpen, setIsTemperatureDropdownOpen] = useState(false);
  const temperatureButtonContainerRef = useRef<HTMLDivElement>(null);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const moreButtonContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isPowerDropdownOpen &&
        powerButtonContainerRef.current &&
        !powerButtonContainerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".power-dropdown-container")
      ) {
        setIsPowerDropdownOpen(false);
      }
      if (
        isIoniserDropdownOpen &&
        ioniserButtonContainerRef.current &&
        !ioniserButtonContainerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".ioniser-dropdown-container")
      ) {
        setIsIoniserDropdownOpen(false);
      }
      if (
        isTemperatureDropdownOpen &&
        temperatureButtonContainerRef.current &&
        !temperatureButtonContainerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".temperature-dropdown-container")
      ) {
        setIsTemperatureDropdownOpen(false);
      }
      if (
        isMoreDropdownOpen &&
        moreButtonContainerRef.current &&
        !moreButtonContainerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".more-dropdown-container")
      ) {
        setIsMoreDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPowerDropdownOpen, isIoniserDropdownOpen, isTemperatureDropdownOpen, isMoreDropdownOpen]);

  const handlePowerConfirm = (action: "on" | "off") => {
    setIsPowerDropdownOpen(false);
    if (onPower) {
      onPower(action);
    }
  };

  const handlePowerCancel = () => {
    setIsPowerDropdownOpen(false);
  };

  const handleIoniserConfirm = (action: "on" | "off") => {
    setIsIoniserDropdownOpen(false);
    if (onIoniser) {
      onIoniser(action);
    }
  };

  const handleIoniserCancel = () => {
    setIsIoniserDropdownOpen(false);
  };

  const handleTemperatureConfirm = (settings: TemperatureSettings) => {
    setIsTemperatureDropdownOpen(false);
    if (onTemperature) {
      onTemperature(settings);
    }
  };

  const handleTemperatureCancel = () => {
    setIsTemperatureDropdownOpen(false);
  };

  const handleSuspendBoxes = () => {
    setIsMoreDropdownOpen(false);
    onSuspendBoxes?.();
  };

  const handleReassignRestaurant = () => {
    setIsMoreDropdownOpen(false);
    onReassignRestaurant?.();
  };

  const handleRemoveVehicle = () => {
    setIsMoreDropdownOpen(false);
    onRemoveVehicle?.();
  };

  if (selectedCount === 0) return null;

  return (
    <div 
      className="fixed bottom-3 bg-[#eff1f0] border border-[#c1c7c4] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] flex items-center gap-4 px-4 py-3 z-50" 
      style={{ left: 'var(--table-action-bar-left, 1rem)', right: '1rem' }}
    >
      {/* Power Dropdown - positioned above action bar */}
      {isPowerDropdownOpen && (
        <div 
          className="power-dropdown-container fixed z-[60]"
          style={{
            bottom: '5rem',
            left: powerButtonContainerRef.current 
              ? `${powerButtonContainerRef.current.getBoundingClientRect().left}px` 
              : '50%',
          }}
        >
          <PowerDropdown 
            onConfirm={handlePowerConfirm}
            onCancel={handlePowerCancel}
            disabledOption={currentPowerState}
          />
        </div>
      )}

      {isIoniserDropdownOpen && (
        <div 
          className="ioniser-dropdown-container fixed z-[60]"
          style={{
            bottom: '5rem',
            left: ioniserButtonContainerRef.current 
              ? `${ioniserButtonContainerRef.current.getBoundingClientRect().left}px` 
              : '50%',
          }}
        >
          <IoniserDropdown 
            onConfirm={handleIoniserConfirm}
            onCancel={handleIoniserCancel}
            disabledOption={currentIoniserState}
          />
        </div>
      )}

      {isTemperatureDropdownOpen && (
        <div 
          className="temperature-dropdown-container fixed z-[60]"
          style={{
            bottom: '4.5rem',
            right: temperatureButtonContainerRef.current 
              ? `${window.innerWidth - temperatureButtonContainerRef.current.getBoundingClientRect().right}px`
              : '1rem',
          }}
        >
         <div className="w-[350px]">
          <TemperatureDropdown 
            onConfirm={handleTemperatureConfirm}
            onCancel={handleTemperatureCancel}
            initialDualZone={initialDualZone}
          />
          </div>
        </div>
      )}

      {isMoreDropdownOpen && (
        <div 
          className="more-dropdown-container fixed z-[60]"
          style={{
            bottom: '4.5rem',
            right: moreButtonContainerRef.current 
              ? `${window.innerWidth - moreButtonContainerRef.current.getBoundingClientRect().right - 16}px`
              : '1rem',
          }}
        >
          <MoreDropdown 
            onSuspendBoxes={handleSuspendBoxes}
            onReassignRestaurant={handleReassignRestaurant}
            onRemoveVehicle={handleRemoveVehicle}
          />
        </div>
      )}

      {/* Selection count button */}
      <Button
        variant="neutral"
        appearance="outlined"
        state="press"
        className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg bg-white"
        onClick={onClearSelection}
      >
        <Image 
          src="/Employee/Multiselect/x.svg" 
          alt="Close" 
          width={24} 
          height={24} 
        />
        <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase">
          {selectedCount} SELECTED
        </span>
      </Button>

      {/* Actions */}
      <div className="flex-1 flex items-center justify-end gap-10">
        {isGrouped ? (
          // Grouped view actions
          <>
            {onPower && (
              <div ref={powerButtonContainerRef}>
                <Button 
                  onClick={() => setIsPowerDropdownOpen(!isPowerDropdownOpen)} 
                  variant="neutral" 
                  appearance="ghost" 
                  className={`flex items-center gap-3 h-10 px-4 py-2 rounded-lg${isPowerDropdownOpen ? ' border-2 border-[#C0C6C2]' : ''}`}
                >
                  <Image 
                    src="/GrubPac/Multiselect/switch.svg" 
                    alt="Power" 
                    width={20} 
                    height={20} 
                  />
                  <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                    POWER
                  </span>
                </Button>
              </div>
            )}
            
            {onIoniser && (
              <div ref={ioniserButtonContainerRef}>
                <Button 
                  onClick={() => setIsIoniserDropdownOpen(!isIoniserDropdownOpen)} 
                  variant="neutral" 
                  appearance="ghost" 
                  className={`flex items-center gap-3 h-10 px-4 py-2 rounded-lg${isIoniserDropdownOpen ? ' border-2 border-[#C0C6C2]' : ''}`}
                >
                  <Image 
                    src="/GrubPac/Multiselect/virus-covid-19.svg" 
                    alt="Ioniser" 
                    width={20} 
                    height={20} 
                  />
                  <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                    IONISER
                  </span>
                </Button>
              </div>
            )}

            {onTemperature && (
              <div ref={temperatureButtonContainerRef}>
                <Button 
                  onClick={() => setIsTemperatureDropdownOpen(!isTemperatureDropdownOpen)} 
                  variant="neutral" 
                  appearance="ghost" 
                  className={`flex items-center gap-3 h-10 px-4 py-2 rounded-lg${isTemperatureDropdownOpen ? ' border-2 border-[#C0C6C2]' : ''}`}
                >
                  <Image 
                    src="/GrubPac/Multiselect/thermometer.svg" 
                    alt="Temperature" 
                    width={20} 
                    height={20} 
                  />
                  <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                    TEMPERATURE
                  </span>
                </Button>
              </div>
            )}

            {/* Divider */}
            {(onSuspendBoxes || onReassignRestaurant || onRemoveVehicle || onDelete) && (
              <div className="h-10 w-px bg-[#c1c7c4]" />
            )}

            {(onSuspendBoxes || onReassignRestaurant || onRemoveVehicle) && (
              <div ref={moreButtonContainerRef}>
                <Button 
                  onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)} 
                  variant="neutral" 
                  appearance="ghost" 
                  className={`flex items-center gap-3 h-10 px-4 py-2 rounded-lg${isMoreDropdownOpen ? ' border-2 border-[#C0C6C2]' : ''}`}
                >
                  <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                    MORE
                  </span>
                </Button>
              </div>
            )}

            {onDelete && (
              <Button 
                onClick={onDelete} 
                variant="neutral" 
                appearance="ghost" 
                className="flex items-center justify-center h-10 w-10 p-2 rounded-lg"
              >
                <Image 
                  src="/GrubPac/Multiselect/trash.svg" 
                  alt="Delete" 
                  width={20} 
                  height={20} 
                />
              </Button>
            )}
          </>
        ) : (
          // Ungrouped view actions
          <>
            {onDelete && (
              <Button 
                onClick={onDelete} 
                variant="neutral" 
                appearance="ghost" 
                className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg"
              >
                <Image 
                  src="/Employee/Multiselect/trash.svg" 
                  alt="Remove" 
                  width={16} 
                  height={16} 
                />
                <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                  REMOVE SELECTION
                </span>
              </Button>
            )}
            
            {onActivateBoxes && (
              <Button 
                onClick={onActivateBoxes} 
                variant="primary" 
                appearance="ghost" 
                className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg"
              >
                <Image 
                  src="/Employee/Multiselect/check.svg" 
                  alt="Activate" 
                  width={16} 
                  height={16} 
                />
                <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase hover:underline">
                  ACTIVATE SELECTED BOXES
                </span>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
