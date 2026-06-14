import type { GroupCollapseTableGroup } from "@/types/ui";
import { getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import { formatDate } from "@/lib/utils/date";

export type EmployeeStatus = "Active" | "Suspended";

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  joinedDate: string;
  phone: string;
  countryDialCode?: string;
  mobileNumber?: string;
  email: string;
  role: string;
  boxCount: number;
  boxDetails?: {
    boxId?: string;
    licenseNumber?: string;
    settingsId?: string;
  };
  handlerBox?: {
    id: string;
    name: string;
    displayId: string;
    status?: string;
  };

  sharedBoxes?: Array<{
  id: string;
  name: string;
  displayId: string;
  vehicleNumber?: string;
  powerStatus?: string;
  connectionStatus?: string;
  healthStatus?: string;
  createdAt?: string;
}>;
  added: string;
  restaurantName?: string;
  restaurantId?: string;
  restaurantStatus?: string;
  restaurantAddress?: string;
  restaurantUpdated?: string;
  restaurantAdded?: string;
  status?: EmployeeStatus;
  isAvailable?: boolean;
  connectedBoxesStatus?: boolean;
}

export type EmployeeGroup = GroupCollapseTableGroup<Employee>;

// ── API shapes ────────────────────────────────────────────────────────────────

export interface ApiConnectedBox {
  id: string;
  name: string;
  box_display_id: string;
  vertical_id: string;
  customer_id: string;
  status: string;
  connection_status: string;
  created_at: string;
  updated_at: string;
  health_status: string;
  [key: string]: unknown;
}

export interface ApiRestaurant {
  id: string;
  name: string;
  client_id: string;
  manager_id: string | null;
  state: string;
  city: string;
  pincode: string;
  line_one: string;
  line_two: string | null;
  latitude: string | null;
  longitude: string | null;
  google_place_id: string | null;
  status: string;
  full_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEmployee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  country_code: string;
  mobile_number: string;
  email: string;
  employee_id: string;
  joining_date: string;
  client_id: string;
  restaurant_id: string | null;
  role: "manager" | "delivery";
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
  profile_pic: string | null;
  restaurant: ApiRestaurant | null;
  box_id?: string;
  box_display_id?: string;
  grubpac_id?: string;
  box_uuid?: string;
  vehicle_number?: string | null;
  license_number?: string | null;
  box_count?: number | string;
  boxes_count?: number | string;
  grubpac_count?: number | string;
  total_boxes?: number | string;
  connected_boxes_status?: boolean;
  connected_boxes_count?: number;
  shared_boxes_count?: number;  
  handler_box?: ApiConnectedBox | null;
}

export interface ApiEmployeeSearchResult {
  id: string;
  name: string;
  employee_id: string;
  status: "active" | "inactive" | "suspended";
}

export interface DropdownRole {
  id: string;
  name: string;
  description?: string;
}

export interface DropdownRestaurant {
  id: string;
  name: string;
  boxes?: number;
  address?: string;
  updated?: string;
  added?: string;
}

export interface ApiDropdownRestaurant {
  id: string;
  name: string;
  _count: { boxes: number; employees: number };
}

export interface ApiEmployeeDropdownsData {
  restaurants: ApiDropdownRestaurant[];
  roles: DropdownRole[];
}

// ── Employee list API response shapes ───────────────────────────────────────

export interface ApiEmployeeListFlatResponse {
  employees: ApiEmployee[];
  count: number;
}

