"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import Pagination from "@/components/ui/Pagination";
import { GrubPacBoxTable, type GrubPacBoxRow } from "@/components/ui/all-boxes-table";
import FigIcon from "@/components/ui/FigIcon";
import { RestaurantResourceModalTable, type RestaurantResourceRow } from "../components/ViewListEmployeeTable";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import { useDebounce } from "@/lib/hooks/useDebounce";
import BoxFilterModal, {
  defaultBoxFilters,
  type FilterState,
} from "@/components/features/shared/filter/BoxFilterModal";

export type ResourceTabType = "grubpacs" | "employees";

export interface GrubPac {
  id: string;
  name: string;
  details: string;
  power: "on" | "off" | "warning";
  driver?: string;
  added: string;
  isLocked: boolean;
  isOffline: boolean;
}

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  joinedDate: string;
  phone: string;
  email: string;
  role: string;
  boxCount: number;
  added: string;
  isAvailable?: boolean;
}

interface RestaurantResourcesModalProps {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
  tab?: ResourceTabType;
  initialEmployeeRoles?: string[];
  initialAvailableDriversOnly?: boolean;
  grubPacs?: GrubPac[];
  employees?: Employee[];
  onFetchEmployees?: (query: string, page: number, availableDriversOnly?: boolean, roles?: string[]) => void;
  onFetchGrubPacs?: (params: {
    page: number;
    query: string;
    showOfflineBoxes: boolean;
    filters: FilterState;
  }) => void;
  refreshToken?: number;
  employeeTotalEntries?: number;
  grubPacTotalEntries?: number;
  employeePageSize?: number;
  grubPacPageSize?: number;
  onReassignBoxes?: (boxIds: string[]) => void;
  onEditList?: (boxIds: string[]) => void;
  onRemoveEmployees?: (employeeIds: string[]) => void;
  loading?: boolean;
}

interface ModalState {
  activeTab: ResourceTabType;
  searchTerm: string;
  showOfflineBoxes: boolean;
  filterState: FilterState;
  currentPage: number;
  selectedBoxIds: Set<string>;
  selectedEmployeeIds: Set<string>;
  showFilterModal: boolean;
  selectedRoles: Array<string | number>;
  showAvailableDriversOnly: boolean;
  isEditMode: boolean;
}

