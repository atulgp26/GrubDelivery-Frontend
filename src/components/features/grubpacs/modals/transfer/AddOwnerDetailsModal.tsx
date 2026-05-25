"use client"
import { useState } from "react"
import Modal from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { HiArrowLeft } from "react-icons/hi"
import { FiArrowLeft } from "react-icons/fi"
import { FaChevronRight } from "react-icons/fa6"

export default function AddOwnerDetailsModal({
  open,
  onClose,
  onBack,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (data: { firstName: string; lastName: string; phone: string; email: string }) => void;
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  })
  
  const [focusedField, setFocusedField] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isFormValid = () => {
    return formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.phone.trim() && 
           formData.email.trim()
  }

  const handleNext = () => {
    if (isFormValid()) {
      onNext(formData)
    }
  }

  return (
    <Modal open={open} onClose={onClose} width="w-[594px] max-w-full" height="h-[500px] max-h-full">
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex items-center">
          <Button
            variant="neutral"
appearance="ghost"
            className="flex gap-2 !p-1 items-center"
            onClick={onBack}
            aria-label="Back"
          >
           <FiArrowLeft className="w-8 h-8 text-[var(--color-stroke-brand)]" />
           <span className="text-[var(--color-stroke-brand)] text-xl">BACK</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 py-6">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            Add new owner details
          </h2>

          {/* Full name section */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-[var(--color-neutral-secondary)]">
              Full name
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => e?.target && handleInputChange("firstName", e.target.value)}
                isFocused={focusedField === "firstName"}
                onFocus={() => setFocusedField("firstName")}
                onBlur={() => setFocusedField("")}
              />
              <Input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => e?.target && handleInputChange("lastName", e.target.value)}
                isFocused={focusedField === "lastName"}
                onFocus={() => setFocusedField("lastName")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          {/* Contact details section */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-[var(--color-neutral-secondary)]">
              Contact details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="tel"
                placeholder="+91  00000 00000"
                value={formData.phone}
                onChange={(e) => e?.target && handleInputChange("phone", e.target.value)}
                isFocused={focusedField === "phone"}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField("")}
              />
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => e?.target && handleInputChange("email", e.target.value)}
                isFocused={focusedField === "email"}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>
        </div>
<hr className="border-t border-[var(--color-box-border)] mx-6" />
        {/* Footer */}
        <div className="p-6">
          <Button
            onClick={handleNext}
            disabled={!isFormValid()}
            variant="primary"
            className="w-full h-12 btn-size-lg-text !leading-none flex items-center gap-2 justify-center font-medium uppercase"
          >
            NEXT
            <FaChevronRight className="w-6 h-6 pb-1"/>
          </Button>
        </div>
      </div>
    </Modal>
  )
} 