import type { GroupCollapseTableGroup } from "../ui";
import type { ApiEmployee } from "./employees";

// export type RestaurantStatus = "Active" | "Suspended" | "active" | "suspended";

export type RestaurantStatus = "active" | "suspended";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  google_place_id?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  manager?: string | null;
  drivers: number;
  boxes: number;
  suspended_boxes?: number;
  updated: string;
  status: RestaurantStatus;
  city?: string;
  state?: string;
  pincode?: string;
  line_one?: string;
  line_two?: string | null;
  // line_two: string | null;
}

export interface RestaurantRequest {
  id?: string;
  name: string;
  state: string;
  city: string;
  pincode: string;
  line_one: string;
  line_two?: string;
  // line_two: string | null;
  latitude?: string;
  longitude?: string;
  status: "active" | "suspended";
  google_place_id?: string;
}


export type RestaurantGroup = GroupCollapseTableGroup<Restaurant>;

export interface RestaurantListParams {
  status?: "active" | "suspended" | "deleted" | "all";
  group_by?: "boxes" | "";
  manager?: boolean;
  driver?: boolean;
  exclude_restaurant_ids?: string[];
  group_by_selected_table?: string;
  limit?: number;
  page?: number;
  query?: string;
}

export interface RestaurantListResponse {
  count: number;
  restaurants?: RestaurantData[];
  groups?: Record<string, { array: RestaurantData[]; count?: number }>;
}

export interface RestaurantData {
  id: string;
  name: string;
  client_id: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
  city: string;
  google_place_id: string | null;
  latitude: number;
  longitude: number;
  line_one: string;
  line_two: string | null;
  pincode: string;
  state: string;
  status: "active" | "suspended" | "deleted";
  manager: ApiEmployee | null; // Detailed manager object if populated
  _count: {
    boxes: number;
    employees: number;
    managers?: number;
    drivers?: number;
    suspended_boxes?: number;
  };
  full_address: string;
}

export interface SuspendRestaurantRequest {
  ids: string[];
  resource_status: "suspend" | "assign";
  destination_restaurant_id: string | null;
}

export interface ReactivateRestaurantRequest {
  ids?: string[];
  all?: boolean;
  reactivate_employees: boolean;
  reactivate_boxes: boolean;
}

export interface DeleteRestaurantRequest {
  ids: string[];
  destination_restaurant_id: string | null;
}

export interface AssignEmployeeRequest {
  id: string; // restaurant id  
  employee_ids: string[];
  // role: string;
  role: "manager" | "delivery";
}

export interface ReassignResourceRequest {
  restaurant_ids: string[];
  destination_restaurant_id: string | null;
}
