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
} from "@/types";
import {
  DEFAULT_NOTIFICATION_STATUSES,
  DEFAULT_NOTIFICATION_TYPES,
} from "../constants";
import {
  buildNotificationListParams,
  type NotificationListParams,
} from "@/services/notifications";

type MultiSelectId = MultiSelectOption["id"];

interface UseNotificationFiltersOptions {
  notifications: Notification[];
  boxes?: MultiSelectOption[];
  restaurants?: NotificationGroupOption[];
  page?: number;
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
  listQueryParams: NotificationListParams;
  notificationSuggestions: NotificationSuggestion[];
  boxOptions: MultiSelectOption[];
  restaurantOptions: NotificationGroupOption[];
}

export function useNotificationFilters({
  notifications,
  boxes = [],
  restaurants = [],
  page = 1,
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

  const listQueryParams = useMemo(
    () =>
      buildNotificationListParams({
        page,
        search: debouncedSearch,
        selectedBoxes,
        selectedRestaurants,
        selectedTypes,
        selectedStatuses,
        boxes,
        restaurants,
      }),
    [
      page,
      debouncedSearch,
      selectedBoxes,
      selectedRestaurants,
      selectedTypes,
      selectedStatuses,
      boxes,
      restaurants,
    ],
  );

  const notificationSuggestions = useMemo<NotificationSuggestion[]>(() => {
    if (!debouncedSearch.trim()) return [];
    const lowered = debouncedSearch.trim().toLowerCase();

    return notifications
      .filter((n) => n.title.toLowerCase().includes(lowered))
      .map(({ id, title }) => ({ id, title }));
  }, [notifications, debouncedSearch]);

  useEffect(() => {
    setSelectedNotificationIds((prev) =>
      prev.filter((id) => notifications.some((notification) => notification.id === id)),
    );
  }, [notifications]);

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
    listQueryParams,
    notificationSuggestions,
    boxOptions: boxes,
    restaurantOptions: restaurants,
  };
}
