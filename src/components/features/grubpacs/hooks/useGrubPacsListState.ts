import { useState, useMemo } from "react";
import { useGrubPacsData } from "./useGrubPacsData";
import { useGrubPacsFilters } from "./useGrubPacsFilters";
import { useGrubPacSearch } from "./useGrubPacSearch";
import { useModalState } from "@/lib/hooks";
import type { GrubPacItem, GrubPacGroup, GrubPacListParams } from "@/types/domain/grubpacs";

// Re-export for convenience
export type { GrubPacItem, GrubPacGroup };

export interface ModalState {
  suspend: {
    open: boolean;
    box: GrubPacItem | null;
    selectedCount: number;
    fromRemoval: boolean;
    selectedIds: (number | string)[];
  };
  filter: {
    open: boolean;
  };
  boxRemoval: {
    open: boolean;
    selected: (number | string)[];
    count: number;
  };
  applySettings: {
    open: boolean;
    selectedCount: number;
    settingType: string;
    selectedIds: (number | string)[];
    actionType: "power" | "ioniser" | "temperature" | null;
    actionValue: "on" | "off" | null;
    temperature: {
      zone1: string;
      zone2: string;
      dualZone: boolean;
    } | null;
  };
  reassignGroup: {
    open: boolean;
  };
  groupModal: {
    open: boolean;
    group: GrubPacItem | null;
  };
  boxListModal: {
    open: boolean;
    group: GrubPacItem | null;
  };
}

export interface SelectedState {
  poweredOn: (number | string)[];
  poweredOff: (number | string)[];
}

type OpenSectionType = "poweredOn" | "poweredOff" | null;
type OpenGroupType = "groundFloor1" | "groundFloor2" | "unassigned" | null;

