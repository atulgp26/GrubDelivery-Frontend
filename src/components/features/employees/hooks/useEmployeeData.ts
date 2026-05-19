import { useCallback, useEffect, useState } from "react";
import employeeService from "@/services/employees";
import grubpacService from "@/services/grubpacs";
import foodService from "@/services/food";
import { getContextualErrorMessage } from "@/lib/errors";
import { flattenWrappedGroupRecord, getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import type { GroupCollapseTableGroup } from "@/types/ui";
import {
  apiEmployeeToEmployee,
  isBoxesGroupedResponse,
  isRestaurantsGroupedResponse,
  boxesResponseToGroups,
  restaurantsResponseToGroups,
  type EmployeeGroup,
  type Employee,
  type EmployeeListParams,
  type ApiEmployeeListFlatResponse,
  type ApiEmployeeListRestaurantsResponse,
  type ApiEmployee,
  type CreateEmployeeBody,
  type UpdateEmployeeBody,
  type ReassignEmployeeBody,
} from "@/types/domain/employees";
import { groupEmployeesByRestaurant } from "../utils/filterUtils";
import type { EmployeeDropdownsData, ApiEmployeeDropdownsData } from "@/types/domain/employees";
import type { ApiGrubPac, GrubPacListData } from "@/types/domain/grubpacs";
import type { SuspendedEmployee } from "../types";

export interface ActionResult {
  success: boolean;
  error: string | null;
}

interface UseEmployeeDataReturn {
  // Active employees
  groups: EmployeeGroup[];
  isLoading: boolean;
  isPageLoading: boolean;
  refetchActive: () => Promise<void>;

  // Suspended employees
  suspendedEmployees: SuspendedEmployee[];
  suspendedGroups: GroupCollapseTableGroup<SuspendedEmployee>[];
  isSuspendedLoading: boolean;
  suspendedTotalEntries: number;
  refetchSuspended: () => Promise<void>;
  fetchSuspendedSummary: (roles?: Array<"manager" | "delivery">) => Promise<void>;
  refetchSuspendedGroup: (
    group: GroupCollapseTableGroup<SuspendedEmployee>,
    page: number,
  ) => Promise<void>;

  // Dropdowns
  dropdowns: EmployeeDropdownsData | null;
  isLoadingDropdowns: boolean;
  fetchDropdowns: () => Promise<void>;

  // Error state
  actionError: string | null;
  clearError: () => void;

  // Actions
  createEmployee: (data: CreateEmployeeBody) => Promise<ActionResult>;
  updateEmployee: (data: UpdateEmployeeBody) => Promise<ActionResult>;
  suspendEmployees: (ids: string[]) => Promise<ActionResult>;
  reactivateEmployees: (ids: string[], reassignBackToRestaurants: boolean, all?: boolean) => Promise<ActionResult>;
  reassignEmployees: (data: ReassignEmployeeBody) => Promise<ActionResult>;
  deleteEmployees: (ids: string[]) => Promise<ActionResult>;

  // Pagination
  refetchGroup: (group: EmployeeGroup, page: number) => Promise<void>;
  totalEntries: number;

  // Summary
  suspendedSummary: { managers: number; drivers: number; total: number } | null;
  isSummaryLoading: boolean;
}

function apiDateToDisplay(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

interface UseEmployeeDataOptions {
  includeActive?: boolean;
  includeSuspended?: boolean;
  includeDropdowns?: boolean;
  groupBy?: "boxes" | "restaurants" | null;
  roles?: Array<"manager" | "delivery">;
  suspendedRoles?: Array<"manager" | "delivery">;
  suspendedGroupBy?: "restaurants";
  includeManagerBoxCounts?: boolean;
  suspendedPage?: number;
  suspendedLimit?: number;
  activeLimit?: number;
  activePage?: number;
}

function formatRestaurantDate(value?: string): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

const EMPLOYEE_NAME_LENGTH_ERROR_MESSAGE = "First name and last name must be 20 characters or fewer.";

const EMPLOYEE_NAME_LENGTH_PATTERNS = [
  /p2000/i,
  /too\s+long/i,
  /value\s+too\s+long/i,
  /exceeds?\s+(the\s+)?(maximum\s+)?length/i,
  /max(?:imum)?\s+length/i,
  /string\s+or\s+binary\s+data\s+would\s+be\s+truncated/i,
];

function normalizeEmployeeMutationError(message: string | null | undefined, fallback: string): string {
  const normalized = typeof message === "string" ? message.trim() : "";
  if (!normalized) return fallback;

  const isLengthError = EMPLOYEE_NAME_LENGTH_PATTERNS.some((pattern) => pattern.test(normalized));
  if (isLengthError) return EMPLOYEE_NAME_LENGTH_ERROR_MESSAGE;

  return normalized;
}

export function useEmployeeData({
  includeActive = true,
  includeSuspended = true,
  includeDropdowns = true,
  groupBy = "boxes",
  roles,
  suspendedRoles,
  suspendedGroupBy,
  includeManagerBoxCounts = true,
  suspendedPage = 1,
  suspendedLimit = 50,
  activeLimit = 50,
  activePage = 1,
}: UseEmployeeDataOptions = {}): UseEmployeeDataReturn {
  const [groups, setGroups] = useState<EmployeeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isSuspendedLoading, setIsSuspendedLoading] = useState(false);

  const [suspendedEmployees, setSuspendedEmployees] = useState<SuspendedEmployee[]>([]);
  const [suspendedGroups, setSuspendedGroups] = useState<GroupCollapseTableGroup<SuspendedEmployee>[]>([]);
  const [suspendedTotalEntries, setSuspendedTotalEntries] = useState(0);
  const [suspendedSummary, setSuspendedSummary] = useState<{ managers: number; drivers: number; total: number } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const [dropdowns, setDropdowns] = useState<EmployeeDropdownsData | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const mapApiEmployeeToSuspended = useCallback((e: ApiEmployee): SuspendedEmployee => ({
    id: e.id,
    name: e.full_name || `${e.first_name} ${e.last_name}`,
    employeeId: e.employee_id,
    role: e.role === "delivery" ? "Driver" : "Manager",
    restaurantName: e.restaurant?.name,
    added: apiDateToDisplay(e.created_at),
    suspended: apiDateToDisplay(e.updated_at),
  }), []);

  const mapGroupedSuspendedResponse = useCallback((
    data: ApiEmployeeListRestaurantsResponse,
  ): GroupCollapseTableGroup<SuspendedEmployee>[] => {
    const groups: GroupCollapseTableGroup<SuspendedEmployee>[] = [];

    for (const [key, value] of Object.entries(data.groups)) {
      const employees = getWrappedGroupArray<ApiEmployee>(value);
      const wrapped = value as { pagination?: { page?: number; limit?: number; total_count?: number; last_page?: number } };
      groups.push({
        name: key === "unassigned" ? "Unassigned" : key,
        apiGroupKey: key,
        items: employees.map(mapApiEmployeeToSuspended),
        pagination: wrapped.pagination
          ? {
              currentPage: wrapped.pagination.page ?? 1,
              pageSize: wrapped.pagination.limit ?? suspendedLimit,
              totalItems: wrapped.pagination.total_count ?? employees.length,
              totalPages: wrapped.pagination.last_page ?? 1,
            }
          : undefined,
      });
    }

    return groups;
  }, [mapApiEmployeeToSuspended, suspendedLimit]);

  const clearError = useCallback(() => setActionError(null), []);

  // Fallback grouping by role when the API does not return a boxes-shaped response
  function buildRoleGroups(employees: ReturnType<typeof apiEmployeeToEmployee>[]): EmployeeGroup[] {
    const managers = employees.filter((e) => e.role === "Manager");
    const drivers = employees.filter((e) => e.role === "Driver");
    return [
      {
        name: "Box Connected",
        items: drivers,
        emptyMessage: "Ask drivers to connect to a box to see the list here!",
      },
      {
        name: "Box Disconnected",
        items: [],
        emptyMessage: "All drivers are connected to a box at the moment! :)",
      },
      {
        name: "Manager",
        items: managers,
        emptyMessage: "You haven't added any managers yet!",
      },
    ];
  }

  function extractGrubPacs(data: GrubPacListData): ApiGrubPac[] {
    if (typeof data !== "object" || data === null) return [];

    if ("boxes" in data && Array.isArray((data as { boxes?: unknown }).boxes)) {
      return (data as { boxes: ApiGrubPac[] }).boxes;
    }

    if (
      "groups" in data &&
      data.groups &&
      typeof data.groups === "object" &&
      !Array.isArray(data.groups)
    ) {
      return flattenWrappedGroupRecord<ApiGrubPac>(data.groups as Record<string, unknown>);
    }

    return [];
  }


  const fetchActive = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: EmployeeListParams = { 
        status: "active",
        limit: activeLimit, 
        page: activePage 
      };
      if (groupBy) {
        params.group_by = groupBy as any;
      }
      if (roles && roles.length > 0) {
        params.role = roles.length === 1 ? roles[0] : roles;
      }

      const res = await employeeService.getList(params);

      if (res.success && res.data) {
        let parsed: EmployeeGroup[];
        if (isBoxesGroupedResponse(res.data)) {
          parsed = boxesResponseToGroups(res.data);
        } else if (isRestaurantsGroupedResponse(res.data)) {
          if (groupBy === "boxes") {
            // API didn't return boxes shape — extract all employees and group by role
            const allEmps = flattenWrappedGroupRecord<ApiEmployee>(
              (res.data as ApiEmployeeListRestaurantsResponse).groups as Record<string, unknown>,
            )
              .map(apiEmployeeToEmployee);
            parsed = buildRoleGroups(allEmps);
          } else {
            parsed = restaurantsResponseToGroups(res.data);
          }
        } else {
          const flat = res.data as ApiEmployeeListFlatResponse;
          const employees = (flat.employees ?? []).map(apiEmployeeToEmployee);
          if (groupBy === "boxes") {
            // Flat response for boxes groupBy — group by role as fallback
            parsed = buildRoleGroups(employees);
          } else {
            parsed = groupEmployeesByRestaurant(employees) as EmployeeGroup[];
          }
        }
        setGroups(parsed);
        setTotalEntries((res.data as any).total_count ?? (res.data as any).count ?? 0);
      }
    } catch (err) {
      console.error("[useEmployeeData] fetchActive error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [groupBy, includeManagerBoxCounts, roles, activeLimit, activePage]);

  const fetchSuspended = useCallback(async () => {
    setIsSuspendedLoading(true);
    try {
      const params: EmployeeListParams = {
        status: "suspended",
        limit: suspendedLimit,
        page: suspendedPage,
      };

      if (suspendedGroupBy) {
        params.group_by = suspendedGroupBy;
      }

      if (Array.isArray(suspendedRoles) && suspendedRoles.length > 0) {
        params.role = suspendedRoles;
      }

      const res = await employeeService.getList(params);
      if (res.success && res.data) {
        const list = isRestaurantsGroupedResponse(res.data)
          ? flattenWrappedGroupRecord<ApiEmployee>(
              (res.data as ApiEmployeeListRestaurantsResponse).groups as Record<string, unknown>,
            )
          : (res.data as ApiEmployeeListFlatResponse).employees ?? [];
        const mapped: SuspendedEmployee[] = list.map(mapApiEmployeeToSuspended);
        setSuspendedEmployees(mapped);
        if (isRestaurantsGroupedResponse(res.data)) {
          setSuspendedGroups(mapGroupedSuspendedResponse(res.data));
        } else {
          setSuspendedGroups([]);
        }
        setSuspendedTotalEntries(
          ((res.pagination as any)?.total_count as number | undefined)
          ?? (res.data as any).total_count
          ?? (res.data as any).count
          ?? mapped.length,
        );
      }
    } catch (err) {
      console.error("[useEmployeeData] fetchSuspended error:", err);
      setSuspendedEmployees([]);
      setSuspendedGroups([]);
      setSuspendedTotalEntries(0);
    } finally {
      setIsSuspendedLoading(false);
    }
  }, [mapApiEmployeeToSuspended, mapGroupedSuspendedResponse, suspendedGroupBy, suspendedLimit, suspendedPage, suspendedRoles]);

  const fetchSuspendedSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const res = await employeeService.getSuspendedSummary();
      if (res.success && res.data) {
        setSuspendedSummary(res.data);
      }
    } catch (err) {
      console.error("[useEmployeeData] fetchSuspendedSummary error:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const refetchSuspendedGroup = useCallback(async (
    group: GroupCollapseTableGroup<SuspendedEmployee>,
    page: number,
  ) => {
    setIsPageLoading(true);
    try {
      const groupName = typeof group.name === "string" ? group.name : "";
      if (!groupName) return;

      const selectedTable = (group as { apiGroupKey?: string }).apiGroupKey
        ?? (groupName.trim().toLowerCase() === "unassigned" ? "unassigned" : groupName);

      const params: EmployeeListParams = {
        status: "suspended",
        group_by: "restaurants",
        group_by_selected_table: selectedTable,
        page,
        limit: suspendedLimit,
      };

      if (Array.isArray(suspendedRoles) && suspendedRoles.length > 0) {
        params.role = suspendedRoles;
      }

      const res = await employeeService.getList(params);
      if (res.success && res.data && isRestaurantsGroupedResponse(res.data)) {
        const nextGroups = mapGroupedSuspendedResponse(res.data);
        const updatedGroup = nextGroups.find((candidate) =>
          (candidate as { apiGroupKey?: string }).apiGroupKey === selectedTable,
        ) ?? nextGroups[0];

        if (!updatedGroup) return;

        setSuspendedGroups((prev) =>
          prev.map((current) => {
            const currentKey = (current as { apiGroupKey?: string }).apiGroupKey
              ?? (typeof current.name === "string" ? current.name : "");
            return currentKey === selectedTable ? { ...current, ...updatedGroup } : current;
          }),
        );
      }
    } catch (err) {
      console.error("[useEmployeeData] refetchSuspendedGroup error:", err);
    } finally {
      setIsPageLoading(false);
    }
  }, [mapGroupedSuspendedResponse, suspendedLimit, suspendedRoles]);

  const fetchDropdowns = useCallback(async () => {
    setIsLoadingDropdowns(true);
    try {
      const dropdownsRes = await employeeService.getDropdowns();

      if (dropdownsRes.success && dropdownsRes.data) {
        const raw = dropdownsRes.data as unknown as ApiEmployeeDropdownsData;
        setDropdowns({
          roles: raw.roles,
          restaurants: raw.restaurants.map((r) => ({
            id: r.id,
            name: r.name,
            boxes: r._count.boxes,
          })),
        });
      }
    } catch (err) {
      console.error("[useEmployeeData] fetchDropdowns error:", err);
    } finally {
      setIsLoadingDropdowns(false);
    }
  }, []);

  useEffect(() => {
    if (includeActive) void fetchActive();
  }, [fetchActive, includeActive]);

  useEffect(() => {
    if (includeSuspended) {
      void fetchSuspended();
    }
  }, [fetchSuspended, fetchSuspendedSummary, includeSuspended]);

  useEffect(() => {
    if (includeDropdowns) void fetchDropdowns();
  }, [fetchDropdowns, includeDropdowns]);

  const createEmployee = useCallback(async (data: CreateEmployeeBody): Promise<ActionResult> => {
    try {
      const res = await employeeService.create(data);
      if (res.success && includeActive) {
        void fetchActive();
      }
      const error = res.success
        ? null
        : normalizeEmployeeMutationError(
            getContextualErrorMessage(
              "employee.create",
              res,
              "Could not create employee. Please try again.",
            ),
            "Could not create employee. Please try again.",
          );
      if (error) setActionError(error);
      return { success: res.success, error };
    } catch (err) {
      console.error("[useEmployeeData] createEmployee error:", err);
      const error = normalizeEmployeeMutationError(
        getContextualErrorMessage(
          "employee.create",
          err,
          "Could not create employee. Please try again.",
        ),
        "Could not create employee. Please try again.",
      );
      setActionError(error);
      return { success: false, error };
    }
  }, [fetchActive, includeActive]);

  const updateEmployee = useCallback(async (data: UpdateEmployeeBody): Promise<ActionResult> => {
    try {
      const res = await employeeService.update(data);
      if (res.success && includeActive) {
        void fetchActive();
      }
      const error = res.success
        ? null
        : normalizeEmployeeMutationError(
            getContextualErrorMessage(
              "employee.update",
              res,
              "Could not update employee. Please try again.",
            ),
            "Could not update employee. Please try again.",
          );
      if (error) setActionError(error);
      return { success: res.success, error };
    } catch (err) {
      console.error("[useEmployeeData] updateEmployee error:", err);
      const error = normalizeEmployeeMutationError(
        getContextualErrorMessage(
          "employee.update",
          err,
          "Could not update employee. Please try again.",
        ),
        "Could not update employee. Please try again.",
      );
      setActionError(error);
      return { success: false, error };
    }
  }, [fetchActive, includeActive]);

  const suspendEmployees = useCallback(async (ids: string[]): Promise<ActionResult> => {
    try {
      const res = await employeeService.suspend(ids);
      if (res.success) {
        const refetches: Promise<void>[] = [fetchActive()];
        if (includeSuspended) refetches.push(fetchSuspended());
        await Promise.all(refetches);
      }
      const error = res.success
        ? null
        : getContextualErrorMessage(
            "employee.suspend",
            res,
            "Could not suspend employee(s). Please try again.",
          );
      if (error) setActionError(error);
      return { success: res.success, error };
    } catch (err) {
      console.error("[useEmployeeData] suspendEmployees error:", err);
      const error = getContextualErrorMessage(
        "employee.suspend",
        err,
        "Could not suspend employee(s). Please try again.",
      );
      setActionError(error);
      return { success: false, error };
    }
  }, [fetchActive, fetchSuspended, includeSuspended]);

  const reactivateEmployees = useCallback(async (
    ids: string[],
    reassignBackToRestaurants: boolean,
    all?: boolean,
  ): Promise<ActionResult> => {
    try {
      const res = await employeeService.reactivate(ids, reassignBackToRestaurants, all);
      if (res.success) {
        const refetches: Promise<void>[] = [];
        if (includeActive) refetches.push(fetchActive());
        if (includeSuspended) refetches.push(fetchSuspended());
        await Promise.all(refetches);
      }
      const error = res.success
        ? null
        : getContextualErrorMessage(
            "employee.reactivate",
            res,
            "Could not reactivate employee(s). Please try again.",
          );
      if (error) setActionError(error);
      return { success: res.success, error };
    } catch (err) {
      console.error("[useEmployeeData] reactivateEmployees error:", err);
      const error = getContextualErrorMessage(
        "employee.reactivate",
        err,
        "Could not reactivate employee(s). Please try again.",
      );
      setActionError(error);
      return { success: false, error };
    }
  }, [fetchActive, fetchSuspended, includeActive, includeSuspended]);

  const reassignEmployees = useCallback(async (data: ReassignEmployeeBody): Promise<ActionResult> => {
    try {
      const res = await employeeService.reassign(data);
      if (res.success && includeActive) {
        await fetchActive();
      }
      const error = res.success
        ? null
        : getContextualErrorMessage(
            "assignment.employee",
            res,
            "Could not reassign employee(s). Please try again.",
          );
      if (error) setActionError(error);
      return { success: res.success, error };
    } catch (err) {
      console.error("[useEmployeeData] reassignEmployees error:", err);
      const error = getContextualErrorMessage(
        "assignment.employee",
        err,
        "Could not reassign employee(s). Please try again.",
      );
      setActionError(error);
      return { success: false, error };
    }
  }, [fetchActive, includeActive]);

  const deleteEmployees = useCallback(async (ids: string[]): Promise<ActionResult> => {
    try {
      const normalizedIds = Array.from(
        new Set(ids.map((id) => (typeof id === "string" ? id.trim() : "")).filter(Boolean)),
      );

      if (normalizedIds.length === 0) {
        const error = "No valid employees selected for deletion";
        setActionError(error);
        return { success: false, error };
      }

      const res = await employeeService.delete(normalizedIds);
      if (res.success) {
        if (includeActive) {
          void fetchActive();
        }
        if (includeSuspended) {
          void fetchSuspended();
        }
      }
      const error = res.success
        ? null
        : getContextualErrorMessage(
            "employee.delete",
            res,
            "Could not delete employee(s). Please try again.",
          );
      if (error) setActionError(error);
      return { success: res.success, error };
    } catch (err) {
      console.error("[useEmployeeData] deleteEmployees error:", err);
      const error = getContextualErrorMessage(
        "employee.delete",
        err,
        "Could not delete employee(s). Please try again.",
      );
      setActionError(error);
      return { success: false, error };
    }
  }, [fetchActive, fetchSuspended, includeActive, includeSuspended]);

  const refetchGroup = useCallback(async (group: EmployeeGroup, page: number) => {
    setIsPageLoading(true);
    try {
      const groupName = typeof group.name === "string" ? group.name : "";
      if (!groupName) return;

      let selectedTable = groupName;
      if (groupBy === "boxes") {
        if (groupName === "Box Connected") selectedTable = "connected";
        else if (groupName === "Box Disconnected") selectedTable = "disconnected";
        else if (groupName === "Manager") selectedTable = "managers";
      }

      const params: EmployeeListParams = { 
        status: "active",
        group_by: groupBy || undefined, 
        group_by_selected_table: selectedTable,
        page,
        limit: 50
      };
      
      if (roles && roles.length > 0) {
        params.role = roles.length === 1 ? roles[0] : roles;
      }

      const res = await employeeService.getList(params);
      if (res.success && res.data) {
        let newGroups: EmployeeGroup[] = [];
        if (isBoxesGroupedResponse(res.data)) {
          newGroups = boxesResponseToGroups(res.data);
        } else if (isRestaurantsGroupedResponse(res.data)) {
          newGroups = restaurantsResponseToGroups(res.data);
        }

        if (newGroups.length > 0) {
          // Find the matching group in the new results
          const updatedGroup = newGroups.find(ng => ng.name === group.name) || newGroups[0];
          setGroups((prev) => 
            prev.map((g) => (g.name === group.name ? { ...g, ...updatedGroup } : g))
          );
        }
      }
    } catch (err) {
      console.error("[useEmployeeData] refetchGroup error:", err);
    } finally {
      setIsPageLoading(false);
    }
  }, [groupBy, roles]);

  return {
    groups,
    isLoading,
    isPageLoading,
    refetchActive: fetchActive,
    suspendedEmployees,
    suspendedGroups,
    isSuspendedLoading,
    suspendedSummary,
    isSummaryLoading,
    suspendedTotalEntries,
    refetchSuspended: fetchSuspended,
    fetchSuspendedSummary,
    refetchSuspendedGroup,
    dropdowns,
    isLoadingDropdowns,
    fetchDropdowns,
    actionError,
    clearError,
    createEmployee,
    updateEmployee,
    suspendEmployees,
    reactivateEmployees,
    reassignEmployees,
    deleteEmployees,
    refetchGroup,
    totalEntries,
  };
}
