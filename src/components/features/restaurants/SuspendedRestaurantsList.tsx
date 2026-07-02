"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GroupDataTable, type GroupRow, type GroupColumnId } from "@/components/ui/restaurant-data-table";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import Pagination from "@/components/ui/Pagination";
import RestaurantActionBar from "./components/RestaurantActionBar";
import TableActionBar from "@/components/ui/TableActionBar";
import ReactivateRestaurantsModal from "./modals/ReactivateRestaurantsModal";
import DeleteRestaurantModal from "./modals/DeleteRestaurantModal";
import ManageResourcesDeleteModal, { type DeleteResourceAction } from "./modals/ManageResourcesDeleteModal";
import ReassignResourcesModal from "./modals/ReassignResourcesModal";
import AddRestaurantModal, { type RestaurantFormData } from "./modals/AddRestaurantModal";
import RestaurantDetailsModal from "@/components/features/shared/modals/RestaurantDetailsModal";
import RestaurantFilterModal, { type ResourceFilterType } from "./modals/RestaurantFilterModal";
import type { Restaurant, RestaurantData } from "@/types/domain/restaurants";
import foodService from "@/services/food";
import { showError, showSuccess } from "@/components/ui/toast";
import { useRestaurantSearch } from "./hooks/useRestaurantSearch";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import { apiEmployeeToEmployee } from "@/types/domain/employees";
import { apiGrubPacToItem } from "@/types/domain/grubpacs";
import employeeService from "@/services/employees";
import grubpacService from "@/services/grubpacs";
import RestaurantResourcesModal from "@/components/features/restaurants/modals/RestaurantResourcesModal";
import { defaultBoxFilters } from "@/components/features/shared/filter/BoxFilterModal";

// Columns that match the Figma design: Name, Address, Added, Suspended, Actions
const SUSPENDED_COLUMNS: GroupColumnId[] = [
  "name",
  "address",
  "added",
  "suspended",
  "actions"
];

interface SuspendedRestaurantsListProps {
  className?: string;
}

function getManagerName(manager: unknown): string | undefined {
  if (!manager) return undefined;

  if (typeof manager === "string") {
    const trimmed = manager.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof manager === "object") {
    const record = manager as Record<string, unknown>;
    const fullName = typeof record.full_name === "string" ? record.full_name.trim() : "";
    if (fullName) return fullName;

    const firstName = typeof record.first_name === "string" ? record.first_name.trim() : "";
    const lastName = typeof record.last_name === "string" ? record.last_name.trim() : "";
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (combined) return combined;

    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (name) return name;
  }

  return undefined;
}

function normalizePincode(pincode: unknown): string | undefined {
  if (typeof pincode !== "string") return undefined;
  const trimmed = pincode.trim();
  if (!trimmed) return undefined;
  if (/^0+$/.test(trimmed)) return undefined;
  return trimmed;
}

function buildRestaurantAddress(data: RestaurantData): string {
  const normalizedPincode = normalizePincode(data.pincode);
  const stateAndPincode = [data.state, normalizedPincode].filter(Boolean).join(" ").trim();
  const composed = [data.line_one, data.line_two, data.city, stateAndPincode]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");

  if (composed) return composed;

  const fullAddress = typeof data.full_address === "string" ? data.full_address.trim() : "";
  if (!fullAddress) return "";

  if (!normalizedPincode) {
    return fullAddress
      .replace(/,\s*0+\b/g, "")
      .replace(/\b0+\b$/g, "")
      .replace(/,\s*,/g, ",")
      .replace(/,\s*$/g, "")
      .trim();
  }

  return fullAddress;
}

function extractEmployees(data: any): any[] {
  if (typeof data !== "object" || data === null) return [];
  if (Array.isArray(data.employees)) return data.employees;
  
  const groups = data.groups;
  if (groups && typeof groups === "object") {
    const list: any[] = [];
    Object.values(groups).forEach((g: any) => {
      if (g && Array.isArray(g.array)) {
        list.push(...g.array);
      } else if (g && Array.isArray(g.employees)) {
        list.push(...g.employees);
      } else if (Array.isArray(g)) {
        list.push(...g);
      }
    });
    return list;
  }
  return [];
}

