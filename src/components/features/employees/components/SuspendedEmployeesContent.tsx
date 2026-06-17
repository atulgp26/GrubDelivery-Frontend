"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import type { GroupCollapseTableGroup } from "@/types/ui";
import EmployeeActionBar from "./EmployeeActionBar";
import GroupCollapseTable from "@/components/ui/GroupCollapseTable";
import LoadingDetails from "@/components/ui/LoadingDetails";
import EmployeeGroupTable from "./EmployeeGroupTable";
import EmployeeToolbar from "./EmployeeToolbar";
import {
	EmployeeDataTable,
	type EmployeeRow,
	type ColumnId,
} from "../table/employee-data-table";
import { useSuspendedEmployeeTableState } from "../hooks/useEmployeeTableState";
import { useSuspendedEmployeeTableFilters } from "../hooks/useEmployeeTableFilters";
import { useEmployeeSearch } from "../hooks/useEmployeeSearch";
import type { SuspendedEmployee } from "../data/mockSuspendedEmployees";

function suspendedEmployeeToRow(employee: SuspendedEmployee): EmployeeRow {
	const identifier = `#${employee.employeeId}${employee.restaurantName ? ` | ${employee.restaurantName}` : ""}`;
	return {
		id: employee.id,
		name: employee.name,
		identifier,
		role: employee.role as "Manager" | "Driver",
		added: employee.added,
		suspended: employee.suspended,
		status: "suspended",
		boxCount: 0,
		boxConnected: false,
	};
}

interface SuspendedEmployeesContentProps {
  employees?: SuspendedEmployee[];
  groupedEmployees?: GroupCollapseTableGroup<SuspendedEmployee>[];
  isLoading?: boolean;
  isPageLoading?: boolean;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onGroupedPageChange?: (
    group: GroupCollapseTableGroup<SuspendedEmployee>,
    page: number,
  ) => void;
  onGroupedModeChange?: (grouped: boolean) => void;
  onSelectedApiRolesChange?: (roles: Array<"manager" | "delivery">) => void;
  onActivate?: (employeeId: string) => void;
  onActivateAll?: (employeeIds: string[]) => void;
  onDelete?: (employeeId: string) => void;
  onDeleteSelection?: (employeeIds: string[]) => void;
}

