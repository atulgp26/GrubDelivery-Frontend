import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { showSuccess } from "@/components/ui/toast";

export default function ActionConfirmModal({
  open,
  onClose,
  selectedCount,
  activeAction,
  selectedAction,
  zone1Temp, 
  zone2Temp,
}: {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  activeAction?: string;
  selectedAction?: string;
  zone1Temp?: string;
  zone2Temp?: string;
}) {

  const isTurnOn = selectedAction === "on";

const onConfirm = () => {
  // Show success message based on action type
  const message = "Unlock Request Sent!";
  const description =
    "Your emergency unlock request has been sent to the selected box. Please check the boxes to confirm.";

  // if (zone1Temp || zone2Temp) {
  //   message = `Temperature settings applied to ${selectedCount} boxes!`;
  //   description = `Dual zone ${
  //     selectedAction === "on" ? "enabled" : "disabled"
  //   } and temperature set successfully.`;
  // } else {
  //   const actionLabel = activeAction
  //     ? activeAction.charAt(0).toUpperCase() + activeAction.slice(1)
  //     : "Action"; // fallback if activeAction is undefined

  //   message = `${actionLabel} ${
  //     selectedAction === "on" ? "turned ON" : "turned OFF"
  //   } for ${selectedCount} boxes!`;
  //   description = "Changes in the selected boxes will reflect shortly.";
  // }

  showSuccess(message, description);

  // Close the modal and any parent dropdowns
  setTimeout(() => {
    onClose();
  }, 1000);
};
if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-2xl text-[var(--color-neutral-primary)] font-semibold text-center mb-2">
        Apply settings to {selectedCount} boxes?
      </h2>

      <p className="text-lg text-center text-[var(--color-neutral-secondary)] mb-5">
        This action will update their configuration immediately and may <br /> impact contents currently inside.
      </p>

      {/* ✅ Updated confirmation summary */}
      <div className="flex flex-col gap-4 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] rounded-md px-4 py-3 text-[var(--color-neutral-secondary)] mb-6">
        <div className="flex items-center justify-center gap-2 text-lg">
          <span className="font-semibold text-base">Change to be applied:</span>
          {zone1Temp || zone2Temp ?
          <div className="flex gap-2 py-1 px-2 rounded-full border border-[var(--color-checkbox-bg)]">
        <div className="flex uppercase text-sm font-medium text-[var(--color-stroke-brand)] ml-1">
          <p>dual mode {isTurnOn ? "ON" : "OFF"}, </p>
          <p>Temperature set to: {zone1Temp}°C</p>
          </div>
        </div>:  
          <span
            className={`leading-none flex uppercase items-center gap-2 px-3 py-1 rounded-full border text-base font-medium
              ${
                isTurnOn
                  ? 'bg-[var(--toast-success-bg)] border-[var(--color-success)] text-[var(--notif-success)]'
                  : 'bg-[var(--toast-error-bg)] border-[var(--color-alert-warm)] text-[var(--notif-error)]'
              }
            `}
          >
            TURN {activeAction} {isTurnOn ? "ON" : "OFF"}
          </span>
        }
        </div>
      </div>
      <div className="w-full border-t border-[var(--color-box-border)] mb-6"></div>

      <div className="flex flex-col space-y-4">
        <Button
          variant="primary"
          onClick={onConfirm}
          size="lg"
        >
          YES, APPLY CHANGES
        </Button>
        <Button
          variant="neutral"
          size="lg"
          onClick={onClose}
          className="text-xl font-medium uppercase"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
