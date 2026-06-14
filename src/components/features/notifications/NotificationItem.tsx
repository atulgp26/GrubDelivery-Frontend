import type { ChangeEvent, ReactNode } from "react";
import TableCheckbox from "@/components/ui/TableCheckbox";
import type { Notification, NotificationTone } from "@/types";
import { formatDate } from "@/lib/utils/date";

interface NotificationItemProps {
  notification: Notification;
  selected: boolean;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onDismiss: (notificationId: Notification["id"]) => void;
  getNotificationIcon: (type: NotificationTone) => ReactNode;
  isLast: boolean;
  tone?: "default" | "neutral";
}

export default function NotificationItem({
  notification,
  selected,
  onSelect,
  onDismiss,
  getNotificationIcon,
  isLast,
  tone = "default",
}: NotificationItemProps) {
  const createdAt = new Date(notification.created_at);
  const time = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = formatDate(notification.created_at);

  return (
    <div className="flex w-full items-center bg-white hover:bg-[var(--color-neutral-secondary-bg)]">
      <div className="px-[16px] py-[12px] self-start">
        <TableCheckbox checked={selected} onChange={onSelect} tone={tone} />
      </div>
      <div className="flex-1 flex flex-col gap-[12px] px-[16px] py-[16px] min-w-0">
        <div className="flex gap-[12px] items-end w-full">
          <div className="shrink-0 w-[24px] h-[24px]">
            {getNotificationIcon(notification.type)}
          </div>
          <p className="text-[16px] font-semibold leading-[24px] text-[#37493f]">
            {notification.title}
          </p>
        </div>
        <p className="text-[14px] font-normal leading-[22px] text-[#37493f] w-full">
          {notification.description}
        </p>
        <div className="flex items-center justify-between w-full">
          <p className="text-[14px] font-normal leading-[22px] text-[#6b7971]">
            {time} | {date}
          </p>
          <button
            type="button"
            className="text-[14px] font-medium leading-[16px] text-[#fe480b] uppercase cursor-pointer p-[2px] rounded-[4px] hover:underline hover:underline-offset-2"
            onClick={() => onDismiss(notification.id)}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}