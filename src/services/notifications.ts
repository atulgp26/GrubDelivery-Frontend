import { makeRequest } from "./request";
import type { Notification, MultiSelectOption, NotificationGroupOption } from "@/types";

export interface NotificationsResponse {
  notifications: Notification[];
  count: number;
  unread_count: number;
}

export interface NotificationDropdownsResponse {
  restaurants: NotificationGroupOption[];
  boxes: MultiSelectOption[];
  types: { id: string; label: string }[];
}

export interface NotificationCountResponse {
  count: number;
}

export const notificationsService = {
  getNotifications: () =>
    makeRequest<NotificationsResponse>({
      method: "GET",
      url: "/delivery/notification",
    }),

  getNotificationDropdowns: () =>
    makeRequest<NotificationDropdownsResponse>({
      method: "GET",
      url: "/delivery/notification/dropdowns",
    }),

  markAsRead: (ids: string[]) =>
    makeRequest({
      method: "PATCH",
      url: "/delivery/notification",
   data: { ids, is_read: true },
    }),

  getUnreadCount: () =>
    makeRequest<NotificationCountResponse>({
      method: "GET",
      url: "/delivery/notification/count",
    }),

  dismissNotification: (id: string) =>
    makeRequest({
      method: "PATCH",
      url: `/delivery/notification/${id}/dismiss`,
    }),

  dismissAllNotifications: () =>
    makeRequest({
      method: "PATCH",
      url: "/delivery/notification/dismiss-all",
    }),
};