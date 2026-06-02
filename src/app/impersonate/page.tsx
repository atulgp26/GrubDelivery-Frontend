"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthCookies } from "@/utils/cookies";

/**
 * Impersonation entry point.
 *
 * The admin panel generates an impersonation JWT and redirects to:
 *   /impersonate?token=<jwt>
 *
 * This page extracts the token, stores it in the auth cookies, and
 * redirects to the dashboard — logging the admin in as the client.
 */
export default function ImpersonatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // No token — redirect to auth page
      router.replace("/auth");
      return;
    }

    // Store the impersonation token in auth cookies
    setAuthCookies(token);

    // Redirect to dashboard
    router.replace("/dashboard");
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">Signing you in...</p>
    </div>
  );
}
