import type { EmployeeBox } from "../types";

export const MOCK_EMPLOYEE_BOXES: EmployeeBox[] = [
  {
    id: "1",
    name: "BOX-2456",
    details: "#DL12345 | DL2BD1234 | da Pizza Place",
    power: "on",
    added: "Today",
    isLocked: true,
    isOffline: false,
  },
  {
    id: "2",
    name: "BOX-2457",
    details: "#DL12346 | DL2BD1235 | da Pizza Place",
    power: "on",
    added: "Today",
    isLocked: true,
    isOffline: false,
  },
  {
    id: "3",
    name: "BOX-2458",
    details: "#DL12347 | DL2BD1236 | da Pizza Place",
    power: "warning",
    added: "Today",
    isLocked: true,
    isOffline: true,
  },
];

export const MOCK_EXCLUDED_BOXES: EmployeeBox[] = [
  {
    id: "ex-1",
    name: "BOX-2456",
    details: "#DL12345 | DL2BD1234 | da Pizza Place",
    power: "on",
    added: "Today",
    isLocked: true,
    isOffline: false,
  },
  {
    id: "ex-2",
    name: "BOX-2457",
    details: "#DL12346 | DL2BD1235 | da Pizza Place",
    power: "on",
    added: "Today",
    isLocked: true,
    isOffline: false,
  },
  {
    id: "ex-3",
    name: "BOX-2458",
    details: "#DL12347 | DL2BD1236 | da Pizza Place",
    power: "warning",
    added: "Today",
    isLocked: true,
    isOffline: true,
  },
];

