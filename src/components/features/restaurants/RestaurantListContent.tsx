"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";
import GroupCollapseTable from "@/components/ui/GroupCollapseTable";
import RestaurantGroupTable from "./components/RestaurantGroupTable";
import RestaurantListHeader from "./components/RestaurantListHeader";
import RestaurantListToolbar from "./components/RestaurantListToolbar";
import RestaurantListEmptyState from "./components/RestaurantListEmptyState";
import RestaurantFilterModal, { type ResourceFilterType } from "./modals/RestaurantFilterModal";
import SuspendRestaurantModal, { type ResourceAction } from "./modals/SuspendRestaurantModal";
import DeleteRestaurantModal from "./modals/DeleteRestaurantModal";
import ManageResourcesDeleteModal, { type DeleteResourceAction } from "./modals/ManageResourcesDeleteModal";
import ReassignResourcesModal from "./modals/ReassignResourcesModal";
import TableActionBar from "@/components/ui/TableActionBar";
import { useRestaurantSearch } from "./hooks/useRestaurantSearch";
import { Button } from "@/components/ui/Button";
import type { RestaurantGroup } from "@/types";
import type { Restaurant, RestaurantData } from "@/types/domain/restaurants";
import foodService from "@/services/food";
import grubpacService from "@/services/grubpacs";
import { showError, showSuccess, showWarning } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";

type EmptyStateType = "no-restaurants" | "all-boxes-assigned";

interface RestaurantListContentProps {
  groups: RestaurantGroup[];
  onAddRestaurant: () => void;
  onEditRestaurant?: (restaurant: Restaurant) => void;
  onViewSuspended?: () => void;
  forceListLayout?: boolean;
  pageSize?: number;
  className?: string;
  emptyStateTopRight?: ReactNode;
  emptyStateType?: EmptyStateType;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  totalEntries?: number;
  isLoading?: boolean;
  isPageLoading?: boolean;
  onRefresh?: () => Promise<void>;
  selectedResources?: ResourceFilterType[];
  onFilterChange?: React.Dispatch<React.SetStateAction<ResourceFilterType[]>>;
  onPageChange?: (group: RestaurantGroup, page: number) => void;
}

