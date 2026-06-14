import type { GroupCollapseTableGroup } from "@/types/ui";
import {
  normalizeGlobalStatus,
  normalizeHandlerStatus,
  normalizePowerStatus,
} from "@/lib/utils/grubpacStatus";
import { formatDate } from "@/lib/utils/date";

// ── API shapes ────────────────────────────────────────────────────────────────

export interface ApiGrubPacRestaurant {
  id: string;
  name: string;
  state: string;
  city: string;
  pincode: string;
  line_one: string;
  line_two: string | null;
  status: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  client_id?: string;
  manager_id?: string | null;
  full_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiRestaurantBox {
  id: string;
  restaurant_id: string;
  box_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  restaurant: ApiGrubPacRestaurant;
}

export interface ApiGrubPacLock {
  id: string;
  box_id: string;
  lock_status: string;
  created_at: string;
  updated_status: string;
}

export interface ApiGrubPacPermission {
  id: string;
  employee_id: string | null;
  box_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiGrubPacPermissionBlocked {
  employee_id: string | null;
  status: string;
  access?: "direct" | "public" | "all_employees" | "restaurant_employees";
}

export interface ApiGrubPacEmployeeLite {
  id: string;
  employee_id?: string;
  employee_display_id?: string;
  first_name?: string;
  last_name?: string;
}

export interface ApiGrubPac {
  id: string;
  box_id: string;
  box_display_id?: string;
  name: string;
  vertical_id: string;
  customer_id: string;
  vehicle_number: string | null;
  status: string;
  global_status: string | null;
  power_status: string | null;
  health_status: string | null;
  handler_status: string | null;
  connection_status?: string | null;
  access_mode?: "public" | "all_employees" | "restaurant_employees";
  blocked_employee_ids?: string[];
  handler_details:
    | {
        name?: string | null;
        phone?: string | null;
      }
    | null;
  handler_employee?:
    | {
        full_name?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        country_code?: string | null;
        phone?: string | null;
        mobile_number?: string | null;
      }
    | null;
  ioniser_status: string | null;
  gyrosensor_status: string | null;
  wifi_status: string | null;
  bluetooth_status: string | null;
  sim_status: string | null;
  gps_status: string | null;
  solar_status: string | null;
  camera_status: string | null;
  adas_status: string | null;
  port_big_status: string | null;
  port_small_status: string | null;
  turn_signal_status: string | null;
  memory_percentage: number | null;
  save_to_memory_status: string | null;
  advert_screen_status: string | null;
  battery_percentage: number | null;
  dual_zone_status: string | null;
  zone1_temp: number | null;
  zone2_temp: number | null;
  temp_mode: string | null;
  temp_zone1_min: number | null;
  temp_zone1_max: number | null;
  temp_zone2_min: number | null;
  temp_zone2_max: number | null;
  restaurant_boxes?: ApiRestaurantBox[];
  restaurants?: ApiGrubPacRestaurant[];
  employees?: ApiGrubPacEmployeeLite[];
  permissions_blocked_count?: number;
  lock: ApiGrubPacLock | null;
  created_at: string;
  updated_at: string;
  grublock_status?: "locked" | "unlocked" | "not_available" | "offline";
}

export interface GrubPacListFlatResponse {
  boxes: ApiGrubPac[];
  count: number;
}

export interface GrubPacListGroupedResponse {
  groups?: {
    [key: string]: { array: ApiGrubPac[] } | string | number | undefined;
  };
  count?: number;
}

export interface ApiGrubPacSearchResult {
  id: string;
  name: string;
  box_display_id?: string;
  status: "active" | "suspended" | "deleted";
  box_id?: string;
}

export interface ApiGrubPacDropdownRestaurant {
  id: string;
  name: string;
  _count?: {
    boxes?: number;
    employees?: number;
    managers?: number;
    drivers?: number;
    suspended_boxes?: number;
  };
}

export interface ApiGrubPacDropdownEmployee {
  id: string;
  name: string;
  employee_id: string;
  status?: "active" | "inactive" | "suspended" | "unassigned";
}

export interface GrubPacDropdownsData {
  restaurants: ApiGrubPacDropdownRestaurant[];
  employees: ApiGrubPacDropdownEmployee[];
}

export type GrubPacListData = GrubPacListFlatResponse | GrubPacListGroupedResponse;

// ── Request shapes ────────────────────────────────────────────────────────────

export interface GrubPacListParams {
  employee_id?: string;
  permission_status?: "shared" | "blocked";
  limit?: number;
  page?: number;
  status?: "active" | "suspended" | "deleted";
  group_by?: "power_status" | "restaurants";
  group_by_selected_table?: string;
  power_status?: "on" | "off" | "unknown";
  connection_status?: "connected" | "disconnected";
  health_status?: "critical" | "healthy" | "attention";
  grublock_status?: "locked" | "unlocked" | "not_available" | "offline";
  restaurant_assigned?: "on" | "off";
  vehicle_assigned?: "on" | "off";
  ioniser_status?: "on" | "off";
  dual_zone_status?: "on" | "off";
  zone1_min?: number;
  zone1_max?: number;
  zone2_min?: number;
  zone2_max?: number;
  restaurant_id?: string;
  query?: string;
}

export interface GrubPacSearchParams {
  query: string;
  limit?: number;
  status?: "active" | "suspended" | "deleted";
}

export interface CreateGrubPacBody {
  name: string;
  box_id?: string;
  vehicle_number?: string;
  restaurant_ids?: string[];
  blocked_employee_ids?: string[];
  access_mode?: "public" | "all_employees" | "restaurant_employees";
}

export interface UpdateGrubPacBody {
  id: string;
  name: string;
  box_id?: string;
  vehicle_number?: string;
  restaurant_ids?: string[];
  blocked_employee_ids?: string[];
  access_mode?: "public" | "all_employees" | "restaurant_employees";
}

export interface ActionGrubPacBody {
  ids: string[];
  status?: "active" | "suspended";
  grublock_status?: "locked" | "unlocked";
  recipient_name?: string;
  recipient_phone?: string;
  recipient_country_code?: string;
  emergency_unlock_reason?: string;
  power_status?: "on" | "off";
  ioniser_status?: "on" | "off";
  dual_zone_status?: "on" | "off";
  zone1_temp?: number;
  zone2_temp?: number;
  assign_restaurant_id?: string;
  vehicle_number?: string | null;
  adas_status?: string;
  bluetooth_status?: string;
  camera_status?: string;
  gps_status?: string;
  gyrosensor_status?: string;
  save_to_memory_status?: string;
  sim_status?: string;
  solar_status?: string;
  wifi_status?: string;
  turn_signal_status?: string;
  advert_screen_status?: string;
  port_small_status?: string;
  port_big_status?: string;
}

export interface ReassignGrubPacBody {
  ids?: string[];
  box_ids?: string[];
  restaurant_id?: string;
  destination_restaurant_id?: string;
}

export interface RemoveEmployeeFromBoxesBody {
  box_ids: string[];
  employee_ids: string[];
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function formatApiDate(isoDate: string): string {
  if (!isoDate) return "";
  return formatDate(isoDate);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function buildFullName(firstName?: string | null, lastName?: string | null): string | null {
  const parts = [firstName, lastName]
    .map((part) => (isNonEmptyString(part) ? part.trim() : ""))
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

function buildPhone(
  countryCode?: string | null,
  mobileNumber?: string | null,
  phone?: string | null,
): string | null {
  if (isNonEmptyString(phone)) return phone.trim();

  const normalizedCountryCode = isNonEmptyString(countryCode) ? countryCode.trim() : "";
  const normalizedMobileNumber = isNonEmptyString(mobileNumber) ? mobileNumber.trim() : "";

  if (normalizedCountryCode && normalizedMobileNumber) {
    return `${normalizedCountryCode} ${normalizedMobileNumber}`;
  }

  return normalizedCountryCode || normalizedMobileNumber || null;
}

export function apiGrubPacToItem(g: ApiGrubPac): GrubPacItem {
  const powerStatus = normalizePowerStatus(g.power_status);
  const dualZoneStatus = (g.dual_zone_status ?? "unknown").toLowerCase();
  const zone1 = g.zone1_temp != null ? `${g.zone1_temp}°c` : null;
  const zone2 = g.zone2_temp != null ? `${g.zone2_temp}°c` : null;
  const primaryRestaurant = g.restaurants?.[0] ?? g.restaurant_boxes?.[0]?.restaurant;
  const restaurantName = primaryRestaurant?.name;
  const restaurantAddress = primaryRestaurant
    ? primaryRestaurant.full_address ||
      [
        primaryRestaurant.line_one,
        primaryRestaurant.line_two,
        primaryRestaurant.city,
        primaryRestaurant.state,
        primaryRestaurant.pincode,
      ]
        .filter((part): part is string => isNonEmptyString(part))
        .join(", ")
    : undefined;
  const restaurantCreatedOn = primaryRestaurant?.created_at
    ? formatApiDate(primaryRestaurant.created_at)
    : undefined;
  const boxDisplayCode = g.box_display_id ?? g.box_id;

  const locationParts: string[] = [];
  if (g.vehicle_number) locationParts.push(g.vehicle_number);
  if (restaurantName) locationParts.push(restaurantName);

  const uiStatus = powerStatus === "on" ? "ONLINE" : powerStatus === "off" ? "OFFLINE" : "UNKNOWN";

  const normalizedGlobalStatus = normalizeGlobalStatus(g.global_status);
  const normalizedHandlerStatus = normalizeHandlerStatus(g.handler_status);

  const handlerName =
    g.handler_details?.name ??
    g.handler_employee?.full_name ??
    buildFullName(g.handler_employee?.first_name, g.handler_employee?.last_name);
  const handlerPhone =
    g.handler_details?.phone ??
    buildPhone(
      g.handler_employee?.country_code,
      g.handler_employee?.mobile_number,
      g.handler_employee?.phone,
    );
  const restaurantIds = Array.from(
    new Set([
      ...(g.restaurant_boxes ?? [])
        .map((restaurantBox) => restaurantBox.restaurant_id)
        .filter((id): id is string => isNonEmptyString(id)),
      ...(g.restaurants ?? [])
        .map((restaurant) => restaurant.id)
        .filter((id): id is string => isNonEmptyString(id)),
      ...(typeof (g as any).restaurant_id === "string" && isNonEmptyString((g as any).restaurant_id)
        ? [(g as any).restaurant_id]
        : []),
    ]),
  );

  const restaurantEmployeeIds = Array.from(
    new Set(
      (g.employees ?? [])
        .map((employee) => employee.id)
        .filter((id): id is string => isNonEmptyString(id)),
    ),
  );

  return {
    id: g.id,
    name: g.name,
    boxId: g.box_id,
    boxDisplayId: g.box_display_id ?? undefined,
    vehicleNumber: g.vehicle_number ?? undefined,
    restaurant: restaurantName ?? undefined,
    code: boxDisplayCode ?? undefined,
    status: uiStatus,
    lifecycleStatus: g.status,
    power: powerStatus === "on" ? "ON" : powerStatus === "off" ? "OFF" : undefined,
    powerStatus: powerStatus === "on" ? "ON" : powerStatus === "off" ? "OFF" : "UNKNOWN",
    globalStatus: normalizedGlobalStatus,
    handlerStatus: normalizedHandlerStatus,
    handlerDetails: handlerName || handlerPhone ? { name: handlerName, phone: handlerPhone } : null,
    battery: g.battery_percentage,
    ioniser:
      g.ioniser_status === "on"
        ? "Ioniser turned ON"
        : g.ioniser_status === "off"
        ? "Ioniser turned OFF"
        : g.ioniser_status === "unknown"
        ? "Ioniser turned UNKNOWN"
        : null,
    zone1Temp: zone1,
    zone2Temp: zone2,
    dualZoneStatus:
      dualZoneStatus === "on"
        ? "on"
        : dualZoneStatus === "off"
        ? "off"
        : "unknown",
    zone1Min: g.temp_zone1_min != null ? `${g.temp_zone1_min}°c` : null,
    zone1Max: g.temp_zone1_max != null ? `${g.temp_zone1_max}°c` : null,
    zone2Min: g.temp_zone2_min != null ? `${g.temp_zone2_min}°c` : null,
    zone2Max: g.temp_zone2_max != null ? `${g.temp_zone2_max}°c` : null,
    extThermostatTemp: (g as any).ext_thermostat_temp != null ? `${(g as any).ext_thermostat_temp}°c` : null,
    handler: null,
    added: formatApiDate(g.created_at),
    addedDate: g.created_at,
    locked: g.lock ? g.lock.lock_status === "locked" : undefined,
    hasLock: g.lock !== null,
    grublockStatus: g.grublock_status,
    location: locationParts.join(" | ") || undefined,
    restaurantName: restaurantName ?? undefined,
    restaurantStatus: primaryRestaurant?.status,
    restaurantAddress,
    restaurantCreatedAt: primaryRestaurant?.created_at,
    restaurantCreatedOn,
    restaurantIds,
    restaurantEmployeeIds,
    accessMode: g.access_mode ?? "public",
    blockedEmployeeIds: Array.isArray(g.blocked_employee_ids) ? g.blocked_employee_ids : [],
    permissionsBlockedCount: typeof g.permissions_blocked_count === "number" ? g.permissions_blocked_count : undefined,
  };
}

export function apiGrubPacToSuspendedItem(g: ApiGrubPac): SuspendedGrubPacItem {
  const restaurantName = g.restaurant_boxes?.[0]?.restaurant?.name ?? g.restaurants?.[0]?.name;
  const code = g.box_display_id ?? g.box_id ?? undefined;
  const vehicleNumber = g.vehicle_number ?? undefined;
  const identifierParts: string[] = [];
  if (code) identifierParts.push(`#${code}`);
  if (vehicleNumber && vehicleNumber !== code) identifierParts.push(vehicleNumber);

  return {
    id: g.id,
    name: g.name,
    code,
    identifier: identifierParts.join(" | ") || undefined,
    added: formatApiDate(g.created_at),
    suspended: formatApiDate(g.updated_at),
    location: restaurantName ?? null,
    group: restaurantName ?? "Unassigned",
    hasBox: Boolean(g.vehicle_number),
  };
}

/**
 * Core GrubPac item with all properties
 */
export interface GrubPacItem {
  id: string;
  name?: string;
  boxId?: string;
  boxDisplayId?: string;
  vehicleNumber?: string;
  restaurant?: string;
  code?: string;
  restaurantName?: string;
  restaurantStatus?: string;
  restaurantAddress?: string;
  restaurantCreatedAt?: string;
  restaurantCreatedOn?: string;
  status?: string;
  power?: string | null;
  powerStatus?: string;
  globalStatus?: "power_off" | "ready" | "critical" | "attention" | "unknown";
  handlerStatus?: "connected" | "disconnected" | "not_shared" | "offline" | "unknown";
  handlerDetails?: {
    name?: string | null;
    phone?: string | null;
  } | null;
  battery?: number | null;
  ioniser?: string | null;
  dualZoneStatus?: "on" | "off" | "unknown";
  zone1Temp?: string | null;
  zone2Temp?: string | null;
  zone1Min?: string | null;
  zone1Max?: string | null;
  zone2Min?: string | null;
  zone2Max?: string | null;
  extThermostatTemp?: string | null;
  handler?: string | null;
  added?: string;
  addedDate?: string;
  locked?: boolean;
  hasLock?: boolean;
  grublockStatus?: "locked" | "unlocked" | "not_available" | "offline";
  location?: string;
  restaurantIds?: string[];
  accessMode?: "public" | "all_employees" | "restaurant_employees";
  blockedEmployeeIds?: string[];
  permissionsBlockedCount?: number;
  resourceBoxCount?: number;
  resourceEmployeeCount?: number;
  [key: string]: unknown;
}

/**
 * Suspended GrubPac item
 */
export interface SuspendedGrubPacItem {
  id: string;
  name?: string;
  code?: string;
  /** e.g. "#DL12345 | Restaurant Name" */
  identifier?: string;
  added?: string;
  suspended?: string;
  location?: string | null;
  floor?: string | null;
  group?: string;
  hasBox?: boolean;
  [key: string]: unknown;
}

/**
 * Box details item for history/logs
 */
export interface BoxDetailsItem {
  id: number | string;
  timestamp: string;
  name?: string;
  code?: string;
  location?: string;
  status?: string;
  actionStatus?: string;
  subStatus?: string;
}

/**
 * Suspended employee item
 */
export interface SuspendedEmployeeItem {
  id: number | string;
  name: string;
  employeeId: string;
  phone: string;
  email: string;
  added: string;
  suspended: string;
  department: string;
  status: string;
}

/**
 * Restaurant item used in grubpacs
 */
export interface Restaurant {
  id: number | string;
  name: string;
  address: string;
  added: string;
}

/**
 * Grouped GrubPac data for table display
 */
export type GrubPacGroup = GroupCollapseTableGroup<GrubPacItem>;

/**
 * Grouped Suspended GrubPac data
 */
export type SuspendedGrubPacGroup = GroupCollapseTableGroup<SuspendedGrubPacItem>;

/**
 * Grouped Suspended Employee data
 */
export type SuspendedEmployeeGroup = GroupCollapseTableGroup<SuspendedEmployeeItem>;
