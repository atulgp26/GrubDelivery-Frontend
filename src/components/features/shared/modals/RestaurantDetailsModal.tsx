"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MdChevronRight } from "react-icons/md";
import Image from "next/image";

export interface RestaurantResource {
  label: string;
  count: number;
  onViewList?: () => void;
}

export interface RestaurantDetailsModalProps {
  open: boolean;
  onClose: () => void;
  restaurant: {
    name: string;
    status?: string;
    createdOn?: string;
    suspendedOn?: string;
    address?: string;
    resources?: RestaurantResource[];
  };
  onEdit?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export default function RestaurantDetailsModal({
  open,
  onClose,
  restaurant,
  onEdit,
  onActivate,
  onDelete,
  isLoading = false,
}: RestaurantDetailsModalProps) {
  const normalizedStatus = restaurant.status ?? "active";
  const normalizedCreatedOn = restaurant.createdOn ?? "-";
  const normalizedAddress = restaurant.address ?? "-";
  const isSuspended = normalizedStatus.toLowerCase() === "suspended";
  const truncatedName =
    restaurant.name.length > 25 ? restaurant.name.slice(0, 25) + "..." : restaurant.name;
  const truncatedAddress =
    normalizedAddress.length > 25 ? normalizedAddress.slice(0, 25) + "..." : normalizedAddress;

  const resources = (() => {
    const source = restaurant.resources ?? [];
    const matchByLabel = (label: string) =>
      source.find((resource) => resource.label.toLowerCase() === label.toLowerCase());

    const grubPacs = matchByLabel("GrubPacs");
    const employees = matchByLabel("employees");
    const normalized: RestaurantResource[] = [
      {
        label: "GrubPacs",
        count: grubPacs?.count ?? 0,
        onViewList: grubPacs?.onViewList,
      },
      {
        label: "employees",
        count: employees?.count ?? 0,
        onViewList: employees?.onViewList,
      },
    ];

    const seen = new Set(["grubpacs", "employees"]);
    for (const resource of source) {
      const key = resource.label.toLowerCase();
      if (!seen.has(key)) {
        normalized.push(resource);
      }
    }

    return normalized;
  })();

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px]"
      noXPadding
      closeOnOutsideClick={true}
    >
      <div className="px-6 pb-6">
        <div className="text-left mb-6">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            {truncatedName}
          </h2>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex items-center">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Status :
            </span>
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
              {normalizedStatus}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Created on :
            </span>
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
              {normalizedCreatedOn}
            </span>
          </div>

          <div className="flex items-start">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Address :
            </span>
            <div className="flex-1 flex items-start gap-2 ml-4">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] flex-1">
                {truncatedAddress}
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

          {isSuspended && restaurant.suspendedOn && (
            <div className="flex items-center">
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
                Suspended :
              </span>
              <span className="text-base font-normal text-[var(--color-neutral-secondary)] ml-4">
                {restaurant.suspendedOn}
              </span>
            </div>
          )}

          <div className="flex items-start">
            <span className="text-base font-normal text-[var(--color-neutral-secondary)] min-w-[120px]">
              Resources :
            </span>
            <div className="flex-1 ml-4 -mt-1 space-y-3">
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
                      className="flex items-center gap-1 !text-base !font-medium group"
                    >
                      <span className="group-hover:underline uppercase">VIEW LIST</span>{" "}
                      <MdChevronRight className="w-6 h-6" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-box-border)] my-6"></div>

        <div className="flex flex-col gap-3 mb-2">
          {isSuspended && onActivate ? (
            <Button
              variant="primary"
              appearance="outlined"
              state="press"
              className="font-[var(--gp-font-interactive)] font-medium !text-[20px] h-[48px] hover:underline"
              onClick={onActivate}
              disabled={isLoading}
            >
              ACTIVATE RESTAURANT
            </Button>
          ) : onEdit ? (
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
          ) : null}
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