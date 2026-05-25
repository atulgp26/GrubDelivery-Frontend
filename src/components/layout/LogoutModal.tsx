import Modal from "../ui/Modal";
import { Button } from "../ui/Button";
import type { LogoutModalProps } from "@/types";

export default function LogoutModal({ open, onClose, onLogout }: LogoutModalProps) {
  return (
    <Modal open={open} onClose={onClose} width="w-[504px] max-w-full" noXPadding={true}>
      <div className="relative px-6 py-3">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-4 mt-4">
            Logging out?
          </h2>
          <p className="text-[var(--color-neutral-secondary)] text-lg mb-8 leading-relaxed">
            You&apos;ll be signed out of your account on this device.
            <br />
            You can log back in anytime.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={onLogout}
              variant="primary"
              appearance="outlined"
              state="press"
              size="lg"
              className="w-full btn-size-md-lg flex items-center justify-center text-[length:var(--gp-button-font-size-lg)] hover:underline"
            >
              LOG OUT
            </Button>
            <Button onClick={onClose} variant="neutral" appearance="ghost" size="md" className="text-[length:var(--gp-button-font-size-lg)]">
              <span>CANCEL</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
