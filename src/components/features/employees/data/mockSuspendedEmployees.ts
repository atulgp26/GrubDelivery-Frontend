import type { SuspendedEmployee } from "../types";

export type { SuspendedEmployee };

const generateMockEmployees = (): SuspendedEmployee[] => {
  const employees: SuspendedEmployee[] = [];
  
  for (let i = 1; i <= 3; i++) {
    employees.push({
      id: `suspended-emp-${i}`,
      name: "Ravi Kumar",
      employeeId: `DP123${i}`,
      role: i % 2 === 0 ? "Driver" : "Manager",
      restaurantName: "DA PIZZA PLACE",
      added: "12 Jan '25",
      suspended: "Today",
    });
  }
  
  for (let i = 4; i <= 7; i++) {
    employees.push({
      id: `suspended-emp-${i}`,
      name: "Ravi Kumar",
      employeeId: `DP123${i}`,
      role: i % 2 === 0 ? "Driver" : "Manager",
      restaurantName: undefined,
      added: "12 Jan '25",
      suspended: "Today",
    });
  }
  
  return employees;
};

export const MOCK_SUSPENDED_EMPLOYEES: SuspendedEmployee[] = generateMockEmployees();

