"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import { GrubPacSuspendedBoxTable, type SuspendedBoxRow } from "@/components/features/grubpacs/table/grubpac-suspended-box-table";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import Pagination from "@/components/ui/Pagination";
import CheckBox from "@/components/ui/CheckBox";
import GroupCollapseTable from "@/components/ui/GroupCollapseTable";
import LoadingDetails from "@/components/ui/LoadingDetails";
import GrubPacActionBar from "@/components/features/grubpacs/components/GrubPacActionBar";
import BoxRemovalModal from "@/components/features/grubpacs/modals/BoxRemovalModal";
import ActivateBoxModal from "@/components/features/grubpacs/modals/ActivateBoxModal";
import { showError, showSuccess } from "@/components/ui/toast";
import grubpacService from "@/services/grubpacs";
import { useGrubPacSearch } from "@/components/features/grubpacs/hooks/useGrubPacSearch";
import {
  apiGrubPacToSuspendedItem,
    type ApiGrubPacSearchResult,
        type ApiGrubPac,
    type GrubPacListData,
} from "@/types/domain/grubpacs";
import type { GroupCollapseTableGroup } from "@/types/ui";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import SuspendedBoxFilterModal, {
  type SuspendedFilterState,
  defaultSuspendedFilters,
} from "@/components/features/shared/filter/SuspendedBoxFilterModal";

const SUSPENDED_COLUMNS: Array<"name" | "added" | "suspended" | "actions"> = ["name", "added", "suspended", "actions"];

type SuspendedGrubPacGroup = GroupCollapseTableGroup<SuspendedBoxRow>;

interface SuspendedGrubPacsListProps {
    className?: string;
}

