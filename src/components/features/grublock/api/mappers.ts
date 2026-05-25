import type { ApiGrubPac } from "@/types/domain/grubpacs";
import type { GrubLockBox, GrubLockGroup } from "@/types/domain/grublock";
import { normalizeGlobalStatus, normalizeHandlerStatus, normalizePowerStatus } from "@/lib/utils/grubpacStatus";

export function apiGrubLockToBox(box: ApiGrubPac): GrubLockBox {
  const nestedBox = (box as unknown as { box?: Partial<ApiGrubPac> }).box;
  const normalizeText = (value?: string | null) => (value ?? "").trim();
  const displayName =
    normalizeText(box.name) ||
    normalizeText(nestedBox?.name) ||
    normalizeText(box.box_display_id) ||
    normalizeText(nestedBox?.box_display_id) ||
    normalizeText(box.box_id) ||
    normalizeText(nestedBox?.box_id) ||
    `Box ${box.id}`;

  const rawEmployees = (box as unknown as {
    employees?: Array<{
      id?: string;
      employee_id?: string;
      employee_display_id?: string;
      first_name?: string;
      last_name?: string;
      full_name?: string;
    }>;
  }).employees;
  const rawRestaurants = (box as unknown as {
    restaurants?: Array<{
      id?: string;
      name?: string;
      status?: string;
      full_address?: string;
      line_one?: string;
      line_two?: string | null;
      city?: string;
      state?: string;
      pincode?: string;
      created_at?: string;
    }>;
  }).restaurants;
  const rawConsumerInfo = (box as unknown as {
    consumer_info?: {
      full_name?: string;
      name?: string;
      country_code?: string;
      countryCode?: string;
      phone?: string;
      mobile_number?: string;
    } | null;
    consumer_full_name?: string;
    consumer_country_code?: string;
    consumer_phone?: string;
    recipient_name?: string;
    recipient_phone?: string;
    recipient_country_code?: string;
  });
  const primaryEmployee = rawEmployees?.[0];
  const fallbackEmployeeName = primaryEmployee
    ? primaryEmployee.full_name || [primaryEmployee.first_name, primaryEmployee.last_name].filter(Boolean).join(" ")
    : undefined;

  const powerStatus = normalizePowerStatus(box.power_status);
  const normalizedGlobalStatus = normalizeGlobalStatus(box.global_status);
  const normalizedHandlerStatus = normalizeHandlerStatus(box.handler_status);
  const globalStatus: GrubLockBox["globalStatus"] =
    normalizedGlobalStatus === "unknown" && powerStatus === "off"
      ? "power_off"
      : normalizedGlobalStatus;

  const handlerName =
    box.handler_details?.name?.trim() ||
    box.handler_employee?.full_name?.trim() ||
    [box.handler_employee?.first_name, box.handler_employee?.last_name].filter(Boolean).join(" ").trim() ||
    fallbackEmployeeName?.trim() ||
    undefined;

  const handlerPhone =
    box.handler_details?.phone?.trim() ||
    box.handler_employee?.phone?.trim() ||
    (box.handler_employee?.country_code?.trim() && box.handler_employee?.mobile_number?.trim()
      ? `${box.handler_employee.country_code.trim()} ${box.handler_employee.mobile_number.trim()}`
      : undefined) ||
    box.handler_employee?.mobile_number?.trim() ||
    undefined;

  const handlerStatus: GrubLockBox["handlerStatus"] =
    powerStatus === "off"
      ? "offline"
      : normalizedHandlerStatus !== "unknown"
      ? normalizedHandlerStatus
      : handlerName
      ? "connected"
      : "disconnected";

  const consumerFullName =
    rawConsumerInfo.consumer_info?.full_name ||
    rawConsumerInfo.consumer_info?.name ||
    rawConsumerInfo.consumer_full_name ||
    rawConsumerInfo.recipient_name ||
    undefined;

  const consumerCountryCode =
    rawConsumerInfo.consumer_info?.country_code ||
    rawConsumerInfo.consumer_info?.countryCode ||
    rawConsumerInfo.consumer_country_code ||
    rawConsumerInfo.recipient_country_code ||
    undefined;

  const consumerPhone =
    rawConsumerInfo.consumer_info?.phone ||
    rawConsumerInfo.consumer_info?.mobile_number ||
    rawConsumerInfo.consumer_phone ||
    rawConsumerInfo.recipient_phone ||
    undefined;

  const inferredStatus: GrubLockBox["status"] =
    (box.power_status ?? "").toLowerCase() === "off"
      ? "offline"
      : box.lock == null
      ? "not_available"
      : box.lock.lock_status === "locked"
      ? "locked"
      : "unlocked";

  const apiStatus = box.grublock_status;
  const status: GrubLockBox["status"] =
    apiStatus === "locked" || apiStatus === "unlocked" || apiStatus === "not_available" || apiStatus === "offline"
      ? apiStatus
      : inferredStatus;

  const primaryRestaurant = rawRestaurants?.[0] || box.restaurant_boxes?.[0]?.restaurant;
  const restaurantIds = Array.from(
    new Set([
      ...(rawRestaurants ?? [])
        .map((restaurant) => (typeof restaurant.id === "string" ? restaurant.id : ""))
        .filter((id) => id.length > 0),
      ...(box.restaurant_boxes ?? [])
        .map((restaurantBox) => restaurantBox.restaurant_id)
        .filter((id) => typeof id === "string" && id.length > 0),
    ]),
  );
  const restaurantAddress = primaryRestaurant
    ? primaryRestaurant.full_address ||
      [
        primaryRestaurant.line_one,
        primaryRestaurant.line_two,
        primaryRestaurant.city,
        primaryRestaurant.state,
        primaryRestaurant.pincode,
      ]
        .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
        .join(", ")
    : undefined;
  const restaurantCreatedOn = primaryRestaurant?.created_at
    ? new Date(primaryRestaurant.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    : undefined;

  return {
    id: box.id,
    name: displayName,
    boxId: box.box_id || nestedBox?.box_id || box.id,
    boxDisplayId: box.box_display_id || nestedBox?.box_display_id || undefined,
    boxCode: box.vehicle_number || undefined,
    boxCode2: box.box_display_id || undefined,
    restaurantName: primaryRestaurant?.name,
    restaurantStatus: primaryRestaurant?.status,
    restaurantAddress,
    restaurantCreatedAt: primaryRestaurant?.created_at,
    restaurantCreatedOn,
    restaurantIds,
    restaurantEmployeeIds: Array.from(
      new Set(
        (rawEmployees ?? [])
          .map((employee) => (typeof (employee as { id?: string }).id === "string" ? (employee as { id: string }).id : ""))
          .filter((id) => id.length > 0),
      ),
    ),
    restaurantEmployees: (rawEmployees ?? [])
      .filter((employee): employee is { id: string; employee_id?: string; employee_display_id?: string; first_name?: string; last_name?: string } => typeof employee.id === "string" && employee.id.length > 0)
      .map((employee) => ({
        id: employee.id,
        employeeId: employee.employee_display_id ?? employee.employee_id,
        firstName: employee.first_name,
        lastName: employee.last_name,
      })),
    status,
    globalStatus,
    powerStatus,
    battery: box.battery_percentage ?? undefined,
    handler: handlerName || undefined,
    handlerPhone,
    handlerStatus,
    lastUpdated: box.updated_at,
    consumerFullName,
    consumerCountryCode,
    consumerPhone,
  };
}

export function splitByLockStatus(boxes: GrubLockBox[]): GrubLockGroup[] {
  return [
    {
      name: "Box locked",
      items: boxes.filter((box) => box.status === "locked"),
      emptyMessage: "No active GrubLock box assigned to this restaurant",
    },
    {
      name: "Box unlocked",
      items: boxes.filter((box) => box.status === "unlocked"),
      emptyMessage: "All active GrubLock boxes are assigned :)",
    },
    {
      name: "Lock unavailable",
      items: boxes.filter((box) => box.status === "not_available"),
      emptyMessage: "No boxes without lock found.",
    },
    {
      name: "Box offline",
      items: boxes.filter((box) => box.status === "offline"),
      emptyMessage: "No offline boxes found.",
    },
  ];
}
