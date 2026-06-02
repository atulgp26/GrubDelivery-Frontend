"use client";

import { useCallback, useState } from "react";
import { GroupDataTable, type GroupRow, type GroupColumnId } from "@/components/ui/restaurant-data-table";
import { flattenWrappedGroupRecord, getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import RestaurantModals from "./RestaurantModals";
import { useRestaurantModals } from "../hooks/useRestaurantModals";
import type { RestaurantGroup } from "@/types";
import type { Restaurant } from "@/types/domain/restaurants";
import foodService from "@/services/food";
import employeeService from "@/services/employees";
import grubpacService from "@/services/grubpacs";
import { showError, showSuccess } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";
import type { FilterState } from "@/components/features/shared/filter/BoxFilterModal";
import {
  apiEmployeeToEmployee,
  isBoxesGroupedResponse,
  isRestaurantsGroupedResponse,
  type ApiEmployee,
  type EmployeeListData,
} from "@/types/domain/employees";
import type { ApiGrubPac, GrubPacListData } from "@/types/domain/grubpacs";
import type { Manager } from "../modals/AssignManagerModal";
import type {
  Employee as ResourceEmployee,
  GrubPac as ResourceGrubPac,
} from "../modals/RestaurantResourcesModal";

interface RestaurantGroupTableProps {
  group: RestaurantGroup;
  onRowSelect?: (id: string, selected: boolean) => void;
  selectedIds?: Set<string>;
  onRowClick?: (restaurant: Restaurant) => void;
  onEdit?: (restaurant: Restaurant) => void;
  onDelete?: (restaurant: Restaurant) => void;
  onSuspendRestaurant?: (restaurant: Restaurant) => void;
  onReassignResources?: (restaurant: Restaurant, boxIds?: string[]) => void;
  onRefresh?: () => Promise<void>;
  resourceRefreshToken?: number;
}

const COLUMNS: GroupColumnId[] = [
  "name",
  "address", 
  "manager",
  "drivers",
  "boxes",
  "updated",
  "actions"
];

function extractGrubPacs(data: GrubPacListData): ApiGrubPac[] {
  if (typeof data !== "object" || data === null) return [];

  if ("boxes" in data && Array.isArray((data as { boxes?: unknown }).boxes)) {
    return (data as { boxes: ApiGrubPac[] }).boxes;
  }

  if (
    "groups" in data &&
    data.groups &&
    typeof data.groups === "object" &&
    !Array.isArray(data.groups)
  ) {
    return flattenWrappedGroupRecord<ApiGrubPac>(data.groups as Record<string, unknown>);
  }

  return [];
}

export default function RestaurantGroupTable({ 
  group, 
  onRowSelect,
  selectedIds = new Set(),
  onRowClick,
  onEdit,
  onDelete,
  onSuspendRestaurant,
  onReassignResources,
  onRefresh,
  resourceRefreshToken = 0,
}: RestaurantGroupTableProps) {
  const {
    modalState,
    openDetailsModal,
    closeDetailsModal,
    openAssignManagerModal,
    closeAssignManagerModal,
    openResourcesModal,
    closeResourcesModal,
    closeAllModals,
  } = useRestaurantModals();

  const [assignManagerManagers, setAssignManagerManagers] = useState<Manager[]>([]);
  const [assignManagerTotalCount, setAssignManagerTotalCount] = useState(0);
  const [assignManagerLoading, setAssignManagerLoading] = useState(false);
  const [resourceEmployees, setResourceEmployees] = useState<ResourceEmployee[]>([]);
  const [resourceEmployeeTotalEntries, setResourceEmployeeTotalEntries] = useState(0);
  const [resourceGrubPacs, setResourceGrubPacs] = useState<ResourceGrubPac[]>([]);
  const [resourceGrubPacTotalEntries, setResourceGrubPacTotalEntries] = useState(0);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  const toAssignManager = useCallback((employee: ApiEmployee): Manager => {
    const mapped = apiEmployeeToEmployee(employee);
    return {
      id: mapped.id,
      name: mapped.name,
      employeeId: mapped.employeeId,
      joinedDate: mapped.joinedDate,
      phone: mapped.phone,
      email: mapped.email,
      added: mapped.added,
    };
  }, []);

  const flattenManagerResponse = useCallback((data: EmployeeListData): Manager[] => {
    let employees: ApiEmployee[] = [];

    if (isRestaurantsGroupedResponse(data)) {
      // Manager assignment modal should only show truly unassigned managers.
      const unassignedGroup = Object.entries(data.groups).find(
        ([key]) => key.toLowerCase() === "unassigned",
      )?.[1];
      employees = getWrappedGroupArray<ApiEmployee>(unassignedGroup);
    } else if (isBoxesGroupedResponse(data)) {
      employees = getWrappedGroupArray<ApiEmployee>(data.groups.managers);
    } else {
      employees = data.employees ?? [];
    }

    const uniqueManagerMap = new Map<string, Manager>();
    employees
      .filter((employee) => employee.role === "manager")
      .forEach((employee) => {
        uniqueManagerMap.set(employee.id, toAssignManager(employee));
      });

    return Array.from(uniqueManagerMap.values());
  }, [toAssignManager]);

  const fetchUnassignedManagers = useCallback(async (query = "", page = 1) => {
    setAssignManagerLoading(true);
    try {
      const response = await employeeService.getList({
        role: "manager",
        status: "unassigned",
        query: query.trim() || undefined,
        limit: 50,
        page,
      });

      if (response.success && response.data) {
        setAssignManagerManagers(flattenManagerResponse(response.data));
        setAssignManagerTotalCount(
          typeof (response.data as { count?: unknown }).count === "number"
            ? ((response.data as { count: number }).count)
            : 0,
        );
      } else {
        setAssignManagerManagers([]);
        setAssignManagerTotalCount(0);
        console.error("[RestaurantGroupTable] Failed to fetch unassigned managers", response.error);
      }
    } catch (error) {
      setAssignManagerManagers([]);
      setAssignManagerTotalCount(0);
      console.error("[RestaurantGroupTable] Unexpected error while fetching unassigned managers", error);
    } finally {
      setAssignManagerLoading(false);
    }
  }, [flattenManagerResponse]);

  const handleSearchManagers = useCallback(
    (query: string, page: number) => {
      void fetchUnassignedManagers(query, page);
    },
    [fetchUnassignedManagers],
  );

  const toResourceEmployee = useCallback((employee: ApiEmployee): ResourceEmployee => {
    const mapped = apiEmployeeToEmployee(employee);
    return {
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
    };
  }, []);

  const fetchResourceEmployees = useCallback(
    async (restaurantId: string, query = "", page = 1, withLoading = true, availableDriversOnly = false, roles?: string[]) => {
      if (withLoading) setResourcesLoading(true);
      try {
        const apiRoles = (roles && roles.length > 0)
          ? roles.map(r => r === "driver" ? "delivery" : r)
          : ["manager", "delivery"];

        const employeesResponse = await employeeService.getList({
          role: apiRoles as any,
          // status: availableDriversOnly ? "unassigned" : "active",
          status: availableDriversOnly ? "unassigned" : undefined,
          restaurant_id: availableDriversOnly ? undefined : (restaurantId || undefined),
          limit: 50,
          page,
          query: query.trim() || undefined,
        });

        if (employeesResponse.success && employeesResponse.data) {
          const employeeData = employeesResponse.data;
          let employees: ApiEmployee[] = [];

          if (isRestaurantsGroupedResponse(employeeData)) {
            employees = flattenWrappedGroupRecord<ApiEmployee>(
              employeeData.groups as Record<string, unknown>,
            );
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
            uniqueEmployees.set(employee.id, toResourceEmployee(employee));
          });
          setResourceEmployees(Array.from(uniqueEmployees.values()));

          const totalFromEnvelopePagination =
            typeof employeesResponse.pagination?.total_count === "number"
              ? employeesResponse.pagination.total_count
              : undefined;
          const totalFromDataCount =
            typeof (employeeData as { count?: unknown }).count === "number"
              ? ((employeeData as { count: number }).count)
              : undefined;

          setResourceEmployeeTotalEntries(
            totalFromEnvelopePagination ?? totalFromDataCount ?? employees.length,
          );
        } else {
          setResourceEmployees([]);
          setResourceEmployeeTotalEntries(0);
          console.error(
            "[RestaurantGroupTable] Failed to fetch employees for resources modal",
            employeesResponse.error,
          );
        }
      } catch (error) {
        setResourceEmployees([]);
        setResourceEmployeeTotalEntries(0);
        console.error("[RestaurantGroupTable] Unexpected error while fetching modal employees", error);
      } finally {
        if (withLoading) setResourcesLoading(false);
      }
    },
    [toResourceEmployee],
  );

  const fetchRestaurantResources = useCallback(
    async () => {
      setResourceEmployees([]);
      setResourceEmployeeTotalEntries(0);
      setResourceGrubPacs([]);
      setResourceGrubPacTotalEntries(0);
    },
    [],
  );

  const fetchResourceGrubPacs = useCallback(
    async (
      restaurantId: string,
      page = 1,
      query = "",
      showOfflineBoxes = true,
      filters?: FilterState,
      withLoading = true,
    ) => {
      if (withLoading) setResourcesLoading(true);

      try {
        const apiParams: {
          power_status?: "on" | "off" | "unknown";
          connection_status?: "connected" | "disconnected";
          health_status?: "critical" | "healthy" | "attention";
          grublock_status?: "locked" | "unlocked" | "not_available";
          restaurant_assigned?: "on";
          vehicle_assigned?: "on";
          ioniser_status?: "on";
          dual_zone_status?: "on";
          zone1_min?: number;
          zone1_max?: number;
          zone2_min?: number;
          zone2_max?: number;
        } = {};

        const power = filters?.power ?? [];
        if (power.length === 1) {
          const value = power[0];
          if (value === "Powered on") apiParams.power_status = "on";
          else if (value === "Powered off") apiParams.power_status = "off";
          else if (value === "Unknown") apiParams.power_status = "unknown";
        }

        const connection = filters?.connection ?? [];
        if (connection.length === 1) {
          const value = connection[0];
          if (value === "Connected") apiParams.connection_status = "connected";
          else if (value === "Disconnected") apiParams.connection_status = "disconnected";
        }

        const health = filters?.health ?? [];
        if (health.length === 1) {
          const value = health[0];
          if (value === "Critical") apiParams.health_status = "critical";
          else if (value === "Healthy") apiParams.health_status = "healthy";
          else if (value === "Needs attention") apiParams.health_status = "attention";
        }

        const grublockStatus = filters?.grubLockStatus ?? [];
        if (grublockStatus.length === 1) {
          const value = grublockStatus[0];
          if (value === "Locked") apiParams.grublock_status = "locked";
          else if (value === "Unlocked") apiParams.grublock_status = "unlocked";
          else if (value === "No lock available") apiParams.grublock_status = "not_available";
        }

        if (filters?.restaurantAssigned) apiParams.restaurant_assigned = "on";
        if (filters?.vehicleAssigned) apiParams.vehicle_assigned = "on";
        if (filters?.ioniserOn) apiParams.ioniser_status = "on";
        if (filters?.dualZoneOn) apiParams.dual_zone_status = "on";

        if (filters && filters.zone1Min !== -20) apiParams.zone1_min = filters.zone1Min;
        if (filters && filters.zone1Max !== 30) apiParams.zone1_max = filters.zone1Max;
        if (filters && filters.zone2Min !== -20) apiParams.zone2_min = filters.zone2Min;
        if (filters && filters.zone2Max !== 30) apiParams.zone2_max = filters.zone2Max;

        const fallbackPowerStatus = showOfflineBoxes ? undefined : "on";

        const response = await grubpacService.getList({
          restaurant_id: restaurantId,
          limit: 50,
          page,
          query: query.trim() || undefined,
          power_status: apiParams.power_status ?? fallbackPowerStatus,
          connection_status: apiParams.connection_status,
          health_status: apiParams.health_status,
          grublock_status: apiParams.grublock_status,
          restaurant_assigned: apiParams.restaurant_assigned,
          vehicle_assigned: apiParams.vehicle_assigned,
          ioniser_status: apiParams.ioniser_status,
          dual_zone_status: apiParams.dual_zone_status,
          zone1_min: apiParams.zone1_min,
          zone1_max: apiParams.zone1_max,
          zone2_min: apiParams.zone2_min,
          zone2_max: apiParams.zone2_max,
        });

        if (response.success && response.data) {
          const data = response.data as GrubPacListData & {
            count?: unknown;
          };
          const boxes = extractGrubPacs(data);

          const mappedBoxes: ResourceGrubPac[] = boxes.map((box) => {
            const restaurantName = box.restaurant_boxes?.[0]?.restaurant?.name;
            const detailsParts = [box.box_id, box.vehicle_number, restaurantName].filter(Boolean);
            const normalizedPowerStatus = (box.power_status ?? "").toLowerCase();

            return {
              id: box.id,
              name: box.name,
              details: detailsParts.join(" | "),
              power:
                normalizedPowerStatus === "on"
                  ? "on"
                  : normalizedPowerStatus === "off"
                    ? "off"
                    : "warning",
              driver: undefined,
              added: new Date(box.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              }),
              isLocked: box.lock?.lock_status === "locked",
              isOffline: normalizedPowerStatus === "off",
            };
          });

          setResourceGrubPacs(mappedBoxes);
          const totalFromPagination =
            typeof response.pagination?.total_count === "number"
              ? response.pagination.total_count
              : undefined;
          const totalFromCount = typeof data.count === "number" ? data.count : undefined;

          setResourceGrubPacTotalEntries(
            totalFromPagination ?? totalFromCount ?? mappedBoxes.length,
          );
        } else {
          setResourceGrubPacs([]);
          setResourceGrubPacTotalEntries(0);
          console.error(
            "[RestaurantGroupTable] Failed to fetch grubpacs for resources modal",
            response.error,
          );
        }
      } catch (error) {
        setResourceGrubPacs([]);
        setResourceGrubPacTotalEntries(0);
        console.error("[RestaurantGroupTable] Unexpected error while fetching modal grubpacs", error);
      } finally {
        if (withLoading) setResourcesLoading(false);
      }
    },
    [],
  );

  const handleFetchResourceEmployees = useCallback(
    (query: string, page: number, availableDriversOnly?: boolean, roles?: string[]) => {
      const restaurantId = modalState.selectedRestaurant?.id ?? "";
      void fetchResourceEmployees(restaurantId, query, page, true, availableDriversOnly ?? false, roles);
    },
    [fetchResourceEmployees, modalState.selectedRestaurant],
  );

  const handleFetchResourceGrubPacs = useCallback(
    (params: { page: number; query: string; showOfflineBoxes: boolean; filters: FilterState }) => {
      if (!modalState.selectedRestaurant) return;
      void fetchResourceGrubPacs(
        modalState.selectedRestaurant.id,
        params.page,
        params.query,
        params.showOfflineBoxes,
        params.filters,
        true,
      );
    },
    [fetchResourceGrubPacs, modalState.selectedRestaurant],
  );

  // Transform Restaurant data to GroupRow format
  const restaurantRows: GroupRow[] = (group.items ?? []).map((restaurant) => {
    const truncatedName = restaurant.name.length > 25 ? restaurant.name.slice(0, 25) + "..." : restaurant.name;

    return {
      id: restaurant.id,
      name: truncatedName,
      address: restaurant.address,
      manager: restaurant.manager || undefined,
      driverCount: restaurant.drivers,
      boxCount: restaurant.boxes,
      updated: restaurant.updated,
      hasBoxes: restaurant.boxes > 0,
    };
  });

  const handleRowSelection = (newSelectedIds: Set<string>) => {
    // Find what changed between the old and new selection
    const allItems = group.items ?? [];
    allItems.forEach((item) => {
      const isNowSelected = newSelectedIds.has(item.id);
      const wasSelected = selectedIds.has(item.id);
      if (isNowSelected !== wasSelected) {
        onRowSelect?.(item.id, isNowSelected);
      }
    });
  };

  const handleEditGroup = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant && onEdit) {
      onEdit(restaurant);
      closeAllModals();
    } else if (restaurant) {
      openDetailsModal(restaurant);
    }
  };

  const handleDeleteGroup = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant && onDelete) {
      onDelete(restaurant);
      closeAllModals();
    }
  };

  const handleSuspendRestaurant = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant && onSuspendRestaurant) {
      onSuspendRestaurant(restaurant);
    }
  };

  const handleReassignResources = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant && onReassignResources) {
      onReassignResources(restaurant);
    }
  };

  const handleViewDetails = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    
    if (restaurant) {
      if (onRowClick) {
        onRowClick(restaurant);
      } else {
        openDetailsModal(restaurant);
      }
    }
  };

  const handleViewGrubPacs = () => {
    if (modalState.selectedRestaurant) {
      openResourcesModal(modalState.selectedRestaurant, "grubpacs");
      void fetchRestaurantResources();
    }
  };

  const handleAssignManagerConfirm = async (manager: Manager, restaurant: Restaurant) => {
    try {
      const response = await foodService.assignEmployees({
        id: restaurant.id,
        employee_ids: [manager.id],
        role: "manager"
      });
      if (response.success) {
        showSuccess("Assigned", `Manager ${manager.name} assigned to ${restaurant.name} successfully.`);
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        showError(
          getContextualErrorMessage(
            "assignment.manager",
            response,
            "Could not assign manager. Please try again.",
          ),
        );
      }
    } catch (error) {
      showError(
        getContextualErrorMessage(
          "assignment.manager",
          error,
          "Could not assign manager. Please try again.",
        ),
      );
    }
  };

  const handleViewEmployees = () => {
    if (modalState.selectedRestaurant) {
      openResourcesModal(modalState.selectedRestaurant, "employees");
      void fetchRestaurantResources();
    }
  };

  const handleAddManager = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant) {
      setAssignManagerManagers([]);
      setAssignManagerTotalCount(0);
      openAssignManagerModal(restaurant);
      void fetchUnassignedManagers("", 1);
    }
  };

  const handleViewManagerDetail = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant) {
      openResourcesModal(restaurant, "employees", ["manager"]);
      void fetchRestaurantResources();
    }
  };

  const handleAssignDrivers = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant) {
      openResourcesModal(restaurant, "employees", ["driver"], true);
      void fetchRestaurantResources();
    }
  };

  const handleViewDriversList = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant) {
      openResourcesModal(restaurant, "employees", ["driver"]);
      void fetchRestaurantResources();
    }
  };

  const handleAssignBoxes = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant) {
      openResourcesModal(restaurant, "grubpacs");
      void fetchRestaurantResources();
    }
  };

  const handleViewBoxesList = (row: GroupRow) => {
    const restaurant = group.items?.find(item => item.id === row.id);
    if (restaurant) {
      openResourcesModal(restaurant, "grubpacs");
      void fetchRestaurantResources();
    }
  };

  return (
    <div className="bg-white">
      <GroupDataTable
        data={restaurantRows}
        columns={COLUMNS}
        selectedIds={selectedIds}
        onSelectionChange={handleRowSelection}
        onEditGroup={handleEditGroup}
        onViewDetails={handleViewDetails}
        onDeleteGroup={handleDeleteGroup}
        onSuspendRestaurant={handleSuspendRestaurant}
        onReassignResources={handleReassignResources}
        onRowClick={handleViewDetails}
        onAddManager={handleAddManager}
        onViewManagerDetail={handleViewManagerDetail}
        onAssignDrivers={handleAssignDrivers}
        onViewDriversList={handleViewDriversList}
        onAssignBoxes={handleAssignBoxes}
        onViewBoxesList={handleViewBoxesList}
      />

      <RestaurantModals
        modalState={modalState}
        onCloseDetails={closeDetailsModal}
        onCloseAssignManager={closeAssignManagerModal}
        onCloseResources={closeResourcesModal}
        onFetchResourceEmployees={handleFetchResourceEmployees}
        onFetchResourceGrubPacs={handleFetchResourceGrubPacs}
        resourceRefreshToken={resourceRefreshToken}
        resourceEmployeeTotalEntries={resourceEmployeeTotalEntries}
        resourceGrubPacTotalEntries={resourceGrubPacTotalEntries}
        onSearchManagers={handleSearchManagers}
        assignManagerTotalCount={assignManagerTotalCount}
        assignManagerManagers={assignManagerManagers}
        assignManagerLoading={assignManagerLoading}
        resourceEmployees={resourceEmployees}
        resourceGrubPacs={resourceGrubPacs}
        resourcesLoading={resourcesLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewGrubPacs={handleViewGrubPacs}
        onViewEmployees={handleViewEmployees}
        onAssignManager={handleAssignManagerConfirm}
        onReassignBoxes={() => {
          if (modalState.selectedRestaurant && onReassignResources) {
            onReassignResources(modalState.selectedRestaurant);
          }
        }}
        onEditList={(boxIds) => {
          if (modalState.selectedRestaurant && onReassignResources) {
            onReassignResources(modalState.selectedRestaurant, boxIds);
          }
        }}
      />
    </div>
  );
}
