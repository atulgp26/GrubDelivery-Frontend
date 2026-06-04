"use client";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface FeedbackModalProps {
  open: boolean;
  onCloseAction: () => void;
  onFeedbackAction: () => void;
}

const FEEDBACK_MAILTO_URL =
  "mailto:support@grubpac.com?subject=GrubPac%20Feedback&body=Hi%20GrubPac%20Team%2C%0A%0AHere%27s%20my%20feedback%3A%0A%0A";

export default function FeedbackModal({ open, onCloseAction, onFeedbackAction }: FeedbackModalProps) {
const handleFeedbackClick = () => {
  window.open(
    "https://mail.google.com/mail/?view=cm&to=support@grubpac.com&subject=GrubPac%20Feedback&body=Hi%20GrubPac%20Team%2C%0A%0AHere%27s%20my%20feedback%3A%0A%0A",
    "_blank"
  );
  onFeedbackAction();
};

  return (
    <Modal
      open={open}
      onClose={onCloseAction}
      width="w-[604px] max-w-full"
      height="h-auto"
      noXPadding
      closeOnOutsideClick={false}
      modalClassName="rounded-[var(--Radius-Base,8px)] border border-[var(--Stroke-Neutral---Secondary,#E0E3E1)] bg-[var(--Background-Neutral---Primary,#FFF)] shadow-[0_0_4px_0_rgba(0,0,0,0.10),4px_4px_8px_0_rgba(0,0,0,0.12)]"
    >
      <div className="relative flex w-full flex-col items-center gap-[var(--Space-XL,24px)] shrink-0 p-[var(--Padding-XL,24px)]">
        <div className="w-full text-center">
          <div className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-3">
            Got a minute?
          </div>
          <div className="text-[length:var(--gp-text-size-lg)] leading-[var(--gp-text-line-height-lg)] text-[var(--color-neutral-secondary)]">
            We&apos;d love to hear how your experience has been so far.
            <br />
            Your feedback helps us improve GrubPac for you and others.
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-[var(--Space-XL,24px)]">
          <Button
            variant="primary"
            appearance="solid"
            size="lg"
            className="w-full text-[20px]"
            onClick={handleFeedbackClick}
          >
            <span>GIVE FEEDBACK</span>
          </Button>
          <Button
            size="lg"
            variant="neutral"
            appearance="ghost"
            className="w-full text-[var(--color-neutral-primary)] text-[20px]"
            onClick={onCloseAction}
          >
            <span>NO THANKS</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}