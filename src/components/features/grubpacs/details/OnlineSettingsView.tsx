"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Switch from "@/components/ui/Switch";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, SectionHeading, SettingsRow } from "../components/BoxSettingsShared";
import { getBadgeVariant } from "../utils/boxSettingsUtils";
import type { BoxSettingsData } from "@/components/features/grubpacs/data/mockBoxSettingsData";

export interface OnlineSettingsEditDraft {
  power_status: "on" | "off";
  ioniser_status: "on" | "off";
  dual_zone_status: "on" | "off";
  camera_status: "on" | "off";
  advert_screen_status: "on" | "off";
  zone1_temp: number;
  zone2_temp: number;
}

function toTempNumber(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampTemp(value: number): number {
  return Math.max(-20, Math.min(20, Math.round(value)));
}

function tempToPercent(temp: number): number {
  return ((clampTemp(temp) + 20) / 40) * 100;
}

function percentToTemp(percent: number): number {
  return clampTemp((percent / 100) * 40 - 20);
}

function sliderColorClass(temp: number): string {
  if (temp > 10) return "from-[#ef3d31] via-[#f06d2e] to-[#f0a82d]";
  if (temp < 0) return "from-[#1f9bd6] via-[#3ea6cb] to-[#88a896]";
  return "from-[#f0a82d] via-[#8ea296] to-[#1f9bd6]";
}

function ToggleCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <div className="border border-[#cfd5d2] rounded-lg bg-white overflow-hidden">
      <div className="bg-[#eff1f0] px-3 py-2 flex items-center gap-3">
        <Image src={icon} alt="" width={24} height={24} className="shrink-0" />
        <p className="font-semibold text-[#03130a] text-base leading-6 flex-1">{title}</p>
        <Switch checked={enabled} onChange={onToggle} />
        <span className="text-base text-[#37493f] uppercase">{enabled ? "ON" : "OFF"}</span>
        <Image src="/GrubPac/Box-settings/chevron-up.svg" alt="" width={20} height={20} />
      </div>
      <div className="px-3 py-3 text-[#37493f] text-base leading-8">{description}</div>
    </div>
  );
}

function TemperatureSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const percent = tempToPercent(value);

  return (
    <div className="w-[56px] shrink-0 flex items-center justify-center py-2 select-none">
      <div className="relative h-[332px] w-3 rounded-full border border-[#c4c9c6] overflow-visible">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-b ${sliderColorClass(value)}`} />
        <div className="absolute -left-10 -top-1 text-[#6b7971] text-[20px] leading-5">20°C</div>
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 text-[#6b7971] text-[20px] leading-5">0°C</div>
        <div className="absolute -left-12 -bottom-1 text-[#6b7971] text-[20px] leading-5">-20°C</div>
        <span className="absolute -left-3 top-[1px] h-px w-3 bg-[#98a29d]" />
        <span className="absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 bg-[#98a29d]" />
        <span className="absolute -left-3 bottom-[1px] h-px w-3 bg-[#98a29d]" />
        <button
          type="button"
          aria-label="Set temperature"
          className="absolute -left-[6px] h-5 w-5 rounded-full border border-[#c4c9c6] bg-[#f3f4f3]"
          style={{ top: `calc(${100 - percent}% - 10px)` }}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
        />
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const y = event.clientY - rect.top;
            const p = Math.max(0, Math.min(100, (1 - y / rect.height) * 100));
            onChange(percentToTemp(p));
          }}
          onMouseMove={(event) => {
            if (!dragging) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const y = event.clientY - rect.top;
            const p = Math.max(0, Math.min(100, (1 - y / rect.height) * 100));
            onChange(percentToTemp(p));
          }}
        />
      </div>
    </div>
  );
}

function SettingsEditSkeleton() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 pl-6 pr-2">
        <div className="flex flex-col gap-4">
          <Skeleton height={32} width="30%" />
          <Skeleton height={88} className="rounded-lg" />
          <Skeleton height={88} className="rounded-lg" />
          <Skeleton height={88} className="rounded-lg" />
          <Skeleton height={88} className="rounded-lg" />
          <Skeleton height={88} className="rounded-lg" />
          <div className="flex gap-3 pt-2">
            <Skeleton height={48} width="55%" className="rounded-lg" />
            <Skeleton height={48} width="45%" className="rounded-lg" />
          </div>
        </div>
      </div>
      <div className="w-10 flex items-center justify-center px-2">
        <Skeleton height="70%" width={8} className="rounded-full" />
      </div>
      <div className="shrink-0 flex items-center justify-end h-full overflow-hidden pr-4">
        <div className="relative" style={{ height: "calc(100% - 8rem)", aspectRatio: "1 / 1" }}>
          <Skeleton height="100%" width="100%" className="rounded-xl" />
          <div className="absolute left-[16%] right-[6%] top-[16%]">
            <Skeleton height={110} className="rounded-xl" />
          </div>
          <div className="absolute left-[16%] right-[6%] bottom-[14%]">
            <Skeleton height={110} className="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BoxSection({
  settings,
  open,
  onToggle,
  grublockStatus,
}: {
  settings: BoxSettingsData;
  open: boolean;
  onToggle: () => void;
  grublockStatus: "LOCKED" | "UNLOCKED";
}) {
  const [powerDrawerOpen, setPowerDrawerOpen] = useState(true);
  const hw = settings.hardware;

  return (
    <div className="flex flex-col gap-3 w-full">
      <SectionHeading title="Box" open={open} onToggle={onToggle} />
      {open && (
        <div className="flex flex-col gap-3 w-full">
          <div className="bg-white border border-[#e0e3e1] rounded-lg overflow-hidden w-full">
            <div className="bg-[#eff1f0] flex items-center gap-3 px-3 py-2 w-full">
              <Image src="/GrubPac/Box-settings/switch.svg" alt="" width={24} height={24} className="shrink-0" />
              <span className="flex-1 font-semibold text-base text-[#03130a] leading-6">Power</span>
              <StatusBadge label={hw.power.status} variant={getBadgeVariant(hw.power.status)} />
              {hw.power.connected && <StatusBadge label="CONNECTED" variant="green" />}
              <button
                onClick={() => setPowerDrawerOpen(!powerDrawerOpen)}
                className="h-7 w-7 flex items-center justify-center rounded cursor-pointer shrink-0"
                aria-label="Toggle power drawer"
              >
                <Image
                  src="/GrubPac/Box-settings/chevron-up.svg"
                  alt=""
                  width={24}
                  height={24}
                  className={`transition-transform duration-200 ${powerDrawerOpen ? "" : "rotate-180"}`}
                />
              </button>
            </div>
            {powerDrawerOpen && (
              <div className="flex flex-col gap-4 px-3 py-4">
                <p className="text-base text-[#37493f] leading-6">
                  {hw.power.connected
                    ? "The box is currently powered on and connected to:"
                    : hw.power.status === "ON"
                    ? "The box is currently powered on."
                    : "The box is currently powered off."}
                </p>
                {hw.power.connected && settings.driver && (
                  <div className="flex items-center gap-2 p-2 rounded-lg w-full">
                    <div className="w-8 h-8 bg-[#eff1f0] rounded-full shrink-0 flex items-center justify-center overflow-hidden">
                      <Image src="/GrubPac/Box-settings/users.svg" alt="" width={14} height={14} />
                    </div>
                    <p className="flex-1 text-base text-[#37493f] leading-6 min-w-0">
                      {settings.driver.name} | {settings.driver.phone}
                    </p>
                    <button className="flex items-center gap-2 px-1 text-sm font-medium text-[#6b7971] uppercase cursor-pointer hover:text-[#03130a] shrink-0">
                      VIEW PROFILE
                      <Image src="/GrubPac/Box-settings/arrow-up-right.svg" alt="" width={16} height={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <SettingsRow
            icon={
              grublockStatus === "LOCKED"
                ? "/GrubPac/Box-settings/grublock-brand-close.svg"
                : "/GrubPac/Box-settings/grublock-open.svg"
            }
            label="GrubLock"
            badge={{
              label: grublockStatus === "LOCKED" ? "GRUBLOCK" : "UNLOCKED",
              variant: grublockStatus === "LOCKED" ? "orange" : "red",
            }}
            chevronType="right"
          />
          <SettingsRow
            icon="/GrubPac/Box-settings/virus-covid-19.svg"
            label="Ioniser"
            badge={{ label: hw.ioniser.status, variant: getBadgeVariant(hw.ioniser.status) }}
            chevronType="right"
          />
          <SettingsRow
            icon="/GrubPac/Box-settings/thermometer.svg"
            label="Dual zone"
            badge={{ label: hw.dualZone.status, variant: getBadgeVariant(hw.dualZone.status) }}
            chevronType="right"
          />
          <SettingsRow
            icon="/GrubPac/Box-settings/sun.svg"
            label="Ext. thermostat sensor"
            value={hw.extThermostat.temp}
            chevronType="up"
          />
          <SettingsRow
            icon="/GrubPac/Box-settings/cube-dash.svg"
            label="Gyrosensor"
            badge={{ label: hw.gyrosensor.status, variant: getBadgeVariant(hw.gyrosensor.status) }}
            chevronType="right"
          />
        </div>
      )}
    </div>
  );
}

function ConnectionsSection({
  settings,
  open,
  onToggle,
}: {
  settings: BoxSettingsData;
  open: boolean;
  onToggle: () => void;
}) {
  const conn = settings.connections;
  return (
    <div className="flex flex-col gap-3 w-full">
      <SectionHeading title="Connections" open={open} onToggle={onToggle} />
      {open && (
        <div className="flex flex-col gap-3 w-full">
          <SettingsRow
            icon="/GrubPac/Box-settings/wifi.svg"
            label="Wifi"
            badge={{ label: conn.wifi.status, variant: getBadgeVariant(conn.wifi.status) }}
            chevronType="right"
          />
          <SettingsRow
            icon="/GrubPac/Box-settings/bluetooth-on.svg"
            label="Bluetooth"
            badge={{ label: conn.bluetooth.status, variant: getBadgeVariant(conn.bluetooth.status) }}
            chevronType="right"
          />
          <SettingsRow
            icon="/GrubPac/Box-settings/signal.svg"
            label="4G"
            badge={{ label: conn.signal4g.status, variant: getBadgeVariant(conn.signal4g.status) }}
            chevronType="right"
          />
          <SettingsRow
            icon="/GrubPac/Box-settings/location-arrow.svg"
            label="GPS"
            badge={{ label: conn.gps.status, variant: getBadgeVariant(conn.gps.status) }}
            chevronType="right"
          />
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 w-full">
      <SectionHeading title={title} open={open} onToggle={() => setOpen(!open)} />
    </div>
  );
}

function ZoneOverlay({
  label,
  setTemp,
  actual,
  position,
  warning,
  selected,
  onSelect,
}: {
  label: string;
  setTemp: string;
  actual: string;
  position: "top" | "bottom";
  warning?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const isTop = position === "top";
  const colors = warning
    ? { bg: "rgba(199,44,52,0.70)", border: "#cf3f40" }
    : isTop
    ? { bg: "rgba(26,156,214,0.64)", border: "#1a9cd6" }
    : { bg: "rgba(249,157,32,0.64)", border: "#f99d20" };

  return (
    <div
      className={`absolute left-[18%] right-0 flex flex-col justify-start p-4 pt-7 rounded ${
        isTop ? "top-[12.81%] bottom-[43.13%]" : "top-[60.62%] bottom-[15.63%]"
      } backdrop-blur-sm ${onSelect ? "cursor-pointer" : ""}`}
      style={{
        background: colors.bg,
        border: selected ? "2px dashed #ffffff" : warning ? "2px dashed #ffb3b3" : `1px solid ${colors.border}`,
      }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-1 text-white text-sm opacity-90">
        <span className="opacity-75">{label} set @</span>
        <span>{setTemp}</span>
      </div>
      <p className="text-white leading-none mt-1">
        <span className="text-[40px] font-medium leading-10">{actual.replace(/[°Cc]/g, "")}</span>
        <span className="text-base font-semibold ml-0.5">°C</span>
      </p>
    </div>
  );
}

function UnifiedZoneOverlay({
  setTemp,
  actual,
  warning,
  selected,
  onSelect,
}: {
  setTemp: string;
  actual: string;
  warning?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const temp = toTempNumber(setTemp);
  const base = warning
    ? "rgba(199,44,52,0.70)"
    : temp > 10
    ? "rgba(199,44,52,0.65)"
    : temp < 0
    ? "rgba(26,156,214,0.64)"
    : "rgba(249,157,32,0.64)";

  return (
    <div
      className={`absolute left-[18%] right-0 top-[12.81%] bottom-[15.63%] flex flex-col justify-start p-5 pt-8 rounded backdrop-blur-sm ${onSelect ? "cursor-pointer" : ""}`}
      style={{
        background: base,
        border: selected
          ? "2px dashed #ffffff"
          : warning
          ? "2px dashed #ffb3b3"
          : "1px solid #f99d20",
      }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-1 text-white text-sm opacity-90">
        <span className="opacity-75">Temperature set @</span>
        <span>{setTemp}</span>
      </div>
      <p className="text-white leading-none mt-1">
        <span className="text-[48px] font-medium leading-10">{actual.replace(/[°Cc]/g, "")}</span>
        <span className="text-xl font-semibold ml-0.5">°C</span>
      </p>
    </div>
  );
}

export function OnlineSettingsView({
  settings,
  grublockStatus,
  isEditMode = false,
  isEditEntryLoading = false,
  editDraft,
  onEditDraftChange,
}: {
  settings: BoxSettingsData;
  grublockStatus: "LOCKED" | "UNLOCKED";
  isEditMode?: boolean;
  isEditEntryLoading?: boolean;
  editDraft?: OnlineSettingsEditDraft;
  onEditDraftChange?: (draft: OnlineSettingsEditDraft) => void;
}) {
  const [boxOpen, setBoxOpen] = useState(true);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<"zone1" | "zone2">("zone1");

  const zone1Actual = toTempNumber(settings.zone1.actual);
  const zone2Actual = toTempNumber(settings.zone2.actual);
  const zone1Set = isEditMode && editDraft ? editDraft.zone1_temp : toTempNumber(settings.zone1.set);
  const zone2Set = isEditMode && editDraft ? editDraft.zone2_temp : toTempNumber(settings.zone2.set);
  const isDualOn = isEditMode && editDraft
    ? editDraft.dual_zone_status === "on"
    : String(settings.hardware.dualZone.status).toUpperCase() === "ON";

  useEffect(() => {
    if (!isDualOn) {
      setActiveZone("zone1");
    }
  }, [isDualOn]);

  const zone1Warning = useMemo(() => Math.max(zone1Actual, zone1Set) > 10, [zone1Actual, zone1Set]);
  const zone2Warning = useMemo(() => Math.max(zone2Actual, zone2Set) > 10, [zone2Actual, zone2Set]);
  const unifiedWarning = useMemo(
    () => Math.max(zone1Actual, zone2Actual, zone1Set) > 10,
    [zone1Actual, zone2Actual, zone1Set],
  );

  if (isEditEntryLoading) {
    return <SettingsEditSkeleton />;
  }

  const updateDraft = (updater: (current: OnlineSettingsEditDraft) => OnlineSettingsEditDraft) => {
    if (!editDraft || !onEditDraftChange) return;
    onEditDraftChange(updater(editDraft));
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 pl-6 pr-2">
        {isEditMode && editDraft ? (
          <div className="flex flex-col gap-4">
            <SectionHeading title="Box" open={true} onToggle={() => {}} />
            <ToggleCard
              icon="/GrubPac/Box-settings/switch.svg"
              title="Power"
              description="Remotely turn the box on or off. When off, all features including cooling and access are disabled."
              enabled={editDraft.power_status === "on"}
              onToggle={(next) =>
                updateDraft((current) => ({ ...current, power_status: next ? "on" : "off" }))
              }
            />
            <ToggleCard
              icon="/GrubPac/Box-settings/virus-covid-19.svg"
              title="Ioniser"
              description="Ioniser keeps the box fresh by reducing odors and microbes. Turn off when transporting sensitive medical items."
              enabled={editDraft.ioniser_status === "on"}
              onToggle={(next) =>
                updateDraft((current) => ({ ...current, ioniser_status: next ? "on" : "off" }))
              }
            />
            <ToggleCard
              icon="/GrubPac/Box-settings/thermometer.svg"
              title="Dual zone"
              description="Split the box into two temperature zones. Turn off to use a single uniform temperature."
              enabled={editDraft.dual_zone_status === "on"}
              onToggle={(next) =>
                updateDraft((current) =>
                  next
                    ? { ...current, dual_zone_status: "on" }
                    : {
                        ...current,
                        dual_zone_status: "off",
                        zone2_temp: current.zone1_temp,
                      },
                )
              }
            />
            <ToggleCard
              icon="/GrubPac/Box-settings/camera.svg"
              title="BoxCam 360°"
              description="Monitor handling and access through the built-in camera. Use for added security and compliance."
              enabled={editDraft.camera_status === "on"}
              onToggle={(next) =>
                updateDraft((current) => ({ ...current, camera_status: next ? "on" : "off" }))
              }
            />
            <ToggleCard
              icon="/advert_screen.svg"
              title="Advert screen"
              description="Enable external display content for branding and route-side messaging."
              enabled={editDraft.advert_screen_status === "on"}
              onToggle={(next) =>
                updateDraft((current) => ({ ...current, advert_screen_status: next ? "on" : "off" }))
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <BoxSection
              settings={settings}
              open={boxOpen}
              onToggle={() => setBoxOpen(!boxOpen)}
              grublockStatus={grublockStatus}
            />
            <ConnectionsSection
              settings={settings}
              open={connectionsOpen}
              onToggle={() => setConnectionsOpen(!connectionsOpen)}
            />
            <CollapsibleSection title="Power" />
            <CollapsibleSection title="Camera" />
            <CollapsibleSection title="Lights" />
            <CollapsibleSection title="Storage" />
          </div>
        )}
      </div>

      {isEditMode && editDraft && (
        <div className="shrink-0 flex items-center justify-center h-full px-3">
          <div className="flex items-center" style={{ height: "calc(100% - 8rem)" }}>
            <TemperatureSlider
              value={isDualOn ? (activeZone === "zone1" ? editDraft.zone1_temp : editDraft.zone2_temp) : editDraft.zone1_temp}
              onChange={(nextTemp) => {
                updateDraft((current) => {
                  if (current.dual_zone_status !== "on") {
                    return { ...current, zone1_temp: nextTemp, zone2_temp: nextTemp };
                  }
                  if (activeZone === "zone1") {
                    return { ...current, zone1_temp: nextTemp };
                  }
                  return { ...current, zone2_temp: nextTemp };
                });
              }}
            />
          </div>
        </div>
      )}

      <div className="shrink-0 flex items-center justify-end h-full overflow-hidden">
        <div className="relative" style={{ height: "calc(100% - 8rem)", aspectRatio: "1 / 1" }}>
          <Image
            src="/GrubPac/Box-settings/open-box-full.png"
            alt="GrubPac box open"
            fill
            className="object-contain object-right"
            priority
          />
          {isDualOn ? (
            <>
              <ZoneOverlay
                label="Zone 1"
                setTemp={`${zone1Set}°C`}
                actual={settings.zone1.actual}
                position="top"
                warning={isEditMode ? activeZone === "zone1" && zone1Warning : zone1Warning}
                selected={isEditMode && activeZone === "zone1"}
                onSelect={isEditMode ? () => setActiveZone("zone1") : undefined}
              />
              <ZoneOverlay
                label="Zone 2"
                setTemp={`${zone2Set}°C`}
                actual={settings.zone2.actual}
                position="bottom"
                warning={isEditMode ? activeZone === "zone2" && zone2Warning : zone2Warning}
                selected={isEditMode && activeZone === "zone2"}
                onSelect={isEditMode ? () => setActiveZone("zone2") : undefined}
              />
            </>
          ) : (
            <UnifiedZoneOverlay
              setTemp={`${zone1Set}°C`}
              actual={settings.zone1.actual}
              warning={unifiedWarning}
              selected={isEditMode}
              onSelect={isEditMode ? () => setActiveZone("zone1") : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