export interface ApiEmployeeGroupedData {
  array: ApiEmployee[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  count?: number;
  address?: string;
  name?: string;
}

export interface ApiEmployeeListBoxesGroups {
  connected?: ApiEmployeeGroupedData;
  disconnected?: ApiEmployeeGroupedData;
  managers?: ApiEmployeeGroupedData;
}

export interface ApiEmployeeListBoxesResponse {
  groups: ApiEmployeeListBoxesGroups;
  count: number;
}

export interface ApiEmployeeListRestaurantsResponse {
  // keys are restaurant names; the special key "unassigned" holds employees with no restaurant
  groups: Record<string, ApiEmployeeGroupedData>;
  count: number;
}

export type EmployeeListData =
  | ApiEmployeeListFlatResponse
  | ApiEmployeeListBoxesResponse
  | ApiEmployeeListRestaurantsResponse;

// ── Type guards ───────────────────────────────────────────────────────────────

export function isBoxesGroupedResponse(
  data: unknown,
): data is ApiEmployeeListBoxesResponse {
  if (typeof data !== "object" || data === null || !("groups" in data)) return false;
  const groups = (data as Record<string, unknown>).groups;
  return (
    typeof groups === "object" &&
    groups !== null &&
    !Array.isArray(groups) &&
    ("connected" in groups || "disconnected" in groups || "managers" in groups)
  );
}

export function isRestaurantsGroupedResponse(
  data: unknown,
): data is ApiEmployeeListRestaurantsResponse {
  if (typeof data !== "object" || data === null || !("groups" in data)) return false;
  const groups = (data as Record<string, unknown>).groups;
  return typeof groups === "object" && groups !== null && !Array.isArray(groups);
}

// ── Group mappers ─────────────────────────────────────────────────────────────

export function boxesResponseToGroups(
  data: ApiEmployeeListBoxesResponse,
): EmployeeGroup[] {
  const { groups } = data;
  const connected = groups.connected;
  const disconnected = groups.disconnected;
  const managers = groups.managers;

  return [
    {
      name: "Box Connected",
      items: getWrappedGroupArray<ApiEmployee>(connected).map(apiEmployeeToEmployee),
      pagination: connected?.pagination ? {
        currentPage: (connected.pagination as any).page,
        pageSize: (connected.pagination as any).limit,
        totalItems: (connected.pagination as any).total_count,
        totalPages: (connected.pagination as any).last_page,
      } : undefined,
      emptyMessage: "Ask drivers to connect to a box to see the list here!",
    },
    {
      name: "Box Disconnected",
      items: getWrappedGroupArray<ApiEmployee>(disconnected).map(apiEmployeeToEmployee),
      pagination: disconnected?.pagination ? {
        currentPage: (disconnected.pagination as any).page,
        pageSize: (disconnected.pagination as any).limit,
        totalItems: (disconnected.pagination as any).total_count,
        totalPages: (disconnected.pagination as any).last_page,
      } : undefined,
      emptyMessage: "All drivers are connected to a box at the moment! :)",
    },
    {
      name: "Manager",
      items: getWrappedGroupArray<ApiEmployee>(managers).map(apiEmployeeToEmployee),
      pagination: managers?.pagination ? {
        currentPage: (managers.pagination as any).page,
        pageSize: (managers.pagination as any).limit,
        totalItems: (managers.pagination as any).total_count,
        totalPages: (managers.pagination as any).last_page,
      } : undefined,
      emptyMessage: "You haven't added any managers yet!",
    },
  ];
}

export function restaurantsResponseToGroups(
  data: ApiEmployeeListRestaurantsResponse,
): EmployeeGroup[] {
  const groups: EmployeeGroup[] = [];

  for (const [key, employees] of Object.entries(data.groups)) {
    if (key === "unassigned") continue; // handled separately below

    const normalizedEmployees = getWrappedGroupArray<ApiEmployee>(employees);

    groups.push({
      name: key,
      items: normalizedEmployees.map(apiEmployeeToEmployee),
      pagination: employees.pagination ? {
        currentPage: (employees.pagination as any).page,
        pageSize: (employees.pagination as any).limit,
        totalItems: (employees.pagination as any).total_count,
        totalPages: (employees.pagination as any).last_page,
      } : undefined,
      emptyMessage: "No employee assigned to this restaurant",
    });
  }

  const unassignedEmployees = getWrappedGroupArray<ApiEmployee>(data.groups["unassigned"]);
  const unassigned = data.groups["unassigned"];
  groups.push({
    name: "Unassigned",
    items: unassignedEmployees.map(apiEmployeeToEmployee),
    pagination: unassigned?.pagination ? {
      currentPage: (unassigned.pagination as any).page,
      pageSize: (unassigned.pagination as any).limit,
      totalItems: (unassigned.pagination as any).total_count,
      totalPages: (unassigned.pagination as any).last_page,
    } : undefined,
    emptyMessage: "All employees are assigned to their respective restaurants :)",
  });

  return groups;
}

export interface EmployeeDropdownsData {
  restaurants: DropdownRestaurant[];
  roles: DropdownRole[];
}

export interface EmployeeListParams {
  status?: "active" | "suspended" | "unassigned" | "deleted";
  role?: "manager" | "delivery" | Array<"manager" | "delivery">;
  query?: string;
  restaurant_id?: string;
  limit?: number;
  page?: number;
  group_by?: "boxes" | "restaurants";
  group_by_selected_table?: string;
  with_permission_for_box_id?: string;
  with_employees_for_access_mode?: "public" | "all_employees" | "restaurant_employees";
  with_connected_boxes?: boolean;
}

export interface EmployeePermissionListData {
  employees?: Array<{
    id: string;
    first_name?: string;
    last_name?: string;
    employee_id?: string;
    employee_display_id?: string;
    permission_status?: string;
    joining_date?: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

export interface EmployeeDropdownsParams {
  role?: "manager" | "delivery" | Array<"manager" | "delivery">;
  query?: string;
  status?: string;
}

export interface CreateEmployeeBody {
  email: string;
  /** Either `first_name` or `full_name` must be provided */
  first_name?: string;
  full_name?: string;
  last_name?: string;
  country_code: string;
  mobile_number: string;
  employee_id: string;
  role: "manager" | "delivery";
  restaurant_id?: string | null;
  joining_date: string;
}

export interface UpdateEmployeeBody {
  id: string;
  email?: string;
  first_name?: string;
  full_name?: string;
  last_name?: string;
  country_code?: string;
  mobile_number?: string;
  employee_id?: string;
  role?: "manager" | "delivery";
  restaurant_id?: string | null;
  joining_date?: string;
}

export interface ReassignEmployeeBody {
  ids: string[];
  /** Pass `null` to unassign employees from their current restaurant */
  restaurant_id: string | null;
}

export interface EmployeeSearchParams {
  query: string;
  limit?: number;
  status?: "all" | "active" | "suspended";
}

// ── Mapper ────────────────────────────────────────────────────────────────────

export function apiEmployeeToEmployee(e: ApiEmployee): Employee {
  const parseCount = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };
const connectedBoxesCount = parseCount(e.connected_boxes_count) ?? 0;
const sharedBoxesCount = Array.isArray((e as any).shared_boxes)
  ? (e as any).shared_boxes.filter((b: any) => b.power_status === "on").length
  : parseCount(e.shared_boxes_count) ?? 0;
const boxCount =
  (connectedBoxesCount + sharedBoxesCount) > 0
    ? connectedBoxesCount + sharedBoxesCount
    : parseCount(e.box_count) ??
      parseCount(e.boxes_count) ??
      parseCount(e.grubpac_count) ??
      parseCount(e.total_boxes) ??
      0;
  const boxId =
    (typeof e.box_display_id === "string" && e.box_display_id.trim()) ||
    (typeof e.box_id === "string" && e.box_id.trim()) ||
    undefined;

  const settingsId =
    (typeof e.grubpac_id === "string" && e.grubpac_id.trim()) ||
    (typeof e.box_uuid === "string" && e.box_uuid.trim()) ||
    undefined;

  const licenseNumber =
    (typeof e.vehicle_number === "string" && e.vehicle_number.trim()) ||
    (typeof e.license_number === "string" && e.license_number.trim()) ||
    undefined;

  return {
    id: e.id,
    name: e.full_name || `${e.first_name} ${e.last_name}`,
    employeeId: e.employee_id,
    joinedDate: e.joining_date ? formatDate(e.joining_date) : "",
    phone: `${e.country_code}${e.mobile_number}`,
    countryDialCode: e.country_code,
    mobileNumber: e.mobile_number,
    email: e.email,
    role: e.role === "delivery" ? "Driver" : "Manager",
    boxCount,
    boxDetails: boxId || licenseNumber || settingsId ? { boxId, licenseNumber, settingsId } : undefined,
    added: e.created_at ? formatDate(e.created_at) : "-",
    restaurantName: e.restaurant?.name,
    restaurantId: e.restaurant?.id,
    restaurantStatus: e.restaurant?.status,
    restaurantAddress: e.restaurant
      ? (
          e.restaurant.full_address ||
          [e.restaurant.line_one, e.restaurant.line_two, e.restaurant.city, `${e.restaurant.state} ${e.restaurant.pincode}`]
          .filter(Boolean)
          .join(", ")
        )
      : undefined,
    restaurantUpdated: e.restaurant?.updated_at
      ? formatDate(e.restaurant.updated_at)
      : undefined,
    restaurantAdded: e.restaurant?.created_at
      ? formatDate(e.restaurant.created_at)
      : undefined,
    status: e.status === "suspended" ? "Suspended" : "Active",
    connectedBoxesStatus:
      typeof e.connected_boxes_status === "boolean"
        ? e.connected_boxes_status
        : connectedBoxesCount !== null
          ? connectedBoxesCount > 0
          : boxCount > 0,
  handlerBox: e.handler_box
      ? {
          id: e.handler_box.id,
          name: e.handler_box.name,
          displayId: e.handler_box.box_display_id,
          status: e.handler_box.status,
        }
      : undefined,
    sharedBoxes: Array.isArray((e as any).shared_boxes)
      ? (e as any).shared_boxes.map((b: any) => ({
          id: b.id,
          name: b.name,
          displayId: b.box_display_id,
          vehicleNumber: b.vehicle_number ?? undefined,
          powerStatus: b.power_status ?? undefined,
          connectionStatus: b.connection_status ?? undefined,
          healthStatus: b.health_status ?? undefined,
          createdAt: b.created_at ?? undefined,
        }))
      : undefined,
  };
}

