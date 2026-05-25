import type { ReactNode, ReactElement } from "react";

export type NavItemId =
  | "DASHBOARD"
  | "RESTAURANTS"
  | "GRUBPACS"
  | "GRUBLOCK"
  | "EMPLOYEES"
  | "SYSTEM LOGS"
  | "HELP";

export interface NavItemConfig {
  id: NavItemId;
  label: string;
  icon: string;
  href: string;
  disabled?: boolean;
  activeIconSrc?: string;
}

export type NotificationType =
  | "warning"
  | "error"
  | "success"
  | "yellow_warning";

export interface NotificationItem {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  date: string;
  code?: string;
}

export interface ClientLayoutProps {
  children: ReactNode;
}

export interface HeaderNotificationItem extends NotificationItem {
  id?: number;
  deviceId?: string;
  place?: string;
  active?: boolean;
}

export interface HeaderProps {
  onToggleSidebarAction: () => void;
  collapsed: boolean;
  /**Replace mock data here with api data */
  notifications?: HeaderNotificationItem[];
  /** Called when user dismisses a notification (only used when notifications from API) */
  onDismissNotification?: (id: number) => void;
  /** Whether header data is still loading */
  isLoading?: boolean;
}

export interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  disabled?: boolean;
  activeIconSrc?: string;
}

export interface ProfileMenuItem {
  label: string;
  icon: ReactElement;
  highlight?: boolean;
}

export interface ProfileData {
  name?: string;
  initials?: string;
}

export interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
}

