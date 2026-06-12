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

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    client_id: "client1",
    box_id: "123",
    box_display_id: "#1234gdcs",
    box_name: "Grubbox 123",
    restaurant_name: "Da Pizza Place",
    type: "warning",
    title: "Battery below 20%",
    description:
      "The battery for Grubbox 123 (#1234gdcs) at Da Pizza Place is low. Charge it before dispatching another order.",
    is_read: false,
    is_dismissed: false,
    created_at: "2026-06-12T10:00:00Z",
    updated_at: "2026-06-12T10:00:00Z",
  },
  {
    id: "2",
    client_id: "client1",
    box_id: "456",
    box_display_id: "#4567pqrs",
    box_name: "Grubbox 456",
    restaurant_name: "Pizza Joint",
    type: "error",
    title: "Camera not working",
    description:
      "Pizza Joint's Grubbox 456 (#4567pqrs) camera is offline. Restart the device or schedule a maintenance check.",
    is_read: false,
    is_dismissed: false,
    created_at: "2026-06-12T10:00:00Z",
    updated_at: "2026-06-12T10:00:00Z",
  },
  {
    id: "3",
    client_id: "client1",
    box_id: "345",
    box_display_id: "#3456lmno",
    box_name: "Grubbox 345",
    restaurant_name: "Vegan Garden",
    type: "success",
    title: "Locked opened.",
    description:
      "You successfully opened the Grublock for Vegan Garden's Grubbox 345 (#3456lmno).",
    is_read: true,
    is_dismissed: false,
    created_at: "2026-06-12T09:00:00Z",
    updated_at: "2026-06-12T09:00:00Z",
  },
  {
    id: "4",
    client_id: "client1",
    box_id: "234",
    box_display_id: "#2345hjkq",
    box_name: "Grubbox 234",
    restaurant_name: "Taco Fiesta",
    type: "warning",
    title: "Battery below 20%",
    description:
      "Taco Fiesta's Grubbox 234 (#2345hjkq) battery is draining fast. Please connect it to a charger soon.",
    is_read: false,
    is_dismissed: false,
    created_at: "2026-06-12T08:00:00Z",
    updated_at: "2026-06-12T08:00:00Z",
  },
  {
    id: "5",
    client_id: "client1",
    box_id: "567",
    box_display_id: "#5678tuvw",
    box_name: "Grubbox 567",
    restaurant_name: "Burger Yard",
    type: "info",
    title: "Software update available",
    description:
      "A firmware update is available for Burger Yard's Grubbox 567 (#5678tuvw). Schedule downtime to apply it.",
    is_read: false,
    is_dismissed: false,
    created_at: "2026-06-12T07:00:00Z",
    updated_at: "2026-06-12T07:00:00Z",
  },
];

export const MOCK_BOXES: MultiSelectOption[] = [
  { id: "1", label: "BOX - 123", code: "(#1234gdcs)" },
  { id: "2", label: "BOX - 234", code: "(#2345hjkq)" },
  { id: "3", label: "BOX - 345", code: "(#3456lmno)" },
  { id: "4", label: "BOX - 456", code: "(#4567pqrs)" },
  { id: "5", label: "BOX - 567", code: "(#5678tuvw)" },
];

export const MOCK_RESTAURANTS: NotificationGroupOption[] = [
  { id: "1", label: "Da Pizza Place" },
  { id: "2", label: "Pizza Joint" },
  { id: "3", label: "Vegan Garden" },
  { id: "4", label: "Burger Yard" },
  { id: "5", label: "Taco Fiesta" },
  { id: "6", label: "Sushi Central" },
];