export function useGrubPacsListState() {
  const [showOffline, setShowOffline] = useState<boolean>(false);
  const [isGrouped, setIsGrouped] = useState<boolean>(false);
  const [forceEmptyState, setForceEmptyState] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<OpenSectionType>(null);
  const [openCheckPermissionsModal, setOpenCheckPermissionsModal] = useState<boolean>(false);
  const [openEditBoxModal, setOpenEditBoxModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selected, setSelected] = useState<SelectedState>({
    poweredOn: [],
    poweredOff: [],
  });

  const { filters, setFilters } = useGrubPacsFilters();

  // Map UI FilterState → API query params
  const apiParams = useMemo((): GrubPacListParams => {
    const params: GrubPacListParams = {};

    // Match GrubLock behavior: default grouped by power status, switch to restaurants in grouped view.
    params.group_by = isGrouped ? "restaurants" : "power_status";

    // Power status
    const power = filters.power ?? [];
    if (power.length === 1) {
      const v = power[0];
      if (v === "Powered on") params.power_status = "on";
      else if (v === "Powered off") params.power_status = "off";
      else if (v === "Unknown") params.power_status = "unknown";
    }

    // Single-value filters — send to API directly
    const connection = filters.connection ?? [];
    if (connection.length === 1) {
      const v = connection[0];
      if (v === "Connected") params.connection_status = "connected";
      else if (v === "Disconnected") params.connection_status = "disconnected";
    }
    const health = filters.health ?? [];
    if (health.length === 1) {
      const v = health[0];
      if (v === "Critical") params.health_status = "critical";
      else if (v === "Healthy") params.health_status = "healthy";
      else if (v === "Needs attention") params.health_status = "attention";
    }
    const grubLockStatus = filters.grubLockStatus ?? [];
    if (grubLockStatus.length === 1) {
      const v = grubLockStatus[0];
      if (v === "Locked") params.grublock_status = "locked";
      else if (v === "Unlocked") params.grublock_status = "unlocked";
      else if (v === "No lock available") params.grublock_status = "not_available";
    }

    // In grouped mode:
    // - default (Show offline unchecked): only powered on.
    // - Show offline checked: fetch without power filter so offline + unknown can be shown.
    if (isGrouped) {
      params.power_status = showOffline ? "off" : "on";
    }

    // Boolean filters
    if (filters.restaurantAssigned) params.restaurant_assigned = "on";
    if (filters.vehicleAssigned) params.vehicle_assigned = "on";
    if (filters.ioniserOn) params.ioniser_status = "on";
    if (filters.dualZoneOn) params.dual_zone_status = "on";

    // Zone temperature — only send when changed from defaults
    if (filters.zone1Min !== -20) params.zone1_min = filters.zone1Min;
    if (filters.zone1Max !== 30) params.zone1_max = filters.zone1Max;
    if (filters.zone2Min !== -20) params.zone2_min = filters.zone2Min;
    if (filters.zone2Max !== 30) params.zone2_max = filters.zone2Max;

    return params;
  }, [filters, isGrouped, showOffline]);

  const { groups, grubpacsData, isLoading, isPageLoading, refetch, refetchGroup, totalEntries } = useGrubPacsData(apiParams);
  const {
    results: searchResults,
    isSearching,
    searchError,
  } = useGrubPacSearch({
    query: searchTerm,
    limit: 50,
    status: "active",
  });
  const { modalState, openModal, closeModal } = useModalState({
    suspend: { open: false, box: null, selectedCount: 0, fromRemoval: false, selectedIds: [] },
    filter: { open: false },
    boxRemoval: { open: false, selected: [], count: 0 },
    applySettings: {
      open: false,
      selectedCount: 0,
      settingType: "",
      selectedIds: [],
      actionType: null,
      actionValue: null,
      temperature: null,
    },
    reassignGroup: { open: false },
    groupModal: { open: false, group: null },
    boxListModal: { open: false, group: null },
  }) as {
    modalState: ModalState;
    openModal: (type: string, data?: Record<string, unknown>) => void;
    closeModal: (type: string) => void;
  };

  const hasData = useMemo(
    () =>
      !forceEmptyState &&
      groups &&
      groups.length > 0 &&
      groups.some((group) => group.items && group.items.length > 0),
    [forceEmptyState, groups]
  );

  const allItems: GrubPacItem[] = useMemo(
    () => (hasData ? groups.flatMap((group) => group.items || []) : []),
    [hasData, groups]
  );

  const isSearchMode = searchTerm.trim().length > 0;

  const searchResultIds = useMemo(
    () => new Set(searchResults.map((result) => String(result.id))),
    [searchResults],
  );

  const searchedGroups = useMemo<GrubPacGroup[]>(() => {
    if (!hasData) return [];
    if (!isSearchMode) return groups;

    const groupedMatches: GrubPacGroup[] = groups
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) => searchResultIds.has(String(item.id))),
      }))
      .filter((group) => (group.items?.length ?? 0) > 0);

    const existingIds = new Set(
      groupedMatches.flatMap((group) => (group.items || []).map((item) => String(item.id))),
    );

    const fallbackItems: GrubPacItem[] = searchResults
      .filter((item) => !existingIds.has(String(item.id)))
      .map((item) => ({
        id: item.id,
        name: item.name,
        code: item.box_display_id ?? item.box_id,
        boxId: item.box_id,
        lifecycleStatus: item.status,
        status: item.status === "active" ? "ON" : "OFF",
        power: item.status === "active" ? "ON" : "OFF",
        powerStatus: item.status === "active" ? "ON" : "OFF",
        hasLock: false,
        locked: undefined,
      }));

    if (fallbackItems.length > 0) {
      groupedMatches.push({
        name: "Search results",
        items: fallbackItems,
      });
    }

    return groupedMatches;
  }, [groups, hasData, isSearchMode, searchResultIds, searchResults]);

  const filteredGroups: GrubPacGroup[] = useMemo(
    () =>
      hasData
        ? searchedGroups.map((group) => ({
            ...group,
            items: (group.items || []).filter((item) => {
              // Connection status filter
              if ((filters.connection ?? []).length > 0) {
                const itemStatus = item.status?.toUpperCase() || '';
                const matchesConnection = (filters.connection ?? []).some(f => {
                  const filterUpper = f.toUpperCase();
                  return itemStatus.includes(filterUpper) || 
                         (filterUpper === 'ONLINE' && (itemStatus === 'ON' || itemStatus === 'CONNECTED')) ||
                         (filterUpper === 'OFFLINE' && (itemStatus === 'OFF' || itemStatus === 'DISCONNECTED'));
                });
                if (!matchesConnection) return false;
              }

              // Health status filter
              if ((filters.health ?? []).length > 0) {
                // Add your health status logic here based on item properties
                // For now, passing through - implement based on actual health field
              }

              // GrubLock status filter
              if ((filters.grubLockStatus ?? []).length > 0) {
                const itemLocked = item.locked;
                const matchesLockStatus = (filters.grubLockStatus ?? []).some(f => {
                  return (f.toLowerCase() === 'locked' && itemLocked) ||
                         (f.toLowerCase() === 'unlocked' && !itemLocked);
                });
                if (!matchesLockStatus) return false;
              }

              // Restaurant assigned filter
              if (filters.restaurantAssigned) {
                if (!item.location) return false;
              }

              // Ioniser filter
              if (filters.ioniserOn) {
                if (item.ioniser !== 'ON') return false;
              }

              // Dual zone filter
              if (filters.dualZoneOn) {
                if (!item.zone1Temp || !item.zone2Temp) return false;
              }

              // Zone temperature filters
              if (item.zone1Temp) {
                const temp1 = parseFloat(item.zone1Temp);
                if (!isNaN(temp1) && (temp1 < filters.zone1Min || temp1 > filters.zone1Max)) {
                  return false;
                }
              }

              if (item.zone2Temp) {
                const temp2 = parseFloat(item.zone2Temp);
                if (!isNaN(temp2) && (temp2 < filters.zone2Min || temp2 > filters.zone2Max)) {
                  return false;
                }
              }

              return true;
            }),
          }))
        : [],
    [hasData, searchedGroups, filters]
  );

  const poweredOnItems: GrubPacItem[] = useMemo(
    () =>
      hasData
        ? filteredGroups.flatMap((group) =>
            (group.items || []).filter((item) => {
              const powerValue = String(item.power ?? item.powerStatus ?? "").toLowerCase();
              const statusValue = String(item.status ?? "").toLowerCase();

              // Strictly keep only ON items in Powered on.
              return powerValue === "on" || statusValue === "on" || statusValue === "connected";
            })
          )
        : [],
    [hasData, filteredGroups]
  );

  const poweredOffItems: GrubPacItem[] = useMemo(
    () =>
      hasData
        ? filteredGroups.flatMap((group) =>
            (group.items || []).filter((item) => {
              const powerValue = String(item.power ?? item.powerStatus ?? "").toLowerCase();
              const statusValue = String(item.status ?? "").toLowerCase();

              // Powered off table should contain OFF and unknown(??) values.
              if (powerValue === "off" || statusValue === "off" || statusValue === "offline" || statusValue === "disconnected") {
                return true;
              }

              if (powerValue === "unknown") {
                return true;
              }

              return powerValue === "" && statusValue !== "on" && statusValue !== "connected";
            })
          )
        : [],
    [hasData, filteredGroups]
  );

  // Fallback: if both arrays are empty but we have data, put everything in powered on
  const finalPoweredOnItems = useMemo(() => {
    if (hasData && poweredOnItems.length === 0 && poweredOffItems.length === 0) {
      return filteredGroups.flatMap((group) => group.items || []);
    }
    return poweredOnItems;
  }, [hasData, poweredOnItems, poweredOffItems, filteredGroups]);

  return {
    // State
    showOffline,
    setShowOffline,
    isGrouped,
    setIsGrouped,
    forceEmptyState,
    setForceEmptyState,
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
    // Data
    groups,
    grubpacsData,
    filters,
    setFilters,
    modalState,
    openModal,
    closeModal,
    totalEntries,
    refetchGrubPacs: refetch,
    refetchGroup,
    // Computed
    hasData,
    isLoading,
    isPageLoading,
    isSearching,
    searchSuggestions: searchResults,
    searchError,
    allItems,
    filteredGroups,
    poweredOnItems: finalPoweredOnItems,
    poweredOffItems,
  };
}

