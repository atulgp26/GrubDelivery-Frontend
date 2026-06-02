const EMPLOYEE_LOGS_BASE = "/delivery/employee/logs";

export const EMPLOYEE_LOGS_URLS = {
	LIST: EMPLOYEE_LOGS_BASE,
	DROPDOWNS: `${EMPLOYEE_LOGS_BASE}/dropdowns`,
} as const;