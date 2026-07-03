"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GroupDataTable, type GroupRow, type GroupColumnId } from "@/components/ui/restaurant-data-table";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import LoadingDetails from "@/components/ui/LoadingDetails";
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
import { formatDate } from "@/lib/utils/date";

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

export default function SuspendedRestaurantsList({ className = "" }: SuspendedRestaurantsListProps) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<GroupRow[]>([]);
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
          employeeCount: r._count?.employees || 0,
          boxCount: (r._count?.boxes || 0) + (r._count?.suspended_boxes || 0),
          updated: formatDate(r.updated_at),
          suspended: formatDate(r.updated_at),
          added: formatDate(r.created_at),
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
      drivers: acc.drivers + (restaurant.driverCount || 0) + ((restaurant as any).employeeCount || 0),
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
    const idsToReactivate = isActivateAll
  ? restaurants.map((r) => r.id)
  : activatingRestaurantIds;

const response = await foodService.reactivateRestaurants({
  ids: idsToReactivate,
  reactivate_employees: reassign,
  reactivate_boxes: reassign,
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
        throw response;
      }
    } catch (error: any) {
      if (error.status === 409) {
        setShowDeleteModal(false);
        setShowManageResourcesModal(true);
        return;
      }
      showError(`Failed to delete: ${error.message || error.error || "Unknown error"}`);
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
          updated: formatDate(r.updated_at) || "-",
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
  const hasAssignedResources = deletingRestaurants.some(r => r.boxCount > 0 || r.driverCount > 0 || (r as any).employeeCount > 0 || !!r.manager);

const _boxesCount = (selectedRestaurant as any)?._count?.boxes ?? selectedRestaurant?.boxes ?? 0;
  const _employeesCount = (selectedRestaurant as any)?._count?.employees ?? selectedRestaurant?.drivers ?? (selectedRestaurant as any)?._count?.drivers ?? 0;

  return (
    <div className={`flex flex-col h-full min-h-0 overflow-hidden ${className}`}>
      {/* Sticky Header */}
      <div className="flex-shrink-0">
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
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-4 space-y-6">

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
          <LoadingDetails entity="suspended restaurants" />
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
                if (!selectedRestaurant?.id) return;
                setShowDetailsModal(false);
                router.push(`/grubpacs/list?grouped=true&restaurantId=${selectedRestaurant.id}`);
              },
            },
            {
              label: "employees",
              count: _employeesCount,
              onViewList: () => {
                if (!selectedRestaurant?.id) return;
                setShowDetailsModal(false);
                router.push(`/employees/list?restaurantId=${selectedRestaurant.id}`);
              },
            },
          ],
        }}
        onActivate={handleActivateFromDetails}
        onDelete={handleDeleteFromDetails}
      />
      </div>
    </div>
  );
}