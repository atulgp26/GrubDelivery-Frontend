"use client";
import { useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from "react";
import Image from "next/image";
import NotificationFilterBar from "@/components/features/notifications/NotificationFilterBar";
import NotificationList from "@/components/features/notifications/NotificationList";
import NotificationFilterModal from "@/components/features/notifications/NotificationFilterModal";
import { useNotificationFilters } from "@/components/features/notifications/hooks/useNotificationFilters";
import {
  notificationsService,
  NOTIFICATION_PAGE_SIZE,
  type NotificationPaginationMeta,
} from "@/services/notifications";
import type {
  NotificationTone,
  Notification,
  MultiSelectOption,
  NotificationGroupOption,
} from "@/types";
import { Button } from "@/components/ui/Button";
import LoadingDetails from "@/components/ui/LoadingDetails";
import Pagination from "@/components/ui/Pagination";

function parsePaginationMeta(
  pagination: Record<string, unknown> | undefined,
  fallbackCount: number,
  page: number,
): { totalCount: number; pageCount: number } {
  const meta = (pagination ?? {}) as NotificationPaginationMeta;
  const totalCount =
    typeof meta.total_count === "number" && Number.isFinite(meta.total_count)
      ? meta.total_count
      : fallbackCount;
  const limit =
    typeof meta.limit === "number" && meta.limit > 0
      ? meta.limit
      : NOTIFICATION_PAGE_SIZE;
  const pageCount =
    typeof meta.last_page === "number" && meta.last_page > 0
      ? meta.last_page
      : Math.max(1, Math.ceil(totalCount / limit));

  return { totalCount, pageCount: Math.max(pageCount, page) };
}

export default function NotificationsPage() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [boxes, setBoxes] = useState<MultiSelectOption[]>([]);
  const [restaurants, setRestaurants] = useState<NotificationGroupOption[]>([]);
  const hasLoadedOnceRef = useRef(false);

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
    listQueryParams,
    notificationSuggestions,
    boxOptions,
    restaurantOptions,
  } = useNotificationFilters({
    notifications,
    boxes,
    restaurants,
    page,
  });

  const listQueryKey = useMemo(
    () => JSON.stringify(listQueryParams),
    [listQueryParams],
  );

  const filterQueryKey = useMemo(() => {
    const { page: _page, ...filters } = listQueryParams;
    return JSON.stringify(filters);
  }, [listQueryParams]);

  const lastFilterKeyRef = useRef(filterQueryKey);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const dropRes = await notificationsService.getNotificationDropdowns();
        if (dropRes.success && dropRes.data) {
          const mappedBoxes = dropRes.data.boxes.map((b: any) => ({
            ...b,
            code: b.display_id ? `(#${b.display_id})` : b.code,
          }));
          setBoxes(mappedBoxes);
          setRestaurants(dropRes.data.restaurants);
        }
      } catch (error) {
        console.error("Failed to fetch notification dropdowns", error);
      }
    };

    fetchDropdowns();
  }, []);

  const refetchNotifications = useCallback(async () => {
    const notifRes = await notificationsService.getNotifications(listQueryParams);
    if (notifRes.success && notifRes.data) {
      setNotifications(notifRes.data.notifications);
      const fallbackCount =
        typeof notifRes.data.count === "number"
          ? notifRes.data.count
          : notifRes.data.notifications.length;
      const parsed = parsePaginationMeta(notifRes.pagination, fallbackCount, page);
      setTotalCount(parsed.totalCount);
      setPageCount(parsed.pageCount);
    }
  }, [listQueryParams, page]);

  useEffect(() => {
    let isActive = true;

    const fetchNotifications = async () => {
      if (lastFilterKeyRef.current !== filterQueryKey) {
        lastFilterKeyRef.current = filterQueryKey;
        if (page !== 1) {
          setPage(1);
          return;
        }
      }

      try {
        if (!hasLoadedOnceRef.current) {
          setIsLoading(true);
        }

        const notifRes = await notificationsService.getNotifications(listQueryParams);
        if (!isActive) return;

        if (notifRes.success && notifRes.data) {
          setNotifications(notifRes.data.notifications);
          const fallbackCount =
            typeof notifRes.data.count === "number"
              ? notifRes.data.count
              : notifRes.data.notifications.length;
          const parsed = parsePaginationMeta(notifRes.pagination, fallbackCount, page);
          setTotalCount(parsed.totalCount);
          setPageCount(parsed.pageCount);
          hasLoadedOnceRef.current = true;
        }
      } catch (error) {
        if (!isActive) return;
        console.error("Failed to fetch notifications data", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isActive = false;
    };
  }, [filterQueryKey, listQueryKey, listQueryParams, page]);

  const handleMarkAsRead = async (ids: string[]) => {
    setNotifications((prev) =>
      prev.map((n) =>
        ids.includes(n.id) ? { ...n, is_read: true } : n,
      ),
    );

    try {
      await notificationsService.markAsRead(ids);
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
      setNotifications((prev) =>
        prev.map((n) =>
          ids.includes(n.id) ? { ...n, is_read: false } : n,
        ),
      );
    }
  };

  const handleDismiss = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setSelectedNotificationIds((prev) =>
      prev.filter((id) => id !== notificationId),
    );
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationsService.markAsDismissed([notificationId]);
    } catch (error) {
      console.error("Failed to dismiss notification", error);
      await refetchNotifications();
    }
  };

  const handleDismissAll = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;

    setNotifications([]);
    setSelectedNotificationIds([]);
    setTotalCount((prev) => Math.max(0, prev - ids.length));

    try {
      await notificationsService.dismissAllNotifications(ids);
      await refetchNotifications();
    } catch (error) {
      console.error("Failed to dismiss all notifications", error);
      await refetchNotifications();
    }
  };

  const allVisibleSelected =
    notifications.length > 0 &&
    notifications.every((notification) =>
      selectedNotificationIds.includes(notification.id),
    );

  const handleToggleAllVisible = () => {
    setSelectedNotificationIds((prev) => {
      if (notifications.length === 0) {
        return prev;
      }
      const visibleIds = notifications.map(
        (notification) => notification.id,
      );
      const everySelected = visibleIds.every((id) => prev.includes(id));
      if (everySelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
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
          case "notification":
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
      NotificationIcon.displayName = "NotificationIcon";
      return NotificationIcon;
    },
    [],
  );

  if (isLoading) {
    return <LoadingDetails entity="notifications" />;
  }

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
        filtered={notifications}
        selected={selectedNotificationIds}
        setSelected={setSelectedNotificationIds}
        getNotificationIcon={getNotificationIcon}
        allSelected={allVisibleSelected}
        onToggleAll={handleToggleAllVisible}
        onDismiss={handleDismiss}
        onMarkAsRead={handleMarkAsRead}
      />
      {totalCount > 0 ? (
        <Pagination
          currentPage={page}
          pageSize={NOTIFICATION_PAGE_SIZE}
          totalItems={totalCount}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          className="w-full mt-2"
        />
      ) : null}
    </>
  );
}
