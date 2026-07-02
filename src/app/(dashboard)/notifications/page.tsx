"use client";
import { useState, useEffect, useMemo, type ReactNode } from "react";
import Image from "next/image";
import NotificationFilterBar from "@/components/features/notifications/NotificationFilterBar";
import NotificationList from "@/components/features/notifications/NotificationList";
import NotificationFilterModal from "@/components/features/notifications/NotificationFilterModal";
import { useNotificationFilters } from "@/components/features/notifications/hooks/useNotificationFilters";
import {
  MOCK_BOXES,
  MOCK_RESTAURANTS,
  MOCK_NOTIFICATIONS,
} from "@/components/features/notifications/constants";
import type { NotificationTone } from "@/types";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { notificationsService, mapApiNotificationToNotification } from "@/services/notifications";

export default function NotificationsPage() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<number[]>([]);

  // 1500ms Delay for testing on skeletons
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const { data: apiNotificationsQuery, isLoading: isApiLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsService.getNotifications(),
    refetchOnWindowFocus: true,
  });

  const apiNotifications = useMemo(() => {
    const raw = apiNotificationsQuery?.data?.notifications || [];
    return raw.map(mapApiNotificationToNotification);
  }, [apiNotificationsQuery]);

  const {
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
    boxOptions,
    restaurantOptions,
  } = useNotificationFilters({
    notifications: apiNotifications,
    boxes: MOCK_BOXES,
    restaurants: MOCK_RESTAURANTS,
  });

  const visibleNotifications = useMemo(
    () =>
      filteredNotifications.filter(
        (notification) => !dismissedNotificationIds.includes(notification.id),
      ),
    [filteredNotifications, dismissedNotificationIds],
  );

  const allVisibleSelected =
    visibleNotifications.length > 0 &&
    visibleNotifications.every((notification) =>
      selectedNotificationIds.includes(notification.id),
    );

  const handleToggleAllVisible = () => {
    setSelectedNotificationIds((prev) => {
      if (visibleNotifications.length === 0) {
        return prev;
      }
      const visibleIds = visibleNotifications.map((notification) => notification.id);
      const everySelected = visibleIds.every((id) => prev.includes(id));
      if (everySelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const handleDismiss = (notificationId: number) => {
    setDismissedNotificationIds((prev) =>
      prev.includes(notificationId) ? prev : [...prev, notificationId],
    );
    setSelectedNotificationIds((prev) => prev.filter((id) => id !== notificationId));
  };

  const handleDismissAll = () => {
    setDismissedNotificationIds((prev) => [
      ...new Set([...prev, ...filteredNotifications.map((notification) => notification.id)]),
    ]);
    setSelectedNotificationIds([]);
  };

  const getNotificationIcon = useMemo(
    () => {
      const NotificationIcon = (type: NotificationTone): ReactNode => {
        switch (type) {
          case "warning":
            return (
              <Image
                src="/exclamation-triangle-yellow.svg"
                alt="warning"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            );
          case "error":
          case "danger":
            return (
              <Image
                src="/exclamation-triangle.svg"
                alt="error"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            );
          case "success":
            return (
              <Image
                src="/Dashboard/Card/check_circle.svg"
                alt="success"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            );
          case "info":
            return (
              <Image
                src="/Icon-alert.svg"
                alt="info"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            );
          default:
            return (
              <Image
                src="/exclamation-triangle-yellow.svg"
                alt="warning"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            );
        }
      };
      NotificationIcon.displayName = 'NotificationIcon';
      return NotificationIcon;
    },
    []
  );

  return (
    <>
      <div className="flex items-center justify-between !pl-3 mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
          Notifications
        </h1>
        <Button
          variant="primary"
          appearance="ghost"
          onClick={handleDismissAll}
        >
          DISMISS ALL
        </Button>
      </div>
      <NotificationFilterBar
        search={search}
        setSearch={setSearch}
        boxOptions={boxOptions}
        selectedBoxes={selectedBoxes}
        setSelectedBoxes={setSelectedBoxes}
        restaurantOptions={restaurantOptions}
        selectedRestaurants={selectedRestaurants}
        setSelectedRestaurants={setSelectedRestaurants}
        notificationSuggestions={notificationSuggestions}
        setShowFilterModal={setShowFilterModal}
        isFilterModalOpen={showFilterModal}
      />
      <NotificationFilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        onFilter={() => setShowFilterModal(false)}
      />
      <NotificationList
        filtered={visibleNotifications}
        selected={selectedNotificationIds}
        setSelected={setSelectedNotificationIds}
        getNotificationIcon={getNotificationIcon}
        allSelected={allVisibleSelected}
        onToggleAll={handleToggleAllVisible}
        onDismiss={handleDismiss}
      />
    </>
  );
}

