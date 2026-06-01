import { type Dispatch, type SetStateAction } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IoCheckmark } from "react-icons/io5";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import type { NotificationFilterType, NotificationStatus } from "@/types";

const TYPE_OPTIONS: Array<{
  label: string;
  value: NotificationFilterType;
  colorVar: string;
  hoverState?: string;
  checkedHoverState?: string;
}> = [
  {
    label: "Severe",
    value: "severe",
    colorVar: "--color-alert-warm",
    hoverState:
      "border border-[var(--color-brand-primary-btn)] hover:bg-[var(--sidebar-active-bg)] hover:!border-[var(--color-filter-text)] active:!shadow-[0_0_0_2px_var(--color-shadow-select)]",
    checkedHoverState:
      "border border-none hover:!bg-[var(--color-filter-text)] hover:!border-[var(--color-filter-text)] active:!bg-[var(--color-brand-primary-btn)] active:!border-[var(--color-brand-primary-btn)] active:!shadow-[0px_0px_0px_2px_var(--color-shadow-select)]",
  },
  {
    label: "Success",
    value: "success",
    colorVar: "--color-success",
    hoverState:
      "hover:bg-[var(--color-success-hover)] hover:border-[var(--color-success-dark)] active:!shadow-[0_0_0_2px_var(--color-success-shadow)]",
    checkedHoverState:
      "border border-none !bg-[var(--color-success)] hover:!bg-[var(--color-success-dark)] active:!bg-[var(--color-success)] active:!shadow-[0_0_0_2px_var(--color-success-shadow)]",
  },
  { label: "Warning", value: "warning", colorVar: "--color-helpwrite-btn" },
];

const STATUS_OPTIONS: Array<{
  label: string;
  value: NotificationStatus;
  colorVar: string;
  hoverState?: string;
  checkedHoverState?: string;
}> = [
  {
    label: "Read",
    value: "read",
    colorVar: "--color-checkbox-bg",
    hoverState:
      "border border-[var(--color-checkbox-bg)] peer-hover:!border-[var(--notif-border)] peer-hover:bg-[var(--color-neutral-secondary-bg)] peer-active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
    checkedHoverState:
      "border border-none peer-hover:!bg-[var(--notif-border)] peer-active:!bg-[var(--color-checkbox-bg)] peer-active:!shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
  },
  {
    label: "Unread",
    value: "unread",
    colorVar: "--color-checkbox-bg",
    hoverState:
      "border border-[var(--color-checkbox-bg)] peer-hover:!border-[var(--notif-border)] peer-hover:bg-[var(--color-neutral-secondary-bg)] peer-active:shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
    checkedHoverState:
      "border border-none peer-hover:!bg-[var(--notif-border)] peer-active:!bg-[var(--color-checkbox-bg)] peer-active:!shadow-[0_0_0_2px_var(--color-tablecheckbox-shadow)]",
  },
];

interface NotificationFilterModalProps {
  open: boolean;
  onClose: () => void;
  selectedTypes: NotificationFilterType[];
  setSelectedTypes: Dispatch<SetStateAction<NotificationFilterType[]>>;
  selectedStatuses: NotificationStatus[];
  setSelectedStatuses: Dispatch<SetStateAction<NotificationStatus[]>>;
  onFilter: () => void;
}

export default function NotificationFilterModal({
  open,
  onClose,
  selectedTypes = [],
  setSelectedTypes,
  selectedStatuses = [],
  setSelectedStatuses,
  onFilter,
}: NotificationFilterModalProps) {
    if (!open) return null;

    const handleTypeChange = (value: NotificationFilterType) => {
      setSelectedTypes((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    };
    const handleStatusChange = (value: NotificationStatus) => {
      setSelectedStatuses((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    };

    return (
      <Modal
        open={open}
        onClose={onClose}
        width="w-full max-w-xl"
        positionClass="items-start justify-end"
        top="208px"
        right="24px"
        noBlur={true}
        closeOnOutsideClick={true}
        hideClose={true}
        modalClassName="divide-y divide-[var(--color-stroke-neutral)] py-4"
      >
          {/* Type Section */}
          <div className="pb-4 mb-4 px-6">
            <div className="font-normal text-sm mb-3 text-[var(--color-neutral-secondary)]">
              Type
            </div>
            <div className="flex gap-23 items-center">
              {TYPE_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                  <CustomCheckbox
                    checked={selectedTypes.includes(opt.value)}
                    onChange={() => handleTypeChange(opt.value)}
                    colorVar={opt.colorVar}
                    hoverState={opt.hoverState}
                    checkedHoverState={opt.checkedHoverState}
                  />
                  <span className="font-normal text-lg text-[var(--color-neutral-secondary)]">
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Status Section */}
          <div className="mb-3 pb-4 px-6">
            <div className="font-normal text-sm mb-3 text-[var(--color-neutral-secondary)]">
              Status
            </div>
            <div className="flex gap-27">
              {STATUS_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                  <CustomCheckbox
                    checked={selectedStatuses.includes(opt.value)}
                    onChange={() => handleStatusChange(opt.value)}
                    colorVar={opt.colorVar}
                    hoverState={opt.hoverState}
                    checkedHoverState={opt.checkedHoverState}
                  />
                  <span className="font-normal text-lg  text-[var(--color-neutral-secondary)]">
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-between items-center px-6">
            <Button
              variant="neutral"
              appearance="ghost"
              className=" cursor-pointer text-[var(--color-stroke-brand)] font-medium text-base px-4 py-2 rounded"
              onClick={onClose}
              type="button"
            >
              CANCEL
            </Button>
            <Button
              variant="primary"
              className=" cursor-pointer text-white flex items-center  px-6 py-2 rounded-lg font-medium text-base"
              onClick={onFilter}
              type="button"
            >
              <IoCheckmark size={20} className="!mr-2" />
              FILTER NOTIFICATIONS
            </Button>
          </div>
      </Modal>
    );
}

NotificationFilterModal.displayName = 'NotificationFilterModal';

