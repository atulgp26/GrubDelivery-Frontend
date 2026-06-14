"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/sidebar";
import SetNewPasswordModal from "@/components/features/auth/modals/SetNewPasswordModal";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AUTH_COOKIE_NAME } from "@/lib/constants/auth";
import { showSuccess, showError } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/errors";
import { getAuthToken } from "@/utils/cookies";
import authService from "@/services/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// ✅ small client component inside same file
function SearchParamsHandler({
  setShowPasswordModal,
  setUserName,
  setEmail,
}: {
  setShowPasswordModal: (v: boolean) => void;
  setUserName: (v: string) => void;
  setEmail: (v: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email");
    const showModal = searchParams.get("showPasswordModal");

    if (showModal === "true" && email) {
      setUserName(email.split("@")[0] || "User");
      setEmail(email);
      setShowPasswordModal(true);
    }
  }, [searchParams, setShowPasswordModal, setUserName, setEmail]);

  return null;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("User");
  const [email, setEmail] = useState<string>("");

  const checkAuth = useCallback(() => {
    const hasAuth = document.cookie
      .split("; ")
      .some((row) => row.startsWith(`${AUTH_COOKIE_NAME}=true`));
    if (!hasAuth) {
      router.replace("/auth");
    }
  }, [router]);

  useEffect(() => {
    checkAuth();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) checkAuth();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkAuth();
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [checkAuth]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setCollapsed(!mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setCollapsed(!event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  const handleToggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  const handleCloseSidebar = () => {
    setCollapsed(true);
  };

  const dismissPasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("showPasswordModal")) {
      url.searchParams.delete("showPasswordModal");
      url.searchParams.delete("email");
      router.replace(url.pathname);
    }
  }, [router]);

  const handleSavePassword = async (password: string) => {
    const authToken = getAuthToken();
    if (!email || !authToken) {
      showError("Missing email or auth token. Please log in again.");
      return;
    }

    try {
      await authService.setPassword({
        email,
        password,
        confirm_password: password,
        auth_token: authToken,
      });
      showSuccess("Password set successfully!", "");
      dismissPasswordModal();
    } catch (error) {
      showError(
        getApiErrorMessage(error, "Failed to save password. Please try again."),
      );
    }
  };

  return (
    <>
      {/* ✅ wrap search params with Suspense */}
      <Suspense fallback={null}>
        <SearchParamsHandler
          setShowPasswordModal={setShowPasswordModal}
          setUserName={setUserName}
          setEmail={setEmail}
        />
      </Suspense>

      {showSuccessAlert && (
        <div className="fixed top-3 left-3 right-3 z-50">
          <Alert variant="success" appearance="solid">
            <AlertTitle>Password set successfully!</AlertTitle>
          </Alert>
        </div>
      )}

      <div
        className="min-h-screen h-screen overflow-hidden flex bg-[var(--color-app-bg)]"
        style={{
          "--table-action-bar-left": collapsed ? "1rem" : "calc(240px + 1rem)",
        } as React.CSSProperties}
      >
        <Sidebar collapsed={collapsed} onClose={handleCloseSidebar} />
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-[margin] duration-300 ${collapsed ? "md:ml-0" : "md:ml-60"
            }`}
        >
          <Header collapsed={collapsed} onToggleSidebarAction={handleToggleSidebar} />
          <main className="flex-1 overflow-y-auto px-4 py-8 md:px-4 md:py-10 space-y-10">
            {children}
          </main>
        </div>

        <SetNewPasswordModal
          open={showPasswordModal}
          onClose={dismissPasswordModal}
          onSave={handleSavePassword}
          userName={userName}
        />
      </div>
    </>
  );
}
