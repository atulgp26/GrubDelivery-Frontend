import Image from "next/image";
import type { ChangeEvent, ReactNode } from "react";
import TableCheckbox from "@/components/ui/TableCheckbox";
import type { Notification, NotificationTone } from "@/types";

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
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSelect(event);
  };

  return (
    <div className="flex w-full items-center bg-white hover:bg-[var(--color-neutral-secondary-bg)]">
      <div className="px-[16px] py-[12px] self-start">
        <TableCheckbox checked={selected} onChange={handleCheckboxChange} tone={tone} />
      </div>
      <div className="flex-1 flex flex-col gap-[12px] px-[16px] py-[16px] min-w-0">
        <div className="flex gap-[12px] items-end w-full">
          <div className="shrink-0 w-[24px] h-[24px]">
            {isLast ? (
              <Image
                src="/tringle.svg"
                alt="notification read"
                width={24}
                height={24}
                className="w-[24px] h-[24px]"
              />
            ) : (
              getNotificationIcon(notification.type)
            )}
          </div>
          <p className="text-[16px] font-semibold leading-[24px] text-[#37493f]">
            {notification.title}
          </p>
        </div>
        <p className="text-[14px] font-normal leading-[22px] text-[#37493f] w-full">
          {notification.message}
        </p>
        <div className="flex items-center justify-between w-full">
          {!isLast ? (
            <p className="text-[14px] font-normal leading-[22px] text-[#6b7971]">
              {notification.time} | {notification.date}
            </p>
          ) : (
            <div />
          )}
          {!isLast && (
            <button
              type="button"
              className="text-[14px] font-medium leading-[16px] text-[#fe480b] uppercase cursor-pointer p-[2px] rounded-[4px] hover:underline hover:underline-offset-2"
              onClick={() => onDismiss(notification.id)}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

