// ── Suspended Employee ────────────────────────────────────────────────────────
export interface SuspendedEmployee {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  restaurantName?: string;
  added: string;
  suspended: string;
}

// ── Employee Form ─────────────────────────────────────────────────────────────
export type EmployeeFormData = {
  firstName: string;
  lastName: string;
  contact: string;
  countryCode: string;
  email: string;
  employeeId: string;
  joiningDate: string;
  role: string;
  assignedRestaurant?: string;
};

// ── Employee Box ──────────────────────────────────────────────────────────────
export interface EmployeeBox {
  id: string;
  name: string;
  details: string;
  power: "on" | "off" | "warning";
  added: string;
  isLocked: boolean;
  isOffline: boolean;
}

// ── Modal Resource Descriptors ────────────────────────────────────────────────
export interface EmployeeResource {
  label: string;
  count: number;
  onViewList?: () => void;
}

export interface EmployeeGroupResource {
  label: string;
  count: number;
  onViewList?: () => void;
}

export interface ReassignRestaurant {
  id: string;
  name: string;
  address?: string;
  boxes?: number;
  updated?: string;
  added?: string;
}

// ── Modal Props ───────────────────────────────────────────────────────────────
export interface DeleteEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSuspend?: () => void;
  employeeName: string;
  employeeCount?: number;
  loading?: boolean;
}

export interface SuspendEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string;
  employeeCount?: number;
  loading?: boolean;
}

export interface ReactivateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onReassign?: () => void;
  onActivate: () => void;
  employeeNames: string[];
  hasRestaurantAssignment?: boolean;
  loading?: boolean;
  isActivateAll?: boolean;
  totalManagers?: number;
  totalDrivers?: number;
}

export interface ReassignEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (restaurant: ReassignRestaurant | null) => void;
  restaurants?: ReassignRestaurant[];
  totalEntries?: number;
  onFetchRestaurants?: (query: string, page: number) => void;
  loading?: boolean;
  sourceEmployeeName?: string;
  pageSize?: number;
}
