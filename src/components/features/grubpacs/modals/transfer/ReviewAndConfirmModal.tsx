"use client"
import { useState } from "react"
import Modal from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { HiArrowLeft } from "react-icons/hi"
import TableCheckbox from "@/components/ui/TableCheckbox"
import CheckBox from "@/components/ui/CheckBox"
import { FaAngleRight, FaChevronRight } from "react-icons/fa6"

export default function ReviewAndConfirmModal({
  open,
  onClose,
  onBack,
  selectedCount = 3,
  transferType = "selected",
  ownerDetails,
  onConfirm,
  onViewList,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedCount?: number;
  transferType?: string;
  ownerDetails?: { firstName?: string; lastName?: string; phone?: string; email?: string };
  onConfirm: () => void;
  onViewList?: () => void;
}) {
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm()
    }
  }

  const fullName = ownerDetails ? `${ownerDetails.firstName} ${ownerDetails.lastName}` : "Sharon Sharma"
  const phone = ownerDetails?.phone || "+91 98000 00000"
  const email = ownerDetails?.email || "sharon@gmail.com"

  return (
    <Modal open={open} onClose={onClose} width="w-[600px] max-w-full" height="h-auto">
      <div className="flex flex-col w-full bg-white">
        {/* Header */}
        <div className=" flex items-center justify-between px-6 pt-6 pb-4">
          <Button
          variant="neutral"
appearance="ghost"
            onClick={onBack}
            className="flex absolute left-8 top-8  items-center !p-1 gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <HiArrowLeft size={18} />
            <span className="text-xl font-medium text-[var(--color-stroke-brand)] tracking-wide">BACK</span>
          </Button>
         
        </div>

        {/* Content */}
        <div className="px-6 pb-6 mt-5">
          {/* Title */}
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-8">
            Review and confirm
          </h2>

          {/* 3 Column Layout */}
          <div className="space-y-6 mb-8">
            {/* Transfer includes row */}
            <div className="grid grid-cols-3 gap-4 items-start">
              {/* Column 1: Label */}
              <div className="text-base text-[var(--color-neutral-secondary)]">
                Transfer includes :
              </div>
              
              {/* Column 2: Value */}
              <div className="text-base text-[var(--color-neutral-secondary)] font-medium">
               All {selectedCount} GrubPacs
              </div>
              
              {/* Column 3: Action */}
              <div className="text-right">
                {transferType === "selected" && (
                  <Button variant="neutral"
appearance="ghost" onClick={onViewList} className="flex items-center gap-1 text-[var(--color-stroke-brand)] transition-colors ml-auto group">
                    <span className="text-base font-medium group-hover:underline">VIEW LIST</span>
                    <FaAngleRight className="w-4 h-4"/>
                  </Button>
                )}
              </div>
            </div>

            {/* Transferring to row */}
            <div className="grid grid-cols-3 gap-4 items-start">
              {/* Column 1: Label */}
              <div className="text-base text-[var(--color-neutral-secondary)]">
                Transferring to :
              </div>
              
              {/* Column 2: Name */}
              <div className="text-base text-[var(--color-neutral-secondary)] font-medium">
                {fullName}
              </div>
              
              {/* Column 3: Empty for this row */}
              <div></div>
            </div>

            {/* Contact info row */}
            <div className="grid grid-cols-3 gap-4 items-start">
              {/* Column 1: Empty */}
              <div></div>
              
              {/* Column 2: Contact details */}
              <div className="text-base text-[var(--color-neutral-secondary)] col-span-2">
                {phone} | {email}
              </div>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <div className="mb-6">
            <div className="flex items-start gap-3 cursor-pointer pb-6 border-b border-[var(--color-box-border)]">
                <CheckBox
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                />
              <span className="text-base text-[var(--color-neutral-secondary)] leading-relaxed">
                I understand that I will lose access to my account after this transfer.
              </span>
            </div>
          </div>

                     {/* Continue button */}
           <Button
           variant="primary"
             onClick={handleConfirm}
             disabled={!isConfirmed}
             className="w-full h-12 btn-size-lg-text font-medium uppercase flex items-center justify-center gap-2 bg-[var(--color-brand-default)] text-white hover:bg-[var(--color-brand-primary-btn)]"
           >
             CONTINUE TO OTP VERIFICATION
             <FaChevronRight className="w-5 h-5"/>
           </Button>
        </div>
      </div>
    </Modal>
  )
}
