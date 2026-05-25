"use client";

import LockBoxModal from "./LockBoxModal";

interface Recipient {
  name?: string;
  phone?: string;
  countryCode?: string;
}

interface EditDetailsModalProps {
  open: boolean;
  onClose: () => void;
  recipient?: Recipient;
  onSave?: (recipient: Recipient) => void;
  positionClass?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  noBlur?: boolean;
}

export default function EditDetailsModal({
  open,
  onClose,
  recipient,
  onSave,
  positionClass,
  top,
  right,
  bottom,
  left,
  noBlur = false,
}: EditDetailsModalProps) {
  return (
    <LockBoxModal
      open={open}
      onClose={onClose}
      onSubmit={(values) => {
        onSave?.(values);
      }}
      mode="edit"
      initialValues={recipient}
      positionClass={positionClass}
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      noBlur={noBlur}
    />
  );
}

