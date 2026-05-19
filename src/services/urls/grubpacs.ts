const GRUBPAC_BASE = "/food/grubpac";

export const GRUBPAC_URLS = {
  LIST: GRUBPAC_BASE,
  DROPDOWNS: `${GRUBPAC_BASE}/dropdowns`,
  SEARCH: `${GRUBPAC_BASE}/search`,
  CREATE: GRUBPAC_BASE,
  UPDATE: GRUBPAC_BASE,
  DELETE: GRUBPAC_BASE,
  ACTION: `${GRUBPAC_BASE}/action`,
  REASSIGN: `${GRUBPAC_BASE}/reassign`,
  REMOVE_EMPLOYEE: `${GRUBPAC_BASE}/remove/employee`,
  SUSPEND: `${GRUBPAC_BASE}/suspend`,
  REACTIVATE: `${GRUBPAC_BASE}/reactivate`,
  SUMMARY: `${GRUBPAC_BASE}/suspended/summary`,
} as const;
