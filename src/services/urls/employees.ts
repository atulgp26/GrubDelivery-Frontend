const EMPLOYEE_BASE = "/delivery/employee";

export const EMPLOYEE_URLS = {
  LIST: EMPLOYEE_BASE,
  CREATE: EMPLOYEE_BASE,
  UPDATE: EMPLOYEE_BASE,
  DELETE: EMPLOYEE_BASE,
  DROPDOWNS: `${EMPLOYEE_BASE}/dropdowns`,
  SUSPEND: `${EMPLOYEE_BASE}/suspend`,
  REACTIVATE: `${EMPLOYEE_BASE}/reactivate`,
  REASSIGN: `${EMPLOYEE_BASE}/reassign`,
  SEARCH: `${EMPLOYEE_BASE}/search`,
  SUMMARY: `${EMPLOYEE_BASE}/suspended/summary`,
} as const;
