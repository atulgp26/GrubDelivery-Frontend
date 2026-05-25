"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MdChevronRight } from "react-icons/md";
import Image from "next/image";
import type { GrubLockBox } from "@/types/domain/grublock";

export interface BoxResource {
  label: string;
  count: number;
  onViewList?: () => void;
}

export interface BoxDetailsModalProps {
  open: boolean;
  onClose: () => void;
  box: GrubLockBox;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  restaurant?: {
    status?: string;
    createdOn?: string;
    address?: string;
    resources?: BoxResource[];
  };
}

export default function BoxDetailsModal({
  open,
  onClose,
  box,
  onEdit,
  onDelete,
  isLoading = false,
  restaurant,
}: BoxDetailsModalProps) {
  const restaurantName = box.restaurantName || "Unassigned";
  const restaurantStatus = restaurant?.status || "Active";
  const createdOn = restaurant?.createdOn || "12 Jan'24";
  const address = restaurant?.address || "[Full address of the restaurant if added] [Full address of the restaurant if added] [Full address of the restaurant if added]";
  const resources = restaurant?.resources || [
    { label: "GrubPacs", count: 5, onViewList: undefined },
    { label: "employees", count: 3, onViewList: undefined },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px]"
      noXPadding
      closeOnOutsideClick={false}
    >
      <div className="px-6 py-6">
        <div className="text-left mb-8 mt-2 min-w-0">
          <h2 className="w-full text-2xl font-semibold text-[var(--color-neutral-primary)] break-words [overflow-wrap:anywhere]">
            {restaurantName}
          </h2>
        </div>

        <div className="flex flex-col gap-12">
          <div className="flex items-center">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[132px]">
              Status :
            </span>
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
              {restaurantStatus}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[132px]">
              Created on :
            </span>
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
              {createdOn}
            </span>
          </div>

          <div className="flex items-start">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[132px]">
              Address :
            </span>
            <div className="flex-1 min-w-0 flex items-start gap-2 ml-4">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] flex-1 break-words [overflow-wrap:anywhere]">
                {address}
              </span>
              <Image 
                src="/Employee/Popup/location-pin.svg" 
                alt="Location" 
                width={16} 
                height={16} 
                className="flex-shrink-0 mt-0.5" 
              />
            </div>
          </div>

          {resources && resources.length > 0 && (
            <div className="flex items-start">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[132px]">
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-box-border)] my-6"></div>

        <div className="flex flex-col gap-3 mb-2">
          {onEdit && (
            <Button
              variant="primary"
              appearance="outlined"
              state="press"
              className="flex font-[var(--gp-font-interactive)] font-medium items-center justify-center !text-[20px] gap-2 h-[48px] hover:underline"
              onClick={onEdit}
              disabled={isLoading}
            >
              <Image src="/Employee/Popup/pen.svg" alt="Edit" width={20} height={20} />
              EDIT DETAILS
            </Button>
          )}
          {onDelete && (
            <Button
              variant="neutral"
              appearance="ghost"
              onClick={onDelete}
              disabled={isLoading}
              className="text-center !text-xl min-w-16 flex items-center justify-center gap-2"
            >
              <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase">
                DELETE RESTAURANT
              </span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
