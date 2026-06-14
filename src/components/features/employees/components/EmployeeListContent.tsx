"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { flattenWrappedGroupRecord, getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import GroupCollapseTable from "@/components/ui/GroupCollapseTable";
import EmployeeGroupTable from "./EmployeeGroupTable";
import EmployeeListHeader from "./EmployeeListHeader";
import EmployeeToolbar from "./EmployeeToolbar";
import TableActionBar from "@/components/ui/TableActionBar";
import EmployeeModals from "./EmployeeModals";
import SuspendEmployeeModal from "../modals/SuspendEmployeeModal";
import DeleteEmployeeModal from "../modals/DeleteEmployeeModal";
import ReassignEmployeeModal from "../modals/ReassignEmployeeModal";
import EmployeeBoxesModal from "../modals/EmployeeBoxesModal";
import RestaurantResourcesModal, {
  type Employee as ResourceEmployee,
  type GrubPac as ResourceGrubPac,
} from "@/components/features/restaurants/modals/RestaurantResourcesModal";
import DeleteRestaurantModal from "@/components/features/restaurants/modals/DeleteRestaurantModal";
import ManageResourcesDeleteModal, {
  type DeleteResourceAction,
} from "@/components/features/restaurants/modals/ManageResourcesDeleteModal";
import SuspendRestaurantModal, {
  type ResourceAction,
} from "@/components/features/restaurants/modals/SuspendRestaurantModal";
import ReassignResourcesModal from "@/components/features/restaurants/modals/ReassignResourcesModal";
import { useEmployeeModals } from "../hooks/useEmployeeModals";
import { formatDate } from "@/lib/utils/date";
import { useEmployeeTableFilters } from "../hooks/useEmployeeTableFilters";
import { useEmployeeTableState } from "../hooks/useEmployeeTableState";
import { useEmployeeActions } from "../hooks/useEmployeeActions";
import { useEmployeeSearch } from "../hooks/useEmployeeSearch";
import foodService from "@/services/food";
import employeeService from "@/services/employees";
import grubpacService from "@/services/grubpacs";
import { showError, showSuccess } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";
import {
  apiEmployeeToEmployee,
  isBoxesGroupedResponse,
  isRestaurantsGroupedResponse,
  type ApiEmployee,
  type EmployeeListData,
} from "@/types/domain/employees";
import type { ApiGrubPac, GrubPacListData } from "@/types/domain/grubpacs";
import type { Restaurant } from "@/types/domain/restaurants";
import type { RestaurantData } from "@/types/domain/restaurants";
import type { EmployeeGroup } from "@/types";
import type { Employee, DropdownRestaurant } from "@/types/domain/employees";
import type { ActionResult } from "../hooks/useEmployeeData";
import type { ReassignRestaurant } from "../types";

interface EmployeeListContentProps {
  groups: EmployeeGroup[];
  isLoading?: boolean;
  onAddEmployee: () => void;
  onEditEmployee?: (employee: Employee) => void;
  onViewSuspended?: () => void;
  onSuspendEmployees?: (ids: string[]) => Promise<ActionResult>;
  onDeleteEmployees?: (ids: string[]) => Promise<ActionResult>;
  onReassignEmployees?: (ids: string[], restaurantId: string | null) => Promise<ActionResult>;
  restaurants?: DropdownRestaurant[];
  pageSize?: number;
  className?: string;
  onGroupByChange?: (groupBy: "boxes" | "restaurants") => void;
  onRolesChange?: (roles: Array<"manager" | "delivery">) => void;
  onPageChange?: (group: EmployeeGroup, page: number) => void;
  totalEntries?: number;
    onRefetch?: () => void;
}

