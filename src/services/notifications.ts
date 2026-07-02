import httpClient from "./httpClient";
import type { Notification, HeaderNotificationItem, NotificationTone, NotificationType } from "@/types";

export interface ApiNotification {
  id: number;
  type?: string;
  tone?: string;
  title?: string;
  message?: string;
  code?: string;
  time?: string;
  date?: string;
  created_at?: string;
  box_id?: number;
  boxId?: number;
  device_id?: string;
  deviceId?: string;
  category?: string;
  status?: "read" | "unread";
  restaurant_id?: number | string;
  restaurantId?: number | string;
  place?: string;
  restaurant_name?: string;
  restaurantName?: string;
  active?: boolean;
  is_active?: boolean;
}

export interface NotificationsResponse {
  notifications: ApiNotification[];
  count: number;
  unread_count: number;
}

export function mapApiNotificationToHeaderItem(n: ApiNotification): HeaderNotificationItem {
  let type: NotificationType = "warning";
  const apiType = (n.type || n.tone || "").toLowerCase();
  if (apiType === "error" || apiType === "danger") {
    type = "error";
  } else if (apiType === "success") {
    type = "success";
  } else if (apiType === "info" || apiType === "yellow_warning") {
    type = "yellow_warning";
  } else if (apiType === "warning") {
    type = "warning";
  }

  const time = n.time || (n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "12:00 PM");
  const date = n.date || (n.created_at ? new Date(n.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Today");

  return {
    id: n.id,
    type,
    title: n.title || "Notification",
    message: n.message || "",
    time,
    date,
    code: n.code || "",
    deviceId: n.deviceId || n.device_id || "",
    place: n.place || n.restaurant_name || n.restaurantName || "da Pizza Place",
    active: n.active ?? n.is_active ?? (n.status === "unread"),
  };
}

export function mapApiNotificationToNotification(n: ApiNotification): Notification {
  let type: NotificationTone = "warning";
  const apiType = (n.type || n.tone || "").toLowerCase();
  if (apiType === "error") {
    type = "error";
  } else if (apiType === "danger") {
    type = "danger";
  } else if (apiType === "success") {
    type = "success";
  } else if (apiType === "info") {
    type = "info";
  } else if (apiType === "warning") {
    type = "warning";
  }

  const time = n.time || (n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "12:00 PM");
  const date = n.date || (n.created_at ? new Date(n.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Today");

  return {
    id: n.id,
    type,
    title: n.title || "Notification",
    message: n.message || "",
    code: n.code || "",
    time,
    date,
    boxId: n.boxId || n.box_id || 0,
    category: n.category || "General",
    status: n.status || "unread",
    restaurantId: n.restaurantId || n.restaurant_id,
  };
}

export const notificationsService = {
  getNotifications: async () => {
    return httpClient.get<NotificationsResponse>("/delivery/notification");
  },
};
