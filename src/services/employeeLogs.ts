import httpClient from "./httpClient";
import { EMPLOYEE_LOGS_URLS } from "./urls/employee-logs";
import type {
	EmployeeLogsDropdownData,
	EmployeeLogsListData,
	EmployeeLogsListRequest,
} from "@/types/domain/employee-logs";

function toNumber(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return undefined;
}

function getValidFilters(payload?: EmployeeLogsListRequest) {
	if (!payload?.filters) return [];

	return payload.filters.filter((item) => {
		return typeof item?.category === "string" && item.category.trim() !== "";
	});
}

function buildLogsPostBody(payload?: EmployeeLogsListRequest): EmployeeLogsListRequest {
	const filters = getValidFilters(payload);
	const searchValue = payload?.search ?? payload?.query;

	return {
		limit: payload?.limit,
		page: payload?.page,
		search: searchValue,
		filters: filters.length > 0 ? filters : undefined,
		start_date: payload?.start_date,
		end_date: payload?.end_date,
		actor_id: payload?.actor_id,
		subject_id: payload?.subject_id,
	};
}

const employeeLogsService = {
	async getList(payload?: EmployeeLogsListRequest) {
		const response = await httpClient.post<{
			logs?: EmployeeLogsListData["logs"];
			count?: number | string;
			total?: number | string;
		}>(EMPLOYEE_LOGS_URLS.LIST, buildLogsPostBody(payload));

		if (!response.success || !response.data) {
			return {
				...response,
				error: response.error ?? response.message ?? "Failed to fetch employee logs",
			};
		}

		const logs = Array.isArray(response.data.logs) ? response.data.logs : [];
		const totalFromPagination = toNumber(response.pagination?.total_count);
		const totalFromData = toNumber(response.data.total);
		const totalFromCount = toNumber(response.data.count);
		const total = totalFromPagination ?? totalFromData ?? totalFromCount ?? logs.length;
		const page = toNumber(response.pagination?.page) ?? payload?.page ?? 1;
		const limit = toNumber(response.pagination?.limit) ?? payload?.limit ?? 20;

		return {
			...response,
			data: {
				logs,
				page,
				limit,
				total,
			} satisfies EmployeeLogsListData,
		};
	},

	async getDropdowns() {
		const response = await httpClient.get<{
			filter_structure?: Record<string, string[]>;
			config?: {
				enabled?: boolean;
				types?: Record<string, boolean>;
			};
		}>(
			EMPLOYEE_LOGS_URLS.DROPDOWNS,
		);

		if (!response.success || !response.data) {
			return {
				...response,
				error:
					response.error ?? response.message ?? "Failed to fetch employee log dropdowns",
			};
		}

		const filterStructure = response.data.filter_structure ?? {};
		const categoryKeys = Object.keys(filterStructure);
		const enabledTypeMap = response.data.config?.types ?? {};
		const allTypes = Array.from(
			new Set(categoryKeys.flatMap((category) => filterStructure[category] ?? [])),
		).filter((type) => enabledTypeMap[type] !== false);

		const mapping = Object.fromEntries(
			categoryKeys.map((category) => [
				category,
				(filterStructure[category] ?? []).filter(
					(type) => enabledTypeMap[type] !== false,
				),
			]),
		) as Record<string, string[]>;

		return {
			...response,
			data: {
				categories: categoryKeys,
				types: allTypes,
				mapping,
			} satisfies EmployeeLogsDropdownData,
		};
	},
};

export default employeeLogsService;