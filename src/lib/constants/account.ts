export const ACCOUNT_ROLE_KEYS = {
  admin: "admin",
  manager: "manager",
  delivery: "delivery",
  unknown: "unknown",
} as const;

export type AccountRoleKey =
  (typeof ACCOUNT_ROLE_KEYS)[keyof typeof ACCOUNT_ROLE_KEYS];

const ACCOUNT_ROLE_ALIASES: Readonly<Record<AccountRoleKey, readonly string[]>> = {
  [ACCOUNT_ROLE_KEYS.admin]: ["admin", "super_admin", "super admin", "owner"],
  [ACCOUNT_ROLE_KEYS.manager]: ["manager"],
  [ACCOUNT_ROLE_KEYS.delivery]: ["delivery", "driver"],
  [ACCOUNT_ROLE_KEYS.unknown]: [],
};

export const ACCOUNT_EDITABLE_FIELDS_BY_ROLE: Readonly<
  Record<AccountRoleKey, readonly string[]>
> = {
  [ACCOUNT_ROLE_KEYS.admin]: ["name", "email", "contact", "password", "facility"],
  [ACCOUNT_ROLE_KEYS.manager]: ["password"],
  [ACCOUNT_ROLE_KEYS.delivery]: ["password"],
  [ACCOUNT_ROLE_KEYS.unknown]: ["password"],
};

export function normalizeAccountRoleKey(role?: string): AccountRoleKey {
  const normalized = (role || "").trim().toLowerCase();
  if (!normalized) return ACCOUNT_ROLE_KEYS.unknown;

  if (ACCOUNT_ROLE_ALIASES[ACCOUNT_ROLE_KEYS.admin].includes(normalized)) {
    return ACCOUNT_ROLE_KEYS.admin;
  }

  if (ACCOUNT_ROLE_ALIASES[ACCOUNT_ROLE_KEYS.manager].some((item) => normalized.includes(item))) {
    return ACCOUNT_ROLE_KEYS.manager;
  }

  if (ACCOUNT_ROLE_ALIASES[ACCOUNT_ROLE_KEYS.delivery].some((item) => normalized.includes(item))) {
    return ACCOUNT_ROLE_KEYS.delivery;
  }

  return ACCOUNT_ROLE_KEYS.unknown;
}