function extractGrubPacs(data: any): any[] {
  if (typeof data !== "object" || data === null) return [];
  if (Array.isArray(data.boxes)) return data.boxes;
  
  const groups = data.groups;
  if (groups && typeof groups === "object") {
    const list: any[] = [];
    Object.values(groups).forEach((g: any) => {
      if (g && Array.isArray(g.array)) {
        list.push(...g.array);
      } else if (g && Array.isArray(g.boxes)) {
        list.push(...g.boxes);
      } else if (Array.isArray(g)) {
        list.push(...g);
      }
    });
    return list;
  }
  return [];
}

export default function SuspendedRestaurantsList({ className = "" }: SuspendedRestaurantsListProps) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<GroupRow[]>([]);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [resourcesTab, setResourcesTab] = useState<"grubpacs" | "employees">("grubpacs");
  const [resourceEmployees, setResourceEmployees] = useState<any[]>([]);
  const [resourceGrubPacs, setResourceGrubPacs] = useState<any[]>([]);
  const [resourceEmployeeTotalEntries, setResourceEmployeeTotalEntries] = useState(0);
  const [resourceGrubPacTotalEntries, setResourceGrubPacTotalEntries] = useState(0);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedResources, setSelectedResources] = useState<ResourceFilterType[]>([]);
  const [draftSelectedResources, setDraftSelectedResources] = useState<ResourceFilterType[]>([]);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [activatingRestaurantIds, setActivatingRestaurantIds] = useState<string[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isActivateAll, setIsActivateAll] = useState(false);
  const [suspendedSummary, setSuspendedSummary] = useState<{ boxes: number; managers: number; drivers: number; restaurant_count: number } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const showDropdown = isFocused && searchTerm.trim().length > 0;
  const { results: searchSuggestions, isSearching, searchError } = useRestaurantSearch({
    query: searchTerm,
    limit: 50,
    status: "suspended",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSuspendedRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await foodService.getRestaurants({
        status: "suspended",
        query: debouncedSearch,
        limit: pageSize,
        page: currentPage,
        manager: selectedResources.includes("manager") ? true : undefined,
        driver: selectedResources.includes("driver") ? true : undefined,
      });
      if (response.success && response.data?.restaurants) {
        const rawRestaurants = response.data.restaurants;
        const rows = rawRestaurants.map((r: RestaurantData) => ({
          id: r.id,
          name: r.name,
          address: buildRestaurantAddress(r),
          manager: getManagerName(r.manager),
          managerCount: r._count?.managers || 0,
          driverCount: r._count?.drivers || 0,
          boxCount: (r._count?.boxes || 0) + (r._count?.suspended_boxes || 0),
          updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
          }).replace(/ (\d{2})$/, "'$1") : "",
          suspended: r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
          }).replace(/ (\d{2})$/, "'$1") : "",
          added: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
          }).replace(/ (\d{2})$/, "'$1") : "",
          status: "suspended" as const,
          description: `(and ${(r._count?.boxes || 0) + (r._count?.suspended_boxes || 0)} boxes, ${r._count?.drivers || 0} drivers, ${r._count?.managers || 0} manager)`,
          // Add these for the details/edit modals
          city: r.city,
          state: r.state,
          pincode: r.pincode,
          line_one: r.line_one,
          line_two: r.line_two,
          latitude: r.latitude,
          longitude: r.longitude,
          google_place_id: r.google_place_id,
        }));
        setRestaurants(rows);
        setTotalEntries(
          ((response.pagination as any)?.total_count as number | undefined)
          ?? (response.data as any).total_count
          ?? response.data.count
          ?? rawRestaurants.length,
        );
      }
    } catch (error: any) {
      showError(`Failed to fetch suspended restaurants: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, pageSize, selectedResources]);

  useEffect(() => {
    fetchSuspendedRestaurants();
  }, [fetchSuspendedRestaurants]);

  useEffect(() => {
    if (showFilterModal) {
      setDraftSelectedResources(selectedResources);
    }
  }, [selectedResources, showFilterModal]);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageResourcesModal, setShowManageResourcesModal] = useState(false);
  const [deletingRestaurantIds, setDeletingRestaurantIds] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Details modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Reassign modal states
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [isDeletingWithReassign, setIsDeletingWithReassign] = useState(false);
  const [reassignRestaurants, setReassignRestaurants] = useState<Restaurant[]>([]);
  const [reassignRestaurantsLoading, setReassignRestaurantsLoading] = useState(false);
  const [reassignTotalEntries, setReassignTotalEntries] = useState(0);

  // No local filtering needed anymore as we fetch from API with query
  const filteredRestaurants = restaurants;

  // Server-side pagination
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedRestaurants = filteredRestaurants;

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedResources]);

  // Calculate totals for selected restaurants
  const selectedRestaurants = isActivateAll 
    ? restaurants 
    : restaurants.filter(restaurant => activatingRestaurantIds.includes(restaurant.id));
  const restaurantNames = selectedRestaurants.map(restaurant => restaurant.name);
  const totalResources = isActivateAll && suspendedSummary
    ? {
        boxes: suspendedSummary.boxes,
        drivers: suspendedSummary.drivers,
        managers: suspendedSummary.managers,
      }
    : selectedRestaurants.reduce(
    (acc, restaurant) => ({
      boxes: acc.boxes + (restaurant.boxCount || 0),
      drivers: acc.drivers + (restaurant.driverCount || 0),
      managers: acc.managers + (restaurant.manager ? 1 : 0),
    }),
    { boxes: 0, drivers: 0, managers: 0 }
  );

  const handleGoBack = () => {
    router.back();
  };

  const handleActivateAll = async () => {
    setIsSummaryLoading(true);
    try {
      const response = await foodService.getSuspendedSummary();
      if (response.success && response.data) {
        setSuspendedSummary(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch suspended summary", error);
    } finally {
      setIsSummaryLoading(false);
      setActivatingRestaurantIds([]);
      setIsActivateAll(true);
      setShowReactivateModal(true);
    }
  };

  const handleActivateRestaurant = (row: GroupRow) => {
    setActivatingRestaurantIds([row.id]);
    setIsActivateAll(false);
    setShowReactivateModal(true);
  };

  const handleDeleteRestaurant = (row: GroupRow) => {
    setDeletingRestaurantIds([row.id]);
    setShowDeleteModal(true);
  };

  const handleRowClick = (row: GroupRow) => {


    // On row click, open details modal
    const suspendedRestaurant = restaurants.find(r => r.id === row.id);

    if (suspendedRestaurant) {
      const restaurant: Restaurant & { suspendedOn?: string } = {
        id: suspendedRestaurant.id,
        name: suspendedRestaurant.name,
        address: suspendedRestaurant.address,
        manager: suspendedRestaurant.manager,
        drivers: suspendedRestaurant.driverCount || 0,
        boxes: suspendedRestaurant.boxCount || 0,
        updated: suspendedRestaurant.added || "",
        suspendedOn: suspendedRestaurant.suspended,
        status: "suspended",
      };
      setSelectedRestaurant(restaurant as Restaurant);
      setShowDetailsModal(true);
    }
  };

  const handleEditFromDetails = () => {
    // When clicking edit from details modal, close details and open edit
    if (selectedRestaurant) {
      setEditingRestaurant(selectedRestaurant);
      setShowDetailsModal(false);
      setShowEditModal(true);
    }
  };

  const handleDeleteFromDetails = () => {
    // When clicking delete from details modal, close details and open delete
    if (selectedRestaurant) {
      setDeletingRestaurantIds([selectedRestaurant.id]);
      setShowDetailsModal(false);
      setShowDeleteModal(true);
    }
  };

  const fetchResourceEmployees = useCallback(async (query = "", page = 1, availableDriversOnly = false, roles?: string[]) => {
    if (!selectedRestaurant) return;
    setResourcesLoading(true);
    try {
      const apiRoles = (roles && roles.length > 0)
        ? roles.map(r => r === "driver" ? "delivery" : r)
        : [];

      const commonParams = {
        ...(apiRoles.length === 1 ? { role: apiRoles[0] as "manager" | "delivery" } : {}),
        restaurant_id: availableDriversOnly ? undefined : selectedRestaurant.id,
        limit: 10,
        page,
        query: query.trim() || undefined,
      };

      let combinedEmployees: any[] = [];
      let totalCount = 0;

      if (availableDriversOnly) {
        const res = await employeeService.getList({ ...commonParams, status: "unassigned" });
        if (res.success && res.data) {
          const list = extractEmployees(res.data);
          combinedEmployees = list;
          totalCount = (res.pagination as any)?.total_count ?? list.length;
        }
      } else {
        const [resActive, resSuspended] = await Promise.all([
          employeeService.getList({ ...commonParams, status: "active" }),
          employeeService.getList({ ...commonParams, status: "suspended" })
        ]);

        if (resActive.success && resActive.data) {
          const list = extractEmployees(resActive.data);
          combinedEmployees = combinedEmployees.concat(list);
          totalCount += (resActive.pagination as any)?.total_count ?? list.length;
        }
        if (resSuspended.success && resSuspended.data) {
          const list = extractEmployees(resSuspended.data);
          combinedEmployees = combinedEmployees.concat(list);
          totalCount += (resSuspended.pagination as any)?.total_count ?? list.length;
        }
      }

      setResourceEmployees(combinedEmployees.map((e: any) => {
        const mapped = apiEmployeeToEmployee(e);
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
          isAvailable: e.status === "active",
        };
      }));
      setResourceEmployeeTotalEntries(totalCount);
    } catch (err) {
      console.error(err);
      setResourceEmployees([]);
      setResourceEmployeeTotalEntries(0);
    } finally {
      setResourcesLoading(false);
    }
  }, [selectedRestaurant]);

  const fetchResourceGrubPacs = useCallback(async (params: {
    page: number;
    query: string;
    showOfflineBoxes?: boolean;
    filters?: any;
  }) => {
    if (!selectedRestaurant) return;
    setResourcesLoading(true);
    try {
      const filters = params.filters;
      const apiParams: any = {};
      
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

      const fallbackPowerStatus = undefined;

      const commonParams = {
        restaurant_id: selectedRestaurant.id,
        limit: 10,
        page: params.page,
        query: params.query.trim() || undefined,
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
      };

      const [resActive, resSuspended] = await Promise.all([
        grubpacService.getList({ ...commonParams, status: "active" }),
        grubpacService.getList({ ...commonParams, status: "suspended" })
      ]);

      console.log("[fetchResourceGrubPacs] selectedRestaurant.id:", selectedRestaurant.id);
      console.log("[fetchResourceGrubPacs] commonParams:", commonParams);
      console.log("[fetchResourceGrubPacs] resActive:", resActive);
      console.log("[fetchResourceGrubPacs] resSuspended:", resSuspended);

      let combinedBoxes: any[] = [];
      let totalCount = 0;

      if (resActive.success && resActive.data) {
        const list = extractGrubPacs(resActive.data);
        combinedBoxes = combinedBoxes.concat(list);
        totalCount += (resActive.pagination as any)?.total_count ?? list.length;
      }
      if (resSuspended.success && resSuspended.data) {
        const list = extractGrubPacs(resSuspended.data);
        combinedBoxes = combinedBoxes.concat(list);
        totalCount += (resSuspended.pagination as any)?.total_count ?? list.length;
      }

      setResourceGrubPacs(combinedBoxes.map((b: any) => {
        const mapped = apiGrubPacToItem(b);
        const detailsParts = [mapped.boxDisplayId || mapped.boxId, mapped.vehicleNumber, mapped.restaurantName].filter(Boolean);
        return {
          id: mapped.id,
          name: mapped.name || mapped.boxDisplayId || `Box ${mapped.id}`,
          details: detailsParts.join(" | "),
          power: mapped.power === "on" ? "on" : mapped.power === "off" ? "off" : "warning",
          driver: mapped.handler || undefined,
          added: mapped.added || "",
          isLocked: mapped.grublockStatus === "locked" || mapped.locked,
          isOffline: mapped.power === "off" || mapped.handlerStatus === "offline" || mapped.powerStatus === "off",
        };
      }));
      setResourceGrubPacTotalEntries(totalCount);
      
      setDebugInfo(JSON.stringify({
        id: selectedRestaurant.id,
        params: commonParams,
        active: { success: resActive.success, count: (resActive.data as any)?.boxes?.length || 0, data: resActive.data },
        suspended: { success: resSuspended.success, count: (resSuspended.data as any)?.boxes?.length || 0, data: resSuspended.data }
      }, null, 2));
    } catch (err: any) {
      console.error(err);
      setDebugInfo(`Error: ${err.message}\n${err.stack}`);
      setResourceGrubPacs([]);
      setResourceGrubPacTotalEntries(0);
    } finally {
      setResourcesLoading(false);
    }
  }, [selectedRestaurant]);

  const handleActivateFromDetails = () => {
    // When clicking activate from details modal, close details and open reactivate modal
    if (selectedRestaurant) {
      setActivatingRestaurantIds([selectedRestaurant.id]);
      setIsActivateAll(false);
      setShowDetailsModal(false);
      setShowReactivateModal(true);
    }
  };

  const handleActivateSelection = () => {
    if (selectedIds.size > 0) {
      setActivatingRestaurantIds(Array.from(selectedIds));
      setIsActivateAll(false);
      setShowReactivateModal(true);
    }
  };

  const handleDeleteSelection = () => {
    if (selectedIds.size > 0) {
      setDeletingRestaurantIds(Array.from(selectedIds));
      setShowDeleteModal(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Modal handlers
  const handleReactivateConfirm = async (reassign: boolean) => {
    if (!isActivateAll && activatingRestaurantIds.length === 0) {
      console.warn("No restaurant IDs selected for reactivation");
      return;
    }

    setIsReactivating(true);

    try {
      const response = await foodService.reactivateRestaurants({
        ids: isActivateAll ? undefined : activatingRestaurantIds,
        all: isActivateAll || undefined,
        reactivate_employees: reassign,
        reactivate_boxes: reassign
      });

      if (response.success) {
        showSuccess("Reactivated", `${isActivateAll || activatingRestaurantIds.length > 1 ? 'Restaurants' : 'Restaurant'} reactivated successfully.`);
        setShowReactivateModal(false);
        setActivatingRestaurantIds([]);
        setSelectedIds(new Set());
        // Wait a bit for the backend to sync before refreshing
        setTimeout(() => fetchSuspendedRestaurants(), 500);
      } else {
        throw new Error(response.error || "Failed to reactivate");
      }
    } catch (error: any) {
      showError(`Failed to reactivate: ${error.message}`);
    } finally {
      setIsReactivating(false);
    }
  };

  const handleReassignResources = () => handleReactivateConfirm(true);
  const handleActivateLater = () => handleReactivateConfirm(false);

  const handleCloseModal = () => {
    setShowReactivateModal(false);
    setActivatingRestaurantIds([]);
    setIsActivateAll(false);
    // Don't clear selectedIds here - let user keep their selection
  };

  // Delete modal handlers
  const handleDeleteConfirm = async () => {
    if (deletingRestaurantIds.length === 0) return;
    
    setDeleteLoading(true);
    try {
      const response = await foodService.deleteRestaurants({
        ids: deletingRestaurantIds,
        destination_restaurant_id: null
      });
      
      if (response.success) {
        showSuccess("Deleted", `${deletingRestaurantIds.length > 1 ? 'Restaurants' : 'Restaurant'} deleted successfully.`);
        setShowDeleteModal(false);
        setDeletingRestaurantIds([]);
        setSelectedIds(new Set());
        setTimeout(() => fetchSuspendedRestaurants(), 500);
      } else {
        throw new Error(response.error || "Failed to delete");
      }
    } catch (error: any) {
      showError(`Failed to delete: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteWithManageResources = () => {
    // For restaurants with assigned resources, go to manage resources first
    setShowDeleteModal(false);
    setShowManageResourcesModal(true);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeletingRestaurantIds([]);
  };

  const handleDeleteSuspend = () => {
    alert(`Suspending ${deletingRestaurantIds.length} restaurant(s) instead of deleting`);
    setShowDeleteModal(false);
    setDeletingRestaurantIds([]);
    setSelectedIds(new Set());
  };

  const handleManageResourcesBack = () => {
    setShowManageResourcesModal(false);
    setShowDeleteModal(true);
  };

  const handleManageResourcesClose = () => {
    setShowManageResourcesModal(false);
    setDeletingRestaurantIds([]);
  };

  const handleDeleteWithResourceAction = async (action: DeleteResourceAction) => {
    if (deletingRestaurantIds.length === 0) return;

    if (action === "reassign") {
      setIsDeletingWithReassign(true);
      setShowManageResourcesModal(false);
      setShowReassignModal(true);
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await foodService.deleteRestaurants({
        ids: deletingRestaurantIds,
        destination_restaurant_id: null // unassign
      });
      
      if (response.success) {
        showSuccess("Deleted", `${deletingRestaurantIds.length > 1 ? 'Restaurants' : 'Restaurant'} and resources unassigned successfully.`);
        setShowManageResourcesModal(false);
        setDeletingRestaurantIds([]);
        setSelectedIds(new Set());
        setTimeout(() => fetchSuspendedRestaurants(), 500);
      } else {
        throw new Error(response.error || "Failed to delete");
      }
    } catch (error: any) {
      showError(`Failed to delete: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReassignConfirm = async (targetRestaurant: Restaurant | null) => {
    if (!targetRestaurant || deletingRestaurantIds.length === 0) return;

    setDeleteLoading(true);
    try {
      const response = await foodService.deleteRestaurants({
        ids: deletingRestaurantIds,
        destination_restaurant_id: targetRestaurant.id
      });
      
      if (response.success) {
        showSuccess("Deleted & Reassigned", `${deletingRestaurantIds.length > 1 ? 'Restaurants deleted and resources reassigned.' : 'Restaurant deleted and resources reassigned.'}`);
        setShowReassignModal(false);
        setIsDeletingWithReassign(false);
        setDeletingRestaurantIds([]);
        setSelectedIds(new Set());
        setTimeout(() => fetchSuspendedRestaurants(), 500);
      } else {
        throw new Error(response.error || "Failed to delete and reassign");
      }
    } catch (error: any) {
      showError(`Failed to delete and reassign: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get restaurant data for delete modals
  const deletingRestaurants = restaurants.filter(restaurant =>
    deletingRestaurantIds.includes(restaurant.id)
  );

  const fetchReassignRestaurants = useCallback(async (query = "", page = 1) => {
    if (!showReassignModal) return;

    setReassignRestaurantsLoading(true);
    try {
      const response = await foodService.getRestaurants({
        status: "active",
        query: query.trim() || undefined,
        limit: 50,
        page,
      });

      if (response.success && response.data?.restaurants) {
        const mapped: Restaurant[] = response.data.restaurants.map((r: RestaurantData) => ({
          id: r.id,
          name: r.name,
          address: r.full_address || `${r.line_one}, ${r.city}`,
          manager: getManagerName(r.manager),
          drivers: r._count?.drivers || 0,
          boxes: r._count?.boxes || 0,
          suspended_boxes: r._count?.suspended_boxes || 0,
          updated: r.updated_at
            ? new Date(r.updated_at)
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })
                .replace(/ (\d{2})$/, "'$1")
            : "-",
          status: r.status === "suspended" ? "suspended" : "active",
          city: r.city,
          state: r.state,
          pincode: r.pincode,
          line_one: r.line_one,
          line_two: r.line_two,
          latitude: r.latitude,
          longitude: r.longitude,
          google_place_id: r.google_place_id,
        }));

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
    } catch (error: any) {
      showError(`Failed to fetch restaurants: ${error.message}`);
      setReassignRestaurants([]);
      setReassignTotalEntries(0);
    } finally {
      setReassignRestaurantsLoading(false);
    }
  }, [showReassignModal]);

  const handleFetchReassignRestaurants = useCallback((query: string, page: number) => {
    void fetchReassignRestaurants(query, page);
  }, [fetchReassignRestaurants]);
  const deletingRestaurantNames = deletingRestaurants.map(r => r.name);
  const hasAssignedResources = deletingRestaurants.some(r => r.boxCount > 0 || r.driverCount > 0);

const _boxesCount = (selectedRestaurant as any)?._count?.boxes ?? selectedRestaurant?.boxes ?? 0;
  const _employeesCount = (selectedRestaurant as any)?._count?.employees ?? selectedRestaurant?.drivers ?? (selectedRestaurant as any)?._count?.drivers ?? 0;

  return (
    <div className={`bg-white min-h-screen ${className}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between px-[var(--gp-space-xl)] py-[var(--gp-space-m)]">
        <div className="flex items-center gap-[8px]">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center size-8 rounded-[var(--gp-radius-base)] hover:bg-[#EFF1F0] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#37493f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-secondary)]">
            Suspended restaurants
          </h1>
        </div>
        <Button
          variant="primary"
          appearance="solid"
          state="press"
          size="md"
          onClick={handleActivateAll}
          className="text-white font-medium uppercase"
          disabled={restaurants.length === 0}
        >
          <span>ACTIVATE ALL</span>
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center justify-between px-[var(--gp-space-xl)] py-[var(--gp-space-m)]">
        <div className="flex items-center gap-[var(--gp-space-l)]">
          <div className="relative w-[280px]">
            <SearchInput
              placeholder="Search restaurant"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              onClear={() => setSearchTerm("")}
              className="w-full"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            />
            {showDropdown && !isSearching && (
              <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-lg z-50">
                {searchError ? (
                  <div className="px-4 py-3 text-sm text-red-500">
                    Search failed. Please try again.
                  </div>
                ) : searchSuggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">
                    No restaurants found
                  </div>
                ) : (
                  searchSuggestions.slice(0, 6).map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      className="w-full px-4 py-2.5 flex items-center text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-stroke-neutral)] last:border-b-0 transition-colors"
                      onMouseDown={() => {
                        setSearchTerm(res.name);
                        setIsFocused(false);
                      }}
                    >
                      <div className="w-full text-base font-medium text-[#37493F]">
                        {highlightMatch(res.name, searchTerm)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-[var(--gp-space-l)]">
          <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] w-max">
            {totalEntries} entries
          </span>
          <FilterButton
            open={showFilterModal}
            handleFilterClick={() => setShowFilterModal(true)}
          />
        </div>
      </div>

      {/* Filter Modal */}
      <RestaurantFilterModal
        open={showFilterModal}
        onClose={() => {
          setDraftSelectedResources(selectedResources);
          setShowFilterModal(false);
        }}
        selectedResources={draftSelectedResources}
        setSelectedResources={setDraftSelectedResources}
        onFilter={(resources) => {
          setSelectedResources(resources);
          setShowFilterModal(false);
        }}
      />

      {/* Pagination Header - matches Figma design */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalEntries}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
          className="!pl-[40px]"
        />
      </div>

      {/* Table Section */}
      <div>
        {isLoading ? (
          <div className="space-y-3 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <GroupDataTable
            data={paginatedRestaurants}
            columns={SUSPENDED_COLUMNS}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onActivateGroup={handleActivateRestaurant}
            onDeleteGroup={handleDeleteRestaurant}
            onRowClick={handleRowClick}
            className="w-full"
          />
        )}
      </div>

      {/* Restaurant Action Bar - appears when items are selected */}
      <RestaurantActionBar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onDelete={handleDeleteSelection}
        onActivate={handleActivateSelection}
      />

      {/* Alternative: Use the system-wide TableActionBar component 
      <TableActionBar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onDelete={handleDeleteSelection}
        onActivate={handleActivateSelection}
        suspended={true}
        allowActivate={true}
        allowDelete={true}
      />
      */}

      {/* Reactivate Modal */}
      <ReactivateRestaurantsModal
        open={showReactivateModal}
        onClose={handleCloseModal}
        onReassign={handleReassignResources}
        onActivateLater={handleActivateLater}
        restaurantNames={restaurantNames}
        totalBoxes={totalResources.boxes}
        totalDrivers={totalResources.drivers}
        totalManagers={totalResources.managers}
        isActivateAll={isActivateAll}
        loading={isReactivating || isSummaryLoading}
        totalCount={totalEntries}
      />

      {/* Delete Confirmation Modal */}
      <DeleteRestaurantModal
        open={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        onManageResources={handleDeleteWithManageResources}
        restaurantName={deletingRestaurantNames[0] || ""}
        restaurantCount={deletingRestaurantIds.length}
        hasAssignedResources={hasAssignedResources}
        loading={deleteLoading}
      />

      {/* Manage Resources Delete Modal */}
      <ManageResourcesDeleteModal
        open={showManageResourcesModal}
        onClose={handleManageResourcesClose}
        onBack={handleManageResourcesBack}
        onConfirm={handleDeleteWithResourceAction}
        onSuspend={handleDeleteSuspend}
        restaurantName={deletingRestaurantNames[0] || ""}
        restaurantCount={deletingRestaurantIds.length}
        loading={deleteLoading}
      />

      {/* Reassign Resources Modal (used during delete) */}
      <ReassignResourcesModal
        open={showReassignModal}
        onClose={() => {
          setShowReassignModal(false);
          setIsDeletingWithReassign(false);
          if (isDeletingWithReassign) {
            setDeletingRestaurantIds([]); // If they cancel from reassign, clear deleting set
          }
        }}
        onBack={() => {
          setShowReassignModal(false);
          setShowManageResourcesModal(true);
          setIsDeletingWithReassign(false);
        }}
        onConfirm={handleReassignConfirm}
        onFetchRestaurants={handleFetchReassignRestaurants}
        totalEntries={reassignTotalEntries}
        restaurants={reassignRestaurants.filter((r) => !deletingRestaurantIds.includes(r.id))}
        sourceRestaurantName={deletingRestaurantNames[0]}
        loading={deleteLoading || reassignRestaurantsLoading}
        pageSize={10}
      />

      {/* Edit Restaurant Modal */}
      <AddRestaurantModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRestaurant(null);
        }}
        onSubmit={(data: RestaurantFormData) => {
          alert(`Restaurant "${data.name}" updated successfully`);
          setShowEditModal(false);
          setEditingRestaurant(null);
        }}
        restaurant={editingRestaurant}
        loading={false}
      />

    

      <RestaurantDetailsModal
        open={showDetailsModal && !showReactivateModal && !showDeleteModal && !showEditModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRestaurant(null);
        }}
        restaurant={{
          name: selectedRestaurant?.name || "",
          status: selectedRestaurant?.status,
          createdOn: selectedRestaurant?.updated,
          suspendedOn: (selectedRestaurant as any)?.suspendedOn,
          address: selectedRestaurant?.address,
          resources: [
            {
              label: "GrubPacs",
              count: _boxesCount,
              onViewList: () => {
                setResourcesTab("grubpacs");
                setShowDetailsModal(false);
                setShowResourcesModal(true);
                void fetchResourceGrubPacs({ page: 1, query: "", showOfflineBoxes: false, filters: defaultBoxFilters });
              },
            },
            {
              label: "employees",
              count: _employeesCount,
              onViewList: () => {
                setResourcesTab("employees");
                setShowDetailsModal(false);
                setShowResourcesModal(true);
                void fetchResourceEmployees("", 1);
              },
            },
          ],
        }}
        onActivate={handleActivateFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <RestaurantResourcesModal
        open={showResourcesModal}
        onClose={() => {
          setShowResourcesModal(false);
          setShowDetailsModal(true);
        }}
        restaurantName={selectedRestaurant?.name || ""}
        tab={resourcesTab}
        grubPacs={resourceGrubPacs}
        employees={resourceEmployees}
        onFetchEmployees={fetchResourceEmployees}
        onFetchGrubPacs={fetchResourceGrubPacs}
        employeeTotalEntries={resourceEmployeeTotalEntries}
        grubPacTotalEntries={resourceGrubPacTotalEntries}
        loading={resourcesLoading}
      />
      {debugInfo && (
        <pre style={{ position: "fixed", bottom: 10, left: 10, background: "rgba(0,0,0,0.9)", color: "#00ff00", zIndex: 999999, padding: 15, borderRadius: 8, maxHeight: 400, maxWidth: 500, overflow: "auto", fontSize: 11, border: "1px solid #00ff00", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {debugInfo}
        </pre>
      )}
    </div>
  );
}