import httpClient from "./httpClient";
import { EMPLOYEE_URLS } from "./urls/employees";
import type {
  EmployeeListData,
  EmployeePermissionListData,
  EmployeeDropdownsData,
  EmployeeListParams,
  EmployeeDropdownsParams,
  CreateEmployeeBody,
  UpdateEmployeeBody,
  ReassignEmployeeBody,
  EmployeeSearchParams,
  ApiEmployee,
} from "@/types/domain/employees";

const employeeService = {
  async getList(params?: EmployeeListParams | Record<string, unknown>) {
    return httpClient.get<EmployeeListData>(EMPLOYEE_URLS.LIST, params as Record<string, unknown>);
  },

  async getPermissionList(params: EmployeeListParams) {
    return httpClient.get<EmployeePermissionListData>(EMPLOYEE_URLS.LIST, params as Record<string, unknown>);
  },

  async getDropdowns(params?: EmployeeDropdownsParams) {
    return httpClient.get<EmployeeDropdownsData>(EMPLOYEE_URLS.DROPDOWNS, params as Record<string, unknown>);
  },

  async create(data: CreateEmployeeBody) {
    return httpClient.post(EMPLOYEE_URLS.CREATE, data);
  },

  async update(data: UpdateEmployeeBody) {
    return httpClient.put(EMPLOYEE_URLS.UPDATE, data);
  },

  async suspend(ids: string[]) {
    return httpClient.patch(EMPLOYEE_URLS.SUSPEND, { ids });
  },

  async reactivate(ids: string[], reassignBackToRestaurants: boolean, all?: boolean) {
    return httpClient.patch(EMPLOYEE_URLS.REACTIVATE, {
      ids,
      all,
      reassign_back_to_restaurants: reassignBackToRestaurants,
    });
  },

  async reassign(data: ReassignEmployeeBody) {
    return httpClient.patch(EMPLOYEE_URLS.REASSIGN, data);
  },

  async search(params: EmployeeSearchParams) {
    return httpClient.get<{ employees?: ApiEmployee[] }>(EMPLOYEE_URLS.SEARCH, params as unknown as Record<string, unknown>);
  },

  async delete(ids: string[]) {
    return httpClient.delete(EMPLOYEE_URLS.DELETE, { ids });
  },
  async getSuspendedSummary() {
    return httpClient.get<{ managers: number; drivers: number; total: number }>(EMPLOYEE_URLS.SUMMARY);
  },
};

export default employeeService;
