import httpClient from "./httpClient";
import { GRUBPAC_URLS } from "./urls/grubpacs";
import type { ApiResponse } from "./request";
import type {
  GrubPacListData,
  GrubPacDropdownsData,
  GrubPacListParams,
  GrubPacSearchParams,
  ApiGrubPacSearchResult,
  CreateGrubPacBody,
  UpdateGrubPacBody,
  ActionGrubPacBody,
  ReassignGrubPacBody,
  RemoveEmployeeFromBoxesBody,
} from "@/types/domain/grubpacs";

const LIST_PARAM_KEYS: Array<keyof GrubPacListParams> = [
  "restaurant_id",
  "employee_id",
  "permission_status",
  "limit",
  "page",
  "status",
  "group_by",
  "group_by_selected_table",
  "power_status",
  "connection_status",
  "health_status",
  "grublock_status",
  "restaurant_assigned",
  "vehicle_assigned",
  "ioniser_status",
  "dual_zone_status",
  "zone1_min",
  "zone1_max",
  "zone2_min",
  "zone2_max",
];

const ACTION_KEYS: Array<keyof ActionGrubPacBody> = [
  "status",
  "grublock_status",
  "recipient_name",
  "recipient_phone",
  "recipient_country_code",
  "emergency_unlock_reason",
  "power_status",
  "ioniser_status",
  "dual_zone_status",
  "zone1_temp",
  "zone2_temp",
  "assign_restaurant_id",
  "vehicle_number",
  "adas_status",
  "bluetooth_status",
  "camera_status",
  "gps_status",
  "gyrosensor_status",
  "save_to_memory_status",
  "sim_status",
  "solar_status",
  "wifi_status",
  "turn_signal_status",
  "advert_screen_status",
  "port_small_status",
  "port_big_status",
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitizeIds(ids: string[]): string[] {
  return ids
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

function sanitizeStringArray(values?: string[]): string[] | undefined {
  if (!Array.isArray(values)) return undefined;
  const sanitized = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return sanitized.length > 0 ? sanitized : undefined;
}

function sanitizeOptionalString(value: unknown): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  return value.trim();
}

function failResponse<T = unknown>(error: string, status = 400): ApiResponse<T> {
  return {
    success: false,
    status,
    error,
  };
}

function sanitizeListParams(
  params?: GrubPacListParams,
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const query: Record<string, unknown> = {};

  LIST_PARAM_KEYS.forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null) return;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) query[key] = trimmed;
      return;
    }

    if (typeof value === "number") {
      if (Number.isFinite(value)) query[key] = value;
    }
  });

  return Object.keys(query).length > 0 ? query : undefined;
}

function sanitizeSearchParams(
  params: GrubPacSearchParams,
): Record<string, unknown> {
  const query: Record<string, unknown> = {
    query: typeof params.query === "string" ? params.query.trim() : "",
  };

  if (typeof params.limit === "number" && Number.isFinite(params.limit)) {
    query.limit = params.limit;
  }

  if (params.status) {
    query.status = params.status;
  }

  return query;
}

function sanitizeCreatePayload(data: CreateGrubPacBody): CreateGrubPacBody | null {
  const name = sanitizeOptionalString(data.name);
  if (!name) return null;

  return {
    name,
    ...(sanitizeOptionalString(data.box_id)
      ? { box_id: sanitizeOptionalString(data.box_id) }
      : {}),
    ...(sanitizeOptionalString(data.vehicle_number)
      ? { vehicle_number: sanitizeOptionalString(data.vehicle_number) }
      : {}),
    ...(sanitizeStringArray(data.restaurant_ids)
      ? { restaurant_ids: sanitizeStringArray(data.restaurant_ids) }
      : {}),
    ...(sanitizeStringArray(data.blocked_employee_ids)
      ? { blocked_employee_ids: sanitizeStringArray(data.blocked_employee_ids) }
      : {}),
    ...(data.access_mode ? { access_mode: data.access_mode } : {}),
  };
}

function sanitizeUpdatePayload(data: UpdateGrubPacBody): UpdateGrubPacBody | null {
  const id = sanitizeOptionalString(data.id);
  const name = sanitizeOptionalString(data.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    ...(sanitizeOptionalString(data.box_id)
      ? { box_id: sanitizeOptionalString(data.box_id) }
      : {}),
    ...(sanitizeOptionalString(data.vehicle_number)
      ? { vehicle_number: sanitizeOptionalString(data.vehicle_number) }
      : {}),
    ...(sanitizeStringArray(data.restaurant_ids)
      ? { restaurant_ids: sanitizeStringArray(data.restaurant_ids) }
      : {}),
    ...(sanitizeStringArray(data.blocked_employee_ids)
      ? { blocked_employee_ids: sanitizeStringArray(data.blocked_employee_ids) }
      : {}),
    ...(data.access_mode ? { access_mode: data.access_mode } : {}),
  };
}

