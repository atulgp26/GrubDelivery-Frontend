"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginScreen from "@/components/features/auth/LoginScreen";
import { AUTH_COOKIE_NAME } from "@/lib/constants/auth";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAndRedirect = () => {
      const isAuthenticated = document.cookie
        .split("; ")
        .some((row) => row.startsWith(`${AUTH_COOKIE_NAME}=true`));
      if (isAuthenticated) router.replace("/dashboard");
    };

    checkAndRedirect();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) checkAndRedirect();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  return <LoginScreen />;
}

