import { MdDone } from "react-icons/md";
import { Button } from "./Button";
import { useState } from "react";
import type { SelectedActionProps } from "@/types";

const SelectedAction = ({
  open,
  activeAction,
  onClose,
  selectedCount,
  isChecked,
  setIsChecked,
  zone1Temp,
  zone2Temp,
  setZone1Temp,
  setZone2Temp,
}: SelectedActionProps) => {
  const [selectedAction, setSelectedAction] = useState<"on" | "off" | null>(
    null
  );
  const [openActionConfirm, setOpenActionConfirm] = useState<boolean>(false);

  if (!open) return null;

  // TODO: Implement TemperatureDualZone component
  // if (activeAction === "temperature") {
  //   return <TemperatureDualZone onClose={onClose} 
  //     isChecked={isChecked} 
  //     setIsChecked={setIsChecked}
  //     zone1Temp={zone1Temp}
  //     zone2Temp={zone2Temp}
  //     setZone1Temp={setZone1Temp}
  //     setZone2Temp={setZone2Temp}/>;
  // }

  return (
    <>
      <div className="absolute bottom-14 left-0 w-64 bg-white shadow-xl rounded-lg border border-[var(--color-stroke-neutral)] flex flex-col">
        <h1 className="text-sm text-[var(--color-neutral-secondary)] py-2 px-4">
          Take action on selected boxes :
        </h1>

        {/* TURN OFF */}
        <div
          className={`${
            selectedAction === "off" ? "bg-[var(--color-brand-icon)]" : ""
          } border-b uppercase border-[var(--color-stroke-neutral)] text-[var(--notif-error)] px-4 py-3 hover:bg-[var(--color-brand-icon)]`}
          onClick={() => setSelectedAction("off")}
        >
          <Button
            variant="error"
            className={`flex uppercase items-center gap-3 px-2 py-1 bg-[var(--toast-error-bg)] rounded-full border border-[var(--color-alert-warm)] text-[var(--notif-error)] text-sm font-normal`}
          >
            TURN {activeAction} OFF
          </Button>
        </div>

        {/* TURN ON */}
        <div
          className={`${
            selectedAction === "on" ? "bg-[var(--color-brand-icon)]" : ""
          } border-b border-[var(--color-stroke-neutral)] px-4 py-3 hover:bg-[var(--color-brand-icon)]`}
          onClick={() => setSelectedAction("on")}
        >
          <Button
            variant="success"
            className={`flex uppercase items-center gap-3 px-2 py-1 bg-[var(--toast-success-bg)] rounded-full border border-[var(--color-success)] text-[var(--notif-success)] text-sm font-normal`}
          >
            TURN {activeAction} ON
          </Button>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between text-sm px-4 py-2 items-center">
          <Button
            variant="neutral"
            appearance="ghost"
            className="!text-[var(--color-stroke-brand)]"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            disabled={!selectedAction}
            className={`flex items-center text-sm gap-2 ${
              selectedAction
                ? "text-[var(--color-brand-default)]"
                : "text-[var(--color-box-border)] disabled"
            }`}
            onClick={() => setOpenActionConfirm(true)}
          >
            <MdDone />
            CONFIRM
          </Button>
        </div>

        {/* TODO: Implement ActionConfirmModal component */}
        {/* <ActionConfirmModal
          open={openActionConfirm}
          onClose={() => {
            setOpenActionConfirm(false);
            // Close parent dropdown after action is confirmed
            setTimeout(() => {
              onClose();
            }, 1200);
          }}
          selectedCount={selectedCount}
          activeAction={activeAction}
          selectedAction={selectedAction}
        /> */}
      </div>
    </>
  );
};

export default SelectedAction;
