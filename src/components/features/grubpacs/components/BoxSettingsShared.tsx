import React from "react";
import Image from "next/image";
import type { BadgeVariant } from "../details/types";

export function StatusBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    green: "bg-[#dcecd4] border-[#5ca940] text-[#479f29]",
    red: "bg-[#ffd8cb] border-[#e44421] text-[#dc2807]",
    orange: "bg-[#ffecd7] border-[#f4ad49] text-[#f0a433]",
    gray: "bg-[#eff1f0] border-[#c1c7c4] text-[#6b7971]",
  };
  return (
    <span
      className={`${styles[variant]} border px-2 py-[3px] rounded-full text-xs font-medium uppercase whitespace-nowrap shrink-0`}
    >
      {label}
    </span>
  );
}

export function SectionChevron({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-7 w-7 flex items-center justify-center rounded cursor-pointer shrink-0"
      aria-label="Toggle section"
    >
      <Image
        src={
          open
            ? "/GrubPac/Box-settings/chevron-up.svg"
            : "/GrubPac/Box-settings/chevron-down.svg"
        }
        alt=""
        width={24}
        height={24}
      />
    </button>
  );
}

export function SectionHeading({
  title,
  open,
  onToggle,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between w-full shrink-0">
      <p className="font-semibold text-base text-[#03130a] leading-6">{title}</p>
      <SectionChevron open={open} onClick={onToggle} />
    </div>
  );
}

export function SettingsRow({
  icon,
  label,
  badge,
  value,
  extraBadge,
  chevronType = "right",
  onChevronClick,
  onRowClick,
  onIconClick,
  onBadgeClick,
  rowClassName,
}: {
  icon: string;
  label: string;
  badge?: { label: string; variant: BadgeVariant };
  value?: string;
  extraBadge?: { label: string; variant: BadgeVariant };
  chevronType?: "right" | "up" | "down";
  onChevronClick?: () => void;
  onRowClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onIconClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onBadgeClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  rowClassName?: string;
}) {
  const chevronSrc =
    chevronType === "up"
      ? "/GrubPac/Box-settings/chevron-up.svg"
      : chevronType === "down"
      ? "/GrubPac/Box-settings/chevron-down.svg"
      : "/GrubPac/Box-settings/chevron-right.svg";

  return (
    <div
      className={`bg-[#eff1f0] border border-[#e0e3e1] rounded-lg flex items-center gap-3 px-3 py-2 w-full shrink-0 ${
        onRowClick ? "cursor-pointer" : ""
      } ${rowClassName ?? ""}`}
      onClick={onRowClick}
    >
      {onIconClick ? (
        <button
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded shrink-0 cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            onIconClick(event);
          }}
          aria-label={`${label} icon action`}
        >
          <Image src={icon} alt="" width={24} height={24} className="shrink-0" />
        </button>
      ) : (
        <Image src={icon} alt="" width={24} height={24} className="shrink-0" />
      )}
      <span className="flex-1 font-semibold text-base text-[#03130a] leading-6 min-w-0">
        {label}
      </span>
      {badge &&
        (onBadgeClick ? (
          <button
            type="button"
            className="shrink-0 cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              onBadgeClick(event);
            }}
            aria-label={`${label} status action`}
          >
            <StatusBadge label={badge.label} variant={badge.variant} />
          </button>
        ) : (
          <StatusBadge label={badge.label} variant={badge.variant} />
        ))}
      {extraBadge && (
        <StatusBadge label={extraBadge.label} variant={extraBadge.variant} />
      )}
      {value && (
        <span className="font-semibold text-base text-[#37493f] whitespace-nowrap shrink-0">
          {value}
        </span>
      )}
      <button
        onClick={(event) => {
          event.stopPropagation();
          onChevronClick?.();
        }}
        className="h-7 w-7 flex items-center justify-center rounded cursor-pointer shrink-0"
        aria-label="Open"
      >
        <Image src={chevronSrc} alt="" width={24} height={24} />
      </button>
    </div>
  );
}
