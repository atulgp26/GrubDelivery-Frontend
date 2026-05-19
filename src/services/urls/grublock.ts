const GRUBPAC_BASE = "/food/grubpac";
const GRUBLOCK_BASE = "/food/grublock";

export const GRUBLOCK_URLS = {
  LIST: GRUBLOCK_BASE,
  SEARCH: `${GRUBLOCK_BASE}/search`,
  LOCK: `${GRUBLOCK_BASE}/lock`,
  UNLOCK: `${GRUBLOCK_BASE}/unlock`,
  UNLOCK_VERIFY: `${GRUBLOCK_BASE}/unlock/verify`,
  EMERGENCY_UNLOCK: `${GRUBLOCK_BASE}/emergency_unlock`,
} as const;
