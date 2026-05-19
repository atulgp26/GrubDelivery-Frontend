"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeListEmptyState from "@/components/features/employees/components/EmployeeListEmptyState";
import AddEmployeeModal from "@/components/features/employees/modals/AddEmployeeModal";
import { useEmployeeData } from "@/components/features/employees/hooks/useEmployeeData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { COUNTRIES } from "@/components/ui/phone-dropdown";
import type { EmployeeFormData } from "@/components/features/employees/modals/AddEmployeeModal";

const EMPLOYEE_NAME_MAX_LENGTH = 50;

export default function EmployeesPage() {
  const router = useRouter();
  const { createEmployee, dropdowns, groups, isLoading, isLoadingDropdowns, fetchDropdowns } = useEmployeeData({
    includeActive: true,
    includeSuspended: false,
    includeDropdowns: false,
    includeManagerBoxCounts: false,
    activeLimit: 1,
    groupBy: null,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [statusAlert, setStatusAlert] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const hasEmployees = useMemo(
    () => groups.some((group) => (group.items?.length ?? 0) > 0),
    [groups],
  );

  useEffect(() => {
    if (!isLoading && hasEmployees) {
      router.replace("/employees/list");
    }
  }, [hasEmployees, isLoading, router]);

  if (isLoading || hasEmployees) {
    return null;
  }

  const handleSubmit = async (data: EmployeeFormData) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const dialCode =
      COUNTRIES.find((country) => country.code === data.countryCode)?.dialCode ?? data.countryCode;
    const role =
      data.role === "Driver" ? "delivery" :
      data.role === "Manager" ? "manager" :
      (data.role as "manager" | "delivery");
    const firstName = data.firstName.trim().slice(0, EMPLOYEE_NAME_MAX_LENGTH);
    const lastName = data.lastName.trim().slice(0, EMPLOYEE_NAME_MAX_LENGTH);

    try {
      const result = await createEmployee({
        email: data.email,
        first_name: firstName,
        last_name: lastName,
        country_code: dialCode,
        mobile_number: data.contact,
        employee_id: data.employeeId,
        role,
        restaurant_id: data.assignedRestaurant || null,
        joining_date: data.joiningDate,
      });

      if (result.success) {
        setStatusAlert({
          variant: "success",
          message: "Employee added successfully.",
        });
        setIsAddModalOpen(false);
        router.push("/employees/list");
        return;
      }

      setStatusAlert({
        variant: "error",
        message: result.error ?? "Failed to add employee.",
      });
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
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
      <EmployeeListEmptyState
        onAddEmployee={() => {
          setIsAddModalOpen(true);
          void fetchDropdowns();
        }}
        topRight={
          <Button
            variant="primary"
            appearance="ghost"
            state="press"
            className="hover:underline"
            onClick={() => router.push("/employees/list")}
          >
            KNOW MORE
          </Button>
        }
      />
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        loading={isSubmitting}
        isLoadingDropdowns={isLoadingDropdowns}
        employee={null}
        restaurants={dropdowns?.restaurants}
        roles={dropdowns?.roles}
      />
    </>
  );
}
