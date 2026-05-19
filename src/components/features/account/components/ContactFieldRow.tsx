import { useState, useCallback } from "react";
import FigIcon from "@/components/ui/FigIcon";
import { showError } from "@/components/ui/toast";

type ContactFieldRowProps = {
  label: string;
  value: string;
  onEdit: () => void;
  isEditing: boolean;
  tempValue: string;
  onTempValueChange: (v: string) => void;
  onSave: () => void;
  isValid?: boolean;
  disabledEdit?: boolean;
};

export default function ContactFieldRow({
  label,
  value,
  onEdit,
  isEditing,
  tempValue,
  onTempValueChange,
  onSave,
  isValid = true,
  disabledEdit = false,
}: ContactFieldRowProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getLocalContactDigits = (inputValue: string): string => {
    const digits = inputValue.replace(/\D/g, "");
    if (digits.length === 10) {
      return digits;
    }
    if (digits.length === 12 && digits.startsWith("91")) {
      return digits.slice(2);
    }
    return "";
  };

  const handleDismissError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const handleSave = () => {
    const digits = tempValue.replace(/\D/g, "");
    if (digits.length === 10) {
      if (/^(\d)\1{9}$/.test(digits)) {
        showError("Repeating digits are not allowed");
        return;
      }
      if (
        digits === "0123456789" ||
        digits === "1234567890" ||
        digits === "9876543210" ||
        digits === "0987654321"
      ) {
        showError("Sequential digits are not allowed");
        return;
      }
    }

    onSave();
  };

  const handleIconClick = () => {
    if (isValid) {
      handleSave();
      return;
    }

    setErrorMessage(null);
    onTempValueChange(getLocalContactDigits(value));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <>
      <div className="w-full grid grid-cols-12 items-center gap-x-6 py-3">
      <div className="col-span-3 text-[var(--color-neutral-secondary)] text-base leading-6">
        {label} :
      </div>
      <div className="col-span-8 min-w-0">
        {isEditing ? (
          <div className="relative flex items-center gap-3 w-[410px] h-[56px] border border-[var(--gp-color-border-neutral)] rounded-md px-3 py-2 bg-[var(--gp-color-bg-white)] hover:bg-gray-100 hover:border-[var(--gp-color-brand-primary)] focus-within:border-[var(--gp-color-brand-primary)] focus-within:ring-2 focus-within:ring-[rgb(var(--neutral-300))]">
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[var(--color-neutral-secondary)] font-medium">
                +91
              </span>
              <div
                className="border-r border-[var(--gp-color-border-neutral)]"
                style={{ height: "32px" }}
              />
            </div>
            <input
              type="tel"
              value={tempValue}
              onChange={(e) => {
                const newValue = e.target.value;
                const digits = newValue.replace(/\D/g, "");
                if (digits.length <= 10) {
                  onTempValueChange(digits);
                }
              }}
              onKeyDown={handleKeyPress}
              className="flex-1 outline-none bg-transparent text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] ml-6"
              autoFocus
              placeholder="98765 43210"
            />
            <button
              type="button"
              onClick={handleIconClick}
              className={`shrink-0 ${!isValid ? "cursor-pointer" : "cursor-default"}`}
              aria-label={isValid ? `${label} valid` : `${label} invalid`}
            >
              <img
                src={isValid ? "/Settings/Popup/check.svg" : "/x.svg"}
                alt={isValid ? "Check mark" : "Invalid input"}
                className="w-5 h-5"
              />
            </button>
          </div>
        ) : (
          <div className="text-[var(--color-neutral-secondary)] leading-6 truncate">
            {value}
          </div>
        )}
      </div>
      <div className="col-span-1 flex justify-end">
        {!isEditing && (
          <button
            className={`cursor-pointer ${disabledEdit ? "opacity-50 pointer-events-none" : ""}`}
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            disabled={disabledEdit}
          >
            <FigIcon
              name="Settings/pen-line"
              size={20}
              className={`w-4 h-4 ${disabledEdit ? "text-[var(--color-neutral-light)]" : "text-[var(--info-panel-view-bg)]"}`}
            />
          </button>
        )}
      </div>
      </div>
    </>
  );
}
