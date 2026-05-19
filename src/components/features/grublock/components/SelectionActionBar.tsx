import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface SelectionActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onEmergencyUnlock: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isEmergencyUnlockActive?: boolean;
}

export default function SelectionActionBar({
  selectedCount,
  onClearSelection,
  onEmergencyUnlock,
  isEmergencyUnlockActive = false,
}: SelectionActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed bottom-3 left-4 right-4 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] text-[var(--color-stroke-brand)] rounded-lg shadow-lg flex items-center justify-between px-6 h-16 z-50"
      style={{
        left: "var(--table-action-bar-left, 1rem)",
        right: "1rem",
      }}
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="neutral"
          appearance="outlined"
          state="press"
          className="flex gap-2 !border cursor-pointer bg-white px-4 rounded-md !text-base font-medium items-center h-10"
          onClick={onClearSelection}
        >
          <Image src="/x.svg" alt="" width={20} height={20} />
          <span>{selectedCount} SELECTED</span>
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          onClick={onEmergencyUnlock}
          className={`inline-flex items-center gap-[var(--gp-space-s)] px-[var(--gp-padding-s)] h-10 rounded-full border font-medium text-[16px] leading-[20px] uppercase cursor-pointer ${
            isEmergencyUnlockActive
              ? "ring-4 ring-[#F6D5A6] ring-offset-0"
              : ""
          }`}
          style={{
            backgroundColor: isEmergencyUnlockActive ? "#F0A433" : "#FFECD7",
            borderColor: "#C9822B",
            color: isEmergencyUnlockActive ? "#FFFFFF" : "#F0A433"
          }}
        >
          <img
            src={
              isEmergencyUnlockActive
                ? "/Grublock-light.svg"
                : "/GrubLock/Table/Grouped/Box/Table/Default/Table/Row/Table/Cell/Token/Grublock.svg"
            }
            alt=""
            className="size-7 shrink-0"
            aria-hidden
          />
          <span>EMERGENCY UNLOCK</span>
        </Button>
      </div>
    </div>
  );
}

