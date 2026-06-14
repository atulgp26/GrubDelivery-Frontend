"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeListContent from "@/components/features/employees/components/EmployeeListContent";
import AddEmployeeModal from "@/components/features/employees/modals/AddEmployeeModal";
import { showError, showSuccess } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";
import { useEmployeeData } from "@/components/features/employees/hooks/useEmployeeData";
import { COUNTRIES } from "@/components/ui/phone-dropdown";
import type { Employee } from "@/types/domain/employees";
import type { EmployeeFormData } from "@/components/features/employees/modals/AddEmployeeModal";

const EMPLOYEE_NAME_MAX_LENGTH = 20;

export default function EmployeeListScreen() {
  const router = useRouter();
  const [groupBy, setGroupBy] = useState<"boxes" | "restaurants">("boxes");
  const [selectedApiRoles, setSelectedApiRoles] = useState<Array<"manager" | "delivery">>([]);

  const areApiRolesEqual = (
    left: Array<"manager" | "delivery">,
    right: Array<"manager" | "delivery">,
  ) => {
    if (left.length !== right.length) return false;
    return left.every((item, index) => item === right[index]);
  };

  const handleGroupByChange = useCallback((next: "boxes" | "restaurants") => {
    setGroupBy((prev) => (prev === next ? prev : next));
  }, []);

  const handleRolesChange = useCallback((next: Array<"manager" | "delivery">) => {
    setSelectedApiRoles((prev) => (areApiRolesEqual(prev, next) ? prev : next));
  }, []);

  const {
    groups,
    isLoading,
    isPageLoading,
    createEmployee,
    updateEmployee,
    suspendEmployees,
    deleteEmployees,
    reassignEmployees,
    dropdowns,
    isLoadingDropdowns,
    fetchDropdowns,
    refetchGroup,
    refetchActive,
    totalEntries,
  } = useEmployeeData({ 
    includeSuspended: false, 
    groupBy, 
    roles: selectedApiRoles,
    includeDropdowns: false,
    includeManagerBoxCounts: false 
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsAddModalOpen(true);
    void fetchDropdowns();
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsAddModalOpen(true);
    void fetchDropdowns();
  };

  const handleViewSuspended = () => {
    router.push("/employees/suspended");
  };

  const handleSubmitEmployee = async (data: EmployeeFormData) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    const dialCode =
      COUNTRIES.find((c) => c.code === data.countryCode)?.dialCode ?? data.countryCode;
    const firstName = data.firstName.trim().slice(0, EMPLOYEE_NAME_MAX_LENGTH);
    const lastName = data.lastName.trim().slice(0, EMPLOYEE_NAME_MAX_LENGTH);
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        const result = await updateEmployee({
          id: editingEmployee.id,
          email: data.email,
          first_name: firstName,
          last_name: lastName,
          country_code: dialCode,
          mobile_number: data.contact,
          employee_id: data.employeeId,
          role: data.role as "manager" | "delivery",
          restaurant_id: data.assignedRestaurant || null,
          joining_date: data.joiningDate,
        });

        if (result.success) {
          showSuccess("Updated", "Employee details updated successfully.");
          setIsAddModalOpen(false);
          setEditingEmployee(null);
        } else {
          showError(
            getContextualErrorMessage(
              "employee.update",
              result.error,
              "Could not update employee. Please try again.",
            ),
          );
        }
      } else {
        const result = await createEmployee({
          email: data.email,
          first_name: firstName,
          last_name: lastName,
          country_code: dialCode,
          mobile_number: data.contact,
          employee_id: data.employeeId,
          role: data.role as "manager" | "delivery",
          restaurant_id: data.assignedRestaurant || null,
          joining_date: data.joiningDate,
        });

        if (result.success) {
          showSuccess("Added", "Employee added successfully.");
          setIsAddModalOpen(false);
          setEditingEmployee(null);
        } else {
          showError(
            getContextualErrorMessage(
              "employee.create",
              result.error,
              "Could not create employee. Please try again.",
            ),
          );
        }
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleReassignEmployees = async (ids: string[], restaurantId: string | null) => {
    const result = await reassignEmployees({ ids, restaurant_id: restaurantId });
    if (result.success) {
      showSuccess(
        "Updated",
        ids.length > 1
          ? "Employees reassigned successfully."
          : "Employee reassigned successfully.",
      );
    } else {
      showError(
        getContextualErrorMessage(
          "assignment.employee",
          result.error,
          "Could not reassign employee(s). Please try again.",
        ),
      );
    }
    return result;
  };

  const handleSuspendEmployees = async (ids: string[]) => {
    const result = await suspendEmployees(ids);
    if (result.success) {
      showSuccess(
        "Suspended",
        ids.length > 1
          ? "Employees suspended successfully."
          : "Employee suspended successfully.",
      );
    } else {
      showError(
        getContextualErrorMessage(
          "employee.suspend",
          result.error,
          "Could not suspend employee(s). Please try again.",
        ),
      );
    }
    return result;
  };

  const handleDeleteEmployees = async (ids: string[]) => {
    const result = await deleteEmployees(ids);
    if (result.success) {
      showSuccess(
        "Removed",
        ids.length > 1 ? "Employees removed successfully." : "Employee removed successfully.",
      );
    } else {
      showError(
        getContextualErrorMessage(
          "employee.delete",
          result.error,
          "Could not delete employee(s). Please try again.",
        ),
      );
    }
    return result;
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="flex flex-col ml-4 h-full overflow-hidden">
      <EmployeeListContent
        groups={groups}
        isLoading={isLoading || isPageLoading}
        onAddEmployee={handleAddEmployee}
         onRefetch={refetchActive} 
        onEditEmployee={handleEditEmployee}
        onViewSuspended={handleViewSuspended}
        onSuspendEmployees={handleSuspendEmployees}
        onDeleteEmployees={handleDeleteEmployees}
        onReassignEmployees={handleReassignEmployees}
        restaurants={dropdowns?.restaurants}
        onGroupByChange={handleGroupByChange}
        onRolesChange={handleRolesChange}
        onPageChange={refetchGroup}
        totalEntries={totalEntries}
      />
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEmployee}
        loading={isSubmitting}
        isLoadingDropdowns={isLoadingDropdowns}
        employee={editingEmployee}
        restaurants={dropdowns?.restaurants}
        roles={dropdowns?.roles}
      />
    </div>
  );
}

