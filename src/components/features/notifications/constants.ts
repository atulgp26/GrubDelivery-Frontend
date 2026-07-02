import type {
  MultiSelectOption,
  Notification,
  NotificationFilterType,
  NotificationGroupOption,
  NotificationStatus,
  NotificationTone,
} from "@/types";

export const DEFAULT_NOTIFICATION_TYPES: NotificationFilterType[] = [
  "severe",
  "success",
  "warning",
];

export const DEFAULT_NOTIFICATION_STATUSES: NotificationStatus[] = ["read", "unread"];

export const TYPE_TO_TONES: Record<NotificationFilterType, NotificationTone[]> = {
  severe: ["error", "danger"],
  success: ["success"],
  warning: ["warning"],
};

export const MOCK_NOTIFICATIONS: Notification[] = [];


export const MOCK_BOXES: MultiSelectOption[] = [
  { id: 1, label: "BOX - 123", code: "(#1234gdcs)" },
  { id: 2, label: "BOX - 234", code: "(#2345hjkq)" },
  { id: 3, label: "BOX - 345", code: "(#3456lmno)" },
  { id: 4, label: "BOX - 456", code: "(#4567pqrs)" },
  { id: 5, label: "BOX - 567", code: "(#5678tuvw)" },
];

export const MOCK_RESTAURANTS: NotificationGroupOption[] = [
  { id: 1, label: "Da Pizza Place" },
  { id: 2, label: "Pizza Joint" },
  { id: 3, label: "Vegan Garden" },
  { id: 4, label: "Burger Yard" },
  { id: 5, label: "Taco Fiesta" },
  { id: 6, label: "Sushi Central" },
];

