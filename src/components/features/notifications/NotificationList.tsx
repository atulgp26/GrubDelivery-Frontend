import type { Dispatch, SetStateAction, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { RxCross2 } from "react-icons/rx";
import Icon from "@/components/ui/Icon";
import TableCheckbox from "@/components/ui/TableCheckbox";
import NotificationItem from "./NotificationItem";
import type { Notification, NotificationTone } from "@/types";

interface NotificationListProps {
  filtered: Notification[];
  selected: Array<Notification["id"]>;
  setSelected: Dispatch<SetStateAction<Array<Notification["id"]>>>;
  getNotificationIcon: (type: NotificationTone) => ReactNode;
  allSelected: boolean;
  onToggleAll: () => void;
  onDismiss: (id: Notification["id"]) => void;
}

export default function NotificationList({
  filtered,
  selected,
  setSelected,
  getNotificationIcon,
  allSelected,
  onToggleAll,
  onDismiss,
}: NotificationListProps) {
  const showMultiSelectBar = selected.length > 0;
  const someSelected = selected.length > 0 && selected.length < filtered.length;

  return (
    <div className="bg-[var(--background\/interactive\/neutral---text-field\/default-\&-filled,white)] w-full rounded-lg overflow-hidden">
      <div className="flex items-center px-[var(--padding\/l,16px)] py-[var(--padding\/m,12px)] border-b border-[var(--stroke\/neutral---secondary,#e0e3e1)]">
        <TableCheckbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={onToggleAll}
          tone="neutral"
        />
        <span className="text-[14px] font-normal leading-[22px] text-[#6b7971] ml-[12px]">
          Notifications
        </span>
      </div>
      <div className="divide-y divide-[var(--stroke\/neutral---secondary,#e0e3e1)] cursor-pointer">
        {filtered.map((notification, idx) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            selected={selected.includes(notification.id)}
            onSelect={(event) =>
              setSelected((sel) =>
                event.target.checked
                  ? [...sel, notification.id]
                  : sel.filter((existingId) => existingId !== notification.id)
              )
            }
            onDismiss={onDismiss}
            getNotificationIcon={getNotificationIcon}
            isLast={idx === filtered.length - 1}
            tone="neutral"
          />
        ))}
      </div>
      {showMultiSelectBar && (
        <div className="fixed bottom-2 left-68 right-4 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] rounded-lg flex items-center justify-between px-6 py-3 z-50 shadow-success-toast">
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-2 text-[var(--primary-gray)] font-medium">
              <Button
                variant="neutral"
                appearance="outlined"
                onClick={() => setSelected([])}
                className="flex gap-2 cursor-pointer bg-white px-4 py-2 rounded-md items-center"
              >
                <RxCross2 style={{ color: "var(--color-stroke-brand)" }} />
                {selected.length} SELECTED
              </Button>
            </div>
          </div>

          <Button
            variant="primary"
            className="flex cursor-pointer gap-4 px-8 py-2 items-center"
            onClick={() => setSelected([])}
          >
            <Icon name="tick_mark" className="text-[var(--color-brand-default)]" />
            MARK ALL AS READ
          </Button>
        </div>
      )}
    </div>
  );
}

