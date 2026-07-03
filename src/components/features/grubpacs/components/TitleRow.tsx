"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { GrubPacItem } from "@/types/domain/grubpacs";
import type { BoxSettingsData } from "@/components/features/grubpacs/data/mockBoxSettingsData";

export function TitleRow({
  box,
  settings,
  isOnline,
  grublockStatus,
  isGrubLockActive,
  isSettingsEditing,
  isSettingsEntryLoading,
  canApplySettingsChanges,
  isApplyingSettings,
  onBack,
  onGrubLockClick,
  onSettingsClick,
  onSettingsApplyAction,
  onSettingsCancelAction,
  onEdit,
  onSuspend,
  onDelete,
  onPermission,
}: {
  box: GrubPacItem;
  settings: BoxSettingsData;
  isOnline: boolean;
  grublockStatus: "LOCKED" | "UNLOCKED";
  isGrubLockActive?: boolean;
  isSettingsEditing?: boolean;
  isSettingsEntryLoading?: boolean;
  canApplySettingsChanges?: boolean;
  isApplyingSettings?: boolean;
  onBack?: () => void;
  onGrubLockClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSettingsClick?: () => void;
  onSettingsApplyAction?: () => void;
  onSettingsCancelAction?: () => void;
  onEdit?: () => void;
  onSuspend?: () => void;
  onDelete?: () => void;
  onPermission?: () => void;
}) {
  const [showDriverTooltip, setShowDriverTooltip] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isActionDisabled = !isOnline;
  const subtitleParts = [
    box.boxDisplayId ?? box.code ?? box.boxId,
    box.vehicleNumber,
    box.restaurant ?? box.restaurantName,
  ].filter((value): value is string => Boolean(value));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (isActionDisabled) {
      setMenuOpen(false);
    }
  }, [isActionDisabled]);

  const hasDriver = settings.driver !== null;

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap shrink-0">
      {/* Name + subtitle */}
      <div className="flex flex-1 min-w-0 items-start gap-3 flex-wrap">
        {onBack && (
          <button
            onClick={onBack}
            className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg hover:bg-[#f7f8f7] transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <Image
              src="/GrubPac/Box-settings/chevron-right.svg"
              alt=""
              width={20}
              height={20}
              className="rotate-180"
            />
          </button>
        )}
        <h1 className="font-semibold text-2xl text-[#03130a] leading-8 shrink-0 whitespace-nowrap">
          {box.name ?? "BOX"}
        </h1>
        <span className="text-[#c1c7c4] text-xl select-none shrink-0">•</span>
        <p className="text-lg text-[#37493f] leading-7 break-words [overflow-wrap:anywhere] min-w-0 flex-1">
          {subtitleParts.join(" | ")}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 shrink-0">
        {isSettingsEditing ? (
          <>
            <button
              onClick={onSettingsCancelAction}
              disabled={isApplyingSettings}
              className={`h-10 flex items-center gap-2 px-4 rounded-lg text-sm font-medium uppercase tracking-wide border transition-colors ${
                isApplyingSettings
                  ? "bg-[#eff1f0] border-[#e0e3e1] text-[#c1c7c4] cursor-not-allowed"
                  : "bg-white border-[#6b7971] text-[#6b7971] hover:bg-[#f7f8f7] cursor-pointer"
              }`}
            >
              CANCEL
            </button>
            <button
              onClick={onSettingsApplyAction}
              disabled={!canApplySettingsChanges || isApplyingSettings}
              className={`h-10 flex items-center gap-2 px-4 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors border ${
                !canApplySettingsChanges || isApplyingSettings
                  ? "bg-[#eff1f0] border-[#e0e3e1] text-[#c1c7c4] cursor-not-allowed"
                  : "bg-[#fff4ef] border-[#f99d84] text-[#cb3301] hover:bg-[#ffe9df] cursor-pointer"
              }`}
            >
              {isApplyingSettings ? "APPLYING" : "CONFIRM CHANGES"}
            </button>
          </>
        ) : (
          <>
        {/* Driver/Handler pill */}
        <div className="relative">
          <button
            onMouseEnter={() => hasDriver && setShowDriverTooltip(true)}
            onMouseLeave={() => setShowDriverTooltip(false)}
            className={`h-[38px] w-[38px] rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              hasDriver
                ? "bg-white border-[#ffd9cc]"
                : "bg-[#eff1f0] border-[#e0e3e1]"
            }`}
          >
            <Image
              src={
                hasDriver
                  ? "/GrubPac/Box-settings/users-brand.svg"
                  : "/GrubPac/Box-settings/users.svg"
              }
              alt="Handler"
              width={16}
              height={16}
            />
          </button>
          {showDriverTooltip && settings.driver && (
            <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-white border border-[#e0e3e1] rounded-xl shadow-lg px-4 py-3 z-50 whitespace-nowrap text-sm text-[#37493f] min-w-max">
              <p className="text-xs text-[#6b7971] mb-0.5">Connected with</p>
              <p className="font-semibold text-[#cb3301]">{settings.driver.name}</p>
              <p className="text-xs text-[#6b7971]">{settings.driver.phone}</p>
            </div>
          )}
        </div>

        {/* GrubLock token */}
        <button
          onClick={onGrubLockClick}
          disabled={isActionDisabled}
          className={`bg-white rounded-full flex items-center gap-2 px-3 py-1.5 border ${
            isActionDisabled
              ? "border-[#e0e3e1] cursor-not-allowed"
              : "border-[#f0a433] cursor-pointer"
          } ${!isActionDisabled && isGrubLockActive ? "ring-4 ring-[#fe572066]" : ""}`}
        >
          <Image
            src={
              isActionDisabled && grublockStatus !== "LOCKED"
                ? "/GrubPac/Box-settings/grublock-offline-open.svg"
                : grublockStatus === "LOCKED"
                ? "/GrubPac/Box-settings/grublock-brand-close.svg"
                : "/GrubPac/Box-settings/grublock-open.svg"
            }
            alt=""
            width={22}
            height={22}
            className={isActionDisabled && grublockStatus === "LOCKED" ? "opacity-45" : ""}
          />
          <span
            className={`text-sm font-medium uppercase tracking-wide whitespace-nowrap ${
              isActionDisabled ? "text-[#c1c7c4]" : "text-[#f0a433]"
            }`}
          >
            {grublockStatus === "LOCKED" ? "GRUBLOCK" : "UNLOCKED"}
          </span>
        </button>

        {/* Settings edit actions */}
        {isOnline ? (
          <button
            onClick={onSettingsClick}
            disabled={isSettingsEntryLoading}
            className={`h-10 flex items-center gap-3 px-4 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors bg-white border border-[#6b7971] text-[#6b7971] hover:bg-[#f7f8f7] ${isSettingsEntryLoading ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
          >
            <Image
              src="/GrubPac/Box-settings/pen-line.svg"
              alt=""
              width={20}
              height={20}
            />
            SETTINGS
          </button>
        ) : (
          <button
            disabled
            className="bg-[#eff1f0] border border-[#e0e3e1] h-10 flex items-center gap-3 px-4 rounded-lg text-sm font-medium text-[#c1c7c4] uppercase tracking-wide cursor-not-allowed"
          >
            <Image
              src="/GrubPac/Box-settings/pen-line.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-45"
            />
            SETTINGS
          </button>
        )}

        {/* More menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              if (isActionDisabled) {
                return;
              }
              setMenuOpen((v) => !v);
            }}
            disabled={isActionDisabled}
            className={`h-10 w-10 flex items-center justify-center rounded-lg transition-colors ${
              isActionDisabled
                ? "cursor-not-allowed"
                : "hover:bg-[#f7f8f7] cursor-pointer"
            }`}
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <Image
              src="/GrubPac/Box-settings/dots-vertical.svg"
              alt="More"
              width={20}
              height={20}
              className={isActionDisabled ? "opacity-45" : ""}
            />
          </button>

          {menuOpen && !isActionDisabled && (
            <div className="absolute right-0 top-12 z-50 bg-white border border-[var(--gp-color-stroke-neutral-secondary)] rounded-[var(--gp-radius-base)] shadow-[var(--gp-shadow-popup)] w-[240px] overflow-hidden py-1">
              {/* Edit box details */}
              <button
                onClick={() => { setMenuOpen(false); onEdit?.(); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--gp-color-bg-neutral-tertiary)] transition-colors text-left"
              >
                <Image src="/GrubPac/Box-settings/pen-line.svg" alt="" width={18} height={18} />
                <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
                  Edit box details
                </span>
              </button>

              {/* Check permissions */}
              <button
                onClick={() => { setMenuOpen(false); onPermission?.(); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--gp-color-bg-neutral-tertiary)] transition-colors text-left"
              >
                <Image src="/GrubPac/Box-settings/shield-check.svg" alt="" width={18} height={18} />
                <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
                  Check permissions
                </span>
              </button>

              {/* Suspend box */}
              <button
                onClick={() => { setMenuOpen(false); onSuspend?.(); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--gp-color-bg-neutral-tertiary)] transition-colors text-left"
              >
                <Image src="/GrubPac/Box-settings/x-circle.svg" alt="" width={18} height={18} />
                <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
                  Suspend box
                </span>
              </button>

              {/* Remove box */}
              <button
                onClick={() => { setMenuOpen(false); onDelete?.(); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--gp-color-bg-neutral-tertiary)] transition-colors text-left"
              >
                <Image src="/GrubPac/Box-settings/trash.svg" alt="" width={18} height={18} />
                <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
                  Remove box
                </span>
              </button>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
