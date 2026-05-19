import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { LuPencilLine, LuShieldCheck } from "react-icons/lu";
import { RxCrossCircled } from "react-icons/rx";
import { FiTrash2 } from "react-icons/fi";
import type { GrubPacItem } from "@/components/features/grubpacs/hooks/useGrubPacsListState";

interface TableRowActionsMenuProps {
  item: GrubPacItem;
  menuOpen: string | number | null;
  menuRefs: React.MutableRefObject<Record<string | number, HTMLDivElement | null>>;
  onEdit: (item: GrubPacItem) => void;
  onCheckPermissions?: () => void;
  onViewSettings?: () => void;
  onSuspend?: (item: GrubPacItem) => void;
  onRemove?: () => void;
  onClose: () => void;
}

export default function TableRowActionsMenu({
  item,
  menuOpen,
  menuRefs,
  onEdit,
  onCheckPermissions,
  onViewSettings,
  onSuspend,
  onRemove,
  onClose,
}: TableRowActionsMenuProps) {
  if (menuOpen !== item.id) return null;

  return (
    <div
      ref={(el) => {
        if (el) menuRefs.current[item.id] = el;
      }}
      className="absolute right-0 top-2 w-52 bg-white border border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] rounded-lg shadow-[4px_4px_8px_0_var(--action-menu-shadow),0px_0px_4px_0_var(--action-menu-shadow-soft)] z-[999]"
    >
      <Button
        variant="neutral"
        appearance="ghost"
        className="flex items-center justify-start w-full px-4 py-2 text-sm text-[var(--color-stroke-brand)] hover:bg-gray-50"
        onClick={() => {
          onEdit(item);
          onClose();
        }}
      >
        <LuPencilLine className="mr-3 w-5 h-5 text-[var(--color-neutral-light)] flex-shrink-0" />
        <span>Edit box details</span>
      </Button>
      {onCheckPermissions && (
        <Button
          variant="neutral"
          appearance="ghost"
          className="flex items-center justify-start w-full px-4 py-2 text-sm text-[var(--color-stroke-brand)] hover:bg-gray-50"
          onClick={() => {
            onCheckPermissions();
            onClose();
          }}
        >
          <LuShieldCheck className="mr-3 w-5 h-5 text-[var(--color-neutral-light)] flex-shrink-0" />
          <span>Check permissions</span>
        </Button>
      )}
      {onViewSettings && (
        <Button
          variant="neutral"
          appearance="ghost"
          className="flex items-center justify-start w-full px-4 py-2 text-sm text-[var(--color-stroke-brand)] hover:bg-gray-50"
          onClick={() => {
            onViewSettings();
            onClose();
          }}
        >
          <Icon name="note" className="mr-3 w-5 h-5 text-[var(--color-neutral-light)] flex-shrink-0" />
          <span>View settings</span>
        </Button>
      )}
      {onSuspend && (
        <Button
          variant="neutral"
          appearance="ghost"
          className="flex items-center justify-start w-full px-4 py-2 text-sm text-[var(--color-stroke-brand)] hover:bg-gray-50"
          onClick={() => {
            onSuspend(item);
            onClose();
          }}
        >
          <RxCrossCircled className="mr-3 w-5 h-5 text-[var(--color-neutral-light)] flex-shrink-0" />
          <span>Suspend box</span>
        </Button>
      )}
      {onRemove && (
        <Button
          variant="neutral"
          appearance="ghost"
          className="flex items-center justify-start w-full px-4 py-2 text-sm text-[var(--color-stroke-brand)] hover:bg-gray-50"
          onClick={() => {
            onRemove();
            onClose();
          }}
        >
          <FiTrash2 className="mr-3 w-5 h-5 text-[var(--color-neutral-light)] flex-shrink-0" />
          <span>Remove box</span>
        </Button>
      )}
    </div>
  );
}