function sanitizeActionPayload(data: ActionGrubPacBody): ActionGrubPacBody | null {
  const ids = sanitizeIds(data.ids);
  if (ids.length === 0) return null;

  const payload: ActionGrubPacBody = { ids };
  const payloadRecord = payload as unknown as Record<string, unknown>;

  ACTION_KEYS.forEach((key) => {
    const value = data[key];
    if (value === undefined) return;

    if (value === null) {
      if (key === "vehicle_number") payloadRecord[key] = value;
      return;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) return;
      payloadRecord[key] = trimmed;
      return;
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value)) return;
      payloadRecord[key] = value;
    }
  });

  return payload;
}

function sanitizeRemoveEmployeesPayload(
  data: RemoveEmployeeFromBoxesBody,
): Record<string, unknown> | null {
  const boxIds = sanitizeIds(data.box_ids ?? []);
  const employeeIds = sanitizeIds(data.employee_ids ?? []);

  if (boxIds.length === 0 || employeeIds.length === 0) {
    return null;
  }

  // Some backend revisions accept `ids`/`employee_id` instead of
  // `box_ids`/`employee_ids`. Send both aliases for compatibility.
  return {
    box_ids: boxIds,
    ids: boxIds,
    employee_ids: employeeIds,
    employee_id: employeeIds[0],
  };
}

function sanitizeReassignPayload(data: ReassignGrubPacBody): Record<string, unknown> | null {
  const ids = sanitizeIds(data.ids ?? data.box_ids ?? []);
  const restaurantId = sanitizeOptionalString(
    data.restaurant_id ?? data.destination_restaurant_id,
  );

  if (ids.length === 0 || !restaurantId) {
    return null;
  }

  return {
    ids,
    box_ids: ids,
    restaurant_id: restaurantId,
    destination_restaurant_id: restaurantId,
  };
}

const grubpacService = {
  async getList(params?: GrubPacListParams) {
    return httpClient.get<GrubPacListData>(GRUBPAC_URLS.LIST, sanitizeListParams(params));
  },

  async getDropdowns() {
    return httpClient.get<GrubPacDropdownsData>(GRUBPAC_URLS.DROPDOWNS);
  },

  async search(params: GrubPacSearchParams) {
    return httpClient.get<ApiGrubPacSearchResult[]>(GRUBPAC_URLS.SEARCH, sanitizeSearchParams(params));
  },

  async create(data: CreateGrubPacBody) {
    const payload = sanitizeCreatePayload(data);
    if (!payload) {
      return failResponse("Please provide valid GrubPac details");
    }
    return httpClient.post(GRUBPAC_URLS.CREATE, payload);
  },

  async update(data: UpdateGrubPacBody) {
    const payload = sanitizeUpdatePayload(data);
    if (!payload) {
      return failResponse("Please provide valid GrubPac details");
    }
    return httpClient.put(GRUBPAC_URLS.UPDATE, payload);
  },

  async action(data: ActionGrubPacBody) {
    const payload = sanitizeActionPayload(data);
    if (!payload) {
      return failResponse("Please provide valid box ids");
    }
    return httpClient.patch(GRUBPAC_URLS.ACTION, payload);
  },

  async reassign(data: ReassignGrubPacBody) {
    const payload = sanitizeReassignPayload(data);
    if (!payload) {
      return failResponse("Please provide valid box ids and restaurant id");
    }
    return httpClient.patch(GRUBPAC_URLS.REASSIGN, payload);
  },

  async removeEmployeeFromBoxes(data: RemoveEmployeeFromBoxesBody) {
    const payload = sanitizeRemoveEmployeesPayload(data);
    if (!payload) {
      return failResponse("Please provide valid box ids and employee ids");
    }
    return httpClient.patch(GRUBPAC_URLS.REMOVE_EMPLOYEE, payload);
  },

  async suspend(ids: string[]) {
    const sanitizedIds = sanitizeIds(ids);
    if (sanitizedIds.length === 0) {
      return failResponse("Please provide valid box ids");
    }
    return httpClient.patch(GRUBPAC_URLS.SUSPEND, { ids: sanitizedIds });
  },

  async reactivate(ids?: string[], all?: boolean, reassign?: boolean) {
    if (!all && (!ids || ids.length === 0)) {
      return failResponse("Please provide valid box ids");
    }
    const sanitizedIds = ids ? sanitizeIds(ids) : [];
    return httpClient.patch(GRUBPAC_URLS.REACTIVATE, { 
      ids: sanitizedIds.length > 0 ? sanitizedIds : undefined,
      all: all || undefined,
      reassign: reassign !== undefined ? reassign : undefined
    });
  },

  async delete(ids: string[]) {
    const sanitizedIds = sanitizeIds(ids);
    if (sanitizedIds.length === 0) {
      return failResponse("Please provide valid box ids");
    }
    return httpClient.delete(GRUBPAC_URLS.DELETE, { ids: sanitizedIds });
  },
  async getSuspendedSummary() {
    return httpClient.get<{
      boxes: number;
      first_box_name: string;
      has_restaurant_assignments: boolean;
    }>(GRUBPAC_URLS.SUMMARY);
  },
};

export default grubpacService;