export default function EmployeeListContent({
  groups,
  isLoading = false,
  onAddEmployee,
  onEditEmployee,
  onViewSuspended,
  onSuspendEmployees,
  onDeleteEmployees,
  onReassignEmployees,
  restaurants,
  pageSize = 50,
  className,
  onGroupByChange,
  onRefetch,
  onRolesChange,
  onPageChange,
  totalEntries: totalCountProp = 0,
}: EmployeeListContentProps) {
  const router = useRouter();

  const [selectedGroupedRestaurant, setSelectedGroupedRestaurant] = useState<Restaurant | null>(null);
  const [boxesModalSource, setBoxesModalSource] = useState<"employee" | "restaurant">("employee");
  const [showGroupedRestaurantResourcesModal, setShowGroupedRestaurantResourcesModal] = useState(false);
  const [groupedRestaurantResourcesTab, setGroupedRestaurantResourcesTab] = useState<"grubpacs" | "employees">("grubpacs");
  const [resourceEmployees, setResourceEmployees] = useState<ResourceEmployee[]>([]);
  const [resourceGrubPacs, setResourceGrubPacs] = useState<ResourceGrubPac[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
const [showSharedBoxesModal, setShowSharedBoxesModal] = useState(false);
const [sharedBoxesEmployee, setSharedBoxesEmployee] = useState<Employee | null>(null);
  const [showGroupedDeleteModal, setShowGroupedDeleteModal] = useState(false);
  const [showGroupedManageResourcesDeleteModal, setShowGroupedManageResourcesDeleteModal] = useState(false);
  const [showGroupedSuspendModal, setShowGroupedSuspendModal] = useState(false);
  const [showGroupedReassignModal, setShowGroupedReassignModal] = useState(false);
  const [groupedReassignFlowType, setGroupedReassignFlowType] = useState<"suspend" | "delete" | "standalone" | "boxes">("standalone");
  const [groupedSelectedBoxIds, setGroupedSelectedBoxIds] = useState<string[]>([]);
  const [groupedIsSuspending, setGroupedIsSuspending] = useState(false);
  const [groupedDeleteLoading, setGroupedDeleteLoading] = useState(false);
  const [groupedIsReassigning, setGroupedIsReassigning] = useState(false);

  const {
    openIndex,
    searchTerm,
    selectedIds,
    isGrouped,
    selectedRoles,
    showAvailableDriversOnly,
    setOpenIndex,
    setSearchTerm,
    clearSearch,
    handleRowSelect,
    clearSelection,
    setIsGrouped,
    setSelectedRoles,
    setShowAvailableDriversOnly,
  } = useEmployeeTableState();

  const {
    modalState,
    openGroupDetailsModal,
    closeGroupDetailsModal,
    openDetailsModal,
    closeDetailsModal,
    openResourcesModal,
    closeResourcesModal,
  } = useEmployeeModals();

  const {
    showSuspendModal,
    showDeleteModal,
    showReassignModal,
    actionMenuEmployee,
    reassignSourceEmployees,
    openSuspendModal,
    closeSuspendModal,
    openDeleteModal,
    closeDeleteModal,
    openReassignModal,
    closeReassignModal,
    setSelectedRestaurant,
  } = useEmployeeActions();

  const roleOptions = useMemo(
    () => [
      { id: "manager", label: "Manager" },
      { id: "driver", label: "Driver" },
    ],
    [],
  );
 
  const allEmployees = useMemo(() => {
    return groups.flatMap((g) => g.items ?? []);
  }, [groups]);

  const handleGroupedChange = (grouped: boolean) => {
    setIsGrouped(grouped);
    setShowAvailableDriversOnly(false);
    onGroupByChange?.(grouped ? "restaurants" : "boxes");

    // Grouped view should start with no role preselected.
    if (grouped) {
      setSelectedRoles([]);
      onRolesChange?.([]);
      return;
    }

    onRolesChange?.(mapUiRolesToApiRoles(selectedRoles, false));
  };

  const mapUiRolesToApiRoles = (
    roles: Array<string | number>,
    availableDriversOnly: boolean,
  ): Array<"manager" | "delivery"> => {
    if (availableDriversOnly) {
      return ["delivery"];
    }

    const apiRoles = roles
      .map((r) => (String(r) === "driver" ? "delivery" : String(r)))
      .filter((r): r is "manager" | "delivery" => r === "manager" || r === "delivery");

    // Empty array (or both selected) means no role filter
    return apiRoles.length >= 2 ? [] : apiRoles;
  };

  const handleRolesChange = (roles: Array<string | number>) => {
    setSelectedRoles(roles);
    if (onRolesChange) {
      onRolesChange(mapUiRolesToApiRoles(roles, showAvailableDriversOnly));
    }
  };

  const handleAvailableDriversOnlyChange = (checked: boolean) => {
    setShowAvailableDriversOnly(checked);
    if (onRolesChange) {
      onRolesChange(mapUiRolesToApiRoles(selectedRoles, checked));
    }
  };

  const { filteredGroups, totalEntries } = useEmployeeTableFilters({
    groups,
    searchTerm,
    isGrouped,
    selectedRoles,
    showAvailableDriversOnly,
  });

  const { results: searchSuggestions, isSearching, searchError } = useEmployeeSearch({
    query: searchTerm,
    limit: 50,
    status: "all",
  });

  const displayGroups = filteredGroups;
  const displayTotalEntries = totalCountProp ?? totalEntries;
  const displayLoading = isLoading;

  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignRestaurants, setReassignRestaurants] = useState<ReassignRestaurant[]>([]);
  const [reassignTotalEntries, setReassignTotalEntries] = useState(0);
  const [reassignRestaurantsLoading, setReassignRestaurantsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = useRef(false);

  const employeeById = useMemo(() => {
    const map = new Map<string, Employee>();
    allEmployees.forEach((employee) => {
      if (employee.id) map.set(employee.id, employee);
    });
    return map;
  }, [allEmployees]);

  const selectedIdsList = useMemo(() => Array.from(selectedIds), [selectedIds]);

  const selectedEmployeesStable = useMemo(() => {
    return selectedIdsList
      .map((id) => employeeById.get(id))
      .filter((employee): employee is Employee => Boolean(employee));
  }, [employeeById, selectedIdsList]);

  const selectedEmployees = useMemo(() => {
    const employees: Employee[] = [];
    for (const group of filteredGroups) {
      for (const employee of group.items ?? []) {
        if (selectedIds.has(employee.id)) {
          employees.push(employee);
        }
      }
    }
    return employees;
  }, [filteredGroups, selectedIds]);

  const handleSuspendEmployee = (employee: Employee) => {
    openSuspendModal(employee);
    closeDetailsModal();
  };

  const handleDeleteEmployee = (employee: Employee) => {
    openDeleteModal(employee);
    closeDetailsModal();
  };

  const handleViewBoxes = () => {
    if (modalState.selectedEmployee) {
      openResourcesModal(modalState.selectedEmployee, "boxes");
    }
  };

  const handleReassignRestaurant = () => {
    if (selectedEmployees.length > 0) {
      // Prime loading state to avoid empty-state flash while first page is fetched.
      setReassignRestaurants([]);
      setReassignTotalEntries(0);
      setReassignRestaurantsLoading(true);
      openReassignModal(selectedEmployees);
    }
  };

  const mapRestaurantToReassign = useCallback((restaurant: RestaurantData): ReassignRestaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.full_address,
    boxes: restaurant._count?.boxes ?? 0,
    updated: formatDate(restaurant.updated_at) || "-",
    added: "Today",
  }), []);

  const handleFetchReassignRestaurants = useCallback(async (query: string, page: number) => {
    setReassignRestaurantsLoading(true);
    try {
      const response = await foodService.getRestaurants({
        status: "active",
        query: query.trim() || undefined,
        limit: 50,
        page,
      });

      if (response.success && response.data?.restaurants) {
        const mapped = response.data.restaurants.map(mapRestaurantToReassign);
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
  }, [mapRestaurantToReassign]);

  const handleReassignConfirm = async (restaurant: ReassignRestaurant | null) => {
    if (!restaurant) {
      showError("Please select a restaurant");
      return;
    }

    if (reassignSourceEmployees.length > 0 && onReassignEmployees) {
      setIsReassigning(true);
      const ids = reassignSourceEmployees.map((e) => e.id);
      const result = await onReassignEmployees(ids, restaurant.id);
      setIsReassigning(false);

      if (!result.success) {
        return;
      }
    }
    closeReassignModal();
    clearSelection();
    setReassignRestaurants([]);
    setReassignTotalEntries(0);
  };

  const navigateToLogs = (employee: Employee) => {
    const qs = new URLSearchParams();
    qs.set("employeeId", employee.id);
    qs.set("employeeName", employee.name);
    if (employee.employeeId) qs.set("employeeCode", employee.employeeId);
    if (employee.status) qs.set("status", employee.status);
    if (employee.joinedDate) qs.set("joinedDate", employee.joinedDate);
    if (employee.phone) qs.set("phone", employee.phone);
    if (employee.email) qs.set("email", employee.email);
    if (employee.role) qs.set("role", employee.role);
    if (employee.restaurantName) qs.set("restaurantName", employee.restaurantName);
    if (typeof employee.boxCount === "number") qs.set("boxCount", String(employee.boxCount));

    router.push(`/employees/logs?${qs.toString()}`);
  };

  const handleViewLogs = (employee: Employee) => {
    navigateToLogs(employee);
  };

  const handleSuspendSelection = () => {
    if (selectedEmployees.length > 0) {
      openSuspendModal(null);
    }
  };

  const handleDeleteSelection = () => {
    if (selectedIds.size > 0) {
      openDeleteModal(null);
    }
  };

  const mapSelectedGroupRestaurant = (): Restaurant | null => {
    const firstEmployee = modalState.selectedGroup?.items?.[0];
    if (!firstEmployee?.restaurantId) return null;

    return {
      id: firstEmployee.restaurantId,
      name: firstEmployee.restaurantName ?? (typeof modalState.selectedGroup?.name === "string" ? modalState.selectedGroup.name : "Restaurant"),
      address: firstEmployee.restaurantAddress ?? "",
      manager: null,
      drivers: modalState.selectedGroup?.items?.length ?? 0,
      boxes: modalState.selectedGroup?.items?.reduce((sum, emp) => sum + (emp.boxCount || 0), 0) ?? 0,
      updated: firstEmployee.restaurantAdded ?? "-",
      status: (firstEmployee.restaurantStatus ?? "active") as Restaurant["status"],
    };
  };

  const toResourceEmployee = (employee: ApiEmployee): ResourceEmployee => {
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
  };

  const extractGrubPacs = (data: GrubPacListData): ApiGrubPac[] => {
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
  };

  const fetchAllRestaurantBoxes = async (restaurantId: string): Promise<ApiGrubPac[]> => {
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
  };

  const fetchRestaurantResources = async (restaurantId: string) => {
    setResourcesLoading(true);
    setResourceEmployees([]);
    setResourceGrubPacs([]);

    try {
      const [employeesResponse, allRestaurantBoxes] = await Promise.all([
        employeeService.getList({ query: "emp", limit: 50, restaurant_id: restaurantId }),
        fetchAllRestaurantBoxes(restaurantId),
      ]);

      if (employeesResponse.success && employeesResponse.data) {
        const employeeData = employeesResponse.data as EmployeeListData;
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
          uniqueEmployees.set(employee.id, toResourceEmployee(employee));
        });
        setResourceEmployees(Array.from(uniqueEmployees.values()));
      } else {
        setResourceEmployees([]);
      }

      const mappedBoxes: ResourceGrubPac[] = allRestaurantBoxes.map((box) => {
        const restaurantName = box.restaurant_boxes?.[0]?.restaurant?.name;
        const detailsParts = [box.box_id, box.vehicle_number, restaurantName].filter(Boolean);
        const powerStatus = (box.power_status ?? "").toLowerCase();

        return {
          id: box.id,
          name: box.name,
          details: detailsParts.join(" | "),
          power: powerStatus === "on" ? "on" : powerStatus === "off" ? "off" : "warning",
          driver: undefined,
          added: formatDate(box.created_at),
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
  };

  const handleEditGroupedRestaurant = () => {
    const firstEmployee = modalState.selectedGroup?.items?.[0];
    if (!firstEmployee?.restaurantId) return;
    router.push(`/restaurants/list?edit=${firstEmployee.restaurantId}`);
  };

  const handleViewGroupedGrubPacs = () => {
    const restaurant = mapSelectedGroupRestaurant();
    if (!restaurant) return;
    setSelectedGroupedRestaurant(restaurant);
    setGroupedRestaurantResourcesTab("grubpacs");
    setShowGroupedRestaurantResourcesModal(true);
    closeGroupDetailsModal();
    void fetchRestaurantResources(restaurant.id);
  };

  const handleViewGroupedEmployees = () => {
    const restaurant = mapSelectedGroupRestaurant();
    if (!restaurant) return;
    setSelectedGroupedRestaurant(restaurant);
    setGroupedRestaurantResourcesTab("employees");
    setShowGroupedRestaurantResourcesModal(true);
    closeGroupDetailsModal();
    void fetchRestaurantResources(restaurant.id);
  };

  const handleDeleteGroupedRestaurant = () => {
    const restaurant = mapSelectedGroupRestaurant();
    if (!restaurant) return;
    setSelectedGroupedRestaurant(restaurant);
    closeGroupDetailsModal();
    setShowGroupedDeleteModal(true);
  };

  const handleGroupedDeleteConfirm = async () => {
    if (!selectedGroupedRestaurant) return;
    setGroupedDeleteLoading(true);
    try {
      const response = await foodService.deleteRestaurants({
        ids: [selectedGroupedRestaurant.id],
        destination_restaurant_id: null,
      });
      if (response.success) {
        showSuccess("Deleted", "Restaurant deleted successfully.");
        setShowGroupedDeleteModal(false);
        setShowGroupedManageResourcesDeleteModal(false);
      } else {
        throw new Error(response.error || "Failed to delete");
      }
    } catch (error: any) {
      showError(`Failed to delete: ${error.message}`);
    } finally {
      setGroupedDeleteLoading(false);
    }
  };

  const handleGroupedManageResourcesDelete = async (action: DeleteResourceAction) => {
    if (!selectedGroupedRestaurant) return;

    if (action === "reassign") {
      setGroupedReassignFlowType("delete");
      setShowGroupedDeleteModal(false);
      setShowGroupedManageResourcesDeleteModal(false);
      setShowGroupedReassignModal(true);
      return;
    }

    await handleGroupedDeleteConfirm();
  };

  const handleGroupedSuspendConfirm = async (action: ResourceAction) => {
    if (!selectedGroupedRestaurant) return;

    if (action === "reassign") {
      setGroupedReassignFlowType("suspend");
      setShowGroupedSuspendModal(false);
      setShowGroupedReassignModal(true);
      return;
    }

    setGroupedIsSuspending(true);
    try {
      await foodService.suspendRestaurants({
        ids: [selectedGroupedRestaurant.id],
        resource_status: action === "suspend" ? "suspend" : "assign",
        destination_restaurant_id: null,
      });
      showSuccess("Suspended", "Restaurant suspended successfully.");
      setShowGroupedSuspendModal(false);
    } catch (error: any) {
      showError(`Failed to suspend: ${error.message}`);
    } finally {
      setGroupedIsSuspending(false);
    }
  };

  const handleGroupedReassignConfirm = async (targetRestaurant: Restaurant | null) => {
    if (!selectedGroupedRestaurant || !targetRestaurant) return;

    if (groupedReassignFlowType === "boxes") {
      if (groupedSelectedBoxIds.length === 0) {
        showError("No boxes selected for reassignment");
        return;
      }

      setGroupedIsReassigning(true);
      try {
        const response = await grubpacService.reassign({
          ids: groupedSelectedBoxIds,
          restaurant_id: targetRestaurant.id,
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
      } catch (error) {
        showError(
          getContextualErrorMessage(
            "assignment.box",
            error,
            "Could not reassign box(es). Please try again.",
          ),
        );
      } finally {
        setGroupedIsReassigning(false);
      }
    } else if (groupedReassignFlowType === "suspend") {
      setGroupedIsSuspending(true);
      try {
        await foodService.suspendRestaurants({
          ids: [selectedGroupedRestaurant.id],
          resource_status: "assign",
          destination_restaurant_id: targetRestaurant.id,
        });
        showSuccess("Suspended", "Restaurant suspended and resources reassigned.");
      } catch (error: any) {
        showError(`Failed to suspend: ${error.message}`);
      } finally {
        setGroupedIsSuspending(false);
      }
    } else if (groupedReassignFlowType === "delete") {
      setGroupedDeleteLoading(true);
      try {
        const response = await foodService.deleteRestaurants({
          ids: [selectedGroupedRestaurant.id],
          destination_restaurant_id: targetRestaurant.id,
        });
        if (response.success) {
          showSuccess("Deleted", "Restaurant deleted and resources reassigned.");
        } else {
          throw new Error(response.error || "Failed to delete");
        }
      } catch (error: any) {
        showError(`Failed to delete and reassign: ${error.message}`);
      } finally {
        setGroupedDeleteLoading(false);
      }
    } else {
      setGroupedIsReassigning(true);
      try {
        await foodService.reassignResource({
          restaurant_ids: [selectedGroupedRestaurant.id],
          destination_restaurant_id: targetRestaurant.id,
        });
        showSuccess("Reassigned", "Resources reassigned successfully.");
      } catch (error) {
        showError(
          getContextualErrorMessage(
            "assignment.resource",
            error,
            "Could not reassign resources. Please try again.",
          ),
        );
      } finally {
        setGroupedIsReassigning(false);
      }
    }

    setShowGroupedReassignModal(false);
    setGroupedSelectedBoxIds([]);
  };

  const handleSuspendConfirm = async () => {
    const ids = actionMenuEmployee ? [actionMenuEmployee.id] : selectedEmployees.map((e) => e.id);
    if (ids.length > 0 && onSuspendEmployees) {
      await onSuspendEmployees(ids);
    }
    closeSuspendModal();
    clearSelection();
  };

  const handleDeleteConfirm = async () => {
    if (isDeletingRef.current) return;
    const ids = actionMenuEmployee
      ? [actionMenuEmployee.id]
      : selectedIdsList.filter((id) => employeeById.has(id));
    if (ids.length > 0 && onDeleteEmployees) {
      isDeletingRef.current = true;
      setIsDeleting(true);
      try {
        await onDeleteEmployees(ids);
      } finally {
        setIsDeleting(false);
        isDeletingRef.current = false;
      }
    }
    closeDeleteModal();
    clearSelection();
  };

  const handleDeleteToSuspend = () => {
    closeDeleteModal();
    openSuspendModal(actionMenuEmployee);
  };

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="flex-shrink-0 space-y-6">
        <EmployeeListHeader onAddNew={onAddEmployee} onViewSuspended={onViewSuspended} />
        <EmployeeToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearchClear={clearSearch}
            onSuggestionSelect={(emp) => {
              setSearchTerm(emp.name);
              const groupIndex = groups.findIndex((group) =>
                (group.items || []).some((item) => item.id === emp.id)
              );
              if (groupIndex !== -1) {
                setOpenIndex(groupIndex);
              }
            }}
            totalEntries={displayTotalEntries}
            isGrouped={isGrouped}
            onGroupedChange={handleGroupedChange}
            selectedRoles={selectedRoles}
            onRolesChange={handleRolesChange}
            showAvailableDriversOnly={showAvailableDriversOnly}
            onAvailableDriversOnlyChange={handleAvailableDriversOnlyChange}
            roleOptions={roleOptions}
            searchSuggestions={searchSuggestions}
            isSearching={isSearching}
            searchError={searchError}
            showAvailableDriversFilter={true}
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pt-4">
          {displayLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : <GroupCollapseTable
            groups={displayGroups}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            isPageLoading={displayLoading}
            onGroupClick={isGrouped ? (group) => {
              if (!group.items?.length) return;
              const firstEmployee = group.items[0];
              if (!firstEmployee.restaurantId) return;
              openGroupDetailsModal(group);
            } : undefined}
            renderTable={(group) => (
              <EmployeeGroupTable 
                mode="active"
                group={group} 
                selectedIds={selectedIds}
                onRowSelect={handleRowSelect}
                onRowClick={(employee) => {
                  navigateToLogs(employee);
                }}
                onSuspend={handleSuspendEmployee}
                onDelete={handleDeleteEmployee}
                onEdit={onEditEmployee ? (employee) => {
                  onEditEmployee(employee);
                  closeDetailsModal();
                } : (employee) => {
                  openDetailsModal(employee);
                }}
                onViewLogs={handleViewLogs}
              onViewAllBoxes={(employee) => {
  setBoxesModalSource("employee");
  openResourcesModal(employee, "boxes");
}}

onViewRestaurantBoxes={(employee) => {
  setSharedBoxesEmployee(employee);
  setShowSharedBoxesModal(true);
}}
              />
            )}
            tableContainerClass="bg-white"
            noResultsMessage={searchTerm ? "No employees match your search." : "No employees found."}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />}

          <EmployeeModals
            modalState={modalState}
            onCloseDetails={closeDetailsModal}
            onCloseGroupDetails={closeGroupDetailsModal}
            onEdit={(employee) => {
              if (onEditEmployee) {
                onEditEmployee(employee);
                closeDetailsModal();
              }
            }}
            onDelete={handleDeleteEmployee}
            onSuspend={handleSuspendEmployee}
            onViewBoxes={handleViewBoxes}
            onEditGroupedRestaurant={handleEditGroupedRestaurant}
            onDeleteGroupedRestaurant={handleDeleteGroupedRestaurant}
            onViewGroupedGrubPacs={handleViewGroupedGrubPacs}
            onViewGroupedEmployees={handleViewGroupedEmployees}
          />

          {selectedGroupedRestaurant && (
            <RestaurantResourcesModal
              open={showGroupedRestaurantResourcesModal}
              onClose={() => setShowGroupedRestaurantResourcesModal(false)}
              restaurantName={selectedGroupedRestaurant.name}
              tab={groupedRestaurantResourcesTab}
              grubPacs={resourceGrubPacs}
              employees={resourceEmployees}
              onReassignBoxes={(boxIds) => {
                const ids = boxIds.length > 0 ? boxIds : resourceGrubPacs.map((box) => box.id);
                if (ids.length === 0) {
                  showError("No boxes available for reassignment");
                  return;
                }
                setGroupedSelectedBoxIds(Array.from(new Set(ids)));
                setGroupedReassignFlowType("boxes");
                setShowGroupedRestaurantResourcesModal(false);
                setShowGroupedReassignModal(true);
              }}
              onEditList={(boxIds) => {
                if (boxIds.length === 0) {
                  showError("No boxes selected for reassignment");
                  return;
                }
                setGroupedSelectedBoxIds(Array.from(new Set(boxIds)));
                setGroupedReassignFlowType("boxes");
                setShowGroupedRestaurantResourcesModal(false);
                setShowGroupedReassignModal(true);
              }}
              loading={resourcesLoading}
            />
          )}

          {selectedGroupedRestaurant && (
            <DeleteRestaurantModal
              open={showGroupedDeleteModal && !showGroupedManageResourcesDeleteModal}
              onClose={() => setShowGroupedDeleteModal(false)}
              onConfirm={handleGroupedDeleteConfirm}
              onSuspend={() => {
                setShowGroupedDeleteModal(false);
                setShowGroupedManageResourcesDeleteModal(false);
                setShowGroupedSuspendModal(true);
              }}
              onManageResources={() => {
                setShowGroupedDeleteModal(false);
                setShowGroupedManageResourcesDeleteModal(true);
              }}
              restaurantName={selectedGroupedRestaurant.name}
              restaurantCount={1}
              hasAssignedResources={(selectedGroupedRestaurant.boxes || 0) > 0 || (selectedGroupedRestaurant.drivers || 0) > 0}
              isWithoutBoxesGroup={(selectedGroupedRestaurant.boxes || 0) <= 0}
              loading={groupedDeleteLoading}
            />
          )}

          {selectedGroupedRestaurant && (
            <ManageResourcesDeleteModal
              open={showGroupedManageResourcesDeleteModal}
              onClose={() => setShowGroupedManageResourcesDeleteModal(false)}
              onBack={() => {
                setShowGroupedManageResourcesDeleteModal(false);
                setShowGroupedDeleteModal(true);
              }}
              onConfirm={handleGroupedManageResourcesDelete}
              onSuspend={() => {
                setShowGroupedManageResourcesDeleteModal(false);
                setShowGroupedSuspendModal(true);
              }}
              restaurantName={selectedGroupedRestaurant.name}
              restaurantCount={1}
              loading={groupedDeleteLoading}
            />
          )}

          {selectedGroupedRestaurant && (
            <SuspendRestaurantModal
              open={showGroupedSuspendModal}
              onClose={() => setShowGroupedSuspendModal(false)}
              onConfirm={handleGroupedSuspendConfirm}
              restaurantName={selectedGroupedRestaurant.name}
              restaurantCount={1}
              isWithoutBoxesGroup={(selectedGroupedRestaurant.boxes || 0) <= 0}
              hasAssignedResources={(selectedGroupedRestaurant.boxes || 0) > 0 || (selectedGroupedRestaurant.drivers || 0) > 0}
              loading={groupedIsSuspending}
            />
          )}

          {selectedGroupedRestaurant && (
            <ReassignResourcesModal
              open={showGroupedReassignModal}
              onClose={() => {
                setShowGroupedReassignModal(false);
                setGroupedSelectedBoxIds([]);
              }}
              onConfirm={handleGroupedReassignConfirm}
              restaurants={
                (restaurants ?? [])
                  .filter((r) => r.id !== selectedGroupedRestaurant.id)
                  .map((r) => ({
                    id: r.id,
                    name: r.name,
                    address: r.address ?? "",
                    manager: null,
                    drivers: 0,
                    boxes: r.boxes ?? 0,
                    updated: r.updated ?? "-",
                    status: "active",
                  }))
              }
              sourceRestaurantName={selectedGroupedRestaurant.name}
              loading={groupedIsReassigning}
            />
          )}

          <TableActionBar
            selectedCount={selectedIds.size}
            onClearSelection={clearSelection}
            onReassignRole={handleReassignRestaurant}
            onSuspend={handleSuspendSelection}
            onDelete={handleDeleteSelection}
            reassignLabel="RE/ASSIGN RESTAURANT"
            allowReassign={true}
            allowSuspend={true}
            allowDelete={true}
          />

          <SuspendEmployeeModal
            open={showSuspendModal}
            onClose={closeSuspendModal}
            onConfirm={handleSuspendConfirm}
            employeeName={actionMenuEmployee?.name || selectedEmployees[0]?.name || ""}
            employeeCount={actionMenuEmployee ? 1 : selectedEmployees.length}
            loading={false}
          />
          <DeleteEmployeeModal
            open={showDeleteModal}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            onSuspend={handleDeleteToSuspend}
            employeeName={actionMenuEmployee?.name || selectedEmployeesStable[0]?.name || ""}
            employeeCount={actionMenuEmployee ? 1 : selectedEmployeesStable.length}
            loading={isDeleting}
          />
          <ReassignEmployeeModal
            open={showReassignModal}
            onClose={() => {
              closeReassignModal();
              setReassignRestaurants([]);
              setReassignTotalEntries(0);
            }}
            onConfirm={handleReassignConfirm}
            restaurants={reassignRestaurants}
            totalEntries={reassignTotalEntries}
            onFetchRestaurants={handleFetchReassignRestaurants}
            sourceEmployeeName={reassignSourceEmployees[0]?.name}
            loading={isReassigning || reassignRestaurantsLoading}
          />
        {modalState.selectedEmployee && (
<EmployeeBoxesModal
  open={modalState.isResourcesModalOpen && modalState.resourcesModalTab === "boxes"}
  onClose={closeResourcesModal}
  employeeId={boxesModalSource === "employee" ? modalState.selectedEmployee.id : undefined}
  restaurantId={boxesModalSource === "restaurant" ? modalState.selectedEmployee.restaurantId : undefined}
  employeeName={modalState.selectedEmployee.name}
  onEditList={() => {}}
/>
)}

{sharedBoxesEmployee && (
  <EmployeeBoxesModal
    open={showSharedBoxesModal}
    onClose={() => {
      setShowSharedBoxesModal(false);
      setSharedBoxesEmployee(null);
    }}
    employeeId={sharedBoxesEmployee.id}
    restaurantId={undefined}
    staticBoxes={
      (sharedBoxesEmployee.sharedBoxes ?? [])
        .filter((b) => b.powerStatus === "on")
        .map((b) => ({
          id: b.id,
          name: b.name,
          details: [b.displayId, b.vehicleNumber].filter(Boolean).join(" | "),
          power: b.powerStatus === "on" ? "on" : b.powerStatus === "off" ? "off" : "warning",
          added: formatDate(b.createdAt) || "-",
          isLocked: false,
          isOffline: b.powerStatus === "off",
        }))
    }
    employeeName={sharedBoxesEmployee.name}
    onEditList={() => {}}
    onConfirmRemoval={async (removedBoxIds) => {
      // Update sharedBoxesEmployee state to remove the deleted boxes
      setSharedBoxesEmployee((prev) => {
    if (!prev) return null;
    return {
      ...prev,
      sharedBoxes: (prev.sharedBoxes ?? []).filter(
        (b) => !removedBoxIds.includes(b.id)
      ),
      boxCount: Math.max(0, (prev.boxCount ?? 0) - removedBoxIds.length), // ← update count
    };
      });

      // Close modal if no boxes left
      setSharedBoxesEmployee((prev) => {
        if (!prev || (prev.sharedBoxes ?? []).length === 0) {
          setShowSharedBoxesModal(false);
          return null;
        }
        return prev;
      });
       onRefetch?.();
    }}
  />
)}
        </div>
    </div>
  );
}

