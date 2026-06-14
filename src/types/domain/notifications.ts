export type NotificationTone = "warning" | "error" | "success" | "info" | "danger" | "notification";

export type NotificationStatus = "read" | "unread";

export type NotificationFilterType = "severe" | "success" | "warning";

export interface Notification {
  id: string;                          // ULID string from API
  client_id: string;
  box_id: string | null;
  box_display_id: string | null;
  box_name: string | null;
  restaurant_name: string | null;
  type: NotificationTone;
  title: string;
  description: string;                 // was "message" — API field is "description"
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;                  // ISO date string
  updated_at: string;
}

export interface NotificationSuggestion {
  id: string;                          // was number
  title: string;
  // removed "category" — doesn't exist in API
}

export interface NotificationGroupOption {
  id: string;                          // standardise to string
  label: string;
}
