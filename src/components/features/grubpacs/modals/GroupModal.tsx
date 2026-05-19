"use client";
import Modal from "@/components/ui/Modal";
import { FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

export default function GroupModal({
  open,
  onClose,
  group,
  onEditDetails,
  onDeleteGroup,
  onViewList,
  status = "Active"
}: {
  open: boolean;
  onClose: () => void;
  group: { name?: string; added?: string; boxes?: number } | null;
  onEditDetails: () => void;
  onDeleteGroup: () => void;
  onViewList: () => void;
  status?: string;
}) {
  if (!group) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[520px] max-w-full"
      height="h-[470px] max-h-full"
    >
      <div className="relative h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-start p-6 pb-4 mt-8">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            {group.name || "First floor"}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6">
          {/* Status */}
          <div className="mb-6">
            <div className="flex items-center gap-24 py-3">
              <span className="text-[var(--color-neutral-secondary)] font-medium">Status :</span>
              <span className="text-[var(--color-neutral-primary)] font-medium">{status}</span>
            </div>
          </div>

          {/* Created On */}
          <div className="mb-6">
            <div className="flex items-center gap-15  py-3">
              <span className="text-[var(--color-neutral-secondary)] font-medium">Created on :</span>
              <span className="text-[var(--color-neutral-primary)] font-medium">{group.added || "12 Jan'24"}</span>
            </div>
          </div>

          {/* Resources */}
          <div className="mb-8">
            <div className="flex items-center gap-16  py-3">
              <span className="text-[var(--color-neutral-secondary)] font-medium">Resources :</span>
              <div className="flex items-center gap-18">
                <span className="text-[var(--color-neutral-primary)] font-medium">
                  {group.boxes || 5} GrubPacs
                </span>
                <button
                  onClick={onViewList}
                  className="flex items-center gap-1 text-[var(--color-stroke-brand)] font-medium hover:underline"
                >
                  VIEW LIST
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Edit Details Button */}
            <Button
            size="lg"
            variant="primary"
              onClick={onEditDetails}
              className="w-full py-3 px-6 border-2 text-xl border-[var(--color-brand-default)] text-[var(--color-brand-default)] font-medium rounded-lg hover:bg-[var(--color-neutral-secondary-bg)] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              EDIT DETAILS
            </Button>

            {/* Delete Group Button */}
            <Button
            size="lg"
            variant="neutral"
              onClick={onDeleteGroup}
              className="w-full py-3 px-6 text-[var(--color-stroke-brand)] text-xl font-medium hover:text-[var(--color-neutral-primary)] transition-colors"
            >
              DELETE GROUP
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
