import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface FilterModalFooterProps {
  onCancel: () => void;
  onApply: () => void;
}

export default function FilterModalFooter({
  onCancel,
  onApply,
}: FilterModalFooterProps) {
  return (
    <div className="border-t border-[var(--color-stroke-neutral)] flex items-center justify-between px-6 py-3">
      <Button
        variant="neutral"
        appearance="ghost"
        onClick={onCancel}
        className="flex items-center justify-center gap-3 h-10 min-w-16 px-4 py-2 rounded-lg font-medium text-base leading-5  uppercase hover:underline"
      >
        CANCEL
      </Button>
      <Button
        variant="primary"
        appearance="outlined"
        state="press"
        onClick={onApply}
        className="flex items-center justify-center gap-3 h-10 min-w-16 px-4 py-2 rounded-lg border border-[var(--color-brand-default)] bg-white font-medium text-base leading-5 text-[var(--color-brand-default)] uppercase"
      >
        <Image
          src="/Employee/Multiselect/check.svg"
          alt="Check"
          width={20}
          height={20}
        />
        <span>FILTER BOXES</span>
      </Button>
    </div>
  );
}