export default function RestaurantListContent({
  groups,
  onAddRestaurant,
  onEditRestaurant,
  onViewSuspended,
  forceListLayout = false,
  pageSize = 50,
  className,
  emptyStateTopRight,
  emptyStateType = "no-restaurants",
  searchTerm = "",
  onSearchChange,
  totalEntries: totalEntriesProp,
  isLoading = false,
  isPageLoading = false,
  onRefresh,
  selectedResources = [],
  onFilterChange,
  onPageChange,
}: RestaurantListContentProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [draftSelectedResources, setDraftSelectedResources] = useState<ResourceFilterType[]>(selectedResources);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageResourcesDeleteModal, setShowManageResourcesDeleteModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignSourceRestaurant, setReassignSourceRestaurant] = useState<Restaurant | null>(null);
  const [actionMenuRestaurant, setActionMenuRestaurant] = useState<Restaurant | null>(null);
  const [isSuspendFlow, setIsSuspendFlow] = useState(false);
  const [reassignFlowType, setReassignFlowType] = useState<"suspend" | "delete" | "standalone" | "boxes">("standalone");
  const [isSuspending, setIsSuspending] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignRestaurants, setReassignRestaurants] = useState<Restaurant[]>([]);
  const [reassignTotalEntries, setReassignTotalEntries] = useState(0);
  const [reassignRestaurantsLoading, setReassignRestaurantsLoading] = useState(false);
  const [resourceModalRefreshToken, setResourceModalRefreshToken] = useState(0);
  const [selectedReassignBoxIds, setSelectedReassignBoxIds] = useState<string[]>([]);
  const [boxReassignSourceName, setBoxReassignSourceName] = useState<string | null>(null);

  const { results: searchSuggestions, isSearching, searchError } = useRestaurantSearch({
    query: searchTerm,
    limit: 50,
    status: "active",
  });

  useEffect(() => {
    if (searchTerm) {
      const firstGroupWithItems = groups.findIndex(g => (g.items?.length ?? 0) > 0);
      if (firstGroupWithItems !== -1) {
        setOpenIndex(firstGroupWithItems);
      }
    }
  }, [groups, searchTerm]);

  const getManagerName = useCallback((manager: RestaurantData["manager"]): string | null => {
    if (!manager) return null;
    const combined = [manager.first_name, manager.last_name].filter(Boolean).join(" ").trim();
    return combined || null;
  }, []);

  const mapRestaurantData = useCallback((r: RestaurantData): Restaurant => ({
    id: r.id,
    name: r.name,
    address: r.full_address,
    manager: getManagerName(r.manager),
    drivers: r._count?.drivers || 0,
    boxes: r._count?.boxes || 0,
    suspended_boxes: r._count?.suspended_boxes || 0,
    updated: r.updated_at ? formatDate(r.updated_at) : "-",
    status: r.status === "suspended" ? "suspended" : "active",
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    line_one: r.line_one,
    line_two: r.line_two,
    latitude: r.latitude,
    longitude: r.longitude,
    google_place_id: r.google_place_id,
  }), [getManagerName]);

  const fetchReassignRestaurants = useCallback(async (query = "", page = 1) => {
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

  const openReassignModal = useCallback(
    ({
      sourceRestaurant,
      flowType,
      boxIds = [],
      sourceName,
    }: {
      sourceRestaurant: Restaurant | null;
      flowType: "suspend" | "delete" | "standalone" | "boxes";
      boxIds?: string[];
      sourceName?: string | null;
    }) => {
      setReassignSourceRestaurant(sourceRestaurant);
      setReassignFlowType(flowType);
      setSelectedReassignBoxIds(boxIds);
      setBoxReassignSourceName(sourceName ?? null);

      // Prime modal in loading state to avoid brief empty-state flash/flicker.
      setReassignRestaurants([]);
      setReassignTotalEntries(0);
      setReassignRestaurantsLoading(true);
      setShowReassignModal(true);
    },
    [],
  );

  const handleFetchReassignRestaurants = useCallback((query: string, page: number) => {
    void fetchReassignRestaurants(query, page);
  }, [fetchReassignRestaurants]);

  useEffect(() => {
    if (showFilterModal) {
      setDraftSelectedResources(selectedResources);
    }
  }, [selectedResources, showFilterModal]);


  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleReassignResources = () => {
    if (selectedIds.size > 0) {
      openReassignModal({
        sourceRestaurant: null,
        flowType: "standalone",
      });
    }
  };

  const handleReassignRestaurant = (restaurant: Restaurant, boxIds: string[] = []) => {
    openReassignModal({
      sourceRestaurant: restaurant,
      flowType: boxIds.length > 0 ? "boxes" : "standalone",
      boxIds,
      sourceName: boxIds.length > 0 ? restaurant.name : null,
    });
  };

  const handleReassignConfirm = async (targetRestaurant: Restaurant | null) => {
    const ids = reassignSourceRestaurant ? [reassignSourceRestaurant.id] : Array.from(selectedIds);
    if (targetRestaurant && ids.length > 0) {
      if (reassignFlowType === "boxes") {
        if (selectedReassignBoxIds.length === 0) {
          showError("No boxes selected for reassignment");
          return;
        }

        setIsReassigning(true);
        try {
          const response = await grubpacService.reassign({
            ids: selectedReassignBoxIds,
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
          onRefresh?.();
          setResourceModalRefreshToken((prev) => prev + 1);
        } catch (error) {
          showError(
            getContextualErrorMessage(
              "assignment.box",
              error,
              "Could not reassign box(es). Please try again.",
            ),
          );
        } finally {
          setIsReassigning(false);
        }
      } else if (reassignFlowType === "suspend") {
        setIsSuspending(true);
        try {
          await foodService.suspendRestaurants({
            ids,
            resource_status: "assign",
            destination_restaurant_id: targetRestaurant.id,
          });
          showSuccess("Suspended", `${ids.length > 1 ? "Restaurants" : `Restaurant ${reassignSourceRestaurant?.name}`} suspended and resources reassigned.`);
          onRefresh?.();
          setResourceModalRefreshToken((prev) => prev + 1);
        } catch (error: any) {
          showError(`Failed to suspend: ${error.message}`);
        } finally {
          setIsSuspending(false);
        }
      } else if (reassignFlowType === "delete") {
        // Handle delete with reassign - use selectedIds for bulk, actionMenuRestaurant for single
        setDeleteLoading(true);
        try {
          const idsToDelete = actionMenuRestaurant ? [actionMenuRestaurant.id] : Array.from(selectedIds);
          const response = await foodService.deleteRestaurants({
            ids: idsToDelete,
            destination_restaurant_id: targetRestaurant.id
          });
          if (response.success) {
            showSuccess("Deleted", `${idsToDelete.length > 1 ? 'Restaurants' : 'Restaurant'} deleted and resources reassigned.`);
            onRefresh?.();
            setResourceModalRefreshToken((prev) => prev + 1);
          } else {
            throw new Error(response.error || "Failed to delete");
          }
        } catch (error: any) {
          showError(`Failed to delete and reassign: ${error.message}`);
        } finally {
          setDeleteLoading(false);
        }
      } else {
        // standalone reassign
        setIsReassigning(true);
        try {
          await foodService.reassignResource({
            restaurant_ids: ids,
            destination_restaurant_id: targetRestaurant.id
          });
          
          onRefresh?.();
          setResourceModalRefreshToken((prev) => prev + 1);
          
          // Show alert after successful API response
          if (targetRestaurant.manager) {
            showWarning(
              "Conflict",
              "Some managers could not be reassigned due to conflicts. Their accounts has been marked as unassigned.",
              false,
              "/grublock/details",
              "VIEW DETAILS"
            );
          } else {
            showSuccess("Reassigned", "Resources reassigned successfully.");
          }
        } catch (error) {
          showError(
            getContextualErrorMessage(
              "assignment.resource",
              error,
              "Could not reassign resources. Please try again.",
            ),
          );
        } finally {
          setIsReassigning(false);
        }
      }
      
      setShowReassignModal(false);
      setReassignSourceRestaurant(null);
      setSelectedReassignBoxIds([]);
      setBoxReassignSourceName(null);
      setActionMenuRestaurant(null);
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSelection = () => {
    if (selectedIds.size > 0) {
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    const idsToDelete = actionMenuRestaurant ? [actionMenuRestaurant.id] : Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    setDeleteLoading(true);
    try {
      const response = await foodService.deleteRestaurants({
        ids: idsToDelete,
        destination_restaurant_id: null
      });
      if (response.success) {
        showSuccess("Deleted", `${idsToDelete.length > 1 ? 'Restaurants' : 'Restaurant'} deleted successfully.`);
        setShowDeleteModal(false);
        setShowManageResourcesDeleteModal(false);
        setActionMenuRestaurant(null);
        setSelectedIds(new Set());
        onRefresh?.();
      } else {
        throw new Error(response.error || "Failed to delete");
      }
    } catch (error: any) {
      showError(`Failed to delete: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleManageResourcesDelete = async (action: DeleteResourceAction) => {
    const idsToDelete = actionMenuRestaurant ? [actionMenuRestaurant.id] : Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    if (action === "reassign") {
      setShowDeleteModal(false);
      setShowManageResourcesDeleteModal(false);
      openReassignModal({
        sourceRestaurant: actionMenuRestaurant || selectedRestaurants[0] || null,
        flowType: "delete",
      });
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await foodService.deleteRestaurants({
        ids: idsToDelete,
        destination_restaurant_id: null // unassign
      });
      if (response.success) {
        showSuccess("Deleted", `${idsToDelete.length > 1 ? 'Restaurants and resources unassigned' : 'Restaurant and resources unassigned'} successfully.`);
        setShowDeleteModal(false);
        setShowManageResourcesDeleteModal(false);
        setActionMenuRestaurant(null);
        setSelectedIds(new Set());
        onRefresh?.();
      } else {
        throw new Error(response.error || "Failed to delete");
      }
    } catch (error: any) {
      showError(`Failed to delete: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteToManageResources = () => {
    setShowDeleteModal(false);
    setShowManageResourcesDeleteModal(true);
  };

  const handleReassignBack = () => {
    setShowReassignModal(false);

    if (reassignFlowType === "delete") {
      setShowManageResourcesDeleteModal(true);
      return;
    }

    if (reassignFlowType === "suspend") {
      setShowSuspendModal(true);
      return;
    }

    setReassignSourceRestaurant(null);
    setSelectedReassignBoxIds([]);
    setBoxReassignSourceName(null);
  };

  const handleManageResourcesBack = () => {
    setShowManageResourcesDeleteModal(false);
    setShowDeleteModal(true);
  };

  const handleDeleteToSuspend = () => {
    setShowDeleteModal(false);
    setShowManageResourcesDeleteModal(false);
    setShowSuspendModal(true);
  };

  const handleDeleteRestaurant = (restaurant: Restaurant) => {
    setActionMenuRestaurant(restaurant);
    setShowDeleteModal(true);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    if (onEditRestaurant) {
      onEditRestaurant(restaurant);
    }
  };

  const hasAnyRestaurants = useMemo(
    () => groups.some((group) => (group.items?.length ?? 0) > 0),
    [groups],
  );

  const filteredGroups = groups;

  const selectedRestaurant = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    
    const selectedId = Array.from(selectedIds)[0];
    for (const group of groups) {
      const restaurant = group.items?.find((item) => item.id === selectedId);
      if (restaurant) return restaurant;
    }
    return null;
  }, [selectedIds, groups]);

  const selectedRestaurants = useMemo(() => {
    if (selectedIds.size === 0) return [];
    
    const restaurants: Restaurant[] = [];
    for (const group of groups) {
      for (const restaurant of group.items ?? []) {
        if (selectedIds.has(restaurant.id)) {
          restaurants.push(restaurant);
        }
      }
    }
    return restaurants;
  }, [selectedIds, groups]);

  const isWithoutBoxesGroup = useMemo(() => {
    if (selectedIds.size === 0) return false;
    
    for (const group of filteredGroups) {
      if (group.name === "Restaurants without boxes") {
        const hasSelected = group.items?.some(item => selectedIds.has(item.id));
        if (hasSelected) return true;
      }
    }
    return false;
  }, [filteredGroups, selectedIds]);

  const hasSelectionWithResources = useMemo(() => {
    return selectedRestaurants.some(r => (r.boxes || 0) > 0 || (r.drivers || 0) > 0 || (r.suspended_boxes || 0) > 0);
  }, [selectedRestaurants]);

  const handleSuspendRestaurant = (restaurant: Restaurant) => {
    setActionMenuRestaurant(restaurant);
    setShowSuspendModal(true);
  };

  const isActionMenuFromWithoutBoxes = useMemo(() => {
    if (!actionMenuRestaurant) return false;
    for (const group of filteredGroups) {
      if (group.name === "Restaurants without boxes") {
        const hasRestaurant = group.items?.some(item => item.id === actionMenuRestaurant.id);
        if (hasRestaurant) return true;
      }
    }
    return false;
  }, [actionMenuRestaurant, filteredGroups]);

  const handleSuspendSelection = () => {
    if (selectedIds.size > 0) {
      setShowSuspendModal(true);
    }
  };

  const handleSuspendConfirm = async (action: ResourceAction) => {
    const restaurantToSuspend = actionMenuRestaurant || selectedRestaurants[0];
    if (restaurantToSuspend) {
      if (action === "reassign") {
        setShowSuspendModal(false);
        openReassignModal({
          sourceRestaurant: restaurantToSuspend,
          flowType: "suspend",
        });
        return;
      }

      setIsSuspending(true);
      try {
        await foodService.suspendRestaurants({
          ids: actionMenuRestaurant ? [actionMenuRestaurant.id] : Array.from(selectedIds),
          resource_status: action === "suspend" ? "suspend" : "assign",
          destination_restaurant_id: null, // "unassign" uses null
        });
        showSuccess("Suspended", `${actionMenuRestaurant ? 'Restaurant' : 'Restaurants'} suspended successfully.`);
        onRefresh?.();
      } catch (error: any) {
        showError(`Failed to suspend: ${error.message}`);
      } finally {
        setIsSuspending(false);
        setShowSuspendModal(false);
        setActionMenuRestaurant(null);
        setSelectedIds(new Set());
      }
    }
  };

  const totalEntries = totalEntriesProp !== undefined 
    ? totalEntriesProp 
    : groups.reduce(
        (accumulator, group) => accumulator + (group.items?.length ?? 0),
        0,
      );

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {(forceListLayout || hasAnyRestaurants || searchTerm !== "" || isLoading || isSearching || selectedResources.length > 0) ? (
        <>
          <div className="flex-shrink-0 space-y-6">
          <RestaurantListHeader onAddNew={onAddRestaurant} onViewSuspended={onViewSuspended} />
          <RestaurantListToolbar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange || (() => undefined)}
            onSearchClear={() => onSearchChange?.("")}
            totalEntries={totalEntries}
            onFilterClick={() => setShowFilterModal(true)}
            isFilterModalOpen={showFilterModal}
            isLoading={isLoading}
            searchSuggestions={searchSuggestions}
            isSearching={isSearching}
            searchError={searchError}
          />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 pt-4 space-y-6">
          <RestaurantFilterModal
            open={showFilterModal}
            onClose={() => {
              setDraftSelectedResources(selectedResources);
              setShowFilterModal(false);
            }}
            selectedResources={draftSelectedResources}
            setSelectedResources={setDraftSelectedResources}
            onFilter={(resources) => {
              if (onFilterChange) onFilterChange(resources);
              setShowFilterModal(false);
            }}
          />

          <SuspendRestaurantModal
            open={showSuspendModal}
            onClose={() => {
              setShowSuspendModal(false);
              setActionMenuRestaurant(null);
            }}
            onConfirm={handleSuspendConfirm}
            restaurantName={actionMenuRestaurant?.name || selectedRestaurants[0]?.name || ""}
            restaurantCount={actionMenuRestaurant ? 1 : selectedRestaurants.length}
            isWithoutBoxesGroup={isActionMenuFromWithoutBoxes || isWithoutBoxesGroup}
            hasAssignedResources={
              actionMenuRestaurant
                ? ((actionMenuRestaurant.boxes || 0) > 0 || (actionMenuRestaurant.drivers || 0) > 0)
                : selectedRestaurants.some(r => (r.boxes || 0) > 0 || (r.drivers || 0) > 0)
            }
            loading={isSuspending}
          />

          <DeleteRestaurantModal
            open={showDeleteModal && !showManageResourcesDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setActionMenuRestaurant(null);
            }}
            onConfirm={handleDeleteConfirm}
            onSuspend={handleDeleteToSuspend}
            onManageResources={handleDeleteToManageResources}
            restaurantName={actionMenuRestaurant?.name || selectedRestaurants[0]?.name || ""}
            restaurantCount={actionMenuRestaurant ? 1 : selectedRestaurants.length}
            hasAssignedResources={
              actionMenuRestaurant 
                ? ((actionMenuRestaurant.boxes || 0) > 0 || (actionMenuRestaurant.suspended_boxes || 0) > 0 || (actionMenuRestaurant.drivers || 0) > 0 || !!actionMenuRestaurant.manager)
                : selectedRestaurants.some(r => (r.boxes || 0) > 0 || (r.suspended_boxes || 0) > 0 || (r.drivers || 0) > 0 || !!r.manager)
            }

            isWithoutBoxesGroup={isActionMenuFromWithoutBoxes || isWithoutBoxesGroup}
            loading={deleteLoading}
          />

          <ManageResourcesDeleteModal
            open={showManageResourcesDeleteModal}
            onClose={() => {
              setShowManageResourcesDeleteModal(false);
              setActionMenuRestaurant(null);
            }}
            onBack={handleManageResourcesBack}
            onConfirm={handleManageResourcesDelete}
            onSuspend={handleDeleteToSuspend}
            restaurantName={actionMenuRestaurant?.name || selectedRestaurants[0]?.name || ""}
            restaurantCount={actionMenuRestaurant ? 1 : selectedRestaurants.length}
            loading={deleteLoading}
          />

          <ReassignResourcesModal
            open={showReassignModal}
            onClose={() => {
              setShowReassignModal(false);
              setReassignSourceRestaurant(null);
              setSelectedReassignBoxIds([]);
              setBoxReassignSourceName(null);
            }}
            onBack={handleReassignBack}
            onConfirm={handleReassignConfirm}
            onFetchRestaurants={handleFetchReassignRestaurants}
            totalEntries={reassignTotalEntries}
            restaurants={reassignRestaurants.filter((restaurant) => !selectedIds.has(restaurant.id) && restaurant.id !== reassignSourceRestaurant?.id)}
            sourceRestaurantName={boxReassignSourceName ?? reassignSourceRestaurant?.name}
            loading={isReassigning || reassignRestaurantsLoading}
            pageSize={50}
          />

          <div className={cn("relative min-h-[400px]")}>
            {isLoading ? (
              <div className="space-y-3 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <GroupCollapseTable
                  groups={filteredGroups}
                  openIndex={openIndex}
                  setOpenIndex={setOpenIndex}
                  isPageLoading={isPageLoading}
                  renderTable={(group) => (
                    <RestaurantGroupTable 
                      group={group} 
                      selectedIds={selectedIds}
                      onRowSelect={handleRowSelect}
                      onSuspendRestaurant={handleSuspendRestaurant}
                      onDelete={handleDeleteRestaurant}
                      onEdit={handleEditRestaurant}
                      onReassignResources={handleReassignRestaurant}
                      onRefresh={onRefresh}
                      resourceRefreshToken={resourceModalRefreshToken}
                    />
                  )}
                  tableContainerClass="bg-white"
                  restaurantTable
                  noResultsMessage={searchTerm ? "No restaurants match your search." : "No restaurants found."}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                />
              </>
            )}
          </div>

          <TableActionBar
            selectedCount={selectedIds.size}
            onClearSelection={handleClearSelection}
            onReassignRole={handleReassignResources}
            onSuspend={handleSuspendSelection}
            onDelete={handleDeleteSelection}
            reassignLabel="REASSIGN RESOURCES"
            allowReassign={!isWithoutBoxesGroup && (
              hasSelectionWithResources ||
              selectedRestaurants.some((r) => (r.suspended_boxes || 0) > 0)
            )}
            allowSuspend={true}
            allowDelete={true}
          />
        </div>
        </>
      ) : (
        <RestaurantListEmptyState 
          onAddRestaurant={onAddRestaurant} 
          topRight={emptyStateTopRight}
          emptyStateType={emptyStateType}
        />
      )}
    </div>
  );
}

