import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/constants/auth";

const GUEST_ONLY_PATHS = ["/auth"];
const PUBLIC_PATHS = ["/api", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated =
    request.cookies.get(AUTH_COOKIE_NAME)?.value === "true";

  if (pathname === "/") return NextResponse.next();
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  const isGuestOnly = GUEST_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isGuestOnly) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