export default function SuspendedGrubPacsList({ className = "" }: SuspendedGrubPacsListProps) {
    const router = useRouter();
    const [grubpacs, setGrubpacs] = useState<SuspendedBoxRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);
    const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isGrouped, setIsGrouped] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [modalTargetIds, setModalTargetIds] = useState<Set<string>>(new Set());
    const [showRemovalModal, setShowRemovalModal] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [activeFilters, setActiveFilters] = useState<SuspendedFilterState>(defaultSuspendedFilters);
    const [totalEntries, setTotalEntries] = useState(0);
    const [isActivateAll, setIsActivateAll] = useState(false);
    // Track restaurant per grubpac id for grouping and hasRestaurantAssignment check
    const [restaurantById, setRestaurantById] = useState<Record<string, string>>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    const isSearchMode = searchTerm.trim().length > 0;
    const {
        results: searchResults,
        isSearching,
        searchError,
    } = useGrubPacSearch({
        query: searchTerm,
        limit: 50,
        status: "suspended",
    });

    const searchResultIds = useMemo(
        () => new Set(searchResults.map((item) => String(item.id))),
        [searchResults],
    );

    const fetchSuspended = useCallback(async (filters: SuspendedFilterState = activeFilters) => {
        setIsLoading(true);
        try {
            const params: Parameters<typeof grubpacService.getList>[0] = {
                status: "suspended",
                limit: pageSize,
                page: currentPage,
            };
            if (isGrouped) params.group_by = "restaurants";
            if (filters.restaurantAssigned) params.restaurant_assigned = "on";
            if (filters.vehicleAssigned) params.vehicle_assigned = "on";

            const res = await grubpacService.getList(params);
            if (res.success && res.data) {
                const flat: GrubPacListData = res.data;
                const grouped = (flat as { groups?: Record<string, unknown> }).groups;
                const apiItems: ApiGrubPac[] = grouped && typeof grouped === "object"
                    ? flattenWrappedGroupRecord<ApiGrubPac>(grouped)
                    : ((flat as { boxes?: ApiGrubPac[] }).boxes ?? []);
                const rows: SuspendedBoxRow[] = apiItems.map((g) => {
                    const item = apiGrubPacToSuspendedItem(g);
                    return {
                        id: String(item.id),
                        name: item.name ?? `Box ${item.id}`,
                        identifier: item.identifier,
                        added: item.added ?? "",
                        suspended: item.suspended ?? "",
                        hasBox: item.hasBox,
                        hasLock: g.lock !== null,
                        hasVehicle: g.vehicle_number !== null,
                    };
                });
                setGrubpacs(rows);
                setTotalEntries(
                    ((res.pagination as any)?.total_count as number | undefined)
                    ?? (flat as any).total_count
                    ?? (flat as any).count
                    ?? rows.length,
                );
                // Build restaurant lookup (group field from mapper = restaurant name or "Unassigned")
                const rMap: Record<string, string> = {};
                apiItems.forEach((g) => {
                    rMap[g.id] = g.restaurant_boxes?.[0]?.restaurant?.name ?? g.restaurants?.[0]?.name ?? "Unassigned";
                });
                setRestaurantById(rMap);
            } else {
                setGrubpacs([]);
                setTotalEntries(0);
                setRestaurantById({});
                if (res.error) {
                    showError(res.error);
                }
            }
        } catch (err) {
            console.error("[SuspendedGrubPacsList] fetch error:", err);
            showError("Failed to load suspended GrubPacs.");
        } finally {
            setIsLoading(false);
        }
    }, [activeFilters, currentPage, isGrouped]);

    useEffect(() => {
        void fetchSuspended();
    }, [fetchSuspended]);

    // Apply active filters client-side (GrubLock status only; linked-info goes via API)
    const filterByActiveFilters = useCallback((items: SuspendedBoxRow[]) => {
        const { grubLockStatus } = activeFilters;
        return items.filter((row) => {
            if (grubLockStatus.length > 0) {
                const lockAvailable = row.hasLock === true;
                const wantsLock = grubLockStatus.includes("Lock available");
                const wantsNoLock = grubLockStatus.includes("No lock available");
                if (wantsLock && !wantsNoLock && !lockAvailable) return false;
                if (wantsNoLock && !wantsLock && lockAvailable) return false;
            }
            return true;
        });
    }, [activeFilters]);

    const filteredGrubPacs = useMemo<SuspendedBoxRow[]>(() => {
        const baseRows = filterByActiveFilters(grubpacs);
        if (!isSearchMode) return baseRows;

        const matchedRows = baseRows.filter((row) => searchResultIds.has(String(row.id)));
        const existingIds = new Set(matchedRows.map((row) => String(row.id)));

        const fallbackRows: SuspendedBoxRow[] = searchResults
            .filter((item) => !existingIds.has(String(item.id)))
            .map((item) => {
                const code = item.box_display_id ?? item.box_id;
                return {
                    id: String(item.id),
                    name: item.name,
                    identifier: code ? `#${code}` : undefined,
                    added: "",
                    suspended: "",
                    hasBox: Boolean(item.box_id),
                    hasLock: false,
                    hasVehicle: false,
                };
            });

        return [...matchedRows, ...fallbackRows];
    }, [grubpacs, filterByActiveFilters, isSearchMode, searchResultIds, searchResults]);

    const searchableRestaurantById = useMemo(() => {
        if (!isSearchMode) return restaurantById;

        const next = { ...restaurantById };
        searchResults.forEach((item) => {
            const key = String(item.id);
            if (!next[key]) next[key] = "Unassigned";
        });
        return next;
    }, [isSearchMode, restaurantById, searchResults]);

    const filteredGroups = useMemo<SuspendedGrubPacGroup[]>(() => {
        const groupMap = new Map<string, SuspendedBoxRow[]>();

        filteredGrubPacs.forEach((grubpac) => {
            const restaurant = searchableRestaurantById[grubpac.id] ?? "Unassigned";
            const existing = groupMap.get(restaurant) ?? [];
            groupMap.set(restaurant, [...existing, grubpac]);
        });

        const groups = Array.from(groupMap.entries()).map(([restaurant, items]) => ({
            name: restaurant,
            items,
        }));

        return groups.sort((a, b) => {
            if (a.name === "Unassigned") return 1;
            if (b.name === "Unassigned") return -1;
            return String(a.name).localeCompare(String(b.name));
        });
    }, [filteredGrubPacs, searchableRestaurantById]);

    const hasData = filteredGrubPacs.length > 0;

    // Server-side pagination
    const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
    const paginatedGrubPacs = filteredGrubPacs;
    const pageItemIds = useMemo(
        () => new Set(paginatedGrubPacs.map((item) => item.id)),
        [paginatedGrubPacs],
    );
    const pageSelectedIds = useMemo(
        () => new Set(Array.from(selectedIds).filter((id) => pageItemIds.has(id))),
        [selectedIds, pageItemIds],
    );

    const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSearchSuggestionSelect = useCallback((item: ApiGrubPacSearchResult) => {
        setSearchTerm(item.name ?? "");

        if (isGrouped) {
            const groupIndex = filteredGroups.findIndex((group) =>
                (group.items ?? []).some((entry) => String(entry.id) === String(item.id)),
            );
            if (groupIndex !== -1) {
                setOpenIndex(groupIndex);
            }
            return;
        }

        const rowIndex = filteredGrubPacs.findIndex((row) => String(row.id) === String(item.id));
        if (rowIndex !== -1) {
            setCurrentPage(Math.floor(rowIndex / pageSize) + 1);
        }
    }, [filteredGrubPacs, filteredGroups, isGrouped, pageSize]);

    const handleGoBack = () => {
        router.back();
    };

    const handleActivateAll = () => {
        setIsActivateAll(true);
        setModalTargetIds(new Set(filteredGrubPacs.map((g) => g.id)));
        setShowActivateModal(true);
    };

    const handleActivateGrubPac = (row: SuspendedBoxRow) => {
        setIsActivateAll(false);
        setModalTargetIds(new Set([row.id]));
        setShowActivateModal(true);
    };

    const handleDeleteGrubPac = (row: SuspendedBoxRow) => {
        setModalTargetIds(new Set([row.id]));
        setShowRemovalModal(true);
    };

    const handleRowClick = (row: SuspendedBoxRow) => {
        router.push(`/grubpacs/suspended/details?id=${row.id}`);
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };

    const handleActivateSelection = () => {
        if (selectedIds.size > 0) {
            setIsActivateAll(false);
            setModalTargetIds(new Set(selectedIds));
            setShowActivateModal(true);
        }
    };

    const handleDeleteSelection = () => {
        if (selectedIds.size > 0) {
            setModalTargetIds(new Set(selectedIds));
            setShowRemovalModal(true);
        }
    };

    const handleConfirmActivate = async () => {
        const ids = Array.from(modalTargetIds);
        try {
            const hasAssignment = isActivateAll ? filteredGrubPacs.some(g => restaurantById[g.id] && restaurantById[g.id] !== "Unassigned") : hasRestaurantAssignment;
            const res = await grubpacService.reactivate(
                ids.length > 0 ? ids : undefined,
                isActivateAll,
                hasAssignment ? false : undefined
            );
            if (!res.success) {
                showError(res.error ?? "Failed to activate selected GrubPacs.");
                return;
            }
            if (isActivateAll) {
                setGrubpacs([]);
                setSelectedIds(new Set());
                setTotalEntries(0);
            } else {
                setGrubpacs((prev) => prev.filter((g) => !modalTargetIds.has(g.id)));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    modalTargetIds.forEach((id) => next.delete(id));
                    return next;
                });
            }
            setModalTargetIds(new Set());
            setShowActivateModal(false);
            setIsActivateAll(false);
            showSuccess(isActivateAll ? "All GrubPacs activated successfully." : "Selected GrubPacs activated successfully.", "");
        } catch (error) {
            console.error("[SuspendedGrubPacsList] activate selected error:", error);
            showError("Failed to activate selected GrubPacs.");
        }
    };

    const handleConfirmReassign = async () => {
        const ids = Array.from(modalTargetIds);
        try {
            const res = await grubpacService.reactivate(
                ids.length > 0 ? ids : undefined,
                isActivateAll,
                true
            );
            if (!res.success) {
                showError(res.error ?? "Failed to activate and reassign selected GrubPacs.");
                return;
            }
            if (isActivateAll) {
                setGrubpacs([]);
                setSelectedIds(new Set());
                setTotalEntries(0);
            } else {
                setGrubpacs((prev) => prev.filter((g) => !modalTargetIds.has(g.id)));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    modalTargetIds.forEach((id) => next.delete(id));
                    return next;
                });
            }
            setModalTargetIds(new Set());
            setShowActivateModal(false);
            setIsActivateAll(false);
            showSuccess(isActivateAll ? "All GrubPacs activated and reassigned." : "Selected GrubPacs activated and reassigned.", "");
        } catch (error) {
            console.error("[SuspendedGrubPacsList] reassign confirm error:", error);
            showError("Failed to activate and reassign selected GrubPacs.");
        }
    };

    const handleConfirmRemoval = async () => {
        // Suspended GrubPacs deletion is not allowed for now.
        // Keep current data unchanged and just close the confirmation modal.
        setShowRemovalModal(false);
        setModalTargetIds(new Set());
    };

    // Check if any selected box has a restaurant assignment
    const selectedBoxes = grubpacs.filter(g => modalTargetIds.has(g.id));
    const hasRestaurantAssignment = selectedBoxes.some(
        box => restaurantById[box.id] && restaurantById[box.id] !== "Unassigned"
    );
    const showSearchDropdown = isSearchFocused && searchTerm.trim().length > 0;

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden ${className}`}>
            {/* Sticky Header */}
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between px-[var(--gp-space-xl)] py-[var(--gp-space-l)] border-b border-[var(--gp-color-border-neutral-secondary)]">
                    <div className="flex items-center gap-[var(--gp-space-l)]">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center justify-center size-8 rounded-[var(--gp-radius-base)] hover:bg-[#EFF1F0] transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="#37493f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <h1 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-secondary)]">
                            Suspended GrubPacs
                        </h1>
                    </div>
                    {hasData && (
                        <Button
                            variant="primary"
                            appearance="solid"
                            state="press"
                            size="md"
                            onClick={handleActivateAll}
                            className="text-white font-medium"
                        >
                            <span>ACTIVATE ALL</span>
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between px-[var(--gp-space-xl)] py-[var(--gp-space-l)] border-b border-[var(--gp-color-border-neutral-secondary)]">
                    <div className="relative w-[240px]">
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
                                ) : searchResults.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">No suspended boxes found</div>
                                ) : (
                                    searchResults.slice(0, 6).map((item) => (
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
                    <div className="flex items-center gap-4">
                        <span className="font-normal text-[14px] leading-[22px] text-[#6B7971]">
                            {isSearching
                                ? "Searching..."
                                : `${totalEntries} entries`}
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <CheckBox
                                checked={isGrouped}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
                                    setIsSwitching(true);
                                    switchTimerRef.current = setTimeout(() => {
                                        setIsGrouped(checked);
                                        setIsSwitching(false);
                                    }, 150);
                                }}
                            />
                            <span className="text-lg text-[var(--color-neutral-secondary)]">
                                Grouped
                            </span>
                        </label>
                        <FilterButton
                            open={showFilterModal}
                            handleFilterClick={() => setShowFilterModal(!showFilterModal)}
                        />

                        <SuspendedBoxFilterModal
                            open={showFilterModal}
                            onClose={() => setShowFilterModal(false)}
                            initialFilters={activeFilters}
                            onApply={(filters) => {
                                setActiveFilters(filters);
                                setShowFilterModal(false);
                                void fetchSuspended(filters);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pt-4 space-y-6">

            {/* Table Section */}
            <div className="px-[var(--gp-space-xl)] py-[var(--gp-space-l)]">
                {isLoading || isSwitching ? (
                    <LoadingDetails entity="suspended grubpacs" />
                ) : !hasData ? (
                    <div className="px-4 pb-4">
                        <p className="text-[var(--color-neutral-light)] text-sm">
                            No suspended GrubPacs.
                        </p>
                    </div>
                ) : isGrouped ? (
                    <GroupCollapseTable
                        groups={filteredGroups}
                        openIndex={openIndex}
                        setOpenIndex={setOpenIndex}
                        renderTable={(group) => {
                            const groupItems = group.items ?? [];
                            const groupPageItemIds = new Set(groupItems.map((item) => item.id));
                            const groupPageSelectedIds = new Set(
                                Array.from(selectedIds).filter((id) => groupPageItemIds.has(id)),
                            );

                            return (
                                <GrubPacSuspendedBoxTable
                                    data={groupItems}
                                    columns={SUSPENDED_COLUMNS}
                                    selectable={true}
                                    selectedIds={groupPageSelectedIds}
                                    onSelectionChange={(ids) =>
                                        setSelectedIds((prev) => {
                                            const next = new Set(Array.from(prev).filter((id) => !groupPageItemIds.has(id)));
                                            ids.forEach((id) => next.add(id));
                                            return next;
                                        })
                                    }
                                    onActivate={handleActivateGrubPac}
                                    onDelete={handleDeleteGrubPac}
                                    onRowClick={handleRowClick}
                                />
                            );
                        }}
                        tableContainerClass="bg-white"
                        noResultsMessage={searchTerm ? "No boxes match your search." : "No boxes found."}
                        pageSize={50}
                    />
                ) : (
                    <>
                        {/* Pagination */}
                        <div className="mb-6">
                            <Pagination
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalItems={totalEntries}
                                onPrev={handlePrevPage}
                                onNext={handleNextPage}
                                className="w-full"
                            />
                        </div>

                        <GrubPacSuspendedBoxTable
                            data={paginatedGrubPacs}
                            columns={SUSPENDED_COLUMNS}
                            selectable={true}
                            selectedIds={pageSelectedIds}
                            onSelectionChange={(ids) =>
                                setSelectedIds((prev) => {
                                    const next = new Set(Array.from(prev).filter((id) => !pageItemIds.has(id)));
                                    ids.forEach((id) => next.add(id));
                                    return next;
                                })
                            }
                            onActivate={handleActivateGrubPac}
                            onDelete={handleDeleteGrubPac}
                            onRowClick={handleRowClick}
                        />
                    </>
                )}
            </div>

            {/* Selection Action Bar */}
            {selectedIds.size > 0 && (
                <GrubPacActionBar
                    selectedCount={selectedIds.size}
                    isGrouped={false}
                    onClearSelection={handleClearSelection}
                    onDelete={handleDeleteSelection}
                    onActivateBoxes={handleActivateSelection}
                />
            )}

            {/* Modals */}
            <BoxRemovalModal
                open={showRemovalModal}
                onClose={() => {
                    setShowRemovalModal(false);
                    setModalTargetIds(new Set());
                }}
                selectedCount={modalTargetIds.size}
                handleRemoveBoxes={handleConfirmRemoval}
                variant="suspended"
            />

            <ActivateBoxModal
                open={showActivateModal}
                onClose={() => {
                    setShowActivateModal(false);
                    setModalTargetIds(new Set());
                }}
                onReassign={handleConfirmReassign}
                onActivate={handleConfirmActivate}
                boxNames={Array.from(modalTargetIds).map(id => {
                    const grubpac = grubpacs.find(g => g.id === id);
                    return grubpac?.name || id;
                })}
                hasRestaurantAssignment={isActivateAll ? filteredGrubPacs.some(g => restaurantById[g.id] && restaurantById[g.id] !== "Unassigned") : hasRestaurantAssignment}
                loading={false}
                isActivateAll={isActivateAll}
                totalCount={filteredGrubPacs.length}
                firstBoxName={filteredGrubPacs[0]?.name ?? ""}
            />
        </div>
    </div>
    );
}
