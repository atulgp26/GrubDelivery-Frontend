import FigIcon from "@/components/ui/FigIcon";

type FieldRowProps = {
  label: string;
  value: string;
  onEdit: () => void;
  isEditing: boolean;
  tempValue: string;
  onTempValueChange: (v: string) => void;
  onSave: () => void;
  type?: "text" | "email" | "password";
  isValid?: boolean;
  disabledEdit?: boolean;
};

export default function FieldRow({
  label,
  value,
  onEdit,
  isEditing,
  tempValue,
  onTempValueChange,
  onSave,
  type = "text",
  isValid = true,
  disabledEdit = false,
}: FieldRowProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSave();
    }
  };

  const handleIconClick = () => {
    if (isValid) {
      onSave();
      return;
    }
    onTempValueChange(value || "");
  };

  return (
    <div className="w-full grid grid-cols-12 items-center gap-x-6 py-3">
      <div className="col-span-3 text-[var(--color-neutral-secondary)] text-base leading-6">
        {label} :
      </div>
      <div className="col-span-8 min-w-0">
        {isEditing ? (
          <div className="relative w-[410px] h-[56px]">
            <input
              type={type === "password" ? "text" : type}
              value={tempValue}
              onChange={(e) => onTempValueChange(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-full px-3 py-2 pr-10 rounded-md border border-[var(--gp-color-border-neutral)] text-[var(--color-neutral-secondary)] placeholder:text-[var(--color-neutral-light)] bg-[var(--gp-color-bg-white)] hover:bg-gray-100 hover:border-[var(--gp-color-brand-primary)] focus:border-[var(--gp-color-brand-primary)] focus:bg-white focus:ring-2 focus:ring-[rgb(var(--neutral-300))] active:ring-2 active:ring-[rgb(var(--neutral-300))] outline-none transition-colors"
              autoFocus
            />
            <button
              type="button"
              onClick={handleIconClick}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${!isValid ? "cursor-pointer" : "cursor-default"}`}
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
  );
}
