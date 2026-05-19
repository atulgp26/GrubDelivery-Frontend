"use client";

import { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import DropdownPortal from "./DropdownPortal";
import type { ReactNode } from "react";

export interface ActionsMenuItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ActionsMenuProps {
  items: ActionsMenuItem[];
  itemId?: string | number;
  className?: string;
}

export default function ActionsMenu({ items, itemId, className = "" }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className={`p-1 rounded-lg transition-all ${
          isOpen
            ? "bg-[var(--color-neutral-secondary-bg)] text-[var(--notif-border)]"
            : "hover:bg-[var(--color-neutral-secondary-bg)] text-[var(--color-neutral-secondary)]"
        }`}
        style={
          isOpen
            ? {
                boxShadow: "0 0 0 var(--Spread-50, 2px) var(--Special-Effects-Ring---Colour, rgba(121, 134, 126, 0.40))",
              }
            : undefined
        }
        onClick={handleToggle}
      >
        <FiMoreVertical className="w-5 h-5" />
      </button>
      <DropdownPortal open={isOpen} onClose={() => setIsOpen(false)}>
        <div
          className="rounded-lg border border-[var(--color-stroke-neutral)] bg-white overflow-hidden"
          style={{
            boxShadow: `0 0 4px 0 var(--dropdown-shadow-soft), 4px 4px 8px 0 var(--dropdown-shadow-strong)`,
          }}
        >
          {items.map((item, index) => (
            <button
              key={`${itemId ?? index}-${item.label}`}
              type="button"
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-normal text-[var(--color-neutral-secondary)] hover:bg-[var(--color-neutral-secondary-bg)] transition-colors ${
                index < items.length - 1 ? "border-b border-[var(--color-stroke-neutral)]" : ""
              } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) {
                  handleItemClick(item.onClick);
                }
              }}
            >
              <div className="text-[var(--color-neutral-light)] flex items-center">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </DropdownPortal>
    </div>
  );
}

