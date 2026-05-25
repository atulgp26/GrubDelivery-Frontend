"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="#FE480B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface RegionSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

export default function RegionSelect({
  value,
  onValueChange,
  placeholder,
  options,
  disabled = false,
}: RegionSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-disabled={disabled}
          className={cn(
            "bg-white border border-[var(--gp-color-border-neutral)] rounded-[var(--gp-radius-base)] h-[48px] px-4 flex items-center justify-between transition-colors",
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-[var(--gp-color-brand-primary)]",
            open && "border-[var(--gp-color-brand-primary)]"
          )}
        >
          <span
            className={cn(
              "font-normal text-base truncate",
              selected
                ? "text-[var(--gp-color-text-neutral-secondary)]"
                : "text-[var(--gp-color-text-neutral-light)]"
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDownIcon
            className={cn("shrink-0 transition-transform", open && "rotate-180")}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white border border-[var(--gp-color-border-neutral)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-0 max-h-[200px] overflow-y-auto"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={false}
        style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => {
              onValueChange(opt.value);
              setOpen(false);
            }}
            className="px-4 py-3 border-t border-[var(--gp-color-border-neutral)] first:border-t-0 hover:bg-[var(--gp-color-bg-neutral-secondary)] cursor-pointer"
          >
            <span className="text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
              {opt.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
