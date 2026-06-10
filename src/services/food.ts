import type { 
  Restaurant, 
  RestaurantData,
  RestaurantRequest, 
  RestaurantListParams, 
  RestaurantListResponse, 
  SuspendRestaurantRequest, 
  ReactivateRestaurantRequest, 
  DeleteRestaurantRequest,
  AssignEmployeeRequest,
  ReassignResourceRequest 
} from "@/types/domain/restaurants";
import httpClient from "./httpClient";
import { FOOD_URLS } from "./urls/food";

const foodService = {
  async getRestaurants(params: RestaurantListParams) {
    return httpClient.get<RestaurantListResponse>(FOOD_URLS.RESTAURANT, params as any);
  },

  async addRestaurant(data: RestaurantRequest) {
    return httpClient.post(FOOD_URLS.RESTAURANT, data);
  },

  async searchRestaurants(params: { query: string; limit?: number; status?: "active" | "suspended" | "deleted" | "all" }) {
    return httpClient.get<{ restaurants?: RestaurantData[] }>(FOOD_URLS.RESTAURANT_SEARCH, params as unknown as Record<string, unknown>);
  },

async updateRestaurant(data: RestaurantRequest) {
  const payload = {
    ...data,
    line_two: data.line_two?.trim() || undefined,
  };
  return httpClient.put(FOOD_URLS.RESTAURANT, payload);
},
  
  async suspendRestaurants(data: SuspendRestaurantRequest) {
    return httpClient.patch(FOOD_URLS.SUSPEND, data);
  },

  async reactivateRestaurants(data: ReactivateRestaurantRequest) {
    return httpClient.patch(FOOD_URLS.REACTIVATE, data);
  },
  
  async deleteRestaurants(data: DeleteRestaurantRequest) {
    return httpClient.delete(FOOD_URLS.RESTAURANT, data);
  },

  async assignEmployees(data: AssignEmployeeRequest) {
    return httpClient.patch(FOOD_URLS.ASSIGN, data);
  },

  async unassignEmployees(data: { id: string; employee_ids: string[] }) {
    return httpClient.delete(FOOD_URLS.UNASSIGN_EMPLOYEES, data);
  },

  async reassignResource(data: ReassignResourceRequest) {
    return httpClient.patch(FOOD_URLS.REASSIGN_RESOURCE, data);
  },
  
  async getSuspendedSummary() {
    return httpClient.get<{ boxes: number; managers: number; drivers: number; restaurant_count: number }>(FOOD_URLS.SUSPENDED_SUMMARY);
  },
};

export default foodService;
