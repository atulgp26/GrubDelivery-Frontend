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
    id: 1,
    type: "warning",
    title: "Battery below 20%",
    message:
      "The battery for Grubbox 123 (#1234gdcs) at Da Pizza Place is low. Charge it before dispatching another order.",
    code: "#BX-123",
    time: "12:15 PM",
    date: "Today",
    boxId: 1,
    category: "Battery",
    status: "unread",
    restaurantId: 1,
  },
  {
    id: 2,
    type: "error",
    title: "Camera not working",
    message:
      "Pizza Joint’s Grubbox 456 (#4567pqrs) camera is offline. Restart the device or schedule a maintenance check.",
    code: "#BX-456",
    time: "12:15 PM",
    date: "Today",
    boxId: 4,
    category: "Hardware",
    status: "unread",
    restaurantId: 2,
  },
  {
    id: 3,
    type: "success",
    title: "Locked opened.",
    message:
      "You successfully opened the Grublock for Vegan Garden’s Grubbox 345 (#3456lmno).",
    code: "#BX-345",
    time: "12:15 PM",
    date: "Today",
    boxId: 3,
    category: "Access",
    status: "read",
    restaurantId: 3,
  },
  {
    id: 4,
    type: "warning",
    title: "Battery below 20%",
    message:
      "Taco Fiesta’s Grubbox 234 (#2345hjkq) battery is draining fast. Please connect it to a charger soon.",
    code: "#BX-234",
    time: "12:15 PM",
    date: "Today",
    boxId: 2,
    category: "Battery",
    status: "unread",
    restaurantId: 5,
  },
  {
    id: 5,
    type: "info",
    title: "Software update available",
    message:
      "A firmware update is available for Burger Yard’s Grubbox 567 (#5678tuvw). Schedule downtime to apply it.",
    code: "#BX-567",
    time: "11:05 AM",
    date: "Today",
    boxId: 5,
    category: "Maintenance",
    status: "unread",
    restaurantId: 4,
  },
];

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