export default function SuspendedEmployeesContent({
  employees = [],
  groupedEmployees = [],
  isLoading = false,
  isPageLoading = false,
  currentPage = 1,
  pageSize = 50,
  totalItems = 0,
  onPageChange,
  onGroupedPageChange,
  onGroupedModeChange,
  onSelectedApiRolesChange,
  onActivate,
  onActivateAll,
  onDelete,
  onDeleteSelection,
}: SuspendedEmployeesContentProps) {
  const router = useRouter();
  const {
    searchTerm,
    selectedIds,
    openIndex,
    isGrouped,
    selectedRoles,
    showAvailableDriversOnly,
    setSearchTerm,
    clearSearch,
    handleRowSelect,
    handleSelectAll,
    clearSelection,
    setOpenIndex,
    setIsGrouped,
    setSelectedRoles,
    setShowAvailableDriversOnly,
    roleOptions,
  } = useSuspendedEmployeeTableState(employees);

  const mapUiRolesToApiRoles = (roles: Array<string | number>) => {
    const mapped = roles
      .map((role) => (String(role) === "driver" ? "delivery" : String(role)))
      .filter(
        (role): role is "manager" | "delivery" =>
          role === "manager" || role === "delivery",
      );

    return Array.from(new Set(mapped)).sort();
  };

  const handleRolesChange = (roles: Array<string | number>) => {
    setSelectedRoles(roles);
    onSelectedApiRolesChange?.(mapUiRolesToApiRoles(roles));
  };

  const { filteredGroups, totalEntries } = useSuspendedEmployeeTableFilters({
    employees,
    groupedEmployees,
    searchTerm,
    isGrouped,
    selectedRoles,
    showAvailableDriversOnly,
    totalItems,
  });

  const { results: searchSuggestions, isSearching, searchError } = useEmployeeSearch({
    query: searchTerm,
    limit: 50,
    status: "suspended",
  });

  const isActivateAllDisabled = isLoading || totalEntries === 0;


  const handleActivate = (employeeId: string) => {
    if (onActivate) {
      onActivate(employeeId);
    }
  };

  const handleActivateAll = () => {
    if (isActivateAllDisabled) return;
    if (onActivateAll) {
      // Pass undefined to signal bulk reactivation of ALL suspended employees
      onActivateAll(undefined as any);
      clearSelection();
    }
  };

  const handleDelete = (employeeId: string) => {
    if (onDelete) {
      onDelete(employeeId);
    }
  };

  const handleDeleteSelectionAction = () => {
    if (selectedIds.size > 0) {
      if (onDeleteSelection) {
        onDeleteSelection(Array.from(selectedIds));
      } else if (onDelete) {
        Array.from(selectedIds).forEach((id) => {
          onDelete(id);
        });
      }
      clearSelection();
    }
  };

  const handleActivateSelection = () => {
    if (onActivateAll && selectedIds.size > 0) {
      onActivateAll(Array.from(selectedIds));
      clearSelection();
    }
  };

  const handleGroupedChange = (grouped: boolean) => {
    setIsGrouped(grouped);
    setShowAvailableDriversOnly(false);
    // Grouped role filters should start empty (no preselection).
    setSelectedRoles([]);
    onSelectedApiRolesChange?.([]);
    onGroupedModeChange?.(grouped);
  };

  const navigateToLogs = (employee: SuspendedEmployee) => {
    const qs = new URLSearchParams();
    qs.set("employeeId", employee.id);
    qs.set("employeeName", employee.name);
    if (employee.employeeId) qs.set("employeeCode", employee.employeeId);
    if (employee.role) qs.set("role", employee.role);
    if (employee.restaurantName) qs.set("restaurantName", employee.restaurantName);
    qs.set("status", "Suspended");
    if (employee.added) qs.set("joinedDate", employee.added);
    qs.set("boxCount", "0");

    router.push(`/employees/logs?${qs.toString()}`);
  };

  const handleGoBack = () => {
    router.back();
  };


  if (!isGrouped) {
    const allEmployees = filteredGroups.flatMap((group) => group.items ?? []);
    const allData = allEmployees.map(suspendedEmployeeToRow);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = allData;
    const SUSPENDED_COLUMNS: ColumnId[] = ["name", "message", "role", "added", "suspended", "actions"];

    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* Sticky Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-[var(--gp-space-xl)] py-[var(--gp-space-l)]">
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
                Suspended Employees
              </h1>
            </div>
            <Button
              variant="primary"
              appearance="solid"
              state="press"
              size="md"
              onClick={handleActivateAll}
              disabled={isActivateAllDisabled}
              className="text-white font-medium"
            >
              <span>ACTIVATE ALL</span>
            </Button>
          </div>

          <div className="px-[var(--gp-space-xl)] py-[var(--gp-space-l)]">
            <EmployeeToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSearchClear={clearSearch}
              totalEntries={totalEntries}
              isGrouped={isGrouped}
              onGroupedChange={handleGroupedChange}
              selectedRoles={selectedRoles}
              onRolesChange={handleRolesChange}
              showAvailableDriversOnly={showAvailableDriversOnly}
              onAvailableDriversOnlyChange={setShowAvailableDriversOnly}
              roleOptions={roleOptions}
              showRoleFilter={true}
              searchSuggestions={searchSuggestions}
              isSearching={isSearching}
              searchError={searchError}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 pt-4 space-y-6">
          <div className="px-[var(--gp-space-xl)] py-[var(--gp-space-l)]">
            {isLoading ? (
              <LoadingDetails entity="suspended employees" />
            ) : allData.length === 0 ? (
              <div className="px-4 pb-4">
                <p className="text-[var(--color-neutral-light)] text-sm">
                  {searchTerm ? "No employees match your search." : "No suspended employees found."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <Pagination
                    currentPage={safePage}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPrev={() => onPageChange?.(Math.max(1, safePage - 1))}
                    onNext={() => onPageChange?.(Math.min(totalPages, safePage + 1))}
                  />
                </div>
                <EmployeeDataTable
                  data={paginatedData}
                  columns={SUSPENDED_COLUMNS}
                  selectedIds={selectedIds}
                  onSelectionChange={(ids) => {
                    allEmployees.forEach((emp) => {
                      const shouldBeSelected = ids.has(emp.id);
                      const isSelected = selectedIds.has(emp.id);
                      if (shouldBeSelected !== isSelected) {
                        handleRowSelect(emp.id, shouldBeSelected);
                      }
                    });
                  }}
                  onActivate={(row) => handleActivate(row.id)}
                  onDelete={(row) => handleDelete(row.id)}
                  onAllBoxes={undefined}
                  onMenuClick={(row) => {
                    const emp = allEmployees.find((e) => e.id === row.id);
                    if (emp) navigateToLogs(emp);
                  }}
                />
              </>
            )}
          </div>

          <EmployeeActionBar
            selectedCount={selectedIds.size}
            onClearSelection={clearSelection}
            onDelete={handleDeleteSelectionAction}
            onActivate={handleActivateSelection}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-[var(--gp-space-xl)] py-[var(--gp-space-l)]">
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
              Suspended Employees
            </h1>
          </div>
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
        </div>

        <div className="px-[var(--gp-space-xl)] py-[var(--gp-space-l)]">
          <EmployeeToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearchClear={clearSearch}
            onSuggestionSelect={(emp) => {
              setSearchTerm(emp.name);
              const groupIndex = filteredGroups.findIndex((group) =>
                (group.items || []).some((item) => item.id === emp.id)
              );
              if (groupIndex !== -1) {
                setOpenIndex(groupIndex);
              }
            }}
            totalEntries={totalEntries}
            isGrouped={isGrouped}
            onGroupedChange={handleGroupedChange}
            selectedRoles={selectedRoles}
            onRolesChange={handleRolesChange}
            showAvailableDriversOnly={showAvailableDriversOnly}
            onAvailableDriversOnlyChange={setShowAvailableDriversOnly}
            roleOptions={roleOptions}
            showRoleFilter={true}
            searchSuggestions={searchSuggestions}
            isSearching={isSearching}
            searchError={searchError}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pt-4 space-y-6">

      <div className="px-[var(--gp-space-xl)] py-[var(--gp-space-l)]">
        {isLoading ? (
          <LoadingDetails entity="suspended employees" />
        ) : (
          <GroupCollapseTable
            groups={filteredGroups}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            isPageLoading={isPageLoading}
            onPageChange={onGroupedPageChange}
            renderTable={(group) => (
              <EmployeeGroupTable
                mode="suspended"
                group={group}
                selectedIds={selectedIds}
                onRowSelect={handleRowSelect}
                onRowClick={navigateToLogs}
                onActivate={handleActivate}
                onDelete={handleDelete}
              />
            )}
            tableContainerClass="bg-white"
            noResultsMessage=""
            pageSize={pageSize}
          />
        )}
      </div>

      <EmployeeActionBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onDelete={handleDeleteSelectionAction}
        onActivate={handleActivateSelection}
      />
      </div>
    </div>
  );
}
