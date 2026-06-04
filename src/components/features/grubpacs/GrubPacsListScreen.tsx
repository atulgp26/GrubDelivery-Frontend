"use client";
import { useState, useCallback, useRef, useEffect, useMemo, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GrubPacDataTable, type GrubPacDataRow } from "@/components/features/grubpacs/table/grubpac-data-table";
import { GrubPacEmptyState } from "@/components/features/grubpacs/components/GrubPacEmptyState";
import { mapGrubPacItemsToDataRows } from "@/components/features/grubpacs/utils/grubpac-mapper";
import GrubPacActionBar from "@/components/features/grubpacs/components/GrubPacActionBar";
import GrubPacsFilterModal from "@/components/features/shared/filter/BoxFilterModal";
import SearchInput from "@/components/ui/SearchInput";
import SuspendBoxModal from "@/components/features/grubpacs/modals/SuspendBoxModal";
import Collapse from "@/components/ui/Collapse";
import BoxRemovalModal from "@/components/features/grubpacs/modals/BoxRemovalModal";
import ApplySettingsModal from "@/components/features/grubpacs/modals/ApplySettingsModal";
import ReassignGroupModal from "@/components/features/grubpacs/modals/ReassignGroupModal";
import RestaurantDetailsModal from "@/components/features/shared/modals/RestaurantDetailsModal";
import RestaurantResourcesModal, {
  type Employee as ResourceEmployee,
  type GrubPac as ResourceGrubPac,
  type ResourceTabType,
} from "@/components/features/restaurants/modals/RestaurantResourcesModal";
import AddRestaurantModal, {
  type RestaurantFormData,
} from "@/components/features/restaurants/modals/AddRestaurantModal";
import DeleteRestaurantModal from "@/components/features/restaurants/modals/DeleteRestaurantModal";
import ManageResourcesDeleteModal, {
  type DeleteResourceAction,
} from "@/components/features/restaurants/modals/ManageResourcesDeleteModal";
import ReassignResourcesModal from "@/components/features/restaurants/modals/ReassignResourcesModal";
import employeeService from "@/services/employees";
import grubpacService from "@/services/grubpacs";
import foodService from "@/services/food";
import EditDetails from "@/components/features/grubpacs/modals/EditDetailsModal";
import PermissionModal from "@/components/features/grubpacs/modals/PermissionModal";
import CheckBox from "@/components/ui/CheckBox";
import FilterButton from "@/components/ui/FilterButton";
import { Button } from "@/components/ui/Button";
import { useGrubPacsListState, type GrubPacItem } from "@/components/features/grubpacs/hooks/useGrubPacsListState";
import { useGrubPacsListHandlers } from "@/components/features/grubpacs/hooks/useGrubPacsListHandlers";
import type { TemperatureSettings } from "@/components/features/grubpacs/dropdowns/TemperatureDropdown";
import type { ApiGrubPac, ApiGrubPacSearchResult, GrubPacListData } from "@/types/domain/grubpacs";
import type { Restaurant, RestaurantData } from "@/types/domain/restaurants";
import {
  apiEmployeeToEmployee,
  isBoxesGroupedResponse,
  isRestaurantsGroupedResponse,
  type ApiEmployee,
} from "@/types/domain/employees";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import { flattenWrappedGroupRecord, getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import { showError, showSuccess } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";

export default function GrubPacsListScreen() {
  const {
    showOffline,
    setShowOffline,
    isGrouped,
    setIsGrouped,
    forceEmptyState,
    openSection,
    setOpenSection,
    openCheckPermissionsModal,
    setOpenCheckPermissionsModal,
    openEditBoxModal,
    setOpenEditBoxModal,
    searchTerm,
    setSearchTerm,
    selected,
    setSelected,
    groups,
    grubpacsData,
    filters,
    setFilters,
    modalState,
    openModal,
    closeModal,
    hasData,
    isLoading,
    isPageLoading,
    isSearching,
    searchSuggestions,
    searchError,
    allItems,
    filteredGroups,
    poweredOnItems,
    poweredOffItems,
    totalEntries,
    refetchGrubPacs,
    refetchGroup,
  } = useGrubPacsListState();

  const {
    handleSelectAll,
    handleSelectItem,
    onPermissions,
    onEditDetails,
    handleSuspendBox,
    handleReassignBox,
    handleReassign,
    suspendBoxClick,
    handleRemoveBoxes,
    handleConfirmRemoveBoxes,
    handleSuspendFromRemoval,
    handleRemoveRoom,
    handleApplySettings,
    handleReassignConfirm,
    handleGroupClick,
    handleViewList,
    handleReassignAllBoxes,
    handleEditGroupDetails,
    handleDeleteGroup,
  } = useGrubPacsListHandlers({
    selected,
    setSelected,
    modalState,
    openModal,
    closeModal,
    setOpenCheckPermissionsModal,
    setOpenEditBoxModal,
    refetchGrubPacs,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSwitching, setIsSwitching] = useState(false);
  const [editingGrubPac, setEditingGrubPac] = useState<GrubPacItem | null>(null);
  const [permissionsGrubPac, setPermissionsGrubPac] = useState<GrubPacItem | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [showGroupedRestaurantResourcesModal, setShowGroupedRestaurantResourcesModal] = useState(false);
  const [groupedRestaurantResourcesTab, setGroupedRestaurantResourcesTab] =
    useState<ResourceTabType>("grubpacs");
  const [resourceEmployees, setResourceEmployees] = useState<ResourceEmployee[]>([]);
  const [resourceGrubPacs, setResourceGrubPacs] = useState<ResourceGrubPac[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [groupedRestaurantEmployeeCount, setGroupedRestaurantEmployeeCount] = useState<number | null>(null);
  const [showReassignResourcesModal, setShowReassignResourcesModal] = useState(false);
  const [reassignMode, setReassignMode] = useState<"boxes" | "restaurantDelete">("boxes");
  const [reassignRestaurants, setReassignRestaurants] = useState<Restaurant[]>([]);
  const [reassignTotalEntries, setReassignTotalEntries] = useState(0);
  const [reassignRestaurantsLoading, setReassignRestaurantsLoading] = useState(false);
  const [reassignSubmitting, setReassignSubmitting] = useState(false);
  const [selectedReassignBoxIds, setSelectedReassignBoxIds] = useState<string[]>([]);
  const [editRestaurantModalOpen, setEditRestaurantModalOpen] = useState(false);
  const [editingRestaurantData, setEditingRestaurantData] = useState<Restaurant | null>(null);
  const [restaurantEditLoading, setRestaurantEditLoading] = useState(false);
  const [deleteRestaurantModalOpen, setDeleteRestaurantModalOpen] = useState(false);
  const [manageResourcesDeleteModalOpen, setManageResourcesDeleteModalOpen] = useState(false);
  const [deleteRestaurantLoading, setDeleteRestaurantLoading] = useState(false);
  const [deleteSourceRestaurant, setDeleteSourceRestaurant] = useState<Restaurant | null>(null);
  const [groupPages, setGroupPages] = useState<Record<string, number>>({});
  const [sectionPages, setSectionPages] = useState<{ poweredOn: number; poweredOff: number }>({
    poweredOn: 1,
    poweredOff: 1,
  });
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preselectAppliedRef = useRef<string | null>(null);
  const expandedGroupAppliedRef = useRef<string | null>(null);
  const PAGE_SIZE = 50;

  const getGroupKey = useCallback((name: string, index: number) => `${name}__${index}`, []);

  const renderTableSkeleton = useCallback(
    () => (
      <div className="space-y-3 p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    ),
    [],
  );

  const handleOpenEditModal = useCallback(
    (row: GrubPacDataRow) => {
      const selectedItem =
        allItems.find((item) => String(item.id) === String(row.id)) ??
        ({ id: row.id, name: row.name } as GrubPacItem);
      setEditingGrubPac(selectedItem);
      setOpenEditBoxModal(true);
    },
    [allItems, setOpenEditBoxModal]
  );

  const handleGroupedChange = useCallback((checked: boolean) => {
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    setIsSwitching(true);
    switchTimerRef.current = setTimeout(() => {
      setIsGrouped(checked);
      setOpenGroup(null);
      setGroupPages({});
      setSectionPages({ poweredOn: 1, poweredOff: 1 });
      setIsSwitching(false);
    }, 150);
  }, [setIsGrouped]);

  const handleRowClick = (row: GrubPacDataRow) => {
    router.push(`/grubpacs/details?id=${row.id}&pinSelected=1&from=%2Fgrubpacs%2Flist`);
  };

  const handleViewSettings = useCallback(
    (row: GrubPacDataRow) => {
      const encodedId = encodeURIComponent(String(row.id));
      router.push(`/grubpacs/details?id=${encodedId}&pinSelected=1&from=%2Fgrubpacs%2Flist&editSettings=1`);
    },
    [router],
  );

  const handleVisitGrubLock = useCallback(
    (row: GrubPacDataRow) => {
      const encodedId = encodeURIComponent(String(row.id));
      router.push(`/grublock/list?selectBoxId=${encodedId}&from=%2Fgrubpacs%2Flist`);
    },
    [router],
  );

  const handleTransferOwnershipRedirect = useCallback(() => {
    router.push("/transfer-ownership");
  }, [router]);

  const handleOpenPermissionModal = useCallback(
    (row: GrubPacDataRow) => {
      const selectedItem =
        allItems.find((item) => String(item.id) === String(row.id)) ??
        ({
          id: row.id,
          name: row.name,
          accessMode: row.accessMode ?? "public",
          blockedEmployeeIds: row.blockedEmployeeIds ?? [],
        } as GrubPacItem);

      setPermissionsGrubPac(selectedItem);
      setOpenCheckPermissionsModal(true);
    },
    [allItems, setOpenCheckPermissionsModal]
  );

  const handleEditFromPermissionsModal = useCallback(() => {
    if (!permissionsGrubPac) return;
    setOpenCheckPermissionsModal(false);
    setEditingGrubPac(permissionsGrubPac);
    setOpenEditBoxModal(true);
  }, [permissionsGrubPac, setOpenCheckPermissionsModal, setOpenEditBoxModal]);

  const handleSearchSuggestionSelect = useCallback(
    (item: ApiGrubPacSearchResult) => {
      setSearchTerm(item.name ?? "");

      const selectedItem = allItems.find((candidate) => String(candidate.id) === String(item.id));
      if (!selectedItem) return;

      if (isGrouped) {
        const groupMatchIndex = filteredGroups.findIndex((group) =>
          (group.items ?? []).some((groupItem) => String(groupItem.id) === String(selectedItem.id)),
        );

        if (groupMatchIndex >= 0) {
          const matchedGroup = filteredGroups[groupMatchIndex];
          const selectedGroupName = String(matchedGroup?.name ?? "");
          const selectedGroupKey = getGroupKey(selectedGroupName, groupMatchIndex);
          setOpenGroup(selectedGroupKey);
          setGroupPages((prev) => ({ ...prev, [selectedGroupKey]: 1 }));
        }
        return;
      }

      const selectedId = String(selectedItem.id);
      const inPoweredOn = poweredOnItems.some((candidate) => String(candidate.id) === selectedId);
      const nextSection = inPoweredOn ? "poweredOn" : "poweredOff";
      setOpenSection(nextSection);
      setSectionPages((prev) => ({ ...prev, [nextSection]: 1 }));
    },
    [allItems, filteredGroups, getGroupKey, isGrouped, poweredOnItems, setOpenSection, setSearchTerm],
  );

  useEffect(() => {
    const selectBoxId = searchParams.get("selectBoxId");
    if (!selectBoxId) return;
    if (preselectAppliedRef.current === selectBoxId) return;
    if (allItems.length === 0) return;

    const selectedItem = allItems.find((item) => String(item.id) === String(selectBoxId));
    if (!selectedItem) return;

    preselectAppliedRef.current = selectBoxId;

    setSearchTerm("");
    setIsGrouped(false);

    const selectedId = String(selectedItem.id);
    const inPoweredOn = poweredOnItems.some((candidate) => String(candidate.id) === selectedId);
    const targetSection = inPoweredOn ? "poweredOn" : "poweredOff";

    setOpenSection(targetSection);
    setSectionPages({ poweredOn: 1, poweredOff: 1 });
    setSelected({
      poweredOn: targetSection === "poweredOn" ? [selectedItem.id] : [],
      poweredOff: targetSection === "poweredOff" ? [selectedItem.id] : [],
    });
  }, [allItems, poweredOnItems, searchParams, setIsGrouped, setOpenSection, setSearchTerm, setSelected]);

  useEffect(() => {
    const expandGroup = searchParams.get("expandGroup")?.toLowerCase();
    if (expandGroup !== "unassigned") return;

    if (!isGrouped) {
      setIsGrouped(true);
      return;
    }

    const unassignedIndex = filteredGroups.findIndex(
      (group) => String(group.name ?? "").trim().toLowerCase() === "unassigned",
    );
    if (unassignedIndex < 0) return;

    const unassignedGroup = filteredGroups[unassignedIndex];
    const groupKey = getGroupKey(String(unassignedGroup.name ?? ""), unassignedIndex);

    if (expandedGroupAppliedRef.current === groupKey && openGroup === groupKey) return;

    expandedGroupAppliedRef.current = groupKey;
    setOpenGroup(groupKey);
    setGroupPages((prev) => ({
      ...prev,
      [groupKey]: 1,
    }));
  }, [filteredGroups, getGroupKey, isGrouped, openGroup, searchParams, setIsGrouped]);

  // Filter logic for offline
  const filterItems = (items: GrubPacItem[]): GrubPacItem[] => {
    if (!isGrouped) return items;

    return items.filter((item) => {
      const powerValue = String(item.power ?? item.powerStatus ?? "").toLowerCase();
      const statusValue = String(item.status ?? "").toLowerCase();

      if (showOffline) {
        return (
          powerValue === "off" ||
          powerValue === "unknown" ||
          statusValue === "off" ||
          statusValue === "offline" ||
          statusValue === "disconnected"
        );
      }

      return powerValue === "on" || statusValue === "on" || statusValue === "connected";
    });
  };

  const inferInitialDualZone = useCallback(
    (ids: Iterable<number | string>): boolean => {
      const normalizedIds = Array.from(ids).map((id) => String(id));
      if (normalizedIds.length === 0) return false;

      return normalizedIds.every((id) => {
        const item = allItems.find((candidate) => String(candidate.id) === id);
        return item?.dualZoneStatus === "on";
      });
    },
    [allItems]
  );

  const extractGrubPacs = useCallback((data: GrubPacListData): ApiGrubPac[] => {
    const groupedData = (data as { groups?: Record<string, unknown> }).groups;
    if (groupedData && typeof groupedData === "object") {
      return flattenWrappedGroupRecord<ApiGrubPac>(groupedData);
    }

    return (data as { boxes?: ApiGrubPac[] }).boxes ?? [];
  }, []);

  const fetchAllRestaurantBoxes = useCallback(
    async (restaurantId: string): Promise<ApiGrubPac[]> => {
      const boxMap = new Map<string, ApiGrubPac>();
      let page = 1;
      let expectedCount: number | undefined;

      while (page <= 250) {
        const response = await grubpacService.getList({ restaurant_id: restaurantId, page });
        if (!response.success || !response.data) {
          throw new Error(response.error ?? "Failed to fetch boxes");
        }

        const data = response.data as GrubPacListData & { count?: number };
        const boxes = extractGrubPacs(data);

        if (typeof data.count === "number" && Number.isFinite(data.count)) {
          expectedCount = data.count;
        }

        if (boxes.length === 0) {
          break;
        }

        boxes.forEach((box) => {
          boxMap.set(box.id, box);
        });

        if (expectedCount !== undefined && boxMap.size >= expectedCount) {
          break;
        }

        page += 1;
      }

      return Array.from(boxMap.values());
    },
    [extractGrubPacs],
  );

  const fetchRestaurantResources = useCallback(
    async (restaurantId?: string) => {
      if (!restaurantId) {
        setResourceEmployees([]);
        setResourceGrubPacs([]);
        return;
      }

      setResourcesLoading(true);
      setResourceEmployees([]);
      setResourceGrubPacs([]);

      try {
        const [employeesResponse, allRestaurantBoxes] = await Promise.all([
          employeeService.getList({ restaurant_id: restaurantId, limit: 50 }),
          fetchAllRestaurantBoxes(restaurantId),
        ]);

        if (employeesResponse.success && employeesResponse.data) {
          const employeeData = employeesResponse.data;
          let employees: ApiEmployee[] = [];

          if (isRestaurantsGroupedResponse(employeeData)) {
            employees = flattenWrappedGroupRecord<ApiEmployee>(employeeData.groups as Record<string, unknown>);
          } else if (isBoxesGroupedResponse(employeeData)) {
            employees = [
              ...getWrappedGroupArray<ApiEmployee>(employeeData.groups.connected),
              ...getWrappedGroupArray<ApiEmployee>(employeeData.groups.disconnected),
              ...getWrappedGroupArray<ApiEmployee>(employeeData.groups.managers),
            ];
          } else {
            employees = employeeData.employees ?? [];
          }

          const uniqueEmployees = new Map<string, ResourceEmployee>();
          employees.forEach((employee) => {
            const mapped = apiEmployeeToEmployee(employee);
            uniqueEmployees.set(employee.id, {
              id: mapped.id,
              name: mapped.name,
              employeeId: mapped.employeeId,
              joinedDate: mapped.joinedDate,
              phone: mapped.phone,
              email: mapped.email,
              role: mapped.role,
              boxCount: mapped.boxCount,
              added: mapped.added,
              isAvailable: employee.status === "active",
            });
          });
          const resolvedEmployees = Array.from(uniqueEmployees.values());
          setResourceEmployees(resolvedEmployees);
          setGroupedRestaurantEmployeeCount(resolvedEmployees.length);
        } else {
          setResourceEmployees([]);
        }

        const mappedBoxes: ResourceGrubPac[] = allRestaurantBoxes.map((box) => {
          const restaurantName = box.restaurants?.[0]?.name ?? box.restaurant_boxes?.[0]?.restaurant?.name;
          const detailsParts = [box.box_id, box.vehicle_number, restaurantName].filter(Boolean);
          const powerStatus = (box.power_status ?? "").toLowerCase();

          return {
            id: box.id,
            name: box.name,
            details: detailsParts.join(" | "),
            power: powerStatus === "on" ? "on" : powerStatus === "off" ? "off" : "warning",
            driver: undefined,
            added: new Date(box.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            }),
            isLocked: box.lock?.lock_status === "locked",
            isOffline: powerStatus === "off",
          };
        });
        setResourceGrubPacs(mappedBoxes);
      } catch {
        setResourceEmployees([]);
        setResourceGrubPacs([]);
        showError("Failed to fetch restaurant resources");
      } finally {
        setResourcesLoading(false);
      }
    },
    [fetchAllRestaurantBoxes],
  );

  // Custom component for grouped view
  const GroupedView = (): ReactElement => {
    return (
      <div className="space-y-4">
        {filteredGroups.map((group, groupIndex) => {
          const groupName = String(group.name ?? "");
          const groupKey = getGroupKey(groupName, groupIndex);
          const groupItems = group.items ?? [];
          const groupItemIds = new Set(groupItems.map((item) => String(item.id)));
          const groupSelectedIds = new Set(
            (selected.poweredOn || []).map(String).filter((id) => groupItemIds.has(id)),
          );
          const visibleItems = filterItems(groupItems);
          const totalItems = group.pagination?.totalItems ?? visibleItems.length;
          const totalPages = group.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
          const currentPage = group.pagination?.currentPage ?? Math.min(groupPages[groupKey] ?? 1, totalPages);
          
          const start = group.pagination ? 0 : (currentPage - 1) * PAGE_SIZE;
          const pagedItems = group.pagination ? visibleItems : visibleItems.slice(start, start + PAGE_SIZE);
          const endIndex = group.pagination ? (start + visibleItems.length) : Math.min(start + PAGE_SIZE, totalItems);

          const pageItemIds = new Set(pagedItems.map((item) => String(item.id)));
          const pageSelectedIds = new Set(
            Array.from(groupSelectedIds).filter((id) => pageItemIds.has(id)),
          );

          const pagination =
            openGroup === groupKey && totalItems > 0 && visibleItems.length > 0
              ? {
                  rangeText: group.pagination 
                    ? `${(currentPage - 1) * group.pagination.pageSize + 1}-${(currentPage - 1) * group.pagination.pageSize + visibleItems.length}`
                    : `${start + 1}-${endIndex}`,
                  onPrev: () => {
                    if (isPageLoading) return;
                    if (group.pagination) {
                      refetchGroup(
                        {
                          name: String(group.name ?? ""),
                          groupTableKey: String((group as { groupTableKey?: string }).groupTableKey ?? "") || undefined,
                        },
                        Math.max(1, currentPage - 1),
                      );
                    } else {
                      setGroupPages((prev) => ({
                        ...prev,
                        [groupKey]: Math.max(1, currentPage - 1),
                      }));
                    }
                  },
                  onNext: () => {
                    if (isPageLoading) return;
                    if (group.pagination) {
                      refetchGroup(
                        {
                          name: String(group.name ?? ""),
                          groupTableKey: String((group as { groupTableKey?: string }).groupTableKey ?? "") || undefined,
                        },
                        Math.min(totalPages, currentPage + 1),
                      );
                    } else {
                      setGroupPages((prev) => ({
                        ...prev,
                        [groupKey]: Math.min(totalPages, currentPage + 1),
                      }));
                    }
                  },
                  disablePrev: isPageLoading || currentPage <= 1,
                  disableNext: isPageLoading || currentPage >= totalPages,
                }
              : undefined;

          return (
            <Collapse
              key={groupKey}
              title={group.name}
              open={openGroup === groupKey}
              onClick={() => {
                setOpenGroup(openGroup === groupKey ? null : groupKey);
                setGroupPages((prev) => ({
                  ...prev,
                  [groupKey]: prev[groupKey] ?? 1,
                }));
              }}
              onTitleClick={() => handleGroupClick(group)}
              pagination={pagination}
            >
              {openGroup === groupKey && (
                <>
                  {isPageLoading ? (
                    renderTableSkeleton()
                  ) : visibleItems.length > 0 ? (
                    <>
                      <GrubPacDataTable
                        data={mapGrubPacItemsToDataRows(pagedItems)}
                        columns={["name", "status", "power", "battery", "settings", "handler", "actions"]}
                        selectable={true}
                        selectedIds={pageSelectedIds}
                        onSelectionChange={(ids) =>
                          setSelected((prev) => ({
                            ...prev,
                            poweredOn: [
                              ...(prev.poweredOn || []).filter((id) => !pageItemIds.has(String(id))),
                              ...Array.from(ids),
                            ],
                          }))
                        }
                        onRowClick={handleRowClick}
                        onLockIconClick={handleVisitGrubLock}
                        onEditBoxDetails={handleOpenEditModal}
                        onCheckPermissions={handleOpenPermissionModal}
                        onViewSettings={handleViewSettings}
                        onSuspendBox={(row) =>
                          openModal("suspend", {
                            selectedCount: 1,
                            box: { id: row.id, code: row.identifier || row.name, name: row.name } as GrubPacItem,
                            fromRemoval: false,
                            selectedIds: [row.id],
                          })
                        }
                        onRemoveBox={(row) =>
                          openModal("boxRemoval", {
                            selected: [row.id],
                            count: 1,
                          })
                        }
                        showEmptySettings={groupName === "Unassigned"}
                      />
                      {groupSelectedIds.size > 0 && (
                        <GrubPacActionBar
                          selectedCount={groupSelectedIds.size}
                          isGrouped={isGrouped}
                          initialDualZone={inferInitialDualZone(groupSelectedIds)}
                          onClearSelection={() =>
                            setSelected((prev) => ({
                              ...prev,
                              poweredOn: (prev.poweredOn || []).filter((id) => !groupItemIds.has(String(id))),
                            }))
                          }
                          onPower={(action) => {
                            const settingType = action === "on" ? "TURN POWER ON" : "TURN POWER OFF";
                            openModal("applySettings", {
                              selectedCount: groupSelectedIds.size,
                              settingType,
                              selectedIds: Array.from(groupSelectedIds),
                              actionType: "power",
                              actionValue: action,
                              temperature: null,
                            });
                          }}
                          onIoniser={(action) => {
                            const settingType = action === "on" ? "TURN IONISER ON" : "TURN IONISER OFF";
                            openModal("applySettings", {
                              selectedCount: groupSelectedIds.size,
                              settingType,
                              selectedIds: Array.from(groupSelectedIds),
                              actionType: "ioniser",
                              actionValue: action,
                              temperature: null,
                            });
                          }}
                          onTemperature={(settings: TemperatureSettings) => {
                            const dualLabel = settings.dualZone ? "Dual mode on" : "Dual mode off";
                            const tempLabel = settings.zone1 ? `Temperature set to ${settings.zone1}°C` : "Temperature set";
                            openModal("applySettings", {
                              selectedCount: groupSelectedIds.size,
                              settingType: `${dualLabel}, ${tempLabel}`,
                              selectedIds: Array.from(groupSelectedIds),
                              actionType: "temperature",
                              actionValue: null,
                              temperature: settings,
                              tokenVariant: "neutral",
                            });
                          }}
                          onSuspendBoxes={() =>
                            openModal("suspend", {
                              selectedCount: groupSelectedIds.size,
                              fromRemoval: false,
                              selectedIds: Array.from(groupSelectedIds),
                              box: null,
                            })
                          }
                          onReassignRestaurant={() => handleFooterBulkReassign(Array.from(groupSelectedIds))}
                          onRemoveVehicle={handleRemoveRoom}
                          onDelete={() => handleRemoveBoxes(Array.from(groupSelectedIds), groupSelectedIds.size)}
                        />
                      )}
                    </>
                  ) : (
                    <GrubPacEmptyState
                      type={groupName === "Unassigned" ? "grouped-unassigned" : "grouped-restaurant"}
                    />
                  )}
                </>
              )}
            </Collapse>
          );
        })}
        {filteredGroups.length === 0 && <GrubPacEmptyState type="grouped-restaurant" />}
      </div>
    );
  };

  const headerActions = (
    <div className="flex items-center space-x-4">
      <Link href="/grubpacs/suspended">
        <Button
          variant="primary"
          appearance="ghost"
          className=" !text-base font-medium bg-transparent border-none shadow-none hover:underline"
        >
          VIEW SUSPENDED
        </Button>
      </Link>
    </div>
  );


  const filterActions = (
    <div className="flex items-center space-x-4">
      <span className="font-normal text-[14px] leading-[22px] text-[var(--content-neutral-tertiary,#6b7971)]">
        {isSearching ? "Searching..." : `${totalEntries} entries`}
      </span>
      <div className="flex items-center gap-4">
        <CheckBox checked={isGrouped} onChange={(e) => handleGroupedChange(e.target.checked)} />
        <span className="text-lg text-[var(--color-neutral-secondary)]">Grouped</span>
{isGrouped && (
  <>
            <CheckBox checked={showOffline} onChange={(e) => setShowOffline(e.target.checked)} />
        <span className="text-lg text-[var(--color-neutral-secondary)]">Show offline boxes</span>
        </>
        )}
      </div>
      <FilterButton
        open={modalState.filter.open}
        handleFilterClick={() => openModal("filter")}
      />
    </div>
  );

  const showSearchDropdown = isSearchFocused && searchTerm.trim().length > 0;

  const poweredOnGroup = filteredGroups.find((group) => {
    const key = String((group as { groupTableKey?: string }).groupTableKey ?? "").toLowerCase();
    if (key === "on") return true;
    return String(group.name ?? "").toLowerCase().includes("on");
  });
  const poweredOffGroup = filteredGroups.find((group) => {
    const key = String((group as { groupTableKey?: string }).groupTableKey ?? "").toLowerCase();
    if (key === "off") return true;
    return String(group.name ?? "").toLowerCase().includes("off");
  });

  const useServerSectionPagination = searchTerm.trim().length === 0;

  const filteredPoweredOnItems = filterItems(poweredOnItems);
  const poweredOnPagination =
    useServerSectionPagination && poweredOnGroup?.pagination
      ? poweredOnGroup.pagination
      : undefined;
  const poweredOnTotalPages = poweredOnPagination?.totalPages ?? Math.max(1, Math.ceil(filteredPoweredOnItems.length / PAGE_SIZE));
  const poweredOnCurrentPage = poweredOnPagination?.currentPage ?? Math.min(sectionPages.poweredOn, poweredOnTotalPages);
  const poweredOnStart = poweredOnPagination ? (poweredOnCurrentPage - 1) * poweredOnPagination.pageSize : (poweredOnCurrentPage - 1) * PAGE_SIZE;
  const poweredOnEnd = poweredOnPagination
    ? poweredOnStart + filteredPoweredOnItems.length
    : Math.min(poweredOnStart + PAGE_SIZE, filteredPoweredOnItems.length);
  const pagedPoweredOnItems = poweredOnPagination ? filteredPoweredOnItems : filteredPoweredOnItems.slice(poweredOnStart, poweredOnEnd);
  const poweredOnPageIds = new Set(pagedPoweredOnItems.map((item) => String(item.id)));
  const poweredOnPageSelectedIds = new Set(
    (selected.poweredOn || []).map(String).filter((id) => poweredOnPageIds.has(id)),
  );

  const filteredPoweredOffItems = filterItems(poweredOffItems);
  const poweredOffPagination =
    useServerSectionPagination && poweredOffGroup?.pagination
      ? poweredOffGroup.pagination
      : undefined;
  const poweredOffTotalPages = poweredOffPagination?.totalPages ?? Math.max(1, Math.ceil(filteredPoweredOffItems.length / PAGE_SIZE));
  const poweredOffCurrentPage = poweredOffPagination?.currentPage ?? Math.min(sectionPages.poweredOff, poweredOffTotalPages);
  const poweredOffStart = poweredOffPagination ? (poweredOffCurrentPage - 1) * poweredOffPagination.pageSize : (poweredOffCurrentPage - 1) * PAGE_SIZE;
  const poweredOffEnd = poweredOffPagination
    ? poweredOffStart + filteredPoweredOffItems.length
    : Math.min(poweredOffStart + PAGE_SIZE, filteredPoweredOffItems.length);
  const pagedPoweredOffItems = poweredOffPagination ? filteredPoweredOffItems : filteredPoweredOffItems.slice(poweredOffStart, poweredOffEnd);
  const poweredOffPageIds = new Set(pagedPoweredOffItems.map((item) => String(item.id)));
  const poweredOffPageSelectedIds = new Set(
    (selected.poweredOff || []).map(String).filter((id) => poweredOffPageIds.has(id)),
  );

  const selectedGroup = modalState.groupModal.group;

  const openGroupedResourcesModal = useCallback(
    (tab: ResourceTabType) => {
      const restaurantId = selectedGroup?.restaurantIds?.[0];
      setGroupedRestaurantResourcesTab(tab);
      setShowGroupedRestaurantResourcesModal(true);
      setGroupedRestaurantEmployeeCount(null);
      closeModal("groupModal");
      void fetchRestaurantResources(restaurantId);
    },
    [closeModal, fetchRestaurantResources, selectedGroup],
  );

  const mapRestaurantData = useCallback((restaurant: RestaurantData): Restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.full_address,
    manager: restaurant.manager
      ? [restaurant.manager.first_name, restaurant.manager.last_name].filter(Boolean).join(" ") || null
      : null,
    drivers: restaurant._count?.employees ?? 0,
    boxes: restaurant._count?.boxes ?? 0,
    suspended_boxes: restaurant._count?.suspended_boxes ?? 0,
    updated: restaurant.updated_at
      ? new Date(restaurant.updated_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      : "-",
    status: restaurant.status === "suspended" ? "suspended" : "active",
    city: restaurant.city,
    state: restaurant.state,
    pincode: restaurant.pincode,
    line_one: restaurant.line_one,
    line_two: restaurant.line_two,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    google_place_id: restaurant.google_place_id,
  }), []);

  const fetchActiveRestaurantsForReassign = useCallback(async (query = "", page = 1) => {
    setReassignRestaurantsLoading(true);
    try {
      const response = await foodService.getRestaurants({
        status: "active",
        query: query.trim() || undefined,
        limit: 50,
        page,
      });

      if (response.success && response.data?.restaurants) {
        const mapped = response.data.restaurants.map(mapRestaurantData);
        setReassignRestaurants(mapped);
        setReassignTotalEntries(
          ((response.pagination as { total_count?: number } | undefined)?.total_count)
            ?? (response.data as { total_count?: number }).total_count
            ?? response.data.count
            ?? mapped.length,
        );
      } else {
        setReassignRestaurants([]);
        setReassignTotalEntries(0);
      }
    } catch {
      setReassignRestaurants([]);
      setReassignTotalEntries(0);
      showError("Failed to fetch restaurants");
    } finally {
      setReassignRestaurantsLoading(false);
    }
  }, [mapRestaurantData]);

  const handleFetchReassignRestaurants = useCallback((query: string, page: number) => {
    void fetchActiveRestaurantsForReassign(query, page);
  }, [fetchActiveRestaurantsForReassign]);

  const openReassignResourcesModal = useCallback(() => {
    // Prime modal in loading state to avoid brief empty-state flashes.
    setReassignRestaurants([]);
    setReassignTotalEntries(0);
    setReassignRestaurantsLoading(true);
    setShowReassignResourcesModal(true);
  }, []);

  const fetchRestaurantForGroupEdit = useCallback(
    async (group: GrubPacItem): Promise<Restaurant | null> => {
      let targetRestaurantId = group.restaurantIds?.[0];
      const targetName = String(group.name ?? "").trim().toLowerCase();

      const findByIdAcrossStatuses = async (restaurantId: string): Promise<Restaurant | null> => {
        const statuses: Array<"active" | "suspended"> = ["active", "suspended"];

        for (const status of statuses) {
          let page = 1;
          const PAGE_LIMIT = 50;

          while (page <= 20) {
            const response = await foodService.getRestaurants({
              status,
              limit: PAGE_LIMIT,
              page,
            });

            if (!response.success || !response.data?.restaurants) {
              break;
            }

            const found = response.data.restaurants.find(
              (restaurant) => restaurant.id === restaurantId,
            );

            if (found) {
              return mapRestaurantData(found as RestaurantData);
            }

            if (response.data.restaurants.length < PAGE_LIMIT) {
              break;
            }

            page += 1;
          }
        }

        return null;
      };

      if (!targetRestaurantId && targetName) {
        const searchResponse = await foodService.searchRestaurants({
          query: targetName,
          limit: 10,
          status: "all",
        });

        const searched = searchResponse.data?.restaurants ?? [];
        const exactNameMatch = searched.find(
          (restaurant) => restaurant.name.trim().toLowerCase() === targetName,
        );
        const fallbackMatch = searched[0];
        targetRestaurantId = exactNameMatch?.id ?? fallbackMatch?.id;
      }

      if (targetRestaurantId) {
        const foundById = await findByIdAcrossStatuses(targetRestaurantId);
        if (foundById) {
          return foundById;
        }
      }

      return null;
    },
    [mapRestaurantData],
  );

  const handleOpenReassignResources = useCallback(
    async (boxIds: string[]) => {
      setReassignMode("boxes");
      const sourceRestaurantId = selectedGroup?.restaurantIds?.[0];
      let ids = boxIds;

      if (ids.length === 0) {
        if (!sourceRestaurantId) {
          showError("Unable to resolve source restaurant");
          return;
        }

        try {
          const allBoxes = await fetchAllRestaurantBoxes(sourceRestaurantId);
          ids = allBoxes.map((box) => box.id);
        } catch (error) {
          showError(error instanceof Error ? error.message : "Failed to fetch all boxes");
          return;
        }
      }

      if (ids.length === 0) {
        showError("No boxes available for reassignment");
        return;
      }

      setSelectedReassignBoxIds(Array.from(new Set(ids)));
      setShowGroupedRestaurantResourcesModal(false);
      openReassignResourcesModal();
    },
    [fetchAllRestaurantBoxes, openReassignResourcesModal, selectedGroup],
  );

  const handleFooterBulkReassign = useCallback((ids: Array<string | number>) => {
    const normalizedIds = Array.from(
      new Set(
        ids
          .filter((id) => id !== undefined && id !== null && id !== "")
          .map((id) => String(id)),
      ),
    );

    if (normalizedIds.length === 0) {
      showError("No boxes selected for reassignment");
      return;
    }

    setReassignMode("boxes");
    setSelectedReassignBoxIds(normalizedIds);
    openReassignResourcesModal();
  }, [openReassignResourcesModal]);

  const openDeleteRestaurantFlow = useCallback(
    (group: GrubPacItem | null) => {
      if (!group) return;

      const restaurantId = group.restaurantIds?.[0];
      if (!restaurantId) {
        showError("Unable to resolve restaurant for deletion.");
        return;
      }

      setDeleteSourceRestaurant({
        id: restaurantId,
        name: String(group.name ?? "Restaurant"),
        address: String(group.location ?? group.restaurantAddress ?? ""),
        manager: null,
        drivers:
          typeof group.resourceEmployeeCount === "number" ? group.resourceEmployeeCount : 0,
        boxes: typeof group.resourceBoxCount === "number" ? group.resourceBoxCount : 0,
        updated: group.added ?? "-",
        status: (group.restaurantStatus?.toLowerCase() === "suspended" ? "suspended" : "active") as
          | "active"
          | "suspended",
      });

      setDeleteRestaurantModalOpen(true);
      closeModal("groupModal");
    },
    [closeModal],
  );

  const handleDeleteRestaurantConfirm = useCallback(async () => {
    if (!deleteSourceRestaurant) return;

    setDeleteRestaurantLoading(true);
    try {
      const response = await foodService.deleteRestaurants({
        ids: [deleteSourceRestaurant.id],
        destination_restaurant_id: null,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to delete restaurant");
      }

      showSuccess("Deleted", "Restaurant deleted successfully.");
      setDeleteRestaurantModalOpen(false);
      setManageResourcesDeleteModalOpen(false);
      setDeleteSourceRestaurant(null);
      await refetchGrubPacs?.();
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Failed to delete restaurant");
    } finally {
      setDeleteRestaurantLoading(false);
    }
  }, [deleteSourceRestaurant, refetchGrubPacs]);

  const handleDeleteManageResources = useCallback(() => {
    setDeleteRestaurantModalOpen(false);
    setManageResourcesDeleteModalOpen(true);
  }, []);

  const handleManageResourcesDeleteConfirm = useCallback(
    async (action: DeleteResourceAction) => {
      if (!deleteSourceRestaurant) return;

      if (action === "reassign") {
        setManageResourcesDeleteModalOpen(false);
        setReassignMode("restaurantDelete");
        openReassignResourcesModal();
        return;
      }

      await handleDeleteRestaurantConfirm();
    },
    [deleteSourceRestaurant, handleDeleteRestaurantConfirm, openReassignResourcesModal],
  );

  const handleEditRestaurantFromGroup = useCallback(async () => {
    if (!selectedGroup) return;

    setRestaurantEditLoading(true);
    try {
      const restaurant = await fetchRestaurantForGroupEdit(selectedGroup);
      if (!restaurant) {
        showError("Could not load restaurant details for editing.");
        return;
      }

      setEditingRestaurantData(restaurant);
      setEditRestaurantModalOpen(true);
      closeModal("groupModal");
    } catch {
      showError("Could not load restaurant details for editing.");
    } finally {
      setRestaurantEditLoading(false);
    }
  }, [closeModal, fetchRestaurantForGroupEdit, selectedGroup]);

  const handleEditRestaurantSubmit = useCallback(
    async (data: RestaurantFormData) => {
      if (!editingRestaurantData) return;

      setRestaurantEditLoading(true);
      try {
        const response = await foodService.updateRestaurant({
          id: editingRestaurantData.id,
          name: data.name,
          state: data.state || "",
          city: data.city || "",
          pincode: data.pincode || "",
          line_one: data.line1 || "",
          line_two: data.line2 || "",
          latitude: data.latitude?.trim() || undefined,
          longitude: data.longitude?.trim() || undefined,
          status: data.status,
          google_place_id: data.google_place_id.trim(),
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to update restaurant details");
        }

        showSuccess(`${data.name} updated successfully!`, "Your restaurant details have been saved.");
        setEditRestaurantModalOpen(false);
        setEditingRestaurantData(null);
        await refetchGrubPacs?.();
      } catch (error: unknown) {
        showError(error instanceof Error ? error.message : "Failed to update restaurant details");
      } finally {
        setRestaurantEditLoading(false);
      }
    },
    [editingRestaurantData, refetchGrubPacs],
  );

  const handleConfirmReassignResources = useCallback(
    async (restaurant: Restaurant | null) => {
      if (!restaurant) return;
      if (reassignMode === "restaurantDelete") {
        if (!deleteSourceRestaurant) {
          showError("No restaurant selected for deletion");
          return;
        }

        setReassignSubmitting(true);
        try {
          const response = await foodService.deleteRestaurants({
            ids: [deleteSourceRestaurant.id],
            destination_restaurant_id: restaurant.id,
          });

          if (!response.success) {
            showError(response.error || "Could not delete and reassign resources.");
            return;
          }

          showSuccess("Deleted", "Restaurant deleted and resources reassigned.");
          setShowReassignResourcesModal(false);
          setDeleteSourceRestaurant(null);
          await refetchGrubPacs?.();
        } catch (error) {
          showError(
            getContextualErrorMessage(
              "assignment.resource",
              error,
              "Could not delete and reassign resources.",
            ),
          );
        } finally {
          setReassignSubmitting(false);
        }
        return;
      }

      if (selectedReassignBoxIds.length === 0) {
        showError("No boxes selected for reassignment");
        return;
      }

      setReassignSubmitting(true);
      try {
        const response = await grubpacService.reassign({
          ids: selectedReassignBoxIds,
          restaurant_id: restaurant.id,
        });

        if (!response.success) {
          showError(
            getContextualErrorMessage(
              "assignment.box",
              response,
              "Could not reassign box(es). Please try again.",
            ),
          );
          return;
        }

        showSuccess("Boxes reassigned successfully!", "");
        setShowReassignResourcesModal(false);
        setSelectedReassignBoxIds([]);
        await refetchGrubPacs?.();
      } catch (error) {
        showError(
          getContextualErrorMessage(
            "assignment.box",
            error,
            "Could not reassign box(es). Please try again.",
          ),
        );
      } finally {
        setReassignSubmitting(false);
      }
    },
    [deleteSourceRestaurant, refetchGrubPacs, reassignMode, selectedReassignBoxIds],
  );

  const groupedRestaurant = selectedGroup
    ? {
        name: String(selectedGroup.name ?? "Restaurant"),
        status: selectedGroup.restaurantStatus ?? "active",
        createdOn: selectedGroup.added ?? "-",
        address: selectedGroup.location ?? selectedGroup.restaurantAddress ?? String(selectedGroup.name ?? "-"),
        resources: [
          {
            label: "GrubPacs",
            count:
              typeof selectedGroup.resourceBoxCount === "number"
                ? selectedGroup.resourceBoxCount
                : 0,
            onViewList: () => openGroupedResourcesModal("grubpacs"),
          },
          {
            label: "employees",
            count:
              groupedRestaurantEmployeeCount !== null
                ? groupedRestaurantEmployeeCount
                : typeof selectedGroup.resourceEmployeeCount === "number"
                  ? selectedGroup.resourceEmployeeCount
                  : 0,
            onViewList: () => openGroupedResourcesModal("employees"),
          },
        ],
      }
    : null;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">GrubPacs</h1>
          {headerActions}
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-[280px]">
            <SearchInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onClear={() => setSearchTerm("")}
              placeholder="Search box"
              className="w-full"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            />
            {showSearchDropdown && !isSearching && (
              <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-lg z-50">
                {searchError ? (
                  <div className="px-4 py-3 text-sm text-red-500">Search failed. Please try again.</div>
                ) : searchSuggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">No grubpacs found</div>
                ) : (
                  searchSuggestions.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full px-4 py-3 flex flex-col items-start justify-center gap-0.5 text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-stroke-neutral)] last:border-b-0 transition-colors"
                      onMouseDown={() => {
                        handleSearchSuggestionSelect(item);
                        setIsSearchFocused(false);
                      }}
                    >
                      <div className="w-full text-base font-medium text-[#37493F]">
                        {highlightMatch(item.name, searchTerm)}
                      </div>
                      <div className="w-full text-sm text-[#7E8982]">
                        #{item.box_display_id || item.box_id || "-"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {filterActions}
        </div>

        <div>
          {isLoading || isSwitching ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : isGrouped ? (
            <GroupedView />
          ) : !hasData ? (
          <div className="px-4 pb-4">
            <p className="text-[var(--color-neutral-light)] text-sm">
              Turn on your GrubPacs to see the list here.
            </p>
          </div>
          ) : (
            <div className="space-y-4">
              <Collapse
                title="Powered on"
                open={openSection === "poweredOn"}
              onClick={() => setOpenSection(openSection === "poweredOn" ? null : "poweredOn")}
              pagination={
                openSection === "poweredOn" && filteredPoweredOnItems.length > 0
                  ? {
                      rangeText: `${poweredOnStart + 1}-${poweredOnEnd}`,
                      onPrev: () => {
                        if (isPageLoading) return;
                        if (poweredOnPagination) {
                          void refetchGroup({ name: "on" }, Math.max(1, poweredOnCurrentPage - 1));
                          return;
                        }

                        setSectionPages((prev) => ({
                          ...prev,
                          poweredOn: Math.max(1, poweredOnCurrentPage - 1),
                        }));
                      },
                      onNext: () => {
                        if (isPageLoading) return;
                        if (poweredOnPagination) {
                          void refetchGroup({ name: "on" }, Math.min(poweredOnTotalPages, poweredOnCurrentPage + 1));
                          return;
                        }

                        setSectionPages((prev) => ({
                          ...prev,
                          poweredOn: Math.min(poweredOnTotalPages, poweredOnCurrentPage + 1),
                        }));
                      },
                      disablePrev: isPageLoading || poweredOnCurrentPage <= 1,
                      disableNext: isPageLoading || poweredOnCurrentPage >= poweredOnTotalPages,
                    }
                  : undefined
              }
              >
                {openSection === "poweredOn" && (
                <div className="w-full">
                    {isPageLoading ? (
                      renderTableSkeleton()
                    ) : filteredPoweredOnItems.length > 0 ? (
                      <>
                        <GrubPacDataTable
                          data={mapGrubPacItemsToDataRows(pagedPoweredOnItems)}
                          columns={["name", "status", "power", "battery", "settings", "handler", "actions"]}
                          selectable={true}
                          selectedIds={poweredOnPageSelectedIds}
                          onSelectionChange={(ids) =>
                            setSelected((prev) => ({
                              ...prev,
                              poweredOn: [
                                ...(prev.poweredOn || []).filter((id) => !poweredOnPageIds.has(String(id))),
                                ...Array.from(ids),
                              ],
                            }))
                          }
                          onRowClick={handleRowClick}
                          onLockIconClick={handleVisitGrubLock}
                          onEditBoxDetails={handleOpenEditModal}
                          onCheckPermissions={handleOpenPermissionModal}
                          onViewSettings={handleViewSettings}
                          onSuspendBox={(row) =>
                            openModal("suspend", {
                              selectedCount: 1,
                              box: { id: row.id, code: row.identifier || row.name, name: row.name } as GrubPacItem,
                              fromRemoval: false,
                              selectedIds: [row.id],
                            })
                          }
                          onRemoveBox={(row) =>
                            openModal("boxRemoval", {
                              selected: [row.id],
                              count: 1,
                            })
                          }
                        />
                      {selected.poweredOn && selected.poweredOn.length > 0 && (
                        <GrubPacActionBar
                          selectedCount={selected.poweredOn?.length || 0}
                          isGrouped={true}
                          initialDualZone={inferInitialDualZone(selected.poweredOn || [])}
                          onClearSelection={() =>
                            setSelected((prev) => ({ ...prev, poweredOn: [] }))
                          }
                          onPower={(action) => {
                            const count = selected.poweredOn?.length || 0;
                            const settingType = action === "on" ? "TURN POWER ON" : "TURN POWER OFF";
                            openModal("applySettings", {
                              selectedCount: count,
                              settingType,
                              selectedIds: selected.poweredOn || [],
                              actionType: "power",
                              actionValue: action,
                              temperature: null,
                            });
                          }}
                          onIoniser={(action) => {
                            const count = selected.poweredOn?.length || 0;
                            const settingType = action === "on" ? "TURN IONISER ON" : "TURN IONISER OFF";
                            openModal("applySettings", {
                              selectedCount: count,
                              settingType,
                              selectedIds: selected.poweredOn || [],
                              actionType: "ioniser",
                              actionValue: action,
                              temperature: null,
                            });
                          }}
                          onTemperature={(settings: TemperatureSettings) => {
                            const count = selected.poweredOn?.length || 0;
                            const dualLabel = settings.dualZone ? "Dual mode on" : "Dual mode off";
                            const tempLabel = settings.zone1 ? `Temperature set to ${settings.zone1}°C` : "Temperature set";
                            openModal("applySettings", {
                              selectedCount: count,
                              settingType: `${dualLabel}, ${tempLabel}`,
                              selectedIds: selected.poweredOn || [],
                              actionType: "temperature",
                              actionValue: null,
                              temperature: settings,
                              tokenVariant: "neutral",
                            });
                          }}
                          onSuspendBoxes={() =>
                            openModal("suspend", {
                              selectedCount: selected.poweredOn?.length || 0,
                              fromRemoval: false,
                              selectedIds: selected.poweredOn || [],
                              box: null,
                            })
                          }
                          onReassignRestaurant={() => handleFooterBulkReassign(selected.poweredOn || [])}
                          onRemoveVehicle={handleRemoveRoom}
                          onDelete={() =>
                            handleRemoveBoxes(
                              selected.poweredOn || [],
                              selected.poweredOn?.length || 0
                            )
                          }
                        />
                      )}
                      </>
                    ) : (
                      <GrubPacEmptyState type="ungrouped-powered-on" />
                    )}
                  </div>
                )}
              </Collapse>

              <Collapse
                title="Powered off"
                open={openSection === "poweredOff"}
              onClick={() => setOpenSection(openSection === "poweredOff" ? null : "poweredOff")}
              pagination={
                openSection === "poweredOff" && filteredPoweredOffItems.length > 0
                  ? {
                      rangeText: `${poweredOffStart + 1}-${poweredOffEnd}`,
                      onPrev: () => {
                        if (isPageLoading) return;
                        if (poweredOffPagination) {
                          void refetchGroup({ name: "off" }, Math.max(1, poweredOffCurrentPage - 1));
                          return;
                        }

                        setSectionPages((prev) => ({
                          ...prev,
                          poweredOff: Math.max(1, poweredOffCurrentPage - 1),
                        }));
                      },
                      onNext: () => {
                        if (isPageLoading) return;
                        if (poweredOffPagination) {
                          void refetchGroup({ name: "off" }, Math.min(poweredOffTotalPages, poweredOffCurrentPage + 1));
                          return;
                        }

                        setSectionPages((prev) => ({
                          ...prev,
                          poweredOff: Math.min(poweredOffTotalPages, poweredOffCurrentPage + 1),
                        }));
                      },
                      disablePrev: isPageLoading || poweredOffCurrentPage <= 1,
                      disableNext: isPageLoading || poweredOffCurrentPage >= poweredOffTotalPages,
                    }
                  : undefined
              }
              >
                {openSection === "poweredOff" && (
                <div className="w-full">
                    {isPageLoading ? (
                      renderTableSkeleton()
                    ) : filteredPoweredOffItems.length > 0 ? (
                      <>
                        <GrubPacDataTable
                          data={mapGrubPacItemsToDataRows(pagedPoweredOffItems)}
                          columns={["name", "status", "power", "battery", "settings", "handler", "actions"]}
                          selectable={true}
                          selectedIds={poweredOffPageSelectedIds}
                          onSelectionChange={(ids) =>
                            setSelected((prev) => ({
                              ...prev,
                              poweredOff: [
                                ...(prev.poweredOff || []).filter((id) => !poweredOffPageIds.has(String(id))),
                                ...Array.from(ids),
                              ],
                            }))
                          }
                          onRowClick={handleRowClick}
                          onLockIconClick={handleVisitGrubLock}
                          onEditBoxDetails={handleOpenEditModal}
                          onCheckPermissions={handleOpenPermissionModal}
                          onViewSettings={handleViewSettings}
                          onSuspendBox={(row) =>
                            openModal("suspend", {
                              selectedCount: 1,
                              box: { id: row.id, code: row.identifier || row.name, name: row.name } as GrubPacItem,
                              fromRemoval: false,
                              selectedIds: [row.id],
                            })
                          }
                          onRemoveBox={(row) =>
                            openModal("boxRemoval", {
                              selected: [row.id],
                              count: 1,
                            })
                          }
                        />
                      {selected.poweredOff && selected.poweredOff.length > 0 && (
                        <GrubPacActionBar
                          selectedCount={selected.poweredOff?.length || 0}
                          isGrouped={true}
                          initialDualZone={inferInitialDualZone(selected.poweredOff || [])}
                          onClearSelection={() =>
                            setSelected((prev) => ({ ...prev, poweredOff: [] }))
                          }
                          onPower={(action) => {
                            const count = selected.poweredOff?.length || 0;
                            const settingType = action === "on" ? "TURN POWER ON" : "TURN POWER OFF";
                            openModal("applySettings", {
                              selectedCount: count,
                              settingType,
                              selectedIds: selected.poweredOff || [],
                              actionType: "power",
                              actionValue: action,
                              temperature: null,
                            });
                          }}
                          onIoniser={(action) => {
                            const count = selected.poweredOff?.length || 0;
                            const settingType = action === "on" ? "TURN IONISER ON" : "TURN IONISER OFF";
                            openModal("applySettings", {
                              selectedCount: count,
                              settingType,
                              selectedIds: selected.poweredOff || [],
                              actionType: "ioniser",
                              actionValue: action,
                              temperature: null,
                            });
                          }}
                          onTemperature={(settings: TemperatureSettings) => {
                            const count = selected.poweredOff?.length || 0;
                            const dualLabel = settings.dualZone ? "Dual mode on" : "Dual mode off";
                            const tempLabel = settings.zone1 ? `Temperature set to ${settings.zone1}°C` : "Temperature set";
                            openModal("applySettings", {
                              selectedCount: count,
                              settingType: `${dualLabel}, ${tempLabel}`,
                              selectedIds: selected.poweredOff || [],
                              actionType: "temperature",
                              actionValue: null,
                              temperature: settings,
                              tokenVariant: "neutral",
                            });
                          }}
                          onSuspendBoxes={() =>
                            openModal("suspend", {
                              selectedCount: selected.poweredOff?.length || 0,
                              fromRemoval: false,
                              selectedIds: selected.poweredOff || [],
                              box: null,
                            })
                          }
                          onReassignRestaurant={() => handleFooterBulkReassign(selected.poweredOff || [])}
                          onRemoveVehicle={handleRemoveRoom}
                          onDelete={() =>
                            handleRemoveBoxes(
                              selected.poweredOff || [],
                              selected.poweredOff?.length || 0
                            )
                          }
                        />
                      )}
                      </>
                    ) : (
                      <GrubPacEmptyState type="ungrouped-powered-off" />
                    )}
                  </div>
                )}
              </Collapse>
            </div>
          )}
        </div>

        <SuspendBoxModal
          open={modalState.suspend.open}
          onClose={() => closeModal("suspend")}
          onSuspend={suspendBoxClick}
          selectedCount={modalState.suspend.selectedCount || 1}
          boxName={modalState.suspend.box?.code || modalState.suspend.box?.name || "BOX-2456"}
          employeeName=""
        />

        <GrubPacsFilterModal
          open={modalState.filter.open}
          onClose={() => closeModal("filter")}
          initialFilters={filters}
          onApply={(appliedFilters) => {
            setFilters(appliedFilters);
            closeModal("filter");
          }}
        />
        <BoxRemovalModal
          open={modalState.boxRemoval.open}
          onClose={() => closeModal("boxRemoval")}
          selectedCount={modalState.boxRemoval.count}
          handleRemoveBoxes={handleConfirmRemoveBoxes}
          onTransferOwnership={handleTransferOwnershipRedirect}
          variant="active"
        />

        <ApplySettingsModal
          open={modalState.applySettings.open}
          onClose={() => closeModal("applySettings")}
          selectedCount={modalState.applySettings.selectedCount}
          settingType={modalState.applySettings.settingType}
          onApply={handleApplySettings}
        />

        <ReassignGroupModal
          open={modalState.reassignGroup.open}
          onClose={() => closeModal("reassignGroup")}
          onConfirm={handleReassignConfirm}
        />

        {groupedRestaurant && (
          <RestaurantDetailsModal
            open={modalState.groupModal.open}
            onClose={() => closeModal("groupModal")}
            restaurant={groupedRestaurant}
            onEdit={handleEditRestaurantFromGroup}
            onDelete={() => openDeleteRestaurantFlow(selectedGroup)}
            isLoading={restaurantEditLoading || deleteRestaurantLoading}
          />
        )}

        <AddRestaurantModal
          open={editRestaurantModalOpen}
          onClose={() => {
            setEditRestaurantModalOpen(false);
            setEditingRestaurantData(null);
          }}
          onSubmit={handleEditRestaurantSubmit}
          restaurant={editingRestaurantData}
          loading={restaurantEditLoading}
        />

        <DeleteRestaurantModal
          open={deleteRestaurantModalOpen}
          onClose={() => {
            setDeleteRestaurantModalOpen(false);
            setDeleteSourceRestaurant(null);
          }}
          onConfirm={handleDeleteRestaurantConfirm}
          onManageResources={handleDeleteManageResources}
          restaurantName={deleteSourceRestaurant?.name ?? ""}
          restaurantCount={1}
          hasAssignedResources={
            Boolean((deleteSourceRestaurant?.boxes ?? 0) > 0 || (deleteSourceRestaurant?.drivers ?? 0) > 0)
          }
          loading={deleteRestaurantLoading}
        />

        <ManageResourcesDeleteModal
          open={manageResourcesDeleteModalOpen}
          onClose={() => {
            setManageResourcesDeleteModalOpen(false);
            setDeleteSourceRestaurant(null);
          }}
          onBack={() => {
            setManageResourcesDeleteModalOpen(false);
            setDeleteRestaurantModalOpen(true);
          }}
          onConfirm={handleManageResourcesDeleteConfirm}
          restaurantName={deleteSourceRestaurant?.name ?? ""}
          restaurantCount={1}
          loading={deleteRestaurantLoading}
        />

        {selectedGroup && (
          <RestaurantResourcesModal
            open={showGroupedRestaurantResourcesModal}
            onClose={() => setShowGroupedRestaurantResourcesModal(false)}
            restaurantName={String(selectedGroup.name ?? "Restaurant")}
            tab={groupedRestaurantResourcesTab}
            grubPacs={resourceGrubPacs}
            employees={resourceEmployees}
            onReassignBoxes={handleOpenReassignResources}
            onEditList={handleOpenReassignResources}
            loading={resourcesLoading}
          />
        )}

        <ReassignResourcesModal
          open={showReassignResourcesModal}
          onClose={() => {
            setShowReassignResourcesModal(false);
            setSelectedReassignBoxIds([]);
            setReassignMode("boxes");
            setReassignRestaurants([]);
            setReassignTotalEntries(0);
            if (reassignMode === "restaurantDelete") {
              setDeleteSourceRestaurant(null);
            }
          }}
          onConfirm={handleConfirmReassignResources}
          onFetchRestaurants={handleFetchReassignRestaurants}
          totalEntries={reassignTotalEntries}
          restaurants={reassignRestaurants}
          loading={reassignRestaurantsLoading || reassignSubmitting}
          sourceRestaurantName={
            reassignMode === "restaurantDelete"
              ? String(deleteSourceRestaurant?.name ?? "Restaurant")
              : String(selectedGroup?.name ?? "Restaurant")
          }
        />

      <PermissionModal
        open={openCheckPermissionsModal}
        onClose={() => {
          setOpenCheckPermissionsModal(false);
          setPermissionsGrubPac(null);
        }}
        onEdit={handleEditFromPermissionsModal}
        accessMode={permissionsGrubPac?.accessMode ?? "public"}
        grubpacId={permissionsGrubPac ? String(permissionsGrubPac.id) : undefined}
        excludedCount={
          permissionsGrubPac?.permissionsBlockedCount ??
          permissionsGrubPac?.blockedEmployeeIds?.length ??
          0
        }
      />

      <EditDetails
        open={openEditBoxModal}
        onCloseEditModalAction={() => {
          setOpenEditBoxModal(false);
          setEditingGrubPac(null);
        }}
        grubpacId={editingGrubPac ? String(editingGrubPac.id) : ""}
        initialName={editingGrubPac?.name ?? ""}
        initialBoxId={editingGrubPac?.boxId ?? ""}
        initialVehicleNumber={editingGrubPac?.code ?? ""}
        initialRestaurantIds={editingGrubPac?.restaurantIds ?? []}
        initialAccessMode={editingGrubPac?.accessMode}
        initialBlockedEmployeeIds={editingGrubPac?.blockedEmployeeIds ?? []}
        initialBlockedCount={editingGrubPac?.permissionsBlockedCount}
        onUpdatedAction={refetchGrubPacs}
      />
      </div>
  );
}
