"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FiMapPin } from "react-icons/fi";
import FigIcon from "@/components/ui/FigIcon";
import { MdChevronRight } from "react-icons/md";
import type { GrubLockGroup } from "@/types/domain/grublock";

export interface RestaurantGroupDetailsModalProps {
  open: boolean;
  onClose: () => void;
  group: GrubLockGroup;
  onViewList?: () => void;
  onEditList?: () => void;
  onReassign?: () => void;
  isLoading?: boolean;
}

export default function RestaurantGroupDetailsModal({
  open,
  onClose,
  group,
  onViewList,
  onEditList,
  onReassign,
  isLoading = false,
}: RestaurantGroupDetailsModalProps) {
  const boxCount = group.items?.length ?? 0;
  const restaurantName = String(group.name || "");
  const firstBox = group.items?.[0];
  const restaurantAddress = firstBox?.restaurantName
    ? "[Full address of the restaurant if added]"
    : undefined;

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
            {restaurantName}
          </h2>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex items-center">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Status :
            </span>
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
              Active
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Created on :
            </span>
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
              12 Jan&apos;24
            </span>
          </div>

          {restaurantAddress && (
            <div className="flex items-start">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Address :
              </span>
              <div className="flex-1 flex items-start gap-2 ml-4">
                <span className="text-base font-normal text-[var(--color-neutral-secondary)] flex-1">
                  {restaurantAddress}
                </span>
                <FiMapPin className="w-4 h-4 text-[var(--info-panel-view-bg)] flex-shrink-0 mt-0.5" />
              </div>
            </div>
          )}

          <div className="flex items-start">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Resources :
            </span>
            <div className="flex-1 ml-4 -mt-2 space-y-4">
              <div 
                className="flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span className="text-base font-normal text-[var(--color-neutral-secondary)]">
                  {boxCount} GrubPacs
                </span>
                <Button
                  variant="neutral"
                  appearance="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onViewList?.();
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
              <div 
                className="flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <span className="text-base font-normal text-[var(--color-neutral-secondary)]">
                  3 employees
                </span>
                <Button
                  variant="neutral"
                  appearance="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onViewList?.();
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
            </div>
          </div>
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
              onClick={onReassign}
              disabled={isLoading}
              className="flex items-center justify-center !text-xl gap-2"
            >
              REASSIGN
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

