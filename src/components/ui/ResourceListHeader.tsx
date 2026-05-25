import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/data-table-cells";

interface ResourceListHeaderProps {
  title: string;
  onAddNew: () => void;
  onViewSuspended?: () => void;
  /** Applied to the title (e.g. for text size) */
  titleClassName?: string;
}

export default function ResourceListHeader({
  title,
  onAddNew,
  onViewSuspended,
  titleClassName,
}: ResourceListHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className={cn("text-2xl font-semibold text-[var(--color-neutral-primary)]", titleClassName)}>{title}</h1>
      <div className="flex items-center gap-3">
        {onViewSuspended && (
          <Button
            type="button"
            variant="primary"
            appearance="ghost"
            state="press"
            onClick={onViewSuspended}
           
          >
            <span>VIEW SUSPENDED</span>
          </Button>
        )}
        <Button type="button" variant="primary" appearance="solid" state="press" onClick={onAddNew} className="flex items-center gap-2">
          <PlusIcon className="size-5" />
          <span>ADD NEW</span>
        </Button>
      </div>
    </div>
  );
}

