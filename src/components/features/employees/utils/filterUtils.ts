import type { GroupCollapseTableGroup } from "@/types/ui";

export interface FilterableEmployee {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  restaurantName?: string;
  email?: string;
  phone?: string;
  isAvailable?: boolean;
  connectedBoxesStatus?: boolean;
}

export function filterEmployeesBySearch<T extends FilterableEmployee>(
  employees: T[],
  searchTerm: string
): T[] {
  if (!searchTerm) {
    return employees;
  }

  const lowered = searchTerm.toLowerCase();
  return employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(lowered) ||
      employee.employeeId.toLowerCase().includes(lowered) ||
      employee.role.toLowerCase().includes(lowered) ||
      employee.restaurantName?.toLowerCase().includes(lowered) ||
      employee.email?.toLowerCase().includes(lowered) ||
      employee.phone?.toLowerCase().includes(lowered)
  );
}

export function filterEmployeesByRole<T extends FilterableEmployee>(
  employees: T[],
  selectedRoles: Array<string | number>
): T[] {
  if (selectedRoles.length === 0) {
    return employees;
  }

  return employees.filter((employee) =>
    selectedRoles.includes(employee.role.toLowerCase())
  );
}

export function filterAvailableDrivers<T extends FilterableEmployee>(
  employees: T[]
): T[] {
  return employees.filter((employee) => {
    const isDriver = employee.role.toLowerCase() === "driver";
    if (!isDriver) return false;

    // Prefer explicit availability when the API provides it.
    if (typeof employee.isAvailable === "boolean") {
      return employee.isAvailable;
    }

    // Fallback for active employee list where connected status is provided.
    // Available driver means currently not connected to a box.
    if (typeof employee.connectedBoxesStatus === "boolean") {
      return employee.connectedBoxesStatus === false;
    }

    // If availability is unknown, don't include by default.
    return false;
  });
}

export function groupEmployeesByRestaurant<T extends FilterableEmployee>(
  employees: T[],
  getRestaurantName: (employee: T) => string = (emp) => emp.restaurantName || "Unassigned"
): GroupCollapseTableGroup<T>[] {
  const restaurantMap = new Map<string, T[]>();

  employees.forEach((employee) => {
    const restaurantName = getRestaurantName(employee);
    if (!restaurantMap.has(restaurantName)) {
      restaurantMap.set(restaurantName, []);
    }
    restaurantMap.get(restaurantName)!.push(employee);
  });

  const restaurantGroups: GroupCollapseTableGroup<T>[] = [];

  restaurantMap.forEach((employees, restaurantName) => {
    const emptyMessage = restaurantName === "Unassigned" 
      ? "All employees are assigned to their respective restaurants :)"
      : "No employee assigned to this restaurant";
    
    restaurantGroups.push({
      name: restaurantName,
      items: employees as T[],
      emptyMessage,
    });
  });

  const sorted = restaurantGroups.sort((a, b) => {
    const aName = String(a.name || "");
    const bName = String(b.name || "");
    if (aName === "Unassigned") return 1;
    if (bName === "Unassigned") return -1;
    return aName.localeCompare(bName);
  });

  if (!sorted.some((g) => String(g.name) === "Unassigned")) {
    sorted.push({
      name: "Unassigned",
      items: [],
      emptyMessage: "All employees are assigned to their respective restaurants :)",
    });
  }

  return sorted;
}

