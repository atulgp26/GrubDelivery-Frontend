"use client";
import Icon from "@/components/ui/Icon";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PiWarningFill } from "react-icons/pi";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/skeleton";
import type { HeaderProps, HeaderNotificationItem, NotificationItem } from "@/types";

const mockNotifications: HeaderNotificationItem[] = [
  {
    type: "warning",
    title: "Battery below 20%",
    message:
      "The battery for [Box name] [Box ID] seems to be draining. Charge the device before you head outdoor.",
    time: "12:15 PM",
    date: "Today",
    code: "#DL12345",
    deviceId: "DL2BD1234",
    place: "da Pizza Place",
    active: true,
  },
  {
    type: "error",
    title: "Camera not working",
    message:
      "It seems the camera for [Box name] [Box ID] is not functioning properly. Try restarting the device once.",
    time: "12:15 PM",
    date: "Today",
    code: "#DL12345",
    deviceId: "DL2BD1234",
    place: "da Pizza Place",
    active: true,
  },
  {
    type: "success",
    title: "Locked opened.",
    message:
      "You successfully opened the Grublock for [Box name] [Box ID].",
    time: "12:15 PM",
    date: "Today",
    code: "#DL12345",
    deviceId: "DL2BD1234",
    place: "da Pizza Place",
    active: false,
  },
];

