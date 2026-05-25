"use client";
import Icon from "@/components/ui/Icon";
import type { NavItemProps } from "@/types";

type StateVariant = "default" | "press" | "hover" | "active" | "disabled";

interface NavItemExtendedProps extends NavItemProps {
  iconSrc?: string;
  activeIconSrc?: string;
  state?: StateVariant;
}

export default function NavItem({
  icon,
  label,
  isActive,
  onClick,
  disabled,
  iconSrc,
  activeIconSrc,
  state = "press",
}: NavItemExtendedProps) {
  const getStateStyles = () => {
    if (state === "press") {
      return "active:ring-2 active:ring-[rgb(var(--neutral-300))]";
    }
    return "";
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      style={{ fontFamily: "var(--Font-Family-Interactive, Inter)" }}
      className={`group flex items-center gap-4 px-4 py-3 text-sm font-medium text-left rounded-lg border w-[208px] h-[40px] ${getStateStyles()} ${disabled
          ? "cursor-not-allowed border-transparent bg-transparent text-[var(--color-neutral-primary)] opacity-60"
          : isActive
          ? "border-[var(--color-stroke-brand)] bg-[var(--sidebar-active-bg)] text-[var(--color-neutral-primary)]"
          : "border-transparent bg-transparent text-[var(--color-neutral-primary)] hover:border-[var(--color-filter-text)] hover:bg-[var(--sidebar-active-bg)] active:border-[var(--color-primary-btn-active)] active:bg-[var(--color-admin-profile-border)]"
        }`}
    >
      {iconSrc || activeIconSrc ? (
        <img
          src={isActive && activeIconSrc ? activeIconSrc : iconSrc}
          alt=""
          className="w-6 h-6 object-contain"
          style={{
            filter: isActive && !activeIconSrc ? 'brightness(0) saturate(100%) invert(25%) sepia(92%) hue-rotate(9deg) brightness(1.05)' : 'brightness(1)'
          }}
        />
      ) : (
        <Icon
          name={icon}
          className={`w-5 h-5 ${isActive
            ? "text-[var(--color-filter-text)]"
            : "text-[var(--color-neutral-light)] group-hover:text-[var(--color-filter-text)] group-active:text-[var(--color-filter-text)]"
            }`}
        />
      )}
      <span
        className={`text-sm font-medium ${isActive
          ? "text-[var(--color-neutral-primary)]"
          : disabled
            ? "text-[var(--color-neutral-light)]"
            : "text-[var(--color-neutral-primary)] group-hover:text-[var(--color-neutral-primary)] group-active:text-[var(--color-neutral-primary)]"
          }`}
      >
        {label}
      </span>
    </button>
  );
}
