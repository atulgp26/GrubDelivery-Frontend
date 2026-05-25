import type { MouseEvent } from "react";
import Icon from "./Icon";
import type { BoxCountBadgeProps } from "@/types";

export default function BoxCountBadge({
  count,
  icon,
  className = "",
  onClick,
  children,
  asText = false,
  textClassName = "",
  iconColor,
  iconName = "",
}: BoxCountBadgeProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  if (asText) {
    return (
      <span className={`cursor-default ${textClassName}`}>
        {children}
      </span>
    );
  }

  // Original button behavior for count badges
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group transition-all duration-200 outline-none border ${count > 0 ? "border-[var(--color-admin-profile-border)]" : "border-[var(--color-box-border)]"} hover:border-[var(--info-panel-view-bg)] bg-white hover:bg-[var(--color-admin-profile-border)] rounded-full px-4 py-2 flex items-center gap-2 text-base font-normal select-none focus:ring-2 focus:ring-[var(--color-brand-default)] ${className}`}
      style={{ minWidth: 64 }}
    >
      {iconName ? (
        <Icon
          name={iconName}
          className={`w-5 h-5 ${iconColor ?? ""} ${count > 0
              ? "text-[var(--info-panel-view-bg)]"
              : "text-[var(--color-neutral-light)] group-hover:text-[var(--color-brand-default)]"
            } transition-colors`}
        />
      ) : (
        <Icon
          name="inventory"
          className={`w-5 h-5 ${iconColor ?? ""} ${count > 0
              ? "text-[var(--info-panel-view-bg)]"
              : "text-[var(--color-neutral-light)] group-hover:text-[var(--color-brand-default)]"
            } transition-colors`}
        />
      )}
      <span className="text-[var(--color-neutral-secondary)] text-sm font-normal">{count}</span>
    </button>
  );
}
