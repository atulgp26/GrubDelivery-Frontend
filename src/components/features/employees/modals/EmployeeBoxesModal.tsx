"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { ChangeEvent } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import Pagination from "@/components/ui/Pagination";
import FigIcon from "@/components/ui/FigIcon";
import { GrubPacBoxTable, type GrubPacBoxRow } from "@/components/ui/all-boxes-table";
import { showSuccess, showError } from "@/components/ui/toast";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import grubpacService from "@/services/grubpacs";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import BoxFilterModal, {
  defaultBoxFilters,
  type FilterState,
} from "@/components/features/shared/filter/BoxFilterModal";
import { useEmployeeBoxes } from "../hooks/useEmployeeBoxes";
import type { EmployeeBox } from "../types";
import type {
  ApiGrubPac,
  GrubPacListData,
  GrubPacListFlatResponse,
  GrubPacListGroupedResponse,
} from "@/types/domain/grubpacs";

export type { EmployeeBox };

type ModalView = "assigned" | "editAssigned" | "excluded" | "editExcluded";

interface EmployeeBoxesModalProps {
  open: boolean;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string;
  onEditList?: () => void;
  onConfirmRemoval?: (boxIds: string[]) => Promise<void> | void;
  onViewExcludedBoxes?: () => void;
  loading?: boolean;
  restaurantId?: string;
  staticBoxes?: EmployeeBox[]; 
}
interface ModalState {
  view: ModalView;
  searchTerm: string;
  showOfflineBoxes: boolean;
  filterState: FilterState;
  currentPage: number;
  showFilterModal: boolean;
  isEditMode: boolean;
  selectedBoxIds: Set<string>;
}

const PAGE_SIZE = 50;

function BoxTableSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-2 pb-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`box-skeleton-${index}`}
          className="h-14 rounded bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  );
}

/** Map EmployeeBox → GrubPacBoxRow used by the ui/all-boxes-table component */
function toTableRow(box: EmployeeBox): GrubPacBoxRow {
  return {
    id: box.id,
    name: box.name,
    identifier: box.details,
    power: box.power === "on" ? "ON" : "OFF",
    added: box.added,
  };
}

function flattenGroups(data: GrubPacListData | undefined): ApiGrubPac[] {
  if (!data) return [];

  if ("boxes" in data && Array.isArray((data as GrubPacListFlatResponse).boxes)) {
    return (data as GrubPacListFlatResponse).boxes;
  }



  const groups = (data as GrubPacListGroupedResponse).groups ?? {};
  return flattenWrappedGroupRecord<ApiGrubPac>(groups as Record<string, unknown>);
}

