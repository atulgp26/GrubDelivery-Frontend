import { mockReassignRestaurantsData } from "./mockReassignRestaurantsData";
import { mockSuspendedEmployeesData } from "./mockSuspendedEmployees";

export const mockRestaurantOptions = mockReassignRestaurantsData.map((r) => ({
  value: r.id,
  label: r.name,
  boxes: `${r.resources?.boxes ?? 0} boxes`,
}));

export const mockExcludedEmployees = mockSuspendedEmployeesData.map((e) => ({
  id: String(e.id),
  name: e.name,
  code: e.employeeId,
  joinDate: e.added,
  added: e.suspended,
}));

export const mockPermissionOptions = [
  {
    value: "anyone" as const,
    title: "ANYONE can connect",
    description: "No restrictions. Any user can scan and connect.",
    excludedLabel: "0 EXCLUDED",
  },
  {
    value: "all" as const,
    title: "ALL employees can connect",
    description: "People not added as employees cannot access the GrubPac.",
    excludedLabel: "0 EXCLUDED",
  },
  {
    value: "restaurants" as const,
    title: "Employees from assigned restaurants only",
    description: "People outside the selected restaurant cannot access the GrubPac.",
    excludedLabel: "0 EXCLUDED",
  },
];
