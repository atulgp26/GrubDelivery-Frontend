import { Button } from "@/components/ui/Button";

interface GrubLockListHeaderProps {
  onViewAllBoxes?: () => void;
}

export default function GrubLockListHeader({
  onViewAllBoxes,
}: GrubLockListHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
        GrubLock
      </h1>
      {onViewAllBoxes && (
        <Button
          variant="primary"
          appearance="ghost"
          onClick={onViewAllBoxes}
          className="!text-base hover:underline"
        >
          VIEW ALL BOXES
        </Button>
      )}
    </div>
  );
}

