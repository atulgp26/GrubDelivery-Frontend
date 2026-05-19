import { Button } from "./Button";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Icon from "./Icon";
import type { TableActionBarProps } from "@/types";

export default function TableActionBar({
  selectedCount = 0,
  onClearSelection,
  onSuspend,
  onRemoveVehicles,
  onReassignRole,
  onRemoveRoom,
  rightActionLabel,
  rightActionIcon,
  onRightAction,
  suspended,
  rightActionVariant,
  onActivate,
  onDelete,
  onRoles,
  employeeList,
  allowActivate = true,
  allowDelete = true,
  allowSuspend = true,
  allowReassign = true,
  reassignLabel = "Reassign Role",
}: TableActionBarProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showMoreDropdown, setShowMoreDropdown] = useState<boolean>(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const actionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreDropdown(false);
      }
    }
    if (showMoreDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMoreDropdown]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setActiveAction(null);
      }
    }
    if (activeAction) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeAction]);
  if (selectedCount === 0) return null;

  return (
    <div 
      className="fixed bottom-3 bg-[#eff1f0] border border-[#c1c7c4] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] flex items-center gap-4 px-4 py-3 z-50" 
      style={{ left: 'var(--table-action-bar-left, 1rem)', right: '1rem' }}
    >
      {/* Selection count button */}
      <Button
        type="button"
        variant="neutral"
        appearance="outlined"
        state="press"
        className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg !bg-white"
        onClick={onClearSelection}
      >
        <Image src="/Employee/Multiselect/x.svg" alt="Close" width={20} height={20} />
        <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase">
          {selectedCount} SELECTED
        </span>
      </Button>
      {
        suspended ?
          <div className="flex-1 flex items-center justify-end gap-4">
            {allowActivate && (
              <Button type="button" onClick={onActivate} variant="primary" state="press" className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg">
                <Icon name="user_check" className="w-6 h-6" />
                <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase">
                  ACTIVATE SELECTION
                </span>
              </Button>
            )}
            {allowDelete && (
              <Button type="button" onClick={onDelete} variant="neutral" appearance="ghost" className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg hover:bg-[rgba(254,72,11,0.08)] transition-colors">
                <Image src="/Employee/Multiselect/trash.svg" alt="Delete" width={24} height={24} />
                <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                  DELETE
                </span>
              </Button>
            )}
          </div> : (
          // Actions
          <div className="flex-1 flex items-center justify-end gap-4">
            {allowReassign && onReassignRole && (
              <Button type="button" onClick={onReassignRole} variant="neutral" appearance="ghost" className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg hover:bg-[rgba(254,72,11,0.08)] transition-colors">
                <Image src="/Employee/Multiselect/refresh.svg" alt="Reassign" width={18} height={18} />
                <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                  {reassignLabel || "RE/ASSIGN RESTAURANT"}
                </span>
              </Button>
            )}
            {allowDelete && onDelete && (
              <Button type="button" onClick={onDelete} variant="neutral" appearance="ghost" className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg hover:bg-[rgba(254,72,11,0.08)] transition-colors">
                <Image src="/Employee/Multiselect/trash.svg" alt="Delete" width={18} height={18} />
                <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                  {employeeList ? "DELETE" : "DELETE SELECTION"}
                </span>
              </Button>
            )}
            {allowSuspend && onSuspend && (
              <Button type="button" onClick={onSuspend} variant="neutral" appearance="ghost" className="flex items-center gap-3 h-10 px-4 py-2 rounded-lg hover:bg-[rgba(254,72,11,0.08)] transition-colors">
                <Image src="/Employee/Multiselect/x-circle.svg" alt="Suspend" width={18} height={18} />
                <span className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase text-[var(--gp-color-text-neutral-tertiary)]">
                  SUSPEND SELECTION
                </span>
              </Button>
            )}
            {rightActionLabel && onRightAction && (
              <Button
                type="button"
                variant={(rightActionVariant as any) || "error"}
                appearance="solid"
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 ${
                  rightActionLabel === "EMERGENCY UNLOCK"
                    ? `border border-[var(--color-warning)] !rounded-full hover:text-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]`
                    : "bg-transparent uppercase cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors"
                }`}
                onClick={onRightAction}
              >
                {rightActionIcon && rightActionIcon}
                {rightActionLabel}
              </Button>
            )}
          </div>
        )
      }
    </div>
  );
}