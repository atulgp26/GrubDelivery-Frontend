import httpClient from "./httpClient";
import { makeRequest } from "./request";
import type {
  Notification,
  MultiSelectOption,
  NotificationGroupOption,
  NotificationFilterType,
  NotificationStatus,
} from "@/types";
import {
  DEFAULT_NOTIFICATION_STATUSES,
  DEFAULT_NOTIFICATION_TYPES,
} from "@/components/features/notifications/constants";

export const NOTIFICATION_PAGE_SIZE = 50;

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

export interface NotificationListParams {
  page?: number;
  limit?: number;
  search?: string;
  box_ids?: string[];
  restaurant_ids?: string[];
  types?: string[];
  is_read?: boolean;
}

export interface NotificationPaginationMeta {
  page?: number;
  limit?: number;
  total_count?: number;
  last_page?: number;
  next_page?: number | null;
  prev_page?: number | null;
}

/** Omit id arrays when nothing is selected or every dropdown option is selected. */
export function idsIfPartialSelection(
  selected: Array<string | number>,
  allOptions: Array<{ id: string | number }>,
): string[] | undefined {
  if (!Array.isArray(selected) || selected.length === 0) return undefined;
  if (
    Array.isArray(allOptions) &&
    allOptions.length > 0 &&
    selected.length >= allOptions.length
  ) {
    return undefined;
  }
  return selected.map((id) => String(id));
}

export function mapFilterTypesToApi(
  selectedTypes: NotificationFilterType[],
): string[] | undefined {
  const allDefaultsSelected = DEFAULT_NOTIFICATION_TYPES.every((type) =>
    selectedTypes.includes(type),
  );
  if (allDefaultsSelected || selectedTypes.length === 0) return undefined;

  const apiTypes: string[] = [];
  if (selectedTypes.includes("severe")) apiTypes.push("error");
  if (selectedTypes.includes("success")) {
    apiTypes.push("success", "notification");
  }
  if (selectedTypes.includes("warning")) apiTypes.push("warning");
  return apiTypes.length > 0 ? apiTypes : undefined;
}

export function mapStatusToIsRead(
  selectedStatuses: NotificationStatus[],
): boolean | undefined {
  if (
    selectedStatuses.includes("read") &&
    !selectedStatuses.includes("unread")
  ) {
    return true;
  }
  if (
    !selectedStatuses.includes("read") &&
    selectedStatuses.includes("unread")
  ) {
    return false;
  }
  return undefined;
}

export function buildNotificationListParams(input: {
  page: number;
  search?: string;
  selectedBoxes?: Array<string | number>;
  selectedRestaurants?: Array<string | number>;
  selectedTypes?: NotificationFilterType[];
  selectedStatuses?: NotificationStatus[];
  boxes?: MultiSelectOption[];
  restaurants?: NotificationGroupOption[];
}): NotificationListParams {
  const {
    page,
    search,
    selectedBoxes = [],
    selectedRestaurants = [],
    selectedTypes = DEFAULT_NOTIFICATION_TYPES,
    selectedStatuses = DEFAULT_NOTIFICATION_STATUSES,
    boxes = [],
    restaurants = [],
  } = input;

  const trimmedSearch = typeof search === "string" ? search.trim() : "";

  return {
    page,
    limit: NOTIFICATION_PAGE_SIZE,
    search: trimmedSearch || undefined,
    box_ids: idsIfPartialSelection(selectedBoxes, boxes),
    restaurant_ids: idsIfPartialSelection(selectedRestaurants, restaurants),
    types: mapFilterTypesToApi(selectedTypes),
    is_read: mapStatusToIsRead(selectedStatuses),
  };
}

export const notificationsService = {
  getNotifications: (params?: NotificationListParams) =>
    httpClient.get<NotificationsResponse>(
      "/delivery/notification",
      params as Record<string, unknown> | undefined,
    ),

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

  markAsDismissed: (ids: string[]) =>
    makeRequest({
      method: "PATCH",
      url: "/delivery/notification",
      data: { ids, is_dismissed: true },
    }),

  dismissAllNotifications: (ids: string[]) =>
    makeRequest({
      method: "PATCH",
      url: "/delivery/notification",
      data: {
        ids,
        is_dismissed: true,
      },
    }),

  getUnreadCount: () =>
    makeRequest<NotificationCountResponse>({
      method: "GET",
      url: "/delivery/notification/count",
    }),
};
