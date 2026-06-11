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
};
