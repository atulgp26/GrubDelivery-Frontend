import type { GroupCollapseTableGroup } from "@/types/ui";
import type { ApiGrubPac } from "./grubpacs";

export interface GrubLockBox {
  id: string;
  name: string;
  boxId: string;
  boxDisplayId?: string;
  boxCode?: string;
  boxCode2?: string;
  restaurantName?: string;
  restaurantStatus?: string;
  restaurantAddress?: string;
  restaurantCreatedAt?: string;
  restaurantCreatedOn?: string;
  restaurantIds?: string[];
  restaurantEmployeeIds?: string[];
  restaurantEmployees?: Array<{
    id: string;
    employeeId?: string;
    firstName?: string;
    lastName?: string;
  }>;
  status: "locked" | "unlocked" | "not_available" | "offline";
  globalStatus?: "power_off" | "ready" | "critical" | "attention" | "unknown";
  powerStatus?: "on" | "off" | "unknown";
  battery?: number;
  handler?: string;
  handlerPhone?: string;
  handlerStatus?: "connected" | "disconnected" | "not_shared" | "offline" | "unknown";
  lastUpdated?: string;
  consumerFullName?: string;
  consumerCountryCode?: string;
  consumerPhone?: string;
}

export interface Recipient {
  name?: string;
  countryCode?: string;
  phone?: string;
}

export interface GrubLockListParams {
  limit?: number;
  page?: number;
  status?: "active" | "suspended" | "deleted";
  group_by?: "restaurants" | "lock_status";
  power_status?: "on" | "off" | "unknown";
  connection_status?: "connected" | "disconnected";
  health_status?: "critical" | "healthy" | "atension" | "attention";
  grublock_status?: "locked" | "unlocked" | "not_available";
  restaurant_assigned?: "on" | "off";
  vehicle_assigned?: "on" | "off";
  ioniser_status?: "on" | "off";
  dual_zone_status?: "on" | "off";
  zone1_min?: number;
  zone1_max?: number;
  zone2_min?: number;
  zone2_max?: number;
  group_by_selected_table?: string;
}

export interface GrubLockActionBody {
  ids: string[];
  consumer_full_name?: string;
  consumer_country_code?: string;
  consumer_phone?: string;
  reason?: string;
}

export interface GrubLockActionResult {
  count?: number;
}

export interface GrubLockUnlockOtpResult {
  otp_id: string;
  is_otp: boolean;
}

export interface GrubLockUnlockVerifyBody {
  otp_id: string;
  otp: string;
}

export interface GrubLockSearchParams {
  query: string;
  limit?: number;
  status?: "active" | "suspended" | "deleted";
}

export interface GrubLockSearchItem {
  id: string;
  name: string;
  box_display_id?: string;
  status: "active" | "suspended" | "deleted";
}

export interface GrubLockListData {
  boxes?: ApiGrubPac[];
  groups?: {
    locked?: { array: ApiGrubPac[]; pagination?: any };
    unlocked?: { array: ApiGrubPac[]; pagination?: any };
    locked_count?: number;
    unlocked_count?: number;
    [key: string]: { array: ApiGrubPac[]; pagination?: any } | string | number | undefined;
  };
  count?: number;
}

export interface GrubLockRecipientPayload {
  name: string;
  phone: string;
  countryCode: string;
}

export interface GrubLockUnlockVerifyResult {
  count?: number;
}

export interface GrubLockActionResponse {
  success: boolean;
  code?: number;
  message?: string;
}

export interface ModalPosition {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

export interface EmergencyUnlockPosition {
  top?: boolean;
  right?: boolean;
}

export interface BoxDetailsItem {
  timestamp: string;
  name?: string;
  code?: string;
  id: string;
  location?: string;
  status: string;
}

export type GrubLockGroup = GroupCollapseTableGroup<GrubLockBox>;
