"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FiEdit3 } from "react-icons/fi";
import { MdChevronRight } from "react-icons/md";
import type { EmployeeResource } from "../types";

export type { EmployeeResource };

export interface EmployeeDetailsModalProps {
  open: boolean;
  onClose: () => void;
  employee: {
    name: string;
    employeeId: string;
    status?: string;
    joinedDate?: string;
    phone?: string;
    email?: string;
    role?: string;
    restaurantName?: string;
    resources?: EmployeeResource[];
  };
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export default function EmployeeDetailsModal({
  open,
  onClose,
  employee,
  onEdit,
  onDelete,
  isLoading = false,
}: EmployeeDetailsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px] max-w-full"
      noXPadding
    >
      <div className="px-6 py-6">
        <div className="text-left mb-6">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            {employee.name}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {employee.status && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Status :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {employee.status}
              </span>
            </div>
          )}

          {employee.employeeId && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Employee ID :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {employee.employeeId}
              </span>
            </div>
          )}

          {employee.joinedDate && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Joined on :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {employee.joinedDate}
              </span>
            </div>
          )}

          {employee.phone && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Phone :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {employee.phone}
              </span>
            </div>
          )}

          {employee.email && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Email :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {employee.email}
              </span>
            </div>
          )}

          {employee.role && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Role :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {employee.role}
              </span>
            </div>
          )}

          {employee.restaurantName && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Restaurant :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {employee.restaurantName}
              </span>
            </div>
          )}

          {employee.resources && employee.resources.length > 0 && (
            <div className="flex items-start">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Resources :
              </span>
              <div className="flex-1 ml-4 -mt-2 space-y-4">
                {employee.resources.map((resource, index) => (
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

        <div className="border-t border-[var(--color-box-border)] my-6"></div>

        <div className="flex flex-col gap-3">
          {onEdit && (
            <Button
              variant="primary"
              className="flex items-center justify-center !text-xl gap-2" 
              onClick={onEdit}
              disabled={isLoading}
            >
              <FiEdit3 className="w-5 h-5" />
              EDIT DETAILS
            </Button>
          )}
          {onDelete && (
            <Button
              variant="neutral"
              appearance="ghost"
              onClick={onDelete}
              disabled={isLoading}
              className="text-center !text-xl"
            >
              DELETE EMPLOYEE
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

