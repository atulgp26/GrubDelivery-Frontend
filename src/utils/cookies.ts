import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_SESSION_MAX_AGE_SECONDS,
  CLIENT_ID_COOKIE_NAME,
} from "@/lib/constants/auth";

const AUTH_TOKEN_COOKIE_NAME = "grubpac-auth-token";
const AUTH_COOKIES = [AUTH_COOKIE_NAME, AUTH_TOKEN_COOKIE_NAME, CLIENT_ID_COOKIE_NAME];

export function setAuthCookies(
  token: string,
  clientId?: string,
  options?: { rememberMe?: boolean },
): void {
  const maxAge = options?.rememberMe
    ? AUTH_COOKIE_MAX_AGE_SECONDS
    : AUTH_SESSION_MAX_AGE_SECONDS;

  document.cookie = `${AUTH_COOKIE_NAME}=true; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (clientId) {
    document.cookie = `${CLIENT_ID_COOKIE_NAME}=${clientId}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`));
  return match?.split("=")[1] ?? null;
}

export function getClientId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CLIENT_ID_COOKIE_NAME}=`));
  return match?.split("=")[1] ?? null;
}

export function clearAuthCookies(
  cookieName: string | string[] = AUTH_COOKIES,
): void {
  if (typeof document === "undefined") return;
  const cookiesToClear = Array.isArray(cookieName) ? cookieName : [cookieName];
  cookiesToClear.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/`;
  });
}
