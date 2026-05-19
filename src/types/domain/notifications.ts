export type NotificationTone = "warning" | "error" | "success" | "info" | "danger";

export type NotificationStatus = "read" | "unread";

export type NotificationFilterType = "severe" | "success" | "warning";

export interface Notification {
  id: number;
  type: NotificationTone;
  title: string;
  message: string;
  code: string;
  time: string;
  date: string;
  boxId: number;
  category: string;
  status?: NotificationStatus;
  restaurantId?: NotificationGroupOption["id"];
}

export interface NotificationSuggestion {
  id: number;
  title: string;
  category: string;
}

export interface NotificationGroupOption {
  id: number | string;
  label: string;
}