export default function RestaurantResourcesModal({
  open,
  onClose,
  restaurantName,
  tab = "grubpacs",
  initialEmployeeRoles,
  initialAvailableDriversOnly = false,
  grubPacs = [],
  employees = [],
  onFetchEmployees,
  onFetchGrubPacs,
  refreshToken = 0,
  employeeTotalEntries,
  grubPacTotalEntries,
  employeePageSize = 10,
  grubPacPageSize = 10,
  onReassignBoxes,
  onEditList,
  onRemoveEmployees,
  loading = false,
}: RestaurantResourcesModalProps) {

  const [state, setState] = useState<ModalState>({
    activeTab: tab,
    searchTerm: "",
    showOfflineBoxes: false,
    filterState: defaultBoxFilters,
    currentPage: 1,
    selectedBoxIds: new Set(),
    selectedEmployeeIds: new Set(),
    showFilterModal: false,
    selectedRoles: tab === "employees"
      ? (initialEmployeeRoles && initialEmployeeRoles.length > 0 ? initialEmployeeRoles : ["driver", "manager"])
      : [],
    showAvailableDriversOnly: tab === "employees" ? initialAvailableDriversOnly : false,
    isEditMode: false,
  });
  const debouncedEmployeeSearch = useDebounce(
    state.activeTab === "employees" ? state.searchTerm : "",
    300,
  );
  const debouncedGrubPacSearch = useDebounce(
    state.activeTab === "grubpacs" ? state.searchTerm : "",
    300,
  );
  const [roleDropdownCloseSignal, setRoleDropdownCloseSignal] = useState(0);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLDivElement | null>(null);
  const [filterPanelPosition, setFilterPanelPosition] = useState({ top: 88, right: 12 });
  const lastFetchedEmployeeSignatureRef = useRef<string | null>(null);
  const lastFetchedGrubPacsSignatureRef = useRef<string | null>(null);

  const updateFilterPanelPosition = useCallback(() => {
    if (!modalContentRef.current || !filterButtonRef.current) return;

    const containerRect = modalContentRef.current.getBoundingClientRect();
    const buttonRect = filterButtonRef.current.getBoundingClientRect();

    setFilterPanelPosition({
      top: Math.max(8, buttonRect.bottom - containerRect.top + 8),
      right: Math.max(8, containerRect.right - buttonRect.right),
    });
  }, []);

  useEffect(() => {
    if (!(state.activeTab === "grubpacs" && state.showFilterModal)) return;

    updateFilterPanelPosition();
    window.addEventListener("resize", updateFilterPanelPosition);

    return () => {
      window.removeEventListener("resize", updateFilterPanelPosition);
    };
  }, [state.activeTab, state.showFilterModal, updateFilterPanelPosition]);

  useEffect(() => {
    if (open) {
      lastFetchedEmployeeSignatureRef.current = null;
      lastFetchedGrubPacsSignatureRef.current = null;

      if (tab === "grubpacs" && onFetchGrubPacs) {
        const signature = `${refreshToken}:1::false:${JSON.stringify(defaultBoxFilters)}`;
        lastFetchedGrubPacsSignatureRef.current = signature;
        onFetchGrubPacs({
          page: 1,
          query: "",
          showOfflineBoxes: false,
          filters: defaultBoxFilters,
        });
      }

      if (tab === "employees" && onFetchEmployees) {
        const query = "";
        const roles = (initialEmployeeRoles && initialEmployeeRoles.length > 0)
          ? initialEmployeeRoles
          : ["driver", "manager"];
        const availableOnly = initialAvailableDriversOnly;
        const signature = `${refreshToken}:${query}:1:${availableOnly ? "active" : "all"}:${roles.join(",")}`;
        lastFetchedEmployeeSignatureRef.current = signature;
        onFetchEmployees(query, 1, availableOnly, roles);
      }

      setState((prev) => ({
        ...prev,
        activeTab: tab,
        searchTerm: "",
        showOfflineBoxes: false,
        currentPage: 1,
        selectedBoxIds: new Set(),
        selectedEmployeeIds: new Set(),
        showFilterModal: false,
        filterState: defaultBoxFilters,
        selectedRoles: tab === "employees"
          ? (initialEmployeeRoles && initialEmployeeRoles.length > 0 ? initialEmployeeRoles : ["driver", "manager"])
          : [],
        showAvailableDriversOnly: tab === "employees" ? initialAvailableDriversOnly : false,
        isEditMode: false,
      }));
    }
  }, [open, tab, onFetchEmployees, onFetchGrubPacs, refreshToken, initialEmployeeRoles, initialAvailableDriversOnly]);

  useEffect(() => {
    if (!open) return;

    if (state.activeTab === "grubpacs" && onFetchGrubPacs) {
      const query = debouncedGrubPacSearch.trim();
      const signature = `${refreshToken}:${state.currentPage}:${query}:${state.showOfflineBoxes}:${JSON.stringify(state.filterState)}`;

      if (lastFetchedGrubPacsSignatureRef.current === signature) return;

      lastFetchedGrubPacsSignatureRef.current = signature;
      onFetchGrubPacs({
        page: state.currentPage,
        query,
        showOfflineBoxes: state.showOfflineBoxes,
        filters: state.filterState,
      });
      return;
    }

    if (state.activeTab === "employees" && onFetchEmployees) {
      const query = debouncedEmployeeSearch.trim();
      const roles = state.selectedRoles.map(r => String(r));
      const signature = `${refreshToken}:${query}:${state.currentPage}:${state.showAvailableDriversOnly ? "active" : "all"}:${roles.join(",")}`;

      if (lastFetchedEmployeeSignatureRef.current === signature) return;

      lastFetchedEmployeeSignatureRef.current = signature;
      onFetchEmployees(query, state.currentPage, state.showAvailableDriversOnly, roles);
    }
  }, [
    debouncedEmployeeSearch,
    debouncedGrubPacSearch,
    onFetchEmployees,
    onFetchGrubPacs,
    open,
    refreshToken,
    state.activeTab,
    state.currentPage,
    state.filterState,
    state.showAvailableDriversOnly,
    state.showOfflineBoxes,
    state.selectedRoles,
  ]);

  const filteredData = useMemo(() => {
    const term = state.searchTerm.trim().toLowerCase();
    if (state.activeTab === "grubpacs") {
      if (!term) return grubPacs;
      return grubPacs.filter(
        (box) =>
          box.name.toLowerCase().includes(term) ||
          (box.details && box.details.toLowerCase().includes(term))
      );
    } else {
      if (!term) return employees;
      return employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          (emp.employeeId && emp.employeeId.toLowerCase().includes(term)) ||
          (emp.email && emp.email.toLowerCase().includes(term)) ||
          (emp.phone && emp.phone.toLowerCase().includes(term))
      );
    }
  }, [state.activeTab, state.searchTerm, grubPacs, employees]);

  const totalEntries = state.searchTerm.trim()
    ? filteredData.length
    : (state.activeTab === "grubpacs" ? (grubPacTotalEntries ?? grubPacs.length) : (employeeTotalEntries ?? employees.length));

  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / (state.activeTab === "grubpacs" ? grubPacPageSize : employeePageSize)),
  );

  const paginatedData = filteredData;

  const handleTabChange = (newTab: ResourceTabType) => {
    setState((prev) => ({
      ...prev,
      activeTab: newTab,
      currentPage: 1,
      selectedBoxIds: new Set(),
      selectedEmployeeIds: new Set(),
        showFilterModal: false,
      searchTerm: "",
        filterState: newTab === "grubpacs" ? defaultBoxFilters : prev.filterState,
      selectedRoles: newTab === "employees" ? ["driver", "manager"] : [],
      isEditMode: false,
    }));
  };

  const roleOptions = [
    { id: "manager", label: "Manager" },
    { id: "driver", label: "Driver" },
  ];

  const handleEmployeeSelect = (employeeId: string, checked: boolean) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedEmployeeIds);
      if (checked) {
        newSelected.add(employeeId);
      } else {
        newSelected.delete(employeeId);
      }
      return { ...prev, selectedEmployeeIds: newSelected };
    });
  };

  const handleEditList = () => {
    setState((prev) => ({
      ...prev,
      isEditMode: true,
      selectedBoxIds: new Set(),
      selectedEmployeeIds: new Set(),
    }));
  };

  const handleConfirmRemoval = () => {
    if (state.activeTab === "grubpacs") {
      onEditList?.(Array.from(state.selectedBoxIds));
      return;
    }

    if (onRemoveEmployees) {
      onRemoveEmployees(Array.from(state.selectedEmployeeIds));
      return;
    }

    setState((prev) => ({
      ...prev,
      isEditMode: false,
      selectedBoxIds: new Set(),
      selectedEmployeeIds: new Set(),
    }));
    onClose();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state.activeTab === "grubpacs") {
      setState((prev) => ({
        ...prev,
        selectedBoxIds: e.target.checked
          ? new Set(paginatedData.map((item) => (item as GrubPac).id))
          : new Set(),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedEmployeeIds: e.target.checked
          ? new Set(paginatedData.map((item) => (item as Employee).id))
          : new Set(),
      }));
    }
  };

  const allSelected =
    state.activeTab === "grubpacs"
      ? paginatedData.length > 0 &&
      paginatedData.every((item) => state.selectedBoxIds.has((item as GrubPac).id))
      : paginatedData.length > 0 &&
      paginatedData.every((item) => state.selectedEmployeeIds.has((item as Employee).id));

  const handleReassignBoxes = () => {
    if (state.activeTab !== "grubpacs") return;
    if (onReassignBoxes) {
      onReassignBoxes(Array.from(state.selectedBoxIds));
    }
  };

  const handleBackFromEdit = () => {
    setState((prev) => ({
      ...prev,
      isEditMode: false,
      selectedBoxIds: new Set(),
      selectedEmployeeIds: new Set(),
    }));
  };

  const handleOpenGrubPacsFromEmployees = () => {
    setState((prev) => ({
      ...prev,
      activeTab: "grubpacs",
      currentPage: 1,
      searchTerm: "",
      selectedEmployeeIds: new Set(),
      isEditMode: false,
    }));
  };

  const resourceRows = useMemo(() => {
    const employees = state.activeTab === "employees" ? paginatedData as Employee[] : [];
    return employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      identifier: `#${employee.employeeId} | Joined ${employee.joinedDate}`,
      contactInfo: {
        phone: employee.phone,
        email: employee.email,
      },
      role: employee.role.toLowerCase() as "manager" | "driver",
      box: employee.boxCount,
      added: employee.added,
    }));
  }, [paginatedData, state.activeTab]);

  const grubPacTableRows: GrubPacBoxRow[] = useMemo(() => {
    const boxes = state.activeTab === "grubpacs" ? (paginatedData as GrubPac[]) : [];
    return boxes.map((box) => ({
      id: box.id,
      name: box.name,
      identifier: box.details,
      power: box.isOffline ? "OFF" : (box.power === "on" || box.power === "warning") ? "ON" : "OFF",
      driver: box.driver,
      added: box.added,
      isLocked: box.isLocked,
    }));
  }, [paginatedData, state.activeTab]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[90vw] max-w-[1200px]"
      height="h-[86vh] max-h-[680px] min-h-[620px]"
      noXPadding
      headerLeft={
        state.isEditMode ? (
          <Button
            variant="neutral"
            appearance="ghost"
            onClick={handleBackFromEdit}
            className="flex items-center gap-1 font-medium text-xl"
            aria-label="Back"
          >
            <FigIcon name="left-arrow" size={20} />
            <span className="ml-1">BACK</span>
          </Button>
        ) : undefined
      }
    >
      <div
        ref={modalContentRef}
        className="flex flex-col h-full relative"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseDownCapture={(e) => {
          const target = e.target as HTMLElement | null;
          if (target?.closest('[data-multiselect-root="true"]')) return;
          setRoleDropdownCloseSignal((prev) => prev + 1);
        }}
      >
        <div className="px-6 pt-2 pb-4 relative">
          <div className="flex items-end justify-between -mb-px">
            <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
              {state.isEditMode
                ? state.activeTab === "grubpacs"
                  ? "Select boxes to remove"
                  : "Select employees to remove"
                : (restaurantName.length > 25 ? `${restaurantName.substring(0, 25)}...` : restaurantName)}
            </h2>

            {!state.isEditMode && (
            <div className="flex gap-6 items-end">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabChange("grubpacs");
                }}
                className={`w-[108px] h-[32px] px-3 text-sm font-medium transition-all duration-150 rounded-lg flex items-center justify-center ${state.activeTab === "grubpacs"
                  ? "text-[var(--gp-color-text-brand-active)] border-[var(--color-brand-default)] bg-[var(--sidebar-active-bg)] underline shadow-[0_0_0_2px_rgba(254,87,32,0.40)]"
                  : "text-[#6B7971] border-transparent hover:bg-[var(--sidebar-active-bg)] hover:rounded-lg hover:text-[var(--gp-color-text-brand-active)] hover:underline active:!bg-[var(--color-admin-profile-border)] active:!text-[var(--color-filter-text)] active:!shadow-[0_0_0_2px_rgba(254,87,32,0.40)] active:underline focus:underline focus:!bg-[var(--sidebar-active-bg)] focus:!shadow-[0_0_0_2px_rgba(254,87,32,0.40)] focus:!text-[var(--color-filter-text)]"
                  }`}
              >
                GRUBPACS
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabChange("employees");
                }}
                className={`w-[108px] h-[32px] px-3 text-sm font-medium transition-all duration-150 rounded-lg flex items-center justify-center ${state.activeTab === "employees"
                  ? "text-[var(--gp-color-text-brand-active)] border-[var(--color-brand-default)] bg-[var(--sidebar-active-bg)] underline shadow-[0_0_0_2px_rgba(254,87,32,0.40)]"
                  : "text-[#6B7971] border-transparent hover:bg-[var(--sidebar-active-bg)] hover:rounded-lg hover:text-[#6B7971] hover:underline active:!bg-[var(--color-admin-profile-border)] active:!text-[var(--color-filter-text)] active:!shadow-[0_0_0_2px_rgba(254,87,32,0.40)] active:underline focus:underline focus:!bg-[var(--sidebar-active-bg)] focus:!shadow-[0_0_0_2px_rgba(254,87,32,0.40)] focus:!text-[var(--color-filter-text)]"
                  }`}
              >
                EMPLOYEES
              </button>
            </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-[240px]">
              <SearchInput
                value={state.searchTerm}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }))
                }
                placeholder={state.activeTab === "grubpacs" ? "Search box" : "Search employee"}
                clearable={true}
                onClear={() => setState((prev) => ({ ...prev, searchTerm: "", currentPage: 1 }))}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[14px] leading-[22px] text-[#6B7971] font-normal whitespace-nowrap">
                {totalEntries} entries
              </span>

              {state.activeTab === "grubpacs" && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                    <CustomCheckbox
                      checked={state.showOfflineBoxes}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          showOfflineBoxes: e?.target.checked ?? false,
                          currentPage: 1,
                          selectedBoxIds: new Set(),
                        }))
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
                </>
              )}
              {state.activeTab === "employees" && (
                <>
                  <div className="w-[200px]">
                    <MultiSelectDropdown
                      options={roleOptions}
                      selected={state.selectedRoles}
                      setSelected={(ids) =>
                        setState((prev) => ({ ...prev, selectedRoles: ids }))
                      }
                      placeholder="Manager and Driver"
                      placeholderColor="!text-[var(--color-neutral-light)]"
                      closeSignal={roleDropdownCloseSignal}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                    <CustomCheckbox
                      checked={state.showAvailableDriversOnly}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          showAvailableDriversOnly: e?.target.checked ?? false,
                          currentPage: 1,
                          selectedEmployeeIds: new Set(),
                        }))
                      }
                      colorVar="--color-brand-default"
                      hoverState="peer-hover:bg-[var(--sidebar-active-bg)] peer-hover:border-[var(--color-brand-default)]"
                      checkedHoverState="peer-hover:!bg-[var(--color-brand-default)] peer-hover:!border-[var(--color-brand-default)]"
                    />
                    <span className="text-sm text-[var(--color-neutral-secondary)]">
                      Available drivers only
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 min-h-[48px]">
            {totalEntries > 0 && (
              <Pagination
                currentPage={state.currentPage}
                pageSize={state.activeTab === "grubpacs" ? grubPacPageSize : employeePageSize}
                totalItems={totalEntries}
                onPrev={() => {
                  const nextPage = Math.max(1, state.currentPage - 1);
                  setState((prev) => ({ ...prev, currentPage: nextPage }));
                }}
                onNext={() => {
                  const nextPage = Math.min(totalPages, state.currentPage + 1);
                  setState((prev) => ({ ...prev, currentPage: nextPage }));
                }}
              />
            )}
          </div>

        </div>

        <div className="px-6 pb-4">
          {state.activeTab === "grubpacs" ? (
            loading ? (
              <div className="h-[320px] space-y-3 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) :
            paginatedData.length === 0 ? (
              <div className="h-[320px] flex items-center justify-center text-[var(--color-neutral-secondary)]">
                {state.searchTerm ? "No boxes match your search." : "No boxes found."}
              </div>
            ) : (
              <div className="h-[320px] overflow-y-auto">
                <GrubPacBoxTable
                  data={grubPacTableRows}
                  columns={["name", "status", "power", "driver", "added"]}
                  selectable={state.isEditMode}
                  selectedIds={state.selectedBoxIds}
                  onSelectionChange={(ids) =>
                    setState((prev) => ({ ...prev, selectedBoxIds: ids }))
                  }
                />
              </div>
            )
          ) : (
            <div>
              {loading ? (
                <div className="h-[320px] space-y-3 py-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : paginatedData.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center text-[var(--color-neutral-secondary)]">
                  {state.searchTerm
                    ? "No employees match your search."
                    : "No employees found."}
                </div>
              ) : (
                <div className="h-[320px] overflow-y-auto">
                  <RestaurantResourceModalTable
                    data={resourceRows}
                    columns={["name", "contactInfo", "role", "box", "added"]}
                    isEditMode={state.isEditMode}
                    selectedIds={state.selectedEmployeeIds}
                    onSelectionChange={handleEmployeeSelect}
                    allSelected={allSelected}
                    onSelectAll={handleSelectAll}
                    onViewBoxesList={handleOpenGrubPacsFromEmployees}
                    onAssignBoxes={handleOpenGrubPacsFromEmployees}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {((state.isEditMode) || (state.activeTab === "grubpacs" && (onReassignBoxes || onEditList))) && (
          <div className="px-6 pt-4 pb-0 border-t border-[var(--color-stroke-neutral)]">
            {state.isEditMode ? (
              <div className="flex items-center justify-between">
                <div className="text-base text-[var(--color-neutral-secondary)]">
                  {state.activeTab === "grubpacs"
                    ? state.selectedBoxIds.size > 0
                      ? `${state.selectedBoxIds.size} box${state.selectedBoxIds.size > 1 ? "es" : ""} selected.`
                      : "No box selected yet!"
                    : state.selectedEmployeeIds.size > 0
                      ? `${state.selectedEmployeeIds.size} employee${state.selectedEmployeeIds.size > 1 ? "s" : ""} selected.`
                      : "No employee selected yet!"}
                </div>
                <Button
                  variant="primary"
                  appearance="outlined"
                  state="press"
                  onClick={handleConfirmRemoval}
                  disabled={
                    (state.activeTab === "grubpacs" ? state.selectedBoxIds.size === 0 : state.selectedEmployeeIds.size === 0) || loading
                  }
                  className="w-full max-w-xs disabled:bg-[var(--color-neutral-secondary-bg)] disabled:border-[var(--color-stroke-neutral)] disabled:text-[var(--color-box-border)] disabled:shadow-none h-[48px] hover:underline-offset-4"
                >
                  <span>CONFIRM REMOVAL</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {onReassignBoxes && (
                  <Button
                    variant="primary"
                    appearance="outlined"
                    state="press"
                    onClick={handleReassignBoxes}
                    disabled={loading || totalEntries === 0}
                    className="flex-1 flex items-center font-medium justify-center gap-2 h-12 hover:underline-offset-4"
                  >
                    <FigIcon name="Group/Popup/refresh" className="w-5 h-5" />
                    <span>REASSIGN ALL BOXES</span>
                  </Button>
                )}
                {onEditList && (
                  <Button
                    variant="primary"
                    appearance="outlined"
                    state="press"
                    onClick={handleEditList}
                    disabled={loading || totalEntries === 0}
                    className="flex-1 flex items-center font-medium justify-center gap-2 h-12 hover:underline-offset-4"
                  >
                    <FigIcon name="Employee/Popup/pen" size={24} className="w-5 h-5" />
                    <span>EDIT LIST</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        <BoxFilterModal
          open={state.activeTab === "grubpacs" && state.showFilterModal}
          onClose={() => setState((prev) => ({ ...prev, showFilterModal: false }))}
          initialFilters={state.filterState}
          embedded={true}
          panelClassName="pointer-events-auto w-[min(520px,calc(100%-1rem))] max-h-[calc(100%-220px)]"
          panelStyle={{ top: filterPanelPosition.top, right: filterPanelPosition.right }}
          onApply={(filters) =>
            setState((prev) => ({
              ...prev,
              showFilterModal: false,
              currentPage: 1,
              selectedBoxIds: new Set(),
              filterState: filters,
            }))
          }
        />
      </div>
    </Modal>
  );
}

