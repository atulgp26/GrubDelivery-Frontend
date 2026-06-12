import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/lib/hooks";
import type { Dispatch, SetStateAction } from "react";
import type {
  MultiSelectOption,
  Notification,
  NotificationFilterType,
  NotificationGroupOption,
  NotificationStatus,
  NotificationSuggestion,
  NotificationTone,
} from "@/types";
import {
  DEFAULT_NOTIFICATION_STATUSES,
  DEFAULT_NOTIFICATION_TYPES,
  TYPE_TO_TONES,
} from "../constants";

type MultiSelectId = MultiSelectOption["id"];

const TYPE_TONE_ORDER: NotificationTone[] = ["error", "danger", "warning", "success", "info"];

const deriveAllowedTones = (types: NotificationFilterType[]): Set<NotificationTone> => {
  const tones = types.flatMap((type) => TYPE_TO_TONES[type] ?? []);
  return new Set<NotificationTone>(tones.length ? tones : TYPE_TONE_ORDER);
};

interface UseNotificationFiltersOptions {
  notifications: Notification[];
  boxes?: MultiSelectOption[];
  restaurants?: NotificationGroupOption[];
  defaultTypes?: NotificationFilterType[];
  defaultStatuses?: NotificationStatus[];
}

interface UseNotificationFiltersResult {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  selectedNotificationIds: Array<Notification["id"]>;
  setSelectedNotificationIds: Dispatch<SetStateAction<Array<Notification["id"]>>>;
  selectedBoxes: MultiSelectId[];
  setSelectedBoxes: Dispatch<SetStateAction<MultiSelectId[]>>;
  selectedRestaurants: Array<NotificationGroupOption["id"]>;
  setSelectedRestaurants: Dispatch<SetStateAction<Array<NotificationGroupOption["id"]>>>;
  selectedTypes: NotificationFilterType[];
  setSelectedTypes: Dispatch<SetStateAction<NotificationFilterType[]>>;
  selectedStatuses: NotificationStatus[];
  setSelectedStatuses: Dispatch<SetStateAction<NotificationStatus[]>>;
  filteredNotifications: Notification[];
  notificationSuggestions: NotificationSuggestion[];
  boxOptions: MultiSelectOption[];
  restaurantOptions: NotificationGroupOption[];
}

export function useNotificationFilters({
  notifications,
  boxes = [],
  restaurants = [],
  defaultTypes = DEFAULT_NOTIFICATION_TYPES,
  defaultStatuses = DEFAULT_NOTIFICATION_STATUSES,
}: UseNotificationFiltersOptions): UseNotificationFiltersResult {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<Array<Notification["id"]>>([]);
  const [selectedBoxes, setSelectedBoxes] = useState<MultiSelectId[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<Array<NotificationGroupOption["id"]>>([]);
  const [selectedTypes, setSelectedTypes] = useState<NotificationFilterType[]>(defaultTypes);
  const [selectedStatuses, setSelectedStatuses] = useState<NotificationStatus[]>(defaultStatuses);

  const allowedTones = useMemo(() => deriveAllowedTones(selectedTypes), [selectedTypes]);
  const activeStatusSet = useMemo(() => new Set(selectedStatuses), [selectedStatuses]);

const filteredNotifications = useMemo(() => {
  const searchTerm = debouncedSearch.trim().toLowerCase();
  const hasBoxFilters = selectedBoxes.length > 0;
  const hasRestaurantFilters = selectedRestaurants.length > 0;
  const shouldFilterByStatus = activeStatusSet.size > 0 && activeStatusSet.size < 2;

  return notifications.filter((notification) => {
    if (!allowedTones.has(notification.type)) return false;

    if (searchTerm.length > 0) {
      const titleMatch = notification.title.toLowerCase().includes(searchTerm);
      const descMatch = notification.description.toLowerCase().includes(searchTerm); // was .message
      if (!titleMatch && !descMatch) return false;
    }

    if (hasBoxFilters && !selectedBoxes.includes(notification.box_id ?? "")) { // was .boxId
      return false;
    }

    // restaurant_name filter — API has no restaurantId, filter by name if needed
    if (hasRestaurantFilters) {
      if (
        !notification.restaurant_name ||
        !selectedRestaurants.includes(notification.restaurant_name)
      ) {
        return false;
      }
    }

    if (shouldFilterByStatus) {
      const status: NotificationStatus = notification.is_read ? "read" : "unread"; // was .status
      if (!activeStatusSet.has(status)) return false;
    }

    return true;
  });
}, [notifications, allowedTones, debouncedSearch, selectedBoxes, selectedRestaurants, activeStatusSet]);

const notificationSuggestions = useMemo<NotificationSuggestion[]>(() => {
  if (!debouncedSearch.trim()) return [];
  const lowered = debouncedSearch.trim().toLowerCase();

  return notifications
    .filter((n) => n.title.toLowerCase().includes(lowered))
    .map(({ id, title }) => ({ id, title })); // removed "category" — doesn't exist
}, [notifications, debouncedSearch]);

  // const notificationSuggestions = useMemo<NotificationSuggestion[]>(() => {
  //   if (!debouncedSearch.trim()) return [];
  //   const lowered = debouncedSearch.trim().toLowerCase();

  //   return notifications
  //     .filter((notification) => notification.title.toLowerCase().includes(lowered))
  //     .map(({ id, title, category }) => ({ id, title, category }));
  // }, [notifications, debouncedSearch]);

  useEffect(() => {
    setSelectedNotificationIds((prev) =>
      prev.filter((id) => filteredNotifications.some((notification) => notification.id === id))
    );
  }, [filteredNotifications]);

  return {
    search,
    setSearch,
    selectedNotificationIds,
    setSelectedNotificationIds,
    selectedBoxes,
    setSelectedBoxes,
    selectedRestaurants,
    setSelectedRestaurants,
    selectedTypes,
    setSelectedTypes,
    selectedStatuses,
    setSelectedStatuses,
    filteredNotifications,
    notificationSuggestions,
    boxOptions: boxes,
    restaurantOptions: restaurants,
  };
}

