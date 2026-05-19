"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import FigIcon from "@/components/ui/FigIcon";
import { MdChevronRight } from "react-icons/md";
import type { EmployeeGroup } from "@/types";
import type { EmployeeGroupResource } from "../types";

export type { EmployeeGroupResource };

export interface EmployeeGroupDetailsModalProps {
  open: boolean;
  onClose: () => void;
  group: EmployeeGroup;
  resources?: EmployeeGroupResource[];
  onEditList?: () => void;
  onReassign?: () => void;
  isLoading?: boolean;
}

export default function EmployeeGroupDetailsModal({
  open,
  onClose,
  group,
  resources,
  onEditList,
  onReassign,
  isLoading = false,
}: EmployeeGroupDetailsModalProps) {
  const employeeCount = group.items?.length ?? 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px] max-w-full"
      height="h-[600px]"
      noXPadding
    >
      <div className="px-6">
        <div className="text-left mb-6">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            {group.name}
          </h2>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex items-center">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Employees :
            </span>
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
              {employeeCount}
            </span>
          </div>

          {resources && resources.length > 0 && (
            <div className="flex items-start">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Resources :
              </span>
              <div className="flex-1 ml-4 -mt-2 space-y-4">
                {resources.map((resource, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <span className="text-base font-normal text-[var(--color-neutral-secondary)]">
                      {resource.count} {resource.label}
                    </span>
                    {resource.onViewList && (
                      <Button
                        variant="neutral"
                        appearance="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          resource.onViewList?.();
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex items-center gap-1 !text-base !font-medium"
                      >
                        VIEW LIST <MdChevronRight className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-box-border)] my-8"></div>

        <div className="flex flex-col gap-3 mt-4">
          {onEditList && (
            <Button
              variant="primary"
              appearance="outlined"
              state="press"
              className="flex-1 flex items-center font-medium justify-center gap-2 h-12 hover:underline-offset-4"
              onClick={onEditList}
              disabled={isLoading}
            >
              <FigIcon name="Employee/Popup/pen" size={24} className="w-5 h-5" />
              <span>EDIT LIST</span>
            </Button>
          )}
          {onReassign && (
            <Button
              variant="primary"
              className="flex items-center justify-center !text-xl gap-2" 
              onClick={onReassign}
              disabled={isLoading}
            >
              REASSIGN
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

