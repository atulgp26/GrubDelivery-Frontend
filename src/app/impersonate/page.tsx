"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthCookies } from "@/utils/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required.");
}

async function exchangeImpersonationCode(code: string) {
  const response = await fetch(`${API_BASE_URL}/delivery/auth/impersonate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    throw new Error(data?.message || data?.error || "Impersonation failed");
  }

  return data?.data;
}

/** Resolve Delivery-portal landing path; strip Admin-style `/delivery` prefix when same-origin. */
function resolveDeliveryLandingPath(redirectUrl: unknown): string {
  if (typeof redirectUrl !== "string" || !redirectUrl.trim()) {
    return "/dashboard";
  }
  try {
    const url = new URL(redirectUrl, window.location.origin);
    if (url.origin !== window.location.origin) {
      return "/dashboard";
    }
    const path = url.pathname.replace(/^\/delivery(?=\/|$)/, "") || "/dashboard";
    return `${path}${url.search}` || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

function ImpersonateHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const code = searchParams.get("code");

    const run = async () => {
      try {
        if (code) {
          const session = await exchangeImpersonationCode(code);
          const token = session?.auth_token;
          if (!token || typeof token !== "string") {
            throw new Error("Missing auth_token in impersonation response");
          }
          setAuthCookies(token, session?.client?.id);
          setStatus("Redirecting...");
          window.location.href = resolveDeliveryLandingPath(session?.redirect_url);
          return;
        }

        setStatus("No impersonation code provided.");
        router.replace("/auth");
      } catch (error) {
        console.error("[Impersonate]", error);
        setStatus("Impersonation failed.");
        router.replace("/auth");
      }
    };

    run();
  }, [router, searchParams]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">{status}</p>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-gray-600">Signing you in...</p>
        </div>
      }
    >
      <ImpersonateHandler />
    </Suspense>
  );
}
