"use client";

import { useCallback, useMemo, useState } from "react";
import SuspendedEmployeesContent from "./components/SuspendedEmployeesContent";
import ReactivateEmployeeModal from "./modals/ReactivateEmployeeModal";
import DeleteEmployeeModal from "./modals/DeleteEmployeeModal";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getContextualErrorMessage } from "@/lib/errors";
import type { SuspendedEmployee } from "./types";

export default function SuspendedEmployeesScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApiRoles, setSelectedApiRoles] = useState<Array<"manager" | "delivery">>([]);
  const [isGrouped, setIsGrouped] = useState(false);
  const pageSize = 50;

  const normalizeRoles = (roles: Array<"manager" | "delivery">) =>
    Array.from(new Set(roles)).sort();

  const areApiRolesEqual = (
    left: Array<"manager" | "delivery">,
    right: Array<"manager" | "delivery">,
  ) => {
    const normalizedLeft = normalizeRoles(left);
    const normalizedRight = normalizeRoles(right);
    if (normalizedLeft.length !== normalizedRight.length) return false;
    return normalizedLeft.every((item, index) => item === normalizedRight[index]);
  };

  const handleSuspendedRolesChange = useCallback((next: Array<"manager" | "delivery">) => {
    const normalizedNext = normalizeRoles(next);
    setSelectedApiRoles((prev) => (areApiRolesEqual(prev, normalizedNext) ? prev : normalizedNext));
    setCurrentPage(1);
  }, []);

  const {
    suspendedEmployees: employees,
    suspendedGroups,
    isSuspendedLoading: loading,
    isPageLoading,
    suspendedTotalEntries,
    suspendedSummary,
    isSummaryLoading,
    refetchSuspendedGroup,
    fetchSuspendedSummary,
    reactivateEmployees,
    deleteEmployees,
  } = useEmployeeData({
    includeActive: false,
    includeDropdowns: false,
    suspendedPage: currentPage,
    suspendedLimit: pageSize,
    suspendedRoles: selectedApiRoles,
    suspendedGroupBy: isGrouped ? "restaurants" : undefined,
  });
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [statusAlert, setStatusAlert] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const selectedEmployees = useMemo(() => {
    return employees.filter((emp) => selectedEmployeeIds.includes(emp.id));
  }, [employees, selectedEmployeeIds]);

  const employeeNames = useMemo(() => {
    return selectedEmployees.map((emp) => emp.name);
  }, [selectedEmployees]);

  const hasRestaurantAssignment = useMemo(() => {
    if (isAllSelected) return true; // Assume true for bulk activate all to show reassign option
    return selectedEmployees.some((emp) => emp.restaurantName);
  }, [selectedEmployees, isAllSelected]);

  const deletingEmployees = useMemo(() => {
    if (deletingEmployeeId) {
      return employees.filter((emp) => emp.id === deletingEmployeeId);
    }
    if (selectedEmployeeIds.length > 0) {
      return employees.filter((emp) => selectedEmployeeIds.includes(emp.id));
    }
    return [];
  }, [employees, deletingEmployeeId, selectedEmployeeIds]);

  const handleActivate = (employeeId: string) => {
    setSelectedEmployeeIds([employeeId]);
    setIsAllSelected(false);
    setShowReactivateModal(true);
    void fetchSuspendedSummary(selectedApiRoles);
  };

  const handleActivateAll = (employeeIds: string[]) => {
    if (employeeIds === null || employeeIds === undefined) {
      setIsAllSelected(true);
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employeeIds);
      setIsAllSelected(false);
    }
    setShowReactivateModal(true);
    void fetchSuspendedSummary(selectedApiRoles);
  };

  const handleDelete = (employeeId: string) => {
    setDeletingEmployeeId(employeeId);
    setSelectedEmployeeIds([]);
    setShowDeleteModal(true);
  };

  const handleDeleteSelection = (employeeIds: string[]) => {
    setSelectedEmployeeIds(employeeIds);
    setDeletingEmployeeId(null);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const idsToDelete = deletingEmployees.map((e) => e.id);
    if (idsToDelete.length > 0) {
      const result = await deleteEmployees(idsToDelete);
      if (result.success) {
        setStatusAlert({
          variant: "success",
          message: idsToDelete.length > 1 ? "Employees deleted successfully." : "Employee deleted successfully.",
        });
        setShowDeleteModal(false);
        setDeletingEmployeeId(null);
        setSelectedEmployeeIds([]);
      } else {
        setStatusAlert({
          variant: "error",
          message: getContextualErrorMessage(
            "employee.delete",
            result.error,
            "Could not delete employee(s). Please try again.",
          ),
        });
      }
    }
  };

  const handleReassign = async () => {
    const ids = isAllSelected ? employees.map((e) => e.id) : selectedEmployeeIds;
    const result = await reactivateEmployees(ids, true, isAllSelected);
    if (result.success) {
      setStatusAlert({
        variant: "success",
        message:
          isAllSelected || selectedEmployeeIds.length > 1
            ? "Employees reactivated successfully."
            : "Employee reactivated successfully.",
      });
      setShowReactivateModal(false);
      setSelectedEmployeeIds([]);
      setIsAllSelected(false);
    } else {
      setStatusAlert({
        variant: "error",
        message: getContextualErrorMessage(
          "employee.reactivate",
          result.error,
          "Could not reactivate employee(s). Please try again.",
        ),
      });
    }
  };

  const handleActivateDirect = async () => {
    const ids = isAllSelected ? employees.map((e) => e.id) : selectedEmployeeIds;
    const result = await reactivateEmployees(ids, false, isAllSelected);
    if (result.success) {
      setStatusAlert({
        variant: "success",
        message:
          isAllSelected || selectedEmployeeIds.length > 1
            ? "Employees reactivated successfully."
            : "Employee reactivated successfully.",
      });
      setShowReactivateModal(false);
      setSelectedEmployeeIds([]);
      setIsAllSelected(false);
    } else {
      setStatusAlert({
        variant: "error",
        message: getContextualErrorMessage(
          "employee.reactivate",
          result.error,
          "Could not reactivate employee(s). Please try again.",
        ),
      });
    }
  };

  const handleCloseReactivateModal = () => {
    setShowReactivateModal(false);
    setSelectedEmployeeIds([]);
    setIsAllSelected(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingEmployeeId(null);
    setSelectedEmployeeIds([]);
  };

  const handleSuspendInstead = () => {
    setShowDeleteModal(false);
    setDeletingEmployeeId(null);
  };

  const getEmployeeName = () => {
    if (deletingEmployeeId) {
      return deletingEmployees[0]?.name || "";
    }
    return deletingEmployees[0]?.name || "";
  };

  const getEmployeeCount = () => {
    if (deletingEmployeeId) {
      return 1;
    }
    return deletingEmployees.length;
  };

  return (
    <div className="h-full">
      {statusAlert && (
        <div className="fixed top-2 left-2 right-2 z-[9999]">
          <Alert
            variant={statusAlert.variant}
            appearance="solid"
            autoDismiss
            dismissTime={4000}
            onDismiss={() => setStatusAlert(null)}
          >
            <AlertDescription>{statusAlert.message}</AlertDescription>
          </Alert>
        </div>
      )}
      <SuspendedEmployeesContent
        employees={employees}
        groupedEmployees={suspendedGroups}
        isLoading={loading}
        isPageLoading={isPageLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={suspendedTotalEntries}
        onPageChange={setCurrentPage}
        onGroupedPageChange={refetchSuspendedGroup}
        onGroupedModeChange={setIsGrouped}
        onSelectedApiRolesChange={handleSuspendedRolesChange}
        onActivate={handleActivate}
        onActivateAll={handleActivateAll}
        onDelete={handleDelete}
        onDeleteSelection={handleDeleteSelection}
      />

      <ReactivateEmployeeModal
        open={showReactivateModal}
        onClose={handleCloseReactivateModal}
        onReassign={hasRestaurantAssignment ? handleReassign : undefined}
        onActivate={handleActivateDirect}
        employeeNames={isAllSelected && employees.length > 0 ? [employees[0].name] : employeeNames}
        hasRestaurantAssignment={hasRestaurantAssignment}
        isActivateAll={isAllSelected}
        totalManagers={suspendedSummary?.managers}
        totalDrivers={suspendedSummary?.drivers}
      />

      <DeleteEmployeeModal
        open={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        // onSuspend={handleSuspendInstead}
        employeeName={getEmployeeName()}
        employeeCount={getEmployeeCount()}
        loading={false}
      />
    </div>
  );
}

