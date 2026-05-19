import { useMemo } from "react";
import { mockSuspendedEmployeesData } from "@/components/features/grubpacs/data/mockSuspendedEmployees";
import type { SuspendedEmployeeItem, SuspendedEmployeeGroup } from "@/types/domain/grubpacs";

interface UseSuspendedEmployeesReturn {
  suspendedEmployeesData: SuspendedEmployeeItem[];
  groupedData: SuspendedEmployeeGroup[];
  departments: Array<{ name: string; value: string }>;
}

export const useGrubPacsSuspendedEmployees = (): UseSuspendedEmployeesReturn => {
  // Group suspended employees by department
  const groupedData = useMemo(() => {
    const groups: Record<string, SuspendedEmployeeItem[]> = {};

    mockSuspendedEmployeesData.forEach((employee) => {
      const department = employee.department || "Unassigned";
      if (!groups[department]) {
        groups[department] = [];
      }
      groups[department].push(employee);
    });

    return Object.entries(groups).map(([department, employees]) => ({
      name: department,
      id: department.toLowerCase().replace(/\s+/g, "-"),
      items: employees,
      emptyMessage: `No suspended employees in ${department}`,
    }));
  }, []);

  // Get departments for filter
  const departments = useMemo(() => {
    const uniqueDepartments = [
      ...new Set(mockSuspendedEmployeesData.map((emp) => emp.department)),
    ];
    return uniqueDepartments.map((dept) => ({ name: dept, value: dept }));
  }, []);

  return {
    suspendedEmployeesData: mockSuspendedEmployeesData,
    groupedData,
    departments,
  };
};