export default function Header({
  onToggleSidebarAction,
  collapsed,
  notifications: notificationsProp,
  onDismissNotification,
  isLoading: isLoadingProp,
}: HeaderProps) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isNotificationPage = pathname === "/notifications";

  // 1500ms Delay for testing on skeletons
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  useEffect(() => {
    if (showDropdown) {
      setNotificationsLoading(true);
      const timer = setTimeout(() => setNotificationsLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showDropdown]);

  const isLoading = isLoadingProp ?? notificationsLoading;

  const notifications = notificationsProp ?? mockNotifications;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown automatically when navigating to /notifications
  useEffect(() => {
    if (pathname === "/notifications") {
      setShowDropdown(false);
    }
  }, [pathname]);

  return (
    <header className="flex h-[var(--gp-topnav-height)] items-center justify-between bg-[var(--gp-color-bg-white)] border-b border-[var(--gp-color-border-neutral)] px-[var(--gp-padding-xl)] py-[var(--gp-padding-m)]">
      {/* Left side — Collapse / Expand button */}
      <div className="flex items-center gap-[var(--gp-space-s)]">
        <Button
          variant="neutral"
          appearance="ghost"
          size="sm"
          onClick={onToggleSidebarAction}
          className="flex items-center gap-[var(--gp-space-s)]"
        >
          <img src="/menu.svg" alt="menu" className="size-[var(--gp-icon-size)]" />
          <span className="text-[14px] font-[var(--gp-font-weight-interactive)] leading-[var(--gp-button-line-height-md)]">
            {collapsed ? "EXPAND" : "COLLAPSE"}
          </span>
        </Button>
      </div>

      {/* Right side - Notification bell */}
      <div className="flex items-center relative">
        <Button
          ref={buttonRef}
          variant="neutral"
          appearance="outlined"
          size="sm"
          className={`flex items-center justify-center h-10 w-10 rounded-[var(--gp-radius-md)] !hover:bg-transparent !active:bg-transparent border transition-all ${
            isNotificationPage || showDropdown
              ? "border-[var(--gp-color-text-brand-active)] bg-[var(--sidebar-active-bg)] shadow-[0_0_0_2px_var(--color-notification-outline)]"
              : "border-[#909A95]"
          }`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <img
            src={isNotificationPage || showDropdown ? "/bell-color.svg" : "/bell.svg"}
            alt="notifications"
            className="w-5 h-5 min-w-5 min-h-5 shrink-0"
            style={isNotificationPage || showDropdown ? undefined : { filter: "brightness(0) saturate(100%) opacity(0.5)" }}
          />
        </Button>
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 h-[620px] bg-[var(--gp-color-bg-white)] rounded-lg border border-[var(--gp-color-border-neutral)] outline outline-1 outline-offset-[-1px] outline-[var(--gp-color-border-neutral)] shadow-[4px_4px_8px_0px_rgba(0,0,0,0.12)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10)] flex flex-col overflow-hidden z-50 transition-all duration-200"
          >
            <div className="self-stretch px-6 py-3 flex flex-col justify-center items-end gap-4 shrink-0">
              <Button variant="neutral" appearance="ghost" state="default" className="min-w-[75px] h-5 text-[16px] leading-5 font-medium" asChild>
                <Link href="/notifications" className="flex items-center justify-center gap-2 hover:no-underline">
                  VIEW ALL
                  <Image src="/Dashboard/arrow-up-right.svg" alt="arrow" width={16} height={16} className="inline-block shrink-0" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain">
              {isLoading
                ? 
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="self-stretch p-6 bg-[var(--gp-color-bg-white)] border-t border-[var(--gp-color-border-neutral)] flex flex-col justify-center items-start gap-3 shrink-0"
                    >
                      {/* Icon + Title row */}
                      <div className="self-stretch flex justify-start items-end gap-3">
                        <Skeleton variant="circle" width={32} height={32} />
                        <Skeleton variant="text" width="60%" height={16} />
                      </div>
                      {/* Message lines */}
                      <div className="self-stretch flex flex-col gap-1.5">
                        <Skeleton variant="text" width="100%" height={14} />
                        <Skeleton variant="text" width="85%" height={14} />
                      </div>
                      {/* Meta row */}
                      <div className="self-stretch flex justify-between items-start gap-2">
                        <Skeleton variant="text" width="45%" height={14} />
                        <Skeleton variant="text" width="25%" height={14} />
                        <Skeleton variant="text" width={50} height={14} />
                      </div>
                    </div>
                  ))
                : notifications.map((n, i) => {
                    const isActive = n.active ?? (i < 2);
                    const titleColor = isActive ? "var(--gp-color-text-neutral-secondary)" : "var(--gp-color-text-neutral-tertiary)";
                    const messageColor = isActive ? "var(--gp-color-text-neutral-secondary)" : "var(--gp-color-text-neutral-tertiary)";
                    const metaColor = "var(--gp-color-text-neutral-tertiary)";
                    const deviceId = n.deviceId ?? "DL2BD1234";
                    const deviceIdDisplay = deviceId.length > 8 ? deviceId.slice(0, 8) + "..." : deviceId;
                    return (
                      <div
                        key={n.id ?? i}
                        className="self-stretch p-6 bg-[var(--gp-color-bg-white)] border-t border-[var(--gp-color-border-neutral)] flex flex-col justify-center items-start gap-3 shrink-0"
                      >
                        <div className="self-stretch flex justify-start items-end gap-3">
                          <span className="inline-flex items-center justify-center size-8 shrink-0">
                            {n.type === "warning" && (
                              <PiWarningFill className="size-7" style={{ color: "var(--notif-warning)" }} />
                            )}
                            {n.type === "error" && (
                              <PiWarningFill className="size-7" style={{ color: "var(--notif-error)" }} />
                            )}
                            {n.type === "success" && (
                              <img src="/Dashboard/Card/check_circle.svg" alt="success" className="size-7" />
                            )}
                            {n.type === "yellow_warning" && (
                              <Icon name="icon_alert" className="size-7" style={{ color: "var(--notif-warning)" }} />
                            )}
                          </span>
                          <div
                            className="text-base font-semibold leading-6 truncate min-w-0"
                            style={{ color: titleColor }}
                          >
                            {n.title}
                          </div>
                        </div>
                        <div
                          className="self-stretch text-sm font-normal leading-5"
                          style={{ color: messageColor }}
                        >
                          {n.message}
                        </div>
                        <div className="self-stretch flex justify-between items-start gap-2">
                          <div
                            className="flex-1 flex items-center gap-1 min-w-0 text-sm font-normal leading-5"
                            style={{ color: metaColor }}
                          >
                            <span className="shrink-0">{n.code} |</span>
                            <span className="shrink-0">{deviceIdDisplay}</span>
                            <span className="min-w-0 truncate">| {n.place ?? "da Pizza Place"}</span>
                          </div>
                          <div
                            className="text-right text-sm font-normal leading-5 shrink-0"
                            style={{ color: metaColor }}
                          >
                            {n.time} | {n.date}
                          </div>
                          <button
                            type="button"
                            className="text-[var(--gp-color-text-brand)] text-sm font-medium uppercase leading-4 shrink-0 hover:underline"
                            onClick={() => n.id != null && onDismissNotification?.(n.id)}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