// eslint-disable-next-line @next/next/no-serialize-warnings
export default function EmployeeBoxesModal({
  open,
  onClose,
  employeeId,
  employeeName,
  onEditList,
  restaurantId,
  staticBoxes,   // ← ADD
  onConfirmRemoval,
  onViewExcludedBoxes,
  loading: externalLoading = false,
}: EmployeeBoxesModalProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLDivElement | null>(null);
  const [filterPanelPosition, setFilterPanelPosition] = useState({ top: 88, right: 12 });
  const [filterPanelMaxHeight, setFilterPanelMaxHeight] = useState(420);
  const [state, setState] = useState<ModalState>({
    view: "assigned",
    searchTerm: "",
    showOfflineBoxes: false,
    filterState: defaultBoxFilters,
    currentPage: 1,
    showFilterModal: false,
    isEditMode: false,
    selectedBoxIds: new Set(),
  });

  const isExcludedView =
    state.view === "excluded" || state.view === "editExcluded";

  const updateFilterPanelPosition = useCallback(() => {
    if (!modalContentRef.current || !filterButtonRef.current) return;

    const containerRect = modalContentRef.current.getBoundingClientRect();
    const buttonRect = filterButtonRef.current.getBoundingClientRect();
    const nextTop = Math.max(8, buttonRect.bottom - containerRect.top + 8);
    const availableHeight = Math.floor(containerRect.height - nextTop - 24);

    setFilterPanelPosition({
      top: nextTop,
      right: Math.max(8, containerRect.right - buttonRect.right),
    });
    setFilterPanelMaxHeight(Math.max(240, availableHeight));
  }, []);

  const {
    boxes,
    excludedBoxes,
    totalCount,
    isLoading,
    refetch,
  } = useEmployeeBoxes({
    employeeId,
    restaurantId,
    fetchExcluded: isExcludedView,
    showOfflineBoxes: state.showOfflineBoxes,
enabled: !staticBoxes && open && Boolean(employeeId || restaurantId),
    page: state.currentPage,
    limit: PAGE_SIZE,
    searchTerm: state.searchTerm,
    filters: state.filterState,
  });

  useEffect(() => {
    if (open) {
      setState({
        view: "assigned",
        searchTerm: "",
        showOfflineBoxes: false,
        filterState: defaultBoxFilters,
        currentPage: 1,
        showFilterModal: false,
        isEditMode: false,
        selectedBoxIds: new Set(),
      });
    }
  }, [open]);

  useEffect(() => {
    if (!(open && state.showFilterModal)) return;

    updateFilterPanelPosition();
    window.addEventListener("resize", updateFilterPanelPosition);

    return () => {
      window.removeEventListener("resize", updateFilterPanelPosition);
    };
  }, [open, state.showFilterModal, updateFilterPanelPosition]);

const activeBoxes = staticBoxes ?? (isExcludedView ? excludedBoxes : boxes);
const totalEntries = staticBoxes ? staticBoxes.length : totalCount;
  const hasMoreThanThreeRows = totalEntries > 3;
  const totalPages = Math.ceil(totalEntries / PAGE_SIZE);

  // Convert to the shape GrubPacBoxTable expects
  const tableRows: GrubPacBoxRow[] = useMemo(
    () => activeBoxes.map(toTableRow),
    [activeBoxes]
  );

  const handleEditList = () => {
    if (state.view === "assigned") {
      onEditList?.();
      setState((prev) => ({ ...prev, view: "editAssigned", isEditMode: true }));
    } else if (state.view === "excluded") {
      setState((prev) => ({ ...prev, view: "editExcluded", isEditMode: true }));
    }
  };

  const handleSelectionChange = (ids: Set<string>) => {
    setState((prev) => ({ ...prev, selectedBoxIds: ids }));
  };

  const handleBack = () => {
    if (state.view === "editAssigned") {
      setState((prev) => ({
        ...prev,
        view: "assigned",
        isEditMode: false,
        selectedBoxIds: new Set(),
      }));
    } else if (state.view === "excluded") {
      setState((prev) => ({ ...prev, view: "assigned", currentPage: 1 }));
    } else if (state.view === "editExcluded") {
      setState((prev) => ({
        ...prev,
        view: "excluded",
        isEditMode: false,
        selectedBoxIds: new Set(),
      }));
    }
  };


  const handleConfirmRemoval = async () => {
    if (state.selectedBoxIds.size === 0 || !employeeId || isRemoving) {
      return;
    }

    setIsRemoving(true);

    try {
      const selectedIds = Array.from(state.selectedBoxIds);
      const response = await grubpacService.removeEmployeeFromBoxes({
        box_ids: selectedIds,
        employee_ids: [employeeId],
      });

      if (!response.success) {
        showError(response.error ?? "Failed to remove employee from selected boxes.");
        return;
      }

      await onConfirmRemoval?.(selectedIds);
      await refetch();
      
      showSuccess(
        "Removed",
        selectedIds.length > 1
          ? "Employee removed from selected boxes."
          : "Employee removed from box."
      );

      if (state.view === "editAssigned") {
        setState((prev) => ({
          ...prev,
          view: "assigned",
          isEditMode: false,
          selectedBoxIds: new Set(),
        }));
      } else if (state.view === "editExcluded") {
        setState((prev) => ({
          ...prev,
          view: "excluded",
          isEditMode: false,
          selectedBoxIds: new Set(),
        }));
      }
    } finally {
      setIsRemoving(false);
    }
  };

  const isBusy = externalLoading || isLoading || isRemoving;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        width="w-[90vw] max-w-[1200px]"
        height="h-auto max-h-[90vh]"
        hideClose
        noXPadding
        closeOnOutsideClick={false}
      >
        <div
          ref={modalContentRef}
          className="flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            {(state.view === "editAssigned" ||
              state.view === "excluded" ||
              state.view === "editExcluded") ? (
              <Button
                variant="neutral"
                appearance="ghost"
                onClick={handleBack}
                className="flex items-center gap-1 font-medium text-xl"
                aria-label="Back"
              >
                <FigIcon name="left-arrow" size={20} />
                <span className="ml-1">BACK</span>
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="neutral"
              appearance="ghost"
              className="rounded-lg w-8 h-8 p-0 flex items-center justify-center hover:bg-[var(--color-neutral-50)] transition-colors shrink-0"
              onClick={onClose}
              aria-label="Close"
            >
              <FigIcon name="x" size={28} />
            </Button>
          </div>

          {/* ── Header ── */}
          <div className="px-6 pt-2 pb-4 relative">

            {/* Row 1: title + VIEW EXCLUDED BOXES (only in assigned view) */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] leading-10">
                {state.view === "assigned" && (employeeName ?? "Employee")}
                {state.view === "editAssigned" && "Select boxes to remove access"}
                {state.view === "excluded" && "Boxes not permitted"}
                {state.view === "editExcluded" && "Remove boxes from exclusion list"}
              </h2>
              {state.view === "assigned" && (
                <Button
                  variant="primary"
                  appearance="ghost"
                  onClick={() => {
                    onViewExcludedBoxes?.();
                    setState((prev) => ({ ...prev, view: "excluded", currentPage: 1 }));
                  }}
                  className="font-medium text-base uppercase whitespace-nowrap"
                >
                  <span>View excluded boxes</span>
                </Button>
              )}
            </div>

            {/* Row 2: search + entries + offline toggle + filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-[240px]">
                <SearchInput
                  value={state.searchTerm}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }))
                  }
                  placeholder="Search box"
                  clearable={true}
                  onClear={() => setState((prev) => ({ ...prev, searchTerm: "", currentPage: 1 }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[14px] leading-[22px] text-[#6B7971] font-normal">
                  {totalEntries} entries
                </span>
                <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                  <CustomCheckbox
                    checked={state.showOfflineBoxes}
                    onChange={(e: ChangeEvent<HTMLInputElement> | undefined) =>
                      setState((prev) => ({ ...prev, showOfflineBoxes: e?.target.checked ?? false }))
                    }
                    colorVar="--color-brand-default"
                    hoverState="peer-hover:bg-[var(--sidebar-active-bg)] peer-hover:border-[var(--color-brand-default)]"
                    checkedHoverState="peer-hover:!bg-[var(--color-brand-default)] peer-hover:!border-[var(--color-brand-default)]"
                  />
                  <span className="text-lg text-[var(--color-neutral-secondary)]">
                    Show offline boxes
                  </span>
                </label>
                <div ref={filterButtonRef}>
                  <FilterButton
                    open={state.showFilterModal}
                    handleFilterClick={() => {
                      updateFilterPanelPosition();
                      setState((prev) => ({ ...prev, showFilterModal: !prev.showFilterModal }));
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── Pagination bar (always visible, full-width, matches Figma grey header) ── */}
          {totalEntries > 0 && (
            <div className="px-6">
              <Pagination
                currentPage={state.currentPage}
                pageSize={PAGE_SIZE}
                totalItems={totalEntries}
                onPrev={() =>
                  setState((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))
                }
                onNext={() =>
                  setState((prev) => ({
                    ...prev,
                    currentPage: Math.min(totalPages, prev.currentPage + 1),
                  }))
                }
              />
            </div>
          )}

          {/* ── Table (ui/all-boxes-table) ── */}
          <div className={`overflow-y-auto px-6 ${hasMoreThanThreeRows ? "max-h-[286px]" : ""}`}>
            {isLoading ? (
              <BoxTableSkeleton />
            ) : totalEntries === 0 ? (
              <div className="py-8 text-center text-[16px] leading-[24px] text-[var(--color-neutral-secondary)]">
                {state.searchTerm ? "No boxes found matching search" : "No boxes available"}
              </div>
            ) : (
              <GrubPacBoxTable
                data={tableRows}
                columns={
                  isExcludedView ? ["name", "power", "added"] : ["name", "status", "power", "added"]
                }
                selectable={state.view === "editAssigned" || state.view === "editExcluded"}
                selectedIds={state.selectedBoxIds}
                onSelectionChange={handleSelectionChange}
              />
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-[var(--color-stroke-neutral)]">
            {state.view === "editAssigned" || state.view === "editExcluded" ? (
              <div className="flex items-center justify-between">
                <div className="text-base text-[var(--color-neutral-secondary)]">
                  {state.selectedBoxIds.size > 0
                    ? `${state.selectedBoxIds.size} box${state.selectedBoxIds.size > 1 ? "es" : ""} selected.`
                    : "No box selected yet!"}
                </div>
                <Button
                  variant="neutral"
                  appearance="outlined"
                  state="press"
                  onClick={handleConfirmRemoval}
                  disabled={state.selectedBoxIds.size === 0 || isBusy}
                  className="w-full max-w-xs disabled:bg-[var(--color-neutral-secondary-bg)] disabled:border-[var(--color-stroke-neutral)] disabled:text-[var(--color-box-border)] disabled:shadow-none h-[48px]"
                >
                  <span>CONFIRM REMOVAL</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <Button
                  variant="primary"
                  appearance="outlined"
                  state="press"
                  onClick={handleEditList}
                  disabled={isBusy || totalEntries === 0}
                  className="w-full flex items-center justify-center gap-2 h-[48px]"
                >
                  <FigIcon 
                    name="Employee/Popup/pen" 
                    size={24} 
                    className={`w-5 h-5 ${(isBusy || totalEntries === 0) ? "grayscale opacity-40" : ""}`}
                  />
                  <span>EDIT LIST</span>
                </Button>
              </div>
            )}
          </div>

          <BoxFilterModal
            open={state.showFilterModal}
            onClose={() => setState((prev) => ({ ...prev, showFilterModal: false }))}
            initialFilters={state.filterState}
            embedded={true}
            panelClassName="pointer-events-auto w-[min(520px,calc(100%-1rem))]"
            panelStyle={{
              top: filterPanelPosition.top,
              right: filterPanelPosition.right,
              maxHeight: `${filterPanelMaxHeight}px`,
            }}
            onApply={(filters) =>
              setState((prev) => ({
                ...prev,
                filterState: filters,
                currentPage: 1,
                showFilterModal: false,
              }))
            }
          />
        </div>
      </Modal>
    </>
  );
}
