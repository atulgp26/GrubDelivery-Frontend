"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import LogoutModal from "./LogoutModal";
import Icon from "../ui/Icon";
import FigIcon from "../ui/FigIcon";
import { clearAuthCookies } from "@/utils/cookies";
import { showSuccess } from "@/components/ui/toast";
import authService from "@/services/auth";
import { useProfileData } from "@/hooks/useProfileData";
import type { ProfileMenuItem } from "@/types";
export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { userData, loading } = useProfileData();
  const router = useRouter();
  const pathname = usePathname();

  const profileInitials = userData?.initials ?? "GU";
  const profileName = loading ? "Loading..." : userData?.name ?? "Guest User";

  const menuItems: ProfileMenuItem[] = [
    {
      label: "Account settings",
      icon: (
        <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-white font-semibold text-xs">
          {profileInitials}
        </div>
      ),
      highlight: true,
    },
    {
      label: "Transfer ownership",
      icon: <FigIcon name="Employee/Multiselect/refresh" size={24} className="w-6 h-6 opacity-70" />,
    },
    {
      label: "Log out",
      icon: <Icon name="logout" className="w-6 h-6" />,
    },
  ];

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  // Close dropdown when navigating to account page
  useEffect(() => {
    if (pathname === "/account") {
      setOpen(false);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuthCookies();
      if (typeof window !== "undefined") {
        localStorage.removeItem("hasShownPasswordModal");
      }
      showSuccess("Logged out successfully!", "");
      setLogoutOpen(false);
      router.replace("/auth");
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full" ref={ref}>
      <button
        className={`flex group items-center gap-3 border rounded-lg px-3 py-3 transition w-[208px] h-[64px] focus:outline-none focus-visible:border-[var(--color-primary-btn-active)] focus-visible:bg-[var(--color-admin-profile-border)] ${open ? "border-[var(--color-stroke-brand)] bg-[var(--sidebar-active-bg)]" : "border-[var(--gp-color-border-neutral)] hover:border-[var(--color-filter-text)] hover:bg-[var(--sidebar-active-bg)] active:border-[var(--color-primary-btn-active)] active:bg-[var(--color-admin-profile-border)] active:shadow-[0_0_0_2px_var(--color-sidebar-shadow)]"}`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {profileInitials}
        </div>
        <span className="font-medium text-sm text-[var(--color-neutral-primary)] truncate flex-1 text-left uppercase">
          {profileName}
        </span>
        <FigIcon
          name={open ? "chevron-up" : "Settings/Side Nav/Nav/chevron-down"}
          size={16}
          className={`w-4 h-4 shrink-0 ${open ? "text-[var(--color-filter-text)]" : "group-hover:text-[var(--color-filter-text)] text-[var(--color-neutral-secondary)]"} transition-colors`}
        />
      </button>
      <div
        className={`absolute bottom-16 left-0 w-[208px] rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] bg-white border border-[var(--gp-color-border-neutral)] overflow-hidden transition-all duration-200 z-50 ${open
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
          }`}
      >
        <Link href="/account" className="block w-full">
          <button className="group flex items-center gap-3 w-full h-14 px-3 py-4 text-sm font-normal justify-start border-b border-[var(--gp-color-border-neutral)] bg-white hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] focus-visible:bg-[var(--color-admin-profile-border)] transition">
            <span className="transition-colors text-[var(--color-neutral-light)] flex-shrink-0">
              {menuItems[0].icon}
            </span>
            <span className="text-sm font-normal text-[var(--color-neutral-primary)] transition-colors flex-1 text-left">
              {menuItems[0].label}
            </span>
          </button>
        </Link>
        <Link href="/transfer-ownership" className="block w-full">
          <button className="group flex items-center gap-3 w-full h-14 px-3 py-4 text-sm font-normal justify-start border-b border-[var(--gp-color-border-neutral)] bg-white hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] focus-visible:bg-[var(--color-admin-profile-border)] transition">
            <span className="transition-colors text-[var(--color-neutral-light)] flex-shrink-0">
              {menuItems[1].icon}
            </span>
            <span className="text-sm font-normal text-[var(--color-neutral-primary)] transition-colors flex-1 text-left">
              {menuItems[1].label}
            </span>
          </button>
        </Link>
        <button
          className="group flex items-center gap-3 w-full h-14 px-3 py-4 text-sm font-normal justify-start bg-white hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] focus-visible:bg-[var(--color-admin-profile-border)] transition"
          onClick={() => setLogoutOpen(true)}
        >
          <span className="transition-colors text-[var(--color-neutral-light)] flex-shrink-0">
            {menuItems[2].icon}
          </span>
          <span className="text-sm font-normal text-[var(--color-neutral-primary)] transition-colors flex-1 text-left">
            {menuItems[2].label}
          </span>
        </button>
      </div>
      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}
